import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, allocationService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
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
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  FileText,
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
  const [selectedBlockTab, setSelectedBlockTab] = useState('All');
  const { addToast } = useToast();
  const { user } = useAuth();
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
    if (!window.confirm(`Checkout student from Room ${roomNumber}? This will release the bed immediately.`)) return;
    try {
      await allocationService.vacate(id, { remarks: 'Checked out from operations dashboard' });
      addToast('Student checked out successfully', 'success');
      fetchMetrics();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error checking out', 'error');
    }
  };

  if (isLoading || !metrics) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Loading Hostel Operations Dashboard...
        </div>
        <p style={{ fontSize: '0.88rem', marginTop: '0.4rem' }}>Synchronizing resident roster and room inventory</p>
      </div>
    );
  }

  const { students, rooms, fees, complaints, recentAllocations, recentFees, recentComplaints, recentNotices, monthlyStats } = metrics;

  return (
    <div>
      {/* Hero Welcome Banner */}
      <div className="hero-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(8px)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Sparkles size={14} color="#fde047" />
              Academic Term 2025-2026 • Live Monitoring
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.15 }}>
              Hostel Command & Operations Hub
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.96rem', maxWidth: '580px', marginTop: '0.4rem' }}>
              Currently managing <strong>{students.allocated} active residents</strong> across {rooms.total} rooms. Overall campus bed capacity is at <strong>{rooms.occupancyRate}%</strong>.
            </p>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsAllocationModalOpen(true)}
                className="btn btn-secondary"
                style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 800, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
              >
                <KeyRound size={16} color="#2563eb" />
                Allot Room
              </button>
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="btn btn-secondary"
                style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              >
                <Plus size={16} />
                New Student
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsFeeModalOpen(true)}
                className="btn btn-secondary"
                style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)', fontSize: '0.82rem' }}
              >
                <Receipt size={14} />
                Issue Invoice
              </button>
              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="btn btn-secondary"
                style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)', fontSize: '0.82rem' }}
              >
                <Bell size={14} />
                Broadcast Notice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="stats-grid">
        <StatCard
          title="Campus Residents"
          value={students.total}
          subtext={`${students.allocated} allotted • ${students.unallocated} awaiting allotment`}
          icon={Users}
          color="#2563eb"
          trend="+14%"
        />

        <StatCard
          title="Bed Occupancy"
          value={`${rooms.occupancyRate}%`}
          subtext={`${rooms.occupiedBeds} occupied / ${rooms.vacantBeds} available beds`}
          icon={BedDouble}
          color="#059669"
        />

        <StatCard
          title="Revenue Invoiced"
          value={`₹${(fees.totalInvoiced / 1000).toFixed(1)}k`}
          subtext={`₹${(fees.totalCollected / 1000).toFixed(1)}k collected (${fees.collectionPercentage}%)`}
          icon={Receipt}
          color="#0284c7"
          trend="+8.5%"
        />

        <StatCard
          title="Maintenance Tickets"
          value={complaints.pending + complaints.inProgress}
          subtext={`${complaints.resolved} resolved • ${complaints.pending} pending action`}
          icon={AlertCircle}
          color="#d97706"
        />
      </div>

      {/* Interactive Hostel Blocks / Wings Visualizer */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <Building2 size={22} color="var(--primary-600)" />
              <span>Campus Residential Wings & Block Overview</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Live occupancy distribution across hostel wings and residential blocks
            </div>
          </div>
          <button onClick={() => navigate('/rooms')} className="btn btn-secondary btn-sm">
            Manage All Rooms <ArrowRight size={14} />
          </button>
        </div>

        {/* Block Wings Visual Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Block A */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderLeft: '4px solid #2563eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Block A</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>North Wing • 4 Rooms</span>
              </div>
              <span className="badge badge-success">Operational</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Capacity: <strong>8 Beds</strong> (Rooms A-101, A-102, A-201, A-202)
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: '45%', background: '#2563eb' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
              <span>AC / Single / Twin Sharing</span>
              <strong style={{ color: 'var(--success)' }}>Available</strong>
            </div>
          </div>

          {/* Block B */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderLeft: '4px solid #059669',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Block B</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>South Wing • 4 Rooms</span>
              </div>
              <span className="badge badge-success">Operational</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Capacity: <strong>10 Beds</strong> (Rooms B-101, B-102, B-201, B-202)
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: '30%', background: '#059669' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
              <span>Twin / Triple / Dormitory</span>
              <strong style={{ color: 'var(--success)' }}>Available</strong>
            </div>
          </div>

          {/* Block C */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderLeft: '4px solid #d97706',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Block C</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Courtyard Wing • 4 Rooms</span>
              </div>
              <span className="badge badge-warning">1 Room Maintenance</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Capacity: <strong>8 Beds</strong> (Rooms C-101, C-102, C-201, C-202)
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: '25%', background: '#d97706' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
              <span>Executive / Balcony Deluxe</span>
              <strong style={{ color: 'var(--primary-600)' }}>Partial</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Financial Velocity & Room Health */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Room Status Gauge */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BedDouble size={20} color="var(--primary-600)" />
              <span>Room Operational Status</span>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {rooms.total} Total Rooms
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            <div style={{ padding: '1rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-border)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--success)', fontWeight: 800 }}>Available (Vacant)</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--success)' }}>
                {rooms.breakdown?.available || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ready for student check-in</div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--warning-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-border)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--warning)', fontWeight: 800 }}>Partially Occupied</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--warning)' }}>
                {rooms.breakdown?.partial || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Vacant beds remain</div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-600)', fontWeight: 800 }}>Fully Occupied</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                {rooms.breakdown?.full || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Operating at 100% capacity</div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger-border)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--danger)', fontWeight: 800 }}>Maintenance</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--danger)' }}>
                {rooms.breakdown?.maintenance || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Offline for repair</div>
            </div>
          </div>
        </div>

        {/* Revenue Velocity Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Receipt size={20} color="#0284c7" />
              <span>Revenue Collection Velocity</span>
            </div>
            <button onClick={() => navigate('/fees')} className="btn btn-secondary btn-sm">
              Invoices <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Collected</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }}>
                  ₹{Number(fees.totalCollected).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Pending & Overdue</span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#dc2626' }}>
                  ₹{Number(fees.totalPending + fees.totalOverdue).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Monthly Trend Bars */}
            {monthlyStats.slice(2).map((item) => {
              const total = item.collected + item.pending;
              const pct = total > 0 ? (item.collected / total) * 100 : 0;
              return (
                <div key={item.month}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700 }}>{item.month} Session</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      ₹{(item.collected / 1000).toFixed(0)}k of ₹{(total / 1000).toFixed(0)}k ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '8px' }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #2563eb, #059669)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Allocations & Pinned Notices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Room Allocations */}
        <div className="table-card">
          <div style={{ padding: '1.25rem 1.6rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Recent Room Allotments</h3>
            <button onClick={() => navigate('/allocations')} className="btn btn-secondary btn-sm">
              All Allotments <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentAllocations.slice(0, 5).map((alloc) => (
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
                              fontSize: '0.82rem',
                              fontWeight: 800,
                            }}
                          >
                            {alloc.student?.firstName?.charAt(0) || 'S'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {alloc.student?.firstName} {alloc.student?.lastName}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {alloc.student?.registrationNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--primary-600)' }}>
                        Room {alloc.room?.roomNumber}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
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
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
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

        {/* Notices Board Widget */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Bell size={20} color="#d97706" />
              <span>Campus Announcements</span>
            </div>
            <button onClick={() => navigate('/notices')} className="btn btn-secondary btn-sm">
              All Notices <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {recentNotices.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: n.isPinned ? 'var(--primary-50)' : 'var(--bg-secondary)',
                  border: n.isPinned ? '1px solid var(--primary-200)' : '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {n.isPinned && (
                      <span style={{ fontSize: '0.68rem', background: '#2563eb', color: 'white', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                        PINNED
                      </span>
                    )}
                    <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>{n.title}</span>
                  </div>
                  <Badge status={n.category} text={n.category} />
                </div>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {n.content?.substring(0, 115)}...
                </p>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.45rem' }}>
                  Posted by <strong>{n.postedBy || 'Hostel Admin'}</strong> • {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
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
