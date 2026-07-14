import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { Response } from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getConfigKey = (clientKey: string) =>
    `config:${clientKey}`;

export const getBucketKey = (clientKey: string) =>
    `bucket:${clientKey}`;

export const getWindowKey = (clientKey: string) =>
    `window:${clientKey}`;

export const getMetricsKey = (clientKey: string) =>
    `metrics:${clientKey}`;

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

export function setRateLimitHeaders(
    res: Response,
    limit:number,
    remaining:number,
    resetTime:number,
    mode:string
){
    res.set({
        "RateLimit-Limit": limit.toString(),
        "RateLimit-Remaining": remaining.toString(),
        "RateLimit-Reset": resetTime.toString(),
        "RateLimit-Mode": mode,
    });
}

export function loadLuaScript(filename: string): string {
    return fs.readFileSync(
        path.join(__dirname, "lua", filename),
        "utf8"
    );
}