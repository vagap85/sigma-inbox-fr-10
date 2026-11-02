import {
  ComponentPropsWithoutRef,
  ComponentType,
  InputHTMLAttributes,
} from "react";

export interface IconProps {
  width?: number;
  height?: number;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ComponentType;
}

// Button (start)

export type ButtonVariant = "primary" | "secondary" | "icon" | "link";

interface ButtonOwnProps {
  variant?: ButtonVariant;
  leftIcon?: ComponentType;
  rightIcon?: ComponentType;
}

type ButtonAsButton = ButtonOwnProps & {
  as?: "button";
} & ComponentPropsWithoutRef<"button">;

type ButtonAsLink = ButtonOwnProps & {
  as: "a";
  disabled?: boolean;
} & ComponentPropsWithoutRef<"a">;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

// Button (end)

// Text (start)
import type { HTMLAttributes } from "react";

export type TextTag =
  | "span"
  | "p"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "time";
  
export type TextVariant = "primary" | "secondary" | "paper";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type TextWeight = "regular" | "medium" | "semibold" | "bold";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextTag;
  variant?: TextVariant;
  size?: TextSize;
  weight?: TextWeight;
}
// Text (end)
