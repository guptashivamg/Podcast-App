import React from 'react'
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Clock, Headphones, Heart, Play } from "lucide-react"
import { podcastTypes, languageOptions } from '@/constants/PodcastFields'

interface ListPodcastCardProps {
    _id: string
    podcastTitle: string
    imageUrl: string
    views?: number
    audioDuration: number
    author: string
    likeCount?: number
    index: number
    podcastType?: string
    language?: string
}

const ListPodcastCard = ({
    _id,
    podcastTitle,
    imageUrl,
    views,
    audioDuration,
    author,
    likeCount,
    index,
    podcastType,
    language
}: ListPodcastCardProps) => {
    const router = useRouter()

    function formatAudioDuration(duration: number): string {
        const hours = Math.floor(duration / 3600)
        const minutes = Math.floor((duration % 3600) / 60)
        const seconds = Math.floor(duration % 60)

        const formattedHours = hours < 10 ? `0${hours}:` : `${hours}:`
        const formattedMinutes = minutes < 10 ? `0${minutes}:` : `${minutes}:`
        const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`

        return formattedHours + formattedMinutes + formattedSeconds
    }

    return (
        <div
            onClick={() => router.push(`/podcasts/${_id}`)}
            className="flex cursor-pointer items-center hover:bg-white-1/5 rounded-lg p-3 transition-all duration-300 group hover:shadow-md hover:shadow-black/20"
        >
            <span className="inline-block text-center w-8 text-sm font-medium text-orange-1 group-hover:scale-110 transition-transform">
                {(index + 1).toString().padStart(2, '0')}
            </span>
            <div className="flex flex-col size-full gap-3">
                <div className="flex justify-between items-center">
                    <figure className="flex items-center gap-3">
                        <div className="relative overflow-hidden rounded-lg">
                            <Image
                                src={imageUrl}
                                alt={podcastTitle}
                                width={80}
                                height={80}
                                className="aspect-square rounded-lg group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <div className="bg-orange-1/80 rounded-full p-2 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                    <Play size={16} className="fill-black text-black" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-16 font-semibold text-white-1 truncate w-[350px] max-sm:w-[100px] group-hover:text-orange-1 transition-colors">
                                {podcastTitle}
                            </h2>
                            <p className="text-base text-white-2 group-hover:text-white-1 transition-colors">{author}</p>
                        </div>
                    </figure>
                    <div className="flex flex-col items-end gap-2">
                        {/* Category and language badges */}
                        {(podcastType || language) && (
                            <div className="flex flex-wrap gap-1 justify-end">
                                {podcastType && (
                                    <span className="inline-block bg-orange-1/20 text-orange-1 text-xs px-2 py-0.5 rounded-full">
                                        {podcastTypes.find(c => c.value === podcastType)?.label || podcastType}
                                    </span>
                                )}
                                
                                {language && (
                                    <span className="inline-flex items-center bg-white-1/10 text-white-2 text-xs px-2 py-0.5 rounded-full">
                                        {languageOptions.find(l => l.value === language)?.label || language}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-6">
                            <figure className="flex gap-2 items-center group-hover:scale-105 transition-transform">
                                <Headphones size={20} className="text-white-2 group-hover:text-orange-1 transition-colors" />
                                <span className="text-14 font-medium text-white-1">{views}</span>
                            </figure>
                            <figure className="flex gap-2 items-center group-hover:scale-105 transition-transform">
                                <Heart size={20} className="text-white-2 group-hover:text-orange-1 transition-colors" />
                                <span className="text-14 font-medium text-white-1">{likeCount || 0}</span>
                            </figure>
                            <figure className="flex gap-2 items-center max-sm:hidden group-hover:scale-105 transition-transform">
                                <Clock size={20} className="text-white-2 group-hover:text-orange-1 transition-colors" />
                                <span className="text-14 font-medium text-white-1">{formatAudioDuration(audioDuration)}</span>
                            </figure>
                        </div>
                    </div>
                </div>
                <hr className="border-gray-800 group-hover:border-gray-700 transition-colors" />
            </div>
        </div>
    )
}

export default ListPodcastCard
