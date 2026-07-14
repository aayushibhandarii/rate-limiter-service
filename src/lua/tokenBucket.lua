local currentTimestamp = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local refillRate = tonumber(ARGV[3])
local bucket = redis.call("HMGET", KEYS[1],"tokens","LastRefillTimestamp")

local tokens = tonumber(bucket[1])
if tokens == nil then
    tokens = capacity
end

local lastRefillTimestamp = tonumber(bucket[2])
if lastRefillTimestamp == nil then
    lastRefillTimestamp = currentTimestamp
end

local elapsedTime = currentTimestamp - lastRefillTimestamp
local newTokens = math.floor(elapsedTime/1000 * refillRate)
local currentTokens = math.min(tokens + newTokens, capacity)

local allowed = 0
if currentTokens>0 then
    currentTokens = currentTokens - 1
    allowed = 1
end
if newTokens > 0 then
    lastRefillTimestamp =
        lastRefillTimestamp +
        math.floor(elapsedTime / 1000) * 1000
end

redis.call(
    "HSET", 
    KEYS[1], 
    "tokens", 
    currentTokens,
    "LastRefillTimestamp", 
    lastRefillTimestamp
)

local resetTime = 0
if refillRate > 0 then
    resetTime = lastRefillTimestamp + math.ceil((capacity-currentTokens)/refillRate)*1000
end

if allowed == 1 then
    redis.call("HINCRBY",ARGV[4],"allowedRequests",1)
else
    redis.call("HINCRBY",ARGV[4],"deniedRequests",1)
end
redis.call("HINCRBY",ARGV[4],"totalRequests",1)
return {
    allowed,
    currentTokens,
    resetTime,
    "tokenBucket"
}