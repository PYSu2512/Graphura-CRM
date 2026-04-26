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

  const columns = [
    { key: "title", label: "Expense Title", width: "20%" },
    { key: "category", label: "Category", width: "15%" },
    { key: "date", label: "Date", width: "15%" },
    { key: "amount", label: "Amount", width: "10%" },
    { key: "status", label: "Status", width: "15%" }
  ];

  const formattedExpenses = expenses.map(exp => ({
    ...exp,
    amount: `$${exp.amount}`,
    rawAmount: exp.amount, 
    status: exp.status === 'Approved' ? 'Completed' : exp.status.includes('Pending') ? 'Pending' : 'Failed'
  }));

  return (
    <div className={`w-full ${isEmbedded ? '' : 'min-h-screen bg-[#f8fafc] p-4 md:p-8'}`}>
      <div className="flex flex-col gap-4 mb-8 w-full">
        <div>
          <Heading primaryText="Expense" secondaryText="Management" size={12} />
          <P text="Track company expenses and manage approvals." size="sm" />
          <p className="mt-2 text-sm text-[#2a465a] font-semibold">Active Limit: ${expenseLimit}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" text="Limits & Rules" onClick={() => openModal('settings-modal')} />
          <Button variant="secondary" text="Export Report" />
          <Button variant="primary" text="Add Expense" onClick={() => openModal('add-expense-modal')} />
        </div>
      </div>

      <DashGrid cols={12} gap={6}>
        <DataTable
          title="Recent Expenses"
          columns={columns}
          rows={formattedExpenses}
          actions={[
            { label: "Approve", variant: "primary", onClick: (row) => handleApprove(row.id) },
            { label: "Reject", variant: "danger", onClick: (row) => handleReject(row.id) }
          ]}
          size={12}
          pageSize={10}
          hideTopBar={true}
          hidePagination={true}
        />
      </DashGrid>

      <Modal id="settings-modal" title="Limits & Rules" size="sm">
        <div className="space-y-4">
          <P text="Set the maximum expense amount that can be auto-approved." size="sm" />
          <InputField 
            type="number" 
            placeholder="Expense Limit" 
            value={tempLimit} 
            onChange={e => setTempLimit(e.target.value)} 
          />
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
             <div onClick={() => closeModal('settings-modal')}>
               <Button variant="ghost" text="Cancel" />
             </div>
             <div onClick={handleSetLimit}>
               <Button variant="primary" text="Save Limit" />
             </div>
          </div>
        </div>
      </Modal>

      <Modal id="add-expense-modal" title="Add Expense" size="md">
        <div className="space-y-4">
           <P text="Submit a new expense record." size="sm" />
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
           <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
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
