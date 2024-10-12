import clsx from "clsx";
import styles from "./divider.module.css"

interface DividerProps {
    /** type of divider */
    dividerType?: "primary" | "secondary" | "tertiary";
}
export default function Divider({ dividerType = "primary" }: DividerProps) {
    return <hr className={clsx(styles.divider, styles[dividerType])} />
}