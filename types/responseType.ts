export interface ServerResponseType{
    success:boolean;
    message?:string;
    data:string|{
    title?:string;
    }|Array<string|object>;
    type?:string;
}