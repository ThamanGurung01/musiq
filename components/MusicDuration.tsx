import { useCallback, useEffect, useState } from "react";

interface MusicDurationProps {
  wPerc: number;
  duration: number;
  player: YT.Player | null;
  setCurrentTime: (time: number) => void;
  musicIndex: number;
}

const MusicDuration = ({ wPerc, duration, player, setCurrentTime, musicIndex }: MusicDurationProps) => {
    const [fast, setFast] = useState<boolean>(false);
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!player || duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = (clickX / rect.width) * 100;
        const newTime = (percentage / 100) * duration;
        player.seekTo(newTime, true);
        setCurrentTime(newTime);
        setFast(true);
        if (player.getPlayerState() === YT.PlayerState.PAUSED) return;
        wPerc = percentage;
        player.seekTo((percentage / 100) * duration, true);
        setTimeout(() => {
            setFast(false);
        }, 100)
    }
    const reset=useCallback(()=>{
    if(!player || typeof player?.getPlayerState !== "function") return;
    if(player?.getPlayerState()===YT.PlayerState.ENDED){
        setFast(true);
        setCurrentTime(0);
    }else if(player?.getPlayerState()===YT.PlayerState.PLAYING){
        setFast(false);
    }
},[player,setCurrentTime])

    useEffect(()=>{
        reset();
    },[reset,musicIndex])


    return (
        <div onClick={(e) => handleClick(e)} className="w-120 bg-gray-300 h-3 hover:scale-y-105 rounded-full cursor-pointer relative">
            <div id="progress" className={`max-w-full h-3 bg-green-500 rounded-full hover:scale-y-105 ${!fast && "transition-[width] duration-500 ease-linear"}`}
                style={{ width: `${Math.min(100, Math.max(0, wPerc))}%` }}
            ></div><div className={`absolute -top-1 w-6 h-6 rounded-full -left-5 bg-red-500 hover:scale-105 hover:duration-200 ${fast ? "transition-[width] duration-500 ease-linear" : "transition-all duration-200 ease"}`}
                style={{ left: `calc(${Math.min(100, Math.max(0, wPerc))}% - 1rem)`}}
            ></div>
        </div>
    )
}

export default MusicDuration
