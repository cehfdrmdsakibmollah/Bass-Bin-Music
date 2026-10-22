import type {MetadataRoute} from 'next';
import {SITE_URL,validUrl} from '@/lib/site';
import {templates} from '@/lib/templates';
export default function sitemap():MetadataRoute.Sitemap{
  if(!validUrl)return [];
  return ['/','/features','/templates','/music','/guides/phonk-visualizer','/guides/beat-sync-phonk-video','/guides/auto-director-phonk-editor',...templates.map(t=>`/templates/${t.slug}`)].map((path)=>({url:`${SITE_URL}${path==='/'?'':path}`,changeFrequency:'monthly' as const,priority:path==='/'?1:path==='/templates'?.8:.6}));
}
