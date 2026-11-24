import React from "react";
import {ArrowUpRight, Download, FileArchive, FileText} from "lucide-react";

// Embedded PDFs remain on the ICT Arcade origin. Source files never enter the viewer.
export default function PaperViewer({title, documents, sourceFiles = [], selectedKind, routePrefix}) {
  const available = documents.filter(item=>Boolean(item.url));
  const active = available.find(item=>item.key===selectedKind) || available[0];

  return <div className="paper-viewer">
    <nav className="paper-document-tabs" aria-label="Paper documents">
      {documents.map(item=>item.url ?
        <a key={item.key} href={routePrefix+"/"+item.key}
          className={"paper-document-tab "+(active?.key===item.key?"active":"")}
          aria-current={active?.key===item.key?"page":undefined}>
          {item.label}
        </a> :
        <span key={item.key} className="paper-document-tab unavailable"
          aria-label={item.label+" not uploaded"}>{item.label}<small>Unavailable</small></span>
      )}
    </nav>
    {active ? <section className="paper-preview-panel" aria-label={active.label+" preview"}>
      <div className="paper-preview-toolbar">
        <strong>{active.label}</strong>
        <div className="paper-preview-actions">
          <a className="secondary-action" href={active.url} target="_blank" rel="noopener noreferrer">
            Open PDF <ArrowUpRight size={17} aria-hidden="true"/>
          </a>
          <a className="primary-action" href={active.url} download>
            <Download size={17} aria-hidden="true"/> Download
          </a>
        </div>
      </div>
      <iframe className="paper-pdf-frame" src={active.url} title={title+" · "+active.label}
        loading="lazy"/>
      <p className="paper-preview-fallback">PDF preview unavailable in your browser? Use Open PDF or Download.</p>
    </section> :
    <div className="paper-empty"><FileText size={29} strokeWidth={1.6} aria-hidden="true"/>
      <p>No PDF files uploaded for this paper yet.</p></div>}
    {sourceFiles.length>0 && <section className="paper-source-files">
      <h2>Source files</h2>
      <div className="paper-source-list">
        {sourceFiles.map(file=><a key={file.url} href={file.url} download
          className="paper-source-file">
          <FileArchive size={21} strokeWidth={1.7} aria-hidden="true"/>
          <span>{file.title}</span>
          <Download size={19} aria-hidden="true"/>
        </a>)}
      </div>
    </section>}
  </div>;
}
