import React from 'react';
import Modal from '../common/Modal';
import { Printer, Building2, CheckCircle2 } from 'lucide-react';

const FeeReceiptModal = ({ isOpen, onClose, fee }) => {
  if (!fee) return null;

  const handlePrint = () => {
    window.print();
  };

  const student = fee.student || {};
  const room = fee.room || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Fee Receipt Voucher" size="lg">
      <div className="receipt-wrapper" id="printable-receipt">
        {/* Header */}
        <div className="receipt-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={20} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                HostelHub University Residences
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Central Campus Residential Complex • Email: bursar@hostelhub.edu • Phone: +91 (0) 11 2345 6789
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="receipt-stamp">
              {fee.status === 'Paid' ? 'PAID IN FULL' : fee.status}
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.4rem', color: '#0f172a' }}>
              #{fee.invoiceNumber}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Issued: {new Date(fee.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Student & Allocation Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem',
            padding: '1.25rem',
            background: '#f8fafc',
            borderRadius: '12px',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              Billed To Resident
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
              {student.firstName} {student.lastName}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Reg ID: <strong style={{ color: '#0f172a' }}>{student.registrationNumber || 'N/A'}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Course: {student.course || 'Undergraduate'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Phone: {student.phone || 'N/A'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              Accommodation & Payment Info
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
              Room: {room.roomNumber || 'Assigned Room'} {room.block ? `(${room.block})` : ''}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Payment Method: <strong style={{ color: '#0f172a' }}>{fee.paymentMethod || 'UPI / QR'}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Txn Ref: <span style={{ fontFamily: 'var(--font-mono)' }}>{fee.transactionReference || 'TXN-DIRECT'}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Payment Date: {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.75rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#475569' }}>Description</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#475569' }}>Category</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: '#475569' }}>Billed Amount</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: '#475569' }}>Paid Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>{fee.title}</td>
              <td style={{ padding: '1rem', color: '#64748b' }}>{fee.feeType}</td>
              <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>₹{Number(fee.amount).toLocaleString()}</td>
              <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                ₹{Number(fee.paidAmount || 0).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Total Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ width: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#64748b', fontSize: '0.9rem' }}>
              <span>Total Invoiced:</span>
              <span>₹{Number(fee.amount).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
              <span>Total Paid:</span>
              <span>₹{Number(fee.paidAmount || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderTop: '2px solid #0f172a', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
              <span>Balance Due:</span>
              <span>₹{Math.max(0, fee.amount - (fee.paidAmount || 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: '350px' }}>
            This is a computer-generated official hostel receipt and requires no physical seal. For fee inquiries, contact bursar@hostelhub.edu.
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#4338ca', marginBottom: '0.2rem' }}>
              R.K. Warden
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Authorized Bursar / Warden
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button onClick={onClose} className="btn btn-secondary">
          Close
        </button>
        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>
    </Modal>
  );
};

export default FeeReceiptModal;
