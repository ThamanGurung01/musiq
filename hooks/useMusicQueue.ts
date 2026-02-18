import { useCallback, useEffect, useRef, useState } from "react";
import videoDetails from '../app/api/video/page';
import { OembedResponse } from '@/types/oembedType';
import { IdToUrl } from "@/util/musicId";
export const useMusicQueue=()=>{
  const [link, setLink] = useState<string>("");
  const [musicQueue, setMusicQueue]=useState<{musicType?:string,musicId?:string,musicTitle?:string}[]>([]);
  const [musicIndex,setMusicIndex]=useState<number>(0);
  const [videoData,setVideoData]=useState<OembedResponse|null>(null);
  const musicIndexRef=useRef(musicIndex);
  const musicQueueRef=useRef(musicQueue);
    useEffect(()=>{
  musicQueueRef.current=musicQueue;
  musicIndexRef.current=musicIndex;
    },[musicQueue,musicIndex])

  const addMusic=useCallback(async (player:YT.Player)=>{
  if(!link || !player) return;
  const type=link.length===11?"default":"playlist";
    if(type === "default"){
    const detailsResponse = await videoDetails(IdToUrl(link));
    setVideoData(detailsResponse.data);
    setMusicQueue((prevQueue)=>[...prevQueue,{musicType:type,musicId:link,musicTitle:detailsResponse?.data?.title}]);
    }else{
    setMusicQueue((prevQueue)=>[...prevQueue,{musicType:type,musicId:link,musicTitle:"playlist"}]);
    }
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
//diff btn and list for playlists