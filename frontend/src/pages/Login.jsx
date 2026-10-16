import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, User, Sparkles } from 'lucide-react';

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
        padding: '2rem 1.5rem',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 60%), #f8fafc',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.75rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-gradient)',
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--primary-glow)',
              marginBottom: '1rem',
            }}
          >
            <Building2 size={32} />
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>HostelHub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Campus Residence & Hostel Operations Portal
          </p>
        </div>

        {/* Demo Fast-Login Helpers */}
        <div
          style={{
            background: '#f8fafc',
            padding: '1.1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary-600)', marginBottom: '0.65rem' }}>
            <Sparkles size={13} />
            Instant 1-Click Demo Profiles:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@hostel.com', 'admin123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', display: 'flex', gap: '0.4rem', borderLeft: '3px solid #2563eb' }}
            >
              <ShieldCheck size={14} color="#2563eb" />
              Warden (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('rahul@student.com', 'student123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', display: 'flex', gap: '0.4rem', borderLeft: '3px solid #059669' }}
            >
              <User size={14} color="#059669" />
              Rahul (Resident)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  style={{ paddingLeft: '2.6rem' }}
                />
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
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
                  style={{ paddingLeft: '2.6rem' }}
                />
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: '0.85rem', width: '100%', fontSize: '0.96rem', marginTop: '0.4rem' }}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight size={17} />
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.85rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          New resident student?{' '}
          <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
            Create student account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
