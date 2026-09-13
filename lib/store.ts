"use client";
export type Profile={name:string;role:"student"|"teacher"};
export const defaultProfile:Profile={name:"Aruzhan",role:"student"};
export function getProfile():Profile{try{return JSON.parse(localStorage.getItem("iwm-profile")||"")||defaultProfile}catch{return defaultProfile}}
export function setProfile(p:Profile){localStorage.setItem("iwm-profile",JSON.stringify(p))}
export function getProgress(){try{return JSON.parse(localStorage.getItem("iwm-progress")||"{}")||{}}catch{return {}}}
export function setProgress(data:Record<string,unknown>){localStorage.setItem("iwm-progress",JSON.stringify(data))}
