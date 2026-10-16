import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { complaintService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ComplaintFormModal = ({ isOpen, onClose, complaint, onSuccess }) => {
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electrical',
    roomNumber: '',
    priority: 'Medium',
    description: '',
    status: 'Pending',
    resolutionNotes: '',
  });

  useEffect(() => {
    if (complaint) {
      setFormData({
        title: complaint.title || '',
        category: complaint.category || 'Electrical',
        roomNumber: complaint.roomNumber || '',
        priority: complaint.priority || 'Medium',
        description: complaint.description || '',
        status: complaint.status || 'Pending',
        resolutionNotes: complaint.resolutionNotes || '',
      });
    } else {
      setFormData({
        title: '',
        category: 'Electrical',
        roomNumber: user?.student?.currentRoom?.roomNumber || '',
        priority: 'Medium',
        description: '',
        status: 'Pending',
        resolutionNotes: '',
      });
    }
  }, [complaint, isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (complaint && isAdmin) {
        await complaintService.update(complaint._id, {
          status: formData.status,
          resolutionNotes: formData.resolutionNotes,
          priority: formData.priority,
        });
        addToast('Complaint status updated successfully', 'success');
      } else {
        await complaintService.create({
          ...formData,
          studentId: user?.studentId || user?.student?._id,
        });
        addToast('Maintenance grievance ticket registered', 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error submitting complaint', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={complaint ? (isAdmin ? 'Resolve / Update Complaint' : 'Complaint Details') : 'Submit Maintenance Complaint'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Title */}
          <div className="form-group form-full">
            <label className="form-label">Issue Summary / Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Washroom water leakage or Wi-Fi connectivity drop"
              required
              disabled={!!complaint && !isAdmin}
              className="form-input"
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={!!complaint && !isAdmin}
              className="form-select"
            >
              <option value="Electrical">Electrical (Fan/Light/Switch)</option>
              <option value="Plumbing">Plumbing (Tap/Geyser/Drain)</option>
              <option value="Internet / Wi-Fi">Internet / Wi-Fi</option>
              <option value="Furniture">Furniture & Fixtures</option>
              <option value="Cleaning & Housekeeping">Cleaning & Housekeeping</option>
              <option value="Mess / Food">Mess & Dining</option>
              <option value="Security">Security & Access</option>
              <option value="Other">Other Issues</option>
            </select>
          </div>

          {/* Room Number */}
          <div className="form-group">
            <label className="form-label">Room Number *</label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. A-102"
              required
              disabled={!!complaint && !isAdmin}
              className="form-input"
            />
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Urgency / Priority *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="form-select"
            >
              <option value="Low">Low - Minor inconvenience</option>
              <option value="Medium">Medium - Normal attention</option>
              <option value="High">High - Prompt action needed</option>
              <option value="Urgent">Urgent - Emergency breakdown</option>
            </select>
          </div>

          {/* Status (Admin only) */}
          {isAdmin && complaint && (
            <div className="form-group">
              <label className="form-label">Ticket Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-select"
              >
                <option value="Pending">Pending Review</option>
                <option value="In Progress">In Progress (Assigned)</option>
                <option value="Resolved">Resolved (Fixed)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          )}

          {/* Description */}
          <div className="form-group form-full">
            <label className="form-label">Detailed Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide exact details of the fault so maintenance staff can resolve it swiftly..."
              required
              disabled={!!complaint && !isAdmin}
              className="form-textarea"
            />
          </div>

          {/* Resolution Notes (Admin only) */}
          {isAdmin && complaint && (
            <div className="form-group form-full">
              <label className="form-label">Warden / Technician Resolution Remarks</label>
              <textarea
                value={formData.resolutionNotes}
                onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
                placeholder="Explain what steps were taken to resolve this ticket..."
                className="form-textarea"
                style={{ minHeight: '70px' }}
              />
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.5rem', padding: '1rem 1.75rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : complaint ? 'Update Ticket' : 'File Complaint'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ComplaintFormModal;
