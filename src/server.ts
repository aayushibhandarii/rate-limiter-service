import express from "express";
import { getRedisKey, setRateLimitHeaders, type ClientConfig } from "./helper.js";
import redis from "./store/redisClient.js";
const app = express();
app.use(express.json());
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

const clientConfigs = new Map<
    string,
    ClientConfig
>();

app.put("/admin/clients/:key",async(req, res) => {
    const key = getRedisKey(req.params.key);
    await redis.del(key);

    const mode = req.body.mode;

    if (mode !== "tokenBucket" && mode !== "slidingWindow") {
        return res.status(400).send("Invalid mode");
    }
    if (mode === "tokenBucket") {
        const capacity = req.body.capacity;
        const refillRate = req.body.refillRate;
        if (
            typeof capacity !== "number" ||
            typeof refillRate !== "number"
        ) {
            return res.status(400).send("Invalid token bucket configuration");
        }
        clientConfigs.set(key, { capacity: capacity, refillRate: refillRate, mode: mode });
    }else{
        const capacity = req.body.capacity;
        const windowSize = req.body.windowSize;
        if (
            typeof capacity !== "number" ||
            typeof windowSize !== "number"
        ) {
            return res.status(400).send("Invalid sliding window configuration");
        }
        clientConfigs.set(key, { capacity: capacity, windowSize: windowSize, mode: mode });
    }

    return res.status(200).json({ 
        message: "Client configuration updated successfully" , 
        clientConfig: clientConfigs.get(key) 
    });
})

app.post("/check",async (req, res) => {
    const clientKey = req.body.clientKey;
    if (!clientKey) {
        return res.status(400).send("Missing client key");
    }

    const key = getRedisKey(clientKey);
    
    if (!clientConfigs.has(key)) {
        return res.status(400).send("Invalid client key");
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
        return res.status(429).send("Request not allowed");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});