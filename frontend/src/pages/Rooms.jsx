import React, { useState, useEffect } from 'react';
import { roomService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import RoomFormModal from '../components/forms/RoomFormModal';
import AllocationFormModal from '../components/forms/AllocationFormModal';

import {
  BedDouble,
  Search,
  Plus,
  LayoutGrid,
  List,
  UserCheck,
  Edit2,
  Trash2,
  Users,
  Wifi,
  Sparkles,
  Layers,
} from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Filters
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [allocatingRoomId, setAllocatingRoomId] = useState(null);

  const { addToast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, [blockFilter, typeFilter, statusFilter]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (blockFilter !== 'All') params.block = blockFilter;
      if (typeFilter !== 'All') params.roomType = typeFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const res = await roomService.getAll(params);
      setRooms(res.data.rooms || []);
    } catch (err) {
      addToast('Error fetching hostel rooms', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRooms();
  };

  const handleDeleteRoom = async (room) => {
    if (room.occupiedBeds > 0) {
      addToast(`Cannot delete Room ${room.roomNumber} while ${room.occupiedBeds} bed(s) are occupied`, 'warning');
      return;
    }

    if (!window.confirm(`Delete Room ${room.roomNumber}? This cannot be undone.`)) return;

    try {
      await roomService.delete(room._id);
      addToast(`Room ${room.roomNumber} deleted successfully`, 'success');
      fetchRooms();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting room', 'error');
    }
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Room Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Hostel blocks, room inventory, amenities, and live bed occupancy tracking
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.2rem' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn-icon btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ width: '32px', height: '32px' }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`btn-icon btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ width: '32px', height: '32px' }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setRoomToEdit(null);
                setIsRoomModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              Add Room
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
              placeholder="Search by room number (e.g. A-101)..."
            />
          </form>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Block Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Block:</span>
              <select
                value={blockFilter}
                onChange={(e) => setBlockFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Blocks</option>
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
                <option value="Block C">Block C</option>
                <option value="Block D">Block D</option>
              </select>
            </div>

            {/* Type Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Dormitory">Dormitory</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Partially Occupied">Partial</option>
                <option value="Occupied">Full</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Room Views */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading rooms inventory...
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="No rooms found"
            description="No hostel rooms match your search criteria."
            actionLabel={isAdmin ? 'Add New Room' : null}
            onAction={() => {
              setRoomToEdit(null);
              setIsRoomModalOpen(true);
            }}
          />
        ) : viewMode === 'grid' ? (
          /* Grid Card View */
          <div
            style={{
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {rooms.map((rm) => {
              const freeBeds = Math.max(0, rm.capacity - (rm.occupiedBeds || 0));
              return (
                <div
                  key={rm._id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Top Row: Room number, type badge, status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            Room {rm.roomNumber}
                          </span>
                          <Badge status={rm.status} />
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {rm.block} • Floor {rm.floor} • {rm.roomType}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                          ₹{Number(rm.feePerSemester).toLocaleString()}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/ semester</div>
                      </div>
                    </div>

                    {/* Bed Capacity Progress */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Bed Allocation:</span>
                        <span style={{ fontWeight: 700, color: freeBeds > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {rm.occupiedBeds} / {rm.capacity} Beds Occupied ({freeBeds} Free)
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${(rm.occupiedBeds / rm.capacity) * 100}%`,
                            background: rm.status === 'Maintenance' ? 'var(--danger)' : rm.occupiedBeds === rm.capacity ? 'var(--danger)' : 'var(--primary-gradient)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Occupants Preview */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        Current Occupants
                      </div>
                      {rm.occupants && rm.occupants.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {rm.occupants.map((occ, idx) => (
                            <div
                              key={occ.allocationId || idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.82rem',
                                padding: '0.35rem 0.6rem',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700 }}>
                                {occ.bedNumber || idx + 1}
                              </span>
                              <span style={{ fontWeight: 600 }}>
                                {occ.student?.firstName} {occ.student?.lastName}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                {occ.student?.registrationNumber}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          All beds currently vacant
                        </div>
                      )}
                    </div>

                    {/* Amenities Tags */}
                    {rm.amenities && rm.amenities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                        {rm.amenities.slice(0, 3).map((am) => (
                          <span
                            key={am}
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {am}
                          </span>
                        ))}
                        {rm.amenities.length > 3 && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            +{rm.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                      {freeBeds > 0 && rm.status !== 'Maintenance' && (
                        <button
                          onClick={() => {
                            setAllocatingRoomId(rm._id);
                            setIsAllocationModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, fontSize: '0.78rem' }}
                        >
                          <UserCheck size={14} />
                          Allot Bed
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setRoomToEdit(rm);
                          setIsRoomModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Edit Room"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(rm)}
                        className="btn btn-ghost btn-sm"
                        title="Delete Room"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Room No</th>
                  <th>Block & Floor</th>
                  <th>Room Type</th>
                  <th>Capacity</th>
                  <th>Fee / Semester</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((rm) => (
                  <tr key={rm._id}>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-600)' }}>
                        {rm.roomNumber}
                      </span>
                    </td>
                    <td>
                      <div>{rm.block}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Floor {rm.floor}</div>
                    </td>
                    <td>
                      <Badge status={rm.roomType} />
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{rm.occupiedBeds} / {rm.capacity}</span> Beds
                    </td>
                    <td>
                      <strong>₹{Number(rm.feePerSemester).toLocaleString()}</strong>
                    </td>
                    <td>
                      <Badge status={rm.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {isAdmin && rm.capacity > rm.occupiedBeds && rm.status !== 'Maintenance' && (
                          <button
                            onClick={() => {
                              setAllocatingRoomId(rm._id);
                              setIsAllocationModalOpen(true);
                            }}
                            title="Allot Bed"
                            className="btn-icon btn-sm"
                            style={{ color: 'var(--success)' }}
                          >
                            <UserCheck size={15} />
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setRoomToEdit(rm);
                                setIsRoomModalOpen(true);
                              }}
                              title="Edit Room"
                              className="btn-icon btn-sm"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(rm)}
                              title="Delete Room"
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

      {/* Room Modal */}
      <RoomFormModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        room={roomToEdit}
        onSuccess={fetchRooms}
      />

      {/* Allocation Modal */}
      <AllocationFormModal
        isOpen={isAllocationModalOpen}
        onClose={() => {
          setIsAllocationModalOpen(false);
          setAllocatingRoomId(null);
        }}
        preselectedRoomId={allocatingRoomId}
        onSuccess={fetchRooms}
      />
    </div>
  );
};

export default Rooms;
