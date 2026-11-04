import type { Metadata } from "next";
import { NewsCards } from "@/components/NewsCards";
import { PageBanner } from "@/components/PageBanner";
import { SocialButtons } from "@/components/Social";
import { getContent } from "@/lib/content";
import { listNews } from "@/lib/news";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "News",
  description: `News, reports and testimonies from ${site.name}.`,
};

// scheduled posts appear within the hour
export const revalidate = 3600;

export default async function News() {
  const [posts, c] = await Promise.all([listNews(), getContent()]);
  return (
    <>
      <PageBanner eyebrow="From the choir" title="News" intro="Reports, testimonies and updates from Melodies of Praise." image={site.pageBanners.news} />
      <section className="section">
        <div className="container">
          {posts.length > 0 ? (
            <NewsCards posts={posts} />
          ) : (
            <div className="empty">
              <h3>News coming soon</h3>
              <p>Follow us on social media for the latest from Melodies of Praise.</p>
              <SocialButtons social={c.social} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
