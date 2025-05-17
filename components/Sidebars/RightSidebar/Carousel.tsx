import React, { useCallback } from 'react'
import { EmblaCarouselType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { CarouselProps } from '@/types'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LoaderSpinner from '../../LoaderSpinner'
import CarouselDots from '../../ui/CarouselDots'

const EmblaCarousel = ({ fansLikeDetail }: CarouselProps) => {
  const router = useRouter();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()])
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay || !("stopOnInteraction" in autoplay.options)) return

    const resetOrStop =
      autoplay.options.stopOnInteraction === false
        ? (autoplay.reset as () => void)
        : (autoplay.stop as () => void)

    resetOrStop()
  }, [])

  // Initialize and update scroll snaps and selected index
  React.useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList())
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', onSelect)
    emblaApi.on('init', onInit)

    onInit()

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('init', onInit)
    }
  }, [emblaApi])

  const slides = fansLikeDetail && fansLikeDetail?.filter((item: any) => item.totalPodcasts > 0)

  if (!slides) return <LoaderSpinner />

  return (
    <section className="flex w-full flex-col overflow-hidden pb-1" ref={emblaRef}>
      <div className="flex">
        {slides.slice(0, 4).map((item) => (
          <figure
            key={item._id}
            className="carousel_box"
            onClick={() => router.push(`/podcasts/${item.podcast[0]?.podcastId}`)}
          >
            <Image
              src={item.podcast[0]?.podcastImage || item.imageUrl}
              alt={item.podcast[0]?.podcastTitle || "Podcast"}
              fill
              className="absolute rounded-xl border-none object-cover"
            />
            <div className="glassmorphism-black relative flex flex-col rounded-b-xl p-2">
              <h2 className="truncate text-14 font-semibold text-white-1">{item.podcast[0]?.podcastTitle}</h2>
              <p className="truncate text-12 font-normal text-white-2">{item.name}</p>
            </div>
          </figure>
        ))}
      </div>

      {/* Using the CarouselDots component */}
      <CarouselDots
        totalSlides={scrollSnaps.length}
        selectedIndex={selectedIndex}
        onDotClick={(index) => {
          emblaApi?.scrollTo(index)
          onNavButtonClick(emblaApi as EmblaCarouselType)
        }}
        className="gap-2"
      />
    </section>
  )
}

export default EmblaCarousel
