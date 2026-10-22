'use client';
import {useEffect,useState} from 'react';
type RecordLink={id:string,title:string,url:string,platform:string};
const STORAGE='bbm-music-links';
function source(url:string){
  const u=new URL(url);
  if(u.protocol!=='https:')throw Error('Only secure HTTPS links are accepted.');
  const h=u.hostname.toLowerCase().replace(/^www\./,'');
  if(h==='youtube.com'||h==='youtu.be'||h==='music.youtube.com')return 'YouTube';
  if(h==='soundcloud.com')return 'SoundCloud';
  if(h==='audiomack.com')return 'Audiomack';
  if(h==='audio.com')return 'Audio.com';
  throw Error('Use a public YouTube, SoundCloud, Audiomack or Audio.com link.');
}
function embed(url:string):string|null{
  try{const u=new URL(url),h=u.hostname.toLowerCase().replace(/^www\./,'');let id='';
    if(h==='youtu.be')id=u.pathname.split('/')[1]||'';
    if(h==='youtube.com'||h==='music.youtube.com')id=u.searchParams.get('v')||(/\/shorts\/([\w-]+)/.exec(u.pathname)?.[1]||'');
    return /^[\w-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}`:null;
  }catch{return null}
}
export default function MusicHub(){
  const [links,setLinks]=useState<RecordLink[]>([]);
  const [title,setTitle]=useState('');const [url,setUrl]=useState('');const [query,setQuery]=useState('');const [error,setError]=useState('');
  useEffect(()=>{try{const value=JSON.parse(localStorage.getItem(STORAGE)||'[]') as RecordLink[];if(Array.isArray(value))setLinks(value.filter(x=>{try{return !!x&&typeof x.url==='string'&&typeof x.title==='string'&&x.title.length<=100&&!!source(x.url)}catch{return false}}).slice(0,100))}catch{/* bad local entries ignored */}},[]);
  const update=(items:RecordLink[])=>{setLinks(items);try{localStorage.setItem(STORAGE,JSON.stringify(items))}catch{setError('Local storage is unavailable.')}};
  const add=()=>{try{if(!title.trim()||title.length>100)throw Error('Add a title (up to 100 characters).');if(links.length>=100)throw Error('Link limit reached (100).');const platform=source(url);update([{id:crypto.randomUUID(),title:title.trim(),url,platform},...links]);setUrl('');setTitle('');setError('');}catch(e){setError(e instanceof Error?e.message:'Invalid URL')}};
  const filtered=links.filter(x=>`${x.title} ${x.platform}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="kicker">YOUR FAVORITE RELEASE LINKS</div><h1>The music <span className="neon-text">hub.</span></h1><p className="page-lead">Build a private collection of links to music you created or have permission to share. These links stay in your browser; this tool does not download or extract third-party music.</p>
    <div className="how-to-panel"><h2>Add an official release link</h2><p>Supports YouTube, SoundCloud, Audiomack and Audio.com. Direct YouTube videos can be played with YouTube&apos;s privacy-enhanced embed.</p><form className="music-form" onSubmit={e=>{e.preventDefault();add()}}><input value={title} aria-label="Music title" onChange={e=>setTitle(e.target.value)} placeholder="Song or release title" maxLength={100} required/><input type="url" value={url} onChange={e=>setUrl(e.target.value)} aria-label="Music link" placeholder="https://youtube.com/watch?v=…" required/><button type="submit" className="btn primary">Add release</button></form>{error&&<p role="alert" className="help-fine">{error}</p>}</div>
    <div style={{margin:'40px 0 20px'}}><label className="field" style={{maxWidth:420}}>Search your saved links<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by title or platform…" /></label></div>
    {filtered.length?<div className="music-list">{filtered.map(l=><article className="music-row" key={l.id}><div><b>{l.title}</b><small>{l.platform}</small>{embed(l.url)&&<div style={{marginTop:12}}><iframe title={`YouTube player for ${l.title}`} width="290" height="164" loading="lazy" src={embed(l.url)||undefined} allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" style={{border:0,maxWidth:'100%',borderRadius:9}}/></div>}</div><div className="project-row-actions"><a className="btn outline tiny" href={l.url} target="_blank" rel="noopener noreferrer">Open official link ↗</a><button className="btn outline tiny danger" onClick={()=>update(links.filter(x=>x.id!==l.id))}>Remove</button></div></article>)}</div>:<div className="empty-state"><span>♪</span><h2>{query?'No matches':'No releases added yet'}</h2><p>Add a permitted streaming link above to organize your music collection.</p></div>}
  </>;
}
