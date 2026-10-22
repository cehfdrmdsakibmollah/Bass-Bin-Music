import type {Metadata} from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import MusicHub from '@/components/MusicHub';
export const metadata:Metadata={title:'Music Hub — Save & Explore Release Links',description:'Keep your own phonk releases and permitted YouTube, SoundCloud, Audiomack and Audio.com links together in a private browser music hub.',alternates:{canonical:'/music'}};
export default function MusicPage(){return <><SiteHeader/><main className="page-main container"><MusicHub/></main><SiteFooter/></>}
