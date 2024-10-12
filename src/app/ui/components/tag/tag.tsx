
import { ReactNode } from "react";
import styles from "./tag.module.css"
import clsx from "clsx";

interface TagProps {
    /** children of the tag */
    children: ReactNode;
    /** type of the tag */
    tagType?: "primary" | "secondary" | "tertiary";
}

export default function Tag({ children, tagType = "primary" }: TagProps) {
    return <div className={clsx(styles.tag, styles[tagType])}>{children}</div>
}