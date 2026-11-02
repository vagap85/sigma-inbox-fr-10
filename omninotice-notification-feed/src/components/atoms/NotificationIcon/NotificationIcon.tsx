import type { NotificationPicture } from "../../molecules/types";
import { useNotificationSettings } from "../../../config/SettingsContext";
import { renderIcon } from "../../../helpers/renderIcon";
import { resolvePicture } from "../../../helpers/resolvePicture";
import { useState } from "react";
import styles from "./NotificationIcon.module.css";

export default function NotificationIcon({
  picture,
  alt,
}: {
  picture: NotificationPicture;
  alt?: string;
}) {
  const { defaultIcon } = useNotificationSettings();
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  const markFailed = (url: string) =>
    setFailedUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));

  const isFailed = (url: string) => failedUrls.includes(url);

  const renderPicture = (isFailed: (src: string) => boolean) => {
    const resolved = resolvePicture(picture, isFailed);

    switch (resolved.kind) {
      case "image":
        return (
          <img
            className={styles.image}
            src={resolved.src}
            alt={alt}
            onError={() => markFailed(resolved.src)}
            data-type={resolved.src.endsWith(".svg") ? "icon" : "image"}
          />
        );
      case "element":
        return resolved.element;
      case "component": {
        const Icon = resolved.Component;
        return <Icon />;
      }
      case "emoji":
        return <span>{resolved.value}</span>;
      default:
        return renderIcon(defaultIcon);
    }
  };
  return (
    <div className={styles.icon}>{renderPicture(isFailed)}</div>
  );
}
