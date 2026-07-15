import { DashboardClient } from "@/types/dashboard"
import TokenBucketCard from "./TokenBucketCard"
import SlidingWindowCard from "./SlidingWindowCard"

export default function ClientCard({client}:{client:DashboardClient}){
    if(client?.mode === "tokenBucket"){
        return <TokenBucketCard client={client}/>
    }
    return <SlidingWindowCard client={client}/>
}