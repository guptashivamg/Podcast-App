import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// this mutation will handle liking and unliking podcasts
export const likePodcast = mutation({
  args: { podcastId: v.id("podcasts"), userId: v.string() },
  handler: async (ctx, { podcastId, userId }) => {
    const podcast = await ctx.db.get(podcastId);
    if (!podcast) throw new Error("Podcast not found");

    // Initialize likes and likeCount if they don't exist
    const likes = podcast.likes ?? [];
    const likeCount = podcast.likeCount ?? 0;
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      // Unlike
      await ctx.db.patch(podcastId, {
        likes: likes.filter((id) => id !== userId),
        likeCount: Math.max(0, likeCount - 1), // Ensure count never goes below 0
      });
      return false;
    } else {
      // Like
      await ctx.db.patch(podcastId, {
        likes: [...likes, userId],
        likeCount: likeCount + 1,
      });
      return true;
    }
  },
});

// Function to rate a podcast
export const ratePodcast = mutation({
  args: {
    podcastId: v.id("podcasts"),
    userId: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const { podcastId, userId, rating } = args;

    // Check if the user has already rated this podcast
    const existingRating = await ctx.db
      .query("ratings")
      .withIndex("by_user_and_podcast", (q) =>
        q.eq("userId", userId).eq("podcastId", podcastId)
      )
      .first();

    if (existingRating) {
      // Update existing rating
      await ctx.db.patch(existingRating._id, { rating });
    } else {
      // Create new rating
      await ctx.db.insert("ratings", {
        podcastId,
        userId,
        rating,
        createdAt: new Date().toISOString(),
      });
    }

    // Calculate new average rating
    const allRatings = await ctx.db
      .query("ratings")
      .withIndex("by_podcast", (q) => q.eq("podcastId", podcastId))
      .collect();

    const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allRatings.length;

    // Update podcast with new average rating and count
    await ctx.db.patch(podcastId, {
      averageRating,
      ratingCount: allRatings.length,
    });

    return { success: true };
  },
});

// Function to get a user's rating for a podcast
export const getUserRating = query({
  args: {
    podcastId: v.id("podcasts"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { podcastId, userId } = args;

    if (!userId) return null;

    const rating = await ctx.db
      .query("ratings")
      .withIndex("by_user_and_podcast", (q) =>
        q.eq("userId", userId).eq("podcastId", podcastId)
      )
      .first();

    return rating ? { rating: rating.rating } : null;
  },
});

// Function to get rating distribution for a podcast
export const getRatingDistribution = query({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const { podcastId } = args;

    // Get all ratings for this podcast
    const allRatings = await ctx.db
      .query("ratings")
      .withIndex("by_podcast", (q) => q.eq("podcastId", podcastId))
      .collect();

    // Count ratings for each star level (1-5)
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    // Count each rating
    allRatings.forEach((rating) => {
      const starRating = Math.round(rating.rating);
      if (starRating >= 1 && starRating <= 5) {
        distribution[starRating]++;
      }
    });

    return distribution;
  },
});
