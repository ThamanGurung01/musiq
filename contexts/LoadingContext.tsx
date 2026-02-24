"use client";
import React,{ createContext, useContext } from "react";
export const LoadingContext = createContext<{
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    playlistLoading: boolean;
    setPlaylistLoading: React.Dispatch<React.SetStateAction<boolean>>;
    musicQueueLoading: boolean;
    setMusicQueueLoading: React.Dispatch<React.SetStateAction<boolean>>;}>({
    loading: false,
    setLoading: () => {},
    playlistLoading: false,
    setPlaylistLoading: () => {},
    musicQueueLoading: false,
    setMusicQueueLoading: () => {},
});
export const useLoadingContext=()=>{
    const context=useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoadingContext must be used within a LoadingProvider");
      }
      return context;
}
export const LoadingProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [playlistLoading, setPlaylistLoading] = React.useState<boolean>(false);
    const [musicQueueLoading, setMusicQueueLoading] = React.useState<boolean>(false);
    return (
        <LoadingContext.Provider value={{ loading, setLoading, playlistLoading, setPlaylistLoading, musicQueueLoading, setMusicQueueLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}