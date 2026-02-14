import { useCallback, useEffect, useState } from "react";

type YTWindow=Window & {
      onYouTubeIframeAPIReady?: ()=>void;
      YT?:typeof YT;
}
export const useYoutubePlayer=()=>{
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const createScript=useCallback(()=>{
    const tag=document.createElement('script');
    tag.src="https://www.youtube.com/iframe_api";
    const firstScriptTag=document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag,firstScriptTag);
  },[])
  const onYouTubeIframeAPIReady=useCallback(()=>{
    if (player) return;
    const newPlayer=new YT.Player('player',{
      height:'400',
      width:'400',
  //     events: {
  //       onStateChange: (event)=>{
  //         if(event.data === YT.PlayerState.ENDED){
  //           const nextIndex=musicIndexRef.current+1;
  //           if(nextIndex < musicQueueRef.current.length){
  //           setMusicIndex(nextIndex);
  //         }
  //       }}
  // }
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

  return player;
}