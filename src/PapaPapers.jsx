import React from "react";
import {ArrowLeft,ArrowRight,ArrowUpRight,FolderOpen,FileText,FileArchive} from "lucide-react";

export const years = Array.from({length:10},(_,i)=>2026-i);
const root="#/past-papers/yearly";
const host="https://pastpapers.papacambridge.com";
const archive=host+"/papers/caie/igcse-ict0417";
const upload=host+"/directories/CAIE/CAIE-pastpapers/upload/";
const labels={m:"February / March",s:"May / June",w:"October / November"};
export const folders=[["qp","Question Papers"],["ms","Mark Schemes"],["er","Examiner Reports"],["sf","Source Files"]];
export function seriesFor(year){
  if(!years.includes(year))return [];
  return (year===2026?["s","m"]:["w","s","m"]).map(id=>({
    id,label:labels[id],url:archive+"-"+year+"-"+(year===2017?{m:"mar",s:"jun",w:"nov"}[id]:year===2022&&id==="m"?"feb-march":{m:"march",s:"may-june",w:"oct-nov"}[id])
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
  const validYear=years.includes(year);
  const exam=seriesFor(year).find(item=>item.id===series);
  const type=folders.find(([id])=>id===folder);
  const yearRoute=root+"/"+year;
  const seriesRoute=yearRoute+"/"+series;
  const back=type&&exam?seriesRoute:exam?yearRoute:validYear?root:"#/past-papers";
  const title=type&&exam?type[1]:exam?year+" · "+exam.label:validYear?"Past Papers "+year:"Yearly Past Papers";
  const files=exam&&type?filesFor(year,series,folder):[];
  return <>
    <div className="page-title"><div><h1>{title}</h1><p>{type&&exam?year+" · "+exam.label:exam?"Choose a document folder":validYear?"Choose an examination series":"Choose a year · 2017–2026"}</p></div><div className="title-action"><a className="chapter-back-button" href={back}><ArrowLeft size={16}/> Back</a></div></div>
    {!validYear?<div className="paper-year-grid">{years.map(item=><a className="paper-year" key={item} href={root+"/"+item}><strong>{item}</strong><ArrowRight size={18}/></a>)}</div>:
      !exam?<div className="paper-year-grid">{seriesFor(year).map(item=><a className="paper-year" key={item.id} href={yearRoute+"/"+item.id}><strong>{item.label}</strong><ArrowRight size={18}/></a>)}</div>:
      !type?<div className="paper-year-grid">{folders.map(([id,label])=><a className="paper-year" key={id} href={seriesRoute+"/"+id}><FolderOpen size={22}/><strong>{label}</strong><ArrowRight size={18}/></a>)}</div>:
      <div className="paper-year-grid">{files.map(file=><a className="paper-year papa-file" key={file.name} href={file.url} target="_blank" rel="noopener noreferrer">{folder==="sf"?<FileArchive size={22}/>:<FileText size={22}/>}<span style={{minWidth:0,overflowWrap:"anywhere"}}><strong>{file.title}</strong><small style={{display:"block"}}>{file.name}</small></span><ArrowUpRight size={18}/></a>)}
      {!files.length&&<div className="paper-empty"><p>No individual links indexed for this folder yet.</p></div>}
      <a className="paper-year" href={exam.url} target="_blank" rel="noopener noreferrer"><strong>Browse series on PapaCambridge</strong><ArrowUpRight size={18}/></a></div>}
  </>;
}
