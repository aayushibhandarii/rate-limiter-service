import { DashboardClient } from "@/types/dashboard";
import { ChartSpline, CheckCheck, Users, UsersRound, X, Zap } from "lucide-react";

export default function SummaryCards({clients}:{clients:DashboardClient[]}){
    const totalClients = clients.length;
    const {allowedRequests,deniedRequests,totalRequests} = clients.reduce(
        (acc,client)=>{
        acc.allowedRequests +=client.allowedRequests
        acc.deniedRequests+=client.deniedRequests
        acc.totalRequests+=client.totalRequests;
        return acc;
    },{
        allowedRequests:0,
        deniedRequests:0,
        totalRequests:0
    })
    const successRate = totalRequests === 0 ? 0 : +(allowedRequests / totalRequests * 100).toFixed(2);
    return(
        <div className="flex justify-evenly">
            <div className="w-ful rounded-xl border p-5 shadow-sm bg-white text-black flex justify-center items-center flex-col">
                <Users fill="purple"/>
                <span>Clients</span>
                <span>{totalClients}</span>
            </div>
            <div className="w-ful rounded-xl border p-5 shadow-sm bg-white text-black flex justify-center items-center flex-col">
                <CheckCheck />
                <span>Allowed</span>
                <span>{allowedRequests}</span>
            </div>
            <div className="w-ful rounded-xl border p-5 shadow-sm bg-white text-black flex justify-center items-center flex-col">
                <X color="red"/>
                <span>Denied</span>
                <span>{deniedRequests}</span>
            </div>
            <div className="w-ful rounded-xl border p-5 shadow-sm bg-white text-black flex justify-center items-center flex-col">
                <ChartSpline />
                <span>Requests</span>
                <span>{totalRequests}</span>
            </div>
            <div className="w-ful rounded-xl border p-5 shadow-sm bg-white text-black flex justify-center items-center flex-col">
                <Zap fill="yellow" color="yellow"/>
                <span>Success Rate</span>
                <span>{successRate}%</span>
            </div>
        </div>
    )
}