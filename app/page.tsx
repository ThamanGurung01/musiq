"use client";
import { useMusicQueue } from '@/hooks/useMusicQueue';
import { useYoutubePlayer } from '@/hooks/useYoutubePlayer';
import Image from 'next/image';
import placeholderImage from '../public/placeholder.png';
import { useCallback, useEffect, useState } from 'react';
import MusicDuration from '@/components/MusicDuration';
import { extractIdFromUrl } from '@/util/musicId';

export default function Home() {
  const {player,loading,duration}=useYoutubePlayer();
  const {link,setLink,addMusic,next,prev,stop,musicQueue,musicIndex,musicIndexRef,musicQueueRef,setMusicIndex}=useMusicQueue();
  const [loop,setLoop]=useState<boolean>(false);
  const [currentTime,setCurrentTime]=useState<number>(0);
  const [isPlaying,setIsPlaying]=useState<boolean>(false);
  const [imageUrl,setImageUrl]=useState<string>(placeholderImage.src);
  // const currentItem = musicQueue[musicIndex];
  // const playlistId = useMemo(
  //   () => {
  //     if(currentItem?.musicType === "playlist"){
  //         return currentItem.musicId ?? null;
  //     }
  //     return (currentItem?.musicType === "playlist" ? currentItem.musicId ?? null : null)
  //   },
  //   [currentItem]
  // );
  // console.log("Current Item:", currentItem);
  // const [video_Id, setVideoId] = useState<string>("qFQy0O4HYWs"); 
  // const [musicState,setMusicState]=useState<YT.PlayerState | null>(null);
  const updateCurrentTime=useCallback(()=>{
    if (!player || typeof player.getPlayerState !== "function") return;
    if(player?.getPlayerState()===YT.PlayerState.PLAYING){
      setCurrentTime(player.getCurrentTime());
      setIsPlaying(true);
    }
  },[player])
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

useEffect(() => {
  const interval = setInterval(updateCurrentTime, 500);
  return () => clearInterval(interval);
}, [updateCurrentTime]);
const handleStateChange = useCallback((event: YT.OnStateChangeEvent) => {
      const thumbnailUrl = musicQueueRef.current.length>0?`https://img.youtube.com/vi/${extractIdFromUrl(player?.getVideoUrl()??null)}/maxresdefault.jpg`:placeholderImage.src;
      setImageUrl(thumbnailUrl);
  if (event.data === YT.PlayerState.ENDED) {
      setIsPlaying(false);
    const nextIndex = musicIndexRef.current + 1;
    const queueLength= musicQueueRef.current.length;
    if (nextIndex < queueLength) {
      setMusicIndex(nextIndex);
    } else if (loop && queueLength > 0) {
    const current = musicQueueRef.current[0];
      if (current?.musicType === "playlist"&&current.musicId) {
        player?.loadPlaylist({ listType: "playlist", list: current.musicId });
      } else if (current?.musicId) {
        player?.loadVideoById(current.musicId);
      } else {
        player?.seekTo(0,true);
      }
      player?.playVideo();
      setMusicIndex(0);
    }
  }
}, [musicIndexRef, musicQueueRef, setMusicIndex,loop,player,]);
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
    setIsPlaying(true);
  }else if(player?.getPlayerState()===YT.PlayerState.PAUSED){
    console.log("paused playing");
    player?.playVideo();
    setIsPlaying(false);
  }
}
const handlePause=()=>{
  player?.pauseVideo();
  setIsPlaying(false);
}
const buttonStyle=`px-4 py-2 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer`;
  return (
    <div>
      <h1 className='text-center m-4'>MusiQ plays music in queue</h1>
      <div className='flex flex-col items-center gap-3'>
      <div className='flex flex-col items-center gap-4 p-2'>
      <Image src={imageUrl} alt='thumbnail' className='max-w-[480] max-h-[268] object-cover' width={480} height={270} loading='eager'onError={() => setImageUrl(`https://img.youtube.com/vi/${extractIdFromUrl(player?.getVideoUrl()??null)}/sddefault.jpg`)}/>
      <MusicDuration wPerc={duration > 0 ? ((currentTime / duration )* 100) : 0} duration={duration} player={player} setCurrentTime={setCurrentTime} musicIndex={musicIndex}/>
      <div className='w-full flex justify-between'>
      {isPlaying?<button onClick={handlePause} disabled={loading} className={`${buttonStyle} bg-purple-500`}>Pause</button>:
      <button className={`${buttonStyle} bg-blue-500`} onClick={handlePlay} disabled={loading}>Play</button>}
      <button onClick={handleNext} disabled={loading} className={`${buttonStyle} bg-green-500`}>next</button>
      <button onClick={handlePrev} disabled={loading} className={`${buttonStyle} bg-yellow-500`}>prev</button>
      <button onClick={handleStop} disabled={loading} className={`${buttonStyle} bg-red-500`}>Stop</button>
      <button onClick={handleLoop} disabled={loading} className={`${buttonStyle} ${loop?"bg-blue-700":" bg-blue-500"}`}>Loop</button>
      </div>
      </div>
      </div>
      <ul>
      <hr className='border-2 w-full my-5' />
      <div className='flex flex-col items-center m-4 gap-4'>
      <div>
      <input type="text" placeholder='Enter the link' onChange={(e)=>setLink(e.target.value)} value={link} className='px-2 py-1'/>
      <button onClick={addMusic} disabled={loading}>Add</button>
      </div>
      <h1>Music Queue</h1>
      {musicQueue.length>0 ? musicQueue.map((i,index)=><li key={index} className={`${index===musicIndex?"bg-emerald-600 text-white cursor-pointer":""}`}>{index+1}. {i.musicId}</li>):<p>No music in queue</p>}
      </div>
    </ul>
      <div id="player"></div>
    </div>
  );
}
