import { useCallback, useEffect, useState } from "react";

type YTWindow=Window & {
      onYouTubeIframeAPIReady?: ()=>void;
      YT?:typeof YT;
}
export const useYoutubePlayer=()=>{
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [loading,setLoading]=useState(true);
  const [duration,setDuration]=useState<number>(0);
  const createScript=useCallback(()=>{
    const tag=document.createElement('script');
    tag.src="https://www.youtube.com/iframe_api";
    const firstScriptTag=document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag,firstScriptTag);
  },[])
  const onYouTubeIframeAPIReady=useCallback(()=>{
    if (player) return;
    setLoading(true);
    const newPlayer=new YT.Player('player',{
      height:'1',
      width:'1',
      events: {
        onReady:()=>{
          setLoading(false)
        },
        onStateChange:(event)=>{
          if(event.data===YT.PlayerState.PLAYING){
            setDuration(newPlayer.getDuration());
          }
  }}
  })
    setPlayer(newPlayer);
  },[player])

  useEffect(()=>{
    createScript();
    (window as YTWindow).onYouTubeIframeAPIReady=onYouTubeIframeAPIReady;
    return ()=>{
      if((window as YTWindow).onYouTubeIframeAPIReady===onYouTubeIframeAPIReady){
        delete (window as YTWindow).onYouTubeIframeAPIReady;
    }}
  },[createScript,onYouTubeIframeAPIReady])
  
  return {player,loading,duration};
}