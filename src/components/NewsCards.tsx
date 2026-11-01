import Image from "next/image";
import Link from "next/link";
import { formatNewsDate, type NewsPost } from "@/lib/news";

export function NewsCards({ posts }: { posts: NewsPost[] }) {
  return (
    <div className="news-grid">
      {posts.map((p) => (
        <article key={p.id} className="news-card">
          <Link href={`/news/${p.slug}`} className="news-card__img" tabIndex={-1} aria-hidden="true">
            {p.coverUrl ? (
              <Image src={p.coverUrl} alt="" fill sizes="(max-width: 720px) 100vw, 360px" quality={90} />
            ) : (
              <span className="news-card__placeholder"><img src="/brand/mop-emblem.png" alt="" width={72} height={72} /></span>
            )}
          </Link>
          <div className="news-card__body">
            <time dateTime={p.date} className="news-card__date">{formatNewsDate(p.date)}</time>
            <h3><Link href={`/news/${p.slug}`}>{p.title}</Link></h3>
            <p>{p.summary}</p>
            <Link href={`/news/${p.slug}`} className="news-card__more">Read more →</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
