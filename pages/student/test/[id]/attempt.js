/* eslint-disable @next/next/no-img-element */
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { submitMockTest } from '@/utils/api';
import styles from '@/styles/GateExam.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AttemptTest() {
    const router = useRouter();
    const { id } = router.query;
    const [testData, setTestData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [visited, setVisited] = useState(new Set([0]));
    const [markedForReview, setMarkedForReview] = useState(new Set());
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        const stored = localStorage.getItem('currentTestSession');
        if (stored) {
            const data = JSON.parse(stored);
            setTestData(data);
            setQuestions(data.questions);
            setTimeLeft(data.time_limit_minutes * 60);
        }
    }, [id]);

    const handleSubmit = useCallback(async (auto = false) => {
        if (!auto && !confirm("Are you sure you want to submit the test?")) return;

        const payload = Object.entries(answers).map(([qId, val]) => ({
            question_id: parseInt(qId),
            answer: val
        }));

        try {
            await submitMockTest(testData.id, payload);
            localStorage.removeItem('currentTestSession');
            router.push(`/student/test/${testData.id}/result`);
        } catch (error) {
            console.error("Submission error:", error);
            alert("Submission failed. Please try again.");
        }
    }, [answers, testData, router]);

    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmit(true);
                        return 0;
                    }
                    const newTime = prev - 1;
                    return newTime;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft, handleSubmit, testData]);

    // Persist session state changes
    useEffect(() => {
        if (!testData) return;

        const sessionStr = localStorage.getItem('currentTestSession');
        const currentSession = sessionStr ? JSON.parse(sessionStr) : {};

        const updatedSession = {
            ...currentSession,
            timeLeft,
            answers,
            visited: Array.from(visited),
            markedForReview: Array.from(markedForReview),
            currentQIndex
        };

        localStorage.setItem('currentTestSession', JSON.stringify(updatedSession));
    }, [timeLeft, answers, visited, markedForReview, currentQIndex, testData]);

    // Restore session state on load
    useEffect(() => {
        const stored = localStorage.getItem('currentTestSession');
        if (stored) {
            const data = JSON.parse(stored);
            setTestData(data);
            setQuestions(data.questions || []);

            if (data.timeLeft !== undefined) setTimeLeft(data.timeLeft);
            else setTimeLeft(data.time_limit_minutes * 60);

            if (data.answers) setAnswers(data.answers);
            if (data.visited) setVisited(new Set(data.visited));
            if (data.markedForReview) setMarkedForReview(new Set(data.markedForReview));
            if (data.currentQIndex !== undefined) setCurrentQIndex(data.currentQIndex);
        }
    }, [id]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleQuestionSelect = (index) => {
        setCurrentQIndex(index);
        setVisited(prev => new Set(prev).add(index));
    };

    const handleOptionSelect = (qId, cId) => {
        setAnswers(prev => ({ ...prev, [qId]: cId }));
    };

    const handleMSQSelect = (qId, cId) => {
        setAnswers(prev => {
            const current = prev[qId] || [];
            const list = Array.isArray(current) ? current : [];
            if (list.includes(cId)) {
                return { ...prev, [qId]: list.filter(id => id !== cId) };
            } else {
                return { ...prev, [qId]: [...list, cId] };
            }
        });
    };

    const handleSaveNext = () => {
        const currentQId = questions[currentQIndex].question_id;
        if (markedForReview.has(currentQId)) {
            const newMarked = new Set(markedForReview);
            newMarked.delete(currentQId);
            setMarkedForReview(newMarked);
        }

        if (currentQIndex < questions.length - 1) {
            handleQuestionSelect(currentQIndex + 1);
        }
    };

    const handleMarkReviewNext = () => {
        setMarkedForReview(prev => new Set(prev).add(questions[currentQIndex].question_id));
        if (currentQIndex < questions.length - 1) {
            handleQuestionSelect(currentQIndex + 1);
        }
    };

    const handleClearResponse = () => {
        const qId = questions[currentQIndex].question_id;
        const newAnswers = { ...answers };
        delete newAnswers[qId];
        setAnswers(newAnswers);
    };

    // --- RENDER HELPERS ---

    const getPaletteColor = (index, qId) => {
        const isAnswered = answers.hasOwnProperty(qId);
        const isMarked = markedForReview.has(qId);
        const isVisited = visited.has(index);

        if (isAnswered && isMarked) return 'purple-green';
        if (isMarked) return 'purple';
        if (isAnswered) return 'green';
        if (isVisited && !isAnswered) return 'red';
        return 'white';
    };

    if (!testData || !questions || questions.length === 0) return <LoadingSpinner />;

    const currentQ = questions[currentQIndex];

    return (
        <div className={styles.examContainer}>
            {/* --- HEADER --- */}
            <div className={styles.header}>
                <div><strong>Produit Academy Mock Test</strong></div>
                <div className={styles.timer}>Time Left: {formatTime(timeLeft)}</div>
            </div>

            <div className={styles.mainContent}>
                {/* --- QUESTION AREA (LEFT) --- */}
                <div className={styles.questionArea}>
                    <div className={styles.questionHeader}>
                        <h3>Question {currentQIndex + 1}</h3>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div className={styles.marks}>Marks: {currentQ.marks}</div>
                            <div className={styles.marks} style={{ backgroundColor: '#e2e3e5', color: '#333' }}>
                                Type: {currentQ.question_type}
                            </div>
                        </div>
                    </div>

                    <div className={styles.questionText}>
                        <Latex>{currentQ.question_text}</Latex>
                        {currentQ.question_image && <div style={{ margin: '15px 0' }}><img src={currentQ.question_image} alt="Question" style={{ maxWidth: '100%', maxHeight: '400px' }} /></div>}
                    </div>

                    <div className={styles.optionsList}>
                        {currentQ.question_type === 'NAT' ? (
                            <div className={styles.natInputContainer} style={{ marginTop: '20px' }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>Enter your numerical answer:</label>
                                <input
                                    type="number"
                                    step="any"
                                    className={styles.natInput}
                                    style={{ padding: '10px', fontSize: '1.2rem', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
                                    value={answers[currentQ.question_id] || ''}
                                    onChange={(e) => handleOptionSelect(currentQ.question_id, e.target.value)}
                                    placeholder="Type answer here"
                                />
                            </div>
                        ) : currentQ.question_type === 'MSQ' ? (
                            currentQ.choices.map(choice => (
                                <label key={choice.id} className={styles.optionItem} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            name={`q-${currentQ.question_id}`}
                                            checked={(answers[currentQ.question_id] || []).includes(choice.id)}
                                            onChange={() => handleMSQSelect(currentQ.question_id, choice.id)}
                                            style={{ width: '20px', height: '20px', marginRight: '10px', cursor: 'pointer' }}
                                        />
                                        <span><Latex>{choice.text}</Latex></span>
                                    </div>
                                    {choice.image && <div style={{ marginLeft: '30px', marginTop: '5px' }}><img src={choice.image} alt="Option" style={{ maxWidth: '200px', maxHeight: '150px' }} /></div>}
                                </label>
                            ))
                        ) : (
                            currentQ.choices.map(choice => (
                                <label key={choice.id} className={styles.optionItem} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="radio"
                                            name={`q-${currentQ.question_id}`}
                                            checked={answers[currentQ.question_id] === choice.id}
                                            onChange={() => handleOptionSelect(currentQ.question_id, choice.id)}
                                        />
                                        <span><Latex>{choice.text}</Latex></span>
                                    </div>
                                    {choice.image && <div style={{ marginLeft: '30px', marginTop: '5px' }}><img src={choice.image} alt="Option" style={{ maxWidth: '200px', maxHeight: '150px' }} /></div>}
                                </label>
                            ))
                        )}
                    </div>

                    <div className={styles.footerButtons}>
                        <button className={styles.btnSecondary} onClick={handleMarkReviewNext}>Mark for Review & Next</button>
                        <button className={styles.btnSecondary} onClick={handleClearResponse}>Clear Response</button>
                        <button className={styles.btnPrimary} onClick={handleSaveNext}>Save & Next</button>
                    </div>
                </div>

                {/* --- SIDEBAR PALETTE (RIGHT) --- */}
                <div className={styles.sidebar}>
                    <div className={styles.profileSection}>
                        <Image src="/default-avatar.png" alt="User" width={50} height={50} />
                        <span>Candidate</span>
                    </div>

                    <div className={styles.paletteGrid}>
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                className={`${styles.paletteBtn} ${styles[getPaletteColor(idx, q.question_id)]}`}
                                onClick={() => handleQuestionSelect(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className={styles.legend}>
                        <div><span className={`${styles.dot} ${styles.green}`}></span> Answered</div>
                        <div><span className={`${styles.dot} ${styles.red}`}></span> Not Answered</div>
                        <div><span className={`${styles.dot} ${styles.white}`}></span> Not Visited</div>
                        <div><span className={`${styles.dot} ${styles.purple}`}></span> Marked for Review</div>
                    </div>

                    <button className={styles.submitBtn} onClick={() => handleSubmit(false)}>Submit Test</button>
                </div>
            </div>
        </div>
    );
}