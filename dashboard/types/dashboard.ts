export interface DashboardClient {
    clientKey: string;

    mode: "tokenBucket" | "slidingWindow";

    capacity: number;

    refillRate?: number;

    windowSize?: number;

    allowedRequests: number;

    deniedRequests: number;

    totalRequests: number;

    remainingTokens?: number;

    LastRefillTimestamp?: number;

    currentRequests?: number;
}

export interface DashboardResponse {
    message: string;
    clients: DashboardClient[];
}