import React, { useState, useEffect } from 'react';
import { feeService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import FeeReceiptModal from '../components/receipts/FeeReceiptModal';
import FeePaymentModal from '../components/forms/FeePaymentModal';

import {
  Receipt,
  Search,
  Plus,
  Printer,
  CreditCard,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [feeTypeFilter, setFeeTypeFilter] = useState('All');

  // Modals
  const [receiptFee, setReceiptFee] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [paymentFee, setPaymentFee] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { addToast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchFees();
    if (isAdmin) {
      fetchStats();
    }
  }, [statusFilter, feeTypeFilter]);

  const fetchFees = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (feeTypeFilter !== 'All') params.feeType = feeTypeFilter;
      if (search) params.search = search;

      const res = await feeService.getAll(params);
      setFees(res.data.fees || []);
    } catch (err) {
      addToast('Error fetching fee invoices', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await feeService.getStats();
      setStats(res.data.stats);
    } catch (err) {
      console.warn('Could not load fee financial stats');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFees();
  };

  const handleOpenReceipt = (fee) => {
    setReceiptFee(fee);
    setIsReceiptOpen(true);
  };

  const handleRecordPayment = (fee) => {
    setPaymentFee(fee);
    setIsPaymentModalOpen(true);
  };

  const handleCreateNewInvoice = () => {
    setPaymentFee(null);
    setIsPaymentModalOpen(true);
  };

  const handleDeleteFee = async (fee) => {
    if (!window.confirm(`Delete invoice ${fee.invoiceNumber}?`)) return;
    try {
      await feeService.delete(fee._id);
      addToast('Invoice deleted successfully', 'success');
      fetchFees();
      if (isAdmin) fetchStats();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting invoice', 'error');
    }
  };

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Fee Management & Invoicing</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Hostel accommodation dues, meal plan billing, payment collection, and official receipt vouchers
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleCreateNewInvoice} className="btn btn-primary btn-sm">
            <Plus size={16} />
            Generate New Invoice
          </button>
        )}
      </div>

      {/* Financial Summary Cards (Admin Only) */}
      {isAdmin && stats && (
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <StatCard
            title="Total Billed"
            value={`₹${(stats.totalInvoiced / 1000).toFixed(1)}k`}
            subtext="Total invoiced charges this session"
            icon={Receipt}
            color="#6366f1"
          />
          <StatCard
            title="Revenue Collected"
            value={`₹${(stats.totalCollected / 1000).toFixed(1)}k`}
            subtext={`${stats.collectionRate}% of total collected (${stats.paidCount} paid)`}
            icon={CheckCircle2}
            color="#10b981"
          />
          <StatCard
            title="Pending Dues"
            value={`₹${(stats.totalPending / 1000).toFixed(1)}k`}
            subtext={`${stats.pendingCount + stats.partialCount} student(s) with pending balance`}
            icon={Clock}
            color="#f59e0b"
          />
          <StatCard
            title="Overdue Receivables"
            value={`₹${(stats.totalOverdue / 1000).toFixed(1)}k`}
            subtext={`${stats.overdueCount} overdue invoice(s) needing follow-up`}
            icon={AlertTriangle}
            color="#ef4444"
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="table-card" style={{ marginBottom: '1.5rem' }}>
        <div className="table-toolbar">
          <form onSubmit={handleSearchSubmit} className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice #, student name, or roll #..."
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
                <option value="All">All Invoices</option>
                <option value="Paid">Paid in Full</option>
                <option value="Partial">Partial Payment</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Category:</span>
              <select
                value={feeTypeFilter}
                onChange={(e) => setFeeTypeFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Categories</option>
                <option value="Hostel Rent">Hostel Rent</option>
                <option value="Mess Fee">Mess & Dining</option>
                <option value="Security Deposit">Security Deposit</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fees Table */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading fee records...
          </div>
        ) : fees.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No fee records found"
            description="No invoices match your current search or status filter."
            actionLabel={isAdmin ? 'Generate Invoice' : null}
            onAction={handleCreateNewInvoice}
          />
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Student</th>
                  <th>Description</th>
                  <th>Total Billed</th>
                  <th>Paid Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => {
                  const balance = Math.max(0, fee.amount - (fee.paidAmount || 0));
                  return (
                    <tr key={fee._id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-600)', fontSize: '0.88rem' }}>
                          {fee.invoiceNumber}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(fee.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {fee.student?.firstName} {fee.student?.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {fee.student?.registrationNumber}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 500 }}>{fee.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Category: {fee.feeType}
                        </div>
                      </td>

                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>
                          ₹{Number(fee.amount).toLocaleString()}
                        </strong>
                      </td>

                      <td>
                        <span style={{ fontWeight: 700, color: fee.paidAmount > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                          ₹{Number(fee.paidAmount || 0).toLocaleString()}
                        </span>
                        {balance > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                            Due: ₹{balance.toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontSize: '0.82rem' }}>
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </div>
                        {fee.paidDate && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--success)' }}>
                            Paid: {new Date(fee.paidDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td>
                        <Badge status={fee.status} />
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {/* Receipt Voucher button */}
                          <button
                            onClick={() => handleOpenReceipt(fee)}
                            title="View / Print Receipt"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <Printer size={13} />
                            Receipt
                          </button>

                          {/* Record Payment button */}
                          {fee.status !== 'Paid' && (
                            <button
                              onClick={() => handleRecordPayment(fee)}
                              title="Pay / Record Transaction"
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.78rem' }}
                            >
                              <CreditCard size={13} />
                              Pay
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteFee(fee)}
                              title="Delete Invoice"
                              className="btn-icon btn-sm"
                              style={{ color: 'var(--danger)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Printable Fee Receipt Modal */}
      <FeeReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        fee={receiptFee}
      />

      {/* Payment / New Invoice Modal */}
      <FeePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        feeToPay={paymentFee}
        onSuccess={() => {
          fetchFees();
          if (isAdmin) fetchStats();
        }}
      />
    </div>
  );
};

export default Fees;
