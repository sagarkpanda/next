"use client";
import { useState } from "react";
export default function CodeCopy({ code }: { code: string }) {
 const [copied,setCopied]=useState(false);
 return <button className="copy-button" onClick={async()=>{await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1200)}}>{copied?"copied":"copy"}</button>;
}
