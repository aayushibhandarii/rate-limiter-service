type props={
    capacity:number,
    refillRate:number,
    CurrentTimestamp:number,
    LastRefillTimestamp:number,
    tokens:number
}
function checkBucket({tokens,capacity,refillRate,CurrentTimestamp,LastRefillTimestamp}:props){
    const newTokens = (CurrentTimestamp-LastRefillTimestamp)*refillRate;
    const currentTokens = Math.min(capacity,tokens+newTokens);
    LastRefillTimestamp = CurrentTimestamp;

    if(currentTokens>0){
        return {allowed : true, tokens:currentTokens-1, LastRefillTimestamp};
    }else{
        return {allowed : false, tokens:Math.max(0,currentTokens), LastRefillTimestamp};
    }
}

export = checkBucket;