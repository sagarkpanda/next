import Link from "next/link";
export default function NotFound(){return <main className="shell"><section className="section"><div className="command">$ cat /etc/404</div><h1>404</h1><p className="section-lead">The requested resource does not exist.</p><Link className="text-link" href="/">cd ~</Link></section></main>}
