import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';

import apiFetch from '@/utils/api';
import { motion } from 'framer-motion';

export default function CreateTest() {
    const router = useRouter();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [numQuestions, setNumQuestions] = useState(65);
    const [timeLimit, setTimeLimit] = useState(180);
    const [allowRepeats, setAllowRepeats] = useState(true);
    const fixedCategories = [
        { id: 'General Aptitude', name: 'General Aptitude' },
        { id: 'Engineering Mathematics', name: 'Engineering Mathematics' },
        { id: 'Subject Paper', name: 'Subject Paper' }
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                const [branchRes, userRes] = await Promise.all([
                    apiFetch('/api/branches/'),
                    apiFetch('/api/student/dashboard/')
                ]);

                let availableBranches = [];
                if (branchRes.ok) {
                    availableBranches = await branchRes.json();
                }

                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (!userData.college || !userData.phone_number) {
                        router.push('/student/complete-profile');
                        return;
                    }

                    if (userData.branch) {
                        // Filter to only the user's branch
                        const userBranch = availableBranches.find(b => b.id === userData.branch);
                        if (userBranch) {
                            setBranches([userBranch]);
                            setSelectedBranch(userBranch.id);
                        } else {
                            // Fallback if ID matches nothing (shouldn't happen if DB is consistent)
                            setBranches(availableBranches);
                        }
                    } else {
                        setBranches(availableBranches);
                    }
                }
            } catch (e) { console.error(e); }
        }
        loadData();
    }, [router]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const config = {
            branch_id: selectedBranch ? parseInt(selectedBranch) : null,
            categories: selectedCategories.length > 0 ? selectedCategories : [], // Send empty list if none selected
            number_of_questions: parseInt(numQuestions),
            time_limit_minutes: parseInt(timeLimit),
            allow_repeats: allowRepeats,
            question_types: selectedTypes.length > 0 ? selectedTypes : []
        };

        try {
            const res = await apiFetch('/api/student/tests/generate/', {
                method: 'POST',
                body: JSON.stringify(config)
            });

            if (res.ok) {
                const sessionData = await res.json();
                localStorage.setItem('currentTestSession', JSON.stringify(sessionData));
                router.push(`/student/test/${sessionData.id}/instructions`);
            } else {
                const err = await res.json();
                alert("Generation Failed: " + (err.error || "Unknown Error"));
            }
        } catch (error) {
            console.error(error);
            alert("Network Error");
        } finally {
            setLoading(false);
        }
    };

    const toggleCat = (id) => {
        if (selectedCategories.includes(id)) setSelectedCategories(prev => prev.filter(c => c !== id));
        else setSelectedCategories(prev => [...prev, id]);
    };

    const toggleType = (type) => {
        if (selectedTypes.includes(type)) setSelectedTypes(prev => prev.filter(t => t !== type));
        else setSelectedTypes(prev => [...prev, type]);
    };

    return (
        <>
            <Head><title>Create Mock Test - Produit Academy</title></Head>
            <Header />
            <main className="main-content">
                <div className="container" style={{ maxWidth: '800px' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '30px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Configure Your Mock Test</h1>

                        <form onSubmit={handleGenerate}>

                            {/* 1. Branch Selection */}
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Branch</label>
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    disabled={branches.length === 1}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: branches.length === 1 ? '#e9ecef' : 'white' }}
                                >
                                    {branches.length > 1 && <option value="">All Branches (Mixed)</option>}
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 2. Category Selection */}
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Select Topics (Optional)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {fixedCategories
                                        .filter(cat => {
                                            // Check if selected branch is Architecture
                                            const branch = branches.find(b => b.id == selectedBranch);
                                            if (branch && branch.name.toLowerCase().includes('architecture')) {
                                                if (cat.name === 'Engineering Mathematics') return false;
                                            }
                                            return true;
                                        })
                                        .map(cat => (
                                            <div key={cat.id}
                                                onClick={() => toggleCat(cat.id)}
                                                style={{
                                                    padding: '8px 15px', borderRadius: '20px', cursor: 'pointer',
                                                    border: '1px solid #0070f3',
                                                    background: selectedCategories.includes(cat.id) ? '#0070f3' : 'white',
                                                    color: selectedCategories.includes(cat.id) ? 'white' : '#0070f3',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {cat.name}
                                            </div>
                                        ))}

                                </div>
                            </div>


                            {/* Question Type Selection */}
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Select Question Types (Optional)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {['MCQ', 'MSQ', 'NAT'].map(type => (
                                        <div key={type}
                                            onClick={() => toggleType(type)}
                                            style={{
                                                padding: '8px 15px', borderRadius: '20px', cursor: 'pointer',
                                                border: '1px solid #0070f3',
                                                background: selectedTypes.includes(type) ? '#0070f3' : 'white',
                                                color: selectedTypes.includes(type) ? 'white' : '#0070f3',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {type}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Sliders/Inputs */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Questions</label>
                                    <input type="number" min="1" max="100" value={numQuestions} onChange={e => setNumQuestions(e.target.value)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Time (Minutes)</label>
                                    <input type="number" min="5" max="180" value={timeLimit} onChange={e => setTimeLimit(e.target.value)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                                </div>
                            </div>

                            {/* 4. Repeats Toggle */}
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={allowRepeats} onChange={e => setAllowRepeats(e.target.checked)} style={{ width: '20px', height: '20px', marginRight: '10px' }} />
                                    <span>Include questions I have already attempted?</span>
                                </label>
                            </div>

                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '15px', fontSize: '1.1rem', fontWeight: 'bold',
                                background: loading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer'
                            }}>
                                {loading ? 'Generating...' : 'Start Test Now'}
                            </button>

                        </form>
                    </motion.div>
                </div>
            </main >

        </>
    );
}