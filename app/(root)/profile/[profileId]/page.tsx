"use client";

import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import LoaderSpinner from "@/components/LoaderSpinner";
import { api } from "@/convex/_generated/api";
import { useAudio } from "@/providers/AudioProvider";
import { useToast } from "@/components/ui/use-toast";
import PodcastTabs from "@/components/Profile/PodcastTabs";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileActionButtons from "@/components/Profile/ProfileActionButtons";
import FeaturedPodcast from "@/components/Profile/FeaturedPodcast";
import ProfileAbout from "@/components/Profile/ProfileAbout";

const ProfilePage = ({
  params,
}: {
  params: {
    profileId: string;
  };
}) => {
  const user = useQuery(api.users.getUserById, {
    clerkId: params.profileId,
  });

  // Use the optimized query to get podcast stats in one call
  const podcastsData = useQuery(api.podcasts.getAuthorStat, {
    authorId: params.profileId,
  });

  // Use the filtered podcasts query with type and authorId
  const popularPodcasts = useQuery(api.podcasts.getFilteredPodcasts, {
    type: "popular",
    authorId: params.profileId,
  });

  const recentPodcasts = useQuery(api.podcasts.getFilteredPodcasts, {
    type: "latest",
    authorId: params.profileId,
  });

  // Add follow-related queries and mutations with proper error handling
  const isUserFollowing = useQuery(api.follows.isFollowing,
    { followingId: params.profileId }
  );

  const followersCount = useQuery(api.follows.getFollowersCount, {
    userId: params.profileId,
  });

  const followingCount = useQuery(api.follows.getFollowingCount, {
    userId: params.profileId,
  });

  const followUser = useMutation(api.follows.followUser);
  const unfollowUser = useMutation(api.follows.unfollowUser);

  const { setAudio } = useAudio();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const { userId } = useAuth();

  // Update isFollowing state when the query result changes
  useEffect(() => {
    if (isUserFollowing !== undefined) {
      setIsFollowing(isUserFollowing);
    }
  }, [isUserFollowing]);

  if (!user || !podcastsData || !popularPodcasts || !recentPodcasts) return <LoaderSpinner />;

  // Check if the profile being viewed is the current user's profile
  const isOwnProfile = userId === params.profileId;

  // Get featured podcast - use the most popular one
  const featuredPodcast = popularPodcasts.length > 0 ? popularPodcasts[0] : null;

  // Play random podcast function
  const playRandomPodcast = () => {
    if (podcastsData.podcastCount === 0) return;

    const randomIndex = Math.floor(Math.random() * podcastsData.podcastCount);
    const podcast = popularPodcasts[randomIndex];

    setAudio({
      title: podcast.podcastTitle || "",
      audioUrl: podcast.audioUrl || "",
      imageUrl: podcast.imageUrl || "",
      author: podcast.author || "",
      podcastId: podcast._id,
    });

    toast({
      title: "Now Playing",
      description: `${podcast.podcastTitle} by ${podcast.author}`,
      duration: 3000,
    });
  };

  // Share profile function - simplified
  const shareProfile = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name}'s Podcast Profile`,
          text: `Check out ${user?.name}'s podcasts on PodTales!`,
          url: url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Profile link copied to clipboard",
        duration: 3000,
      });
    }
  };

  // Updated Follow/Unfollow function without notifications
  const toggleFollow = async () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to follow creators",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser({ followingId: params.profileId });
        setIsFollowing(false);
      } else {
        await followUser({ followingId: params.profileId });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <section className="mt-9 flex flex-col">
      {/* Profile Header - now using pre-calculated stats */}
      <ProfileHeader
        user={user}
        podcastCount={podcastsData.podcastCount}
        totalViews={podcastsData.totalViews}
        totalLikes={podcastsData.totalLikes}
        averageRating={podcastsData.averageRating}
        isFollowing={isFollowing}
        followersCount={followersCount}
        followingCount={followingCount}
      />

      {/* Action buttons */}
      <ProfileActionButtons
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        hasPodcasts={podcastsData.podcastCount > 0}
        toggleFollow={toggleFollow}
        playRandomPodcast={playRandomPodcast}
        shareProfile={shareProfile}
        clerkId={params.profileId}
        userName={user?.name || ""}
        userBio={user?.bio || ""}
        userWebsite={user?.website || ""}
        userSocialLinks={user?.socialLinks || []}
      />

      {featuredPodcast && (
        <FeaturedPodcast podcast={featuredPodcast} setAudio={setAudio} />
      )}

      {/* Tabbed Content Section */}
      <PodcastTabs
        popularPodcasts={popularPodcasts}
        recentPodcasts={recentPodcasts}
        isOwnProfile={isOwnProfile}
      />

      {/* About Section */}
      <ProfileAbout user={user} isOwnProfile={isOwnProfile} />
    </section>
  );
};

export default ProfilePage;