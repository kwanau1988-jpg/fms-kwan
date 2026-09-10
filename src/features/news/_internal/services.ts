import { prisma } from "@/shared/lib/infra/prisma";
import type { CreateNewsArticleInput, UpdateNewsArticleInput } from "./validations";

export interface NewsArticleDto {
  id: string;
  tenantId: string;
  titleTh: string;
  titleEn: string;
  slug: string;
  summaryTh: string | null;
  summaryEn: string | null;
  contentTh: string;
  contentEn: string;
  category: string;
  coverImageUrl: string | null;
  isPinned: boolean;
  viewCount: number;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\u0E00-\u0E7Fa-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base || "article"}-${suffix}`;
}

export async function listNewsArticles(tenantId: string): Promise<NewsArticleDto[]> {
  const items = await prisma.newsArticle.findMany({
    where: { tenantId },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });
  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    titleTh: item.titleTh,
    titleEn: item.titleEn,
    slug: item.slug,
    summaryTh: item.summaryTh,
    summaryEn: item.summaryEn,
    contentTh: item.contentTh,
    contentEn: item.contentEn,
    category: item.category,
    coverImageUrl: item.coverImageUrl,
    isPinned: item.isPinned,
    viewCount: item.viewCount,
    status: item.status,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

import type { Prisma } from "@/generated/prisma";

export async function listPublishedNews(category?: string, limit = 20): Promise<NewsArticleDto[]> {
  const where: Prisma.NewsArticleWhereInput = { status: "PUBLISHED" };
  if (category && category !== "ALL") {
    where.category = category as Prisma.EnumNewsCategoryFilter["equals"];
  }
  const items = await prisma.newsArticle.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    titleTh: item.titleTh,
    titleEn: item.titleEn,
    slug: item.slug,
    summaryTh: item.summaryTh,
    summaryEn: item.summaryEn,
    contentTh: item.contentTh,
    contentEn: item.contentEn,
    category: item.category,
    coverImageUrl: item.coverImageUrl,
    isPinned: item.isPinned,
    viewCount: item.viewCount,
    status: item.status,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticleDto | null> {
  const item = await prisma.newsArticle.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  if (!item) return null;

  // Increment view count asynchronously
  await prisma.newsArticle.update({
    where: { id: item.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => null);

  return {
    id: item.id,
    tenantId: item.tenantId,
    titleTh: item.titleTh,
    titleEn: item.titleEn,
    slug: item.slug,
    summaryTh: item.summaryTh,
    summaryEn: item.summaryEn,
    contentTh: item.contentTh,
    contentEn: item.contentEn,
    category: item.category,
    coverImageUrl: item.coverImageUrl,
    isPinned: item.isPinned,
    viewCount: item.viewCount + 1,
    status: item.status,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function createNewsArticle(tenantId: string, input: CreateNewsArticleInput): Promise<NewsArticleDto> {
  const slug = generateSlug(input.titleEn || input.titleTh);
  const created = await prisma.newsArticle.create({
    data: {
      tenantId,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      slug,
      summaryTh: input.summaryTh ?? null,
      summaryEn: input.summaryEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      category: input.category,
      coverImageUrl: input.coverImageUrl || null,
      isPinned: input.isPinned,
      status: input.status,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    },
  });
  return {
    id: created.id,
    tenantId: created.tenantId,
    titleTh: created.titleTh,
    titleEn: created.titleEn,
    slug: created.slug,
    summaryTh: created.summaryTh,
    summaryEn: created.summaryEn,
    contentTh: created.contentTh,
    contentEn: created.contentEn,
    category: created.category,
    coverImageUrl: created.coverImageUrl,
    isPinned: created.isPinned,
    viewCount: created.viewCount,
    status: created.status,
    publishedAt: created.publishedAt ? created.publishedAt.toISOString() : null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateNewsArticle(tenantId: string, input: UpdateNewsArticleInput): Promise<NewsArticleDto> {
  const updated = await prisma.newsArticle.update({
    where: { id: input.id, tenantId },
    data: {
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      summaryTh: input.summaryTh ?? null,
      summaryEn: input.summaryEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      category: input.category,
      coverImageUrl: input.coverImageUrl || null,
      isPinned: input.isPinned,
      status: input.status,
      publishedAt: input.status === "PUBLISHED" ? new Date() : undefined,
    },
  });
  return {
    id: updated.id,
    tenantId: updated.tenantId,
    titleTh: updated.titleTh,
    titleEn: updated.titleEn,
    slug: updated.slug,
    summaryTh: updated.summaryTh,
    summaryEn: updated.summaryEn,
    contentTh: updated.contentTh,
    contentEn: updated.contentEn,
    category: updated.category,
    coverImageUrl: updated.coverImageUrl,
    isPinned: updated.isPinned,
    viewCount: updated.viewCount,
    status: updated.status,
    publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteNewsArticle(tenantId: string, id: string): Promise<void> {
  await prisma.newsArticle.delete({
    where: { id, tenantId },
  });
}
