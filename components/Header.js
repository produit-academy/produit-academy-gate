import { useState, useEffect, useRef } from 'react';
import styles from './Header.module.css';
import Image from 'next/image';
import Link from 'next/link';
import apiFetch from '../utils/api';

const decodeToken = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
};

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileCoursesOpen, setIsMobileCoursesOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const headerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setUser(decodeToken(token));
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/api/branches/');
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (error.message !== 'Session expired') {
          console.error("Failed to fetch courses for header:", error);
        }
      }
    };
    load();
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
      setIsMobileCoursesOpen(false);
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

  const toggleMobileCourses = () => {
    setIsMobileCoursesOpen((v) => !v);
  };

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/student/dashboard';
  };
  const dashboardUrl = getDashboardUrl();


  const renderCourseLinks = (onClick) => {
    if (courses && courses.length > 0) {
      return courses.slice(0, 10).map((course) => {
        const href = `/courses/${course.id}`;
        return (
          <Link key={course.id} href={href} onClick={onClick}>{course.name}</Link>
        );
      });
    }
    return null;
  };

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <div className={`container ${styles.headerContent}`}>
          <div className={styles.logo}>
            <Link href="/" passHref>
              <Image src="/logo.png" alt="Produit Academy Logo" width={40} height={40} priority />
            </Link>
            <span className={styles.logoText}>Produit Academy GATE</span>
          </div>

          <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle menu">
            <span className={isMenuOpen ? styles.open : ''}></span>
            <span className={isMenuOpen ? styles.open : ''}></span>
            <span className={isMenuOpen ? styles.open : ''}></span>
          </button>

          <nav className={styles.desktopNav}>
            <Link href="/">Home</Link>

            <div className={styles.dropdown}>
              <button className={styles.dropdownBtn}>
                Test Series <span>&#9662;</span>
              </button>
              <div className={styles.dropdownContent}>
                {renderCourseLinks()}
                <Link href="/#courses">All Test Series</Link>
              </div>
            </div>

            <Link href="/#features">About Us</Link>
            <Link href="/#contact">Contact Us</Link>
          </nav>

          <div className={styles.authButtons}>
            {user ? (
              <div className={styles.dropdown}>
                <button className={styles.dropdownBtn}>
                  <Image src={user.profile_picture || '/default-avatar.png'} alt="Profile" width={40} height={40} className={styles.avatar} />
                  {user.username} <span>&#9662;</span>
                </button>
                <div className={styles.dropdownContent}>
                  <Link href={getDashboardUrl()}>Dashboard</Link>
                  {user.role !== 'admin' && <Link href="/profile">Profile</Link>}
                  <a onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</a>
                </div>
              </div>
            ) : (
              <>
                <Link href="/#contact" passHref><button className="glass-btn">Enquiry Now</button></Link>
                <Link href="/signup" passHref><button className="glass-btn primary">Start Learning</button></Link>
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

          <nav className={styles.sidebarNav}>
            <Link href="/" onClick={closeMenu}>Home</Link>

            <div className={`${styles.mobileDropdown} ${isMobileCoursesOpen ? styles.open : ''}`}>
              <button className={styles.dropdownBtn} onClick={toggleMobileCourses} aria-expanded={isMobileCoursesOpen} aria-controls="mobile-courses">
                Test Series <span>{isMobileCoursesOpen ? '\u25B2' : '\u25BC'}</span>
              </button>
              <div id="mobile-courses" className={`${styles.dropdownContent} ${isMobileCoursesOpen ? styles.show : ''}`}>
                {renderCourseLinks(closeMenu)}
                <Link href="/#courses" onClick={closeMenu}>All Test Series</Link>
              </div>
            </div>

            <Link href="/#features" onClick={closeMenu}>About Us</Link>
            <Link href="/#contact" onClick={closeMenu}>Contact Us</Link>
          </nav>

          <div className={styles.sidebarButtons}>
            {user ? (
              <>
                {user.role !== 'admin' && (
                  <Link href="/profile" passHref><button className={styles.sidebarBtn} onClick={closeMenu}>Profile</button></Link>
                )}
                <Link href={dashboardUrl} passHref><button className={styles.sidebarBtn} onClick={closeMenu}>Dashboard</button></Link>




                <button onClick={() => { closeMenu(); handleLogout(); }} className={styles.sidebarBtnDanger}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/#contact" passHref><button className="glass-btn" onClick={closeMenu}>Enquiry Now</button></Link>
                <Link href="/signup" passHref><button className="glass-btn primary" onClick={closeMenu}>Start Learning</button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}