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
      {/* Background Gradient */}
      <div className="footer-gradient"></div>

      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-grid">
            {/* Logo & Tagline */}
            <div className="footer-col footer-brand">
              <div className="footer-logo-wrapper">
                <h3 className="footer-logo">FamTree</h3>
                <span className="logo-badge">β</span>
              </div>
              <p className="footer-tagline">Connecting Generations Digitally</p>
              <p className="footer-description">
                FamTree helps families trace their heritage, connect with relatives, and preserve their legacy for generations to come.
              </p>

              {/* Newsletter Signup */}
              <div className="newsletter-signup">
                <label className="newsletter-label">Get Updates</label>
                <div className="newsletter-input-group">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="newsletter-input"
                    aria-label="Email for newsletter"
                  />
                  <button className="newsletter-btn" title="Subscribe">
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 className="footer-col-title">Product</h4>
              <ul className="footer-links">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                      <span className="link-arrow">→</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/families" className="footer-link">
                    Public Families
                    <span className="link-arrow">→</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="footer-col">
              <h4 className="footer-col-title">Legal</h4>
              <ul className="footer-links">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                      <span className="link-arrow">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div className="footer-col footer-social">
              <h4 className="footer-col-title">Connect</h4>
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
              <p className="social-text">Follow us for family tips & updates</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              <span className="copyright-symbol">©</span> {currentYear} <strong>FamTree</strong>. Preserving legacies, one family at a time.
            </p>
            <div className="footer-bottom-links">
              <a href="#" className="bottom-link">Status</a>
              <a href="#" className="bottom-link">Changelog</a>
              <a href="#" className="bottom-link">Security</a>
              <button
                className="footer-back-to-top"
                onClick={scrollToTop}
                aria-label="Back to top"
                title="Back to top"
              >
                ↑ Top
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Accent */}
      <div className="footer-accent"></div>
    </footer>
  );
}
