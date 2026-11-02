import { IconProps } from "../types";

export default function CheckIcon({width = 15, height = 10}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 15 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.5 4.20588L5.5 9.5L14 0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
