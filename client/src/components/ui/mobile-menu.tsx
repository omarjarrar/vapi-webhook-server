import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type NavLink = {
  label: string;
  href: string;
};

interface MobileMenuProps {
  links: NavLink[];
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLinkClick = (href: string) => {
    closeMenu();
    if (href.startsWith('/')) {
      navigate(href);
    } else {
      window.location.href = href;
    }
  };

  return (
    <div className="md:hidden">
      <button
        className="ml-4 text-gray-500 hover:text-primary focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <div
        className={cn(
          "absolute top-16 left-0 right-0 bg-white border-t border-gray-100 z-50 shadow-md transition-all duration-300 ease-in-out transform",
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <div className="py-2 space-y-1">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => handleLinkClick(link.href)}
              className="w-full text-left block py-2 px-4 text-gray-600 hover:bg-gray-50 hover:text-primary"
            >
              {link.label}
            </button>
          ))}
          
          {user ? (
            <>
              <button
                onClick={() => handleLinkClick('/dashboard')}
                className="w-full text-left block py-2 px-4 text-gray-600 hover:bg-gray-50 hover:text-primary"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  closeMenu();
                  logoutMutation.mutate();
                }}
                className="w-full text-left block py-2 px-4 text-gray-600 hover:bg-gray-50 hover:text-primary"
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleLinkClick('/auth')}
                className="w-full text-left block py-2 px-4 text-gray-600 hover:bg-gray-50 hover:text-primary"
              >
                Login
              </button>
              <button
                onClick={() => handleLinkClick('#booking')}
                className="w-full text-left block py-2 px-4 text-primary font-semibold hover:bg-gray-50"
              >
                Book a Demo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
