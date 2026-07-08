local currentTimestamp = tonumber(ARGV[1])
local windowSize = tonumber(ARGV[2])*1000
local capacity = tonumber(ARGV[3])

redis.call("ZREMRANGEBYSCORE", KEYS[1], 0 , currentTimestamp - windowSize)

local count = redis.call("ZCARD", KEYS[1])

local member = tostring(currentTimestamp) .. "-" .. tostring(math.random())

local allowed = 0
if count < capacity then
    allowed = 1
    count = count + 1
    redis.call("ZADD",KEYS[1], currentTimestamp,member)
end

local oldest = redis.call("ZRANGE", KEYS[1], 0, 0, "WITHSCORES")
local resetTime = currentTimestamp
if count >= capacity and oldest[2] then
    resetTime = tonumber(oldest[2]) + windowSize
end
return {allowed, math.max(0,capacity - count), resetTime, "Sliding Window"}