import { PodcastCardProps } from '@/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Headphones, Heart, Star, Clock } from 'lucide-react'
import { podcastTypes, languageOptions } from '@/constants/PodcastFields'

const GridPodcastCard = ({
    imgUrl,
    title,
    description,
    podcastId,
    views,
    likes,
    rating,
    duration,
    podcastType,
    language
}: PodcastCardProps) => {
    const router = useRouter();

    const formatDuration = (seconds: number) => {
        if (!seconds) return null;

        if (seconds < 60) {
            return `${Math.round(seconds)} sec`;
        } else {
            const minutes = Math.floor(seconds / 60);
            return `${minutes} min`;
        }
    };

    return (
        <div
            className='cursor-pointer bg-white-1/5 rounded-xl p-3 hover:bg-white-1/10 transition-all duration-200 h-full flex flex-col w-full'
            onClick={() => router.push(`/podcasts/${podcastId}`)}
        >
            <figure className="flex flex-col gap-3 h-full w-full">
                <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                    <Image
                        src={imgUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="flex flex-col flex-1 w-full">
                    <h1 className="text-base sm:text-lg font-bold text-white-1 line-clamp-1">{title}</h1>
                    <h2 className="text-xs sm:text-sm font-normal capitalize text-white-4 line-clamp-2 mt-1 flex-grow">{description}</h2>

                    {/* Category and language badges */}
                    {(podcastType || language ) && (<div className="flex flex-wrap gap-2 mt-2">
                        {podcastType && (
                            <span className="inline-block bg-orange-1/20 text-orange-1 text-xs px-2 py-1 rounded-full">
                                {podcastTypes.find(c => c.value === podcastType)?.label || podcastType}
                            </span>
                        )}

                        {language && (
                            <span className="inline-flex items-center bg-white-1/10 text-white-2 text-xs px-2 py-1 rounded-full">
                                {languageOptions.find(l => l.value === language)?.label || language}
                            </span>
                        )}
                    </div>)}

                    {/* Stats display */}
                    {(views !== undefined || likes !== undefined || rating !== undefined || duration) && (
                        <div className="flex items-center justify-between mt-auto pt-2">
                            <div className="flex items-center gap-3">
                                {views !== undefined && (
                                    <div className="flex items-center gap-1 text-white-3 text-xs">
                                        <Headphones size={12} className="flex-shrink-0" />
                                        <span>{views}</span>
                                    </div>
                                )}
                                {likes !== undefined && (
                                    <div className="flex items-center gap-1 text-white-3 text-xs">
                                        <Heart size={12} className="flex-shrink-0" />
                                        <span>{likes}</span>
                                    </div>
                                )}
                                {rating !== undefined && (
                                    <div className="flex items-center gap-1 text-white-3 text-xs">
                                        <Star size={12} className="flex-shrink-0" />
                                        <span>{rating?.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                            {duration && (
                                <div className="flex items-center gap-1 text-white-3 text-xs">
                                    <Clock size={12} className="flex-shrink-0" />
                                    <span>{formatDuration(duration)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </figure>
        </div>
    )
}

export default GridPodcastCard