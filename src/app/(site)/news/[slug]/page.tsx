import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsCards } from "@/components/NewsCards";
import { formatNewsDate, getNewsBySlug, listNews } from "@/lib/news";
import { site } from "@/content/site";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getNewsBySlug((await params).slug);
  if (!post) return { title: "News" };
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      images: post.coverUrl ? [{ url: post.coverUrl, alt: post.coverAlt }] : undefined,
    },
  };
}

export default async function NewsPostPage({ params }: Props) {
  const post = await getNewsBySlug((await params).slug);
  if (!post) notFound();
  const more = (await listNews(4)).filter((p) => p.id !== post.id).slice(0, 3);
  const paragraphs = post.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const shareText = encodeURIComponent(`${post.title}\n${site.url}/news/${post.slug}`);

  return (
    <>
      <section className="banner">
        <div className="container narrow">
          <span className="eyebrow"><Link href="/news" style={{ color: "inherit", textDecoration: "none" }}>News</Link></span>
          <h1>{post.title}</h1>
          <div className="ornament" aria-hidden="true">✦</div>
          <p><time dateTime={post.date}>{formatNewsDate(post.date)}</time></p>
        </div>
      </section>
      <article className="section">
        <div className="container narrow">
          {post.coverUrl && (
            <figure className="news-cover">
              <Image src={post.coverUrl} alt={post.coverAlt} width={1520} height={1013} sizes="(max-width: 800px) 100vw, 760px" quality={90} priority />
              {post.coverAlt && <figcaption>{post.coverAlt}</figcaption>}
            </figure>
          )}
          <p className="lead">{post.summary}</p>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ whiteSpace: "pre-line" }}>{p}</p>
          ))}
          <div className="news-share">
            <a className="btn btn--ghost" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
            <Link href="/news" className="btn btn--ghost">All news</Link>
          </div>
        </div>
      </article>
      {more.length > 0 && (
        <section className="section section--parchment">
          <div className="container">
            <h2 className="center">More news</h2>
            <div className="ornament" aria-hidden="true">✦</div>
            <NewsCards posts={more} />
          </div>
        </section>
      )}
    </>
  );
}
