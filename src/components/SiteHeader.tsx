import Link from 'next/link';
import Image from 'next/image';
export default function SiteHeader(){
return <header className="site-header"><div className="container header-inner">
  <Link href="/" className="brand"><Image src="/bass-bin-logo.png" width={48} height={48} alt="BASS BIN MUSIC neon music note logo" priority/><span>BASS BIN <em>MUSIC</em></span></Link>
  <nav className="site-nav" aria-label="Main navigation"><Link href="/features">Features</Link><Link href="/templates">Templates</Link><Link href="/music">Music Hub</Link><Link href="/dashboard">My projects</Link></nav>
  <Link href="/studio" className="btn primary header-cta">Open Studio <span aria-hidden="true">↗</span></Link>
</div></header>;
}
