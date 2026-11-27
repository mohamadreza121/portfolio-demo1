import "./Dock.css";
import "./CpuPackage.css";

export function DockIcon({ children }) {
  return (
    <span aria-hidden="true" className="cpu-package nav-chip">
      <span className="cpu-package__substrate">
        <span className="cpu-package__lid">{children}</span>
      </span>
    </span>
  );
}

export default function Dock({ items }) {
  return (
    <div className="dock-panel" role="toolbar" aria-label="Application dock">
      {items.map(({ key, label, icon, onClick, isActive }) => (
        <button
          key={key}
          type="button"
          className="dock-item cursor-target"
          onClick={onClick}
          aria-label={label}
          aria-current={isActive ? "page" : undefined}
        >
          <DockIcon>{icon}</DockIcon>
          <span className="dock-label" aria-hidden="true">{label}</span>
        </button>
      ))}
    </div>
  );
}
