export function getRedisKey(id: string) {
    return `rate_limit_service:client:${id}`;
}

export type ClientConfig =
    | {
          mode: "tokenBucket";
          capacity: number;
          refillRate: number;
      }
    | {
          mode: "slidingWindow";
          capacity: number;
          windowSize: number;
      };

export function setRateLimitHeaders(res:any ,limit:number,remaining:number,resetTime:number,mode:string){
    res.setHeader("RateLimit-Limit",limit);
    res.setHeader("RateLimit-Remaining",remaining);
    res.setHeader("RateLimit-Reset",resetTime);
    res.setHeader("RateLimit-Mode",mode)
}