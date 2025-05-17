'use client'
import LoaderSpinner from '@/components/LoaderSpinner'
import PodcastDetail from '@/components/PodcastId/PodcastDetail'
import PodcastHeader from '@/components/PodcastId/PodcastHeader'
import PodcastInfoSections from '@/components/PodcastId/PodcastInfoSections'
import RatingSection from '@/components/PodcastId/RatingSection'
import CommentsSection from '@/components/PodcastId/CommentsSection'
import SimilarPodcasts from '@/components/PodcastId/SimilarPodcasts'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { useEffect, useState, useCallback, useMemo } from 'react'

const PodcastDetails = ({ params: { podcastId } }: { params: { podcastId: Id<'podcasts'> } }) => {
  const { user } = useUser();

  const podcast = useQuery(api.podcasts.getPodcastById, { podcastId })
  const [hasUpdatedView, setHasUpdatedView] = useState(false);
  const updateViewCount = useMutation(api.podcasts.updatePodcastViews);

  // Rating state
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);

  // Comment state
  const [comment, setComment] = useState('');

  // Rating mutation
  const submitRating = useMutation(api.podcasts.ratePodcast);
  const userRatingData = useQuery(api.podcasts.getUserRating, {
    podcastId,
    userId: user?.id
  });

  // Get rating distribution
  const ratingDistribution = useQuery(api.podcasts.getRatingDistribution, {
    podcastId
  });

  // Comments functionality
  const submitComment = useMutation(api.podcasts.addComment);
  const deleteComment = useMutation(api.podcasts.deleteComment);
  const podcastComments = useQuery(api.podcasts.getPodcastComments, { podcastId });

  useEffect(() => {
    // Add a check to prevent multiple view count updates
    if (!hasUpdatedView && podcast && typeof window !== 'undefined') {
      // Use sessionStorage to prevent multiple view counts in the same session
      const viewKey = `podcast-view-${podcastId}`;
      const hasViewedInSession = sessionStorage.getItem(viewKey);

      if (!hasViewedInSession) {
        updateViewCount({ podcastId }).then(() => {
          setHasUpdatedView(true);
          // Mark this podcast as viewed in this session
          sessionStorage.setItem(viewKey, 'true');
        });
      } else {
        // Already viewed in this session, just update the state
        setHasUpdatedView(true);
      }
    }

    // Set user's previous rating if it exists
    if (userRatingData && userRatingData.rating) {
      setUserRating(userRatingData.rating);
      setHasRated(true);
    }
  }, [podcast, userRatingData, podcastId, updateViewCount, hasUpdatedView]);

  const handleRatingSubmit = useCallback(async () => {
    if (!user || !userRating) return;

    try {
      await submitRating({
        podcastId,
        userId: user.id,
        rating: userRating
      });
      setHasRated(true);
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  }, [user, userRating, submitRating, podcastId]);

  const handleCommentSubmit = useCallback(async () => {
    if (!user || !comment.trim()) return;

    try {
      await submitComment({
        podcastId,
        userId: user.id,
        userName: user.fullName || user.username || "Anonymous",
        userImageUrl: user.imageUrl,
        content: comment.trim()
      });
      setComment(''); // Clear comment input after submission
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }, [user, comment, submitComment, podcastId]);

  const handleCommentDelete = useCallback(async (commentId: Id<"comments">) => {
    if (!user) return;

    try {
      await deleteComment({
        commentId,
        userId: user.id,
        podcastId,
        isOwner: user?.id === podcast?.authorId
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  }, [user, deleteComment, podcastId, podcast?.authorId]);

  const similarPodcasts = useQuery(api.podcasts.getSimilarPodcasts, { 
    podcastId,
    limit: 9
  });

  // Use useMemo for derived values
  const isOwner = useMemo(() => user?.id === podcast?.authorId, [user?.id, podcast?.authorId]);

  if (!similarPodcasts || !podcast) return <LoaderSpinner />

  return (
    <section className="flex w-full flex-col">
      {/* Header Section */}
      <PodcastHeader
        podcastType={podcast.podcastType}
        audioDuration={podcast.audioDuration}
        views={podcast.views}
        averageRating={podcast.averageRating}
      />

      {/* Podcast Detail */}
      <div className="mt-6">
        <PodcastDetail
          isOwner={isOwner}
          podcastId={podcast._id}
          audioUrl={podcast.audioUrl || ''}
          podcastTitle={podcast.podcastTitle}
          author={podcast.author || ''}
          imageUrl={podcast.imageUrl || ''}
          imageStorageId={podcast.imageStorageId as Id<"_storage">}
          audioStorageId={podcast.audioStorageId as Id<"_storage">}
          authorImageUrl={podcast.authorImageUrl || ''}
          authorId={podcast.authorId}
          likes={podcast.likes}
        />
      </div>

      {/* Podcast Info */}
      <div className="mt-8 space-y-8">
        <PodcastInfoSections podcast={podcast} />

        {/* Rating Section */}
        {user && (
          <RatingSection
            podcast={podcast}
            userRating={userRating}
            hoveredRating={hoveredRating}
            hasRated={hasRated}
            ratingDistribution={ratingDistribution}
            setUserRating={setUserRating}
            setHoveredRating={setHoveredRating}
            setHasRated={setHasRated}
            handleRatingSubmit={handleRatingSubmit}
          />
        )}

        {/* Comments Section */}
        <CommentsSection
          user={user}
          podcastComments={podcastComments}
          comment={comment}
          isOwner={isOwner}
          setComment={setComment}
          handleCommentSubmit={handleCommentSubmit}
          handleCommentDelete={handleCommentDelete}
        />
      </div>

      {/* Similar Podcasts Section */}
      <SimilarPodcasts similarPodcasts={similarPodcasts} />
    </section>
  )
}

export default PodcastDetails