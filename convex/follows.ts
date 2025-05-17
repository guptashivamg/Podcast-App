import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Follow a user
export const followUser = mutation({
  args: {
    followingId: v.string(), // The clerkId of the user to follow
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const followerId = identity.subject;

    // Don't allow users to follow themselves
    if (followerId === args.followingId) {
      throw new ConvexError("Cannot follow yourself");
    }

    // Check if the follow relationship already exists
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("follower", followerId).eq("following", args.followingId)
      )
      .unique();

    // If already following, return the existing follow
    if (existingFollow) {
      return existingFollow;
    }

    // Create a new follow relationship
    const followId = await ctx.db.insert("follows", {
      follower: followerId,
      following: args.followingId,
      createdAt: Date.now(),
    });

    // Update follower's following count
    const followerUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), followerId))
      .unique();

    if (followerUser) {
      await ctx.db.patch(followerUser._id, {
        followingCount: (followerUser.followingCount || 0) + 1,
      });
    }

    // Update followed user's followers count
    const followingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.followingId))
      .unique();

    if (followingUser) {
      await ctx.db.patch(followingUser._id, {
        followersCount: (followingUser.followersCount || 0) + 1,
      });
    }

    return { _id: followId };
  },
});

// Unfollow a user
export const unfollowUser = mutation({
  args: {
    followingId: v.string(), // The clerkId of the user to unfollow
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const followerId = identity.subject;

    // Find the follow relationship
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("follower", followerId).eq("following", args.followingId)
      )
      .unique();

    // If not following, nothing to do
    if (!existingFollow) {
      return { success: false, message: "Not following this user" };
    }

    // Delete the follow relationship
    await ctx.db.delete(existingFollow._id);

    // Update follower's following count
    const followerUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), followerId))
      .unique();

    if (
      followerUser &&
      followerUser.followingCount &&
      followerUser.followingCount > 0
    ) {
      await ctx.db.patch(followerUser._id, {
        followingCount: followerUser.followingCount - 1,
      });
    }

    // Update followed user's followers count
    const followingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.followingId))
      .unique();

    if (
      followingUser &&
      followingUser.followersCount &&
      followingUser.followersCount > 0
    ) {
      await ctx.db.patch(followingUser._id, {
        followersCount: followingUser.followersCount - 1,
      });
    }

    return { success: true };
  },
});

// Get followers for a user with detailed information
export const getFollowers = query({
  args: {
    userId: v.string(), // The clerkId of the user
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("following", args.userId))
      .collect();

    // Get detailed user information for each follower
    const followerDetails = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), follow.follower))
          .unique();

        return user
          ? {
              _id: user._id,
              name: user.name,
              imageUrl: user.imageUrl,
              clerkId: user.clerkId,
              followedAt: follow.createdAt,
              isVerified: user.isVerified,
            }
          : null;
      })
    );

    // Filter out null values and sort by most recent
    return followerDetails
      .filter(Boolean)
      .sort((a, b) => (b?.followedAt ?? 0) - (a?.followedAt ?? 0));
  },
});

// Get users that a user is following with detailed information
export const getFollowing = query({
  args: {
    userId: v.string(), // The clerkId of the user
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("follower", args.userId))
      .collect();

    // Get detailed user information for each following
    const followingDetails = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), follow.following))
          .unique();

        return user
          ? {
              _id: user._id,
              name: user.name,
              imageUrl: user.imageUrl,
              clerkId: user.clerkId,
              followedAt: follow.createdAt,
              isVerified: user.isVerified,
            }
          : null;
      })
    );

    // Filter out null values and sort by most recent
    return followingDetails
      .filter(Boolean)
      .sort((a, b) => (b?.followedAt ?? 0) - (a?.followedAt ?? 0));
  },
});

// The existing count queries can remain as they are
export const getFollowersCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("following", args.userId))
      .collect();

    return followers.length;
  },
});

export const getFollowingCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("follower", args.userId))
      .collect();

    return following.length;
  },
});

// Check if the current user is following a specific user
export const isFollowing = query({
  args: {
    followingId: v.string(), // The clerkId of the user to check
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return false;
    }

    const followerId = identity.subject;

    // Find the follow relationship
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_following", (q) =>
        q.eq("follower", followerId).eq("following", args.followingId)
      )
      .unique();

    return !!existingFollow;
  },
});
