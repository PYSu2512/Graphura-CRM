import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  X,
  Phone,
  Mail,
  Building,
  MapPin,
  IndianRupee,
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  Target,
  MessageCircle,
  Edit,
  Trash2,
  PhoneCall,
  CheckCircle2,
  Bell,
  ArrowRight
} from "lucide-react";
import { Button } from "../../../components/shared/Common_Components";

// Mock Data
const MOCK_PROSPECT = {
  id: "1",
  fullName: "Ravi Sharma",
  phone: "+91 98765 43210",
  email: "ravi.sharma@example.com",
  company: "Tech Corp India",
  city: "Mumbai",
  source: "Website",
  status: "Interested", // Active, Interested, Proposal, Failed, etc.
  dealValue: "50,000",
  priority: "High",
  assignedTo: "John Doe (You)",
  followUpDate: "May 02, 2026",
  followUpTime: "14:30 PM",
  reminder: true,
  activities: [
    {
      id: 1,
      type: "status",
      title: "Status changed to Interested",
      desc: "Lead showed positive response to initial pitch.",
      date: "Today, 10:45 AM",
      icon: Target,
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
    {
      id: 2,
      type: "note",
      title: "Note Added",
      desc: "Client is looking for a comprehensive package. Sent brochure via email.",
      date: "Today, 10:00 AM",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      id: 3,
      type: "call",
      title: "Outbound Call",
      desc: "Spoke with Ravi for 5 minutes. Scheduled a follow-up.",
      date: "Yesterday, 04:30 PM",
      icon: PhoneCall,
      color: "text-emerald-500",
      bg: "bg-emerald-100",
    },
    {
      id: 4,
      type: "creation",
      title: "Lead Created",
      desc: "Lead acquired from Website form submission.",
      date: "Yesterday, 09:15 AM",
      icon: CheckCircle2,
      color: "text-slate-500",
      bg: "bg-slate-200",
    },
  ],
};

const STATUS_MAP = {
  New: "bg-blue-100 text-blue-700",
  Interested: "bg-purple-100 text-purple-700",
  Proposal: "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Failed: "bg-rose-100 text-rose-700",
  Dump: "bg-slate-200 text-slate-600",
};

const ViewProspectDetails = ({ prospectId, onClose }) => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const id = prospectId || routeId;
  const isComponentMode = !!prospectId;
  
  // Slide animation state
  const [isOpen, setIsOpen] = useState(false);
  const [prospect, setProspect] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsOpen(true);
      fetchProspect(id);
    } else {
      setIsOpen(false);
    }
  }, [id]);

  const fetchProspect = async (prospectId) => {
    setLoading(true);
    try {
      const data = await getProspectById(prospectId);
      setProspect(data);
    } catch (error) {
      console.error("Failed to fetch prospect:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      if (isComponentMode && onClose) {
        onClose();
      } else {
        navigate(-1);
      }
    }, 300); // Wait for transition
  };

  if (!prospect && loading) return null; // Or a minimal loader if desired

  const MOCK_PROSPECT = prospect || {
    id: id,
    fullName: "Ravi Sharma",
    phone: "+91 98765 43210",
    email: "ravi.sharma@example.com",
    company: "Tech Corp India",
    city: "Mumbai, MH",
    status: "Interested",
    source: "Website",
    dealValue: "50,000",
    priority: "High",
    assignedTo: "John Doe (You)",
    followUpDate: "May 02, 2026",
    followUpTime: "14:30 PM",
    reminder: true,
    activities: [
      { id: 1, type: "status", date: "Today, 10:45 AM", title: "Status changed to Interested", desc: "Lead showed positive response to initial pitch.", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-100" },
      { id: 2, type: "note", date: "Yesterday, 14:20 PM", title: "Added a Note", desc: "Requested a detailed quotation for the standard package.", icon: FileText, color: "text-amber-600", bg: "bg-amber-100" },
      { id: 3, type: "call", date: "Apr 28, 09:15 AM", title: "Outbound Call", desc: "Spoke for 5 mins. Clarified pricing model.", icon: PhoneCall, color: "text-blue-600", bg: "bg-blue-100" }
    ]
  };

  const STATUS_MAP = {
    Completed: "bg-emerald-100 text-emerald-700",
    "In Progress": "bg-amber-100 text-amber-700",
    New: "bg-blue-100 text-blue-700",
    Interested: "bg-purple-100 text-purple-700",
    Proposal: "bg-amber-100 text-amber-700",
    Dump: "bg-rose-100 text-rose-700"
  };
  const statusColors = STATUS_MAP[MOCK_PROSPECT.status] || "bg-slate-100 text-slate-600";

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={handleClose}
      />

      {/* Right Side Sliding Panel */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Step 1: Header Section */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-black text-[#2a465a] tracking-tight">{MOCK_PROSPECT.fullName}</h2>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                <Phone size={14} /> {MOCK_PROSPECT.phone}
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors}`}>
              {MOCK_PROSPECT.status}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <ArrowRight size={12} /> {MOCK_PROSPECT.source}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-white">
          
          {/* Step 2: Basic Info */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 pb-2">Basic Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#2a465a]">{MOCK_PROSPECT.email}</p>
                  <p className="text-xs text-slate-500">Email Address</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#2a465a]">{MOCK_PROSPECT.company}</p>
                  <p className="text-xs text-slate-500">Company</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#2a465a]">{MOCK_PROSPECT.city}</p>
                  <p className="text-xs text-slate-500">City</p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Lead Info */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 pb-2">Lead Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 flex items-center gap-1"><IndianRupee size={12}/> Deal Value</p>
                <p className="text-sm font-black text-[#2a465a] mt-1">{MOCK_PROSPECT.dealValue}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 flex items-center gap-1"><AlertCircle size={12}/> Priority</p>
                <p className={`text-sm font-black mt-1 ${MOCK_PROSPECT.priority === 'High' ? 'text-rose-500' : 'text-[#2a465a]'}`}>
                  {MOCK_PROSPECT.priority}
                </p>
              </div>
              <div className="col-span-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 flex items-center gap-1"><UserCheck size={12}/> Assigned To</p>
                <p className="text-sm font-semibold text-[#2a465a] mt-1">{MOCK_PROSPECT.assignedTo}</p>
              </div>
            </div>
          </section>

          {/* Step 5: Follow-up Info */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-100 pb-2">Follow-up</h3>
            <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#2a465a] flex items-center gap-2">
                  <Calendar size={14} className="text-amber-500" /> {MOCK_PROSPECT.followUpDate}
                </p>
                <p className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-1">
                  <Clock size={14} className="text-amber-500" /> {MOCK_PROSPECT.followUpTime}
                </p>
              </div>
              {MOCK_PROSPECT.reminder && (
                <div className="flex flex-col items-center justify-center text-amber-500">
                  <Bell size={18} className="animate-pulse" />
                  <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">ON</span>
                </div>
              )}
            </div>
          </section>

          {/* Step 4: Activity Timeline */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 border-b border-slate-100 pb-2">Activity Timeline</h3>
            <div className="relative pl-3 border-l-2 border-slate-100 space-y-8 pb-4">
              {MOCK_PROSPECT.activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="relative">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[23px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${activity.bg} ${activity.color} shadow-sm`}>
                      <Icon size={12} strokeWidth={3} />
                    </div>
                    
                    {/* Content */}
                    <div className="pl-6">
                      <p className="text-xs font-bold text-slate-400 mb-1">{activity.date}</p>
                      <h4 className="text-sm font-bold text-[#2a465a]">{activity.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{activity.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          
        </div>

        {/* Step 6: Action Buttons (Footer) */}
        <div className="flex-shrink-0 p-4 border-t border-slate-100 bg-slate-50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button 
              onClick={() => { window.location.href = `tel:${MOCK_PROSPECT.phone}`; }}
              className="flex items-center justify-center gap-2 bg-[#2a465a] text-white py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-[#1e3a52] transition-colors active:scale-95"
            >
              <PhoneCall size={16} /> Call
            </button>
            <button 
              onClick={() => { window.open(`https://wa.me/${MOCK_PROSPECT.phone}`, "_blank"); }}
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-[#1DA851] transition-colors active:scale-95"
            >
              <MessageCircle size={16} /> WhatsApp
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate(`/sales-executive/edit-prospect/${MOCK_PROSPECT.id}`)}
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-[#2a465a] py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors active:scale-95 shadow-sm"
            >
              <Edit size={16} /> Edit
            </button>
            <button 
              onClick={() => {
                if(window.confirm("Are you sure you want to move this prospect to Dump?")) {
                  alert("Prospect moved to dump successfully!");
                  handleClose();
                }
              }}
              className="flex items-center justify-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 py-3 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-colors active:scale-95 shadow-sm"
            >
              <Trash2 size={16} /> Dump
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default ViewProspectDetails;
