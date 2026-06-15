/* components/charts.jsx — TradingView Lightweight Charts wrapper + synthetic OHLC generators.
   Exports: TVChart, genCandles, anchorsToCloses, seededRand, volFromCandles */
import React, { useRef, useEffect } from 'react'
import { createChart } from 'lightweight-charts'

/* deterministic PRNG so charts are stable across renders */
export function seededRand(seed){ let s=seed>>>0||1; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }

/* turn a set of [t,price] anchors (0..1 normalized t) into a close series of length n */
export function anchorsToCloses(anchors, n, vol=0.6, seed=7){
  const rnd=seededRand(seed); const out=[];
  for(let i=0;i<n;i++){
    const t=i/(n-1);
    // piecewise-linear interp between anchors
    let p=anchors[0][1];
    for(let a=0;a<anchors.length-1;a++){
      const [t0,p0]=anchors[a], [t1,p1]=anchors[a+1];
      if(t>=t0 && t<=t1){ const k=(t-t0)/((t1-t0)||1); p=p0+(p1-p0)*(k); break; }
      if(t>t1) p=p1;
    }
    const noise=(rnd()-0.5)*vol*(anchors[1]?Math.abs(anchors[1][1]-anchors[0][1])*0.18+vol:vol);
    out.push(p+noise);
  }
  return out;
}

/* build candle objects from a close series */
export function genCandles(closes, {seed=11, startDate='2024-01-01', wick=0.6}={}){
  const rnd=seededRand(seed); const data=[]; let d=new Date(startDate);
  for(let i=0;i<closes.length;i++){
    const close=closes[i];
    const open=i===0?close*(1-(rnd()-0.5)*0.01):closes[i-1]+(close-closes[i-1])*(0.15+rnd()*0.2);
    const body=Math.abs(close-open);
    const span=Math.max(body, close*0.004) + (rnd()*wick*0.6+0.2)*Math.max(body,close*0.006);
    const hi=Math.max(open,close)+(rnd()*0.6+0.1)*span;
    const lo=Math.min(open,close)-(rnd()*0.6+0.1)*span;
    const dt=new Date(d); dt.setDate(d.getDate()+i);
    data.push({time:Math.floor(dt.getTime()/1000), open:+open.toFixed(2), high:+hi.toFixed(2), low:+lo.toFixed(2), close:+close.toFixed(2)});
  }
  return data;
}
export function volFromCandles(candles, seed=23){
  const rnd=seededRand(seed);
  return candles.map(c=>({time:c.time, value:Math.round((Math.abs(c.close-c.open)*40+rnd()*60+20)),
    color: c.close>=c.open?'rgba(38,166,154,.5)':'rgba(239,83,80,.5)'}));
}

/* ---- React wrapper around Lightweight Charts ---- */
export function TVChart({candles, height=300, lines=[], volume=false, markers=[], priceLines=[], fit=true, autosize=true, seriesType='candle'}){
  const ref=useRef(null); const chartRef=useRef(null); const seriesRef=useRef(null);
  useEffect(()=>{
    if(!ref.current) return;
    const chart=createChart(ref.current,{
      height, autoSize:autosize,
      layout:{ background:{type:'solid',color:'transparent'}, textColor:'#8a8a93', fontFamily:"'IBM Plex Mono', monospace", fontSize:11 },
      grid:{ vertLines:{color:'rgba(255,255,255,.04)'}, horzLines:{color:'rgba(255,255,255,.05)'} },
      rightPriceScale:{ borderColor:'rgba(255,255,255,.08)' },
      timeScale:{ borderColor:'rgba(255,255,255,.08)', timeVisible:false, secondsVisible:false },
      crosshair:{ mode:1, vertLine:{color:'rgba(255,255,255,.2)',labelBackgroundColor:'#3b76ff'}, horzLine:{color:'rgba(255,255,255,.2)',labelBackgroundColor:'#3b76ff'} },
      handleScroll:false, handleScale:false,
    });
    chartRef.current=chart;
    let cs;
    if(seriesType==='line'){
      cs=chart.addLineSeries({ color:'#3b76ff', lineWidth:2, priceLineVisible:false });
      cs.setData(candles.map(c=>({time:c.time, value:c.close})));
    } else if(seriesType==='area'){
      cs=chart.addAreaSeries({ lineColor:'#3b76ff', topColor:'rgba(59,118,255,.4)', bottomColor:'rgba(59,118,255,0)', lineWidth:2, priceLineVisible:false });
      cs.setData(candles.map(c=>({time:c.time, value:c.close})));
    } else if(seriesType==='bars'){
      cs=chart.addBarSeries({ upColor:'#2ebd9c', downColor:'#f0616d', thinBars:false });
      cs.setData(candles);
    } else {
      cs=chart.addCandlestickSeries({ upColor:'#2ebd9c', downColor:'#f0616d', borderUpColor:'#2ebd9c', borderDownColor:'#f0616d', wickUpColor:'#2ebd9c', wickDownColor:'#f0616d' });
      cs.setData(candles);
    }
    seriesRef.current=cs;
    if(volume){
      const vs=chart.addHistogramSeries({ priceFormat:{type:'volume'}, priceScaleId:'' });
      vs.priceScale().applyOptions({ scaleMargins:{top:0.82,bottom:0} });
      vs.setData(volFromCandles(candles));
    }
    lines.forEach(ln=>{
      const ls=chart.addLineSeries({ color:ln.color||'#3b76ff', lineWidth:ln.width||2, lineStyle:ln.dashed?2:0, priceLineVisible:false, lastValueVisible:false, crosshairMarkerVisible:false });
      ls.setData(ln.data);
    });
    if(priceLines.length){
      priceLines.forEach(pl=> cs.createPriceLine({ price:pl.price, color:pl.color||'#787b86', lineWidth:1, lineStyle:pl.dashed?2:0, axisLabelVisible:true, title:pl.title||'' }));
    }
    if(markers.length) cs.setMarkers(markers);
    if(fit) chart.timeScale().fitContent();
    const ro=new ResizeObserver(()=>{ try{chart.timeScale().fitContent();}catch(e){} });
    ro.observe(ref.current);
    return ()=>{ ro.disconnect(); chart.remove(); };
  },[JSON.stringify(candles), height, JSON.stringify(lines), volume, JSON.stringify(markers), JSON.stringify(priceLines), seriesType]);
  return <div ref={ref} style={{width:'100%',height}}/>;
}
