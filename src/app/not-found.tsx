import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section center">
      <div className="container narrow">
        <span className="eyebrow">Page not found</span>
        <h1>This page has wandered off</h1>
        <div className="ornament" aria-hidden="true">✦</div>
        <p className="lead">The page you are looking for may have moved.</p>
        <Link href="/" className="btn">Return home</Link>
      </div>
    </section>
  );
}
