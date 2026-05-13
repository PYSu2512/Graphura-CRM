const SectionCard = ({ title, subtitle, children }) => (
  <div className="col-span-12 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 md:p-6">
    <div className="mb-5 border-b border-slate-200 pb-4">
      <h2 className="text-base font-bold text-[#2a465a]">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default SectionCard;
