import { useCallback, useEffect, useRef, useState } from "react";
// import videoDetails from '../app/api/video/page';
import { OembedResponse } from '@/types/oembedType';
import { extractDataFromInput } from "@/util/musicId";
import { playlistDataType, ytContentType } from "@/types/ytContentType";

interface VideoData {
  title?: string;
  [key: string]: string | number | boolean | null | undefined;
}
export const useMusicQueue=()=>{
  const [link, setLink] = useState<string>("");
  const [musicQueue, setMusicQueue]=useState<{musicType?:string,musicId?:string,musicTitle?:string}[]>([]);
  const [musicIndex,setMusicIndex]=useState<number>(0);
  const [videoData,setVideoData]=useState<OembedResponse|null>(null);
  const [playListData,setPlayListData]=useState<Array<playlistDataType>|null>(null);
  const [videoId,setVideoId]=useState<string|null>(null);
  const musicIndexRef=useRef(musicIndex);
  const musicQueueRef=useRef(musicQueue);
    useEffect(()=>{
  musicQueueRef.current=musicQueue;
  musicIndexRef.current=musicIndex;
    },[musicQueue,musicIndex])

  const addMusic=useCallback(async (player:YT.Player)=>{
  if(!link || !player) return;
  const inputData=extractDataFromInput(link);
  const type=inputData?.type;
  if(!inputData||!type) return;
  setVideoId(inputData.videoId??null);
  if(type === "default"){
    const apiUrl=`http://localhost:3000/api/video?videoUrl=${encodeURIComponent(inputData.url)}&type=default`;
    const detailsResponse = await fetch(apiUrl, {
  method: "GET",
  cache: "no-cache",
  headers: {
    "Content-Type": "application/json"
  }
});
    const jsonData = await detailsResponse.json();
    setVideoData(jsonData?.data);
    setMusicQueue((prevQueue)=>[...prevQueue,{musicType:type,musicId:inputData.videoId??undefined,musicTitle:(jsonData?.data as VideoData)?.title}]);
    }else if(type === "playlist"){
      if(!inputData.playlistId) return;
    const apiUrl=`http://localhost:3000/api/video?videoUrl=${encodeURIComponent(inputData.playlistId)}&type=playlist`;
    const data = await fetch(apiUrl, {
  method: "GET",
  cache: "no-cache",
  headers: {
    "Content-Type": "application/json"
  }
});
    if(!data.ok)return;
    const jsonData = await data.json();
    setMusicQueue((prevQueue)=>[...prevQueue,{musicType:"playlist",musicId:inputData.playlistId??undefined,musicTitle:(jsonData?.data as VideoData)?.title??"playlist"}]);
    const length=jsonData?.data?.data?.contents.length;
    const playlistsItem=jsonData?.data?.data?.contents.map((item:ytContentType,index:number)=>{
      if(index +1 ===length) return;
      return {title:item?.playlistVideoRenderer?.title?.runs?.[0]?.text,videoId:item?.playlistVideoRenderer?.videoId};
    })
    playlistsItem.pop();
    console.log(playlistsItem);
    setPlayListData(playlistsItem);

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
  return {link,setLink,addMusic,next,prev,stop,musicQueue,musicIndex,musicIndexRef,musicQueueRef,setMusicIndex,videoData,playListData,videoId};
}

//youtube public playlist and video id only