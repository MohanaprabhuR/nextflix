"use client";

import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, Fragment } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import _ from "lodash";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchShowsData } from "@/utils/fetchData";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/loader/skeleton";
import PosterImage from "@/components/imageBlurHash";

interface Video {
  video_poster_hash: string;
  id: string;
  name: string;
  description: string;
  season: string;
  poster: string;
  original_air_date: string;
}

interface Show {
  id: number;
  name: string;
  release_year: number;
  poster?: { src: string };
  src: string;
}

interface ApiResponse {
  genres: { data: Genre[] };
}
interface Genre {
  id: string;
  name: string;
}

interface CastMember {
  name: string;
  role?: string;
}

interface Banner {
  hash: string;
  src: string;
  alt?: string;
}

interface Poster {
  src: string;
  alt?: string;
}

interface Accolade {
  quote: string;
  person: string;
}

interface Show {
  accolades: Accolade[];
  id: string;
  release_year: number;
  name: string;
  description: string;
  banner: Banner;
  poster: Poster;
  genres: Genre[];
  videos: Video[];
  cast_and_crew: CastMember[];
}

interface ShowModalProps {
  show: Show;
}

export default function ShowModal({ show, initialData }: ShowModalProps) {
  const { id } = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [emblaRef] = useEmblaCarousel({ dragFree: false }, [ClassNames()]);
  const [emblaAccoladesRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 20 },
    [Autoplay({ delay: 3000, stopOnInteraction: false }), Fade()]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const { data, isLoading } = useQuery<ApiResponse, Error>({
    queryKey: ["shows", id],
    queryFn: async (): Promise<ApiResponse> => {
      try {
        const [shows] = await Promise.all([fetchShowsData(id as string)]);
        return { shows };
      } catch (err) {
        console.error("Failed to fetch data:", err);
        if (initialData) return initialData;
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    initialData,
  });
  const fetchshow = data?.shows?.data;

  //Grouping Videos by Season
  const groupedVideos = useMemo(() => {
    return _.groupBy(fetchshow?.videos ?? [], "season");
  }, [fetchshow?.videos]);
  const seasons = useMemo(
    () => _.sortBy(Object.keys(groupedVideos)),
    [groupedVideos]
  );

  //Getting Fits First Video Id
  const firstVideoId = useMemo(() => {
    const firstSeason = Object.keys(groupedVideos)[0];
    const firstVideo = groupedVideos[firstSeason]?.[0];
    return firstVideo?.id;
  }, [groupedVideos]);

  console.log("firstVideoId", firstVideoId);
  useEffect(() => {
    if (seasons.length > 0) setSelectedSeason(seasons[0]);
  }, [seasons]);

  const router = useRouter();

  const onDotClick = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSelect = useCallback((emblaApi: any) => {
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

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      router.back();
    }, 200);
  };

  useEffect(() => {
    if (seasons.length > 0) setSelectedSeason(seasons[0]);
  }, [seasons]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200 ease-in-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300 ease-in-out"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[rgba(255,255,255,0.86)] backdrop-blur-[100px]" />
        </Transition.Child>

        <div className="fixed inset-0 pt-[60px]  overflow-y-auto ">
          <div className="flex min-h-full items-center justify-center max-w-[1008px] mx-auto w-full   max-lg:max-w-[90%] max-sm:max-w-[92%]">
            <Transition.Child
              as={Fragment}
              enter="transition-all transform duration-200 ease-in-out"
              enterFrom="translate-y-full opacity-0"
              enterTo="translate-y-0 opacity-100"
              leave="transition-all transform duration-300 ease-in-out"
              leaveFrom="translate-y-0 opacity-100"
              leaveTo="translate-y-full opacity-0"
            >
              <Dialog.Panel className="w-full  transform overflow-hidden rounded-[16px_16px_0px_0px] bg-white  shadow-xl transition-all pb-40 max-sm:pb-20 ">
                <button
                  onClick={closeModal}
                  className="absolute top-3 z-[1] right-3 flex min-h-10 w-auto min-w-10 items-center justify-center rounded-full bg-black/[0.58] text-2xl text-white outline-hidden transition-all ease-in-out hover:scale-110 data-focus-visible:ring-2 data-focus-visible:ring-[#ECB03F] supports-backdrop-filter:backdrop-blur-xl"
                  aria-label="Close Modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x h-4 w-4"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
                <div className="relative">
                  <PosterImage
                    src={show?.src || "/video-poster-placeholder-image.jpg"}
                    alt={fetchshow?.name || "Show banner image"}
                    hash={show?.hash}
                    width={1920}
                    height={500}
                    layout="responsive"
                    className={`w-full h-[500px] object-cover object-center transform transition-transform ease-in-out duration-700  ${
                      isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
                  />

                  <div className="px-[48px] py-6 bg-[linear-gradient(180deg,rgba(0,0,0,0.00)_1.89%,rgba(0,0,0,0.03)_121.51%)]  backdrop-blur-[13px] absolute bottom-0 left-0 w-full max-md:relative max-lg:p-5">
                    <div className="flex justify-between items-end max-lg:flex-wrap max-lg:gap-[16px_0]">
                      {isLoading ? (
                        <div className="w-1/2 space-y-2 animate-pulse">
                          {[
                            {
                              height: "h-2",
                              width: "w-full",
                              className: "mb-4 ",
                            },
                            {
                              height: "h-10",
                              width: "w-5/6",
                              className: "mb-4 ",
                            },
                          ].map((props, index) => (
                            <Skeleton
                              key={index}
                              height={props.height}
                              width={props.width}
                              color="bg-white/10"
                              className={props.className}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="w-full max-w-2xl max-lg:max-w-full max-sm:flex-wrap   ">
                          <div className="flex gap-[0_8px] pb-2 max-sm:flex-col max-sm:flex-wrap max-sm:gap-2">
                            <p className="text-white text-[13px] font-semibold leading-[100%] tracking-[0.13px] opacity-80 max-md:text-black">
                              {fetchshow?.release_year}
                            </p>
                            <ul className="flex gap-[0_8px] max-sm:flex-wrap max-sm:gap-2">
                              {fetchshow?.genres?.map((genre: Genre) => (
                                <li
                                  key={genre.id}
                                  className="text-white text-[13px] font-semibold leading-[100%] tracking-[0.13px] opacity-80 hover:underline cursor-pointer max-md:text-black"
                                >
                                  {genre?.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <p className="text-white text-[15px] font-normal leading-[150%] tracking-[0.15px] max-md:text-black">
                            {fetchshow?.description}
                          </p>
                        </div>
                      )}
                      {isLoading ? (
                        <div className="animate-pulse w-[220px]">
                          <Skeleton
                            height="h-10"
                            color="bg-white/10"
                            className="mb-4 "
                            width="w-full"
                          />
                        </div>
                      ) : (
                        <Link
                          href={`/shows/${id}/videos/${firstVideoId}`}
                          as={`/shows/${id}/videos/${firstVideoId}`}
                          scroll={false}
                          prefetch={false}
                          className="bg-white hover:-translate-y-[2px] delay-200 transition-all ease-in-out gap-[0_8px] flex items-center outline-none rounded-[10px] text-black text-[13px] font-semibold leading-[100%] tracking-[0.13px] px-[60px] py-4 max-sm:w-full max-sm:justify-center"
                        >
                          <figure>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M4.62197 1.18373C3.7071 0.591749 2.5 1.24844 2.5 2.33813V9.66185C2.5 10.7515 3.7071 11.4082 4.62197 10.8162L10.2812 7.1544C11.1186 6.61255 11.1186 5.3874 10.2812 4.84558L4.62197 1.18373Z"
                                fill="black"
                              />
                            </svg>
                          </figure>
                          Watch Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="seasons pt-[60px]  max-w-[1008px] w-full relative max-sm:pt-10">
                  {isLoading ? (
                    <div className="px-10 max-sm:px-4 max-lg:px-6">
                      <div className="flex gap-[0_20px] w-[200px]">
                        {Array.from({ length: 2 }).map((_, index) => (
                          <Skeleton
                            key={index}
                            height="h-6"
                            width="w-[100px]"
                          />
                        ))}
                      </div>
                    </div>
                  ) : seasons.length ? (
                    <div className="px-10 max-sm:px-4 max-lg:px-6">
                      <nav
                        className="flex gap-[0_20px] max-sm:gap-[0_12px]"
                        aria-label="Seasons"
                      >
                        {seasons.map((season: string) => (
                          <button
                            key={season}
                            onClick={() => setSelectedSeason(season)}
                            className={`text-black text-xl font-[660] leading-[102%] tracking-[0.3px] max-sm:text-base ${
                              selectedSeason === season
                                ? "opacity-100"
                                : "opacity-[0.35]"
                            } transition-colors duration-200`}
                          >
                            Season {season}
                          </button>
                        ))}
                      </nav>
                    </div>
                  ) : (
                    <h3 className="text-black text-xl font-[660] leading-[102%] tracking-[0.3px] px-10 max-sm:px-4 max-lg:px-6 max-sm:text-base">
                      Season {seasons[0]}
                    </h3>
                  )}

                  <div className="embla pt-6 overflow-hidden relative max-sm:pt-4">
                    <div className="w-8 h-full rotate-180 z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_-9.38%,#FFF_100%)] absolute left-0 bottom-0"></div>
                    <div
                      className="embla__viewport px-10 max-sm:px-4 max-lg:px-6"
                      ref={emblaRef}
                    >
                      <div className="embla__container flex gap-[0_9px] is-draggable">
                        {isLoading
                          ? Array.from({ length: 4 }).map((_, index) => (
                              <div
                                key={index}
                                className="w-full max-w-[296px] flex-none"
                              >
                                <div className="relative">
                                  <Skeleton
                                    height="h-[173px]"
                                    width="w-full"
                                    className=""
                                  />
                                </div>
                                <div className="pt-6 space-y-3">
                                  <Skeleton height="h-4" width="w-3/4" />
                                  <Skeleton height="h-4" width="w-full" />
                                </div>
                              </div>
                            ))
                          : groupedVideos[selectedSeason]?.map(
                              (video: Video) => (
                                <div
                                  key={video.id}
                                  className="w-full max-w-[296px] flex-none group  max-sm:max-w-[220px]"
                                >
                                  <Link
                                    href={`/shows/${id}/videos/${video.id}`}
                                    as={`/shows/${id}/videos/${video.id}`}
                                    scroll={false}
                                    prefetch={false}
                                  >
                                    <div className="relative flex items-center justify-center">
                                      <div className="rounded-xl  overflow-hidden ">
                                        <PosterImage
                                          src={
                                            video.poster ||
                                            "/video-poster-placeholder-image.jpg"
                                          }
                                          alt={`${video.name} - Episode thumbnail`}
                                          hash={video.video_poster_hash}
                                          width={296}
                                          height={173}
                                          className={`object-cover  group-hover:scale-[1.03] delay-100 transition-all duration-300 ease-in-out group-hover:shadow-[0px_25px_44.7px_-10px_rgba(0,0,0,0.25)] ${
                                            isLoaded
                                              ? "opacity-100"
                                              : "opacity-0"
                                          }`}
                                          onLoad={() => setIsLoaded(true)}
                                        />
                                      </div>
                                      <div className="absolute delay-100 duration-200 transition-all ease-in-out opacity-0 group-hover:opacity-100 w-12 flex items-center justify-center h-12 bg-[rgba(255,255,255,0.31)] shadow-[0px_5px_21px_0px_rgba(0,0,0,0.25)] backdrop-blur-[5px] rounded-[77px]">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="11"
                                          height="14"
                                          viewBox="0 0 11 14"
                                          fill="none"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M0.166859 0.342528C-3.92621e-07 0.570901 0 0.97997 0 1.79811V12.2019C0 13.02 -3.92621e-07 13.4291 0.166859 13.6575C0.312269 13.8565 0.534852 13.981 0.776864 13.9987C1.05457 14.019 1.39039 13.7978 2.06203 13.3554L9.95916 8.15353C10.542 7.76962 10.8334 7.57767 10.934 7.33359C11.022 7.12032 11.022 6.87967 10.934 6.66641C10.8334 6.42233 10.542 6.23038 9.95916 5.84647L2.06204 0.644582C1.3904 0.202167 1.05457 -0.0190398 0.776864 0.00128416C0.534852 0.0189958 0.312269 0.143511 0.166859 0.342528Z"
                                            fill="white"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  </Link>
                                  <div className="pt-6">
                                    <h2 className="text-black text-base font-[430] leading-[100%] tracking-[0.4px]">
                                      {video.name}
                                    </h2>
                                    <p className="text-[#8B8787] text-sm font-[410] leading-[150%] tracking-[0.35px] pt-2 pb-3">
                                      {_.truncate(video.description, {
                                        length: 80,
                                        separator: " ",
                                        omission: "...",
                                      })}
                                    </p>
                                    <p className="text-[#8B8787] text-[13px] font-normal leading-[100%] tracking-[0.13px]">
                                      {video.original_air_date}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                      </div>
                    </div>
                    <div className="w-8 z-10 h-full bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_-9.38%,#FFF_100%)] absolute right-0 bottom-0"></div>
                  </div>
                </div>

                <div className="flex justify-between pt-20 px-10 max-sm:px-4 max-sm:pt-16 max-md:flex-wrap">
                  {isLoading ? (
                    <div className="w-1/2 space-y-2 animate-pulse">
                      {[
                        {
                          height: "h-2",
                          width: "w-full",
                          className: "mb-2 ",
                        },
                        {
                          height: "h-10",
                          width: "w-5/6",
                          className: "mb-4 ",
                        },
                      ].map((props, index) => (
                        <Skeleton
                          key={index}
                          height={props.height}
                          width={props.width}
                          className={props.className}
                        />
                      ))}
                      <div className="flex gap-[0_20px]">
                        {Array.from({ length: 2 }).map((_, index) => (
                          <Skeleton
                            key={index}
                            height="h-6"
                            width="w-[100px]"
                            className=""
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 w-full max-w-[608px] max-md:max-w-full">
                      <h2 className="text-black text-xl font-[660] leading-[102%] tracking-[0.3px]">
                        {fetchshow?.name}
                      </h2>
                      <p className="text-[#484848] text-base font-[410] leading-[160%] tracking-[0.4px]">
                        {fetchshow?.description}
                      </p>
                      <ul className="flex gap-[0_8px]">
                        {fetchshow?.genres?.map((genre: Genre) => (
                          <li key={genre.id}>
                            <Link
                              className="bg-[#F7F7F7] text-[#8B8787] text-sm font-[430] leading-[100%] tracking-[0.35px] px-2.5 py-1.5 rounded-[8px]"
                              href={`/genres/${genre.id}`}
                            >
                              {genre.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-center items-center flex-col max-md:w-full">
                    {fetchshow?.accolades?.length > 1 && (
                      <>
                        <figure>
                          <svg
                            width="40"
                            height="40"
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              opacity="0.9"
                              d="M24.8853 7.30919C25.6852 8.55259 26.9295 9.88482 28.7071 11.0394C28.5293 8.73022 27.0184 7.13156 25.7741 6.15459C24.4409 5.26644 23.4632 5 23.4632 5C23.4632 5 23.9965 6.15459 24.8853 7.30919ZM10.2203 11.0394C11.9978 9.88482 13.2421 8.55259 14.0421 7.30919C14.9308 6.15459 15.3752 5.08881 15.3752 5.08881C15.3752 5.08881 14.3976 5.35526 13.0644 6.24341C11.909 7.13156 10.398 8.73022 10.2203 11.0394ZM4.35423 14.592C4.17648 16.013 4.35423 17.7893 5.50966 19.0327L5.3319 19.9209C5.3319 20.0985 5.50966 20.2762 5.68742 20.2762C5.86518 20.2762 6.04294 20.1873 6.13181 20.0097L6.30957 19.1216C7.73164 18.4999 8.79819 17.4341 9.50922 16.5459C9.86474 16.013 10.2203 15.569 10.398 15.2137C10.5758 14.8584 10.7535 14.592 10.7535 14.592C10.7535 14.592 9.86474 14.592 8.70931 15.1249C7.9094 15.569 6.75397 16.5459 6.13181 18.1446C6.30957 16.4571 6.30957 15.1249 5.95406 13.9703C5.68742 12.7269 5.24302 11.8387 5.24302 11.8387C5.24302 11.8387 5.06527 12.194 4.88751 12.6381C4.70975 13.171 4.44311 13.7927 4.35423 14.592ZM8.17603 13.4374L7.82052 14.2367C7.73164 14.4144 7.82052 14.592 7.99828 14.6808C8.17603 14.7696 8.35379 14.6808 8.44267 14.5032L8.79819 13.7039C10.3091 13.4374 11.3757 12.7269 12.2645 12.0164L12.4422 11.9276C12.9755 11.5723 13.331 11.1282 13.5977 10.8618C13.8643 10.5953 14.0421 10.4177 14.0421 10.4177C14.0421 10.4177 13.1533 10.1513 11.9978 10.5065C11.0202 10.773 9.86474 11.3947 8.97595 12.7269C9.50922 11.217 9.68698 9.97363 9.68698 8.90785C9.42034 7.48681 9.24258 6.68748 9.24258 6.68748C9.06482 6.50985 6.39845 10.5065 8.17603 13.4374ZM2.84329 27.1149C3.6432 28.98 5.42078 30.6675 7.55388 30.7563C7.82052 31.2004 8.17603 31.9109 8.26491 31.8221C8.44267 31.9997 8.62043 31.9997 8.79819 31.9109C8.97594 31.8221 8.97595 31.5556 8.88707 31.378C8.88707 31.378 8.44267 30.6675 8.17603 30.3122C9.50922 27.3813 9.5981 24.8057 9.5981 23.7399C9.5981 23.3847 9.5981 23.207 9.68698 23.1182C9.68698 23.1182 8.62043 23.5623 7.82052 24.7169C7.10948 25.7827 6.48733 27.7366 7.55388 29.957C6.30957 27.9142 5.24302 26.4044 4.17648 25.2498C3.10993 24.0952 2.31002 23.4735 2.13226 23.2959C1.86562 23.2959 1.9545 25.0722 2.84329 27.1149ZM5.24302 33.1543C6.75397 34.5753 8.97595 35.4635 11.0202 34.8418L12.0867 35.6411C12.2645 35.7299 12.4422 35.7299 12.5311 35.5523C12.62 35.3747 12.5311 35.197 12.4422 35.1082L11.3757 34.3089C11.5534 32.2662 11.109 30.5787 10.7535 29.4241C10.5758 28.5359 10.3091 27.8254 10.1314 27.4702C10.0425 27.2925 10.0425 27.2037 10.0425 27.2037C10.0425 27.2037 9.24258 27.9142 8.97595 29.3353C8.62043 30.6675 8.97595 32.6214 10.8424 34.3089C9.1537 33.0655 7.64276 32.1773 6.39845 31.4668C6.22069 31.378 5.95406 31.2004 5.7763 31.1116C4.17648 30.3122 3.02105 29.957 3.02105 29.957C3.02105 29.957 3.10993 30.401 3.55432 31.0227L3.6432 31.2004C3.99872 31.7333 4.53199 32.4438 5.24302 33.1543ZM19.197 38.3056C19.2859 38.1279 19.1082 37.9503 18.9304 37.8615L17.5972 37.4174C17.0639 35.3747 15.9085 33.776 15.0197 32.7102C14.0421 31.5556 13.331 30.7563 13.331 30.7563C13.331 30.7563 13.2421 31.0227 13.1533 31.4668C13.0644 31.9109 12.9755 32.5326 13.2421 33.2431C13.5088 34.5753 14.6642 36.3516 17.0639 37.4174C14.5753 36.5293 12.5311 36.3516 10.8424 36.174C8.97595 36.0852 7.73164 36.174 7.73164 36.174C7.9094 36.3516 9.24258 37.595 11.1979 38.3056C13.1533 39.0161 15.6419 39.1049 17.4195 37.8615L18.7526 38.3056C18.9304 38.572 19.197 38.4832 19.197 38.3056ZM3.02105 20.5426C3.19881 22.4077 3.90984 24.5393 5.68742 25.4274L5.86518 26.6708C5.86518 26.8484 6.04294 27.0261 6.22069 26.9373C6.39845 26.8484 6.48733 26.6708 6.48733 26.4932L6.39845 25.3386C7.82052 24.0064 8.70931 22.5853 9.24258 21.3419C9.77586 20.4538 9.95362 19.5656 10.0425 19.2104C10.0425 19.0327 10.1314 18.9439 10.1314 18.9439C10.1314 18.9439 9.1537 19.1216 8.08715 20.0985C7.10949 20.8979 5.95406 22.4965 6.04294 24.8057C6.04294 24.8057 6.04294 24.8057 5.95406 24.8057C5.68742 22.4965 5.15415 20.809 4.62087 19.4768C3.99872 17.967 3.28768 17.0788 3.28768 17.0788C3.28768 17.0788 3.10993 17.4341 3.10993 18.1446C3.10993 18.7663 3.02105 19.6544 3.02105 20.5426ZM31.9956 19.0327C31.8179 17.3453 31.8179 16.013 32.1734 14.8584C32.44 13.5262 32.8844 12.7269 32.8844 12.7269L33.2399 13.5262V13.615C33.4177 14.0591 33.6843 14.7696 33.6843 15.4802C33.8621 16.9012 33.6843 18.6775 32.5289 19.9209L32.7067 20.809C32.7067 20.9867 32.6178 21.1643 32.44 21.1643C32.2623 21.1643 32.0845 21.0755 31.9956 20.8979L31.8179 20.0097C30.3958 19.388 29.3293 18.3222 28.6182 17.4341C28.2627 16.9012 27.9072 16.4571 27.7294 16.1019C27.5517 15.7466 27.3739 15.4802 27.3739 15.4802C27.3739 15.4802 28.2627 15.4801 29.4181 16.013C30.218 16.5459 31.3735 17.4341 31.9956 19.0327ZM30.1292 13.5262C29.2404 12.194 27.9961 11.6611 27.0184 11.3947C25.863 11.0394 24.9742 11.3059 24.9742 11.3059C24.9742 11.3059 25.1519 11.4835 25.4186 11.7499C25.6852 12.0164 26.0407 12.4604 26.574 12.8157L26.7518 12.9045C27.6406 13.5262 28.7071 14.3256 30.218 14.5032L30.5736 15.3025C30.6624 15.4801 30.8402 15.569 31.018 15.4802C31.1957 15.3913 31.2846 15.2137 31.1957 15.0361L30.8402 14.3256C32.6178 11.3947 29.8625 7.48682 29.7736 7.57563C29.7736 7.57563 29.507 8.37496 29.4181 9.70719C29.4181 10.773 29.5959 12.0164 30.1292 13.5262ZM34.8398 26.2267C35.9952 25.0722 36.7951 24.3616 36.9729 24.2728C37.0617 24.2728 36.9729 26.0491 36.0841 28.0919C35.2842 29.957 33.5066 31.6444 31.3735 31.7333C31.1068 32.1773 30.7513 32.8879 30.6624 32.799C31.018 32.6214 31.2846 32.4438 31.6401 32.2662C31.9067 32.1773 32.0845 31.9997 32.2623 31.9109C33.8621 31.1116 35.0175 30.7563 35.0175 30.7563C35.0175 30.7563 34.9286 31.2004 34.4842 31.8221L34.3954 31.9997C34.0398 32.6214 33.5066 33.3319 32.7955 34.0424C31.2846 35.4635 29.0626 36.3516 27.0184 35.7299L25.9518 36.5293C25.7741 36.6181 25.5963 36.6181 25.5075 36.4405C25.4186 36.2628 25.5075 36.0852 25.5963 35.9964L26.6629 35.197C26.4851 33.1543 26.9295 31.4668 27.285 30.3122C27.4628 29.4241 27.7294 28.7136 27.9072 28.3583C27.9961 28.1807 27.9961 28.0919 27.9961 28.0919C27.9961 28.0919 28.8849 28.8024 29.0626 30.2234C29.4181 31.5556 29.0626 33.5096 27.1962 35.197C28.3516 34.3089 29.4181 33.5984 30.4847 33.0655C30.3958 33.0655 30.218 33.0655 30.1292 32.9767C29.9514 32.8879 29.9514 32.6214 30.0403 32.4438C30.0403 32.4438 30.4847 31.7333 30.7513 31.378C29.4181 28.4471 29.3293 25.8715 29.3293 24.8057C29.3293 24.4504 29.3293 24.2728 29.2404 24.184C29.2404 24.184 30.3069 24.6281 31.1068 25.7827C31.8179 26.8484 32.44 28.8024 31.3735 31.0227C32.7067 28.8912 33.8621 27.3813 34.8398 26.2267ZM21.9523 37.595C24.4409 36.7069 26.4851 36.5293 28.1738 36.3516C30.0403 36.2628 31.2846 36.3516 31.2846 36.3516C31.1068 36.5293 29.7736 37.7727 27.8183 38.4832C25.863 39.1937 23.3744 39.2825 21.5968 38.0391L20.2636 38.4832C20.0858 38.572 19.9081 38.4832 19.8192 38.3056C19.7303 38.1279 19.9081 37.9503 20.0858 37.8615L21.419 37.4174C21.9523 35.3747 23.1077 33.776 23.9965 32.7102C24.9742 31.5556 25.6852 30.7563 25.6852 30.7563C25.6852 30.7563 25.7741 31.0227 25.863 31.4668C25.9518 31.9109 26.0407 32.5326 25.7741 33.2431C25.4186 34.6642 24.2631 36.4405 21.9523 37.595ZM35.8174 18.0558C35.7285 17.4341 35.6397 16.99 35.6397 16.99C35.6397 16.99 34.9286 17.8782 34.3065 19.388C33.7732 20.7202 33.3288 22.4965 32.9733 24.7169C32.9733 24.7169 32.9733 24.7169 32.8844 24.7169C32.9733 22.4077 31.8179 20.809 30.8402 20.0097C29.7736 19.0327 28.7071 18.8551 28.7071 18.8551C28.7071 18.8551 28.7071 18.9439 28.796 19.1216C28.8849 19.4768 29.1515 20.365 29.5959 21.2531C30.1292 22.4965 31.1068 23.9176 32.44 25.2498L32.2623 26.4932C32.2623 26.6708 32.3511 26.8484 32.5289 26.9373C32.7067 27.0261 32.8844 26.8484 32.8844 26.6708L33.0622 25.4274C34.8398 24.5393 35.5508 22.4077 35.7285 20.5426C35.9952 19.6544 35.9063 18.7663 35.8174 18.0558Z"
                              fill="#ECB03F"
                            />
                          </svg>
                        </figure>
                        <div className="relative embla  pt-5 ">
                          <div
                            ref={emblaAccoladesRef}
                            className="overflow-hidden embla-viewport max-w-[216px] w-full pb-1"
                          >
                            <div className="embla__container flex gap-[0_6px] is-draggable">
                              {show.accolades.map((content, index) => (
                                <div key={index} className="min-w-full">
                                  <p className="text-black text-center text-xl not-italic font-medium leading-[122%]">
                                    {content.quote}
                                  </p>
                                  <p className="text-[#8B8787] text-center text-[13px] not-italic font-normal leading-[100%] tracking-[0.13px] pt-2">
                                    {content.person}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div
                            className="embla__controls flex justify-center pt-2"
                            role="region"
                            aria-label="Carousel navigation "
                          >
                            <div className="embla__dots flex gap-[0_4px]">
                              {scrollSnaps.map((_, index) => (
                                <button
                                  key={`dot-${index}`}
                                  type="button"
                                  className={`embla__dot w-[4px] h-[4px] rounded-full ${
                                    index === selectedIndex
                                      ? "embla__dot--selected bg-black"
                                      : "bg-[#000000] bg-opacity-20"
                                  }`}
                                  aria-label={`Go to slide ${index + 1}`}
                                  aria-current={
                                    index === selectedIndex ? "true" : "false"
                                  }
                                  onClick={() => onDotClick(index)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
