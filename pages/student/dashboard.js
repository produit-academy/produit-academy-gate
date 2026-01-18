import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/Header';

import apiFetch from '@/utils/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion } from 'framer-motion';
import styles from '../../styles/Dashboard.module.css';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courseReq, setCourseReq] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      // 1. Load Critical Data first (User & Status)
      let userData = null;
      try {
        const [userRes, reqRes] = await Promise.all([
          apiFetch('/api/student/dashboard/'),
          apiFetch('/api/courserequest/')
        ]);

        if (userRes.ok) {
          userData = await userRes.json();
          setUser(userData);
          if (!userData.college || !userData.phone_number) {
            router.push('/student/complete-profile');
            return;
          }
        }
        if (reqRes.ok) {
          const reqs = await reqRes.json();
          if (reqs.length > 0) setCourseReq(reqs[0]);
        }
      } catch (e) { console.error("Critical Load Error", e); }
      finally { setLoading(false); }

      // 2. Load History independently (doesn't block UI)
      try {
        const historyRes = await apiFetch('/api/student/tests/history/');
        if (historyRes.ok) {
          const history = await historyRes.json();
          setRecentTests(history.slice(0, 3));
        }
      } catch (e) { console.error("History Load Error", e); }
      finally { setHistoryLoading(false); }
    };
    loadDashboard();
  }, [router]);


  const isApproved = courseReq?.status === 'Approved';

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Head><title>Student Dashboard - Produit Academy</title></Head>
      <Header />
      <main className="main-content">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* 1. Welcome Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', marginTop: '30px', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ margin: 0, fontFamily: "'Segoe UI', sans-serif", fontWeight: '700', letterSpacing: '-0.5px' }}>Welcome, {user?.username}!</h1>
                <p style={{ color: '#666', marginTop: '5px' }}>
                  {user?.branch_name ? `Branch: ${user.branch_name}` : 'No Branch Selected'}
                  {courseReq && ` • Status: ${courseReq.status}`}
                </p>
              </div>
              <button onClick={() => router.push('/profile')} className="glass-btn">
                Edit Profile
              </button>
            </div>

            {!isApproved && (
              <div style={{ padding: '15px', background: '#fff3cd', color: '#856404', borderRadius: '5px', marginBottom: '30px', border: '1px solid #ffeeba' }}>
                <strong>Account Pending:</strong> You can access mock tests and materials once your course request is approved by the admin.
              </div>
            )}

            {/* 2. Main Action Grid */}
            <div className={styles.dashboardGrid}>
              <div
                className={`${styles.glassCardPrimary} ${!isApproved ? styles.disabled : ''}`}
                onClick={() => isApproved ? router.push('/student/create-test') : alert('Your account is not approved yet.')}
              >
                <h2 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', fontSize: '1.4rem', whiteSpace: 'nowrap' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/exam.png" alt="Exam" style={{ width: '32px', height: '32px', marginRight: '12px', flexShrink: 0 }} />
                  Take a Mock Test
                </h2>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  {isApproved ? 'Generate a custom test based on your preferences.' : 'Waiting for approval...'}
                </p>
              </div>
              <div
                className={`glass-card ${!isApproved ? 'disabled' : ''}`}
                onClick={() => isApproved ? router.push('/workinprogress') : alert('Your account is not approved yet.')}
                style={{ padding: '25px', cursor: isApproved ? 'pointer' : 'not-allowed', opacity: isApproved ? 1 : 0.7 }}
              >
                <h2 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', fontSize: '1.4rem', color: '#333', whiteSpace: 'nowrap' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/materials.png" alt="Exam" style={{ width: '32px', height: '32px', marginRight: '12px', flexShrink: 0 }} />
                  Study Materials
                </h2>
                <p style={{ color: '#666', margin: 0 }}>Access Notes, PYQs, and One-shots for your branch.</p>
              </div>
              <div
                className={`glass-card ${!isApproved ? 'disabled' : ''}`}
                onClick={() => isApproved ? router.push('/student/history') : alert('Your account is not approved yet.')}
                style={{ padding: '25px', cursor: isApproved ? 'pointer' : 'not-allowed', opacity: isApproved ? 1 : 0.7 }}
              >
                <h2 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', fontSize: '1.4rem', color: '#333', whiteSpace: 'nowrap' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/analytics.png" alt="Exam" style={{ width: '32px', height: '32px', marginRight: '12px', flexShrink: 0 }} />
                  Past Results
                </h2>
                <p style={{ color: '#666', margin: 0 }}>View detailed analytics and review answers.</p>
              </div>
              <div
                className="glass-card"
                onClick={() => router.push('/student/complaints')}
                style={{ padding: '25px', cursor: 'pointer' }}
              >
                <h2 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', fontSize: '1.4rem', color: '#333', whiteSpace: 'nowrap' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/complaint.png" alt="Support" style={{ width: '32px', height: '32px', marginRight: '12px', objectFit: 'contain', flexShrink: 0 }}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/4961/4961759.png" }} />
                  Help & Support
                </h2>
                <p style={{ color: '#666', margin: 0 }}>Report technical issues or submit complaints.</p>
              </div>
            </div>

            {/* 3. Recent Activity Section */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '10px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Recent Test History</h2>
                {isApproved && (
                  <button onClick={() => router.push('/student/history')} style={{ color: '#0070f3', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>View All &rarr;</button>
                )}
              </div>

              {historyLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading past results...</div>
              ) : recentTests.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left', color: '#888' }}>
                        <th style={{ padding: '10px 0' }}>Date</th>
                        <th style={{ padding: '10px 0' }}>Status</th>
                        <th style={{ padding: '10px 0' }}>Score</th>
                        <th style={{ padding: '10px 0', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTests.map(test => (
                        <tr key={test.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                          <td style={{ padding: '15px 0' }}>{new Date(test.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '15px 0' }}>
                            <span style={{
                              padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                              background: test.is_completed ? '#d4edda' : '#fff3cd',
                              color: test.is_completed ? '#155724' : '#856404'
                            }}>
                              {test.is_completed ? 'Completed' : 'In Progress'}
                            </span>
                          </td>
                          <td style={{ padding: '15px 0', fontWeight: 'bold' }}>
                            {test.is_completed ? test.score : '-'}
                          </td>
                          <td style={{ padding: '15px 0', textAlign: 'right' }}>
                            {test.is_completed ? (
                              <button onClick={() => router.push(`/student/test/${test.id}/result`)} style={{ color: '#0070f3', background: 'none', border: 'none', cursor: 'pointer' }}>View Analysis</button>
                            ) : (
                              <button onClick={() => router.push(`/student/test/${test.id}/attempt`)} style={{ color: '#e0a800', background: 'none', border: 'none', cursor: 'pointer' }}>Resume</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                  {isApproved ? "You haven't taken any tests yet." : "Approvals pending."}
                </p>
              )}
            </div>

          </motion.div>
        </div>
      </main>
    </>
  );
}