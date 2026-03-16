import React from 'react';
import { User } from 'lucide-react';

const Settings = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)' }}>Settings</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Application configuration and preferences</p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                        <User size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Guest Mode Active</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                        The sign-in feature has been removed. You are currently using the application in full access mode. Account-specific settings are no longer required.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
