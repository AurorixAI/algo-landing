import { useEffect, useRef, useState } from "react";
import { TURNSTILE_SITE_KEY } from "@/lib/config";

interface TurnstileAPI {
  ready(callback:()=>void):void;
  render(container:HTMLElement,options:Record<string,unknown>):string;
  remove(id:string):void;
}
declare global { interface Window { turnstile?:TurnstileAPI; } }
let scriptPromise:Promise<TurnstileAPI>|undefined;
function loadChallenge():Promise<TurnstileAPI> {
  if(window.turnstile) return Promise.resolve(window.turnstile);
  if(scriptPromise) return scriptPromise;
  scriptPromise=new Promise((resolve,reject)=>{
    const script=document.createElement("script");
    script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async=true;
    const fail=()=>{clearTimeout(timer);script.remove();scriptPromise=undefined;reject(new Error("challenge_unavailable"));};
    const timer=window.setTimeout(fail,15000);
    script.onerror=fail;
    script.onload=()=>{
      if(!window.turnstile){fail();return;}
      window.turnstile.ready(()=>{clearTimeout(timer);resolve(window.turnstile!);});
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}
const copy={label:"Проверка перед отправкой",loading:"Подготавливаем проверку…",failed:"Проверка недоступна. Проверьте соединение и повторите.",expired:"Время проверки истекло. Пройдите её ещё раз.",retry:"Повторить проверку"};
export const challengeSiteKey=TURNSTILE_SITE_KEY;
export default function ContactChallenge({onToken,reset}:{onToken:(token:string)=>void;reset:number}) {
  const c=copy;
  const container=useRef<HTMLDivElement>(null);
  const callback=useRef(onToken);
  callback.current=onToken;
  const [attempt,setAttempt]=useState(0);
  const [state,setState]=useState<"loading"|"ready"|"failed"|"expired">("loading");
  useEffect(()=>{
    let disposed=false;
    let widget:string|undefined;
    let api:TurnstileAPI|undefined;
    callback.current("");setState("loading");
    loadChallenge().then(loaded=>{
      if(disposed||!container.current)return;
      api=loaded;
      widget=api.render(container.current,{sitekey:challengeSiteKey,action:"demo_request",theme:"light",size:"flexible",language:"ru","response-field":false,
        callback:(token:string)=>{if(!disposed){callback.current(token);setState("ready");}},
        "expired-callback":()=>{if(!disposed){callback.current("");setState("expired");}},
        "error-callback":()=>{if(!disposed){callback.current("");setState("failed");}return true;},
      });
      setState("ready");
    }).catch(()=>{if(!disposed)setState("failed");});
    return()=>{disposed=true;if(widget!==undefined)api?.remove(widget);};
  },[reset,attempt]);
  return <div className="contact-challenge" aria-label={c.label}><div ref={container}/>{state==="loading"&&<p role="status">{c.loading}</p>}{(state==="failed"||state==="expired")&&<div role="alert"><p>{state==="expired"?c.expired:c.failed}</p><button type="button" onClick={()=>setAttempt(value=>value+1)}>{c.retry}</button></div>}</div>;
}
