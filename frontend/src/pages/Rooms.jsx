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
  Check,
  CheckCircle2,
} from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

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

  const blocks = ['All', 'Block A', 'Block B', 'Block C', 'Block D'];

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Hostel Rooms & Inventory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Interactive bed layout, live room status, floor wing inventory, and amenities
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.2rem' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn-icon btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ width: '34px', height: '34px' }}
              title="Interactive Card View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`btn-icon btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ width: '34px', height: '34px' }}
              title="Data Table View"
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

      {/* Block Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {blocks.map((b) => (
          <button
            key={b}
            onClick={() => setBlockFilter(b)}
            className={`btn btn-sm ${blockFilter === b ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1.1rem' }}
          >
            {b === 'All' ? 'All Blocks' : b}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="table-card" style={{ marginBottom: '1.75rem' }}>
        <div className="table-toolbar">
          <form onSubmit={handleSearchSubmit} className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by room # (e.g. A-101)..."
            />
          </form>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Type:</span>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Partially Occupied">Partial</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Room Views */}
        {isLoading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading rooms inventory...
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={BedDouble}
            title="No rooms match filter"
            description="Try selecting a different block or resetting filters."
            actionLabel={isAdmin ? 'Add New Room' : null}
            onAction={() => {
              setRoomToEdit(null);
              setIsRoomModalOpen(true);
            }}
          />
        ) : viewMode === 'grid' ? (
          /* Modern Interactive Card View with Physical Bed Slots */
          <div
            style={{
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
              gap: '1.35rem',
            }}
          >
            {rooms.map((rm) => {
              const freeBeds = Math.max(0, rm.capacity - (rm.occupiedBeds || 0));
              const occupants = rm.occupants || [];

              return (
                <div
                  key={rm._id}
                  className="card"
                  style={{
                    padding: '1.4rem',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Top Header: Room number, price chip, status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            Room {rm.roomNumber}
                          </span>
                          <Badge status={rm.status} />
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {rm.block} • Floor {rm.floor} • <strong>{rm.roomType}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                          ₹{Number(rm.feePerSemester).toLocaleString()}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/ semester</div>
                      </div>
                    </div>

                    {/* Physical Bed Slots Visualizer */}
                    <div style={{ marginBottom: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                        <span>Beds ({rm.capacity} Total)</span>
                        <span style={{ color: freeBeds > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {freeBeds} Free Bed{freeBeds === 1 ? '' : 's'}
                        </span>
                      </div>

                      {/* Render Each Individual Bed Slot */}
                      <div className="bed-slots-grid">
                        {Array.from({ length: rm.capacity }).map((_, idx) => {
                          const occupant = occupants[idx];
                          if (occupant) {
                            return (
                              <div key={idx} className="bed-slot occupied" title={`Bed ${idx + 1}: ${occupant.student?.firstName} ${occupant.student?.lastName}`}>
                                <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>
                                  {idx + 1}
                                </span>
                                <span>{occupant.student?.firstName || 'Resident'}</span>
                              </div>
                            );
                          } else {
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (isAdmin && rm.status !== 'Maintenance') {
                                    setAllocatingRoomId(rm._id);
                                    setIsAllocationModalOpen(true);
                                  }
                                }}
                                className="bed-slot vacant"
                                title={isAdmin ? `Click to assign student to Bed ${idx + 1}` : 'Vacant Bed'}
                                style={{ cursor: isAdmin && rm.status !== 'Maintenance' ? 'pointer' : 'default' }}
                              >
                                <span>Bed {idx + 1}</span>
                                <span style={{ color: 'var(--primary-600)', fontWeight: 800 }}>+ Free</span>
                              </button>
                            );
                          }
                        })}
                      </div>
                    </div>

                    {/* Amenities Badges */}
                    {rm.amenities && rm.amenities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.1rem' }}>
                        {rm.amenities.map((am) => (
                          <span
                            key={am}
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)',
                              fontWeight: 600,
                            }}
                          >
                            ✓ {am}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.9rem' }}>
                      {freeBeds > 0 && rm.status !== 'Maintenance' && (
                        <button
                          onClick={() => {
                            setAllocatingRoomId(rm._id);
                            setIsAllocationModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, fontSize: '0.8rem' }}
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
                        className="btn btn-secondary btn-sm"
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
                  <th>Bed Capacity</th>
                  <th>Fee / Semester</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((rm) => (
                  <tr key={rm._id}>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-600)' }}>
                        {rm.roomNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rm.block}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Floor {rm.floor}</div>
                    </td>
                    <td>
                      <Badge status={rm.roomType} />
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{rm.occupiedBeds} / {rm.capacity}</span> Beds
                    </td>
                    <td>
                      <strong>₹{Number(rm.feePerSemester).toLocaleString()}</strong>
                    </td>
                    <td>
                      <Badge status={rm.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {isAdmin && rm.capacity > rm.occupiedBeds && rm.status !== 'Maintenance' && (
                          <button
                            onClick={() => {
                              setAllocatingRoomId(rm._id);
                              setIsAllocationModalOpen(true);
                            }}
                            title="Allot Bed"
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--success)' }}
                          >
                            <UserCheck size={14} /> Allot
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
                              className="btn btn-secondary btn-sm"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(rm)}
                              title="Delete Room"
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--danger)' }}
                            >
                              <Trash2 size={14} />
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

      <RoomFormModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        room={roomToEdit}
        onSuccess={fetchRooms}
      />

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
