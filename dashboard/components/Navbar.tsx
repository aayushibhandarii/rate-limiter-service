import { Circle } from "lucide-react";

export default function Navbar(){
    return (
        <div className="w-ful rounded-xl border p-5 shadow-sm bg-white text-black flex justify-evenly items-center text-2xl font-semibold">
            <span>Rate Limiter Dashboard</span>
            <div className="flex gap-3 items-center">
                <Circle color="green" fill="green"/> Live
            </div>
        </div>
    )
}