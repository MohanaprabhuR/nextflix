"use client";
import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel, { EmblaCarouselType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import PosterImage from "@/components/imageBlurHash";
import Link from "next/link";

interface Genre {
  id: string;
  name: string;
}

interface Show {
  description: string;
  genres: Genre[];
  id: number;
  name: string;
  banner: {
    hash: string;
    src: string;
  };
}

interface CarouselProps {
  shows: Show[];
}

const HeroCarousel: React.FC<CarouselProps> = ({ heroCarousel }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const autoplayOptions = {
    delay: 3000,
    rootNode: (emblaRoot: HTMLElement | null) =>
      emblaRoot?.parentElement ?? undefined,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 20,
    },
    [Autoplay(autoplayOptions), Fade()]
  );

  const onDotClick = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  return (
    <div className="w-full max-w-[1332px] mx-auto px-4">
      <div className="relative embla rounded-2xl overflow-hidden max-sm:rounded-none">
        <div ref={emblaRef} className="overflow-hidden embla-viewport">
          <div className="flex">
            {heroCarousel?.map((carousel) => (
              <Link
                href={`/shows/${carousel.id}`}
                key={carousel.id}
                className="embla__slide relative flex-[0_0_100%] min-w-0"
                scroll={false}
              >
                <figure className="size-full max-md:size-auto max-md:rounded-2xl max-md:overflow-hidden">
                  <PosterImage
                    src={
                      carousel?.banner?.src ||
                      "/video-poster-placeholder-image.jpg"
                    }
                    hash={carousel?.banner?.hash}
                    width={1300}
                    height={734}
                    alt={carousel.name}
                    layout="responsive"
                    className={`object-cover transform transition-all ease-out duration-500 ${
                      loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
                  />
                </figure>

                <div className="px-[48px] py-6  bg-[linear-gradient(180deg,rgba(0,0,0,0.00)_1.89%,rgba(0,0,0,0.03)_121.51%)] backdrop-blur-[13px]  absolute bottom-0 left-0 w-full max-lg:px-4 max-lg:py-6 max-md:relative">
                  <div className="w-full max-w-3xl z-10 relative">
                    <h2 className="text-white text-2xl font-semibold leading-[115%] pb-4 max-md:text-black">
                      {carousel.name}
                    </h2>
                    <ul className="flex gap-[0_8px] pb-2">
                      {carousel.genres.map((genre) => (
                        <li
                          key={genre.id}
                          className="text-white text-[13px] font-semibold leading-[100%] tracking-[0.13px] opacity-80 hover:underline cursor-pointer max-md:text-black"
                        >
                          {genre.name}
                        </li>
                      ))}
                    </ul>
                    <p className="text-white text-sm font-normal leading-[150%] tracking-[0.14px] pb-4 max-md:text-black">
                      {carousel.description}
                    </p>
                    <button className="hover:-translate-y-[2px] transition-all delay-300 ease-in-out bg-white outline-none rounded-[10px] text-black text-[13px] font-semibold leading-[100%] tracking-[0.13px] px-[30px] py-3 max-sm:w-full max-sm:text-center">
                      Watch Now
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div
          className="embla__controls absolute bottom-6 right-6"
          role="region"
          aria-label="Carousel navigation"
        >
          <div className="embla__dots flex gap-[0_4px]">
            {scrollSnaps.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                className={`embla__dot w-[6px] h-[6px] rounded-full ${
                  index === selectedIndex
                    ? "embla__dot--selected bg-white"
                    : "bg-white bg-opacity-30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selectedIndex ? "true" : "false"}
                onClick={() => onDotClick(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
