import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faEnvelope,
  faFileLines,
  faArrowLeftLong,
  faArrowRightLong,
  faChevronDown,
  faChevronUp,
  faLayerGroup,
  faSwatchbook,
  faUniversalAccess,
  faCode,
  faUpRightFromSquare,
  faDiagramProject,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faLinkedin,
  faFigma,
  faHtml5,
  faCss3Alt,
  faSquareJs,
  faReact,
  faNodeJs,
  faNpm,
  faPython,
  faJava,
  faAngular,
} from "@fortawesome/free-brands-svg-icons";

const ICON_MAP: Record<string, typeof faBars> = {
  // Solid icons
  bars: faBars,
  xmark: faXmark,
  envelope: faEnvelope,
  "file-lines": faFileLines,
  "arrow-left-long": faArrowLeftLong,
  "arrow-right-long": faArrowRightLong,
  "chevron-down": faChevronDown,
  "chevron-up": faChevronUp,
  "layer-group": faLayerGroup,
  swatch: faSwatchbook,
  "universal-access-solid-full": faUniversalAccess,
  "code-solid-full": faCode,
  "up-right-from-square": faUpRightFromSquare,
  "diagram-project": faDiagramProject,
  // Brand icons
  github: faGithub,
  linkedin: faLinkedin,
  "figma-brands-solid-full": faFigma,
  "html5-brands-solid-full": faHtml5,
  "css3-brands-solid-full": faCss3Alt,
  "square-js-brands-solid-full": faSquareJs,
  "react-brands-solid-full": faReact,
  "node-js-brands-solid-full": faNodeJs,
  "npm-brands-solid-full": faNpm,
  "python-brands-solid-full": faPython,
  "java-brands-solid-full": faJava,
  "angular-brands-solid-full": faAngular,
};

export const FA_ICON_NAMES = new Set(Object.keys(ICON_MAP));

interface FAIconProps {
  name: string;
  size?: number | string;
  className?: string;
  color?: string;
  id?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

export function FAIcon({
  name,
  size,
  className,
  color,
  id,
  "aria-hidden": ariaHidden,
}: FAIconProps) {
  const icon = ICON_MAP[name];
  if (!icon) return null;

  const wrapperStyle: React.CSSProperties = {
    display: "inline-flex",
    ...(typeof size === "number"
      ? { width: size, height: size }
      : size === "1em"
        ? { width: "1em", height: "1em" }
        : {}),
    ...(color ? { color } : {}),
  };

  return (
    <span style={wrapperStyle} id={id} aria-hidden={ariaHidden}>
      <FontAwesomeIcon icon={icon as never} className={className} />
    </span>
  );
}
