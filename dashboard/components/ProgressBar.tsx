export default function ProgressBar({percentage}:{percentage:number}){
    const color = percentage<=20 ? "red" :
    percentage<=60 ? "yellow" :"green";
    return (
        <div className="w-full bg-gray-400 rounded-full h-3">
            <div 
                className={`bg-${color}-500 h-3 rounded-full`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    )
}