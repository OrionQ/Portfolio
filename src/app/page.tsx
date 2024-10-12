import { faFileLines, faGraduationCap, faIdCard, faTimeline } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Card from './ui/components/card/card';
import Divider from "./ui/components/divider/divider";
import Footer from './ui/components/footer/footer';
import Header from "./ui/components/header/header";
import CustomLink from "./ui/components/link/link";
import ProfileImage from './ui/components/profile-image/profile-image';
import Tag from "./ui/components/tag/tag";
import Experience from './ui/pages/experience';

import profilePic from './../public/profile-pic.jpeg';



export default function Home() {

  return (
    <div className="flex flex-col justify-between justify-items-center min-h-screen px-8 pb-16 gap-16">
      <Header />
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start lg:px-12 sm:px-10 ">
        <section className='flex flex-row flex-wrap-reverse flex-1 w-full gap-4 items-center justify-center lg:justify-between'>
          <div className='flex flex-col'>
            <h1 style={{ fontWeight: 700, fontSize: 72 }}>Orion<span style={{ fontWeight: 400, fontSize: 72 }}>'s Portfolio</span></h1>
            <div className="roles flex flex-row gap-2">
              <Tag>Software Engineer</Tag>
              <Tag tagType="secondary">UX Designer</Tag>
              <Tag tagType="tertiary">Photographer</Tag>
            </div>
          </div>
          <div className='pr-16'>
            <ProfileImage src={profilePic} alt="Orion's profile picture" width={300} height={300} />
          </div>
        </section>
        {/* About */}
        <div className="intro flex flex-col gap-4">
          <h2 className="flex gap-4 whitespace-nowrap items-center" style={{ fontWeight: 400, fontSize: 36 }}><FontAwesomeIcon icon={faIdCard} />About Me</h2>
          <span>Hey! My name is <span className="underline underline-offset-2">Xiaolei Qin (秦啸雷 to be precise)</span>, but you may call me Orion. I am currently a HCI/UX master student at UT Austin.
            I was previously a software engineer who was really into design, and now I am learning about it! I enjoy learning new technologies and designing things, and I care about user experience deeply.
            I am eager to provide my unique perspectives and to become a bridge between engineering and designing!</span>
        </div>
        <Divider dividerType="secondary" />
        {/* Experience */}
        <div className='flex w-full justify-between gap-24'>
          <h2 style={{ fontWeight: 400, fontSize: 36 }} className='flex gap-4 items-center'><FontAwesomeIcon icon={faTimeline} />Experience</h2>
          <p className="whitespace-nowrap flex items-center gap-2">Here is the PDF version:
            <CustomLink underline newTab href="/Xiaolei_Qin_Resume.pdf"><FontAwesomeIcon icon={faFileLines} /> Download PDF</CustomLink></p>
        </div>
        <Experience />
        <Divider dividerType='secondary' />
        {/* Education */}
        <h2 style={{ fontWeight: 400, fontSize: 36 }} className='flex gap-4 items-center'><FontAwesomeIcon icon={faGraduationCap} />Education</h2>
        <div className='flex flex-col lg:flex-row gap-4 items-center justify-center w-full flex-1'>
          <Card>
            <div className='flex items-center justify-between'>
              <h3 style={{ fontWeight: 400, fontSize: 24, color: "#bf5700" }}>University of Texas at Austin</h3>
            </div>
            <div className='flex justify-start'><Tag className='text-xs' style={{ paddingBlock: 4, paddingInline: 4 }}>Current</Tag></div>

            <p className='flex flex-col justify-between'>
              <CustomLink href='https://www.ischool.utexas.edu/' newTab underline>M.S. Information Studies</CustomLink>
              <strong>Human-Computer Interaction & UX Design</strong>
              <span>Aug 2024 - May 2026 (expected)</span>
            </p>
          </Card>
          <Card>
            <h3 style={{ fontWeight: 400, fontSize: 24, color: "#CC0000" }}>North Carolina State University</h3>
            <br />
            <p className='flex flex-col justify-between'>
              <CustomLink href='https://www.csc.ncsu.edu/' newTab underline>B.S. Computer Science</CustomLink>
              Minor in Art & Design
              <span>Aug 2017 - May 2021</span>
            </p>
          </Card>
        </div>

      </main>
      <Footer />
    </div>
  );
}
