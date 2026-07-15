import { DashboardClient } from "@/types/dashboard";
import ProgressBar from "./ProgressBar";

export default function SlidingWindowCard({client}:{client : DashboardClient}){
    return(
        <div className="rounded-xl border p-5 shadow-sm flex justify-center items-center flex-col w-full bg-green-100
text-green-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div className="flex justify-between items-center w-full border-2 p-4">
                <span>{(client.clientKey).toUpperCase()}</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700"> Sliding Window </span>
            </div>
             <div className="gap-4 flex flex-col items-center w-full border-2 p-4 m-2">
                <div className="w-full flex justify-between">
                    <span>💾 Capacity</span>
                    <span>{client.capacity}</span>
                </div>
                <div className="justify-between flex items-center w-full">
                    <span>Current Requests</span>
                    <div className="flex gap-3 items-center w-20">
                        <ProgressBar percentage={Number(client.currentRequests)/Number(client.capacity)*100}/>
                        <span>{client.currentRequests}</span>
                    </div>
                    
                </div>
                <div className="w-full flex justify-between">
                    <span>Window Size</span>
                    <span>{client.windowSize}</span>
                </div>
            </div>
            <div className="gap-4 flex flex-col items-center w-full border-2 p-4 ">
                <div className="w-full flex justify-between">
                    <span>✅ Allowed</span>
                    <span>{client.allowedRequests}</span>
                </div>
                <div className="w-full flex justify-between">
                    <span>❌ Denied</span>
                    <span>{client.deniedRequests}</span>
                </div>
                <div className="w-full flex justify-between">
                    <span>📊 Total</span>
                    <span>{client.totalRequests}</span>
                </div>
            </div>
        </div>
    )
}