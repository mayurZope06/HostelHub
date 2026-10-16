import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { roomService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AMENITIES_LIST = [
  'AC',
  'High-speed Wi-Fi',
  'Attached Bathroom',
  'Study Table',
  'Balcony',
  'Ceiling Fan',
  'Individual Wardrobes',
  'Lockers',
  'Geyser / Hot Water',
];

const RoomFormModal = ({ isOpen, onClose, room, onSuccess }) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    roomNumber: '',
    block: 'Block A',
    floor: 1,
    roomType: 'Double',
    capacity: 2,
    feePerSemester: 28000,
    status: 'Available',
    amenities: ['High-speed Wi-Fi', 'Study Table', 'Attached Bathroom', 'Ceiling Fan'],
    description: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        block: room.block || 'Block A',
        floor: room.floor !== undefined ? room.floor : 1,
        roomType: room.roomType || 'Double',
        capacity: room.capacity || 2,
        feePerSemester: room.feePerSemester || 28000,
        status: room.status || 'Available',
        amenities: room.amenities || [],
        description: room.description || '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [room, isOpen]);

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    let defCapacity = 2;
    let defFee = 28000;

    if (selectedType === 'Single') {
      defCapacity = 1;
      defFee = 38000;
    } else if (selectedType === 'Double') {
      defCapacity = 2;
      defFee = 28000;
    } else if (selectedType === 'Triple') {
      defCapacity = 3;
      defFee = 22000;
    } else if (selectedType === 'Dormitory') {
      defCapacity = 4;
      defFee = 16000;
    }

    setFormData((prev) => ({
      ...prev,
      roomType: selectedType,
      capacity: defCapacity,
      feePerSemester: defFee,
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (room) {
        await roomService.update(room._id, formData);
        addToast(`Room ${formData.roomNumber} updated successfully`, 'success');
      } else {
        await roomService.create(formData);
        addToast(`Room ${formData.roomNumber} added to inventory`, 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving room record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={room ? `Edit Room ${room.roomNumber}` : 'Add New Hostel Room'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Room Number */}
          <div className="form-group">
            <label className="form-label">Room Number *</label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. A-301"
              required
              className="form-input"
            />
          </div>

          {/* Block / Wing */}
          <div className="form-group">
            <label className="form-label">Block / Wing *</label>
            <select
              value={formData.block}
              onChange={(e) => setFormData({ ...formData, block: e.target.value })}
              className="form-select"
            >
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
              <option value="Block D">Block D</option>
              <option value="Main Wing">Main Wing</option>
            </select>
          </div>

          {/* Floor & Type */}
          <div className="form-group">
            <label className="form-label">Floor Number *</label>
            <input
              type="number"
              min={0}
              max={10}
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value, 10) })}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Room Configuration *</label>
            <select
              value={formData.roomType}
              onChange={handleTypeChange}
              className="form-select"
            >
              <option value="Single">Single Occupancy (1 Bed)</option>
              <option value="Double">Double Sharing (2 Beds)</option>
              <option value="Triple">Triple Sharing (3 Beds)</option>
              <option value="Dormitory">Dormitory (4+ Beds)</option>
            </select>
          </div>

          {/* Capacity & Fee */}
          <div className="form-group">
            <label className="form-label">Total Bed Capacity *</label>
            <input
              type="number"
              min={1}
              max={10}
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) })}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fee per Semester (₹) *</label>
            <input
              type="number"
              min={0}
              step={500}
              value={formData.feePerSemester}
              onChange={(e) => setFormData({ ...formData, feePerSemester: parseInt(e.target.value, 10) })}
              required
              className="form-input"
            />
          </div>

          {/* Status */}
          <div className="form-group form-full">
            <label className="form-label">Room Maintenance Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="form-select"
            >
              <option value="Available">Available (Operational)</option>
              <option value="Maintenance">Under Maintenance (Offline)</option>
            </select>
          </div>

          {/* Amenities Checkboxes */}
          <div className="form-group form-full">
            <label className="form-label">Included Room Amenities</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.6rem',
                background: 'var(--bg-secondary)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {AMENITIES_LIST.map((amenity) => {
                const isChecked = formData.amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      color: isChecked ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: isChecked ? 600 : 400,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAmenityToggle(amenity)}
                    />
                    {amenity}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="form-group form-full">
            <label className="form-label">Description / Remarks</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Quiet corner room with garden view and private study desks"
              className="form-textarea"
            />
          </div>
        </div>

        <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.5rem', padding: '1rem 1.75rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : room ? 'Update Room' : 'Add Room'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoomFormModal;
