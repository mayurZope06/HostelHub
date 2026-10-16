import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { noticeService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const NoticeFormModal = ({ isOpen, onClose, notice, onSuccess }) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    targetAudience: 'All Students',
    isPinned: false,
  });

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title || '',
        content: notice.content || '',
        category: notice.category || 'General',
        targetAudience: notice.targetAudience || 'All Students',
        isPinned: !!notice.isPinned,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'General',
        targetAudience: 'All Students',
        isPinned: false,
      });
    }
  }, [notice, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (notice) {
        await noticeService.update(notice._id, formData);
        addToast('Notice updated successfully', 'success');
      } else {
        await noticeService.create(formData);
        addToast('Notice broadcasted to residents', 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error broadcasting notice', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={notice ? 'Edit Announcement' : 'Broadcast New Notice'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group form-full">
            <label className="form-label">Notice Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Revised Mess Timings or Water Supply Maintenance"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notice Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-select"
            >
              <option value="General">General Notice</option>
              <option value="Rules & Regulations">Rules & Regulations</option>
              <option value="Mess & Dining">Mess & Dining</option>
              <option value="Maintenance">Maintenance Alert</option>
              <option value="Events">Events & Sports</option>
              <option value="Urgent Alert">Urgent Emergency</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="form-select"
            >
              <option value="All Students">All Students</option>
              <option value="Block A">Block A Residents</option>
              <option value="Block B">Block B Residents</option>
              <option value="Block C">Block C Residents</option>
              <option value="Block D">Block D Residents</option>
              <option value="Staff">Hostel Staff & Wardens</option>
            </select>
          </div>

          <div className="form-group form-full">
            <label className="form-label">Notice Description / Announcement Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write the full announcement text here..."
              required
              className="form-textarea"
              style={{ minHeight: '120px' }}
            />
          </div>

          <div
            className="form-group form-full"
            style={{
              background: 'var(--bg-secondary)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              />
              Pin to top of Notice Board for high visibility
            </label>
          </div>
        </div>

        <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.5rem', padding: '1rem 1.75rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : notice ? 'Update Notice' : 'Post Notice'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NoticeFormModal;
