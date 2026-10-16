import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { studentService, roomService, allocationService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

const AllocationFormModal = ({ isOpen, onClose, onSuccess, preselectedStudentId, preselectedRoomId }) => {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    studentId: preselectedStudentId || '',
    roomId: preselectedRoomId || '',
    academicYear: '2025-2026',
    startDate: new Date().toISOString().substring(0, 10),
    remarks: 'Regular academic semester allotment',
    generateFeeInvoice: true,
  });

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen]);

  const loadDependencies = async () => {
    setIsLoadingData(true);
    try {
      const [studentsRes, roomsRes] = await Promise.all([
        studentService.getAll({ limit: 100 }),
        roomService.getAll({ limit: 100 }),
      ]);

      const allStudents = studentsRes.data.students || [];
      const allRooms = roomsRes.data.rooms || [];

      // Filter available rooms (occupiedBeds < capacity and status !== 'Maintenance')
      const availableRooms = allRooms.filter(
        (r) => (r.capacity - (r.occupiedBeds || 0)) > 0 && r.status !== 'Maintenance'
      );

      setStudents(allStudents);
      setRooms(availableRooms);

      // Default selections if unselected
      if (!formData.studentId && allStudents.length > 0) {
        const firstUnallocated = allStudents.find((s) => !s.currentRoom);
        if (firstUnallocated) {
          setFormData((prev) => ({ ...prev, studentId: firstUnallocated._id }));
        }
      }

      if (!formData.roomId && availableRooms.length > 0) {
        setFormData((prev) => ({ ...prev, roomId: availableRooms[0]._id }));
      }
    } catch (err) {
      addToast('Error loading students and rooms for allocation', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.roomId) {
      addToast('Please select both a student and an available room', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await allocationService.allocate(formData);
      addToast(res.data.message || 'Room allocated successfully!', 'success');

      // Confetti burst for happy milestone
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
      });

      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to allocate room', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRoom = rooms.find((r) => r._id === formData.roomId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Room to Student" size="md">
      {isLoadingData ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading student and room inventory...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Student Selector */}
            <div className="form-group form-full">
              <label className="form-label">Select Student *</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
                className="form-select"
              >
                <option value="">-- Choose Student --</option>
                {students.map((st) => (
                  <option key={st._id} value={st._id} disabled={!!st.currentRoom}>
                    {st.firstName} {st.lastName} ({st.registrationNumber}) - {st.course}{' '}
                    {st.currentRoom ? ' [Already Allocated]' : ' [Eligible]'}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Selector */}
            <div className="form-group form-full">
              <label className="form-label">Select Available Room *</label>
              <select
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                required
                className="form-select"
              >
                <option value="">-- Choose Available Room --</option>
                {rooms.map((rm) => {
                  const freeBeds = rm.capacity - (rm.occupiedBeds || 0);
                  return (
                    <option key={rm._id} value={rm._id}>
                      Room {rm.roomNumber} ({rm.block}, Floor {rm.floor}) - {rm.roomType} | {freeBeds} bed(s) available - ₹{Number(rm.feePerSemester).toLocaleString()}/sem
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Preview of Room Details */}
            {selectedRoom && (
              <div
                className="form-full"
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Configured Fee:</span>
                  <div style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                    ₹{Number(selectedRoom.feePerSemester).toLocaleString()} / semester
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Free Beds:</span>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>
                    {selectedRoom.capacity - (selectedRoom.occupiedBeds || 0)} of {selectedRoom.capacity} Beds
                  </div>
                </div>
              </div>
            )}

            {/* Academic Year */}
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2025-2026"
                required
                className="form-input"
              />
            </div>

            {/* Allocation Start Date */}
            <div className="form-group">
              <label className="form-label">Allocation Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="form-input"
              />
            </div>

            {/* Auto Generate Fee Invoice */}
            <div
              className="form-group form-full"
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={formData.generateFeeInvoice}
                  onChange={(e) => setFormData({ ...formData, generateFeeInvoice: e.target.checked })}
                />
                Automatically generate Semester Rent invoice for this allotment
              </label>
            </div>

            {/* Remarks */}
            <div className="form-group form-full">
              <label className="form-label">Remarks / Special Instructions</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Optional notes regarding key handover, special requirements, etc."
                className="form-textarea"
                style={{ minHeight: '65px' }}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.5rem', padding: '1rem 1.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || rooms.length === 0}>
              {isSubmitting ? 'Allocating...' : 'Confirm Allotment'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AllocationFormModal;
