/* eslint-disable @next/next/no-img-element */
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { fetchTestAnalytics, fetchTestQuestions } from '@/utils/api';
import styles from '@/styles/Dashboard.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function TestResult() {
    const router = useRouter();
    const { id } = router.query;
    const [result, setResult] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const questionsPerPage = 5;

    // 1. Fetch Summary (Score, Stats) - Fast Load
    useEffect(() => {
        if (id) {
            fetchTestAnalytics(id).then(res => setResult(res.data));
        }
    }, [id]);

    // 2. Fetch Questions for Current Page - Async Load
    useEffect(() => {
        if (id) {
            setLoadingQuestions(true);
            fetchTestQuestions(id, currentPage)
                .then(res => {
                    setQuestions(res.data.results);
                    setLoadingQuestions(false);
                })
                .catch(err => {
                    console.error("Failed to load questions", err);
                    setLoadingQuestions(false);
                });
        }
    }, [id, currentPage]);

    if (!result) return <LoadingSpinner />;

    const percentage = ((result.score / (result.total_questions * 1)) * 100).toFixed(2);
    const totalPages = Math.ceil(result.total_questions / questionsPerPage);
    const indexOfFirstQuestion = (currentPage - 1) * questionsPerPage;

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
        <div className="container" style={{ padding: '40px' }}>
            <h1 style={{ textAlign: 'center' }}>Test Result Analysis</h1>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '30px 0', flexWrap: 'wrap' }}>
                <div className="card" style={{ padding: '20px', textAlign: 'center', minWidth: '150px' }}>
                    <h3>Score</h3>
                    <h1 style={{ color: '#0070f3' }}>{result.score}</h1>
                </div>
                <div className="card" style={{ padding: '20px', textAlign: 'center', minWidth: '150px' }}>
                    <h3>Questions</h3>
                    <h1>{result.total_questions}</h1>
                </div>
                <div className="card" style={{ padding: '20px', textAlign: 'center', minWidth: '150px' }}>
                    <h3>Accuracy</h3>
                    <h1>{percentage}%</h1>
                </div>
            </div>

            <h2>Detailed Analysis (Page {currentPage} of {totalPages})</h2>
            <div style={{ marginTop: '20px', minHeight: '300px' }}>
                {loadingQuestions ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        <LoadingSpinner />
                        <p>Loading questions...</p>
                    </div>
                ) : (
                    questions.map((q, index) => (
                        <div key={q.id} className="card" style={{ marginBottom: '15px', padding: '15px', borderLeft: q.is_correct ? '5px solid green' : '5px solid red' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p><strong>Q{indexOfFirstQuestion + index + 1}: <Latex>{q.question.text}</Latex></strong></p>
                                {q.question.image && (
                                    <div style={{ margin: '10px 0' }}>
                                        <img src={q.question.image} alt="Question" style={{ maxWidth: '100%', maxHeight: '300px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    </div>
                                )}
                                <span style={{
                                    backgroundColor: q.awarded_marks > 0 ? '#d4edda' : (q.awarded_marks < 0 ? '#f8d7da' : '#e2e3e5'),
                                    color: q.awarded_marks > 0 ? '#155724' : (q.awarded_marks < 0 ? '#721c24' : '#383d41'),
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.9em',
                                    fontWeight: 'bold',
                                    marginLeft: '10px'
                                }}>
                                    Marks: {q.awarded_marks > 0 ? '+' : ''}{q.awarded_marks}
                                </span>
                                <span style={{
                                    backgroundColor: '#e2e3e5',
                                    color: '#383d41',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.9em',
                                    fontWeight: 'bold',
                                    marginLeft: '10px'
                                }}>
                                    {q.question.question_type}
                                </span>
                            </div>

                            <div style={{ margin: '10px 0' }}>
                                {q.question.question_type === 'NAT' ? (
                                    <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                                        <div style={{ marginBottom: '5px', color: q.is_correct ? 'green' : (q.nat_answer !== null ? 'red' : 'gray') }}>
                                            <strong>Your Answer:</strong> {q.nat_answer !== null ? q.nat_answer : 'Not Answered'}
                                        </div>
                                        <div style={{ color: 'green' }}>
                                            <strong>Correct Range:</strong> {q.question.nat_min} - {q.question.nat_max}
                                        </div>
                                    </div>
                                ) : (
                                    q.question.choices.map(c => {
                                        const isSelected = q.selected_choice?.id === c.id || (q.selected_choices?.some(sc => sc.id === c.id));
                                        return (
                                            <div key={c.id} style={{
                                                padding: '5px',
                                                backgroundColor: c.is_correct ? '#d4edda' : (isSelected ? '#f8d7da' : 'transparent'),
                                                color: c.is_correct ? '#155724' : (isSelected ? '#721c24' : 'black')
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    {c.text && <span><Latex>{c.text}</Latex> </span>}
                                                    {c.image && <img src={c.image} alt="Choice" style={{ marginTop: '5px', maxWidth: '150px', maxHeight: '100px', border: '1px solid #ddd' }} />}
                                                </div>
                                                <div style={{ marginTop: '5px' }}>
                                                    {c.is_correct && <strong>(Correct Answer)</strong>} {isSelected && <strong>(Your Answer)</strong>}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', marginBottom: '40px' }}>
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="glass-btn"
                    style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                    &larr; Previous {questionsPerPage}
                </button>
                <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="glass-btn"
                    style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                    Next {questionsPerPage} &rarr;
                </button>
            </div>

            <button onClick={() => router.push('/student/dashboard')} className="glass-btn" style={{ marginTop: '20px' }}>
                Back to Dashboard
            </button>
        </div>
    );
}