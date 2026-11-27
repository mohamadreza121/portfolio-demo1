import {
  FaHome,
  FaUser,
  FaProjectDiagram,
  FaCertificate,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { navigateAndScroll } from "../utils/scrollToSection";

import Dock, { DockIcon } from "./Dock";
import "./Navbar.css";
import "./TargetCursor.css";

export default function Navbar({ active, compact = false, hidden = false }) {
  const navigate = useNavigate();

  const navItems = [
    {
      key: "Home",
      icon: <FaHome />,
      label: "Home",
      onClick: () => {
        navigateAndScroll(navigate, "home");
      },
      isActive: active === "Home",
    },
    {
      key: "About",
      icon: <FaUser />,
      label: "About",
      onClick: () => {
        navigateAndScroll(navigate, "about");
      },
      isActive: active === "About",
    },
    {
      key: "Projects",
      icon: <FaProjectDiagram />,
      label: "Projects",
      onClick: () => {
        navigateAndScroll(navigate, "projects");
      },
      isActive: active === "Projects",
    },
    {
      key: "Certs",
      icon: <FaCertificate />,
      label: "Certs",
      onClick: () => {
        navigateAndScroll(navigate, "certifications");
      },
      isActive: active === "Certs",
    },
  ];

  if (compact) {
    return (
      <nav className="mobile-dock" aria-label="Primary navigation" hidden={hidden}>
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-current={item.isActive ? "location" : undefined}
            onClick={item.onClick}
          >
            <DockIcon>{item.icon}</DockIcon>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    );
  }

  return (
    <nav className="navbar-shell" aria-label="Primary navigation" hidden={hidden}>
      <Dock items={navItems} />
    </nav>
  );
}
