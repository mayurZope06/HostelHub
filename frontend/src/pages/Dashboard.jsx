import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, allocationService } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';

import {
  Users,
  BedDouble,
  Receipt,
  AlertCircle,
  Plus,
  UserCheck,
  Building,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Bell,
  Check,
} from 'lucide-react';

// Modals
import StudentFormModal from '../components/forms/StudentFormModal';
import RoomFormModal from '../components/forms/RoomFormModal';
import AllocationFormModal from '../components/forms/AllocationFormModal';
import FeePaymentModal from '../components/forms/FeePaymentModal';
import NoticeFormModal from '../components/forms/NoticeFormModal';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getMetrics();
      setMetrics(res.data.data);
    } catch (err) {
      addToast('Error loading dashboard analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutAllocation = async (id, roomNumber) => {
    if (!window.confirm(`Are you sure you want to checkout student from Room ${roomNumber}?`)) return;
    try {
      await allocationService.vacate(id, { remarks: 'Checked out from dashboard' });
      addToast('Student checked out successfully', 'success');
      fetchMetrics();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error checking out', 'error');
    }
  };

  if (isLoading || !metrics) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading Hostel Operations Dashboard...</div>
      </div>
    );
  }

  const { students, rooms, fees, complaints, recentAllocations, recentFees, recentComplaints, recentNotices, monthlyStats } = metrics;

  return (
    <div>
      {/* Welcome & Quick Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome to Operations Command</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Real-time hostel monitoring, occupancy analytics, and revenue management
          </p>
        </div>

        {/* Quick Action Button Group */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={() => setIsAllocationModalOpen(true)} className="btn btn-primary btn-sm">
            <UserCheck size={16} />
            Allot Room
          </button>
          <button onClick={() => setIsStudentModalOpen(true)} className="btn btn-secondary btn-sm">
            <Plus size={16} />
            Register Student
          </button>
          <button onClick={() => setIsRoomModalOpen(true)} className="btn btn-secondary btn-sm">
            <Building size={16} />
            Add Room
          </button>
          <button onClick={() => setIsFeeModalOpen(true)} className="btn btn-secondary btn-sm">
            <Receipt size={16} />
            Issue Invoice
          </button>
          <button onClick={() => setIsNoticeModalOpen(true)} className="btn btn-ghost btn-sm">
            <Bell size={16} />
            Post Notice
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Residents"
          value={students.total}
          subtext={`${students.allocated} resident(s) allotted beds (${students.unallocated} pending)`}
          icon={Users}
          color="#6366f1"
          trend="+12%"
        />

        <StatCard
          title="Bed Occupancy"
          value={`${rooms.occupancyRate}%`}
          subtext={`${rooms.occupiedBeds} occupied / ${rooms.vacantBeds} available beds`}
          icon={BedDouble}
          color="#10b981"
        />

        <StatCard
          title="Total Fee Invoiced"
          value={`₹${(fees.totalInvoiced / 1000).toFixed(1)}k`}
          subtext={`₹${(fees.totalCollected / 1000).toFixed(1)}k collected (${fees.collectionPercentage}%)`}
          icon={Receipt}
          color="#0ea5e9"
          trend="+8%"
        />

        <StatCard
          title="Maintenance Tickets"
          value={complaints.pending + complaints.inProgress}
          subtext={`${complaints.resolved} issue(s) resolved successfully`}
          icon={AlertCircle}
          color="#f59e0b"
        />
      </div>

      {/* Middle Row: Room Occupancy & Revenue Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Room Inventory Gauge */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BedDouble size={20} color="var(--primary-600)" />
              <span>Room Availability Breakdown</span>
            </div>
            <button onClick={() => navigate('/rooms')} className="btn btn-ghost btn-sm">
              View All Rooms <ArrowUpRight size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', fontWeight: 600 }}>
                <span>Overall Capacity Utilization</span>
                <span>{rooms.occupiedBeds} / {rooms.totalCapacity} Beds</span>
              </div>
              <div className="progress-bar-container" style={{ height: '10px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${rooms.occupancyRate}%`,
                    background: 'var(--primary-gradient)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Available Rooms
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                  {rooms.breakdown?.available || 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ready for check-in</div>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Partially Occupied
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--warning)' }}>
                  {rooms.breakdown?.partial || 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Vacant beds remain</div>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Fully Occupied
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                  {rooms.breakdown?.full || 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>At 100% capacity</div>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Under Maintenance
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--danger)' }}>
                  {rooms.breakdown?.maintenance || 0}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Temporarily offline</div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Collection Trends Visual */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Receipt size={20} color="#0ea5e9" />
              <span>Hostel Revenue Trends (₹)</span>
            </div>
            <button onClick={() => navigate('/fees')} className="btn btn-ghost btn-sm">
              Fee Records <ArrowUpRight size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--primary-600)' }} />
                <span>Collected (₹{Number(fees.totalCollected).toLocaleString()})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--danger)' }} />
                <span>Pending / Overdue (₹{Number(fees.totalPending + fees.totalOverdue).toLocaleString()})</span>
              </div>
            </div>

            {/* Visual Bar Distribution for past months */}
            {monthlyStats.map((item) => {
              const total = item.collected + item.pending;
              const collectedPct = total > 0 ? (item.collected / total) * 100 : 0;
              return (
                <div key={item.month}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600 }}>{item.month}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      ₹{(item.collected / 1000).toFixed(0)}k / ₹{(total / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="progress-bar-container" style={{ display: 'flex', height: '7px' }}>
                    <div style={{ width: `${collectedPct}%`, background: 'var(--primary-600)', height: '100%' }} />
                    <div style={{ width: `${100 - collectedPct}%`, background: 'rgba(239, 68, 68, 0.4)', height: '100%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Allocations & Pinned Notices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Room Allocations Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Room Allocations</h3>
            <button onClick={() => navigate('/allocations')} className="btn btn-ghost btn-sm">
              View All <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentAllocations.slice(0, 5).map((alloc) => (
                  <tr key={alloc._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        {alloc.student?.avatar ? (
                          <img
                            src={alloc.student.avatar}
                            alt=""
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--primary-gradient)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                            }}
                          >
                            {alloc.student?.firstName?.charAt(0) || 'S'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {alloc.student?.firstName} {alloc.student?.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {alloc.student?.registrationNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                        {alloc.room?.roomNumber}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {alloc.room?.block}
                      </div>
                    </td>
                    <td>
                      <Badge status={alloc.status} />
                    </td>
                    <td>
                      {alloc.status === 'Active' && (
                        <button
                          onClick={() => handleCheckoutAllocation(alloc._id, alloc.room?.roomNumber)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)', fontSize: '0.78rem' }}
                        >
                          Checkout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hostel Notice Board & Announcements */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Bell size={20} color="var(--warning)" />
              <span>Campus & Hostel Notices</span>
            </div>
            <button onClick={() => navigate('/notices')} className="btn btn-ghost btn-sm">
              All Notices <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentNotices.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: n.isPinned ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-secondary)',
                  border: n.isPinned ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {n.isPinned && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          background: 'var(--primary-600)',
                          color: 'white',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}
                      >
                        PINNED
                      </span>
                    )}
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{n.title}</span>
                  </div>
                  <Badge status={n.category} text={n.category} />
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {n.content?.substring(0, 110)}...
                </p>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Posted by {n.postedBy || 'Administration'} • {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Modals for Quick Actions */}
      <StudentFormModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSuccess={fetchMetrics}
      />

      <RoomFormModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSuccess={fetchMetrics}
      />

      <AllocationFormModal
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        onSuccess={fetchMetrics}
      />

      <FeePaymentModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        onSuccess={fetchMetrics}
      />

      <NoticeFormModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onSuccess={fetchMetrics}
      />
    </div>
  );
};

export default Dashboard;
