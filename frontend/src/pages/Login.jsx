import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`, 'success');
      if (user.role === 'admin') {
        navigate('/');
      } else {
        navigate('/portal');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid email or password', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.15), transparent 70%), var(--bg-primary)',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Brand Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-gradient)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '1rem',
            }}
          >
            <Building2 size={30} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome to HostelHub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Full-Stack Smart Hostel Management System
          </p>
        </div>

        {/* Demo Fast-Login Helper Buttons */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
            ⚡ Instant 1-Click Demo Accounts:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@hostel.com', 'admin123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', gap: '0.4rem' }}
            >
              <ShieldCheck size={14} color="var(--primary-500)" />
              Warden (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('rahul@student.com', 'student123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', gap: '0.4rem' }}
            >
              <User size={14} color="var(--info)" />
              Rahul (Student)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hostel.com"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail
                  size={17}
                  style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock
                  size={17}
                  style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: '0.8rem', width: '100%', fontSize: '0.95rem', marginTop: '0.5rem' }}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight size={17} />
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
            Register new resident
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
