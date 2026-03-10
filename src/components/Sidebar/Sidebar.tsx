import { useState, useEffect } from "react";
import appLogo from "../../assets/images/appLogo.png";
import { NavLink, useLocation } from "react-router-dom";
import { cn, getLocalStorageItem, capitalize } from "../../utils/helpers";
import { NAV_ITEMS, LOCAL_DATA_STORE } from "../../utils/constants";
import Badge from "../Badge/Badge";
import Avatar from "../Avatar/Avatar";

/* ─── Tooltip shown in collapsed state ─────────────────────────────── */
function Tooltip({ label }) {
  return (
    <span
      className={cn(
        "absolute left-[calc(64px-4px)] top-1/2 -translate-y-1/2 z-50",
        "bg-navy text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg",
        "whitespace-nowrap border border-white/10 pointer-events-none",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
        // tiny left arrow
        "before:content-[''] before:absolute before:-left-1 before:top-1/2 before:-translate-y-1/2",
        "before:border-4 before:border-transparent before:border-r-navy",
      )}
    >
      {label}
    </span>
  );
}

/* ─── Single nav item ───────────────────────────────────────────────── */
function NavItem({ item, collapsed }) {
  const location = useLocation();
  const isActive =
    location.pathname === item.path ||
    location.pathname.startsWith(item.path + "/");

  return (
    <NavLink
      to={item.path}
      className={({ isActive: routerActive }) =>
        cn(
          "group relative flex items-center rounded-xl mx-2 my-0.5",
          "text-white/55 text-[13.5px] font-medium no-underline",
          "transition-all duration-200 hover:bg-brand-primary/10 hover:text-white/85",
          collapsed ? "justify-center p-2.5" : "gap-3 px-4 py-2.5",
          (routerActive || isActive) &&
            "bg-gradient-to-r from-brand-primary/20 to-brand-primary/5 text-white",
        )
      }
    >
      {({ isActive: routerActive }) => (
        <>
          {/* Active indicator bar */}
          {(routerActive || isActive) && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-brand-primary rounded-r-full" />
          )}

          {/* Icon */}
          {item.icon?.startsWith("/src/assets") ? (
            item.iconFilter === "brand" ? (
              <div
                className="w-5 h-5 flex-shrink-0 opacity-60 group-hover:opacity-90 transition-opacity bg-[#3bace0]"
                style={{
                  WebkitMaskImage: `url(${item.icon})`,
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskImage: `url(${item.icon})`,
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              />
            ) : (
              <img
                src={item.icon}
                alt={item.label}
                className="w-5 h-5 flex-shrink-0 object-contain opacity-60 group-hover:opacity-90 transition-opacity"
              />
            )
          ) : (
            <span className="text-base leading-none flex-shrink-0 w-5 h-5 flex items-center justify-center">
              {item.icon}
            </span>
          )}

          {/* Label — fades out when collapsed */}
          <span
            className={cn(
              "fade-text flex-1 whitespace-nowrap overflow-hidden",
              collapsed ? "opacity-0 w-0" : "opacity-100",
            )}
          >
            {item.label}
          </span>

          {/* Badge — hides when collapsed */}
          {item.badge && !collapsed && (
            <Badge color={item.badgeColor || "blue"}>{item.badge}</Badge>
          )}

          {/* Tooltip — only shows in collapsed state */}
          {collapsed && <Tooltip label={item.label} />}
        </>
      )}
    </NavLink>
  );
}

/* ─── Section label ─────────────────────────────────────────────────── */
function SectionLabel({ label, collapsed }) {
  return (
    <div
      className={cn(
        "fade-text px-5 text-[10px] font-semibold tracking-widest uppercase text-white/30 select-none",
        collapsed
          ? "opacity-0 h-0 py-0 overflow-hidden"
          : "opacity-100 pt-5 pb-1.5",
      )}
    >
      {label}
    </div>
  );
}

/* ─── Main Sidebar ──────────────────────────────────────────────────── */
export default function Sidebar({ collapsed, onToggle }) {
  const [user, setUser] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const isEffectivelyCollapsed = collapsed && !isHovered;

  useEffect(() => {
    try {
      const storedData = getLocalStorageItem(LOCAL_DATA_STORE.USER_DATA);
      if (storedData) {
        const userData = JSON.parse(storedData);
        setUser(userData);
      } else {
        console.log("userData is null/undefined in localStorage");
      }
    } catch (e) {
      console.log("Failed to parse userData:", e);
    }
  }, []);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed top-0 left-0 h-full z-50 flex flex-col",
        "bg-navy text-white sidebar-transition overflow-hidden",
        isEffectivelyCollapsed ? "w-16" : "w-[260px]",
      )}
    >
      {/* Decorative glow */}
      <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-brand-primary/10 pointer-events-none" />

      {/* ── Logo row ── */}
      <div
        className={cn(
          "flex items-center h-[68px] border-b border-white/[0.07] flex-shrink-0",
          isEffectivelyCollapsed ? "justify-center px-0" : "px-4 gap-2.5",
        )}
      >
        {isEffectivelyCollapsed ? (
          /* Collapsed: show only expand icon */
          <button
            onClick={onToggle}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:bg-brand-primary/20 hover:text-white transition-all duration-200 text-base"
            title="Expand sidebar"
          >
            ☰
          </button>
        ) : (
          <>
            {/* Logo mark */}
            <img
              src={appLogo}
              alt="Navhim Logo"
              className="w-9 h-9 flex-shrink-0 rounded-xl object-contain shadow-[0_4px_14px_rgba(75,105,255,0.4)]"
            />

            {/* Brand name */}
            <span className="font-poppins font-bold text-[15px] tracking-tight flex-1 whitespace-nowrap leading-tight">
              Navhim<span className="text-brand-light"> Patient</span>
            </span>

            {/* Collapse button */}
            <button
              onClick={onToggle}
              className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all duration-200 text-xs flex-shrink-0"
              title="Collapse sidebar"
            >
              ◀
            </button>
          </>
        )}
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-2">
        {NAV_ITEMS.map((group) => (
          <div key={group.section}>
            <SectionLabel
              label={group.section}
              collapsed={isEffectivelyCollapsed}
            />
            {group.items.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                collapsed={isEffectivelyCollapsed}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Bottom user card ── */}
      <div className="border-t border-white/[0.07] p-2 flex-shrink-0">
        <div
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer",
            "bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200",
            isEffectivelyCollapsed && "justify-center px-0",
          )}
        >
          <Avatar
            name={capitalize(user?.role)}
            size="sm"
            index={0}
            className="flex-shrink-0"
          />

          {!isEffectivelyCollapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {capitalize(user?.role)}
                </p>
                <p className="text-[10.5px] text-white/40 mt-0.5">
                  {user?.email}
                </p>
              </div>
              <span className="text-white/30 text-sm flex-shrink-0">›</span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
