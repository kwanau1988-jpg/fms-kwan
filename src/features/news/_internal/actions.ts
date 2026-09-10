"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { NEWS_P } from "../permissions";
import { createNewsArticleSchema, updateNewsArticleSchema } from "./validations";
import {
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  listNewsArticles,
  type NewsArticleDto,
} from "./services";

export async function getNewsArticlesAction(): Promise<ActionResult<NewsArticleDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return listNewsArticles(ctx.tenantId);
  });
}

export async function createNewsArticleAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = createNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createNewsArticle(ctx.tenantId, parsed);
    revalidatePath("/news");
    revalidatePath("/portal");
    revalidatePath("/portal/news");
    return result;
  });
}

export async function updateNewsArticleAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = updateNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateNewsArticle(ctx.tenantId, parsed);
    revalidatePath("/news");
    revalidatePath("/portal");
    revalidatePath("/portal/news");
    return result;
  });
}

export async function deleteNewsArticleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    await deleteNewsArticle(ctx.tenantId, id);
    revalidatePath("/news");
    revalidatePath("/portal");
    revalidatePath("/portal/news");
  });
}
