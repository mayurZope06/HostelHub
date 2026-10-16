import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentService, feeService, complaintService } from '../services/api';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import FeeReceiptModal from '../components/receipts/FeeReceiptModal';
import FeePaymentModal from '../components/forms/FeePaymentModal';
import ComplaintFormModal from '../components/forms/ComplaintFormModal';

import {
  User,
  BedDouble,
  Receipt,
  AlertCircle,
  CreditCard,
  Printer,
  Plus,
  Building,
  Phone,
  Mail,
  Calendar,
  Sparkles,
} from 'lucide-react';

const StudentPortal = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [studentData, setStudentData] = useState(null);
  const [fees, setFees] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [receiptFee, setReceiptFee] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [payingFee, setPayingFee] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  useEffect(() => {
    fetchStudentPortalData();
  }, [user]);

  const fetchStudentPortalData = async () => {
    setIsLoading(true);
    try {
      const studentId = user?.studentId || user?.student?._id;
      if (studentId) {
        const [studentRes, feesRes, complaintsRes] = await Promise.all([
          studentService.getById(studentId),
          feeService.getAll(),
          complaintService.getAll(),
        ]);

        setStudentData(studentRes.data.student);
        setFees(feesRes.data.fees || []);
        setComplaints(complaintsRes.data.complaints || []);
      }
    } catch (err) {
      addToast('Error loading resident student portal data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReceipt = (fee) => {
    setReceiptFee(fee);
    setIsReceiptOpen(true);
  };

  const handlePayFee = (fee) => {
    setPayingFee(fee);
    setIsPaymentModalOpen(true);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading resident student profile...
      </div>
    );
  }

  const room = studentData?.currentRoom;

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%), var(--bg-card)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          marginBottom: '2rem',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {studentData?.avatar ? (
              <img
                src={studentData.avatar}
                alt=""
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-500)' }}
              />
            ) : (
              <div
                style={{
                  width: '64px',
                  height: '64px',
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
                {studentData?.firstName?.charAt(0) || user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                  Welcome, {studentData?.firstName || user?.name}!
                </h1>
                <Badge status={studentData?.status || 'Active'} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                Reg ID: <strong>{studentData?.registrationNumber || 'Pending'}</strong> • {studentData?.course} (Year {studentData?.yearOfStudy || 1})
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsComplaintModalOpen(true)}
            className="btn btn-primary"
          >
            <AlertCircle size={16} />
            Report Room Issue
          </button>
        </div>
      </div>

      {/* Grid: Room & Fee Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Allocated Room Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BedDouble size={20} color="var(--primary-600)" />
              <span>My Hostel Accommodation</span>
            </div>
            {room && <Badge status="Active" text="Occupied" />}
          </div>

          {room ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                    Room {room.roomNumber}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    {room.block} • Floor {room.floor} ({room.roomType})
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    ₹{Number(room.feePerSemester).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>semester fee</div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Included Amenities
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {room.amenities?.map((am) => (
                    <span
                      key={am}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      ✓ {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Allotment Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Allocation Active Since:</span>
                <span style={{ fontWeight: 600 }}>
                  {studentData.allocationDate ? new Date(studentData.allocationDate).toLocaleDateString() : 'Current Session'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Building size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <div style={{ fontWeight: 600 }}>No room assigned yet</div>
              <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                Please visit the chief warden's office for your semester room allotment.
              </p>
            </div>
          )}
        </div>

        {/* Financial Dues Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Receipt size={20} color="#0ea5e9" />
              <span>My Hostel Fee Invoices</span>
            </div>
          </div>

          {fees.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No fee dues or invoices found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {fees.map((f) => {
                const balance = Math.max(0, f.amount - (f.paidAmount || 0));
                return (
                  <div
                    key={f._id}
                    style={{
                      padding: '0.85rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{f.title}</span>
                        <Badge status={f.status} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Invoice #{f.invoiceNumber} • Due: {new Date(f.dueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                        ₹{Number(f.amount).toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                        <button
                          onClick={() => handleOpenReceipt(f)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                        >
                          <Printer size={12} /> Receipt
                        </button>
                        {f.status !== 'Paid' && (
                          <button
                            onClick={() => handlePayFee(f)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                          >
                            <CreditCard size={12} /> Pay ₹{balance.toLocaleString()}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* My Submitted Maintenance Complaints */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <AlertCircle size={20} color="var(--warning)" />
            <span>My Reported Maintenance Grievances</span>
          </div>
          <button
            onClick={() => setIsComplaintModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <Plus size={14} /> Report New Issue
          </button>
        </div>

        {complaints.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            You haven't submitted any complaints. Everything looks in order!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Issue Summary</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Date Filed</th>
                  <th>Status</th>
                  <th>Resolution Remarks</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.description}</div>
                    </td>
                    <td>{c.category}</td>
                    <td><Badge status={c.priority} /></td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td><Badge status={c.status} /></td>
                    <td>
                      {c.resolutionNotes ? (
                        <span style={{ color: 'var(--success)', fontWeight: 500, fontSize: '0.85rem' }}>
                          ✓ {c.resolutionNotes}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                          Pending technician assignment
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <FeeReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        fee={receiptFee}
      />

      <FeePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        feeToPay={payingFee}
        onSuccess={fetchStudentPortalData}
      />

      <ComplaintFormModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSuccess={fetchStudentPortalData}
      />
    </div>
  );
};

export default StudentPortal;
