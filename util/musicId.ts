import videoDetails from "@/app/api/video/page";

export const extractVideoId=(input:string)=>{
    if(input&&input.includes('v=')&&input.includes('&')){
      const videoId=input.split('v=')[1]?.split('&')[0];
      return videoId;
    }
}
export const extractIdFromUrl=(input:string|null)=>{
 if(!input) return null;
 const imageId= input.split('v=')[1]?.split('&')[0];
  return imageId ??null;
}
export const playVideoById=async(player:YT.Player|null,videoId:string,type:string)=>{
  if(!player||!videoId) return;
  if(type==="default"){
    player?.loadVideoById(videoId);
  }else if(type==="playlist"){
    player?.loadPlaylist({ listType: "playlist", list: videoId });
    const detailsResponse = await videoDetails(player.getPlaylist());
    console.log("Video details response:", detailsResponse);
  }
  console.log("Playing video with ID:", videoId, "and type:", type);
    player?.playVideo();
}
export const IdToUrl=(id:string)=>{
  return `https://www.youtube.com/watch?v=${id}`;
}