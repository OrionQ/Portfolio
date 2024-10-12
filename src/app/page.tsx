

import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Card from "./ui/components/card/card";
import Divider from "./ui/components/divider/divider";
import Header from "./ui/components/header/header";
import CustomLink from "./ui/components/link/link";
import Tag from "./ui/components/tag/tag";

export default function Home() {
  return (
    <div className="flex flex-col justify-between justify-items-center min-h-screen px-8 pb-16 gap-16">
      <Header />
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start px-24">
        <section>
          <h1 style={{ fontWeight: 700, fontSize: 72 }}>Orion<span style={{ fontWeight: 400, fontSize: 72 }}>'s Portfolio</span></h1>
          {/* <Image src={profilePic} alt="Orion's profile picture" width={250} placeholder="blur" /> */}
          <div className="roles flex flex-row gap-4">
            <Tag>Software Engineer</Tag>
            <Tag tagType="secondary">UX Designer</Tag>
            <Tag tagType="tertiary">Photographer</Tag>
          </div>
        </section>
        <div className="intro flex gap-4 items-center flex-col sm:flex-row">
          <h2 className="pr-4 border-r-2">About Me</h2>
          <span>Hey! My name is <span className="underline underline-offset-2">Xiaolei Qin (秦啸雷 to be precise)</span>, but you may call me Orion. I am currently a HCI/UX master student at UT Austin.
            I was previously a software engineer who was really into design, and now I am learning about it! I enjoy learning new technologies and designing things, and I care about user experience deeply.
            I am eager to provide my unique perspectives and to become a bridge between engineering and designing!</span>
        </div>
        <Divider dividerType="secondary" />
        <div className='professional-experience'></div>
        <div className='project-experience'>
          <Card title="Game Engine"><span>My first game engine designed and developed by myself from the scratch throughout the whole semester.
            This game engine is based on SFML as the graphic interface, and 0MQ to support the server-client connection.
            The Game engine includes all the basic funtionalities including Component based GameObjects, Multiplayer ablities, mutli-threaded processing, EventSytsem, Double Timeline supports and Duktape/Dukglue Scripting abilities.
            I have used this Game Engine to developed two games, one is a 2D platformer and the second one is the Space Invader.</span>
          </Card>
          <Card title="Circulation Immersion"><p>Circulation is an interactive virtual environment that allows an individual to accentuates our emotional connections with nature and visualize the reactions to our presence.
            I developed this project in a team with students from the Art and Design department at NC State University.
            We learn and used Unity and C# to script our interactive environment and used Maya to model and animate the animals in the environment.
            We also earned the honor to make to the annual game showcase at NC State University.
            <br />
            <br />
            Demo: <CustomLink className="inline-flex" href="https://youtu.be/FC2Ra8QGNdo" newTab underline>Youtube link</CustomLink>
            <br />
            Source code: <CustomLink className="inline-flex" href="https://github.com/OrionQ/Circulation" newTab underline>Github link</CustomLink></p>
          </Card>
          <Card title="iTrust Medical Web Portal">This is a medical portal for the hospital and users are allowed to login with their credentials. We integrated 4 more use cases to the protal that read in a list of individuals' data and calculate the infection rate.
            I was focusing on the testing and debugging, and we learned to implement and to utilize testing automation with Selenium and Cucumber.
            To acheive the functionality of the web app, and I was learning what each part of code was responsible and try to fix all the bugs.
            Meanwhile, since it is a team project, I also need to manage and coordinate with other tema members virtually to accomplish the result.
          </Card>
          <Card title="Paint War Demo Game">Paint War is a game that allows two players to catch and bounce paintballs to each other, and if the ball splashed on the edge of the screen with enough amount, the other side wins.
            This is a team project with Master students from the Art and Design Department, and this is my first game developed using Unity Engine.
            We learned and used particle system built inside the engine and developed the mechanics using scripts.
            <br />
            <br />
            Source code: <CustomLink className="inline-flex" href="https://github.com/OrionQ/PaintWar" newTab underline>Github link</CustomLink>
          </Card>
          <Card title="Outlaw Machinima">This is a machinima Project using Unity Engine. I worked this project with another student in the Art and Design Design department.
            Based on the true story of the infamous Zodiac Killer, we developed a imaginary scene that as a reporter(first-person-view), you accidentally ran into a suspicious house that might related to the zodiac killer.
            As you explored the house, you starts to discover the strangeness of the house.
            <br />
            <br />
            See this very fun short film: <CustomLink className="inline-flex" href="https://drive.google.com/file/d/1_N_1_JqRP87eo3RTBeIsEq5y_kW_FXNt/view?usp=sharing" newTab underline>Google drive link</CustomLink>
          </Card>
        </div>

      </main>
      <footer className="flex flex-col items-center gap-8"><div className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
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
    </div>
  );
}
