import { useCallback, useEffect, useState } from "react";

interface MusicDurationProps {
    wPerc: number;
    duration: number;
    player: YT.Player | null;
    setCurrentTime: (time: number) => void;
    musicIndex: number;
}

const MusicDuration = ({ wPerc, duration, player, setCurrentTime, musicIndex }: MusicDurationProps) => {
    const [fast, setFast] = useState<boolean>(true);
    const [allowTransition, setAllowTransition] = useState<boolean>(true);
    const [syncHover, setSyncHover] = useState<boolean>(true);
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
        }, 50)
    }
    const reset = useCallback(() => {
        if (!player || typeof player?.getPlayerState !== "function") return;
        if (player?.getPlayerState() === YT.PlayerState.ENDED) {
            setFast(true);
            setCurrentTime(0);
        } else if (player?.getPlayerState() === YT.PlayerState.PLAYING) {
            setFast(false);
        }
    }, [player, setCurrentTime])

    useEffect(() => {
        reset();
    }, [reset, musicIndex])
    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.hidden) {
                setAllowTransition(false);
                setFast(true);
            } else {
                requestAnimationFrame(() => {
                    setAllowTransition(true);
                    setFast(false);
                })
            }
        }
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
        }
    }, [])

    return (
        <div onClick={(e) => handleClick(e)} onMouseEnter={() => setSyncHover(true)} onMouseLeave={() => setSyncHover(false)} className="w-120 h-1 cursor-pointer relative">
            <div className={`max-w-full bg-gray-300 rounded-full ${syncHover ?"scale-y-120 duration-400 ease-in-out":""}`}>
                <div id="progress" className={`max-w-full h-2 bg-green-500 rounded-full ${allowTransition && !fast && "transition-[width] duration-500 ease-linear"}`}
                    style={{ width: `${Math.min(100, Math.max(0, wPerc))}%` }} />
            </div>
            <div className={`absolute -top-1.5 w-5 h-5 rounded-full left-0 ml-2 bg-green-500 ${allowTransition ? (fast ? "transition-[width] duration-500 ease-linear" : ` ${syncHover ? "scale-130 duration-300 ease-in-out" : ""}`) : ""}`}
            style={{ left: `calc(${Math.min(100, Math.max(0, wPerc))}% - 1rem)` }} />
        </div>
    )
}

export default MusicDuration
