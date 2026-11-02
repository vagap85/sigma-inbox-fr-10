import { classNames } from "../../../../helpers/classNames";
import styles from "./SpinnerLoader.module.css";

export default function SpinnerLoader({
  variant = "paper",
  size = "sm",
}: {
  variant?: "primary" | "paper" | "secondary";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={classNames(
        styles.spinner,
        variant !== "paper" && styles[variant],
        styles[size],
      )}
    ></div>
  );
}
