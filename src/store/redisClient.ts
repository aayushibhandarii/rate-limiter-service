import { Redis } from "ioredis";
const redis = new Redis();
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tokenBucketScript = fs.readFileSync(path.join(__dirname, "/tokenBucket.lua"), "utf8");
redis.defineCommand("checkTokenBucket",{
    numberOfKeys: 1,
    lua: tokenBucketScript
})

const slidingWindowScript = fs.readFileSync(path.join(__dirname, "/slidingWindow.lua"), "utf8");
redis.defineCommand("checkSlidingWindow",{
    numberOfKeys: 1,
    lua: slidingWindowScript
})

export default redis;