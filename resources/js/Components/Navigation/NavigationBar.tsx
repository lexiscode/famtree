import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useModal } from '@/Context/ModalContext';
import './NavigationBar.css';

export default function NavigationBar() {
  const { url } = usePage();
  const { openCtaModal } = useModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [url]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Check if route is active
  const isActive = (route: string) => url === route || url.startsWith(route + '/');

  const menuItems = [
    { label: 'Home', href: '/', name: 'home' },
    { label: 'About', href: '/about', name: 'about' },
    { label: 'Features', href: '/features', name: 'features' },
    { label: 'How It Works', href: '/how-it-works', name: 'how-it-works' },
    { label: 'Blog', href: '/blog', name: 'blog' },
    { label: 'Contact', href: '/contact', name: 'contact' },
    { label: 'Families', href: '/families', name: 'families' },
  ];

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-light navbar-custom ${
        isScrolled ? 'navbar-scrolled' : 'navbar-transparent'
      }`}
    >
      <div className="container-fluid navbar-container">
        {/* Brand/Logo */}
        <Link href="/" className="navbar-brand">
          FamTree
        </Link>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Menu */}
        <div
          className={`collapse navbar-collapse navbar-menu ${
            isMobileMenuOpen ? 'show' : ''
          }`}
          id="navbarNav"
        >
          {/* Left Menu Items */}
          <ul className="navbar-nav me-auto">
            {menuItems.map((item) => (
              <li key={item.name} className="nav-item">
                <Link
                  href={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''} ${
                    item.name === 'families' ? 'nav-link-families' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Auth Buttons */}
          <ul className="navbar-nav ms-auto auth-buttons">
            <li className="nav-item">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  openCtaModal('login');
                  setIsMobileMenuOpen(false);
                }}
              >
                Login
              </button>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  openCtaModal('register');
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign Up
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
