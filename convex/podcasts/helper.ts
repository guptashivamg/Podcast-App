import { QueryCtx } from "../_generated/server";
import { PodcastProps } from "@/types";

// Helper function to get podcasts by author
export const getPodcastsByAuthor = async (ctx: QueryCtx, authorId: string) => {
  return await ctx.db
    .query("podcasts")
    .filter((q) => q.eq(q.field("authorId"), authorId))
    .collect();
};

// Helper function to search podcasts
export const searchPodcasts = async (ctx: QueryCtx, searchTerm: string | undefined) => {
  if (!searchTerm || searchTerm.trim() === "") {
    return await ctx.db.query("podcasts").collect();
  }

  // Try author search first
  const authorSearch = await ctx.db
    .query("podcasts")
    .withSearchIndex("search_author", (q) => q.search("author", searchTerm))
    .collect();

  if (authorSearch.length > 0) {
    return authorSearch;
  }

  // Try title search
  const titleSearch = await ctx.db
    .query("podcasts")
    .withSearchIndex("search_title", (q) => q.search("podcastTitle", searchTerm))
    .collect();

  if (titleSearch.length > 0) {
    return titleSearch;
  }

  // Try description search
  return await ctx.db
    .query("podcasts")
    .withSearchIndex("search_body", (q) => q.search("podcastDescription", searchTerm))
    .collect();
};

// Helper function to apply category and language filters
export const applyFilters = (
  podcasts: PodcastProps[], 
  categories: string[] | undefined, 
  languages: string[] | undefined
) => {
  if (!categories?.length && !languages?.length) {
    return podcasts;
  }

  return podcasts.filter(podcast => {
    const categoryMatch = !categories?.length || 
      (podcast.podcastType && categories.includes(podcast.podcastType));
    
    const languageMatch = !languages?.length || 
      (podcast.language && languages.includes(podcast.language));
    
    return categoryMatch && languageMatch;
  });
};

// Helper function to calculate popularity score
export const calculatePopularityScore = (podcast: PodcastProps) => {
  const likes = podcast.likeCount || 0;
  const views = podcast.views || 0;
  const ratingCount = podcast.ratingCount || 0;
  const avgRating = podcast.averageRating || 0;

  const ratingScore = (ratingCount * avgRating) / 5;
  return ratingScore + likes * 2 + views;
};

// Helper function to calculate trending score
export const calculateTrendingScore = (podcast: PodcastProps) => {
  const likes = podcast.likeCount || 0;
  const views = podcast.views || 0;
  const now = Date.now();
  const daysSinceRelease = (now - podcast._creationTime) / (1000 * 60 * 60 * 24);
  
  return (likes * 2 + views) / Math.pow(daysSinceRelease + 1, 1.2);
};

// Helper function to sort podcasts
export const sortPodcasts = (podcasts: PodcastProps[], sortType: string) => {
  const sortedPodcasts = [...podcasts]; // Create a copy to avoid mutating the original
  
  switch (sortType) {
    case "popular":
      sortedPodcasts.sort((a, b) => {
        return calculatePopularityScore(b) - calculatePopularityScore(a);
      });
      break;

    case "topRated":
      sortedPodcasts.sort((a, b) => {
        const aRating = a.averageRating || 0;
        const bRating = b.averageRating || 0;
        const aCount = a.ratingCount || 0;
        const bCount = b.ratingCount || 0;

        // If both have ratings, compare by rating
        if (aCount > 0 && bCount > 0) {
          return bRating - aRating;
        }

        // If only one has ratings, prioritize the one with ratings
        if (aCount > 0) return -1;
        if (bCount > 0) return 1;

        // If neither has ratings, sort by views as a fallback
        return (b.views || 0) - (a.views || 0);
      });
      break;
      
    case "trending":
      sortedPodcasts.sort((a, b) => {
        return calculateTrendingScore(b) - calculateTrendingScore(a);
      });
      break;
      
    case "latest":
    default:
      sortedPodcasts.sort((a, b) => b._creationTime - a._creationTime);
      break;
  }
  
  return sortedPodcasts;
};