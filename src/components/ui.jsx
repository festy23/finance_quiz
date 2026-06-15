/* components/ui.jsx — icons + shared UI primitives. ESM module. */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { QData } from '../lib/quiz.js'

/* ---------- icons (stroke, 18px default) ---------- */
export const Ico = ({d, size=18, fill=false, sw=1.8, children, ...p}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill?"currentColor":"none"}
    stroke={fill?"none":"currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children || <path d={d}/>}
  </svg>
);
export const I = {
  home:   (p)=><Ico {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></Ico>,
  play:   (p)=><Ico {...p}><polygon points="6 4 19 12 6 20 6 4"/></Ico>,
  exam:   (p)=><Ico {...p}><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></Ico>,
  bolt:   (p)=><Ico {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></Ico>,
  repeat: (p)=><Ico {...p}><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></Ico>,
  chart:  (p)=><Ico {...p}><path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 4-5"/></Ico>,
  history:(p)=><Ico {...p}><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 106 5.3L3 8"/><path d="M12 7v5l3 2"/></Ico>,
  trophy: (p)=><Ico {...p}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z"/><path d="M5 4H3v2a3 3 0 003 3M19 4h2v2a3 3 0 01-3 3"/></Ico>,
  user:   (p)=><Ico {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0114 0v1"/></Ico>,
  flame:  (p)=><Ico {...p}><path d="M12 2c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 1.5-4 .5 2 1.5 2 1.5 2 0-3 1-6 2-8z"/></Ico>,
  target: (p)=><Ico {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></Ico>,
  check:  (p)=><Ico {...p}><path d="M20 6L9 17l-5-5"/></Ico>,
  x:      (p)=><Ico {...p}><path d="M18 6L6 18M6 6l12 12"/></Ico>,
  arrowR: (p)=><Ico {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Ico>,
  arrowL: (p)=><Ico {...p}><path d="M19 12H5M11 18l-6-6 6-6"/></Ico>,
  chevR:  (p)=><Ico {...p}><path d="M9 6l6 6-6 6"/></Ico>,
  book:   (p)=><Ico {...p}><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-4 2V5z"/><path d="M4 19a2 2 0 012-2h13"/></Ico>,
  layers: (p)=><Ico {...p}><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/></Ico>,
  spark:  (p)=><Ico {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></Ico>,
  clock:  (p)=><Ico {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ico>,
  grid:   (p)=><Ico {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Ico>,
  logout: (p)=><Ico {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></Ico>,
  settings:(p)=><Ico {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.1A1.6 1.6 0 005 19.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 003 14a2 2 0 010-4h.1A1.6 1.6 0 004.6 5L4.5 5a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 0010 3.6V3a2 2 0 014 0v.1a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V10a2 2 0 010 4z" sw={1.4}/></Ico>,
  desktop:(p)=><Ico {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></Ico>,
  mobile: (p)=><Ico {...p}><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></Ico>,
  lock:   (p)=><Ico {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></Ico>,
  mail:   (p)=><Ico {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></Ico>,
  trend:  (p)=><Ico {...p}><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></Ico>,
  brain:  (p)=><Ico {...p}><path d="M12 5a3 3 0 00-6 0 3 3 0 00-2 5 3 3 0 002 5 3 3 0 006 0V5z"/><path d="M12 5a3 3 0 016 0 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-6 0"/></Ico>,
  filter: (p)=><Ico {...p}><path d="M3 4h18l-7 8v6l-4 2v-8L3 4z"/></Ico>,
  star:   (p)=><Ico {...p}><path d="M12 2l2.9 6.3 6.8.8-5 4.6 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8-5-4.6 6.8-.8L12 2z"/></Ico>,
};

/* ---------- primitives ---------- */
export function Logo({size=30}){
  return (
    <div className="brand-mark" style={{width:size,height:size,flex:`0 0 ${size}px`}}>
      <svg width={size*.58} height={size*.58} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l5-6 4 3 5-8"/><path d="M16 6h5v5"/>
      </svg>
    </div>
  );
}
export function Chip({children,color,bg,style}){
  return <span className="chip" style={{color:color||'var(--tx-2)',background:bg||'var(--panel-3)',...style}}>{children}</span>;
}
export function TopicChip({topic,small}){
  const t = QData.topic(topic);
  return <span className="chip" style={{background:'var(--glass-2)',color:'var(--tx-2)',border:'1px solid var(--border)',...(small?{height:21,fontSize:10.5,padding:'0 8px'}:null)}}>
    <span className="badge-dot" style={{background:t.color,width:6,height:6,boxShadow:`0 0 6px ${t.color}`}}/>{small?t.short:t.name}</span>;
}
export function Pbar({val,color='var(--ac)',h=6}){
  return <div className="pbar" style={{height:h}}><i style={{width:`${Math.max(0,Math.min(100,val))}%`,background:color}}/></div>;
}
export function Btn({variant='sec',lg,block,icon,children,...p}){
  const cls = `btn btn-${variant}${lg?' btn-lg':''}${block?' btn-block':''}`;
  return <button className={cls} {...p}>{icon}{children}</button>;
}
export function Stat({val,label,color,sub}){
  return (
    <div>
      <div className="stat-val" style={{color:color||'var(--tx)'}}>{val}</div>
      <div className="stat-lbl">{label}{sub && <span style={{color:'var(--tx-3)'}}> · {sub}</span>}</div>
    </div>
  );
}
export function Ring({pct,size=64,sw=6,color='var(--ac)',label}){
  const r=(size-sw)/2, c=2*Math.PI*r, off=c*(1-pct/100);
  return (
    <div style={{position:'relative',width:size,height:size}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--panel-3)" strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{transition:'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)'}}/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',fontFamily:'var(--fm)',fontWeight:600,fontSize:size*.24}}>
        {label!==undefined?label:`${Math.round(pct)}%`}
      </div>
    </div>
  );
}

/* mini sparkline */
export function Spark({data,w=120,h=34,color='var(--ac)',fill=true}){
  if(!data||data.length<2) return null;
  const mn=Math.min(...data), mx=Math.max(...data), rng=mx-mn||1;
  const pts=data.map((v,i)=>[i/(data.length-1)*w, h-((v-mn)/rng)*(h-6)-3]);
  const d=pts.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area=`${d} L${w} ${h} L0 ${h} Z`;
  const gid='sg'+Math.random().toString(36).slice(2,7);
  return (
    <svg width={w} height={h} style={{display:'block'}}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity=".28"/><stop offset="1" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      {fill && <path d={area} fill={`url(#${gid})`}/>}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* bar chart (vertical) */
export function Bars({data,h=120,gap=6,labels,colorFn}){
  const mx=Math.max(...data.map(d=>typeof d==='object'?d.v:d),1);
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap,height:h}}>
      {data.map((d,i)=>{const v=typeof d==='object'?d.v:d; const c=colorFn?colorFn(v,i):(typeof d==='object'?d.c:'var(--ac)');
        return (
        <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:6,height:'100%',justifyContent:'flex-end'}}>
          <div title={labels?labels[i]:''} style={{width:'100%',maxWidth:34,height:`${v/mx*100}%`,minHeight:3,background:c,borderRadius:'5px 5px 2px 2px',transition:'height .5s cubic-bezier(.4,0,.2,1)'}}/>
          {labels && <div style={{fontSize:10,color:'var(--tx-3)',fontFamily:'var(--fm)'}}>{labels[i]}</div>}
        </div>);
      })}
    </div>
  );
}
