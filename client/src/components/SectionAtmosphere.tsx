import { useEffect, useId, useRef, useState } from "react";
import "./section-atmosphere.css";

export type AtmosphereVariant = "atlas" | "path" | "orbit" | "paper" | "converge";

type SceneProps = { id: string };

const contourLines = Array.from({ length: 17 }, (_, index) => {
  const offset = index * 17;
  return `M ${-164 + offset} -80 C ${265 + offset * .48} 75 ${-204 + offset * .7} 270 ${66 + offset * .32} 405 S ${-122 + offset * .5} 635 ${153 + offset * .2} 840`;
});

function Atlas({ id }: SceneProps) {
  return <svg focusable="false" className="section-atmosphere-svg atmosphere-atlas-svg" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
    <defs>
      <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="360" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#2563eb" stopOpacity=".36" /><stop offset="1" stopColor="#7392d9" stopOpacity=".05" /></linearGradient>
      <linearGradient id={`${id}-field`} x1="0" y1="0" x2="450" y2="300" gradientUnits="userSpaceOnUse"><stop stopColor="#d9e3fc" stopOpacity=".55" /><stop offset="1" stopColor="#eef2fd" stopOpacity="0" /></linearGradient>
    </defs>
    <path d="M0 0H285C400 150 150 260 260 470S150 760 320 900H0Z" fill={`url(#${id}-field)`} />
    <g className="atmosphere-drift atmosphere-drift-left" stroke={`url(#${id}-edge)`} strokeWidth="1">
      {contourLines.map((line, index) => <path key={index} d={line} strokeWidth={index % 4 === 0 ? 1.5 : .8} />)}
      <path className="atmosphere-signal" d={contourLines[8]} stroke="#2563eb" strokeWidth="2.3" pathLength="1" />
      <g fill="#2563eb" stroke="white" strokeWidth="3"><circle cx="138" cy="212" r="5" /><circle cx="168" cy="450" r="5" /><circle cx="154" cy="742" r="4" /></g>
      <g stroke="#2563eb" strokeOpacity=".34"><circle cx="138" cy="212" r="12" /><circle cx="168" cy="450" r="12" /></g>
    </g>
    <g className="atmosphere-drift atmosphere-drift-right" transform="translate(1440 880) rotate(180)">
      <g stroke={`url(#${id}-edge)`} strokeWidth=".9">{contourLines.slice(1).map((line, index) => <path key={index} d={line} strokeWidth={index % 4 === 0 ? 1.5 : .8} />)}</g>
      <path className="atmosphere-signal atmosphere-signal-late" d={contourLines[6]} stroke="#4f46e5" strokeWidth="2.4" pathLength="1" />
      <circle cx="154" cy="418" r="5" fill="#4f46e5" /><circle cx="154" cy="418" r="13" stroke="#4f46e5" strokeOpacity=".25" />
    </g>
  </svg>;
}

const branches = [
  "M-100 710C125 710 115 475 350 475S540 245 780 245S1100 85 1540 85",
  "M-100 730C160 730 180 545 385 545S570 360 810 360S1100 210 1540 210",
  "M-100 750C160 750 215 620 420 620S590 485 850 485S1110 340 1540 340",
  "M-100 770C170 770 235 695 445 695S625 610 890 610S1140 475 1540 475",
  "M-100 790C170 790 250 770 470 770S665 735 930 735S1170 620 1540 620",
];

function Path({ id }: SceneProps) {
  return <svg focusable="false" className="section-atmosphere-svg atmosphere-path-svg" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
    <defs>
      <linearGradient id={`${id}-route`} x1="0" y1="760" x2="1440" y2="250" gradientUnits="userSpaceOnUse"><stop stopColor="#4f46e5" stopOpacity=".25" /><stop offset=".45" stopColor="#7093e2" stopOpacity=".06" /><stop offset="1" stopColor="#2563eb" stopOpacity=".28" /></linearGradient>
      <linearGradient id={`${id}-wash`} x1="160" y1="900" x2="160" y2="500" gradientUnits="userSpaceOnUse"><stop stopColor="#e9effe" stopOpacity=".8" /><stop offset="1" stopColor="#e9effe" stopOpacity="0" /></linearGradient>
    </defs>
    <path d="M0 680C300 590 345 820 710 760S1215 590 1440 680V900H0Z" fill={`url(#${id}-wash)`} />
    <g className="atmosphere-route-field" stroke={`url(#${id}-route)`} strokeWidth="1.3">
      {branches.map((branch, index) => <path key={index} d={branch} />)}
      {[0, 2, 4].map((index) => <path key={index} className={`atmosphere-signal atmosphere-route-signal atmosphere-signal-${index}`} d={branches[index]} stroke="#2563eb" strokeWidth="2.5" pathLength="1" />)}
    </g>
    <g stroke="#4975d6" strokeOpacity=".23"><circle cx="350" cy="475" r="9" /><circle cx="420" cy="620" r="9" /><circle cx="930" cy="735" r="9" /></g>
    <g fill="#4975d6" fillOpacity=".5"><circle cx="350" cy="475" r="3" /><circle cx="420" cy="620" r="3" /><circle cx="930" cy="735" r="3" /></g>
  </svg>;
}

function spherePoint(longitude: number, latitude: number) {
  const tilt = -.28;
  const x = Math.sin(longitude) * Math.cos(latitude) * 465;
  const y = Math.sin(latitude) * 440 + Math.cos(longitude) * Math.cos(latitude) * 90;
  return [1055 + x * Math.cos(tilt) - y * Math.sin(tilt), 450 + x * Math.sin(tilt) + y * Math.cos(tilt)];
}

function spherePath(fixed: number, longitude: boolean) {
  return Array.from({ length: 65 }, (_, index) => {
    const t = -Math.PI / 2 + index / 64 * Math.PI;
    const [x, y] = spherePoint(longitude ? fixed : t, longitude ? t : fixed);
    return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

const meridians = Array.from({ length: 25 }, (_, index) => spherePath(-Math.PI / 2 + index / 24 * Math.PI, true));
const parallels = Array.from({ length: 25 }, (_, index) => spherePath(-Math.PI / 2 + index / 24 * Math.PI, false));

function Orbit({ id }: SceneProps) {
  return <svg focusable="false" className="section-atmosphere-svg atmosphere-orbit-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
    <defs>
      <radialGradient id={`${id}-core`}><stop stopColor="#5b7bf0" stopOpacity=".21" /><stop offset=".67" stopColor="#3e63cc" stopOpacity=".11" /><stop offset="1" stopColor="#3e63cc" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-sphere`} x1="580" y1="660" x2="1440" y2="230" gradientUnits="userSpaceOnUse"><stop stopColor="#a9bcff" stopOpacity=".03" /><stop offset=".46" stopColor="#9bb4ff" stopOpacity=".34" /><stop offset="1" stopColor="#b8caff" stopOpacity=".56" /></linearGradient>
      <linearGradient id={`${id}-orbital`} x1="290" y1="740" x2="1440" y2="120" gradientUnits="userSpaceOnUse"><stop stopColor="#8daaff" stopOpacity="0" /><stop offset=".6" stopColor="#8daaff" stopOpacity=".32" /><stop offset="1" stopColor="#dae2ff" stopOpacity=".52" /></linearGradient>
    </defs>
    <ellipse cx="1070" cy="425" rx="570" ry="520" fill={`url(#${id}-core)`} />
    <g className="atmosphere-orbital-mesh" stroke={`url(#${id}-sphere)`} strokeWidth=".85">
      {meridians.map((line, index) => <path key={`m${index}`} d={line} strokeWidth={index % 6 === 0 ? 1.4 : .75} />)}
      {parallels.map((line, index) => <path key={`p${index}`} d={line} strokeWidth={index % 6 === 0 ? 1.4 : .75} />)}
    </g>
    <g className="atmosphere-orbit-ring" stroke={`url(#${id}-orbital)`}>
      <ellipse cx="1020" cy="455" rx="690" ry="165" transform="rotate(-28 1020 455)" strokeWidth="1.5" />
      <ellipse cx="1020" cy="455" rx="715" ry="187" transform="rotate(-28 1020 455)" strokeWidth=".7" opacity=".45" />
      <path className="atmosphere-signal atmosphere-orbit-signal" d="M395 750C590 650 1100 400 1525 115" stroke="#b5ccff" strokeWidth="3" pathLength="1" />
    </g>
  </svg>;
}

function Paper({ id }: SceneProps) {
  return <svg focusable="false" className="section-atmosphere-svg atmosphere-paper-svg" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
    <defs>
      <linearGradient id={`${id}-paper`} x1="1160" y1="60" x2="1430" y2="800" gradientUnits="userSpaceOnUse"><stop stopColor="#e2e9fc" stopOpacity=".65" /><stop offset=".5" stopColor="#f7f9ff" stopOpacity=".7" /><stop offset="1" stopColor="#dce5fc" stopOpacity=".55" /></linearGradient>
      <linearGradient id={`${id}-paperline`} x1="1000" y1="0" x2="1440" y2="750" gradientUnits="userSpaceOnUse"><stop stopColor="#c9d5f2" stopOpacity=".2" /><stop offset=".6" stopColor="#88a1d9" stopOpacity=".55" /><stop offset="1" stopColor="#c9d5f2" stopOpacity=".2" /></linearGradient>
    </defs>
    <g className="atmosphere-paper-stack" transform="rotate(13 1285 440)">
      <rect x="1190" y="55" width="360" height="690" rx="12" fill="#e4ebfb" fillOpacity=".4" stroke="#cad7f0" strokeOpacity=".45" />
      <rect x="1168" y="76" width="360" height="690" rx="12" fill="#edf2fd" fillOpacity=".6" stroke="#cad7f0" strokeOpacity=".55" />
      <rect x="1146" y="98" width="360" height="690" rx="12" fill={`url(#${id}-paper)`} stroke={`url(#${id}-paperline)`} />
      {Array.from({ length: 17 }, (_, index) => <path key={index} d={`M1180 ${165 + index * 31}H1465`} stroke="#8ea6d8" strokeOpacity={index % 4 === 0 ? .31 : .15} strokeWidth={index % 4 === 0 ? 1.2 : .7} />)}
      <path d="M1176 131h20m-10-10v20M1468 750h20m-10-10v20" stroke="#6889cd" strokeOpacity=".48" />
    </g>
    <g className="atmosphere-paper-rule" stroke="#8ea6d8" strokeOpacity=".23">
      <path d="M-40 175H135V800M-40 195H114V800" />
      {Array.from({ length: 23 }, (_, index) => <path key={index} d={`M${index % 5 === 0 ? 118 : 126} ${220 + index * 24}H135`} />)}
      <circle cx="135" cy="175" r="4" fill="#5f85ce" fillOpacity=".36" />
    </g>
  </svg>;
}

const folds = Array.from({ length: 25 }, (_, index) => {
  const y = -180 + index * 49;
  return `M1540 ${y}C1150 ${y - 85} 1035 ${375 + index * 4.3} 700 ${460 + index * 5.6}S420 ${460 + index * 11} 260 ${640 + index * 15}`;
});

function Converge({ id }: SceneProps) {
  return <svg focusable="false" className="section-atmosphere-svg atmosphere-converge-svg" viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none">
    <defs>
      <linearGradient id={`${id}-fold`} x1="420" y1="720" x2="1430" y2="150" gradientUnits="userSpaceOnUse"><stop stopColor="#5876cc" stopOpacity="0" /><stop offset=".45" stopColor="#6f8bdf" stopOpacity=".3" /><stop offset="1" stopColor="#b2c4ff" stopOpacity=".5" /></linearGradient>
      <linearGradient id={`${id}-foldwash`} x1="1100" y1="250" x2="950" y2="750" gradientUnits="userSpaceOnUse"><stop stopColor="#5877e0" stopOpacity=".24" /><stop offset="1" stopColor="#4662ac" stopOpacity="0" /></linearGradient>
    </defs>
    <g className="atmosphere-fold-field">
      <path d="M1510-150C1130-100 1100 310 840 440S640 700 520 880H1510Z" fill={`url(#${id}-foldwash)`} />
      <g stroke={`url(#${id}-fold)`} strokeWidth="1">{folds.map((line, index) => <path key={index} d={line} strokeWidth={index % 5 === 0 ? 1.5 : .75} />)}</g>
      <g stroke="#a9bbff" strokeOpacity=".12" strokeWidth=".8">{Array.from({ length: 19 }, (_, index) => <path key={index} d={`M${655 + index * 50} -120C${1000 + index * 14} 180 ${610 + index * 36} 500 ${690 + index * 39} 970`} />)}</g>
      <path className="atmosphere-signal atmosphere-converge-signal" d={folds[11]} stroke="#c0ceff" strokeWidth="2.2" pathLength="1" />
    </g>
  </svg>;
}

/** Decorative geometry only: it never represents platform scores or user activity. */
export default function SectionAtmosphere({ variant, paused = false }: { variant: AtmosphereVariant; paused?: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const id = `atmosphere-${useId().replace(/:/g, "")}`;
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const element = sceneRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(element);
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", updateVisibility); };
  }, []);

  return <div ref={sceneRef} aria-hidden="true" className={`section-atmosphere section-atmosphere-${variant}`} data-running={visible && pageVisible && !paused}>
    {variant === "atlas" && <Atlas id={id} />}
    {variant === "path" && <Path id={id} />}
    {variant === "orbit" && <Orbit id={id} />}
    {variant === "paper" && <Paper id={id} />}
    {variant === "converge" && <Converge id={id} />}
  </div>;
}
