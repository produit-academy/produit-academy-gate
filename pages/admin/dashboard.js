import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Header from '@/components/Header';

import apiFetch from '@/utils/api';
import Link from 'next/link';
import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/LoadingSpinner';

const slideInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function AdminDashboard() {
    const [requests, setRequests] = useState([]);
    const [branches, setBranches] = useState([]);
    const router = useRouter();
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [branch, setBranch] = useState('');
    const [classification, setClassification] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'admin') {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [requestsRes, branchesRes] = await Promise.all([
                    apiFetch('/api/admin/dashboard/'),
                    apiFetch('/api/branches/'),
                ]);

                if (requestsRes.ok) setRequests(await requestsRes.json());
                if (branchesRes.ok) setBranches(await branchesRes.json());

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleRequestUpdate = async (requestId, newStatus) => {
        const res = await apiFetch(`/api/courserequests/${requestId}/update/`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
            alert(`Request has been ${newStatus}.`);
            setRequests(prev => prev.filter(req => req.id !== requestId));
        } else {
            alert('Failed to update request.');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !branch || !classification || !title) {
            alert('Please fill all upload fields.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('branch', branch);
        formData.append('classification', classification);
        formData.append('title', title);

        const res = await apiFetch('/api/materials/upload/', {
            method: 'POST',
            body: formData,
        });

        if (res.ok) {
            alert('File uploaded successfully!');
            e.target.reset();
            setTitle('');
            setFile(null);
            setBranch('');
            setClassification('');
        } else {
            alert('Upload failed.');
        }
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <>
            <Head><title>Admin Dashboard - Produit Academy</title></Head>
            <Header />
            <main className="main-content">
                <div className="container">
                    <motion.div className="dashboard-container" variants={slideInUp} initial="hidden" animate="visible">

                        {/* --- HEADER --- */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                            <h1 className="dashboard-title" style={{ margin: 0 }}>Admin Dashboard</h1>
                            <Link href="/admin/students" style={{
                                background: '#0070f3', color: 'white', padding: '12px 20px',
                                borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <img src="/student.png" alt="Students" style={{ width: '30px', height: '30px', marginRight: '10px' }} />
                                Manage Students
                            </Link>
                        </div>

                        <div className="dashboard-section">
                            <h2 className="section-title">Examination System</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>

                                {/* 1. Question Bank Card */}
                                <div onClick={() => router.push('/admin/questions')}
                                    style={{
                                        padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px',
                                        cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                                        <img src="/bank.png" alt="Question Bank" style={{ width: '30px', height: '30px', marginRight: '10px' }} />
                                    </div>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#0070f3' }}>Question Bank</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                                        Add, edit, or delete questions. Questions added here are available for student mock tests.
                                    </p>
                                </div>

                                {/* 1.5 Contact Inquiries Card */}
                                <div onClick={() => router.push('/admin/inquiries')}
                                    style={{
                                        padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px',
                                        cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '30px' }}>📩</span>
                                    </div>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>Contact Inquiries</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                                        View messages from prospective students.
                                    </p>
                                </div>



                                {/* 2. Student Complaints */}
                                <div onClick={() => router.push('/admin/complaints')}
                                    style={{
                                        padding: '20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px',
                                        cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                                        <img src="/analytics.png" alt="Support" style={{ width: '30px', height: '30px', marginRight: '10px', objectFit: 'contain' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/4961/4961759.png" }} />
                                    </div>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#dc3545' }}>Student Complaints</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                                        View and resolve reported issues from students.
                                    </p>
                                </div>



                            </div>
                        </div>

                        {/* --- SECTION 2: PENDING REQUESTS --- */}
                        <div className="dashboard-section">
                            <h2 className="section-title">Pending Course Requests</h2>
                            {requests.length > 0 ? requests.map(req => (
                                <div key={req.id} className="request-item" style={{
                                    display: 'flex', justifyContent: 'space-between', padding: '15px',
                                    background: 'white', border: '1px solid #eee', borderRadius: '6px', marginBottom: '10px'
                                }}>
                                    <span>
                                        <strong>{req.student.username}</strong> ({req.student.student_id})
                                        <span style={{ color: '#666' }}> wants to join </span>
                                        <strong style={{ color: '#0070f3' }}>{req.branch.name}</strong>
                                    </span>
                                    <div className="request-actions" style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn btn-approve"
                                            onClick={() => handleRequestUpdate(req.id, 'Approved')}
                                            style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                                        >Approve</button>
                                        <button className="btn btn-reject"
                                            onClick={() => handleRequestUpdate(req.id, 'Rejected')}
                                            style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                                        >Reject</button>
                                    </div>
                                </div>
                            )) : <p style={{ color: '#666', fontStyle: 'italic' }}>No pending requests.</p>}
                        </div>

                        {/* --- SECTION 3: UPLOAD MATERIALS --- */}
                        <div className="dashboard-section">
                            <h2 className="section-title">Upload Study Materials</h2>
                            <form className="upload-form" onSubmit={handleUpload} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <input type="text" placeholder="Material Title (e.g. Thermodynamics Notes)" required
                                        onChange={(e) => setTitle(e.target.value)} value={title}
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                    <select required onChange={(e) => setBranch(e.target.value)} value={branch}
                                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                        <option value="">Select Branch</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                    <select required onChange={(e) => setClassification(e.target.value)} value={classification}
                                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                        <option value="">Select Category</option>
                                        <option value="PYQ">PYQ</option>
                                        <option value="Notes">Notes</option>
                                        <option value="One-shots">One-Shots</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input type="file" required onChange={(e) => setFile(e.target.files[0])} style={{ flex: 1 }} />
                                    <button type="submit" className="cta-btn"
                                        style={{ background: '#0070f3', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Upload Material
                                    </button>
                                </div>
                            </form>
                        </div>

                    </motion.div>
                </div>
            </main>
        </>
    );
}