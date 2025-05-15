import { Link } from "wouter";
import { MobileMenu } from "./mobile-menu";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "ROI Calculator", href: "#roi-calculator" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/">
              <div className="font-display font-bold text-xl md:text-2xl cursor-pointer">
                <span className="text-primary">Ring</span>
                <span className="text-primary-dark">Ready</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-primary font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center">
            {user ? (
              <>
                <Link href="/dashboard">
                  <span className="hidden md:inline-block text-primary font-medium mr-4 hover:text-primary-dark transition cursor-pointer">
                    Dashboard
                  </span>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="mr-2"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <span className="hidden md:inline-block text-primary font-medium mr-4 hover:text-primary-dark transition cursor-pointer">
                    Login
                  </span>
                </Link>
                <a
                  href="#booking"
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition duration-300 shadow-sm hover:shadow-md"
                >
                  Book a Demo
                </a>
              </>
            )}

            <MobileMenu links={navLinks} />
          </div>
        </div>
      </div>
    </header>
  );
}
