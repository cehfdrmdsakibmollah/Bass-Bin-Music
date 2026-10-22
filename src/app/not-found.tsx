import Link from 'next/link';
export default function NotFound(){return <main className="error-page"><span>404 / SIGNAL LOST</span><h1>Lost in the frequency.</h1><p>We couldn’t find that route.</p><Link href="/" className="btn primary">Go home ↗</Link></main>}
