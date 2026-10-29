import { useEffect, useRef, useState } from "react";
import { TURNSTILE_SITE_KEY } from "@/lib/config";

interface TurnstileAPI {
  render(container:HTMLElement,options:Record<string,unknown>):string;
  remove(id:string):void;
}
declare global { interface Window { turnstile?:TurnstileAPI; [name:string]:unknown; } }
const SCRIPT_URL="https://challenges.cloudflare.com/turnstile/v0/api.js";
const ONLOAD="__algoTurnstileLoaded";
let scriptPromise:Promise<TurnstileAPI>|undefined;
/**
 * The script is loaded once.  Cloudflare calls the global `onload` function when the API is ready to render; `turnstile.ready()`
 * must NOT be used from `script.onload` (it never fires there: "ready() would break if called before api.js is loaded").
 * A failed load (network, blocked, 15 s) rejects and forgets the promise, so «Повторить проверку» loads it again.
 */
function loadChallenge():Promise<TurnstileAPI> {
  if(window.turnstile?.render) return Promise.resolve(window.turnstile);
  if(scriptPromise) return scriptPromise;
  scriptPromise=new Promise((resolve,reject)=>{
    const script=document.createElement("script");
    const fail=()=>{clearTimeout(timer);delete window[ONLOAD];script.remove();scriptPromise=undefined;reject(new Error("challenge_unavailable"));};
    const timer=window.setTimeout(fail,15000);
    window[ONLOAD]=()=>{clearTimeout(timer);delete window[ONLOAD];if(window.turnstile?.render)resolve(window.turnstile);else fail();};
    script.src=`${SCRIPT_URL}?render=explicit&onload=${ONLOAD}`;
    script.async=true;
    script.onerror=fail;
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
