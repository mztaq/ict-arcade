import React from "react";
import {ArrowLeft,ArrowRight,ArrowUpRight,FolderOpen,FileText,FileArchive,CalendarDays,CalendarCheck2,ClipboardCheck,BookOpen} from "lucide-react";

export const years = Array.from({length:10},(_,i)=>2026-i);
const root="#/past-papers/yearly";
const host="https://pastpapers.papacambridge.com";
const upload=host+"/directories/CAIE/CAIE-pastpapers/upload/";
const labels={m:"February / March",s:"May / June",w:"October / November"};
export const folders=[["qp","Question Papers"],["ms","Mark Schemes"],["er","Examiner Reports"],["sf","Source Files"]];
export function seriesFor(year){
  if(!years.includes(year))return [];
  return (year===2026?["s","m"]:["w","s","m"]).map(id=>({
    id,label:labels[id]
  }));
}
// Public file names confirmed against PapaCambridge's catalogue. No document bytes are stored.
const indexed={
  "2026-m":{qp:["12","21","31"],ms:["12","21","31"],er:true,sf:["21","31"]},
  "2026-s":{qp:["11","12","13","21","22","31","32"],ms:["11","12","13","21","22","31","32"],sf:["21","22","31","32"]},
  "2025-m":{qp:["12","21","31"],ms:["12","21","31"],er:true,sf:["21","31"]},
  "2025-s":{qp:["11","12","13","21","22","31","32"],ms:["11","12","13","21","22","31","32"],er:true,sf:["21","22","31","32"]},
  "2025-w":{qp:["11","12","13","02","03"],ms:["11","12","13","2","3"],sf:["02","03"]},
  "2024-s":{qp:["11","12","13","21","22","31","32"],ms:["11","12","13","21","22","31","32"],sf:["21","22","31","32"]},
  "2024-w":{qp:["11","12","13","02","03"],ms:["11","12","13","2","3"],sf:["02","03"]}
};
export function filesFor(year,series,folder){
  const entry=indexed[year+"-"+series];
  if(!entry||!folders.some(([id])=>id===folder))return [];
  const ids=folder==="er"?(entry.er?[""]:[]):entry[folder]||[];
  return ids.map(id=>{
    const name="0417_"+series+String(year).slice(-2)+"_"+folder+(id?"_"+id:"")+(folder==="sf"?".zip":".pdf");
    const title=folder==="er"?"Examiner report":id.length===1||id.startsWith("0")?"Paper "+Number(id):"Paper "+id[0]+" · Variant "+id[1];
    const url=upload+name;
    return {name,title,url:folder==="sf"?host+"/papers/caie/download_file.php?files="+encodeURIComponent(url):url};
  });
}
export function PapaPapers({year,series,folder}){
  const exam=seriesFor(year).find(item=>item.id===series);
  const type=folders.find(([id])=>id===folder);
  const yearRoute=root+"/"+year;
  const seriesRoute=yearRoute+"/"+series;
  const back=type&&exam?seriesRoute:exam?root:"#/past-papers";
  const title=type&&exam?type[1]:exam?year+" · "+exam.label:"Yearly Past Papers";
  const files=exam&&type?filesFor(year,series,folder):[];
  return <section className="papa-browser">
    <div className="page-title papa-heading"><div><h1>{title}</h1><p>{type&&exam?year+" · "+exam.label:exam?"Choose a document folder":"Choose an examination series · 2017–2026"}</p></div><div className="title-action"><a className="chapter-back-button" href={back}><ArrowLeft size={16}/> Back</a></div></div>
    {!exam?<div className="papa-year-groups">{years.map(item=><section className="papa-year-group" key={item} aria-labelledby={"year-"+item}>
      <div className="papa-year-group-heading"><span className="papa-icon"><CalendarDays size={22}/></span><h2 id={"year-"+item}>{item}</h2><small>{seriesFor(item).length} examination series</small></div>
      <div className="papa-series-grid" style={{"--series-count":seriesFor(item).length}}>{seriesFor(item).slice().reverse().map(entry=><a className="papa-series-link" key={entry.id} href={root+"/"+item+"/"+entry.id}><CalendarCheck2 size={19} aria-hidden="true"/><span>{entry.label}</span><ArrowRight size={17} aria-hidden="true"/></a>)}</div>
    </section>)}</div>:
      !type?<div className="paper-year-grid papa-list">{folders.map(([id,label])=><a className="paper-year" key={id} href={seriesRoute+"/"+id}><span className="papa-icon">{id==="qp"?<FileText size={22}/>:id==="ms"?<ClipboardCheck size={22}/>:id==="er"?<BookOpen size={22}/>:<FileArchive size={22}/>}</span><strong>{label}</strong><ArrowRight size={18}/></a>)}</div>:
      <div className="paper-year-grid papa-list">{files.map(file=><a className="paper-year papa-file" key={file.name} href={file.url} target="_blank" rel="noopener noreferrer"><span className="papa-icon">{folder==="sf"?<FileArchive size={22}/>:<FileText size={22}/>}</span><span style={{minWidth:0,overflowWrap:"anywhere"}}><strong>{file.title}</strong><small style={{display:"block"}}>{file.name}</small></span><ArrowUpRight size={18}/></a>)}
      {!files.length&&<div className="paper-empty"><p>No individual links indexed for this folder yet.</p></div>}
      </div>}
  </section>;
}
