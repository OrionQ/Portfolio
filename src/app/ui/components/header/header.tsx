import Link from "next/link";
import Image from "next/image";
import logoDark from "../../../../public/orion-logo-dark.png"
import logoLight from "../../../../public/orion-logo-light.png"
import styles from "./header.module.css"
import clsx from "clsx";

export default function Header() {
    return <nav className={clsx("p-4 flex justify-between sticky top-0 bg-inherit", styles.header)}>
        <div>
            <Link href="/" className="flex gap-4 items-center">
                <Image className="block dark:hidden" src={logoLight} alt="logo" width={24} height={24} />
                <Image className="hidden dark:block" src={logoDark} alt="logo" width={24} height={24} />
                Xiaolei Qin</Link>
        </div>
        {/* <ThemeSwitcher /> */}
    </nav>;
}