"use client";

import HeroCarousal from "@/components/herocarousal/heroCarousal";
import Showcarousal from "@/components/showcarousal/showCarousal";
import { useQuery } from "@tanstack/react-query";
import { fetchShows, fetchGenres } from "@/utils/fetchData";

interface Show {
  id: number;
  title: string;
  [key: string]: unknown;
}

interface Genre {
  id: number;
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
  const { data, isLoading, isError, error } = useQuery<ApiResponse, Error>({
    queryKey: ["shows-genres"],
    queryFn: async (): Promise<ApiResponse> => {
      try {
        const [shows, genres] = await Promise.all([
          fetchShows(),
          fetchGenres(),
        ]);
        return { shows, genres };
      } catch (error) {
        console.error("Failed to fetch data", error);
        return data ?? initialData;
      }
    },
    staleTime: 5 * 60 * 1000,
    initialData,
  });

  if (isLoading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center mt-20">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div>
      <HeroCarousal shows={data?.shows?.data} />
      <section className="overflow-hidden">
        <div className="relative">
          <Showcarousal shows={data?.shows?.data} title="Now Showing" />
          <div className="w-[92px] h-[341px] opacity-[0.67] bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_50%,#FFF_100%)] absolute right-0 -bottom-4"></div>
        </div>

        {data?.genres?.data?.map((genre) => {
          const matchingShows = data?.shows?.data?.filter((show) =>
            genre.shows.some((gShow) => gShow.id === show.id)
          );

          return (
            <div key={genre.id} className="mt-8">
              {matchingShows.length > 0 && (
                <div className="relative">
                  <Showcarousal shows={matchingShows} title={genre.name} />
                  <div className="w-[92px] h-[341px] opacity-[0.67] bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_50%,#FFF_100%)] absolute right-0 -bottom-4"></div>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
