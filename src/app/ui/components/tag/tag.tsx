
import { CSSProperties, ReactNode } from "react";
import styles from "./tag.module.css"
import clsx from "clsx";

interface TagProps {
    /** children of the tag */
    children: ReactNode;
    /** type of the tag */
    tagType?: "primary" | "secondary" | "tertiary";
    /** additional inline style */
    style?: CSSProperties;
    /** extra className */
    className?: string;
}

export default function Tag({ className, children, tagType = "primary", style }: TagProps) {
    return <div className={clsx(styles.tag, styles[tagType], className)} style={style}>{children}</div>
}