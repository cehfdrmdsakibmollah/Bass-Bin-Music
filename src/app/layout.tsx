import type {Metadata,Viewport} from 'next';
import './globals.css';
import {BRAND,SITE_URL,validUrl} from '@/lib/site';
export const metadata:Metadata={
  metadataBase:new URL(SITE_URL),
  title:{default:'BASS BIN MUSIC — Free Phonk Video & Audio Visualizer Maker',template:'%s | BASS BIN MUSIC'},
  description:'Create phonk music visualizer videos with reactive spectra, editable neon effects, templates and local browser export. Free, creator-first and mobile friendly.',
  applicationName:BRAND,
  alternates:{canonical:'/'},
  robots:validUrl?{index:true,follow:true}:{index:false,follow:false},
  openGraph:{type:'website',siteName:BRAND,title:'BASS BIN MUSIC — Create Your Frequency',description:'Free-first phonk video maker and music visualizer studio.',images:[{url:'/bass-bin-logo.png',width:1080,height:1080,alt:'BASS BIN MUSIC original neon logo'}]},
  twitter:{card:'summary_large_image',title:BRAND,images:['/bass-bin-logo.png']}
};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#090b16'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
