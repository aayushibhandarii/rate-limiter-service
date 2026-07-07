import express from "express";
import fs from "fs";
import redis from "./store/redisClient.js";
const app = express();
app.use(express.json());
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

const clientConfigs = new Map<
    string,
    {
        capacity: number;
        refillRate: number;
    }
>();

app.put("/admin/clients/:key",async(req, res) => {
    const bucketKey = `bucket:${req.params.key}`;
    await redis.del(bucketKey);

    const capacity = req.body.capacity;
    const refillRate = req.body.refillRate;
    if (
        typeof capacity !== "number" ||
        typeof refillRate !== "number"
    ) {
        return res.status(400).send("Invalid configuration");
    }

    clientConfigs.set(bucketKey, { capacity: capacity, refillRate: refillRate });

    return res.status(200).json({ 
        message: "Client configuration updated successfully" , 
        clientConfig: clientConfigs.get(bucketKey) 
    });
})

const tokenBucketScript = fs.readFileSync("./src/store/tokenBucket.lua", "utf8");
redis.defineCommand("checkBucket",{
    numberOfKeys: 1,
    lua: tokenBucketScript
})

app.post("/check",async (req, res) => {
    const clientKey = req.body.clientKey;
    if (!clientKey) {
        return res.status(400).send("Missing client key");
    }

    const bucketKey = `bucket:${clientKey}`;
    if(!clientConfigs.has(bucketKey)){
        return res.status(400).send("Invalid client key");
    }

    const clientConfig = clientConfigs.get(bucketKey)!;

    try {
        const result = await (redis as any).checkBucket(
            bucketKey,
            Date.now(),
            clientConfig.capacity,
            clientConfig.refillRate
        );

        if (result[0] === 1) {
            return res.status(200).json({
                message: "Request allowed",
                tokens: result[1],
                lastRefillTimestamp: result[2]
            });
        }

        return res.status(429).send("Request not allowed");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});