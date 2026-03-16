import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authServices } from '../services/api';
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const Settings = () => {
    const { user, refreshUser } = useAuth();
    
    // Name State
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [nameLoading, setNameLoading] = useState(false);
    const [nameMessage, setNameMessage] = useState({ type: '', text: '' });

    // Password State
    const [passwords, setPasswords] = useState({
        old: '',
        new: '',
        confirm: ''
    });
    const [passLoading, setPassLoading] = useState(false);
    const [passMessage, setPassMessage] = useState({ type: '', text: '' });

    const handleNameUpdate = async (e) => {
        e.preventDefault();
        setNameLoading(true);
        setNameMessage({ type: '', text: '' });
        
        try {
            await authServices.updateProfile({ full_name: fullName });
            setNameMessage({ type: 'success', text: 'Name updated successfully!' });
            refreshUser();
        } catch (err) {
            setNameMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to update name' });
        } finally {
            setNameLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setPassMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setPassLoading(true);
        setPassMessage({ type: '', text: '' });

        try {
            await authServices.updateProfile({
                old_password: passwords.old,
                new_password: passwords.new
            });
            setPassMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswords({ old: '', new: '', confirm: '' });
        } catch (err) {
            setPassMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to update password' });
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)' }}>Account Settings</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage your profile information and security settings</p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Profile Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '8px', color: 'var(--primary)' }}>
                            <User size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Profile Information</h2>
                    </div>

                    <form onSubmit={handleNameUpdate}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Email Address</label>
                            <input 
                                className="form-input" 
                                value={user?.email || ''} 
                                disabled 
                                style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Email cannot be changed</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Full Name</label>
                            <input 
                                className="form-input" 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {nameMessage.text && (
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem',
                                backgroundColor: nameMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                color: nameMessage.type === 'success' ? '#166534' : '#991b1b',
                                fontSize: '0.875rem'
                            }}>
                                {nameMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {nameMessage.text}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={nameLoading}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {nameLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                {/* Password Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#b45309' }}>
                            <Lock size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Security</h2>
                    </div>

                    <form onSubmit={handlePasswordUpdate}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Current Password</label>
                            <input 
                                type="password"
                                className="form-input" 
                                value={passwords.old} 
                                onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label className="form-label">New Password</label>
                                <input 
                                    type="password"
                                    className="form-input" 
                                    value={passwords.new} 
                                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Confirm New Password</label>
                                <input 
                                    type="password"
                                    className="form-input" 
                                    value={passwords.confirm} 
                                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {passMessage.text && (
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem',
                                backgroundColor: passMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                                color: passMessage.type === 'success' ? '#166534' : '#991b1b',
                                fontSize: '0.875rem'
                            }}>
                                {passMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {passMessage.text}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn" 
                            disabled={passLoading}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                backgroundColor: 'var(--text-dark)', color: 'white'
                            }}
                        >
                            {passLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
