import { ComponentType, isValidElement, ReactNode } from "react";

export function renderIcon(Icon: ReactNode | ComponentType): ReactNode {
    if (isValidElement(Icon)) {
        return Icon;
    }

    if (typeof Icon === "function") {
        const IconComponent = Icon as ComponentType;
        return <IconComponent />;
    }

    return Icon as ReactNode;
}