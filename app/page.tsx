"use client";
import { useMusicQueue } from '@/hooks/useMusicQueue';
import { useYoutubePlayer } from '@/hooks/useYoutubePlayer';
import Image from 'next/image';
import placeholderImage from '../public/placeholder.png';
import { useCallback, useEffect, useState } from 'react';
import MusicDuration from '@/components/MusicDuration';
import { extractIdFromUrl, playVideoById } from '@/util/musicId';
import { useLoadingContext } from '@/contexts/LoadingContext';
import Loading from '@/components/Loading';


export default function Home() {
  const {player,duration}=useYoutubePlayer();
  const {loading,musicQueueLoading,playlistLoading}=useLoadingContext();
  const {link,setLink,addMusic,next,prev,stop,musicQueue,musicIndex,musicIndexRef,musicQueueRef,setMusicIndex,playListData,videoData,videoId}=useMusicQueue();
  const [loop,setLoop]=useState<boolean>(false);
  const [currentTime,setCurrentTime]=useState<number>(0);
  const [isPlaying,setIsPlaying]=useState<boolean>(false);
  const [imageUrl,setImageUrl]=useState<string>(placeholderImage.src);
  const [hasTriedFallback,setHasTriedFallback]=useState<boolean>(false);
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
  const musicPlayMain=useCallback(()=>{
      if(!player || musicQueue.length===0 || musicIndex >= musicQueue.length || player?.getPlayerState()===YT.PlayerState.PLAYING) return;
    console.log("Music Index:", musicIndex);
    console.log("Music type and id:", musicQueue[musicIndex]?.musicType, musicQueue[musicIndex]?.musicId);
    console.log("here1");
    console.log("video data",videoData);
    const current= musicQueue[musicIndex];
    const musicId = current.musicId;
    if(!musicId) return;
      if(current.musicType==="default"){
      playVideoById(player,musicId,"default");
      } else {
      playVideoById(player,musicId,"playlist");
      }
      player?.playVideo();
  },[musicQueue,musicIndex,player,videoData])
useEffect(()=>{
musicPlayMain();
  },[musicPlayMain])

useEffect(() => {
  const interval = setInterval(updateCurrentTime, 500);
  return () => clearInterval(interval);
}, [updateCurrentTime]);
const handleStateChange = useCallback(async (event: YT.OnStateChangeEvent) => {
  if(!player) return;
  if(player?.getPlayerState()===YT.PlayerState.BUFFERING){
    const nextUrl = musicQueueRef.current.length>0
      ? `https://img.youtube.com/vi/${extractIdFromUrl(player?.getVideoUrl()??null)}/maxresdefault.jpg`
      : placeholderImage.src;
    setHasTriedFallback(false);
    setImageUrl(prev => (prev === nextUrl ? prev : nextUrl));
  }
  if (event.data === YT.PlayerState.ENDED) {
      setIsPlaying(false);
    const nextIndex = musicIndexRef.current + 1;
    const queueLength= musicQueueRef.current.length;
    if (nextIndex < queueLength) {
      setMusicIndex(nextIndex);
    } else if (loop && queueLength > 0) {
    const current = musicQueueRef.current[0];
      if (current?.musicType === "playlist"&&current.musicId) {
      playVideoById(player,current.musicId,"playlist");
      } else if (current?.musicId) {
      playVideoById(player,current.musicId,"default");
      } else {
        player?.seekTo(0,true);
      }
      setMusicIndex(0);
    }
  }
  if(event.data === YT.PlayerState.PLAYING){
  if (player.getPlaylistIndex() >= 99) {
    player.stopVideo();
  }
  }
}, [musicIndexRef, musicQueueRef, setMusicIndex,loop,player]);
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
  if(nextMusic && nextMusic.musicId && nextMusic.musicType){
    playVideoById(player,nextMusic.musicId,nextMusic.musicType);
  }
},[musicQueueRef, musicIndexRef, next, player,loop])
const handlePrev=useCallback(()=>{
  if(musicQueueRef.current.length===0 ||musicQueueRef.current.length===1 || (!loop && musicIndexRef.current <= 0)) return;
  player?.stopVideo();
  prev();
  const prevMusic=musicQueueRef.current[musicIndexRef.current];
  if(prevMusic && prevMusic.musicId && prevMusic.musicType){
    playVideoById(player,prevMusic.musicId,prevMusic.musicType);
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
    const musicType = musicQueueRef.current[musicIndexRef.current]?.musicType;
    if(musicId && musicType){
      playVideoById(player,musicId,musicType);
    }
    setIsPlaying(true);
  }else if(player?.getPlayerState()===YT.PlayerState.PAUSED){
    console.log("paused playing");
    player?.playVideo();
    setIsPlaying(true);
  }
}
const handlePause=()=>{
  player?.pauseVideo();
  setIsPlaying(false);
}
const buttonStyle=`px-5 py-2 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer`;
  return (
    <div>
      <h1 className='text-center m-4'>MusiQ plays music in queue</h1>
      <div className='flex gap-4 justify-center'>
      <div className='flex flex-col items-center gap-3'>
      <div className='flex flex-col items-center gap-4 p-2'>
      <Image src={imageUrl} alt='thumbnail' className='max-w-[480] max-h-[270] object-cover' width={480} height={270} loading='eager' onError={() =>{
         if (hasTriedFallback) return;
          setHasTriedFallback(true);
          const fallbackUrl = `https://img.youtube.com/vi/${extractIdFromUrl(player?.getVideoUrl()??null)}/sddefault.jpg`;
         setImageUrl((prev) => prev === fallbackUrl ? placeholderImage.src : fallbackUrl);
      }}/>
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
      <ul className='flex flex-col h-88 gap-2 overflow-y-auto w-[12%]'>
        {playlistLoading?<Loading/>:musicQueue.length>0 && musicQueue[musicIndex].musicType === "playlist" && playListData && playListData.length>0 && playListData.map((playlistData,index)=><li key={index} title={playlistData?.videoId}><span className={`${index===player?.getPlaylistIndex()?"bg-emerald-600 text-white cursor-pointer":""} truncate block w-full font-semibold`}>{index+1}. {playlistData?.title}</span></li>)}
      </ul>
      </div>
      <hr className='border-2 w-full my-5' />
      <div className='flex flex-col items-center m-4 gap-4'>
      <div className='flex gap-5'>
      <input type="text" placeholder='Enter the link' onChange={(e)=>setLink(e.target.value)} value={link} className='px-2 py-1 border-2 rounded-lg'/>
      <button onClick={async ()=>player && await addMusic(player)} disabled={loading || !player} className={`px-4 py-1.5 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer bg-green-500`}>Add</button>
      </div>
      <h1>Music Queue</h1>
      <ul className='w-[17%] overflow-y-auto h-88'>
      {musicQueueLoading?<Loading/>:musicQueue.length>0 ? musicQueue.map((i,index)=><li key={index} className={`${index===musicIndex?"bg-emerald-600 text-white cursor-pointer":""}`} title={i.musicTitle}><span className='truncate block w-full font-semibold'>{index+1}. {i.musicTitle}</span></li>):<p>No music in queue</p>}
      </ul>
      </div>
      <div id="player"></div>
    </div>
  );
}

//buttons fixes dragging player progress bar also check queue array