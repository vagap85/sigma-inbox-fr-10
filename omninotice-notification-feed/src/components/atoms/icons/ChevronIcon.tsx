import { IconProps } from "../types";

export default function ChevronIcon({width = 8, height = 15}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 8 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.5 0.5L7.25 7.25L0.5 14"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}
