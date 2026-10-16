import React, { useState, useEffect } from 'react';
import { noticeService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import NoticeFormModal from '../components/forms/NoticeFormModal';

import {
  Bell,
  Search,
  Plus,
  Pin,
  Calendar,
  UserCheck,
  Edit2,
  Trash2,
  Megaphone,
} from 'lucide-react';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noticeToEdit, setNoticeToEdit] = useState(null);

  const { addToast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchNotices();
  }, [categoryFilter]);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (search) params.search = search;

      const res = await noticeService.getAll(params);
      setNotices(res.data.notices || []);
    } catch (err) {
      addToast('Error fetching notices', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotices();
  };

  const handleDelete = async (notice) => {
    if (!window.confirm(`Delete notice "${notice.title}"?`)) return;
    try {
      await noticeService.delete(notice._id);
      addToast('Notice removed', 'success');
      fetchNotices();
    } catch (err) {
      addToast('Error deleting notice', 'error');
    }
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Hostel Notice Board</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Official announcements, cafeteria meal plans, curfew rules, and event notifications
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setNoticeToEdit(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            Post Announcement
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="table-card" style={{ marginBottom: '1.5rem' }}>
        <div className="table-toolbar">
          <form onSubmit={handleSearchSubmit} className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements..."
            />
          </form>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Categories</option>
                <option value="General">General</option>
                <option value="Rules & Regulations">Rules</option>
                <option value="Mess & Dining">Mess & Dining</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Events">Events</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notices Cards Grid */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading notices...
          </div>
        ) : notices.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No notices found"
            description="There are currently no active announcements matching your query."
            actionLabel={isAdmin ? 'Post Notice' : null}
            onAction={() => {
              setNoticeToEdit(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div
            style={{
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {notices.map((n) => (
              <div
                key={n._id}
                className="card"
                style={{
                  background: n.isPinned ? 'var(--bg-card)' : 'var(--bg-card)',
                  border: n.isPinned ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-color)',
                  boxShadow: n.isPinned ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {n.isPinned && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--primary-gradient)',
                            color: 'white',
                          }}
                        >
                          <Pin size={11} /> PINNED
                        </span>
                      )}
                      <Badge status={n.category} text={n.category} />
                    </div>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Audience: {n.targetAudience}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
                    {n.title}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {n.content}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.85rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div>
                    Posted by <strong style={{ color: 'var(--text-primary)' }}>{n.postedBy || 'Hostel Admin'}</strong> • {new Date(n.createdAt).toLocaleDateString()}
                  </div>

                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        onClick={() => {
                          setNoticeToEdit(n);
                          setIsModalOpen(true);
                        }}
                        className="btn-icon btn-sm"
                        title="Edit Notice"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(n)}
                        className="btn-icon btn-sm"
                        title="Delete Notice"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NoticeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notice={noticeToEdit}
        onSuccess={fetchNotices}
      />
    </div>
  );
};

export default Notices;
