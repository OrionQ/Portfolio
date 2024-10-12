import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faFileLines } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import CustomLink from "./../link/link";

export default function Footer() {
    return <footer className="flex flex-col items-center gap-8"><div className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <CustomLink
            href="/pdf/Xiaolei_Qin_Resume.pdf"
            newTab
        >
            <FontAwesomeIcon icon={faFileLines} />
            Resume
        </CustomLink>
        <CustomLink
            href="https://github.com/OrionQ"
            newTab
        >
            <FontAwesomeIcon icon={faGithub} />
            Github
        </CustomLink>
        <CustomLink
            href="https://www.linkedin.com/in/xiaolei-qin-bb0ab214b/"
            newTab
        >
            <FontAwesomeIcon icon={faLinkedin} />
            LinkedIn
        </CustomLink>
        <CustomLink
            href="mailto:xiaolei_qin@outlook.com"
            newTab
        >
            <FontAwesomeIcon icon={faEnvelope} />
            Email
        </CustomLink>
    </div>
        <span>© Xiaolei Qin {new Date().getFullYear()}.</span></footer>
}