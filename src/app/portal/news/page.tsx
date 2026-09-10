import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { listPublishedNews } from "@/features/news/server";
import { BookOpen, Pin, ArrowRight, ArrowLeft } from "lucide-react";

export default async function PortalNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const locale = await getLocale();
  const isTh = locale === "th";

  const activeCategory = cat || "ALL";
  const news = await listPublishedNews(activeCategory === "ALL" ? undefined : activeCategory, 50);

  const categories = [
    { key: "ALL", labelTh: "ทั้งหมด", labelEn: "All News" },
    { key: "ACADEMIC", labelTh: "วิชาการ", labelEn: "Academic" },
    { key: "ACTIVITY", labelTh: "กิจกรรม", labelEn: "Activities" },
    { key: "RESEARCH", labelTh: "วิจัยและนวัตกรรม", labelEn: "Research" },
    { key: "GENERAL", labelTh: "ทั่วไป", labelEn: "General" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Breadcrumb / Title */}
      <div className="space-y-2">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isTh ? "กลับหน้าแรก" : "Back to Home"}</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground">
          {isTh ? "ข่าวประชาสัมพันธ์และกิจกรรมคณะ" : "News & Faculty Announcements"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isTh ? "รวมข่าวสาร ความเคลื่อนไหว กิจกรรม และประกาศอย่างเป็นทางการ" : "Explore all official updates, news, and faculty events"}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-4">
        {categories.map((c) => {
          const isActive = activeCategory === c.key;
          return (
            <Link
              key={c.key}
              href={c.key === "ALL" ? "/portal/news" : `/portal/news?cat=${c.key}`}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-brand text-on-brand shadow-xs"
                  : "bg-muted text-foreground/80 hover:bg-muted/80"
              }`}
            >
              {isTh ? c.labelTh : c.labelEn}
            </Link>
          );
        })}
      </div>

      {/* News Grid */}
      {news.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-border text-muted-foreground">
          <p className="text-base font-medium">{isTh ? "ไม่พบข่าวสารในหมวดหมู่นี้" : "No news articles found in this category"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/portal/news/${item.slug}`}
              className="group flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                {item.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.coverImageUrl}
                    alt={isTh ? item.titleTh : item.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <BookOpen className="w-8 h-8 opacity-40" />
                    <span className="text-xs uppercase font-medium tracking-wider">{item.category}</span>
                  </div>
                )}

                {item.isPinned && (
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-brand text-on-brand text-xs font-semibold flex items-center gap-1 shadow-sm">
                    <Pin className="w-3 h-3" />
                    <span>{isTh ? "ข่าวเด่น" : "Pinned"}</span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full bg-muted font-medium">{item.category}</span>
                    <span>•</span>
                    <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(isTh ? "th-TH" : "en-US") : ""}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-base line-clamp-2 group-hover:text-brand transition-colors">
                    {isTh ? item.titleTh : item.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {isTh ? item.summaryTh || item.contentTh : item.summaryEn || item.contentEn}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-brand">
                  <span>{isTh ? "อ่านรายละเอียด" : "Read more"}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
