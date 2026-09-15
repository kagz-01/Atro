import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CtaBand } from "@/components/page-hero";
import { articleBySlug } from "@/lib/site";

export const Route = createFileRoute("/insights/$slug")({
  component: ArticlePage,
  loader: ({ params }) => {
    const article = articleBySlug(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.article.title ?? "Insight"} — ATRO` },
      { name: "description", content: loaderData?.article.excerpt ?? "" },
    ],
  }),
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  return (
    <>
      <article className="pt-28 md:pt-36 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
            <Link to="/insights" className="hover:text-burgundy">Insights</Link>
            {" / "}
            {article.kicker} · {article.date}
          </p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl text-maroon">{article.title}</h1>
          <p className="mt-6 text-lg text-ink/75">{article.excerpt}</p>
        </div>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 mt-10">
          <img src={article.image} alt="" className="w-full aspect-[16/8] object-cover" />
        </div>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 mt-12 space-y-6">
          {article.body.map((block, i) => (
            <div key={i}>
              {block.h ? <h2 className="font-display text-2xl text-maroon mb-2">{block.h}</h2> : null}
              <p className="text-ink/80 leading-relaxed">{block.p}</p>
            </div>
          ))}
        </div>
      </article>
      <CtaBand />
    </>
  );
}
