import { ServerResponseType } from "@/types/responseType";
import { NextRequest,NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    const { videoUrl, type } = await req.json();
    console.log("Fetching video details for URL(s):", videoUrl);
    if(!videoUrl) return NextResponse.json({success:false,message:"No video URL provided",data:videoUrl}, {status: 400});
    if(typeof videoUrl === "string"&& type === "default"){ 
    const youtubeOembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    try {
        const response = await fetch(youtubeOembedUrl,{
            next: { revalidate: 86400 }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched video details:");
        return NextResponse.json({ success: true, data: { ...data, url: videoUrl }, type: "single" }, {
        headers: {
            "Cache-Control": "public, max-age=86400"
        }
        });
    } catch (error) {
        console.error("Error fetching video details:", error);
        return  NextResponse.json({
            success:false,
            message: "Failed to fetch video details",
            data:videoUrl
        }, {status: 500});
    }}else if(Array.isArray(videoUrl)&&type === "playlist"){
        const results: ServerResponseType[] = [];
        const CHUNK_SIZE = 5;
        for(let i = 0; i < videoUrl.length; i++){

        const chunk = videoUrl.slice(i, i + CHUNK_SIZE);
        const chunkPromises=chunk.map(async(url)=>{
        try {
        const youtubeUrl= `https://www.youtube.com/watch?v=${url}`;
        const youtubeOembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
        const response= await fetch(youtubeOembedUrl,{next: { revalidate: 86400 }}); 
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();
        return{success:true, data:{...data,url:youtubeUrl}, type:"single"};
        } catch (error) {
            console.error(`Error fetching details for ${url}:`, error);
            return{ success: false, data:url, message: "Failed to fetch video details" };
        }
        });
        const responses = await Promise.all(chunkPromises);
        results.push(...responses);
        if ((i + CHUNK_SIZE) % 5 === 0 && (i + CHUNK_SIZE) !== videoUrl.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
        }}
            return NextResponse.json({success:true, data:results, type: "multiple"}, {
            headers: {
            "Cache-Control": "public, max-age=86400"
        }});

    }else if(typeof videoUrl === "string" &&type === "playlist"){
    //     console.log("Fetching playlist details for ID 22:", videoUrl);
    //  const youtubeUrl=`http://www.youtube.com/playlist?list=${videoUrl}`;
    //  console.log("Constructed YouTube playlist URL:", youtubeUrl);
    // const youtubeOembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
    try {
    const response=await fetch("https://www.youtube.com/watch?v=q74fX9CnqtQ&list=RDq74fX9CnqtQ&start_radio=1",
      {
        headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9",
        },
        next: { revalidate: 86400 }
    });
        const html = await response.text();
        const jsonMatch = html.match(/var ytInitialData = (.*?);<\/script>/);
        if (!jsonMatch) {
        throw new Error("ytInitialData not found");
        }

        const ytData = JSON.parse(jsonMatch[1]);
    return NextResponse.json({
        success:true,
        data:ytData.contents.twoColumnWatchNextResults.playlist.playlist,
        type:"single"
    }, {status: 200,headers: {
            "Cache-Control": "public, max-age=86400"
        }});
    } catch (error) {
        console.error("Error fetching video details:", error);
        return NextResponse.json({
            success:false,
            message: "Failed to fetch video details",
            data:videoUrl
        }, {status: 500});
    }}else{
    return NextResponse.json({success:false,message:"type and videoUrl mismatch", data: videoUrl}, {status: 400});
}
}
export async function GET(){
    return NextResponse.json({success:true,message:"Video API is working"});
}
//implement caching server side client side cdn cache react query etc