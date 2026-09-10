import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P, listNewsArticles } from "@/features/news/server";
import { NewsClient } from "./_components/news-client";

export default async function NewsAdminPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);
  const initialItems = await listNewsArticles(ctx.tenantId);
  return (
    <NewsClient
      initialItems={initialItems}
      canManage={hasPermission(ctx, NEWS_P.newsManage)}
    />
  );
}
