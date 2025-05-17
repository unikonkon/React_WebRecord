import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "th" : "en");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              VR
            </div>
            <span className="font-bold text-xl">VoiceRecord</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {currentUser && (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary">
                {t("dashboard")}
              </Link>
              <Link to="/record" className="text-sm font-medium hover:text-primary">
                {t("newRecording")}
              </Link>
              <Link to="/profile" className="text-sm font-medium hover:text-primary">
                {t("userProfile")}
              </Link>
            </>
          )}

          <Button variant="ghost" size="sm" onClick={toggleLanguage}>
            {language === "en" ? "🇹🇭" : "🇬🇧"}
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? "☀️" : "🌙"}
          </Button>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative size-8 rounded-full">
                  <Avatar className="size-8">
                    {currentUser.photoURL ? (
                      <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || "User"} />
                    ) : (
                      <AvatarFallback>{currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || "U"}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.displayName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">{t("userProfile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">{t("settings")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>{t("logout")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/login">{t("signIn")}</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="grid gap-6 pt-6">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  VR
                </div>
                <span className="font-bold text-xl">VoiceRecord</span>
              </Link>
              <nav className="grid gap-4">
                {currentUser ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-base font-medium hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("dashboard")}
                    </Link>
                    <Link 
                      to="/record" 
                      className="text-base font-medium hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("newRecording")}
                    </Link>
                    <Link 
                      to="/profile" 
                      className="text-base font-medium hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("userProfile")}
                    </Link>
                    <Link 
                      to="/settings" 
                      className="text-base font-medium hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("settings")}
                    </Link>
                    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="justify-start px-0">
                      {language === "en" ? "🇹🇭 Change to Thai" : "🇬🇧 Change to English"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={toggleTheme} className="justify-start px-0">
                      {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start px-0"
                    >
                      {t("logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="justify-start px-0">
                      {language === "en" ? "🇹🇭 Change to Thai" : "🇬🇧 Change to English"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={toggleTheme} className="justify-start px-0">
                      {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                    </Button>
                    <Button 
                      asChild 
                      variant="default" 
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/login">{t("signIn")}</Link>
                    </Button>
                  </>
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
