export const extractDataFromInput = (input: string) => {
  if (!input) return null;

  const trimmedInput = input.trim();
  const url = trimmedInput;

  let videoId: string | null = null;
  let playlistId: string | null = null;
  let type: "default" | "playlist" | null = null;

  const isValidVideoId = (id: string | null) =>!!id && id.length === 11;

  const isValidPlaylistId = (id: string | null) =>!!id && id.startsWith("PL");

  try {
    const urlObj = new URL(trimmedInput);

    const vParam = urlObj.searchParams.get("v");
    const listParam = urlObj.searchParams.get("list");

    if (isValidPlaylistId(listParam)) {
      playlistId = listParam;
      type = "playlist";
    }else if (isValidVideoId(vParam)) {
      videoId = vParam;
      type = "default";
    }
    return type ? { videoId, playlistId, url, type } : null;
  } catch{
    let vMatch: string | null = null;
    let listMatch: string | null = null;

    if (trimmedInput.includes("v=")) {
      vMatch = trimmedInput.split("v=")[1]?.split("&")[0] || null;
    }

    if (trimmedInput.includes("list=")) {
      listMatch = trimmedInput.split("list=")[1]?.split("&")[0] || null;
    }

    if (isValidPlaylistId(listMatch)) {
      playlistId = listMatch;
      type = "playlist";
    }else if (isValidVideoId(vMatch)) {
      videoId = vMatch;
      type = "default";
    }
    return type ? { videoId, playlistId, url: trimmedInput, type } : null;
  }
};

export const extractIdFromUrl=(input:string|null)=>{
 if(!input) return null;
 const imageId= input.split('v=')[1]?.split('&')[0];
  return imageId ??null;
}

export const playVideoById=(player:YT.Player|null,videoId:string,type:string)=>{
  if(!player||!videoId) return;
  if(type==="default"){
    player.loadVideoById(videoId);
  }else if(type==="playlist"){
    player.loadPlaylist({ listType: "playlist", list: videoId });
  }
}
export const IdToUrl=(id:string)=>{
  return `https://www.youtube.com/watch?v=${id}`;
}