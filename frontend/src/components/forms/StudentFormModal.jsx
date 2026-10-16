import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { studentService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const StudentFormModal = ({ isOpen, onClose, student, onSuccess }) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    registrationNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    bloodGroup: 'O+',
    course: 'B.Tech Computer Science',
    department: 'Computer Science & Engineering',
    yearOfStudy: 1,
    createLoginAccount: true,
    defaultPassword: 'student123',
    guardian: {
      name: '',
      relation: 'Father',
      phone: '',
      email: '',
    },
    emergencyContact: {
      name: '',
      relation: 'Parent',
      phone: '',
    },
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
    },
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (student) {
      setFormData({
        registrationNumber: student.registrationNumber || '',
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        gender: student.gender || 'Male',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.substring(0, 10) : '',
        bloodGroup: student.bloodGroup || 'O+',
        course: student.course || 'B.Tech Computer Science',
        department: student.department || 'Computer Science & Engineering',
        yearOfStudy: student.yearOfStudy || 1,
        createLoginAccount: false,
        defaultPassword: 'student123',
        guardian: {
          name: student.guardian?.name || '',
          relation: student.guardian?.relation || 'Father',
          phone: student.guardian?.phone || '',
          email: student.guardian?.email || '',
        },
        emergencyContact: {
          name: student.emergencyContact?.name || '',
          relation: student.emergencyContact?.relation || 'Parent',
          phone: student.emergencyContact?.phone || '',
        },
        address: {
          street: student.address?.street || '',
          city: student.address?.city || '',
          state: student.address?.state || '',
          postalCode: student.address?.postalCode || '',
        },
      });
    } else {
      setFormData(initialFormState);
    }
  }, [student, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (student) {
        await studentService.update(student._id, formData);
        addToast('Student details updated successfully', 'success');
      } else {
        await studentService.create(formData);
        addToast('New student registered successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving student record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? `Edit Student: ${student.firstName} ${student.lastName}` : 'Register New Resident Student'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Registration Number */}
          <div className="form-group">
            <label className="form-label">Registration Number *</label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="e.g. HST-2025-010"
              required
              className="form-input"
            />
          </div>

          {/* Blood Group */}
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="form-select"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          {/* First & Last Name */}
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Rajesh"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Kumar"
              required
              className="form-input"
            />
          </div>

          {/* Email & Phone */}
          <div className="form-group">
            <label className="form-label">Student Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@university.edu"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
              className="form-input"
            />
          </div>

          {/* Gender & DOB */}
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Course & Year */}
          <div className="form-group">
            <label className="form-label">Degree / Course *</label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g. B.Tech Computer Science"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Year of Study</label>
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              className="form-select"
            >
              <option value={1}>1st Year (Freshman)</option>
              <option value={2}>2nd Year (Sophomore)</option>
              <option value={3}>3rd Year (Junior)</option>
              <option value={4}>4th Year (Senior)</option>
              <option value={5}>5th Year (Dual Degree)</option>
            </select>
          </div>

          {/* Guardian Information */}
          <div className="form-group">
            <label className="form-label">Guardian / Parent Name</label>
            <input
              type="text"
              name="guardian.name"
              value={formData.guardian.name}
              onChange={handleChange}
              placeholder="Guardian full name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Guardian Phone</label>
            <input
              type="tel"
              name="guardian.phone"
              value={formData.guardian.phone}
              onChange={handleChange}
              placeholder="Guardian contact"
              className="form-input"
            />
          </div>

          {/* Emergency Contact */}
          <div className="form-group">
            <label className="form-label">Emergency Contact Name</label>
            <input
              type="text"
              name="emergencyContact.name"
              value={formData.emergencyContact.name}
              onChange={handleChange}
              placeholder="Emergency contact person"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Emergency Phone</label>
            <input
              type="tel"
              name="emergencyContact.phone"
              value={formData.emergencyContact.phone}
              onChange={handleChange}
              placeholder="Emergency telephone"
              className="form-input"
            />
          </div>

          {/* Address */}
          <div className="form-group form-full">
            <label className="form-label">Home Address</label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              placeholder="Street address, apartment, locality"
              className="form-input"
              style={{ marginBottom: '0.5rem' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="City"
                className="form-input"
              />
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="State"
                className="form-input"
              />
              <input
                type="text"
                name="address.postalCode"
                value={formData.address.postalCode}
                onChange={handleChange}
                placeholder="PIN / Zip"
                className="form-input"
              />
            </div>
          </div>

          {!student && (
            <div className="form-group form-full" style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  name="createLoginAccount"
                  checked={formData.createLoginAccount}
                  onChange={handleChange}
                />
                Create student portal login account (Default password: student123)
              </label>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.5rem', padding: '1rem 1.75rem' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : student ? 'Save Changes' : 'Register Student'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentFormModal;
