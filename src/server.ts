import express from "express";
import { checkBucket } from "./algorithms/tokenBucket.js";
import redis from "./store/redisClient.js";
const app = express();
app.use(express.json());
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
const clientConfigs = new Map()
app.put("/admin/clients/:key",(req, res) => {
    const key = req.params.key;
    clientConfigs.set(key, { capacity: req.body.capacity, refillRate: req.body.refillRate });
    return res.status(200).send({ message: "Client configuration updated successfully" , clientConfig: clientConfigs.get(key) });
})
app.post("/check",async (req, res) => {
    const key = req.body.clientKey;

    if(!key || !clientConfigs.has(key)){
        res.status(400).send("Invalid client key");
        return;
    }
    const bucket = await redis.hgetall(key);
    const clientConfig = clientConfigs.get(key);
    const response = checkBucket({tokens: Number.parseInt(bucket.tokens ?? "0"), LastRefillTimestamp: Number.parseInt(bucket.LastRefillTimestamp ?? "0"), CurrentTimestamp: Date.now(), capacity: clientConfig.capacity, refillRate: clientConfig.refillRate});
    if(response.allowed){
        await redis.hmset(key,{tokens:response.tokens, LastRefillTimestamp: response.LastRefillTimestamp});
        res.status(200).send({ message: "Request allowed", tokens: bucket.tokens, LastRefillTimestamp: bucket.LastRefillTimestamp });
    }else{
        res.status(429).send("Request not allowed");
    }
});