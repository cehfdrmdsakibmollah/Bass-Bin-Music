'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {listProjects,removeProject} from '@/lib/storage';
import type {StudioProject} from '@/lib/types';
export default function Dashboard(){
  const [projects,setProjects]=useState<StudioProject[]>([]);
  const [status,setStatus]=useState('Loading browser projects…');
  useEffect(()=>{void listProjects().then(p=>{setProjects(p);setStatus('')}).catch(()=>setStatus('Could not access browser storage. Check your browser privacy or storage settings.'))},[]);
  async function deleteProject(p:StudioProject){
    if(!confirm(`Delete project “${p.name}” from this browser? This action cannot be undone.`))return;
    try{await removeProject(p.id);setProjects(items=>items.filter(x=>x.id!==p.id));if(localStorage.getItem('bbm-last-project')===p.id)localStorage.removeItem('bbm-last-project');}
    catch{setStatus('Delete failed. Please check browser permissions.');}
  }
  return <div><div className="kicker">LOCAL CREATOR WORKSPACE</div><h1>My <span className="neon-text">projects.</span></h1><p className="page-lead">Your saved projects are in this browser&apos;s IndexedDB, not synced to the cloud. Clearing site data or switching devices can remove access to them.</p>
    {status&&<p role="status" className="help-fine">{status}</p>}
    {projects.length?<div className="project-list">{projects.map(p=><div className="project-row" key={p.id}><div><b>{p.name}</b><small>{p.template} · {p.settings.aspect} · {p.tracks.length} layers · edited {new Date(p.updatedAt).toLocaleString()}</small></div><div className="project-row-actions"><Link href={`/studio?id=${encodeURIComponent(p.id)}`} className="btn primary tiny">Open project ↗</Link><button className="btn outline tiny danger" onClick={()=>void deleteProject(p)}>Delete</button></div></div>)}</div>:!status&&<div className="empty-state"><span>♫</span><h2>No saved projects yet</h2><p>Your first studio session will autosave to this device.</p><Link href="/studio" className="btn primary">Create a project ↗</Link></div>}
    <p className="help-fine" style={{marginTop:30}}>Back up editable project settings with Studio → Save JSON. JSON backups do not contain the uploaded audio or image files.</p>
  </div>;
}
