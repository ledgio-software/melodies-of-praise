import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getContent } from "@/lib/content";

export default async function NotFound() {
  const { rehearsal, social } = await getContent();
  return (
    <>
      <Header rehearsal={rehearsal} social={social} />
      <main id="main">
        <section className="section center">
          <div className="container narrow">
            <span className="eyebrow">Page not found</span>
            <h1>This page has wandered off</h1>
            <div className="ornament" aria-hidden="true">✦</div>
            <p className="lead">The page you are looking for may have moved.</p>
            <Link href="/" className="btn">Return home</Link>
          </div>
        </section>
      </main>
      <Footer rehearsal={rehearsal} social={social} />
    </>
  );
}
