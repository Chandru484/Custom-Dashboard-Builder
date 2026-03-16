import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = ({ isAdmin = false }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            if (isAdmin && data.role !== 'admin') {
                setError('Unauthorized: Admin access only.');
                return;
            }
            navigate('/');
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Invalid email or password');
            } else if (err.response?.status === 500) {
                setError('Server error. Please check if backend is running correctly.');
            } else {
                setError('Could not connect to server. Ensure backend is started.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: '1.5rem',
            backgroundColor: '#f8fafc'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                backgroundColor: 'white',
                padding: '2.5rem',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        {isAdmin ? 'Admin Login' : 'Welcome Back'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        {isAdmin ? 'Access the admin dashboard' : 'Please enter your details to sign in'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        marginBottom: '1.25rem',
                        border: '1px solid #fee2e2',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                fontSize: '0.875rem'
                            }}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>Password</label>
                        </div>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    fontSize: '0.875rem'
                                }}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'background-color 0.2s',
                            fontSize: '0.875rem'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                {!isAdmin && (
                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
