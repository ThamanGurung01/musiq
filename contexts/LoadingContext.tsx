"use client";
import React,{ createContext, useContext } from "react";
export const LoadingContext = createContext<{
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;}>({
    loading: false,
    setLoading: () => {},
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
    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
}