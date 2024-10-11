import styles from "./tag.module.css"

export default function Tag(props: any) {
    return <div className={styles.tag}>{props.children}</div>
}