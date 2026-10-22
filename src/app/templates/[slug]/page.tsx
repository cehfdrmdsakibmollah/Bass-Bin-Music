import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import {templates} from '@/lib/templates';
import {SITE_URL} from '@/lib/site';
export function generateStaticParams(){return templates.map(t=>({slug:t.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params,t=templates.find(t=>t.slug===slug);
  if(!t)return {title:'Template not found',robots:{index:false}};
  return {title:`${t.name} — Free Editable Visualizer Template`,description:t.description+ ' Customize and export your own phonk video in BASS BIN MUSIC.',alternates:{canonical:`/templates/${slug}`}};
}
export default async function TemplateDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,t=templates.find(t=>t.slug===slug);if(!t)notFound();
  const schema={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":SITE_URL},{"@type":"ListItem","position":2,"name":"Templates","item":`${SITE_URL}/templates`},{"@type":"ListItem","position":3,"name":t.name,"item":`${SITE_URL}/templates/${slug}`}]};
  return <><SiteHeader/><main className="page-main container"><nav aria-label="Breadcrumbs" className="breadcrumb"><Link href="/">Home</Link> / <Link href="/templates">Templates</Link> / {t.name}</nav><div className="detail-hero"><div><div className="kicker">{t.category.toUpperCase()} / PHONK CREATOR</div><h1>{t.name}</h1><p className="page-lead">{t.description}</p><h2>What you can customize</h2><p>Replace the music, select one of four live audio-reactive modes, change neon accents, tune intensity and glow, adjust text, trim timeline layers and export in a supported browser format.</p><Link href={`/studio?template=${slug}`} className="btn primary big">Use this free template ↗</Link></div><div className="detail-art" style={{background:`radial-gradient(circle at center,${t.colors[0]}44,transparent 58%),linear-gradient(135deg,${t.colors[1]}34,#0a0c18)`}}><span className="detail-ring" style={{borderColor:t.colors[0],boxShadow:`0 0 46px ${t.colors[0]}88`}}>♫</span></div></div><div className="detail-guide"><h2>How to make a {t.name} video</h2><p>Open the studio with this preset. Import music you own or have permission to use. Optionally add an image, adjust spectrum and overlay settings, then export the composition to your device. Exported formats depend on browser support.</p><Link className="subtle-link" href="/guides/phonk-visualizer">Read the complete visualizer guide ↗</Link></div></main><SiteFooter/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/></>;
}
