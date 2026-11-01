export function PageBanner({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="banner">
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <div className="ornament" aria-hidden="true">✦</div>
        {intro && <p>{intro}</p>}
      </div>
    </section>
  );
}
