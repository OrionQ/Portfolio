import clsx from "clsx";
import React from "react";

interface LinkProps {
    /** URL the link points to */
    href: string;
    /** Text or content inside the link */
    children: React.ReactNode;
    /** Optionally open link in a new tab */
    newTab?: boolean;
    /** underline the link */
    underline?: boolean;
    /** allow optional CSS to be add via classname */
    className?: string;
}

export default function Link({ href, children, newTab = false, underline = false, className }: LinkProps) {
    return (
        <a
            href={href}
            className={clsx("flex items-center gap-2 hover:underline hover:underline-offset-4 hover:opacity-60", underline && 'underline underline-offset-4', className)}
            target={newTab ? "_blank" : "_self"}
            rel={newTab ? "noopener noreferrer" : undefined} // for security when opening new tabs
        >
            {children}
        </a>
    );
};

