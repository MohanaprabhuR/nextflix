import Link from "next/link";
import React from "react";

const header = () => {
  return (
    <header className="pt-4 pb-5">
      <div className="w-full max-w-[1332px] mx-auto px-4  flex items-center justify-between">
        <Link href="/">
          <figure className="w-5 h-5">
            <svg
              className="size-full"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.0674 8.88856L10.5067 16.6663M14.0674 8.88856L18.8893 8.91449M14.0674 8.88856L11.3018 3.33303M14.0674 8.88856L2.41206 8.91449M15.4874 3.71781C14.731 3.09122 6.17398 3.33222 5.51211 3.71781C4.8266 4.12751 2.1082 8.53777 2.22639 8.99566C2.53369 10.2489 9.27059 16.563 10.4998 16.563C11.6344 16.563 18.3713 10.3693 18.7732 8.99566C18.915 8.48957 16.2675 4.36851 15.4874 3.71781Z"
                stroke="#8C8C8C"
              />
            </svg>
          </figure>
        </Link>
        <div>
          <figure className="w-[18px] h-[18px]">
            <svg
              className="size-full"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 16L12.0949 12.0949M12.0949 12.0949C13.0789 11.1109 13.6875 9.7515 13.6875 8.25C13.6875 5.24695 11.2531 2.8125 8.25 2.8125C5.24695 2.8125 2.8125 5.24695 2.8125 8.25C2.8125 11.2531 5.24695 13.6875 8.25 13.6875C9.7515 13.6875 11.1109 13.0789 12.0949 12.0949Z"
                stroke="#8C8C8C"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </figure>
        </div>
      </div>
    </header>
  );
};

export default header;
