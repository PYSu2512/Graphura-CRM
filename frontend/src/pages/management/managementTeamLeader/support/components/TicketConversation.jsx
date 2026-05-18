import { Paperclip, Send } from "lucide-react";
import { conversation } from "../supportData";

export default function TicketConversation() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-[#243b53]">Internal Communication</h3>
          <p className="text-xs font-medium text-slate-500">Replies, mentions, attachments, and timestamps</p>
        </div>
        <Paperclip size={18} className="text-slate-400" />
      </div>
      <div className="space-y-3">
        {conversation.map((message) => (
          <div key={message.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black text-[#243b53]">{message.author}</p>
              <p className="text-[11px] font-semibold text-slate-400">{message.time}</p>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-600">{message.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          placeholder="Reply with @mention or blocker update..."
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-[#243b53] focus:bg-white"
        />
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#243b53] text-white shadow-sm transition hover:bg-[#1d3247]">
          <Send size={16} />
        </button>
      </div>
    </section>
  );
}
