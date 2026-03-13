import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  capitalize,
  logout,
  logoutUser,
  removeAllLocalStorageItems,
} from "../../utils/helpers";
import Avatar from "../Avatar/Avatar";
import Input from "../Input/Input";
import showToast from "../../utils/toast";
import { useLoader } from "../../App";
import { getLocalStorageItem } from "../../utils/helpers";
import { LOCAL_DATA_STORE } from "../../utils/constants";
function usePageTitle() {
  const { pathname } = useLocation();
  const segment = pathname.split("/").filter(Boolean)[1] || "dashboard";
  return capitalize(segment);
}

export default function Topbar({ onToggleSidebar }) {
  const title = usePageTitle();
  const navigate = useNavigate();
  const { withLoader } = useLoader();
  const [searchVal, setSearchVal] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchVal.trim()) {
      showToast.info(`Searching for "${searchVal.trim()}"…`);
      setSearchVal("");
    }
  };

  const handleNotifications = () =>
    showToast.info("You have 5 unread notifications.");
  const handleCalendar = () => showToast.info("Opening calendar view…");
  const handleMessages = () => showToast.info("You have 3 new messages.");

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

  const handleLogout = async () => {
    try {
      await withLoader(async () => {
        await logoutUser();
      }, "Logging out…");
      showToast.success("Logged out successfully. See you soon!");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      // await removeLocalStorageItem()
      showToast.warn("Session ended.");
      setTimeout(() => navigate("/"), 800);
    }
  };
  return (
    <header className="h-[68px] bg-white border-b border-brand-primary/10 flex items-center gap-3 px-6 sticky top-0 z-40">
      {/* Hamburger */}
      {/* <button
        onClick={onToggleSidebar}
        className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-gray-500 hover:bg-brand-lighter hover:text-brand-primary transition-all duration-200 text-lg flex-shrink-0"
        title="Toggle sidebar"
      >
        ☰
      </button> */}

      {/* Page title */}
      <div className="mr-auto">
        <h1 className="font-poppins font-bold text-[18px] text-navy tracking-tight leading-none">
          {title}
        </h1>
        <p className="text-[11px] text-gray-400 mt-0.5">Home / {title}</p>
      </div>

      {/* Search */}
      <div className="w-72">
        <Input
          icon="🔍︎"
          placeholder="Search patients, doctors…"
          inputClassName="h-10 bg-surface border-transparent text-[13px]"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* Icon buttons */}
      <div className="flex items-center gap-1.5">
        <IconBtn title="Calendar" onClick={handleCalendar}>
          📅
        </IconBtn>
        <div className="relative">
          <IconBtn title="Notifications" onClick={handleNotifications}>
            🔔
          </IconBtn>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full border border-white" />
        </div>
        <IconBtn title="Messages" onClick={handleMessages}>
          💬
        </IconBtn>
      </div>

      <div className="w-px h-7 bg-gray-200 mx-1" />

      {/* Avatar — click to show menu */}
      <div className="relative">
        <div
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="cursor-pointer hover:ring-2 hover:ring-brand-primary/30 rounded-full transition-all duration-200"
        >
          <Avatar name={user?.role} size="sm" index={0} />
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <>
            {/* Click-away overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute right-0 top-[120%] w-48 bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl py-2 z-50 animate-[fadeUp_0.15s_ease_both]">
              <div className="px-4 py-2 border-b border-gray-50 mb-1">
                <p className="text-[13px] font-semibold text-navy">
                  {capitalize(user?.role)}
                </p>
                <p className="text-[11px] text-gray-400">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  showToast.info("Opening profile…");
                }}
                className="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-brand-primary/5 hover:text-brand-primary transition-colors flex items-center gap-2"
              >
                <span>🙎🏻‍♂️</span> Profile
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-[13px] font-medium text-danger hover:bg-danger/5 transition-colors flex items-center gap-2"
              >
                <span>↩</span> Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function IconBtn({ children, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-9 h-9 rounded-xl bg-surface text-gray-500 hover:bg-brand-lighter hover:text-brand-primary transition-all duration-200 flex items-center justify-center text-base relative"
    >
      {children}
    </button>
  );
}
