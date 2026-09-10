import "server-only";

export {
  listNewsArticles,
  listPublishedNews,
  getNewsArticleBySlug,
  type NewsArticleDto,
} from "./_internal/services";
export { NEWS_P, NEWS_PERMISSIONS } from "./permissions";
