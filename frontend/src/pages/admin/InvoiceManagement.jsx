import React from 'react';
import { Heading, P, Button, DashGrid, DataTable } from '../../components/Shared/Common_Components';

export default function InvoiceManagement({ isEmbedded }) {
  const rawInvoices = [
    { idText: 'INV-2023-001', client: 'Acme Corp', date: 'Oct 24, 2023', amount: '1,200.00', status: 'Paid' },
    { idText: 'INV-2023-002', client: 'Global Tech', date: 'Oct 25, 2023', amount: '3,450.00', status: 'Pending' },
    { idText: 'INV-2023-003', client: 'Stark Ind.', date: 'Oct 26, 2023', amount: '890.00', status: 'Overdue' },
    { idText: 'INV-2023-004', client: 'Wayne Ent.', date: 'Oct 27, 2023', amount: '4,500.00', status: 'Paid' },
    { idText: 'INV-2023-005', client: 'Oscorp', date: 'Oct 28, 2023', amount: '2,100.00', status: 'Pending' },
  ];

  const columns = [
    { key: "idText", label: "Invoice ID", width: "15%" },
    { key: "client", label: "Client", width: "20%" },
    { key: "date", label: "Date", width: "15%" },
    { key: "amount", label: "Amount", width: "10%" },
    { key: "status", label: "Status", width: "15%" }
  ];

  const invoices = rawInvoices.map(inv => ({
    ...inv,
    status: inv.status === 'Paid' ? 'Completed' : inv.status === 'Pending' ? 'Pending' : 'Failed'
  }));

  return (
    <div className={`w-full ${isEmbedded ? '' : 'min-h-screen bg-[#f8fafc] p-4 md:p-8'}`}>
      <div className="flex flex-col gap-4 mb-8 w-full">
        <div>
          <Heading primaryText="Invoice" secondaryText="Management" size={12} />
          <P text="Create, view, and download client invoices." size="sm" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="primary" text="Create Invoice" />
        </div>
      </div>

      <DashGrid cols={12} gap={6}>
        <DataTable
          title="All Invoices"
          columns={columns}
          rows={invoices}
          actions={[
            { label: "View", variant: "ghost", onClick: () => {} },
            { label: "Download", variant: "primary", onClick: () => {} }
          ]}
          size={12}
          pageSize={10}
          hideTopBar={true}
          hidePagination={true}
        />
      </DashGrid>
    </div>
  );
}
