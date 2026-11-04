import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getContent } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { rehearsal, social } = await getContent();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header rehearsal={rehearsal} social={social} />
      <main id="main">{children}</main>
      <Footer rehearsal={rehearsal} social={social} />
      <ScrollReveal />
    </>
  );
}
