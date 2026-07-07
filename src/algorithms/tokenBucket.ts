type props={
    capacity:number,
    refillRate:number,
    CurrentTimestamp:number,
    LastRefillTimestamp:number,
    tokens:number
}
export function checkBucket({tokens,capacity,refillRate,CurrentTimestamp,LastRefillTimestamp}:props){
    const newTokens = Math.floor((CurrentTimestamp-LastRefillTimestamp)/1000*refillRate);
    const currentTokens = Math.min(capacity,tokens+newTokens);
    LastRefillTimestamp = CurrentTimestamp;
    if(currentTokens>0){
        return {allowed : true, tokens:currentTokens-1, LastRefillTimestamp};
    }else{
        return {allowed : false, tokens:currentTokens, LastRefillTimestamp};
    }
}
