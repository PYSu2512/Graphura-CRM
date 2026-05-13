import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { P, Button, DataTable, openModal, PanelModal as Modal, closeModal, InputField } from '../../components/shared/Common_Components';

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

  return (
    <div className={`w-full ${isEmbedded ? '' : 'space-y-6'}`}>

      <div className="flex flex-col gap-4 mb-4 w-full">
        <div className="flex justify-end gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button variant="ghost" text="Limits & Rules" onClick={() => openModal('settings-modal')} />
            <Button variant="secondary" text="Export Report" onClick={handleExportReport} />
            <Button variant="primary" text="Add Expense" onClick={() => openModal('add-expense-modal')} />
          </div>
        </div>
      </div>

      <div className="w-full">
        <DataTable
          title="Recent Expenses"
          columns={columns}
          rows={formattedExpenses}
          actions={[
            { icon: <Check size={16} />, tooltip: "Approve", variant: "primary", onClick: (row) => handleApprove(row.id) },
            { icon: <X size={16} />, tooltip: "Reject", variant: "danger", onClick: (row) => handleReject(row.id) }
          ]}
          size={12}
          pageSize={10}
          hideTopBar={false}
          hidePagination={true}
          searchable={true}
          filters={[
            { title: "Category", key: "category", type: "select", options: ["Operations", "IT", "HR", "Hardware", "Marketing"] },
            { title: "Status", key: "status", type: "select", options: ["Completed", "Pending", "Failed"] }
          ]}
        />
      </div>

      <Modal id="settings-modal" title="Limits & Rules" size="md">
        <div className="space-y-6 pt-4">
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

      <Modal id="add-expense-modal" title="Add Expense" size="md">
        <div className="space-y-6 pt-4">
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
