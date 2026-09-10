import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/shared/lib/i18n/server";
import { getNewsArticleBySlug } from "@/features/news/server";
import { ArrowLeft, Calendar, Eye, Pin } from "lucide-react";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const isTh = locale === "th";

  const article = await getNewsArticleBySlug(slug);
  if (!article) notFound();

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <Link
        href="/portal/news"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{isTh ? "กลับหน้ารวมข่าวสาร" : "Back to All News"}</span>
      </Link>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2.5 py-1 rounded-full bg-brand/10 text-brand font-semibold">
            {article.category}
          </span>
          {article.isPinned && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-semibold flex items-center gap-1">
              <Pin className="w-3 h-3" />
              <span>{isTh ? "ข่าวเด่น" : "Featured"}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(isTh ? "th-TH" : "en-US") : ""}</span>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{article.viewCount} {isTh ? "ครั้ง" : "views"}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          {isTh ? article.titleTh : article.titleEn}
        </h1>

        {article.summaryTh && (
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed italic border-l-4 border-brand pl-4 py-1">
            {isTh ? article.summaryTh : article.summaryEn}
          </p>
        )}
      </header>

      {/* Cover Image */}
      {article.coverImageUrl && (
        <div className="rounded-3xl overflow-hidden border border-border/60 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImageUrl}
            alt={isTh ? article.titleTh : article.titleEn}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-foreground/90 whitespace-pre-wrap">
        {isTh ? article.contentTh : article.contentEn}
      </div>

      {/* Footer / Share */}
      <footer className="pt-8 border-t border-border/40 flex items-center justify-between">
        <Link
          href="/portal/news"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isTh ? "กลับหน้ารวมข่าวสาร" : "Back to News"}</span>
        </Link>
      </footer>
    </article>
  );
}
