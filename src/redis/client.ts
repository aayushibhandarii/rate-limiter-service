import { Redis } from "ioredis";
import { loadLuaScript } from "../helper.js";

const redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: 6379,
});
redis.on("connect", () => {
    console.log("✅ Connected to Redis");
});
redis.on("error", (err) => {
    console.error("Redis Error:", err);
});

try {
    redis.defineCommand("checkTokenBucket",{
        numberOfKeys: 1,
        lua: loadLuaScript("tokenBucket.lua"),
    });

    redis.defineCommand("checkSlidingWindow",{
        numberOfKeys: 1,
        lua: loadLuaScript("slidingWindow.lua"),
    });
} catch(err) {
    console.error("Error loading Lua scripts:", err);
    process.exit(1);
}

export default redis;