import Image from "next/image";
import logoDark from "../public/orion-logo-dark.png"
import logoLight from "../public/orion-logo-light.png"
import profilePic from "../public/profile-pic.jpeg"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons'

import Link from "next/link";
import Tag from "./ui/components/tag";

export default function Home() {
  return (
    <div className="flex flex-col justify-between justify-items-center min-h-screen px-8 pb-16 gap-16">
      <nav className="p-4 flex flex-col sticky top-0 bg-inherit"> <Link href="/" className="flex gap-4 items-center">
        <Image className="block dark:hidden" src={logoLight} alt="logo" width={24} height={24} />
        <Image className="hidden dark:block" src={logoDark} alt="logo" width={24} height={24} />
        Xiaolei Qin</Link>
      </nav>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start px-24">
        <section>
          <h1 style={{ fontWeight: 700, fontSize: 72 }}>Orion<span style={{ fontWeight: 400, fontSize: 72 }}>'s Portfolio</span></h1>
          {/* <Image src={profilePic} alt="Orion's profile picture" width={250} placeholder="blur" /> */}
          <div className="roles flex flex-row gap-4">
            <Tag>Software Engineer</Tag>
            <Tag>UX Designer</Tag>
            </div>
        </section>
        <div className="intro flex gap-4 items-center flex-col sm:flex-row">
          <h2 className="pr-4 border-r-2">About Me</h2>
          <span>Hey! My name is <u>Xiaolei Qin</u>, but you may call me Orion. I am currently a HCI/UX master student at UT Austin.
          I was previously a software engineer who was really into design, and now I am learning about it! I enjoy learning new technologies and designing things, and I care about user experience deeply.
          I am eager to provide my unique perspectives and to become a bridge between engineering and designing!</span>
        </div>
        <hr />
      </main>
      <footer className="flex flex-col items-center gap-8"><div className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/OrionQ"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faGithub} />
          Github
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.linkedin.com/in/xiaolei-qin-bb0ab214b/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faLinkedin} />
          LinkedIn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="mailto:xiaolei_qin@outlook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faEnvelope} />
          Email
        </a>
      </div>
        <span>© Xiaolei Qin {new Date().getFullYear()}.</span></footer>

    </div>
  );
}
