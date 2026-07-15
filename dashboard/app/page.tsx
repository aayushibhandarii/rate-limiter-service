"use client";
import ClientCard from "@/components/ClientCard";
import Navbar from "@/components/Navbar";
import useSwr from "swr";
import SummaryCards from "@/components/SummaryCards";
import { DashboardClient } from "@/types/dashboard";
import { getClients } from "@/hooks/useDashboard";


export default function Home() {
  const {data: clients = [],isLoading} = useSwr("/dashboard",getClients,{refreshInterval:5000});
  console.log(clients);
  if(isLoading)return (<div>Loading...</div>);
  if(!clients)return null;
  return (
    <div className="w-full p-3">
      <Navbar />
      <br/>
      <SummaryCards clients={clients} />
      <br />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {
          clients.map((client:DashboardClient) => (
              <ClientCard
              client={client}
              key={client.clientKey} 
              />
          ))
        }
      </div>
      
    </div>
  );
}
