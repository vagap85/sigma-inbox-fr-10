import type { TextProps } from "../types";
import type { TextSize, TextWeight } from "../types";
import { classNames } from "../../../helpers/classNames";
import styles from "./Text.module.css";

const sizeClasses: Record<TextSize, string> = {
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
  xxl: styles.sizeXxl,
};

const weightClasses: Record<TextWeight, string> = {
  regular: styles.weightRegular,
  medium: styles.weightMedium,
  semibold: styles.weightSemibold,
  bold: styles.weightBold,
};

export default function Text({
  as: Tag = "p",
  variant = "primary",
  size = "md",
  weight = "regular",
  className,
  children,
  ...rest
}: TextProps) {
  const classes = classNames(
    styles.text,
    styles[variant],
    sizeClasses[size],
    weightClasses[weight],
    className,
  );

  return (
    <Tag {...rest} className={classes}>
      {children}
    </Tag>
  );
}