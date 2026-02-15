"use client";
import { useMusicQueue } from '@/hooks/useMusicQueue';
import { useYoutubePlayer } from '@/hooks/useYoutubePlayer';
import Image from 'next/image';
import placeholderImage from '../public/placeholder.png';
import { useCallback, useEffect, useState } from 'react';

export default function Home() {
  const {player,loading}=useYoutubePlayer();
  const {link,setLink,addMusic,next,prev,stop,musicQueue,musicIndex,musicIndexRef,musicQueueRef,setMusicIndex}=useMusicQueue();
  const [loop,setLoop]=useState<boolean>(false);
  // const [video_Id, setVideoId] = useState<string>("qFQy0O4HYWs"); 
  // const [musicState,setMusicState]=useState<YT.PlayerState | null>(null);
  const imageUrl = musicQueue.length>0?`https://img.youtube.com/vi/${musicQueue[musicIndex]?.musicId}/maxresdefault.jpg`:placeholderImage;
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
const handleStateChange = useCallback((event: YT.OnStateChangeEvent) => {
  if (event.data === YT.PlayerState.ENDED) {
    const nextIndex = musicIndexRef.current + 1;
    if (nextIndex < musicQueueRef.current.length) {
      setMusicIndex(nextIndex);
    } else if (loop) {
      setMusicIndex(0);
    }
  }
}, [musicIndexRef, musicQueueRef, setMusicIndex,loop]);
useEffect(() => {
  if (player) {
    player.addEventListener('onStateChange', handleStateChange);
    return () => {
      player.removeEventListener('onStateChange', handleStateChange);
    } }}, [player, handleStateChange]);


const handleNext=useCallback(()=>{
  if(musicQueueRef.current.length===0 ||musicQueueRef.current.length===1 || (!loop && musicIndexRef.current >= musicQueueRef.current.length-1)) return;
  player?.stopVideo();
  next()
  const nextMusic=musicQueueRef.current[musicIndexRef.current];
  if(nextMusic && nextMusic.musicId){
    player?.loadVideoById(nextMusic.musicId);
  }
},[musicQueueRef, musicIndexRef, next, player,loop])
const handlePrev=useCallback(()=>{
  if(musicQueueRef.current.length===0 ||musicQueueRef.current.length===1 || (!loop && musicIndexRef.current <= 0)) return;
  player?.stopVideo();
  prev();
  const prevMusic=musicQueueRef.current[musicIndexRef.current];
  if(prevMusic && prevMusic.musicId){
    player?.loadVideoById(prevMusic.musicId);
  }
},[musicQueueRef, musicIndexRef, prev, player,loop])
const handleStop=()=>{
  player?.stopVideo();
  stop();
}
const handleLoop=()=>{
  setLoop(prev=>!prev);
}
const handlePlay=()=>{
  if(player?.getPlayerState()!==YT.PlayerState.PLAYING&& player?.getPlayerState()!==YT.PlayerState.PAUSED){
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
      <button onClick={addMusic} disabled={loading}>Add</button> <br />
      <Image src={imageUrl} alt='thumbnail' width={480} height={270}/>
      <button onClick={handlePlay} disabled={loading}>Play</button>
      <button onClick={() => player?.pauseVideo()} disabled={loading}>Pause</button>
      <button onClick={handleNext} disabled={loading}>next</button>
      <button onClick={handlePrev} disabled={loading}>prev</button>
      <button onClick={handleStop} disabled={loading}>Stop</button>
      <button onClick={handleLoop} disabled={loading}>Loop</button>
      <div>
      <ul>
      {musicQueue.length>0 && musicQueue.map((i,index)=>{
        return <li key={index} className={`${index===musicIndex?"bg-emerald-600 text-white cursor-pointer":""}`}>{index+1}. {i.musicId}</li>
      })}
    </ul>
      </div>
      <div id="player"></div>
    </div>
  );
}
