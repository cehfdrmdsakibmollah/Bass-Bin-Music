import type {Metadata} from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Dashboard from '@/components/Dashboard';
export const metadata:Metadata={title:'My Local Projects',robots:{index:false,follow:false}};
export default function DashboardPage(){return <><SiteHeader/><main className="page-main container"><Dashboard/></main><SiteFooter/></>}
