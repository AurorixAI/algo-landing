import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n";

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
const copy={
  ru:{label:"Проверка перед отправкой",loading:"Подготавливаем проверку…",failed:"Проверка недоступна. Проверьте соединение и повторите.",expired:"Время проверки истекло. Пройдите её ещё раз.",retry:"Повторить проверку"},
  uz:{label:"Yuborishdan oldingi tekshiruv",loading:"Tekshiruv tayyorlanmoqda…",failed:"Tekshiruv mavjud emas. Aloqani tekshirib, qayta urinib ko‘ring.",expired:"Tekshiruv vaqti tugadi. Uni qayta bajaring.",retry:"Tekshiruvni takrorlash"},
  en:{label:"Check before sending",loading:"Preparing verification…",failed:"Verification is unavailable. Check your connection and retry.",expired:"Verification expired. Please try it again.",retry:"Retry verification"},
};
export const challengeSiteKey=(import.meta.env.VITE_TURNSTILE_SITE_KEY||"").trim();
export default function ContactChallenge({onToken,reset}:{onToken:(token:string)=>void;reset:number}) {
  const {locale}=useTranslation();
  const c=copy[locale];
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
      widget=api.render(container.current,{sitekey:challengeSiteKey,action:"contact",theme:"light",size:"flexible",language:locale==="uz"?"auto":locale,"response-field":false,
        callback:(token:string)=>{if(!disposed){callback.current(token);setState("ready");}},
        "expired-callback":()=>{if(!disposed){callback.current("");setState("expired");}},
        "error-callback":()=>{if(!disposed){callback.current("");setState("failed");}return true;},
      });
      setState("ready");
    }).catch(()=>{if(!disposed)setState("failed");});
    return()=>{disposed=true;if(widget!==undefined)api?.remove(widget);};
  },[locale,reset,attempt]);
  return <div className="contact-challenge" aria-label={c.label}><div ref={container}/>{state==="loading"&&<p role="status">{c.loading}</p>}{(state==="failed"||state==="expired")&&<div role="alert"><p>{state==="expired"?c.expired:c.failed}</p><button type="button" onClick={()=>setAttempt(value=>value+1)}>{c.retry}</button></div>}</div>;
}
