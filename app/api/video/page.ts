export default async function videoDetails(videoUrl: string|Array<string>) {
    console.log("Fetching video details for URL(s):", videoUrl);
    if(videoUrl&& typeof videoUrl === "string"){ 
    const youtubeOembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    try {
        const response = await fetch(youtubeOembedUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched video details:");
        return {
            success:true,
            data:{...data,url:videoUrl},
            type: "single",
        };
    } catch (error) {
        console.error("Error fetching video details:", error);
        return {
            success:false,
            message: "Failed to fetch video details",
        };
    }}else if(Array.isArray(videoUrl)){
      const fetchPromises = videoUrl.map(url => {
        const youtubeUrl= `https://www.youtube.com/watch?v=${url}`;
        const youtubeOembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
        return fetch(youtubeOembedUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
            })
            .then(data => ({ ...data, url: youtubeUrl }))
            .catch(error => {
                console.error(`Error fetching details for ${url}:`, error);
                return { success: false, url, message: "Failed to fetch video details" };
            });
        });
        const videoData= await Promise.all(fetchPromises);
        console.log("Fetched video details for playlist:", videoData);
      return {success:true, data:videoData, type: "multiple"};
    }else{
    return {success:false,message:"No video URL provided"};
}
}