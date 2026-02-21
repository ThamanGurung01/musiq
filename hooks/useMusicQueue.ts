import { useCallback, useEffect, useRef, useState } from "react";
// import videoDetails from '../app/api/video/page';
import { OembedResponse } from '@/types/oembedType';
import { IdToUrl } from "@/util/musicId";
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
    const apiUrl=`http://localhost:3000/api/video?videoUrl=${IdToUrl(link)}&type=default`;
    const detailsResponse = await fetch(apiUrl, {
  method: "GET",
  cache: "no-cache",
  headers: {
    "Content-Type": "application/json"
  }
});
    const jsonData = await detailsResponse.json();
    setVideoData(jsonData?.data);
    setMusicQueue((prevQueue)=>[...prevQueue,{musicType:type,musicId:link,musicTitle:(jsonData?.data as VideoData)?.title}]);
    }else{
    console.log("Fetching playlist details for ID:", link);
    const apiUrl=`http://localhost:3000/api/video?videoUrl=${link}&type=playlist`;
    const data = await fetch(apiUrl, {
  method: "GET",
  cache: "no-cache",
  headers: {
    "Content-Type": "application/json"
  }
});
    if(!data.ok)return;
    console.log("Playlist details response:", data);
    const jsonData = await data.json();
    console.log("Playlist details JSON:", jsonData);
        if(jsonData?.type === "playlist_group"){
    setVideoData(jsonData?.data?.data);
    setMusicQueue((prevQueue)=>[...prevQueue,{musicType:type,musicId:link,musicTitle:(jsonData?.data as VideoData)?.title??"playlist"}]);
    // const playlistsItem=jsonData?.data?.contents.map((item:ytContentType)=>{
    //   return {title:item?.playlistPanelVideoRenderer?.title?.simpleText,videoId:item?.playlistPanelVideoRenderer?.videoId};
    // })
    const length=jsonData?.data?.data?.contents.length;
    // console.log(jsonData?.data?.data?.contents[0]);
    const playlistsItem=jsonData?.data?.data?.contents.map((item:ytContentType,index:number)=>{
      if(index +1 ===length) return;
      return {title:item?.playlistVideoRenderer?.title?.runs?.[0]?.text,videoId:item?.playlistVideoRenderer?.videoId};
    })
    playlistsItem.pop();
    console.log("Extracted playlist items:", playlistsItem);
    setPlayListData(playlistsItem);
    }else{
    setVideoData(jsonData?.data);
    setMusicQueue((prevQueue)=>[...prevQueue,{musicType:type,musicId:link,musicTitle:(jsonData?.data as VideoData)?.title??"playlist"}]);
    // const playlistsItem=jsonData?.data?.contents.map((item:ytContentType)=>{
    //   return {title:item?.playlistPanelVideoRenderer?.title?.simpleText,videoId:item?.playlistPanelVideoRenderer?.videoId};
    // })
    const playlistsItem=jsonData?.data?.contents.map((item:ytContentType)=>{
      return {title:item?.playlistVideoRenderer?.title?.runs?.[0]?.text,videoId:item?.playlistVideoRenderer?.videoId};
    })
    setPlayListData(playlistsItem);
    }

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
  return {link,setLink,addMusic,next,prev,stop,musicQueue,musicIndex,musicIndexRef,musicQueueRef,setMusicIndex,videoData,playListData};
}