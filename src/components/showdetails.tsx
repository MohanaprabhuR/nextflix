"use client";
import Image from "next/image";
import _ from "lodash";
import { useState, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";
import Link from "next/link";
import { Blurhash } from "react-blurhash";

interface Video {
  video_poster_hash: string;
  id: string;
  name: string;
  description: string;
  season: string;
  poster: string;
  original_air_date: string;
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

interface Show {
  id: unknown;
  release_year: number;
  name: string;
  description: string;
  banner: Banner;
  poster: Poster;
  genres: Genre[];
  videos: Video[];
  cast_and_crew: CastMember[];
}

interface ShowDetailsProps {
  show: Show;
}

export default function ShowDetails({ show }: ShowDetailsProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const options = {
    dragFree: false,
  };
  const [emblaRef] = useEmblaCarousel(options, [ClassNames()]);

  const groupedVideos = useMemo(() => {
    return _.groupBy(show?.videos ?? [], "season");
  }, [show?.videos]);

  const seasons = useMemo(() => {
    return _.sortBy(Object.keys(groupedVideos ?? {}));
  }, [groupedVideos]);

  const [selectedSeason, setSelectedSeason] = useState<string>(
    seasons.length > 0 ? seasons[0] : ""
  );

  return (
    <div className="bg-white max-w-[1008px] w-full rounded-[16px_16px_0px_0px] overflow-hidden mx-auto pb-10">
      <div className="relative">
        <Image
          src={show?.banner?.src || "/video-poster-placeholder-image.jpg"}
          alt={show?.name}
          width={1920}
          height={500}
          className={`w-full h-[500px] object-cover object-center ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
        />
        {!isLoaded && (
          <Blurhash
            hash={show?.banner?.hash}
            width={1920}
            height={500}
            resolutionX={32}
            resolutionY={32}
            punch={1}
            className="absolute inset-0"
          />
        )}

        <div className="px-[48px] py-6 bg-[linear-gradient(180deg,rgba(0,0,0,0.00)_1.89%,rgba(0,0,0,0.03)_121.51%)] backdrop-blur-[13px] absolute bottom-0 left-0 w-full">
          <div className="flex justify-between items-end">
            <div className="w-full max-w-2xl">
              <div className="flex gap-[0_8px] pb-2">
                <p className="text-white text-[13px] font-semibold leading-[100%] tracking-[0.13px] opacity-80">
                  {show?.release_year}
                </p>
                <ul className="flex gap-[0_8px]">
                  {show?.genres?.map((genre: Genre) => (
                    <li
                      key={genre.id}
                      className="text-white text-[13px] font-semibold leading-[100%] tracking-[0.13px] opacity-80 hover:underline cursor-pointer"
                    >
                      {genre.name}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-white text-[15px] font-normal leading-[150%] tracking-[0.15px]">
                {show?.description}
              </p>
            </div>
            <button className="bg-white hover:-translate-y-[2px] delay-200 transition-all ease-in-out gap-[0_8px] flex items-center outline-none rounded-[10px] text-black text-[13px] font-semibold leading-[100%] tracking-[0.13px] px-[60px] py-4">
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
            </button>
          </div>
        </div>
      </div>

      {seasons.length > 0 && (
        <div className="seasons pt-[60px] max-w-[1008px] w-full relative">
          {seasons.length > 1 ? (
            <div className="px-10">
              <nav className="flex gap-[0_20px]" aria-label="Seasons">
                {seasons.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`text-black text-xl font-[660] leading-[102%] tracking-[0.3px] ${
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
            <h3 className="text-black text-xl font-[660] leading-[102%] tracking-[0.3px] px-10">
              Season {seasons[0]}
            </h3>
          )}

          <div className="embla pt-6 overflow-hidden relative">
            <div className="w-8 h-full rotate-180 z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_-9.38%,#FFF_100%)] absolute left-0 bottom-0"></div>
            <div className="embla__viewport px-10 " ref={emblaRef}>
              <div className="embla__container  flex gap-[0_9px] is-draggable ">
                {groupedVideos[selectedSeason]?.map((video: Video) => (
                  <div
                    key={video.id}
                    className="w-full max-w-[296px] flex-none group"
                  >
                    <Link
                      href={`/shows/${show.id}/videos/${video.id}`}
                      as={`/shows/${show.id}/videos/${video.id}`}
                      scroll={false}
                      prefetch={false}
                    >
                      <div className="relative flex items-center justify-center">
                        <Image
                          src={
                            video.poster ||
                            "/video-poster-placeholder-image.jpg"
                          }
                          alt={video.name}
                          width={296}
                          height={173}
                          className={`object-cover rounded-xl  group-hover:scale-[1.03] delay-100 transition-all duration-200 ease-in-out group-hover:shadow-[0px_25px_44.7px_-10px_rgba(0,0,0,0.25)] ${
                            isLoaded ? "opacity-100" : "opacity-0"
                          }`}
                          onLoad={() => setIsLoaded(true)}
                        />
                        {!isLoaded && (
                          <Blurhash
                            hash={video?.video_poster_hash}
                            width={296}
                            height={173}
                            resolutionX={32}
                            resolutionY={32}
                            punch={1}
                            className="absolute inset-0"
                          />
                        )}
                        <div className="absolute duration-200 delay-100 transition-all ease-in-out  opacity-0 group-hover:opacity-100   w-12 flex items-center justify-center h-12 bg-[rgba(255,255,255,0.31)] shadow-[0px_5px_21px_0px_rgba(0,0,0,0.25)] backdrop-blur-[5px] rounded-[77px]">
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
                ))}
              </div>
            </div>
            <div className="w-8  z-10 h-full bg-[linear-gradient(90deg,rgba(255,255,255,0.00)_-9.38%,#FFF_100%)] absolute right-0 bottom-0"></div>
          </div>
        </div>
      )}
      <div className="pt-20 px-10 flex flex-col gap-4 w-full max-w-[608px]">
        <h2 className="text-black text-xl font-[660] leading-[102%] tracking-[0.3px]">
          {show?.name}
        </h2>
        <p className="text-[#484848] text-base font-[410] leading-[160%] tracking-[0.4px]">
          {show?.description}
        </p>
        <ul className="flex gap-[0_8px] ">
          {show?.genres?.map((genre: Genre) => (
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
    </div>
  );
}
