import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { feeService, studentService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

const FeePaymentModal = ({ isOpen, onClose, feeToPay, onSuccess }) => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPaying = !!feeToPay;

  // State for recording payment
  const remaining = feeToPay ? Math.max(0, feeToPay.amount - (feeToPay.paidAmount || 0)) : 0;
  const [paymentData, setPaymentData] = useState({
    amountPaid: remaining,
    paymentMethod: 'UPI / QR',
    transactionReference: `TXN-${Date.now().toString().slice(-8)}`,
    remarks: 'Fee payment received',
  });

  // State for creating a brand new invoice
  const [students, setStudents] = useState([]);
  const [newInvoiceData, setNewInvoiceData] = useState({
    studentId: '',
    title: 'Semester Hostel Accommodation Fee',
    feeType: 'Hostel Rent',
    amount: 28000,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    remarks: 'Regular semester fee invoice',
  });

  useEffect(() => {
    if (feeToPay) {
      const due = Math.max(0, feeToPay.amount - (feeToPay.paidAmount || 0));
      setPaymentData({
        amountPaid: due,
        paymentMethod: 'UPI / QR',
        transactionReference: `TXN-${Date.now().toString().slice(-8)}`,
        remarks: 'Payment cleared',
      });
    } else if (isOpen) {
      studentService.getAll({ limit: 100 }).then((res) => {
        const list = res.data.students || [];
        setStudents(list);
        if (list.length > 0) {
          setNewInvoiceData((prev) => ({ ...prev, studentId: list[0]._id }));
        }
      });
    }
  }, [feeToPay, isOpen]);

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await feeService.recordPayment(feeToPay._id, paymentData);
      addToast(`Payment of ₹${Number(paymentData.amountPaid).toLocaleString()} recorded!`, 'success');

      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 },
      });

      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error recording fee payment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!newInvoiceData.studentId) {
      addToast('Please select a student for the invoice', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await feeService.create(newInvoiceData);
      addToast('New fee invoice generated successfully', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error creating invoice', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isPaying ? `Record Payment: ${feeToPay.invoiceNumber}` : 'Generate Fee Invoice'}
      size="md"
    >
      {isPaying ? (
        <form onSubmit={handlePaySubmit}>
          <div
            style={{
              background: 'var(--bg-secondary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Student Name:</span>
              <span style={{ fontWeight: 600 }}>
                {feeToPay.student?.firstName} {feeToPay.student?.lastName}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Invoiced:</span>
              <span>₹{Number(feeToPay.amount).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Already Paid:</span>
              <span style={{ color: 'var(--success)' }}>
                ₹{Number(feeToPay.paidAmount || 0).toLocaleString()}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.4rem',
                borderTop: '1px solid var(--border-color)',
                fontWeight: 700,
              }}
            >
              <span>Balance Due:</span>
              <span style={{ color: 'var(--danger)', fontSize: '1.05rem' }}>
                ₹{remaining.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">Payment Amount to Record (₹) *</label>
              <input
                type="number"
                min={1}
                max={remaining}
                value={paymentData.amountPaid}
                onChange={(e) => setPaymentData({ ...paymentData, amountPaid: Number(e.target.value) })}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                className="form-select"
              >
                <option value="UPI / QR">UPI / QR (PhonePe/GPay)</option>
                <option value="Net Banking">Net Banking (NEFT/RTGS)</option>
                <option value="Credit/Debit Card">Credit / Debit Card</option>
                <option value="Cash">Cash Deposit</option>
                <option value="Cheque / DD">Bank Cheque / DD</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction Reference # *</label>
              <input
                type="text"
                value={paymentData.transactionReference}
                onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
                placeholder="TXN or UTR number"
                required
                className="form-input"
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Notes / Remarks</label>
              <input
                type="text"
                value={paymentData.remarks}
                onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.5rem', padding: '1rem 1.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : `Record Payment of ₹${Number(paymentData.amountPaid).toLocaleString()}`}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCreateInvoiceSubmit}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">Bill To Student *</label>
              <select
                value={newInvoiceData.studentId}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, studentId: e.target.value })}
                required
                className="form-select"
              >
                <option value="">-- Select Resident Student --</option>
                {students.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.firstName} {st.lastName} ({st.registrationNumber}) - {st.course}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-full">
              <label className="form-label">Invoice Title *</label>
              <input
                type="text"
                value={newInvoiceData.title}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, title: e.target.value })}
                placeholder="e.g. Semester 2 Hostel & Amenities Rent"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fee Category *</label>
              <select
                value={newInvoiceData.feeType}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, feeType: e.target.value })}
                className="form-select"
              >
                <option value="Hostel Rent">Hostel Rent</option>
                <option value="Mess Fee">Mess & Dining Fee</option>
                <option value="Security Deposit">Caution / Security Deposit</option>
                <option value="Maintenance">Maintenance Charge</option>
                <option value="Utility / Misc">Utility / Electricity</option>
                <option value="Late Fine">Late Payment Fine</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                type="number"
                min={100}
                step={100}
                value={newInvoiceData.amount}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amount: Number(e.target.value) })}
                required
                className="form-input"
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                value={newInvoiceData.dueDate}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.75rem -1.5rem', padding: '1rem 1.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default FeePaymentModal;
