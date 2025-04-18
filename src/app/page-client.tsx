"use client";

import HeroCarousal from "@/components/herocarousal/heroCarousal";
import Showcarousal from "@/components/showcarousal/showCarousal";
import { useQueries } from "@tanstack/react-query";
import { fetchShows, fetchGenres } from "@/utils/fetchData";

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

interface ApiResponse {
  shows: { data: Show[] };
  genres: { data: Genre[] };
}

export default function HomeClient({
  initialData,
}: {
  initialData: ApiResponse;
}) {
  const [showsQuery, genresQuery] = useQueries({
    queries: [
      {
        queryKey: ["shows"],
        queryFn: fetchShows,
        staleTime: 5 * 60 * 1000,
        initialData: initialData.shows,
      },
      {
        queryKey: ["genres"],
        queryFn: fetchGenres,
        staleTime: 5 * 60 * 1000,
        initialData: initialData.genres,
      },
    ],
  });

  const shows: Show[] = showsQuery.data?.data || [];
  const genres: Genre[] = genresQuery.data?.data || [];
  const isLoading: boolean = showsQuery.isLoading || genresQuery.isLoading;
  const isError: boolean = showsQuery.isError || genresQuery.isError;
  const isPending: boolean = showsQuery.isPending || genresQuery.isPending;

  if (isPending) {
    return <div className="text-red-500 text-center mt-20">Pending...</div>;
  }

  if (isLoading) {
    return <div className="text-red-500 text-center mt-20">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center mt-20">Error loading data.</div>
    );
  }

  console.log("shows:", shows);

  return (
    <div>
      <HeroCarousal shows={shows} />
      <section className="overflow-hidden pb-5">
        <div className="relative">
          <div className="w-[92px] h-[341px] opacity-[0.67] z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_50%,#FFF_100%)] absolute left-0 rotate-180 -bottom-4"></div>
          <Showcarousal shows={shows} title="Now Showing" />
          <div className="w-[92px] z-10 h-[341px] opacity-[0.67] bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_50%,#FFF_100%)] absolute right-0 -bottom-4"></div>
        </div>

        {genres.map((genre: Genre) => {
          const matchingShows: Show[] = shows.filter((show: Show) =>
            genre.shows.some((gShow: Show) => gShow.id === show.id)
          );
          return (
            <div key={genre.id} className="mt-8">
              {matchingShows.length > 0 && (
                <div className="relative">
                  <div className="w-[92px] h-[341px] opacity-[0.67] z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_50%,#FFF_100%)] absolute left-0 rotate-180 -bottom-4"></div>
                  <Showcarousal shows={matchingShows} title={genre.name} />
                  <div className="w-[92px] h-[341px] opacity-[0.67] z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_50%,#FFF_100%)] absolute right-0 -bottom-4"></div>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
