"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Moon, Sun, Home, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { LoginModal } from "@/components/auth/login-modal";
import { NotificationBell } from "@/components/notification-bell";
import { ProfileAvatar } from "@/components/ui/profile-avatar";

const menuItems = [
  { id: "blog", label: "BLOG", href: "/blog" },
  { id: "my", label: "MY", href: "/my" },
];

export function Navigation() {
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [hasIndicator, setHasIndicator] = useState(false);
  const menuRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
  const navContainerRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isLoggedIn, isAuthLoading, logout, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const getActiveMenu = () => {
    const currentItem = menuItems.find((item) => pathname.startsWith(item.href));
    return currentItem?.id || null;
  };

  const activeMenu = getActiveMenu();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (activeMenu && menuRefs.current[activeMenu] && navContainerRef.current) {
      const el = menuRefs.current[activeMenu];
      const container = navContainerRef.current;
      if (el && container) {
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        setIndicatorStyle({
          left: elRect.left - containerRect.left,
          width: elRect.width,
        });
        setHasIndicator(true);
      }
    } else {
      setHasIndicator(false);
    }
  }, [activeMenu, mounted]);

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl"
      data-testid="nav-main"
    >
      <div
        className={`backdrop-blur-xl border rounded-full px-4 py-2.5 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 border-border shadow-lg"
            : "bg-background/40 border-transparent"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link data-testid="link-home" href="/" aria-label="Go to home">
            <div
              className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors duration-200"
              data-testid="button-home"
            >
              <Home className="w-4 h-4 text-foreground" />
            </div>
          </Link>

          <div ref={navContainerRef} className="relative flex items-center gap-1">
            {hasIndicator && (
              <div
                className="absolute h-8 rounded-full bg-foreground/15 dark:bg-foreground/25 transition-all duration-300 ease-in-out"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
                aria-hidden
              />
            )}

            {menuItems.map((item) => (
              <Link
                data-testid={`link-menu-${item.id}`}
                key={item.id}
                href={item.href}
                ref={(el) => {
                  menuRefs.current[item.id] = el;
                }}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-full z-10 transition-colors duration-200 ${
                  activeMenu === item.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="ml-1">
              <NotificationBell />
            </div>

            {isLoggedIn ? (
              <div className="relative ml-1" data-testid="menu-user">
                <button
                  data-testid="button-user-menu"
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full hover:bg-muted transition-colors duration-200"
                >
                  <ProfileAvatar
                    src={user?.profileImage}
                    alt={user?.nickname || "Profile"}
                    sizeClassName="w-6 h-6"
                    wrapperClassName="border border-border"
                  />
                  <span
                    className="text-sm font-medium text-foreground hidden sm:inline max-w-[80px] truncate"
                    data-testid="text-user-nickname"
                  >
                    {user?.nickname}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                      data-testid="overlay-user-menu"
                    />
                    <div
                      className="absolute right-0 top-full mt-2 w-44 bg-popover backdrop-blur-xl border border-border rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                      data-testid="modal-user-menu"
                    >
                      <Link
                        data-testid="link-my-page"
                        href="/my"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-lg mx-1"
                      >
                        <User className="w-4 h-4" />
                        {"마이페이지"}
                      </Link>
                      <button
                        data-testid="button-logout"
                        type="button"
                        onClick={async () => {
                          await logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-3 w-[calc(100%-0.5rem)] px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors rounded-lg mx-1"
                      >
                        <LogOut className="w-4 h-4" />
                        {"로그아웃"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : isAuthLoading ? (
              <div className="ml-1 px-4 py-1.5 text-sm font-medium rounded-full border border-border text-muted-foreground/70">
                ...
              </div>
            ) : (
              <button
                data-testid="button-login"
                type="button"
                onClick={openLoginModal}
                className="ml-1 px-4 py-1.5 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-90 transition-opacity duration-200"
              >
                LOG IN
              </button>
            )}
          </div>

          <button
            data-testid="button-theme-toggle"
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {mounted &&
              (theme === "dark" ? (
                <Sun className="w-4 h-4 text-foreground" />
              ) : (
                <Moon className="w-4 h-4 text-foreground" />
              ))}
          </button>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
      />
    </nav>
  );
}
