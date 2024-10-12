"use client"
import { useState } from "react";
import ToggleButton from "../components/toggle-button/toggle-button";
import Image from 'next/image';
import Card from "../components/card/card";
import CustomLink from "../components/link/link";

import circulationThumbnail from "../../../public/Circulation_Thumbnail.png";
import gameEngineThumbnail from "../../../public/GameEngine_thumbnail.jpg";
import iTrustThumbnail from "../../../public/iTrust_thumbnail.png";
import paintWarThumbnail from "../../../public/PaintWar_thumbnail.png";
import outlawThumbnail from "../../../public/Zodiac_thumbnail.png";
import Disclosure from "../components/disclosure/disclosure";

export default function Experience() {
    const [experience, setExperience] = useState("Professional Experience");

    return <div className="flex flex-col gap-4 justify-center items-center w-full">
        <ToggleButton options={["Professional Experience", "UX Projects", "Other Projects"]} onChange={setExperience} />
        {experience === "Professional Experience" ?
            <div className="professional-experience flex flex-col gap-4 justify-center items-center w-full">
                <Disclosure title="Design Engineer" company="Visa Inc." date="May 2022 - June 2024" isOpen>
                    <ul role="list" className="flex list-['•'] flex-col gap-3 p-6">
                        <li className="pl-4">Spearheaded the creation and management as the lead engineer for Visa Design System React library–Nova,
                            enhancing collaboration between designers and engineers to deliver seamless user experiences.
                        </li>
                        <li className="pl-4">Achieved industry-level accessibility (WCAG 2.1) compliance for Nova, significantly improving accessibility and
                            inclusivity, in collaboration with A11y researchers.
                        </li>
                        <li className="pl-4"> Authored comprehensive documentation of Nova in React and led knowledge-sharing sessions, resulting in a
                            50% time reduction in onboarding time for new developers.
                        </li>
                        <li className="pl-4">
                            Identified and implemented process improvements for VaultKey+ Design system in both React and Angular.
                        </li>
                        <li className="pl-4">
                            Facilitated cross-functional communication and problem-solving, leading to a 30% decrease in bug resolution
                            time in VaultKey+.
                        </li>
                        <li className="pl-4">
                            Provided critical support for North American and Asia-Pacific regions, successfully addressing and resolving
                            high-priority issues in both legacy and new design systems.
                        </li>
                    </ul>
                </Disclosure>
                <Disclosure title="Visualization (Frontend Engineer) Intern" company="MANN HUMMEL USA Inc." date="Aug 2021 - May 2022" isOpen>
                    <ul role="list" className="flex list-['•'] flex-col gap-3 p-6">
                        <li className="pl-4">Led the design of a specialized portal interface collaborating with the leadership team. Developed a
                            single-page application (SPA) using React + Typescript and MS Graph API, allowing leadership teams to visualize
                            and edit datasets seamlessly, reducing dependency on SharePoint lists and online Excel. Achieved a 50%
                            improvement in team efficiency by implementing the new web portal.
                        </li>
                        <li className="pl-4">Reimagined a legacy Production Console Interface, creating a user-friendly tablet interface for internal clients
                            using Figma, enhanced the overall user experience, contributing to improved usability and efficiency by 40% in
                            day-to-day operations.
                        </li>
                    </ul>
                </Disclosure>
            </div> :
            experience === "UX Projects" ?
                <div className="ux-projects"></div> :
                <div className="project-experience flex flex-wrap gap-8 justify-center">
                    <Card title="Game Engine" className="flex flex-col lg:flex-row gap-4 justify-between">
                        <p>My first game engine designed and developed by myself from the scratch throughout the whole semester.
                            This game engine is based on SFML as the graphic interface, and 0MQ to support the server-client connection.
                            The Game engine includes all the basic funtionalities including Component based GameObjects, Multiplayer ablities, mutli-threaded processing, EventSytsem, Double Timeline supports and Duktape/Dukglue Scripting abilities.
                            I have used this Game Engine to developed two games, one is a 2D platformer and the second one is the Space Invader.</p>
                        <Image style={{ borderRadius: "1.5rem", margin: ".25rem", objectFit: "cover" }} src={gameEngineThumbnail} alt="Game engine project's thumbnail" width={250} placeholder='blur' />
                    </Card>
                    <Card title="Circulation Immersion" className="flex flex-col lg:flex-row gap-4 justify-between">
                        <p>Circulation is an interactive virtual environment that allows an individual to accentuates our emotional connections with nature and visualize the reactions to our presence.
                            I developed this project in a team with students from the Art and Design department at NC State University.
                            We learn and used Unity and C# to script our interactive environment and used Maya to model and animate the animals in the environment.
                            We also earned the honor to make to the annual game showcase at NC State University.
                            <br />
                            <br />
                            Demo: <CustomLink className="inline-flex" href="https://youtu.be/FC2Ra8QGNdo" newTab underline>Youtube link</CustomLink>
                            <br />
                            Source code: <CustomLink className="inline-flex" href="https://github.com/OrionQ/Circulation" newTab underline>Github link</CustomLink>
                        </p>
                        <Image style={{ borderRadius: "1.5rem", margin: ".25rem", objectFit: "cover" }} src={circulationThumbnail} alt="Circulation project's thumbnail" width={250} placeholder='blur' />
                    </Card>
                    <Card title="iTrust Medical Web Portal" className="flex flex-col lg:flex-row gap-4 justify-between">
                        <p>This is a medical portal for the hospital and users are allowed to login with their credentials. We integrated 4 more use cases to the protal that read in a list of individuals' data and calculate the infection rate.
                            I was focusing on the testing and debugging, and we learned to implement and to utilize testing automation with Selenium and Cucumber.
                            To acheive the functionality of the web app, and I was learning what each part of code was responsible and try to fix all the bugs.
                            Meanwhile, since it is a team project, I also need to manage and coordinate with other tema members virtually to accomplish the result.
                        </p>
                        <Image style={{ borderRadius: "1.5rem", margin: ".25rem", objectFit: "cover" }} src={iTrustThumbnail} alt="iTrust project's thumbnail" width={250} placeholder='blur' />
                    </Card>
                    <Card title="Paint War Demo Game" className="flex flex-col lg:flex-row gap-4 justify-between">
                        <p>Paint War is a game that allows two players to catch and bounce paintballs to each other, and if the ball splashed on the edge of the screen with enough amount, the other side wins.
                            This is a team project with Master students from the Art and Design Department, and this is my first game developed using Unity Engine.
                            We learned and used particle system built inside the engine and developed the mechanics using scripts.
                            <br />
                            <br />
                            Source code: <CustomLink className="inline-flex" href="https://github.com/OrionQ/PaintWar" newTab underline>Github link</CustomLink>
                        </p>
                        <Image style={{ borderRadius: "1.5rem", margin: ".25rem", objectFit: "cover" }} src={paintWarThumbnail} alt="Paint War project's thumbnail" width={250} placeholder='blur' />
                    </Card>
                    <Card title="Outlaw Machinima" className="flex flex-col lg:flex-row gap-4 justify-between">
                        <p>This is a machinima Project using Unity Engine. I worked this project with another student in the Art and Design Design department.
                            Based on the true story of the infamous Zodiac Killer, we developed a imaginary scene that as a reporter(first-person-view), you accidentally ran into a suspicious house that might related to the zodiac killer.
                            As you explored the house, you starts to discover the strangeness of the house.
                            <br />
                            <br />
                            See this very fun short film: <CustomLink className="inline-flex" href="https://drive.google.com/file/d/1_N_1_JqRP87eo3RTBeIsEq5y_kW_FXNt/view?usp=sharing" newTab underline>Google drive link</CustomLink>
                        </p>
                        <Image style={{ borderRadius: "1.5rem", margin: ".25rem", objectFit: "cover" }} src={outlawThumbnail} alt="Outlaw Machinima project's thumbnail" width={250} placeholder='blur' />
                    </Card>
                </div>}
    </div>
}