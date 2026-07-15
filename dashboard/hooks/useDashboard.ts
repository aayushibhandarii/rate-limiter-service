import { api } from "@/lib/api";
import { DashboardClient } from "@/types/dashboard";

export async function getClients(): Promise<DashboardClient[] | null>{
    try{
        const response = await api.get("/dashboard");
        return response.data.clients;
    }catch(err){
        console.error(err);
        return null;
    }
}