import type {Metadata} from 'next';
import Studio from '@/components/Studio';
export const metadata:Metadata={title:'Free Phonk Video Studio',description:'Edit your own music visualizer projects locally in the browser.',robots:{index:false,follow:false}};
export default function StudioPage(){return <Studio/>}
