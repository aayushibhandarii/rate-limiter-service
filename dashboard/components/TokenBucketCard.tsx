import { DashboardClient } from "@/types/dashboard";
import ProgressBar from "./ProgressBar";
import { Circle } from "lucide-react";

export default function TokenBucketCard({client}:{client : DashboardClient}){
    return(
        <div className="rounded-xl border p-5 shadow-sm bg-slate-100 text-black flex justify-center items-center flex-col w-full hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="flex justify-between w-full border-2 p-4">
                <span>{(client.clientKey).toUpperCase()}</span>
                <div className="flex gap-3 items-center">
                    <Circle fill="green" color="green" />
                    <span>Token Bucket</span>
                </div>
            </div>
             <div className="gap-4 flex flex-col items-center w-full border-2 p-4 m-2">
                <div className="w-full justify-between flex">
                    <span>💾 Capacity</span>
                    <span>{client.capacity}</span>
                </div>
                <div className="w-full justify-between flex items-center">
                    <span>🪙 Remaining Tokens</span>
                    <div className="flex gap-3 items-center w-20">
                        <ProgressBar percentage={Number(client.remainingTokens)/Number(client.capacity)*100}/>
                        <span>
                            {client.remainingTokens}
                        </span>
                    </div>
                    
                </div>
                <div className="w-full justify-between flex">
                    <span>Refill Rate</span>
                    <span>{client.refillRate}</span>
                </div>
            </div>
            <div className="gap-4 flex flex-col items-center w-full border-2 p-4 ">
                <div className="w-full justify-between flex">
                    <span>✅ Allowed</span>
                    <span>{client.allowedRequests}</span>
                </div>
                <div className="w-full justify-between flex">
                    <span>❌ Denied</span>
                    <span>{client.deniedRequests}</span>
                </div>
                <div className="w-full justify-between flex">
                    <span>📊 Total</span>
                    <span>{client.totalRequests}</span>
                </div>
            </div>
        </div>
    )
}