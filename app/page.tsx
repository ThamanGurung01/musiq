"use client";
import { useCallback, useEffect, useRef, useState } from 'react';

type YTWindow=Window & {
      onYouTubeIframeAPIReady?: ()=>void;
      YT?:typeof YT;
    }
export default function Home() {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  // const [video_Id, setVideoId] = useState<string>("qFQy0O4HYWs"); 
  const [link, setLink] = useState<string>("");
  const [musicQueue, setMusicQueue]=useState<{musicType?:string,musicId?:string}[]>([]);
  const [musicIndex,setMusicIndex]=useState<number>(0);
  const musicIndexRef=useRef(musicIndex);
  const musicQueueRef=useRef(musicQueue);

  // const [musicState,setMusicState]=useState<YT.PlayerState | null>(null);
  const createScript=useCallback(()=>{
    const tag=document.createElement('script');
    tag.src="https://www.youtube.com/iframe_api";
    const firstScriptTag=document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag,firstScriptTag);
  },[])
  const onYouTubeIframeAPIReady=useCallback(()=>{
    if (player) return;
    const newPlayer=new YT.Player('player',{
      height:'1',
      width:'1',
      events: {
        onStateChange: (event)=>{
          if(event.data === YT.PlayerState.ENDED){
            const nextIndex=musicIndexRef.current+1;
            if(nextIndex < musicQueueRef.current.length){
            setMusicIndex(nextIndex);
          }
        }}
  }})
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
useEffect(()=>{
  if(!player || musicQueue.length===0 || musicIndex >= musicQueue.length || player?.getPlayerState()===YT.PlayerState.PLAYING) return;
    console.log("Music Index:", musicIndex);
    console.log("Music type and id:", musicQueue[musicIndex]?.musicType, musicQueue[musicIndex]?.musicId);
    console.log("here1");
    const current= musicQueue[musicIndex];
    const musicId = current.musicId;
    if(!musicId) return;
      if(current.musicType==="default"){
        player.loadVideoById(musicId);
      } else {
        console.log("here4");
        player.loadPlaylist({ listType: "playlist", list: musicId });
      }
      player.playVideo();
    },[musicQueue,musicIndex,player])
useEffect(()=>{
  musicQueueRef.current=musicQueue;
  musicIndexRef.current=musicIndex;
},[musicQueue,musicIndex])
  const handleAddMusic=()=>{
  const type=link.length===11?"default":"playlist";
  setMusicQueue((prevQueue)=>[...prevQueue,{musicType:type,musicId:link}]);
  setLink("");
  }
const handleNext=()=>{
  player?.stopVideo();
  setMusicIndex(prevIndex => (prevIndex + 1) % musicQueueRef.current.length);
  const nextMusic=musicQueueRef.current[musicIndexRef.current];
  if(nextMusic && nextMusic.musicId){
    player?.loadVideoById(nextMusic.musicId);
  }
}
const handlePrev=()=>{
  player?.stopVideo();
  setMusicIndex(prevIndex => (prevIndex - 1 + musicQueueRef.current.length) % musicQueueRef.current.length);
  const prevMusic=musicQueueRef.current[musicIndexRef.current];
  if(prevMusic && prevMusic.musicId){
    player?.loadVideoById(prevMusic.musicId);
  }
}
const handleStop=()=>{
  player?.stopVideo();
  setMusicIndex(0);
}
const handlePlay=()=>{
  if(player?.getPlayerState()!==YT.PlayerState.PLAYING&& player?.getPlayerState()!==YT.PlayerState.PAUSED){
    console.log("playing");
    const musicId = musicQueueRef.current[musicIndexRef.current]?.musicId;
    if(musicId){
      player?.loadVideoById(musicId);
    }
  }else if(player?.getPlayerState()===YT.PlayerState.PAUSED){
    console.log("paused playing");
    player?.playVideo();
  }
}
  return (
    <div>
      MusiQ plays music in queue <br/>
      <input type="text" placeholder='Enter the link' onChange={(e)=>setLink(e.target.value)} value={link}/>
      <button onClick={()=>handleAddMusic()}>Add</button> <br />
      <button onClick={handlePlay}>Play</button>
      <button onClick={() => player?.pauseVideo()}>Pause</button>
      <button onClick={handleNext}>next</button>
      <button onClick={handlePrev}>prev</button>
      <button onClick={handleStop}>Stop</button>
      <div>
      {musicQueue.length>0 && musicQueue.map((i,index)=>{
        return <div key={index}>{index+1}. {i.musicId}</div>
      })}
      </div>
      <div id="player"></div>
    </div>
  );
}
