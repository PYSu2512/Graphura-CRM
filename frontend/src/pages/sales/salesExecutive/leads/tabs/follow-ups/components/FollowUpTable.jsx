import FollowUpCard from "./FollowUpCard";

export default function FollowUpTable({ reminders = [] }) {
  if (!reminders.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-semibold text-slate-500">No reminders available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {reminders.map((item, index) => (
        <FollowUpCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
