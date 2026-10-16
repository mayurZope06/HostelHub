import React, { useState, useEffect } from 'react';
import { studentService, allocationService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import StudentFormModal from '../components/forms/StudentFormModal';
import AllocationFormModal from '../components/forms/AllocationFormModal';

import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  BedDouble,
  Phone,
  Mail,
  GraduationCap,
  MapPin,
  Heart,
} from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [roomFilter, setRoomFilter] = useState('All');

  // Selected student for detail view modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [allocatingStudentId, setAllocatingStudentId] = useState(null);

  const { addToast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, [courseFilter, roomFilter]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (courseFilter !== 'All') params.course = courseFilter;
      if (roomFilter !== 'All') params.roomStatus = roomFilter;
      if (search) params.search = search;

      const res = await studentService.getAll(params);
      setStudents(res.data.students || []);
    } catch (err) {
      addToast('Failed to load students directory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleViewDetails = async (student) => {
    try {
      const res = await studentService.getById(student._id);
      setStudentDetail(res.data);
      setSelectedStudent(student);
      setIsDetailModalOpen(true);
    } catch (err) {
      addToast('Could not load student detailed record', 'error');
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Are you sure you want to remove student "${student.firstName} ${student.lastName}"? This will release their allocated room bed.`)) {
      return;
    }

    try {
      await studentService.delete(student._id);
      addToast('Student record deleted successfully', 'success');
      fetchStudents();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting student', 'error');
    }
  };

  const exportCSV = () => {
    if (students.length === 0) return;
    const headers = ['Registration No', 'First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'Course', 'Year', 'Room', 'Status'];
    const rows = students.map((s) => [
      s.registrationNumber,
      s.firstName,
      s.lastName,
      s.email,
      s.phone,
      s.gender,
      `"${s.course}"`,
      s.yearOfStudy,
      s.currentRoom?.roomNumber || 'Unassigned',
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hostel_Students_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Student records exported to CSV', 'success');
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Comprehensive directory of hostel residents, academic profiles, and allotments
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={exportCSV} className="btn btn-secondary btn-sm">
            <Download size={15} />
            Export CSV
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setStudentToEdit(null);
                setIsFormModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              Add Student
            </button>
          )}
        </div>
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
              placeholder="Search by name, roll #, email..."
            />
          </form>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Room Allocation Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Room:</span>
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Students</option>
                <option value="Allocated">Allocated</option>
                <option value="Unallocated">Unallocated</option>
              </select>
            </div>

            {/* Course Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Course:</span>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Courses</option>
                <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                <option value="B.Tech Information Technology">B.Tech IT</option>
                <option value="M.Tech Data Science">M.Tech Data Science</option>
                <option value="MBA General">MBA</option>
                <option value="B.Des Product Design">B.Des Design</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading students directory...
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students match query"
            description="Try modifying search keywords or clearing active filters."
            actionLabel={isAdmin ? 'Add New Student' : null}
            onAction={() => {
              setStudentToEdit(null);
              setIsFormModalOpen(true);
            }}
          />
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Reg Number</th>
                  <th>Course & Branch</th>
                  <th>Contact</th>
                  <th>Allocated Room</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {st.avatar ? (
                          <img
                            src={st.avatar}
                            alt=""
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: 'var(--primary-gradient)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          >
                            {st.firstName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {st.firstName} {st.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {st.gender} • Blood: {st.bloodGroup || 'O+'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem' }}>
                        {st.registrationNumber}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 500 }}>{st.course}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Year {st.yearOfStudy || 1}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{st.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.email}</div>
                    </td>

                    <td>
                      {st.currentRoom ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <BedDouble size={16} color="var(--primary-600)" />
                          <span style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                            Room {st.currentRoom.roomNumber}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ({st.currentRoom.block})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Not Allocated
                        </span>
                      )}
                    </td>

                    <td>
                      <Badge status={st.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleViewDetails(st)}
                          title="View Profile Details"
                          className="btn-icon btn-sm"
                        >
                          <Eye size={15} />
                        </button>

                        {isAdmin && (
                          <>
                            {!st.currentRoom && (
                              <button
                                onClick={() => {
                                  setAllocatingStudentId(st._id);
                                  setIsAllocationModalOpen(true);
                                }}
                                title="Allocate Room"
                                className="btn-icon btn-sm"
                                style={{ color: 'var(--success)' }}
                              >
                                <UserCheck size={15} />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setStudentToEdit(st);
                                setIsFormModalOpen(true);
                              }}
                              title="Edit Student"
                              className="btn-icon btn-sm"
                            >
                              <Edit2 size={15} />
                            </button>

                            <button
                              onClick={() => handleDelete(st)}
                              title="Delete Student"
                              className="btn-icon btn-sm"
                              style={{ color: 'var(--danger)' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
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

      {/* Student Details View Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Resident Profile: ${selectedStudent.firstName} ${selectedStudent.lastName}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Overview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.25rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              {selectedStudent.avatar ? (
                <img
                  src={selectedStudent.avatar}
                  alt=""
                  style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-500)' }}
                />
              ) : (
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  {selectedStudent.firstName?.charAt(0)}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <Badge status={selectedStudent.status} />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Reg ID: <strong style={{ color: 'var(--text-primary)' }}>{selectedStudent.registrationNumber}</strong> • {selectedStudent.course} (Year {selectedStudent.yearOfStudy})
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem' }}>
                  Current Accommodation
                </div>
                {selectedStudent.currentRoom ? (
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                      Room {selectedStudent.currentRoom.roomNumber}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {selectedStudent.currentRoom.block} • Floor {selectedStudent.currentRoom.floor} ({selectedStudent.currentRoom.roomType})
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No room currently assigned.
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem' }}>
                  Guardian & Family
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {selectedStudent.guardian?.name || 'Not provided'} ({selectedStudent.guardian?.relation || 'Parent'})
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Phone: {selectedStudent.guardian?.phone || 'N/A'}
                </div>
              </div>

              <div className="card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem' }}>
                  Emergency Contact
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {selectedStudent.emergencyContact?.name || 'Not provided'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Phone: {selectedStudent.emergencyContact?.phone || 'N/A'}
                </div>
              </div>
            </div>

            {/* Fee & Maintenance Summary if available */}
            {studentDetail?.fees && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                  Fee Invoices ({studentDetail.fees.length})
                </h4>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Title</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetail.fees.map((f) => (
                        <tr key={f._id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{f.invoiceNumber}</td>
                          <td>{f.title}</td>
                          <td>₹{Number(f.amount).toLocaleString()}</td>
                          <td><Badge status={f.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add / Edit Form Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        student={studentToEdit}
        onSuccess={fetchStudents}
      />

      {/* Allocation Modal */}
      <AllocationFormModal
        isOpen={isAllocationModalOpen}
        onClose={() => {
          setIsAllocationModalOpen(false);
          setAllocatingStudentId(null);
        }}
        preselectedStudentId={allocatingStudentId}
        onSuccess={fetchStudents}
      />
    </div>
  );
};

export default Students;
