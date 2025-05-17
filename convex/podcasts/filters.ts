import { v } from "convex/values";
import { query } from "../_generated/server";
import {
  getPodcastsByAuthor,
  searchPodcasts,
  applyFilters,
  sortPodcasts,
} from "./helper";
import { PodcastProps } from "@/types";

// this query will get the podcast by the podcastId.
export const getPodcastById = query({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.podcastId);
  },
});

// Get podcast statistics for a specific author
export const getAuthorStat = query({
  args: {
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all podcasts by the author
    const podcasts = await getPodcastsByAuthor(ctx, args.authorId);

    // Calculate aggregate statistics
    const totalViews = podcasts.reduce(
      (sum: number, podcast: PodcastProps) => sum + (podcast.views || 0),
      0
    );
    const totalLikes = podcasts.reduce(
      (sum: number, podcast: PodcastProps) => sum + (podcast.likeCount || 0),
      0
    );
    const averageRating =
      podcasts.length > 0
        ? podcasts.reduce(
            (sum: number, podcast: PodcastProps) => sum + (podcast.averageRating || 0),
            0
          ) / podcasts.length
        : 0;
    return {
      totalViews,
      totalLikes,
      averageRating: averageRating.toFixed(1),
      podcastCount: podcasts.length,
    };
  },
});

// Universal podcast filtering and sorting function
export const getFilteredPodcasts = query({
  args: {
    type: v.optional(v.string()), // 'popular', 'trending', 'latest', 'topRated'
    search: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
    authorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { type, search, categories, languages, limit, authorId } = args;
    let resultPodcasts = [];

    // Step 1: Get initial podcasts based on search, author, or get all
    if (authorId) {
      resultPodcasts = await getPodcastsByAuthor(ctx, authorId);
    } else if (search) {
      resultPodcasts = await searchPodcasts(ctx, search);
    } else {
      // If no search or author specified, get all podcasts
      resultPodcasts = await ctx.db.query("podcasts").collect();
    }

    // Step 2: Apply category and language filters only if they exist
    if ((categories && categories.length > 0) || (languages && languages.length > 0)) {
      resultPodcasts = applyFilters(resultPodcasts, categories, languages);
    }

    // Step 3: Sort based on type only if a type is specified
    if (type) {
      resultPodcasts = sortPodcasts(resultPodcasts, type);
    } else {
      // Default to latest if not specified
      resultPodcasts = sortPodcasts(resultPodcasts, "latest");
    }

    // Step 4: Apply limit if specified
    if (limit && limit > 0) {
      resultPodcasts = resultPodcasts.slice(0, limit);
    }

    return resultPodcasts;
  },
});

// Function to get similar podcasts based on multiple parameters
export const getSimilarPodcasts = query({
  args: {
    podcastId: v.id("podcasts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);
    if (!podcast) return [];

    const limit = args.limit || 9; // Default to 8 similar podcasts

    // Get all podcasts except the current one
    const allPodcasts = await ctx.db
      .query("podcasts")
      .filter((q) => q.neq(q.field("_id"), args.podcastId))
      .collect();

    // Calculate similarity scores for each podcast
    const scoredPodcasts = allPodcasts.map((p) => {
      let score = 0;

      // Same author (highest weight)
      if (p.authorId === podcast.authorId) {
        score += 10;
      }

      // Same voice type (high weight)
      if (p.voiceType === podcast.voiceType) {
        score += 8;
      }

      // Same podcast type (medium weight)
      if (p.podcastType === podcast.podcastType) {
        score += 6;
      }

      // Same language (medium weight)
      if (p.language === podcast.language) {
        score += 6;
      }

      // Content similarity - check if titles or descriptions share keywords
      if (p.podcastTitle && podcast.podcastTitle) {
        const podcastWords = podcast.podcastTitle.toLowerCase().split(/\s+/);
        const otherWords = p.podcastTitle.toLowerCase().split(/\s+/);

        // Count matching words in titles
        const matchingTitleWords = podcastWords.filter(
          (word) => word.length > 3 && otherWords.includes(word)
        ).length;

        if (matchingTitleWords > 0) {
          score += matchingTitleWords * 2; // 2 points per matching significant word
        }
      }

      // Description similarity
      if (p.podcastDescription && podcast.podcastDescription) {
        const podcastDesc = podcast.podcastDescription
          .toLowerCase()
          .split(/\s+/);
        const otherDesc = p.podcastDescription.toLowerCase().split(/\s+/);

        // Count matching words in descriptions (only for words longer than 3 chars)
        const matchingDescWords = podcastDesc.filter(
          (word) => word.length > 3 && otherDesc.includes(word)
        ).length;

        if (matchingDescWords > 0) {
          score += Math.min(matchingDescWords, 5); // Cap at 5 points to avoid overfitting
        }
      }

      // Popularity boost - give a small boost to popular podcasts
      if (p.views) {
        // Logarithmic scaling to avoid domination by very popular podcasts
        score += Math.min(Math.log10(p.views) * 0.5, 3);
      }

      // Rating boost - give a small boost to highly rated podcasts
      if (p.averageRating && p.averageRating > 4) {
        score += (p.averageRating - 4) * 2; // Up to 2 points for 5-star podcasts
      }

      // Recency boost - give a small boost to newer podcasts
      if (p._creationTime) {
        const ageInDays =
          (Date.now() - p._creationTime) / (1000 * 60 * 60 * 24);
        if (ageInDays < 30) {
          score += Math.max(0, (30 - ageInDays) / 10); // Up to 3 points for very new podcasts
        }
      }

      // Add some randomness to avoid always showing the same recommendations
      score += Math.random() * 2;

      return { podcast: p, score };
    });

    // Sort by score (highest first) and take the top results
    const sortedPodcasts = scoredPodcasts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.podcast);

    return sortedPodcasts;
  },
});
