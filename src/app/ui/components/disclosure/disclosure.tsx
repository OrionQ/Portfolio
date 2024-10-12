import { ReactNode, useEffect, useState } from "react";
import styles from "./disclosure.module.css"
import clsx from "clsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface DisclosureProps {
    /** children of the tag */
    children: ReactNode;
    /** title */
    title: string;
    /** company */
    company?: string
    /** date */
    date: string;
    /** programmatically control the open and close state */
    isOpen?: boolean;
    /** extra className */
    className?: string;
}

export default function Disclosure({ className, children, company, date, isOpen = false, title }: DisclosureProps) {
    const [open, setIsOpen] = useState(isOpen);

    // Sync the internal state with the open prop if it's passed
    useEffect(() => {
        setIsOpen(isOpen);
    }, [open, isOpen]);

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };
    return <details className={clsx(styles.disclosure)} open={open} onToggle={handleToggle}>
        <summary className={clsx("flex flex-row flex-grow justify-between items-center gap-4", styles.summary)}>
            <div className="flex flex-grow justify-between items-center">
                <div className="flex flex-col">
                    <h3 style={{ fontWeight: 400, fontSize: 36 }}>{title}</h3>
                    {company && <h4>@ {company}</h4>}
                </div>
                <p style={{ fontWeight: 300, fontSize: 20 }}>{date}</p>
            </div>
            <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
        </summary>
        <div className={clsx(className, styles.content)}>
            {children}
        </div>
    </details>
}