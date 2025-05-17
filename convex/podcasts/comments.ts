import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Function to add a comment to a podcast
export const addComment = mutation({
  args: {
    podcastId: v.id("podcasts"),
    userId: v.string(),
    userName: v.string(),
    userImageUrl: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { podcastId, userId, userName, userImageUrl, content } = args;

    // Verify the podcast exists
    const podcast = await ctx.db.get(podcastId);
    if (!podcast) {
      throw new ConvexError("Podcast not found");
    }

    // Create the comment
    return await ctx.db.insert("comments", {
      podcastId,
      userId,
      userName,
      userImageUrl,
      content,
      createdAt: new Date().toISOString(),
    });
  },
});

// Function to get comments for a podcast
export const getPodcastComments = query({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const { podcastId } = args;

    return await ctx.db
      .query("comments")
      .withIndex("by_podcast", (q) => q.eq("podcastId", podcastId))
      .order("desc")
      .collect();
  },
});

// Delete a comment
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.string(),
    podcastId: v.id("podcasts"),
    isOwner: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Get the comment
    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if the user is authorized to delete this comment
    // Allow deletion if user is the comment author or the podcast owner
    if (comment.userId !== args.userId && !args.isOwner) {
      throw new Error("Unauthorized to delete this comment");
    }

    // Delete the comment
    await ctx.db.delete(args.commentId);

    return { success: true };
  },
});