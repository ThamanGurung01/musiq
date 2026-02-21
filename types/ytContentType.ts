export interface ytContentType{
    playlistPanelVideoRenderer?:{
        title?:{
            simpleText?:string;
        }
    }
    playlistVideoRenderer?:{
        title?:{
            runs?:Array<{text:string}>;
        }
        videoId?:string;
    }
}
export interface playlistDataType{
    title?:string;
    videoId?:string;
}