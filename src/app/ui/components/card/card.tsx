import { ReactNode } from "react";
import styles from "./card.module.css"
import clsx from "clsx";

interface CardProps {
    /** children of the tag */
    children: ReactNode;
    /** title */
    title: string;
}

export default function Card({ children, title}: CardProps) {
    return <div className={clsx(styles.card)}>
        <h3 style={{ fontWeight: 300, fontSize: 36 }}>{title}</h3>
        {children}
        </div>
}