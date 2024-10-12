import { CSSProperties, ReactNode } from "react";
import styles from "./card.module.css"
import clsx from "clsx";

interface CardProps {
    /** children of the tag */
    children: ReactNode;
    /** title */
    title?: string;
    /** additional inline style */
    style?: CSSProperties;
    /** extra className */
    className?: string;
}

export default function Card({ className, children, title, style }: CardProps) {
    return <div className={clsx(styles.card)} style={style}>
        {title && <h3 style={{ fontWeight: 300, fontSize: 36 }}>{title}</h3>}
        <div className={clsx(className)}>
            {children}
        </div>
    </div>
}