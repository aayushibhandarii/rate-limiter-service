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
    redis.call(
        "ZADD",
        KEYS[1], 
        currentTimestamp,
        member
    )
end

redis.call("PEXPIRE", KEYS[1], windowSize)

local oldestRequest = redis.call("ZRANGE", KEYS[1], 0, 0, "WITHSCORES")
local resetTime = currentTimestamp

if count >= capacity and oldestRequest[2] then
    resetTime = tonumber(oldestRequest[2]) + windowSize
end

if allowed == 1 then
    redis.call(
        "HINCRBY",
        ARGV[4],
        "allowedRequests",
        1
    )
else
    redis.call(
        "HINCRBY",
        ARGV[4],
        "deniedRequests",
        1
    )
end
redis.call(
    "HINCRBY",
    ARGV[4],
    "totalRequests",
    1
)
redis.call(
    "HSET",
    ARGV[4],
    "lastRequestAt",
    currentTimestamp
)
return {
    allowed, 
    math.max(0, capacity - count), 
    resetTime, 
    "slidingWindow"
}