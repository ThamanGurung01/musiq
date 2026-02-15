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