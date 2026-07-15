import express from "express";
import { getBucketKey, getConfigKey, getMetricsKey, getWindowKey, setRateLimitHeaders } from "./helper.js";
import redis from "./redis/client.js";
import cors from "cors";
const app = express();
app.use(
    cors({
        origin: "http://localhost:3001",
        credentials:true
    })
);
app.use(express.json());

app.put("/admin/clients/:key",async(req, res) => {
    try{
        const key = req.params.key;
    
        const mode = req.body.mode;

        if (mode !== "tokenBucket" && mode !== "slidingWindow") {
            return res.status(400).json({
                error: "Invalid mode"
            });
        }
        if (mode === "tokenBucket") {
            const capacity = req.body.capacity;
            const refillRate = req.body.refillRate;
            if (
                typeof capacity !== "number" ||
                capacity <= 0 ||
                typeof refillRate !== "number" ||
                refillRate < 0
            ) {
                return res.status(400).json({
                    error:"Invalid token bucket configuration"
                });
            }
            await redis.hset(getConfigKey(key), {
                mode,
                capacity, 
                refillRate,
                createdAt: Date.now()
            });
            await redis.sadd("clients", key);
        }else{
            const capacity = req.body.capacity;
            const windowSize = req.body.windowSize;
            if (
                typeof capacity !== "number" ||
                capacity <= 0 ||
                typeof windowSize !== "number" || 
                windowSize <= 0
            ) {
                return res.status(400).json({
                    error: "Invalid sliding window configuration"
                });
            }
            await redis.hset(getConfigKey(key), { 
                capacity, 
                windowSize, 
                mode,
                createdAt: Date.now()
            });
            await redis.sadd("clients", key);
        }
        await redis.del(getBucketKey(key));
        await redis.del(getWindowKey(key));
        await redis.del(getMetricsKey(key));

        return res.status(200).json({ 
            message: "Client configuration updated successfully" , 
            clientConfig: await redis.hgetall(getConfigKey(key)) 
        });
    } catch (err){
        console.error(err);
        return res.status(500).json({
            error: "Internal Server Error",
        })
    }
    
})

app.get("/clients",async(req,res) =>{
    const ids = await redis.smembers("clients");

    const clients = await Promise.all(
        ids.map(async id => ({
            clientKey: id,
            ...(await redis.hgetall(getConfigKey(id)))
        }))
    )
    return res.status(200).json({
        message: "Successfully retrived all the clients",
        clients
    })
})
app.get("/metrics", async(req,res)=>{
    const ids = await redis.smembers("clients");
    const metrics = await Promise.all(
        ids.map(async id =>({
            clientKey: id,
            ...(await redis.hgetall(getMetricsKey(id)))
        }))
    )
    return res.status(200).json({
        message: "Successfully retrived metrics for all the clients",
        metrics
    })
})
app.get("/metrics/:key",async(req,res)=>{
    const key = req.params.key;
    const result = await redis.hgetall(getMetricsKey(key));
    if (Object.keys(result).length === 0) {
        return res.json({
            allowedRequests: 0,
            deniedRequests: 0,
            totalRequests: 0
        });
    }
    return res.status(200).json({
        message: "Successfully retrived metrics for the client",
        metric: result
    })
})

app.get("/status/:key",async(req,res)=>{
    const key = req.params.key;
    const config = await redis.hgetall(getConfigKey(key));
    if (Object.keys(config).length === 0) {
        return res.status(404).json({
            error: "Client not found"
        });
    }
    if(config.mode === "tokenBucket"){
        const bucket = await redis.hgetall(getBucketKey(key));
        if (Object.keys(bucket).length === 0) {
            return res.json({
                mode: "tokenBucket",
                tokens: Number(config.capacity),
                LastRefillTimestamp: null,
                state: "idle"
            });
        }
        return res.json({
            mode: "tokenBucket",
            tokens: Number(bucket.tokens),
            LastRefillTimestamp: Number(bucket.LastRefillTimestamp),
            state: "active"
        });
    }
    const currentRequests = await redis.zcard(getWindowKey(key));
    return res.json({
        mode: "slidingWindow",
        currentRequests: await redis.zcard(getWindowKey(key)),
        capacity: Number(config.capacity),
        windowSize: Number(config.windowSize)
    });
})

app.post("/check",async (req, res) => {
    const clientKey = req.body.clientKey;
    if (typeof clientKey !== "string" || clientKey.trim() === "") {
        return res.status(400).json({
            error: "Missing client key"
        });
    }

    const config = await redis.hgetall(getConfigKey(clientKey));
    if (Object.keys(config).length === 0) {
        return res.status(404).json({
            error: "Invalid client key"
        });
    }
    const { mode } = config;

    try {
        const result = (mode === "tokenBucket")?
            await (redis as any).checkTokenBucket(
                getBucketKey(clientKey),
                Date.now(),
                Number(config.capacity),
                Number(config.refillRate),
                getMetricsKey(clientKey)
            ):
            await (redis as any).checkSlidingWindow(
                getWindowKey(clientKey),
                Date.now(),
                Number(config.windowSize),
                Number(config.capacity),
                getMetricsKey(clientKey)
            );
            
        setRateLimitHeaders(res, Number(config.capacity), result[0]===1? result[1] : 0 , result[2], result[3]);
        if (result[0] === 1) {
            return res.status(200).json({
                message: "Request allowed"
            });
        }
        return res.status(429).json({
            error: "Request not allowed"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

app.get("/dashboard",async (req,res)=>{
    try{
        const ids = await redis.smembers("clients");

        const dashboard = await Promise.all(
            ids.map( async (id)=>{
                const config = await redis.hgetall(getConfigKey(id));
                const metrics = await redis.hgetall(getMetricsKey(id));
                let status: Record<string, any> = {};

                if(config.mode === "tokenBucket"){
                    const bucket = await redis.hgetall(getBucketKey(id));

                    status = {
                        remainingTokens: Number(bucket.tokens ?? config.capacity),
                        LastRefillTimestamp: Number(
                            bucket.LastRefillTimestamp ?? 0
                        )
                    }
                }else{
                    status = {
                        currentRequests : await redis.zcard(getWindowKey(id))
                    }
                }
                const allowed = Number(metrics.allowedRequests ?? 0);
                const denied = Number(metrics.deniedRequests ?? 0);
                const total = Number(metrics.totalRequests ?? 0);

                const successRate =
                    total === 0 ? 0 : +(allowed / total * 100).toFixed(2);
                return {
                    clientKey: id,

                    mode: config.mode,

                    capacity: Number(config.capacity),

                    refillRate: config.refillRate
                        ? Number(config.refillRate)
                        : undefined,

                    windowSize: config.windowSize
                        ? Number(config.windowSize)
                        : undefined,

                    allowedRequests: allowed,

                    deniedRequests: denied,

                    totalRequests: total,
                    successRate,
                    ...status
                };
            })
        )
        return res.status(200).json({
            message: "Dashboard data fetched successfully",
            clients: dashboard
        });
    }catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
})
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});