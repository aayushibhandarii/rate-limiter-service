import express from "express";
import { getRedisKey, setRateLimitHeaders, type ClientConfig } from "./helper.js";
import redis from "./redis/client.js";

const app = express();
app.use(express.json());

const clientConfigs = new Map<
    string,
    ClientConfig
>();

app.put("/admin/clients/:key",async(req, res) => {
    try{
        const key = getRedisKey(req.params.key);
    
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
            clientConfigs.set(key, { capacity, refillRate, mode });
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
            clientConfigs.set(key, { capacity, windowSize, mode });
        }
        await redis.del(key);

        return res.status(200).json({ 
            message: "Client configuration updated successfully" , 
            clientConfig: clientConfigs.get(key) 
        });
    } catch (err){
        console.error(err);
        return res.status(500).json({
            error: "Internal Server Error",
        })
    }
    
})

app.post("/check",async (req, res) => {
    const clientKey = req.body.clientKey;
    if (typeof clientKey !== "string" || clientKey.trim() === "") {
        return res.status(400).json({
            error: "Missing client key"
        });
    }

    const key = getRedisKey(clientKey);
    
    if (!clientConfigs.has(key)) {
        return res.status(400).json({
            error: "Invalid client key"
        });
    }
    const clientConfig = clientConfigs.get(key)!;
    const { mode } = clientConfig;

    try {
        const result = (mode === "tokenBucket")?
            await (redis as any).checkTokenBucket(
                key,
                Date.now(),
                clientConfig.capacity,
                clientConfig.refillRate
            ):
            await (redis as any).checkSlidingWindow(
                key,
                Date.now(),
                clientConfig.windowSize,
                clientConfig.capacity
            );
        setRateLimitHeaders(res, clientConfig.capacity, result[0]===1? result[1] : 0 , result[2], result[3]);
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

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${3000}`);
});