import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ComplaintFormModal from '../components/forms/ComplaintFormModal';

import {
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock,
  Filter,
  Wrench,
  Trash2,
  User,
  CheckCheck,
} from 'lucide-react';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [complaintToEdit, setComplaintToEdit] = useState(null);

  const { addToast } = useToast();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;

      const res = await complaintService.getAll(params);
      setComplaints(res.data.complaints || []);
    } catch (err) {
      addToast('Error fetching maintenance tickets', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickResolve = async (complaint) => {
    const notes = window.prompt('Enter resolution note:', 'Issue inspected and fixed by technician');
    if (notes === null) return;

    try {
      await complaintService.update(complaint._id, {
        status: 'Resolved',
        resolutionNotes: notes,
      });
      addToast('Ticket marked as Resolved', 'success');
      fetchComplaints();
    } catch (err) {
      addToast('Failed to resolve complaint', 'error');
    }
  };

  const handleDelete = async (complaint) => {
    if (!window.confirm('Delete this complaint ticket?')) return;
    try {
      await complaintService.delete(complaint._id);
      addToast('Complaint removed', 'success');
      fetchComplaints();
    } catch (err) {
      addToast('Error deleting complaint', 'error');
    }
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Maintenance & Grievances</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Report room breakdowns, track repair statuses, and monitor facility upkeep
          </p>
        </div>

        <button
          onClick={() => {
            setComplaintToEdit(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} />
          File New Complaint
        </button>
      </div>

      {/* Filter Bar */}
      <div className="table-card" style={{ marginBottom: '1.5rem' }}>
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <Wrench size={18} color="var(--primary-600)" />
            <span>Active Maintenance Tickets ({complaints.length})</span>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Categories</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Internet / Wi-Fi">Internet / Wi-Fi</option>
                <option value="Furniture">Furniture</option>
                <option value="Cleaning & Housekeeping">Cleaning</option>
                <option value="Mess / Food">Mess & Food</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading tickets...
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No complaints filed"
            description="All hostel systems and facilities are currently operating normally."
            actionLabel="File Complaint"
            onAction={() => {
              setComplaintToEdit(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ticket / Issue</th>
                  <th>Category</th>
                  <th>Room No</th>
                  <th>Reported By</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '300px' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {c.description?.substring(0, 75)}...
                      </div>
                      {c.resolutionNotes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem', fontWeight: 500 }}>
                          ✓ Resolution: {c.resolutionNotes}
                        </div>
                      )}
                    </td>

                    <td>
                      <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{c.category}</span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                        {c.roomNumber}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                        {c.student?.firstName} {c.student?.lastName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <Badge status={c.priority} />
                    </td>

                    <td>
                      <Badge status={c.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {isAdmin && c.status !== 'Resolved' && (
                          <button
                            onClick={() => handleQuickResolve(c)}
                            title="Mark Resolved"
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--success)', fontSize: '0.78rem' }}
                          >
                            <CheckCheck size={14} />
                            Resolve
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setComplaintToEdit(c);
                              setIsModalOpen(true);
                            }}
                            title="Update Status"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.78rem' }}
                          >
                            Edit
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(c)}
                            title="Delete Ticket"
                            className="btn-icon btn-sm"
                            style={{ color: 'var(--danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ComplaintFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        complaint={complaintToEdit}
        onSuccess={fetchComplaints}
      />
    </div>
  );
};

export default Complaints;
