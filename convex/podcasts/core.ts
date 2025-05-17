import { ConvexError, v } from "convex/values";
import { mutation} from "../_generated/server";

// create podcast mutation
export const createPodcast = mutation({
  args: {
    audioStorageId: v.optional(v.id("_storage")),
    podcastTitle: v.string(),
    podcastDescription: v.string(),
    audioUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    voicePrompt: v.string(),
    imagePrompt: v.string(),
    voiceType: v.string(),
    views: v.float64(),
    audioDuration: v.float64(),
    podcastType: v.optional(v.string()),
    language: v.optional(v.string()),
    likes: v.optional(v.array(v.string())),
    likeCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("User not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .collect();

    if (user.length === 0) {
      throw new ConvexError("User not found");
    }

    // Create the podcast
    const podcastId = await ctx.db.insert("podcasts", {
      audioStorageId: args.audioStorageId,
      user: user[0]._id,
      podcastTitle: args.podcastTitle,
      podcastDescription: args.podcastDescription,
      audioUrl: args.audioUrl,
      imageUrl: args.imageUrl,
      imageStorageId: args.imageStorageId,
      author: user[0].name,
      authorId: user[0].clerkId,
      voicePrompt: args.voicePrompt,
      imagePrompt: args.imagePrompt,
      voiceType: args.voiceType,
      views: args.views,
      authorImageUrl: user[0].imageUrl,
      audioDuration: args.audioDuration,
      podcastType: args.podcastType,
      likes: args.likes || [],
      likeCount: args.likeCount || 0,
      language: args.language,
    });

    // After creating the podcast, notify followers
    const followers = await ctx.db
      .query("follows")
      .filter((q) => q.eq(q.field("following"), user[0].clerkId))
      .collect();
    
    // Create notifications for each follower
    for (const follower of followers) {
      // Use the createNotification mutation from notifications.ts
      await ctx.db.insert("notifications", {
        userId: follower.follower,
        creatorId: user[0].clerkId,
        type: "new_podcast",
        podcastId,
        isRead: false,
      });
    }
    
    return podcastId;
  },
});

// this mutation is required to generate the url after uploading the file to the storage.
export const getUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// this mutation will delete the podcast.
export const deletePodcast = mutation({
  args: {
    podcastId: v.id("podcasts"),
    imageStorageId: v.id("_storage"),
    audioStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);

    if (!podcast) {
      throw new ConvexError("Podcast not found");
    }

    // Delete all notifications related to this podcast
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("podcastId"), args.podcastId))
      .collect();
    
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // Delete storage files
    await ctx.storage.delete(args.imageStorageId);
    await ctx.storage.delete(args.audioStorageId);
    
    // Delete the podcast
    return await ctx.db.delete(args.podcastId);
  },
});

// this mutation will update the views of the podcast.
export const updatePodcastViews = mutation({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);

    if (!podcast) {
      throw new ConvexError("Podcast not found");
    }

    return await ctx.db.patch(args.podcastId, {
      views: podcast.views + 1,
    });
  },
});