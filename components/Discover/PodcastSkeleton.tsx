import React from 'react';
import GridPodcastSkeleton from '@/components/PodcastCard/GridPodcastSkeleton';
import ListPodcastSkeleton from '@/components/PodcastCard/ListPodcastSkeleton';

interface PodcastSkeletonProps {
  viewMode: 'grid' | 'list';
}

const PodcastSkeleton = ({ viewMode }: PodcastSkeletonProps) => {
  return (
    <div className={viewMode === 'grid' ? "podcast_grid" : "flex flex-col gap-4"}>
      {[...Array(6)].map((_, index) => (
        <div key={index}>
          {viewMode === 'grid' ? (
            <GridPodcastSkeleton usage="discover" />
          ) : (
            <ListPodcastSkeleton usage='discover' />
          )}
        </div>
      ))}
    </div>
  );
};

export default PodcastSkeleton;