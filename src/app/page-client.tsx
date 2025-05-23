"use client";

import HeroCarousal from "@/components/herocarousal/heroCarousal";
import Showcarousal from "@/components/showcarousal/showCarousal";
import { useQueries } from "@tanstack/react-query";
import {
  fetchShows,
  fetchHeroCarouselData,
  fetchShowCarouselData,
} from "@/utils/fetchData";

export interface Show {
  id: number;
  name: string;
  description: string;
  genres: Genre[];
  banner: {
    hash: string;
    src: string;
  };
  poster: {
    hash: string;
    src: string;
  };
}

export interface Genre {
  id: string;
  name: string;
  shows: Show[];
}

export interface heroCarousel {
  id: number;
  name: string;
  description: string;
  genres: Genre[];
  banner: {
    hash: string;
    src: string;
  };
  poster: {
    hash: string;
    src: string;
  };
}
export interface showCarousel {
  id: number;
  name: string;
  description: string;
  genres: Genre[];
  banner: {
    hash: string;
    src: string;
  };
  poster: {
    hash: string;
    src: string;
  };
}

interface ApiResponse {
  shows: { data: Show[] };
  genres: { data: Genre[] };
  heroCarousel: { data: heroCarousel[] };
  showcarousel: { data: showCarousel[] };
}

export default function HomeClient({
  initialData,
}: {
  initialData: ApiResponse;
}) {
  const [showsQuery, heroCarousel, showCarousel] = useQueries({
    queries: [
      {
        queryKey: ["shows"],
        queryFn: fetchShows,
        staleTime: 5 * 60 * 1000,
        initialData: initialData.shows,
      },
      {
        queryKey: ["heroCarousel"],
        queryFn: fetchHeroCarouselData,
        staleTime: 5 * 60 * 1000,
        initialData: initialData.heroCarousel,
      },
      {
        queryKey: ["showCarousel"],
        queryFn: fetchShowCarouselData,
        staleTime: 5 * 60 * 1000,
        initialData: initialData.showcarousel,
      },
    ],
  });

  const shows: Show[] = showsQuery.data?.data || [];
  const herocarousel: herocarousel[] = heroCarousel.data?.data || [];
  const showcarousel: showcarousel[] = heroCarousel.data?.data || [];

  const isLoading =
    showsQuery.isLoading || herocarousel.isLoading || showcarousel.isLoading;
  const isError =
    showsQuery.isError || herocarousel.isError || showcarousel.isError;
  const isPending =
    showsQuery.isPending || herocarousel.isPending || showcarousel.isPending;

  if (isPending) {
    return <div className="text-red-500 text-center mt-20">Pending...</div>;
  }

  if (isLoading) {
    return <div className="text-red-500 text-center mt-20">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center mt-20">
        Error loading data. Please try again later.
      </div>
    );
  }

  const heroCarousalShows = heroCarousel?.data?.data?.hero_carousel?.shows;
  const showCarousal = showCarousel?.data?.data?.show_carousel;

  return (
    <div className="pt-16">
      <HeroCarousal shows={shows} heroCarousel={heroCarousalShows} />
      <div className=" pb-5">
        {showCarousal?.map((list) => {
          return (
            <div key={list.id}>
              <section className="overflow-hidden relative">
                <div className="w-full max-w-[1332px] mx-auto px-4 py-20 max-lg:py-16 max-md:py-10 max-sm:py-6">
                  <h2 className="pb-6 text-black text-2xl font-semibold leading-[115%] max-sm:text-xl max-sm:pb-3">
                    {list.carousel_name}
                  </h2>
                  <div className="w-[92px] h-[341px] opacity-[0.67] z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_50%,#FFF_100%)] absolute left-0 rotate-180 bottom-16 max-sm:bottom-0"></div>
                  <Showcarousal shows={list.shows} />
                  <div className="w-[92px] z-10 h-[341px] opacity-[0.67] bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_50%,#FFF_100%)] absolute right-0 bottom-16 max-sm:bottom-0"></div>
                </div>
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
