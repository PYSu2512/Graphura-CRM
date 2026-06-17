/**
 * DumpedLeadsTable — Sales Executive
 * Renders the dump leads data table with search, filter, export, and actions.
 * Restore is Manager/Admin only — not shown to Sales Executive.
 * WhatsApp icon opens direct chat for the mobile number in each row.
 */
import { Eye } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { DataTable } from '../../../../../components/shared/Common_Components';
import { DUMPED_LEAD_COLUMNS } from '../utils/dumpDataConstants';

/** Strip all non-digits, ensure 91-prefix for Indian numbers */
const toWaNumber = (raw = '') => {
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;
  return digits.startsWith('91') ? digits : `91${digits}`;
};

const openWhatsApp = (row) => {
  const number = toWaNumber(row.mobile || row.phone || '');
  if (!number) return;
  const msg = encodeURIComponent(
    `Hi ${row.name || ''}, I'm following up regarding your query.`
  );
  window.open(`https://wa.me/${number}?text=${msg}`, '_blank', 'noopener');
};

export function DumpedLeadsTable({ rows, reasonOptions, loading, onView }) {
  return (
    <DataTable
      title="Dumped Leads"
      columns={DUMPED_LEAD_COLUMNS}
      rows={rows}
      loading={loading}
      searchable
      exportable
      date={true}
      filters={[
        {
          title: 'Reason',
          type: 'toggle',
          key: 'dumpReason',
          options: reasonOptions,
        },
      ]}
      actions={[
        {
          icon: <Eye size={15} />,
          tooltip: 'View Details',
          variant: 'ghost',
          onClick: onView,
        },
        {
          icon: <FaWhatsapp size={16} className="text-green-500" />,
          tooltip: 'Open WhatsApp',
          variant: 'ghost',
          show: (row) => Boolean(toWaNumber(row.mobile || row.phone || '')),
          onClick: openWhatsApp,
        },
      ]}
      size={12}
      pageSize={8}
      pageSizeOptions={[8, 12, 20]}
    />
  );
}
