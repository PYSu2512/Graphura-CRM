import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PhoneCall, Mic, MicOff, Pause, Play, PhoneOff } from "lucide-react";

export default function GlobalCallModal() {
  const [show, setShow] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [render, setRender] = useState(false);

  useEffect(() => {
    const handleOpen = (e) => {
      setActiveCall(e.detail);
      setCallTimer(0);
      setIsMuted(false);
      setIsOnHold(false);
      setCallNotes("");
      setShow(true);
      setRender(true);
      
      const interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
      window.__globalCallInterval = interval;
      
      // Built-in CRM VoIP dialer (do not trigger OS dialer)
    };

    window.addEventListener("open-global-call", handleOpen);
    return () => window.removeEventListener("open-global-call", handleOpen);
  }, []);

  const handleEndCall = () => {
    clearInterval(window.__globalCallInterval);
    setShow(false);
  };

  const handleAnimEnd = () => { if (!show) setRender(false); };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!render) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-auto px-4 py-6 sm:px-6">
      <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`} onClick={handleEndCall} />
      <div 
        onTransitionEnd={handleAnimEnd} 
        className={`relative w-full max-w-sm bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 flex flex-col transform transition-all duration-400 cubic-bezier(0.34, 1.56, 0.64, 1) ${show ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
      >
        <div className="p-6 text-center space-y-6">
          <div className="relative mx-auto w-20 h-20 mt-2">
            <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-[3px] border-white shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white">
              <PhoneCall size={26} fill="currentColor" />
            </div>
          </div>

          <div>
            <p className="text-2xl font-black text-[#2a465a]">{activeCall?.name || "Unknown"}</p>
            <p className="text-base font-bold text-slate-500 mt-1 tracking-widest">{activeCall?.mobile}</p>
          </div>

          <div className="bg-slate-50 py-3 px-6 rounded-2xl border border-slate-100 inline-block">
            <p className="text-4xl font-black font-mono text-[#2a465a] tabular-nums tracking-tighter">{formatTimer(callTimer)}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 pt-2">
            <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 shadow-md ${isMuted ? "bg-rose-500 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span className="text-[9px] font-black uppercase tracking-tighter">{isMuted ? "Unmute" : "Mute"}</span>
            </button>
            <button onClick={() => setIsOnHold(!isOnHold)} className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 shadow-md ${isOnHold ? "bg-amber-500 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              {isOnHold ? <Play size={20} /> : <Pause size={20} />}
              <span className="text-[9px] font-black uppercase tracking-tighter">{isOnHold ? "Resume" : "Hold"}</span>
            </button>
            <button onClick={handleEndCall} className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex flex-col items-center justify-center gap-1 shadow-xl shadow-rose-600/30 hover:bg-rose-700 hover:-translate-y-1 transition active:scale-95">
              <PhoneOff size={24} fill="currentColor" />
              <span className="text-[9px] font-black uppercase tracking-tighter">End</span>
            </button>
          </div>

          {/* Notes */}
          <div className="pt-5 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left mb-3 ml-1">Call Notes</p>
            <textarea
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="Log discussion points here..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition-all resize-none h-24 focus:bg-white"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
