import { useCallback, useEffect, useRef, useState } from "react";

export const useMusicQueue=()=>{
  const [link, setLink] = useState<string>("");
  const [musicQueue, setMusicQueue]=useState<{musicType?:string,musicId?:string}[]>([]);
  const [musicIndex,setMusicIndex]=useState<number>(0);
  const musicIndexRef=useRef(musicIndex);
  const musicQueueRef=useRef(musicQueue);
    useEffect(()=>{
  musicQueueRef.current=musicQueue;
  musicIndexRef.current=musicIndex;
    },[musicQueue,musicIndex])
  const addMusic=useCallback(()=>{
  if(!link) return;
  const type=link.length===11?"default":"playlist";
  setMusicQueue((prevQueue)=>[...prevQueue,{musicType:type,musicId:link}]);
  setLink("");
  },[link])
  const next=useCallback(()=>{
    setMusicIndex(prevIndex => (prevIndex + 1) % musicQueueRef.current.length);
  },[])
  const prev=useCallback(()=>{
    setMusicIndex(prevIndex => (prevIndex - 1 + musicQueueRef.current.length) % musicQueueRef.current.length);
  },[])
  const stop=useCallback(()=>{
    setMusicIndex(0);
  },[])
  return {link,setLink,addMusic,next,prev,stop,musicQueue,musicIndex,musicIndexRef,musicQueueRef,setMusicIndex};
}