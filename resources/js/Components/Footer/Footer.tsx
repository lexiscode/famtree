import { Link } from '@inertiajs/react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Features', href: '/features' },
    { label: 'Contact', href: '/contact' },
    { label: 'Blog', href: '/blog' },
  ];

  const resourceLinks = [
    { label: 'FAQ', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Accessibility', href: '#' },
  ];

  const socialLinks = [
    { icon: 'twitter', label: 'Twitter', href: '#' },
    { icon: 'facebook', label: 'Facebook', href: '#' },
    { icon: 'instagram', label: 'Instagram', href: '#' },
    { icon: 'linkedin', label: 'LinkedIn', href: '#' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-grid">
            {/* Logo & Tagline */}
            <div className="footer-col footer-brand">
              <h3 className="footer-logo">FamTree</h3>
              <p className="footer-tagline">Connecting Generations Digitally</p>
              <p className="footer-description">
                FamTree helps families trace their heritage, connect with relatives, and preserve their legacy for generations to come.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 className="footer-col-title">Quick Links</h4>
              <ul className="footer-links">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
                <li>
                  <Link href="/families">Public Families</Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="footer-col">
              <h4 className="footer-col-title">Resources</h4>
              <ul className="footer-links">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div className="footer-col footer-social">
              <h4 className="footer-col-title">Follow Us</h4>
              <div className="social-icons">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="social-icon"
                    title={link.label}
                    aria-label={link.label}
                  >
                    {link.label === 'Twitter' && (
                      <i className="bi bi-twitter"></i>
                    )}
                    {link.label === 'Facebook' && (
                      <i className="bi bi-facebook"></i>
                    )}
                    {link.label === 'Instagram' && (
                      <i className="bi bi-instagram"></i>
                    )}
                    {link.label === 'LinkedIn' && (
                      <i className="bi bi-linkedin"></i>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="footer-col footer-cta">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  // Will trigger modal later
                  console.log('Create Family clicked');
                }}
              >
                Create Your Family
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="footer-divider" />

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              &copy; {currentYear} FamTree. All rights reserved.
            </p>
            <button
              className="footer-back-to-top"
              onClick={scrollToTop}
              aria-label="Back to top"
              title="Back to top"
            >
              ↑ Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
