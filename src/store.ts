import {create} from 'zustand';
export const usePlayback=create<{time:number;playing:boolean;speed:number;set:(v:Partial<{time:number;playing:boolean;speed:number}>)=>void}>(set=>({time:0,playing:false,speed:1,set}));
