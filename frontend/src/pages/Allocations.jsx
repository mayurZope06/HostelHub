import React, { useState, useEffect } from 'react';
import { allocationService, roomService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import AllocationFormModal from '../components/forms/AllocationFormModal';

import {
  UserCheck,
  Search,
  Plus,
  ArrowRightLeft,
  LogOut,
  BedDouble,
  Calendar,
  Building,
} from 'lucide-react';

const Allocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [academicYearFilter, setAcademicYearFilter] = useState('All');

  // New allocation modal
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  // Transfer modal
  const [transferTarget, setTransferTarget] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [transferRoomId, setTransferRoomId] = useState('');
  const [transferRemarks, setTransferRemarks] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const { addToast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchAllocations();
  }, [statusFilter, academicYearFilter]);

  const fetchAllocations = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (academicYearFilter !== 'All') params.academicYear = academicYearFilter;
      if (search) params.search = search;

      const res = await allocationService.getAll(params);
      setAllocations(res.data.allocations || []);
    } catch (err) {
      addToast('Error fetching room allocations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAllocations();
  };

  const handleCheckout = async (alloc) => {
    const studentName = `${alloc.student?.firstName} ${alloc.student?.lastName}`;
    const roomNum = alloc.room?.roomNumber;
    const remarks = window.prompt(`Enter checkout remarks for ${studentName} (Room ${roomNum}):`, 'Semester complete / student vacated');

    if (remarks === null) return; // User cancelled prompt

    try {
      await allocationService.vacate(alloc._id, { remarks });
      addToast(`${studentName} checked out from Room ${roomNum}`, 'success');
      fetchAllocations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error processing checkout', 'error');
    }
  };

  const openTransferModal = async (alloc) => {
    setTransferTarget(alloc);
    setIsTransferModalOpen(true);
    try {
      const res = await roomService.getAll({ limit: 100 });
      const rooms = res.data.rooms || [];
      const eligible = rooms.filter(
        (r) => r.capacity > (r.occupiedBeds || 0) && r.status !== 'Maintenance' && r._id !== alloc.room?._id
      );
      setAvailableRooms(eligible);
      if (eligible.length > 0) {
        setTransferRoomId(eligible[0]._id);
      }
    } catch (err) {
      addToast('Error loading rooms for transfer', 'error');
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferRoomId) {
      addToast('Please select a target room', 'warning');
      return;
    }

    setIsTransferring(true);
    try {
      await allocationService.transfer(transferTarget._id, {
        newRoomId: transferRoomId,
        remarks: transferRemarks,
      });
      addToast('Student room transfer processed successfully', 'success');
      setIsTransferModalOpen(false);
      fetchAllocations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error transferring student', 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Room Allotments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Active hostel room allocations, checkout history, and room transfer requests
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => setIsAllocationModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} />
            Assign New Bed
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
              placeholder="Search by student name or room #..."
            />
          </form>

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
                <option value="Active">Active Resident</option>
                <option value="Vacated">Vacated (Checked Out)</option>
                <option value="Transferred">Transferred</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Session:</span>
              <select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Academic Years</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>
          </div>
        </div>

        {/* Allocations Table */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading allocations records...
          </div>
        ) : allocations.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No allocation records found"
            description="No student allotments match your active filters."
            actionLabel={isAdmin ? 'Assign New Room' : null}
            onAction={() => setIsAllocationModalOpen(true)}
          />
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Resident Student</th>
                  <th>Assigned Room</th>
                  <th>Bed #</th>
                  <th>Academic Year</th>
                  <th>Allotment Period</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((alloc) => (
                  <tr key={alloc._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {alloc.student?.avatar ? (
                          <img
                            src={alloc.student.avatar}
                            alt=""
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'var(--primary-gradient)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                            }}
                          >
                            {alloc.student?.firstName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {alloc.student?.firstName} {alloc.student?.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {alloc.student?.registrationNumber} • {alloc.student?.course}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <BedDouble size={16} color="var(--primary-600)" />
                        <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>
                          Room {alloc.room?.roomNumber}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {alloc.room?.block} ({alloc.room?.roomType})
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'var(--bg-secondary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        {alloc.bedNumber || 1}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 500, fontSize: '0.88rem' }}>
                        {alloc.academicYear}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        Since: {new Date(alloc.startDate).toLocaleDateString()}
                      </div>
                      {alloc.endDate && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Until: {new Date(alloc.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    <td>
                      <Badge status={alloc.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {isAdmin && alloc.status === 'Active' && (
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => openTransferModal(alloc)}
                            title="Transfer to Another Room"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <ArrowRightLeft size={13} />
                            Transfer
                          </button>
                          <button
                            onClick={() => handleCheckout(alloc)}
                            title="Checkout Resident"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)', fontSize: '0.78rem' }}
                          >
                            <LogOut size={13} />
                            Checkout
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Room Allocation Modal */}
      <AllocationFormModal
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        onSuccess={fetchAllocations}
      />

      {/* Room Transfer Modal */}
      {transferTarget && (
        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          title={`Transfer Resident: ${transferTarget.student?.firstName} ${transferTarget.student?.lastName}`}
          size="md"
        >
          <form onSubmit={handleTransferSubmit}>
            <div
              style={{
                background: 'var(--bg-secondary)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Current Allocation:
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-600)', marginTop: '0.2rem' }}>
                Room {transferTarget.room?.roomNumber} ({transferTarget.room?.block})
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group form-full">
                <label className="form-label">Select Target Room *</label>
                <select
                  value={transferRoomId}
                  onChange={(e) => setTransferRoomId(e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="">-- Choose New Room --</option>
                  {availableRooms.map((rm) => (
                    <option key={rm._id} value={rm._id}>
                      Room {rm.roomNumber} ({rm.block}, Floor {rm.floor}) - {rm.roomType} | {rm.capacity - (rm.occupiedBeds || 0)} bed(s) available
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group form-full">
                <label className="form-label">Transfer Remarks</label>
                <textarea
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  placeholder="e.g. Upgraded to AC room / Mutual exchange / Floor change"
                  className="form-textarea"
                />
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.5rem', padding: '1rem 1.75rem' }}>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="btn btn-secondary"
                disabled={isTransferring}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isTransferring || availableRooms.length === 0}
              >
                {isTransferring ? 'Transferring...' : 'Execute Room Transfer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Allocations;
