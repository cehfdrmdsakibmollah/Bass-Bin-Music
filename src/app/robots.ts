import type {MetadataRoute} from 'next';
import {SITE_URL,validUrl} from '@/lib/site';
export default function robots():MetadataRoute.Robots{
  if(!validUrl)return {rules:{userAgent:'*',disallow:'/'} };
  return {rules:{userAgent:'*',allow:'/',disallow:['/studio','/dashboard','/publish']},sitemap:`${SITE_URL}/sitemap.xml`};
}
