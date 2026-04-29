import React, { useState } from 'react';
import { Settings, Check, X } from 'lucide-react';
import { Heading, P, Button, DashGrid, DataTable, openModal, Modal, closeModal, InputField } from '../../components/Shared/Common_Components';

export default function ExpenseManagement({ isEmbedded }) {
  const [expenseLimit, setExpenseLimit] = useState(1000);
  const [tempLimit, setTempLimit] = useState(1000);
  
  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Office Supplies', category: 'Operations', date: 'Oct 20, 2023', amount: 450, status: 'Approved' },
    { id: 2, title: 'Software Licenses', category: 'IT', date: 'Oct 21, 2023', amount: 1500, status: 'Pending Admin Approval' },
    { id: 3, title: 'Team Lunch', category: 'HR', date: 'Oct 22, 2023', amount: 300, status: 'Approved' },
    { id: 4, title: 'New Laptops', category: 'Hardware', date: 'Oct 24, 2023', amount: 4500, status: 'Pending Admin Approval' },
    { id: 5, title: 'Marketing Ads', category: 'Marketing', date: 'Oct 25, 2023', amount: 800, status: 'Approved' },
  ]);

  const [newExpense, setNewExpense] = useState({ title: '', category: '', amount: '' });
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const handleApprove = (id) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, status: 'Approved' } : exp));
  };

  const handleReject = (id) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, status: 'Rejected' } : exp));
  };

  const handleSetLimit = () => {
    setExpenseLimit(Number(tempLimit));
    closeModal('settings-modal');
  };

  const handleAddExpense = () => {
    const amount = Number(newExpense.amount);
    const status = amount > expenseLimit ? 'Pending Admin Approval' : 'Approved';
    
    setExpenses([
      ...expenses,
      {
        id: Date.now(),
        title: newExpense.title || 'New Expense',
        category: newExpense.category || 'Other',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: amount,
        status: status
      }
    ]);
    setNewExpense({ title: '', category: '', amount: '' });
    closeModal('add-expense-modal');
  };

  const handleExportReport = () => {
    const headers = ['Expense Title', 'Category', 'Date', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(exp => `"${exp.title}","${exp.category}","${exp.date}","${exp.amount}","${exp.status}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'expense_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { key: "title", label: "Expense Title", width: "25%" },
    { key: "category", label: "Category", width: "20%" },
    { key: "date", label: "Date", width: "15%" },
    { key: "amount", label: "Amount", width: "15%" },
    { key: "status", label: "Status", width: "25%" }
  ];

  const formattedExpenses = expenses.map(exp => ({
    ...exp,
    amount: `$${exp.amount}`,
    rawAmount: exp.amount, 
    status: exp.status === 'Approved' ? 'Completed' : exp.status.includes('Pending') ? 'Pending' : 'Failed'
  }));

  const filteredExpenses = formattedExpenses.filter(exp => {
    let matchesCategory = true;
    let matchesStatus = true;
    if (filterCategory) matchesCategory = exp.category === filterCategory;
    if (filterStatus) matchesStatus = exp.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  return (
    <div className={`w-full ${isEmbedded ? '' : 'min-h-screen bg-white p-4 md:p-8'}`}>
      <style>{`
        .expense-table-container table {
          table-layout: fixed;
          width: 100%;
        }
        .expense-table-container th, 
        .expense-table-container td {
          white-space: normal !important;
          word-break: break-word;
          padding: 12px 8px !important;
        }
        .expense-table-container th:nth-child(1) { width: 25%; }
        .expense-table-container th:nth-child(2) { width: 20%; }
        .expense-table-container th:nth-child(3) { width: 15%; }
        .expense-table-container th:nth-child(4) { width: 15%; }
        .expense-table-container th:nth-child(5) { width: 15%; }
        .expense-table-container th:last-child,
        .expense-table-container td:last-child {
          width: 90px !important;
          min-width: 90px !important;
          text-align: center;
          padding: 12px 4px !important;
        }
        .expense-table-container .data-table-scroll {
          overflow-x: hidden !important;
        }
      `}</style>

      <div className="flex flex-col gap-4 mb-6 w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Filter by Category</label>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 w-full sm:w-auto min-w-[150px]"
              >
                <option value="">All Categories</option>
                <option value="Operations">Operations</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Hardware">Hardware</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 w-full sm:w-auto min-w-[150px]"
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            {(filterCategory || filterStatus) && (
              <button
                onClick={() => { setFilterCategory(''); setFilterStatus(''); }}
                className="mt-4 text-xs text-rose-500 hover:text-rose-600 transition-colors font-semibold px-2"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button variant="ghost" text="Limits & Rules" onClick={() => openModal('settings-modal')} />
            <Button variant="secondary" text="Export Report" onClick={handleExportReport} />
            <Button variant="primary" text="Add Expense" onClick={() => openModal('add-expense-modal')} />
          </div>
        </div>
      </div>

      <DashGrid cols={12} gap={6}>
        <div className="col-span-12 w-full expense-table-container">
          <DataTable
            title="Recent Expenses"
            columns={columns}
            rows={filteredExpenses}
            actions={[
              { icon: <Check size={16} />, tooltip: "Approve", variant: "primary", onClick: (row) => handleApprove(row.id) },
              { icon: <X size={16} />, tooltip: "Reject", variant: "danger", onClick: (row) => handleReject(row.id) }
            ]}
            size={12}
            pageSize={10}
            hideTopBar={false}
            hidePagination={true}
            searchable={true}
          />
        </div>
      </DashGrid>

      <Modal id="settings-modal" title="Limits & Rules" size="sm">
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4">
            <P text="Set the maximum expense amount that can be auto-approved." size="sm" className="text-slate-500" />
            <InputField 
              type="number" 
              placeholder="Expense Limit" 
              value={tempLimit} 
              onChange={e => setTempLimit(e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
             <div onClick={() => closeModal('settings-modal')}>
               <Button variant="ghost" text="Cancel" />
             </div>
             <div onClick={handleSetLimit}>
               <Button variant="primary" text="Save Limit" />
             </div>
          </div>
        </div>
      </Modal>

      <Modal id="add-expense-modal" title="Add Expense" size="sm">
        <div className="space-y-6">
           <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4">
             <P text="Submit a new expense record." size="sm" className="text-slate-500 mb-2" />
             <InputField 
               type="text" 
               placeholder="Title e.g. Travel"
               value={newExpense.title}
               onChange={e => setNewExpense({...newExpense, title: e.target.value})}
             />
             <InputField 
               type="text" 
               placeholder="Category e.g. Sales"
               value={newExpense.category}
               onChange={e => setNewExpense({...newExpense, category: e.target.value})}
             />
             <InputField 
               type="number" 
               placeholder="Amount ($)"
               value={newExpense.amount}
               onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
             />
           </div>
           <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
             <div onClick={() => closeModal('add-expense-modal')}>
               <Button variant="ghost" text="Cancel" />
             </div>
             <div onClick={handleAddExpense}>
               <Button variant="primary" text="Submit Expense" />
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
