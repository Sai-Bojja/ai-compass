import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Sparkles, MessageCircle, LogIn, User } from "lucide-react";
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the tools page
  const isOnToolsPage = location.pathname === "/tools";

  const navLinks = [
    { href: "/tools", label: "Tools", category: null },
    { href: "/tools?category=code", label: "Code", category: "code" },
    { href: "/tools?category=writing", label: "Writing", category: "writing" },
    { href: "/tools?category=brainstorming", label: "Brainstorming", category: "brainstorming" },
    { href: "/community", label: "Community", category: null },
  ];

  // Handle nav link click - use navigate for category links to force update
  const handleNavClick = useCallback((href: string, category: string | null) => {
    if (category && isOnToolsPage) {
      // Force navigation with replace to update query params on same page
      navigate(href, { replace: true });
      window.location.href = href; // Force page to recognize the change
    } else {
      navigate(href);
    }
  }, [isOnToolsPage, navigate]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>Aideas<span className="text-primary">.ai</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href, link.category)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground link-underline bg-transparent border-none cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex"
            onClick={() => navigate("/search")}
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-2"
            onClick={() => navigate("/chat")}
          >
            <MessageCircle className="h-4 w-4" />
            Ask AI
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {profile?.display_name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors text-left bg-transparent border-none cursor-pointer w-full"
                onClick={() => {
                  handleNavClick(link.href, link.category);
                  setMobileMenuOpen(false);
                }}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t mt-2 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate("/search")}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button size="sm" className="flex-1" onClick={() => navigate("/chat")}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask AI
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
