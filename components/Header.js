import { useState, useEffect, useRef } from 'react';
import styles from './Header.module.css';
import Image from 'next/image';
import Link from 'next/link';

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
};

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setUser(decodeToken(token));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > 20) {
          headerRef.current.classList.add(styles.scrolled);
        } else {
          headerRef.current.classList.remove(styles.scrolled);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/login';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };



  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/student/dashboard';
  };
  const dashboardUrl = getDashboardUrl();

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <div className={`container ${styles.headerContent}`}>
          <div className={styles.logo}>
            <Link href="/">
              <Image src="/logo.png" alt="Produit Academy Logo" width={40} height={40} priority />
            </Link>
            <span className={styles.logoText}>Produit Academy GATE</span>
          </div>

          <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle menu">
            <span className={isMenuOpen ? styles.open : ''}></span>
            <span className={isMenuOpen ? styles.open : ''}></span>
            <span className={isMenuOpen ? styles.open : ''}></span>
          </button>

          <div className={styles.authButtons}>
            {user ? (
              <div className={styles.dropdown}>
                <button className={styles.dropdownBtn}>
                  <Image src={user.profile_picture || '/default-avatar.png'} alt="Profile" width={40} height={40} className={styles.avatar} />
                  {user.username} <span>&#9662;</span>
                </button>
                <div className={styles.dropdownContent}>
                  <Link href={dashboardUrl}>Dashboard</Link>
                  {user.role !== 'admin' && <Link href="/profile">Profile</Link>}
                  <button onClick={handleLogout} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', width: '100%', textAlign: 'left' }}>Logout</button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/#contact" className="glass-btn">Enquiry Now</Link>
                <Link href="/signup" className="glass-btn primary">Start Learning</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className={`${styles.overlay} ${isMenuOpen ? styles.open : ''}`} onClick={closeMenu}></div>
      )}

      <div className={`${styles.sidebar} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarHeader}>
            <Image src="/logo.png" alt="Produit Academy Logo" width={40} height={40} />
            <button className={styles.closeBtn} onClick={closeMenu}>&times;</button>
          </div>

          <div className={styles.sidebarButtons}>
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <Link href="/profile" className={styles.sidebarBtn} onClick={closeMenu}>Profile</Link>
                )}
                <Link href={dashboardUrl} className={styles.sidebarBtn} onClick={closeMenu}>Dashboard</Link>
                <button onClick={() => { closeMenu(); handleLogout(); }} className={styles.sidebarBtnDanger}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/#contact" className="glass-btn" onClick={closeMenu}>Enquiry Now</Link>
                <Link href="/signup" className="glass-btn primary" onClick={closeMenu}>Start Learning</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}