import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  CalendarDays, Settings, X, Plus, Trash2, 
  CheckCircle2, Share2, GripVertical, UploadCloud, 
  Users, UserPlus, Minus, BarChart3, Info, Loader2, Printer,
  LayoutDashboard, FilePlus2, Clock, ChevronRight, Home, FolderPlus, Sun, Moon,
  AlertTriangle, Eye, ArrowRight, ClipboardCheck, ChevronDown, ChevronUp, Folder,
  CloudLightning, Droplets, ShieldCheck, ListTodo, HelpCircle, Truck, Bell, Wrench,
  Menu, MessageSquareShare, Volume2, VolumeX, Sparkles, FileText, Settings2, Hammer,
  SlidersHorizontal, EyeOff, Check, AlertCircle, RefreshCw, Layers, ChevronLeft
} from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, onSnapshot, query, limit } from 'firebase/firestore';

let firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

try {
  if (typeof __firebase_config !== 'undefined') {
      firebaseConfig = JSON.parse(__firebase_config);
  } else {
      firebaseConfig = {
        apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "",
        authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "",
        projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "",
        storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: import.meta.env?.VITE_FIREAGING_SENDER_ID || "",
        appId: import.meta.env?.VITE_FIREBASE_APP_ID || ""
      };
  }
} catch (e) {
  // Silent fallback for compile frameworks
}

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
const app = isFirebaseConfigured ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mbv-scheduler-v1';

const CiticoreLogo = ({ isDarkMode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-7 w-auto select-none">
    <path d="M15 10 L25 22 L15 34 L20 34 L30 22 L20 10 Z" fill="#2563eb" />
    <path d="M22 10 L32 22 L22 34 L27 34 L37 22 L27 10 Z" fill="#06b6d4" />
    <text x="50" y="24" fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="13" fill={isDarkMode ? "#f8fafc" : "#0f172a"} letterSpacing="-0.03em">CITICORE</text>
    <text x="50" y="34" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="7.5" fill={isDarkMode ? "#64748b" : "#475569"} letterSpacing="0.1em">CONSTRUCTION</text>
  </svg>
);

const MbvLogo = ({ isDarkMode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-7 w-auto select-none">
    <rect x="10" y="5" width="35" height="35" rx="6" fill="#1e293b" stroke="#2563eb" strokeWidth="1.5" />
    <path d="M27 12 L19 23 L26 23 L23 31 L32 19 L25 19 Z" fill="#06b6d4" />
    <text x="55" y="24" fontFamily="'Inter', sans-serif" fontWeight="900" fontSize="13" fill="#2563eb" letterSpacing="-0.03em">MBV ELECTRIC</text>
    <text x="55" y="34" fontFamily="'Inter', sans-serif" fontWeight="800" fontSize="7.5" fill={isDarkMode ? "#818cf8" : "#4338ca"} letterSpacing="0.1em">POWER SYSTEM</text>
  </svg>
);

const AssetIcons = {
  None: () => (
    <svg className="w-4.5 h-4.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
    </svg>
  ),
  heavy: () => (
    <svg className="w-4.5 h-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 13.5v6H5v-6m14 0V9a2 2 0 00-2-2h-3m5 6.5H14m0 0V7m0 0h-4m0 0a2 2 0 00-2 2v4.5H5" />
      <circle cx="8" cy="19" r="2.5" />
      <circle cx="16" cy="19" r="2.5" />
    </svg>
  ),
  crane: () => (
    <svg className="w-4.5 h-4.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V6m0 0l11-3m-11 3h9m-9 5h14m-14 5h11M14 6l3 10m-3-10l4 5" />
      <circle cx="5" cy="21" r="1.5" />
      <circle cx="20" cy="21" r="1.5" />
    </svg>
  ),
  excavator: () => (
    <svg className="w-4.5 h-4.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 18h11m-7-5h5l3 3h3m-12-6l5-2m2 7l4-5 3 2m-13 5a3 3 0 11-6 0v-2h6" />
    </svg>
  ),
  case: () => (
    <svg className="w-4.5 h-4.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M12 11v4M9 13h6" />
    </svg>
  ),
  lightning: () => (
    <svg className="w-4.5 h-4.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  tester: () => (
    <svg className="w-4.5 h-4.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  ),
  utility: () => (
    <svg className="w-4.5 h-4.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 17h14M5 12h14M2 17h20v2H2zM4 12V7a2 2 0 012-2h8a2 2 0 012 2v5" />
      <circle cx="7" cy="15" r="2" />
      <circle cx="17" cy="15" r="2" />
    </svg>
  ),
  splicing: () => (
    <svg className="w-4.5 h-4.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M6 6l12 12M18 6L6 12" />
    </svg>
  )
};

const DEFAULT_SHARED_ASSETS = [
  { key: 'PC135', label: 'PC135 Excavator', iconPreset: 'excavator', type: 'Heavy Equipment', defaultMobilizationDays: 1 },
  { key: 'CRN50', label: '50-Ton Crawler Crane', iconPreset: 'crane', type: 'Heavy Equipment', defaultMobilizationDays: 1 },
  { key: 'MVK01', label: 'MV Calibration Kit #1', iconPreset: 'case', type: 'Specialized Tools', defaultMobilizationDays: 0 },
  { key: 'FSA22', label: 'Fusion Splicer Alpha', iconPreset: 'splicing', type: 'Specialized Tools', defaultMobilizationDays: 0 },
  { key: 'PIT99', label: 'Primary Injection Tester', iconPreset: 'tester', type: 'Testing Equipment', defaultMobilizationDays: 1 }
];

const LABOR_PROFILES = {
  civil: [
    { key: 'pm', label: 'PM', fullName: 'Project Manager', bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: '👔' },
    { key: 'se', label: 'SE', fullName: 'Site Engineer', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: '📐' },
    { key: 'so', label: 'SO', fullName: 'Safety Officer', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', icon: '🛡️' },
    { key: 'st', label: 'ST', fullName: 'Steelman', bg: 'bg-slate-500/10 border-slate-500/30 text-slate-300', icon: '⛓️' },
    { key: 'cp', label: 'CP', fullName: 'Carpenter', bg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400', icon: '🪚' },
    { key: 'ms', label: 'MS', fullName: 'Mason', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400', icon: '🧱' },
    { key: 'hl', label: 'HL', fullName: 'Helper', bg: 'bg-teal-500/10 border-teal-500/30 text-teal-400', icon: '🧹' }
  ],
  electrical: [
    { key: 'pm', label: 'PM', fullName: 'Project Manager', bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: '👔' },
    { key: 'ee', label: 'EE', fullName: 'Electrical Engineer', bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400', icon: '⚡' },
    { key: 'so', label: 'SO', fullName: 'Safety Officer', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', icon: '🛡️' },
    { key: 'el', label: 'EL', fullName: 'Electrician', bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400', icon: '🔌' },
    { key: 'lm', label: 'LM', fullName: 'Lineman', bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400', icon: '🧗' },
    { key: 'cs', label: 'CS', fullName: 'Cable Splicer', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: '🪓' },
    { key: 'hl', label: 'HL', fullName: 'Helper', bg: 'bg-teal-500/10 border-teal-500/30 text-teal-400', icon: '🧹' }
  ]
};

const INITIAL_TASKS = [
  { id: 'T1', ref: '1.0', desc: 'Pre-Construction', task: 'Permit Processing & Mobilization', duration: 2, progress: 100, pm: 1, se: 1, ee: 0, so: 1, st: 0, cp: 0, ms: 0, el: 0, lm: 0, cs: 0, hl: 2, assigned: {}, qaStatus: 'APPROVED', checklist: { 'Mobilization Permit': true, 'Office Container Set': true }, assignedAsset: 'None' },
  { id: 'T2', ref: '1.1', desc: 'Technical Survey', task: 'Geo-staking & Trenching Layout', duration: 1, progress: 100, pm: 1, se: 2, ee: 1, so: 1, st: 0, cp: 0, ms: 0, el: 0, lm: 0, cs: 0, hl: 1, assigned: {}, qaStatus: 'APPROVED', checklist: { 'Boundary Markers Laid': true, 'Topographical Crosscheck': true }, assignedAsset: 'None' },
  { id: 'T3', ref: '2.0', desc: 'Civil Works', task: '1.5m Depth Manual Cable Potholing', duration: 3, progress: 80, pm: 0, se: 1, ee: 0, so: 1, st: 0, cp: 0, ms: 0, el: 0, lm: 0, cs: 0, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Utility Clearance Received': true, 'Depth Level Checked': false }, assignedAsset: 'PC135' },
  { id: 'T4', ref: '2.1', desc: 'Electrical Grid', task: 'Substation Ground Mesh Assembly', duration: 2, progress: 40, pm: 0, se: 1, ee: 1, so: 1, st: 0, cp: 1, ms: 0, el: 2, lm: 0, cs: 0, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Excavation Safety Barrier Set': true, 'Mesh Ground resistance logged': false }, assignedAsset: 'None' },
  { id: 'T5', ref: '3.0', desc: 'Substation Pad', task: 'Transformer Pad Rebar & Conduit Setup', duration: 3, progress: 0, pm: 0, se: 1, ee: 1, so: 1, st: 4, cp: 2, ms: 0, el: 2, lm: 0, cs: 0, hl: 2, assigned: {}, qaStatus: 'PENDING', checklist: { 'Rebar Bend Specs OK': false, 'Bedding Compactness Signed': false }, assignedAsset: 'None' },
  { id: 'T6', ref: '3.1', desc: 'Equipment Alignment', task: 'Main Circuit Breaker Structural Alignment', duration: 1, progress: 0, pm: 1, se: 2, ee: 2, so: 1, st: 0, cp: 1, ms: 0, el: 3, lm: 0, cs: 0, hl: 1, assigned: {}, qaStatus: 'HOLD', checklist: { 'Plumbness Signed-Off': false, 'Contact Alignment Check': false }, assignedAsset: 'MVK01' },
  { id: 'T7', ref: '4.0', desc: 'Cable Pulling', task: 'Conduit Placement & Pulling MV Feeders', duration: 2, progress: 0, pm: 0, se: 1, ee: 1, so: 1, st: 2, cp: 2, ms: 4, el: 4, lm: 2, cs: 0, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Formwork Leak Review': false, 'Vibrator Tool Mobilized': false }, assignedAsset: 'None' },
  { id: 'T8', ref: '4.1', desc: 'Curing Period', task: '5-Day Continuous Pad Concrete Wet Curing (Hold)', duration: 5, progress: 0, pm: 0, se: 0, ee: 0, so: 1, st: 0, cp: 0, ms: 1, el: 0, lm: 0, cs: 0, hl: 1, assigned: {}, qaStatus: 'PENDING', checklist: { 'Wet Sack Blanket Placed': false, 'Daily Water Log Checklist': false }, assignedAsset: 'None' },
  { id: 'T9', ref: '5.0', desc: 'Assembly & Splicing', task: 'MV Cable Terminations & Splicing', duration: 3, progress: 0, pm: 1, se: 1, ee: 2, so: 1, st: 2, cp: 2, ms: 0, el: 4, lm: 2, cs: 3, hl: 2, assigned: {}, qaStatus: 'PENDING', checklist: { 'Cable Splicing Certified': false, 'High Potential Test Logged': false }, assignedAsset: 'FSA22' },
  { id: 'T10', ref: '6.0', desc: 'Commissioning', task: 'Substation Transformer Energization & Testing', duration: 2, progress: 0, pm: 1, se: 1, ee: 2, so: 1, st: 0, cp: 0, ms: 0, el: 4, lm: 1, cs: 1, hl: 1, assigned: {}, qaStatus: 'PENDING', checklist: { 'Transformer Insulation Test OK': false, 'Trip Relays Verified': false }, assignedAsset: 'PIT99' },
];

const PremiumCalendarWidget = ({ selectedDate, onChange, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef(null);

  const parsedDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentYear, setCurrentYear] = useState(parsedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(parsedDate.getMonth());

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = getFirstDayOfMonth(currentMonth, currentYear);

  const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthIndex, prevMonthYear);

  const prevMonthDaysToShow = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDaysToShow.push({
      day: daysInPrevMonth - i,
      month: prevMonthIndex,
      year: prevMonthYear,
      isCurrentMonth: false
    });
  }

  const currentMonthDays = [];
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    currentMonthDays.push({
      day: d,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true
    });
  }

  const totalDaysSoFar = prevMonthDaysToShow.length + currentMonthDays.length;
  const remainingSlots = 42 - totalDaysSoFar;
  const nextMonthDaysToShow = [];
  const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  for (let n = 1; n <= remainingSlots; n++) {
    nextMonthDaysToShow.push({
      day: n,
      month: nextMonthIndex,
      year: nextMonthYear,
      isCurrentMonth: false
    });
  }

  const allCalendarDays = [...prevMonthDaysToShow, ...currentMonthDays, ...nextMonthDaysToShow];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const selectDay = (dayObj) => {
    const formattedMonth = String(dayObj.month + 1).padStart(2, '0');
    const formattedDay = String(dayObj.day).padStart(2, '0');
    const dateStr = `${dayObj.year}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const setToday = () => {
    const today = new Date();
    const formattedMonth = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(today.getDate()).padStart(2, '0');
    const dateStr = `${today.getFullYear()}-${formattedMonth}-${formattedDay}`;
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    onChange(dateStr);
    setIsOpen(false);
  };

  useEffect(() => {
    const clickHandler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickHandler);
    return () => document.removeEventListener("mousedown", clickHandler);
  }, []);

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "Select Date";
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="relative inline-block w-full" ref={calendarRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold shadow-inner transition-all duration-200 outline-none ${
          isDarkMode 
            ? 'bg-[#0f172a] hover:bg-[#1e293b] border-slate-800 text-blue-400 hover:text-blue-300' 
            : 'bg-white hover:bg-slate-55 border-slate-200 text-slate-800'
        }`}
      >
        <span className="flex items-center gap-2">
          <CalendarDays size={14} className="text-blue-500 shrink-0" />
          <span>{formatDateDisplay(selectedDate)}</span>
        </span>
        <ChevronDown size={14} className="opacity-60" />
      </button>

      {isOpen && (
        <div className={`absolute left-0 mt-2 w-72 rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
          isDarkMode 
            ? 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-[#020617]/80' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-500">
              {months[currentMonth]} {currentYear}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className={`p-1.5 rounded-lg border transition-all ${
                  isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className={`p-1.5 rounded-lg border transition-all ${
                  isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b pb-1 border-slate-800/45">
            {daysOfWeek.map(d => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {allCalendarDays.map((dayObj, i) => {
              const formattedMonth = String(dayObj.month + 1).padStart(2, '0');
              const formattedDay = String(dayObj.day).padStart(2, '0');
              const currentIterationStr = `${dayObj.year}-${formattedMonth}-${formattedDay}`;
              const isSelected = selectedDate === currentIterationStr;

              const todayObj = new Date();
              const isToday = todayObj.getDate() === dayObj.day && todayObj.getMonth() === dayObj.month && todayObj.getFullYear() === dayObj.year;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(dayObj)}
                  className={`h-7 w-7 rounded-lg text-[11px] font-bold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-black scale-105 shadow-md shadow-blue-500/20'
                      : !dayObj.isCurrentMonth
                        ? 'opacity-25 hover:opacity-50'
                        : isDarkMode
                          ? 'hover:bg-slate-800/80 text-slate-200'
                          : 'hover:bg-slate-100 text-slate-700'
                  } ${isToday && !isSelected ? 'ring-1 ring-blue-500 text-blue-500' : ''}`}
                >
                  {dayObj.day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/40 mt-3 pt-2">
            <button
              type="button"
              onClick={() => { onChange(''); setIsOpen(false); }}
              className="text-[10px] font-black uppercase text-rose-500 tracking-wider hover:opacity-80"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={setToday}
              className="text-[10px] font-black uppercase text-blue-500 tracking-wider hover:opacity-80"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PremiumWeatherSelector = ({ value, onChange, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const states = [
    { id: 'sunny', label: 'Sunny (Normal 1.0x)', icon: '☀️', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { id: 'heavy_rain', label: 'Rain Delay (+35%)', icon: '🌧️', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { id: 'typhoon', label: 'Typhoon Lock (+80%)', icon: '🌀', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
  ];

  const currentSelection = states.find(s => s.id === value) || states[0];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative w-full min-w-[200px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 outline-none ${
          isDarkMode 
            ? 'bg-[#0f172a] hover:bg-[#1e293b] border-slate-800 text-slate-200 shadow-inner' 
            : 'bg-white hover:bg-slate-55 border-slate-200 text-slate-800 shadow-sm'
        }`}
      >
        <span className="flex items-center gap-2">
          <span className={`text-sm py-0.5 px-1.5 rounded-md ${currentSelection.color.split(' ')[1]}`}>
            {currentSelection.icon}
          </span>
          <span className="tracking-wide">{currentSelection.label}</span>
        </span>
        <ChevronDown size={14} className="opacity-60 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 left-0 mt-2 rounded-2xl shadow-2xl border p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
          isDarkMode 
            ? 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-[#020617]/90' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}>
          {states.map(state => {
            const isSelected = state.id === value;
            return (
              <button
                key={state.id}
                type="button"
                onClick={() => {
                  onChange(state.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                  isSelected 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                    : isDarkMode 
                      ? 'hover:bg-slate-800/80 text-slate-300 border border-transparent' 
                      : 'hover:bg-slate-55 text-slate-755 border border-transparent'
                }`}
              >
                <span className={`text-sm py-0.5 px-1.5 rounded-md ${state.color.split(' ')[1]} ${state.color.split(' ')[0]}`}>
                  {state.icon}
                </span>
                <span className="flex-grow">{state.label}</span>
                {isSelected && <Check size={14} className="text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PremiumAssetPresetSelector = ({ value, onChange, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const presets = [
    { id: 'heavy', label: 'Heavy Rig / Transport', emoji: '🚚', desc: 'Bulk Transformer hauls & flatbed transit' },
    { id: 'crane', label: 'Heavy Lift Crane / Gantry', emoji: '🏗️', desc: 'Lifting substation bays and transformers' },
    { id: 'excavator', label: 'Excavator / earthmover', emoji: '🚜', desc: 'Grounding trenching and manual cable potholing' },
    { id: 'case', label: 'Precision Calibration Case', emoji: '🧳', desc: 'MV test instrumentation and protection tools' },
    { id: 'lightning', label: 'Transformer Terminal', emoji: '⚡', desc: 'Primary current / active terminal testing' },
    { id: 'tester', label: 'Primary Injection Tester', emoji: '📊', desc: 'High voltage relay loops and loop test check' },
    { id: 'utility', label: 'Crew Utility Service Flatbed', emoji: '🛻', desc: 'Site patrol and mobile tooling run' },
    { id: 'splicing', label: 'Optical Splicing Hub', emoji: '🔌', desc: 'Fiber splicing, SCADA telemetry & RTU loops' }
  ];

  const currentSelection = presets.find(p => p.id === value) || presets[0];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs font-bold transition-all duration-200 outline-none ${
          isDarkMode 
            ? 'bg-[#0f172a] hover:bg-[#1e293b] border-slate-800 text-slate-100 shadow-inner' 
            : 'bg-white hover:bg-slate-55 border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="text-sm">{currentSelection.emoji}</span>
          <span className="tracking-wide text-[11px] truncate">{currentSelection.label}</span>
        </span>
        <ChevronDown size={14} className="opacity-60 shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div className={`absolute left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-2xl shadow-2xl border p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
          isDarkMode 
            ? 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-[#020617]/95' 
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/60'
        }`}>
          {presets.map(item => {
            const isSelected = item.id === value;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChange(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex flex-col gap-0.5 px-3 py-2 rounded-xl text-left transition-all ${
                  isSelected 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/25' 
                    : isDarkMode 
                      ? 'hover:bg-slate-800/80 text-slate-300 border border-transparent' 
                      : 'hover:bg-slate-55 text-slate-800 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.emoji}</span>
                  <span className="text-[11px] font-black">{item.label}</span>
                  {isSelected && <Check size={12} className="text-blue-400 ml-auto shrink-0" />}
                </div>
                <span className="text-[9px] opacity-70 ml-6 block truncate max-w-[200px]">{item.desc}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading');
  
  const [activePerspective, setActivePerspective] = useState('gantt');
  const [isGanttSidebarVisible, setIsGanttSidebarVisible] = useState(true);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isMetadataCollapsed, setIsMetadataCollapsed] = useState(true);

  const [laborProfile, setLaborProfile] = useState('electrical');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeVisualNotification, setActiveVisualNotification] = useState(null);
  const sessionStartTimeRef = useRef(Date.now());

  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const isSyncingLeftScroll = useRef(false);
  const isSyncingRightScroll = useRef(false);

  const [allProjectsTasks, setAllProjectsTasks] = useState([]);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [activeForecastFilter, setActiveForecastFilter] = useState('this-week');

  const [isUtilityMenuOpen, setIsUtilityMenuOpen] = useState(false);

  const [newChecklistItemText, setNewChecklistItemText] = useState('');

  const handleLeftScroll = (e) => {
    if (isSyncingRightScroll.current) {
      isSyncingRightScroll.current = false;
      return;
    }
    isSyncingLeftScroll.current = true;
    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleRightScroll = (e) => {
    if (isSyncingLeftScroll.current) {
      isSyncingLeftScroll.current = false;
      return;
    }
    isSyncingRightScroll.current = true;
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const [isNotificationPaneOpen, setIsNotificationPaneOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', text: 'Centralized Mother Link Synced with Citicore DB Cloud.', time: 'Just now' },
    { id: 2, type: 'warning', text: 'Transit buffer auto-calculated for PC135 Excavator (+1 Day).', time: '5m ago' },
    { id: 3, type: 'alert', text: 'Conflict Flag: Fusion Splicer Alpha overlaps Quezon and Pagbilao dates.', time: '12m ago' },
    { id: 4, type: 'success', text: 'Engr. Ana Approved Pre-Construction coordinates for T1.', time: '1h ago' }
  ]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('mbv_dark_mode') !== 'false';
  });

  const [projectList, setProjectList] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('master-schedule');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  
  const [customAssets, setCustomAssets] = useState(DEFAULT_SHARED_ASSETS);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [newAssetCode, setNewAssetCode] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState('Heavy Equipment');
  const [newAssetIconPreset, setNewAssetIconPreset] = useState('heavy');
  const [newAssetMobDays, setNewAssetMobDays] = useState(1);
  const [assetValidationWarning, setAssetValidationWarning] = useState('');

  const [projectStartDate, setProjectStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [appTitle, setAppTitle] = useState("Citicore 100MW Solar Grid");
  const [appSubtitle, setAppSubtitle] = useState("Site Operations & Verification Hub");
  const [weatherFactor, setWeatherFactor] = useState("sunny");
  
  const [logos, setLogos] = useState({ left: '', right: '' });
  const [docMetadata, setDocMetadata] = useState({
    projectName: "CITICORE SOLAR PHASE 3B",
    location: "Quezon Substation Hub",
    docNo: "DOC-CIT-MBV-901",
    revision: "01",
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
  });

  const [toastMessage, setToastMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [filterStatusTag, setFilterStatusTag] = useState('ALL');

  const [customConfirmConfig, setCustomConfirmConfig] = useState(null);

  useEffect(() => {
    const pullGlobalDatabaseForecasts = async () => {
      setIsForecastLoading(true);
      try {
        const pooledForecasts = [];
        
        let activeRunningDays = 0;
        const currentMultiplier = weatherFactor === "heavy_rain" ? 1.35 : (weatherFactor === "typhoon" ? 1.8 : 1.0);
        const mappedActiveTasks = tasks.map(task => {
          const duration = Math.max(1, Math.round(task.duration * currentMultiplier));
          const startOffset = activeRunningDays;
          activeRunningDays += duration;

          const startCal = new Date(projectStartDate);
          startCal.setDate(startCal.getDate() + startOffset);

          const endCal = new Date(startCal);
          endCal.setDate(endCal.getDate() + duration);

          return {
            ...task,
            parentProjectName: appTitle,
            parentProjectId: activeProjectId,
            absoluteStartDate: startCal,
            absoluteEndDate: endCal,
            calculatedDuration: duration
          };
        });
        pooledForecasts.push(...mappedActiveTasks);

        if (db && user && projectList.length > 1) {
          for (const proj of projectList) {
            if (proj.id === activeProjectId) continue;
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', proj.id);
            const snap = await getDoc(docRef);
            
            if (snap.exists()) {
              const data = snap.data();
              const projTasks = data.tasks || [];
              const projStart = data.projectStartDate || new Date().toISOString().split('T')[0];
              const projName = data.appTitle || proj.title;
              const factor = data.weatherFactor || 'sunny';

              let runningDays = 0;
              const weatherMultiplier = factor === "heavy_rain" ? 1.35 : (factor === "typhoon" ? 1.8 : 1.0);

              const mapped = projTasks.map(task => {
                const duration = Math.max(1, Math.round(task.duration * weatherMultiplier));
                const startOffset = runningDays;
                runningDays += duration;

                const startCal = new Date(projStart);
                startCal.setDate(startCal.getDate() + startOffset);

                const endCal = new Date(startCal);
                endCal.setDate(endCal.getDate() + duration);

                return {
                  ...task,
                  parentProjectName: projName,
                  parentProjectId: proj.id,
                  absoluteStartDate: startCal,
                  absoluteEndDate: endCal,
                  calculatedDuration: duration
                };
              });

              pooledForecasts.push(...mapped);
            }
          }
        }
        setAllProjectsTasks(pooledForecasts);
      } catch (err) {
        console.warn("Failed pooling global datasets: ", err);
      } finally {
        setIsForecastLoading(false);
      }
    };

    pullGlobalDatabaseForecasts();
  }, [user, projectList, tasks, weatherFactor, projectStartDate, appTitle, activeProjectId]);

  const generateDateHeaderStr = (startDateStr, dayOffset) => {
    const d = new Date(startDateStr);
    d.setDate(d.getDate() + dayOffset);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-99999px";
        textArea.style.top = "-99999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); } catch (err) {}
        textArea.remove();
    }
  };

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 4000);
  }, []);

  const playAlertSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode1 = ctx.createGain();
      const gainNode2 = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); 
      osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); 
      gainNode1.gain.setValueAtTime(0.12, now);
      gainNode1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      osc1.connect(gainNode1);
      gainNode1.connect(ctx.destination);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440.00, now + 0.08); 
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22); 
      gainNode2.gain.setValueAtTime(0.08, now + 0.08);
      gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      osc2.connect(gainNode2);
      gainNode2.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now + 0.08);
      
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.65);
    } catch (e) {
      console.warn("Synth audio feedback blocked:", e);
    }
  }, [soundEnabled]);

  const logActivityToCloud = async (text, type = 'info') => {
    const alertBody = {
      text,
      type,
      timestamp: Date.now(),
      projectTitle: appTitle,
      projectId: activeProjectId,
      userId: auth?.currentUser?.uid || 'anonymous'
    };

    const clientAlert = {
      id: Date.now(),
      type,
      text: `[${appTitle}] ${text}`,
      time: 'Just now'
    };
    setNotifications(prev => [clientAlert, ...prev]);

    if (db) {
      try {
        const activityRef = collection(db, 'artifacts', appId, 'public', 'data', 'activity_log');
        await addDoc(activityRef, alertBody);
      } catch (err) {
        console.warn("Unable to sync activity record globally:", err);
      }
    }
  };

  const broadcastSignificantNotification = useCallback((message, type = 'info') => {
    playAlertSound();
    setActiveVisualNotification({
      id: Date.now(),
      message,
      type
    });
    
    setNotifications(prev => [
      { id: Date.now(), type, text: message, time: 'Just now' },
      ...prev
    ]);

    setTimeout(() => {
      setActiveVisualNotification(null);
    }, 8000);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`Site Alert: ${appTitle}`, {
          body: message,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.warn("Native Notification blocked in iframe container framework.");
      }
    }
  }, [appTitle, playAlertSound]);

  useEffect(() => {
    localStorage.setItem('mbv_dark_mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProjectDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 1024 || (window.innerWidth < 920 && window.innerHeight < 500));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const localSchedules = localStorage.getItem('mbv_cloud_registry');
    let loadedRegistry = localSchedules ? JSON.parse(localSchedules) : [];
    
    if (loadedRegistry.length === 0) {
      loadedRegistry = [
        { id: 'master-schedule', title: 'Citicore 100MW Solar Grid', lastModified: new Date().toISOString() },
        { id: 'substation-hub', title: 'Quezon Substation Hub', lastModified: new Date().toISOString() }
      ];
      localStorage.setItem('mbv_cloud_registry', JSON.stringify(loadedRegistry));
    }
    setProjectList(loadedRegistry);

    const initAuth = async () => {
      if (!auth) {
        setView('editor');
        return;
      }
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Bypassed default auth gateway: ", err);
        setView('editor');
      }
    };
    initAuth();

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (!u) {
          setView('editor');
        }
      });
      
      const safetyTimeout = setTimeout(() => {
        setView('editor');
      }, 3500);

      return () => {
        unsubscribe();
        clearTimeout(safetyTimeout);
      };
    } else {
      setView('editor');
    }
  }, []);

  useEffect(() => {
    if (!db || !user || !activeProjectId) return;

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeProjectId);
    const unsubscribeProject = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const payload = snap.data();
        setTasks(payload.tasks || INITIAL_TASKS);
        setCustomAssets(payload.customAssets || DEFAULT_SHARED_ASSETS);
        setAppTitle(payload.appTitle || "Project Schedule");
        setAppSubtitle(payload.appSubtitle || "");
        setProjectStartDate(payload.projectStartDate || new Date().toISOString().split('T')[0]);
        setDocMetadata(payload.docMetadata || {});
        setLogos(payload.logos || { left: '', right: '' });
      }
      setView('editor');
    }, (error) => {
      console.warn("Firestore schedule listener blocked/error: ", error);
      setView('editor');
    });

    return () => unsubscribeProject();
  }, [user, activeProjectId]);

  useEffect(() => {
    if (!db || !user) return;

    const activityRef = collection(db, 'artifacts', appId, 'public', 'data', 'activity_log');
    const unsubscribeActivity = onSnapshot(activityRef, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const alertData = change.data();
          if (alertData.timestamp > (sessionStartTimeRef.current - 120000)) { 
            if (alertData.userId !== auth.currentUser?.uid) {
              const textMessage = `${alertData.text}`;
              broadcastSignificantNotification(textMessage, alertData.type);
            }
          }
        }
      });
    }, (error) => {
      console.warn("Global activity log stream blocked: ", error);
    });

    return () => unsubscribeActivity();
  }, [user, broadcastSignificantNotification]);

  const fetchSiteSchedule = async (id, fallbackRegistry) => {
    if (!db) {
      showToast("Cloud configuration offline. Running offline sandbox.");
      setView('editor');
      return;
    }
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const payload = snap.data();
        setTasks(payload.tasks || INITIAL_TASKS);
        setCustomAssets(payload.customAssets || DEFAULT_SHARED_ASSETS);
        setAppTitle(payload.appTitle || "Project Schedule");
        setAppSubtitle(payload.appSubtitle || "");
        setProjectStartDate(payload.projectStartDate || new Date().toISOString().split('T')[0]);
        setDocMetadata(payload.docMetadata || {});
        setLogos(payload.logos || { left: '', right: '' });
        setActiveProjectId(id);
        
        if (!fallbackRegistry.find(p => p.id === id)) {
          const freshList = [...fallbackRegistry, { id, title: payload.appTitle || id, lastModified: new Date().toISOString() }];
          setProjectList(freshList);
          localStorage.setItem('mbv_cloud_registry', JSON.stringify(freshList));
        }
        showToast(`"${payload.appTitle}" synced from Cloud!`);
      } else {
        showToast("Site schedule not found on cloud. Initializing offline.");
      }
    } catch (e) {
      console.error(e);
      showToast("Error retrieving database. Offline fallback applied.");
    } finally {
      setView('editor');
    }
  };

  const handleCreateNewProject = () => {
    if (!newProjectName.trim()) {
      showToast("Please enter a valid project name.");
      return;
    }

    const nextId = newProjectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const duplicateCheck = projectList.find(p => p.id === nextId);
    if (duplicateCheck) {
      showToast("A project with this reference name already exists.");
      return;
    }

    const nextProject = {
      id: nextId,
      title: newProjectName,
      lastModified: new Date().toISOString()
    };

    const freshRegistry = [...projectList, nextProject];
    setProjectList(freshRegistry);
    localStorage.setItem('mbv_cloud_registry', JSON.stringify(freshRegistry));

    setActiveProjectId(nextId);
    setAppTitle(newProjectName);
    setTasks(INITIAL_TASKS.map(t => ({...t, progress: 0, qaStatus: 'PENDING', assigned: {}})));
    setCustomAssets(DEFAULT_SHARED_ASSETS);
    setDocMetadata({
      projectName: newProjectName.toUpperCase(),
      location: "Active Construction Zone",
      docNo: "DOC-CIT-MBV-" + Math.floor(100 + Math.random() * 900),
      revision: "01",
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
    });

    const url = new URL(window.location.href);
    url.searchParams.set('project', nextId);
    window.history.replaceState({}, document.title, url.toString());

    setShowCreateProjectModal(false);
    setNewProjectName('');
    showToast(`"${newProjectName}" initialized!`);
    
    logActivityToCloud(`Created and initialized sub-project workspace`, 'success');
  };

  const handleSwitchProject = (id) => {
    const matchingProject = projectList.find(p => p.id === id);
    if (!matchingProject) return;

    if (db) {
      setView('loading');
      fetchSiteSchedule(id, projectList);
    } else {
      setActiveProjectId(id);
      setAppTitle(matchingProject.title);
      showToast(`Switched offline to: ${matchingProject.title}`);
    }

    const url = new URL(window.location.href);
    url.searchParams.set('project', id);
    window.history.replaceState({}, document.title, url.toString());
    logActivityToCloud(`Switched operational view context to: ${matchingProject.title}`, 'info');
  };

  const handleDeleteProject = (id) => {
    setProjectToDelete(id);
    setCustomConfirmConfig({
      title: "Delete Project Workspace",
      message: "Are you sure you want to completely remove this project database? This action cannot be undone.",
      onConfirm: () => {
        const freshRegistry = projectList.filter(p => p.id !== id);
        setProjectList(freshRegistry);
        localStorage.setItem('mbv_cloud_registry', JSON.stringify(freshRegistry));
        showToast("Project deleted successfully.");
        setProjectToDelete(null);
        setCustomConfirmConfig(null);
        if (activeProjectId === id) {
          handleSwitchProject('master-schedule');
        }
      }
    });
  };

  const handleAddCustomAsset = () => {
    setAssetValidationWarning('');
    if (!newAssetCode.trim() || !newAssetName.trim()) {
      setAssetValidationWarning("Please populate both Asset Code and Name.");
      return;
    }

    const normalizedCode = newAssetCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const codeExists = customAssets.some(a => a.key === normalizedCode);
    if (codeExists) {
      setAssetValidationWarning(`An asset with code "${normalizedCode}" already exists.`);
      return;
    }

    const newlyCreated = {
      key: normalizedCode,
      label: newAssetName,
      iconPreset: newAssetIconPreset,
      type: newAssetType,
      defaultMobilizationDays: parseInt(newAssetMobDays) || 0
    };

    const updatedAssetsList = [...customAssets, newlyCreated];
    setCustomAssets(updatedAssetsList);

    if (db && user) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeProjectId);
      setDoc(docRef, {
        customAssets: updatedAssetsList,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn(err));
    }

    logActivityToCloud(`Added new custom logistical equipment: ${newAssetName} (${normalizedCode})`, 'success');
    showToast(`Registered Custom Asset: ${normalizedCode}`);
    
    setNewAssetCode('');
    setNewAssetName('');
    setNewAssetMobDays(1);
  };

  const handleRemoveCustomAsset = (assetKey) => {
    const isAssigned = tasks.some(t => t.assignedAsset === assetKey);
    if (isAssigned) {
      setAssetValidationWarning(`Cannot delete ${assetKey}. It is currently allocated on active schedule rows.`);
      return;
    }

    const updatedAssetsList = customAssets.filter(a => a.key !== assetKey);
    setCustomAssets(updatedAssetsList);

    if (db && user) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeProjectId);
      setDoc(docRef, {
        customAssets: updatedAssetsList,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn(err));
    }

    logActivityToCloud(`Removed logistical asset: ${assetKey}`, 'alert');
    showToast(`Removed Asset: ${assetKey}`);
  };

  const renderAssetIcon = (assetKey) => {
    if (!assetKey || assetKey === 'None') {
      return AssetIcons.None();
    }
    const matchingAsset = customAssets.find(a => a.key === assetKey);
    if (matchingAsset) {
      const preset = matchingAsset.iconPreset || 'heavy';
      const renderingFunc = AssetIcons[preset] || AssetIcons.heavy;
      return renderingFunc();
    }
    return AssetIcons.heavy();
  };

  const handleLogoUpload = (side, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogos(prev => ({...prev, [side]: event.target.result}));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerSystemPrint = () => window.print();

  const fetchWeatherDelayMultiplier = () => {
    if (weatherFactor === "heavy_rain") return 1.35;
    if (weatherFactor === "typhoon") return 1.8;
    return 1.0;
  };

  const flowSchedule = useCallback(() => {
    let currentStartDay = 0;
    const multiplier = fetchWeatherDelayMultiplier();
    const activeRoles = LABOR_PROFILES[laborProfile];

    return tasks.map((task) => {
      const start = currentStartDay;
      const adjustedDuration = Math.max(1, Math.round(task.duration * multiplier));
      currentStartDay += adjustedDuration;
      
      const totalManpower = activeRoles.reduce((sum, r) => {
        const val = parseInt(task[r.key]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

      return { 
        ...task, 
        startDays: start, 
        adjustedDuration,
        totalManpower, 
        progress: task.progress || 0,
        assignedAsset: task.assignedAsset || 'None'
      };
    });
  }, [tasks, weatherFactor, laborProfile]);

  const activeFlowTasks = flowSchedule();
  const totalDays = activeFlowTasks.reduce((acc, curr) => acc + curr.adjustedDuration, 0) || 1;
  const headerDays = Array.from({ length: totalDays + 3 }, (_, i) => i);

  const activeRoles = LABOR_PROFILES[laborProfile];

  const maxManpowerVal = Math.max(
    ...headerDays.map(day => 
      activeFlowTasks.reduce((sum, task) => {
        if (day >= task.startDays && day < task.startDays + task.adjustedDuration) return sum + task.totalManpower;
        return sum;
      }, 0)
    ), 1
  );

  const updateTask = async (id, field, value) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, [field]: value } : t);
    setTasks(updatedTasks);
    
    if (db && user && (field === 'assignedAsset' || field === 'qaStatus' || field === 'duration' || field === 'checklist')) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeProjectId);
        await setDoc(docRef, {
          tasks: updatedTasks,
          docMetadata,
          projectStartDate,
          appTitle,
          appSubtitle,
          logos,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn("Real-time autosave offline fallback triggered:", e);
      }
    }

    if (field === 'duration' || field === 'assignedAsset') {
      const match = tasks.find(t => t.id === id);
      if (match && value !== 'None') {
        const assetName = customAssets.find(a => a.key === value || a.key === match.assignedAsset)?.label || 'Asset';
        logActivityToCloud(`Allocated shared logistical asset: ${assetName} to ${match.task}`, 'warning');
      }
    }
  };

  const addTask = () => {
    const newRef = `${tasks.length + 1}.0`;
    const updatedTasks = [...tasks, { 
      id: `T${Date.now()}`, 
      ref: newRef, 
      desc: 'Electrical Field Work', 
      task: 'New Wiring / Conduit Installation', 
      duration: 1, 
      progress: 0, 
      pm: 0, se: 0, ee: 0, so: 0, st: 0, cp: 0, ms: 0, el: 1, lm: 0, cs: 0, hl: 1,
      assigned: {}, 
      qaStatus: 'PENDING', 
      checklist: { 'Formwork Leak Review': false, 'Vibrator Tool Mobilized': false },
      assignedAsset: 'None'
    }];
    setTasks(updatedTasks);
    showToast("New schedule row added.");
    logActivityToCloud("Added a new sequence timeline parameter.", "info");
  };

  const triggerTaskRemove = (id) => {
    const matched = tasks.find(t => t.id === id);
    setCustomConfirmConfig({
      title: "Remove Task Parameter",
      message: `Are you sure you want to delete task sequence: "${matched?.task}"?`,
      onConfirm: () => {
        const updatedTasks = tasks.filter(t => t.id !== id);
        setTasks(updatedTasks);
        showToast("Schedule row removed.");
        if (matched) {
          logActivityToCloud(`Deleted timeline sequence row: ${matched.task}`, 'alert');
        }
        setCustomConfirmConfig(null);
      }
    });
  };

  const adjustWorkerCount = (taskId, roleKey, increment) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const currentCount = parseInt(t[roleKey]);
        const safeCount = isNaN(currentCount) ? 0 : currentCount;
        return { ...t, [roleKey]: Math.max(0, safeCount + increment) };
      }
      return t;
    }));
  };

  const assignWorkerName = (taskId, roleKey, index, name) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const newAssigned = { ...(t.assigned || {}) };
        if (!newAssigned[roleKey]) newAssigned[roleKey] = [];
        newAssigned[roleKey][index] = name;
        return { ...t, assigned: newAssigned };
      }
      return t;
    }));
  };
  
  const toggleChecklistItem = (taskId, itemName) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const currentChecklist = { ...(t.checklist || {}) };
        currentChecklist[itemName] = !currentChecklist[itemName];
        
        const stateStr = currentChecklist[itemName] ? "APPROVED" : "PENDING";
        logActivityToCloud(`Checklist: "${itemName}" marked as ${stateStr}`, 'success');
        
        return { ...t, checklist: currentChecklist };
      }
      return t;
    });
    setTasks(updatedTasks);
    updateTask(taskId, 'checklist', updatedTasks.find(t => t.id === taskId).checklist);
  };

  const addChecklistItem = (taskId) => {
    if (!newChecklistItemText.trim()) return;
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const currentChecklist = { ...(t.checklist || {}) };
        currentChecklist[newChecklistItemText.trim()] = false;
        return { ...t, checklist: currentChecklist };
      }
      return t;
    });
    setTasks(updatedTasks);
    updateTask(taskId, 'checklist', updatedTasks.find(t => t.id === taskId).checklist);
    logActivityToCloud(`Checklist: Added new parameter "${newChecklistItemText.trim()}"`, 'info');
    setNewChecklistItemText('');
  };

  const deleteChecklistItem = (taskId, itemName) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const currentChecklist = { ...(t.checklist || {}) };
        delete currentChecklist[itemName];
        return { ...t, checklist: currentChecklist };
      }
      return t;
    });
    setTasks(updatedTasks);
    updateTask(taskId, 'checklist', updatedTasks.find(t => t.id === taskId).checklist);
    logActivityToCloud(`Checklist: Removed parameter "${itemName}"`, 'alert');
  };

  const checkAssetConflict = (taskToCheck) => {
    if (!taskToCheck.assignedAsset || taskToCheck.assignedAsset === 'None') return null;

    for (let otherTask of activeFlowTasks) {
      if (otherTask.id === taskToCheck.id) continue;
      if (otherTask.assignedAsset === taskToCheck.assignedAsset) {
        const startA = taskToCheck.startDays;
        const endA = taskToCheck.startDays + taskToCheck.adjustedDuration;
        const startB = otherTask.startDays;
        const endB = otherTask.startDays + otherTask.adjustedDuration;

        if (startA < endB && endA > startB) {
          const assetName = customAssets.find(a => a.key === taskToCheck.assignedAsset)?.label || 'Tool';
          return {
            conflictTaskRef: otherTask.ref,
            conflictTaskName: otherTask.task,
            assetName,
            type: 'Direct Overlap'
          };
        }
      }
    }
    return null;
  };

  const shareToGroupChat = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('project', activeProjectId);
    copyToClipboard(url.toString());
    showToast("Workspace link copied! Share with Engr. Ana.");
  };

  const filteredTasks = activeFlowTasks.filter(t => {
    const searchMatch = t.task.toLowerCase().includes(filterSearchQuery.toLowerCase()) || 
                        t.desc.toLowerCase().includes(filterSearchQuery.toLowerCase()) ||
                        t.ref.includes(filterSearchQuery);
    const statusMatch = filterStatusTag === 'ALL' || t.qaStatus === filterStatusTag;
    return searchMatch && statusMatch;
  });

  const getRowBgColor = (task, index) => {
    const isHold = task.qaStatus === 'HOLD';
    const isApproved = task.qaStatus === 'APPROVED';
    const hasConflict = checkAssetConflict(task);
    
    if (isDarkMode) {
      if (hasConflict) return 'bg-amber-955/20 border-amber-500/30 hover:bg-amber-955/40 text-amber-200';
      if (isHold) return 'bg-rose-950/20 border-rose-500/30 hover:bg-rose-950/40 text-rose-200';
      if (isApproved) return 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-950/40 text-emerald-200';
      return index % 2 === 0 ? 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/20' : 'bg-[#0b0f19] border-slate-800/40 hover:bg-slate-800/10';
    } else {
      if (hasConflict) return 'bg-amber-50/80 border-amber-300 hover:bg-amber-100/80 text-amber-900';
      if (isHold) return 'bg-rose-50/80 border-rose-300 hover:bg-rose-100/80 text-rose-900';
      if (isApproved) return 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/80 text-emerald-900';
      return index % 2 === 0 ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-55 border-slate-202 hover:bg-slate-100';
    }
  };

  const getBadgeStyle = (status) => {
    if (status === 'APPROVED') {
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-extrabold';
    }
    if (status === 'HOLD') {
      return 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse font-black';
    }
    return 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-extrabold';
  };

  const getTomorrowAllocations = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const start = new Date(projectStartDate);
    const diffTime = tomorrow.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0 || diffDays > totalDays + 5) return [];
    
    return activeFlowTasks.filter(task => {
      return diffDays >= task.startDays && diffDays < task.startDays + task.adjustedDuration && task.assignedAsset !== 'None';
    });
  };

  const tomorrowAllocations = getTomorrowAllocations();

  const getThisWeeksForecastTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    return allProjectsTasks.filter(task => {
      const startsInWindow = task.absoluteStartDate >= today && task.absoluteStartDate <= sevenDaysLater;
      const endsInWindow = task.absoluteEndDate >= today && task.absoluteEndDate <= sevenDaysLater;
      const spansWindow = task.absoluteStartDate <= today && task.absoluteEndDate >= sevenDaysLater;
      
      if (activeForecastFilter === 'this-week') {
        return startsInWindow || endsInWindow || spansWindow;
      }
      return task.progress < 100 || task.qaStatus === 'HOLD';
    }).sort((a, b) => a.absoluteStartDate - b.absoluteStartDate);
  };

  const thisWeeksForecastList = getThisWeeksForecastTasks();

  if (view === 'loading') {
    return (
      <div className="h-screen w-screen bg-[#080d1a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500 h-8 w-8"/>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">Syncing Citicore Mother DB...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#080d1a] text-slate-100' : 'bg-[#f8fafc] text-[#0f172a]'}`}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-tap-highlight-color: transparent;
        }

        .overflow-y-auto, .overflow-x-auto {
          -webkit-overflow-scrolling: touch;
        }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${isDarkMode ? 'rgba(15, 23, 42, 0.1)' : 'rgba(241, 245, 249, 0.5)'}; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#1e293b' : '#cbd5e1'}; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        
        .gantt-grid-light {
          background-image: 
            linear-gradient(to right, rgba(203, 213, 225, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(203, 213, 225, 0.3) 1px, transparent 1px);
          background-size: 56px 100%, 100% 68px;
        }
        
        .gantt-grid-dark {
          background-image: 
            linear-gradient(to right, rgba(30, 41, 59, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 41, 59, 0.4) 1px, transparent 1px);
          background-size: 56px 100%, 100% 68px;
        }

        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          body { background-color: #ffffff !important; color: #000000 !important; }
          header, button, .print\\:hidden { display: none !important; }
          #gantt-export-zone { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
        }
      `}} />

      {}
      <header className={`border-b z-40 shrink-0 transition-colors relative ${isDarkMode ? 'bg-[#0f172a]/95 border-slate-800/80 backdrop-blur-md' : 'bg-white/95 border-slate-200/80 backdrop-blur-md'}`}>
        <div className="px-4 py-2 sm:px-6 sm:py-3 flex flex-col gap-2 sm:gap-3">
          
          <div className="flex items-center justify-between gap-3">
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-[#1e293b]/60 p-1.5 sm:p-2 rounded-xl border border-slate-700/50 text-white shrink-0 shadow-lg hidden xs:block">
                <Layers size={16} className="text-blue-400"/>
              </div>
              
              <div className="flex flex-col min-w-0" ref={dropdownRef}>
                <div className="relative flex items-center gap-2">
                  <button
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-black select-none ${
                      isDarkMode 
                        ? 'bg-[#1e293b]/50 hover:bg-[#1e293b] text-slate-100 border-slate-800 hover:border-slate-700' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200 shadow-sm'
                    }`}
                  >
                    <Folder className="text-blue-500 shrink-0" size={13}/>
                    <span className="truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[260px]">
                      {projectList.find(p => p.id === activeProjectId)?.title || 'Switch Workspace...'}
                    </span>
                    <ChevronDown className="text-slate-400 shrink-0" size={12}/>
                  </button>

                  {isProjectDropdownOpen && (
                    <div className={`absolute left-0 top-10 w-72 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200 ${
                      isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-200 shadow-2xl' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      <div className="px-3 py-2 text-[10px] font-black tracking-widest text-slate-500 border-b border-slate-850 uppercase mb-2">
                        Schedules Directory
                      </div>
                      <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                        {projectList.map((proj) => (
                          <div 
                            key={proj.id}
                            onClick={() => {
                              handleSwitchProject(proj.id);
                              setIsProjectDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                              activeProjectId === proj.id 
                                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-md' 
                                : (isDarkMode ? 'hover:bg-slate-800/80 text-slate-300 border border-transparent' : 'hover:bg-slate-55 text-slate-750 border border-slate-200')
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Folder className={activeProjectId === proj.id ? 'text-blue-500' : 'text-slate-400'} size={12}/>
                              <span className="truncate">{proj.title}</span>
                            </div>
                            {proj.id !== 'master-schedule' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(proj.id);
                                  setIsProjectDropdownOpen(false);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors shrink-0"
                              >
                                <Trash2 size={12}/>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-slate-850 mt-2 pt-2">
                        <button 
                          onClick={() => {
                            setShowCreateProjectModal(true);
                            setIsProjectDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all text-[10px] font-bold uppercase tracking-wider shadow-md"
                        >
                          <Plus size={12}/> Create Project
                        </button>
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 hidden md:inline-block">
                    {weatherFactor === 'sunny' ? '☀️ Sunny' : weatherFactor === 'heavy_rain' ? '🌧️ Rain Delay' : '🌀 Typhoon Lock'}
                  </span>
                </div>
              </div>
            </div>

            {/* UPGRADED NAVIGATION TABS (Resolving image_df054e.png with vector premium designs) */}
            <div className="flex items-center justify-center flex-1 max-w-lg mx-2">
              <div className={`flex items-center gap-1 border p-1 rounded-2xl w-full justify-between transition-colors shadow-inner ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-slate-100 border-slate-200/80'
              }`}>
                {[
                  { id: 'gantt', label: 'Gantt Workspace', icon: LayoutDashboard },
                  { id: 'weekly', label: 'Outlook', icon: CalendarDays },
                  { id: 'qa', label: 'QA Ledger', icon: ShieldCheck },
                  { id: 'logistics', label: 'Logistics', icon: Truck }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activePerspective === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActivePerspective(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider text-center transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10 scale-105' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                      }`}
                    >
                      <Icon size={12} className={isActive ? 'text-white' : 'text-slate-500'} />
                      <span className="hidden xs:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  isControlPanelOpen
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : isDarkMode ? 'bg-[#1e293b]/50 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-sm'
                }`}
                title="Site Control Center"
              >
                <SlidersHorizontal size={13}/>
                <span className="hidden sm:inline">Settings</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsUtilityMenuOpen(!isUtilityMenuOpen)}
                  className={`p-1.5 rounded-xl border transition-all ${
                    isDarkMode ? 'bg-[#1e293b]/50 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <Settings size={14}/>
                </button>
                
                {isUtilityMenuOpen && (
                  <div className={`absolute right-0 top-10 w-48 rounded-2xl shadow-2xl border p-2 z-50 flex flex-col gap-1 ${
                    isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-200 shadow-[#000]/60 bg-opacity-95' : 'bg-white border-slate-200 text-slate-805'
                  }`}>
                    <button 
                      onClick={() => { setSoundEnabled(!soundEnabled); setIsUtilityMenuOpen(false); }} 
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-slate-800/50 rounded-xl w-full text-left"
                    >
                      {soundEnabled ? <VolumeX size={14}/> : <Volume2 size={14}/>}
                      <span>{soundEnabled ? "Mute Sound" : "Enable Sound"}</span>
                    </button>
                    <button 
                      onClick={() => { shareToGroupChat(); setIsUtilityMenuOpen(false); }} 
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-slate-800/50 rounded-xl w-full text-left text-blue-400"
                    >
                      <MessageSquareShare size={14}/>
                      <span>Share Workspace</span>
                    </button>
                    <button 
                      onClick={() => { setIsNotificationPaneOpen(true); setIsUtilityMenuOpen(false); }} 
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-slate-800/50 rounded-xl w-full text-left"
                    >
                      <Bell size={14}/>
                      <span>Notifications</span>
                    </button>
                    <button 
                      onClick={() => { setIsDarkMode(!isDarkMode); setIsUtilityMenuOpen(false); }} 
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-slate-800/50 rounded-xl w-full text-left"
                    >
                      {isDarkMode ? <Sun size={14}/> : <Moon size={14}/>}
                      <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {isControlPanelOpen && (
          <div className={`px-4 py-3 sm:px-6 sm:py-4 border-t flex flex-wrap gap-4 items-center animate-in slide-in-from-top-1 duration-200 ${isDarkMode ? 'bg-[#0b0f19]/95 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Crew Profile</span>
              <div className={`flex border rounded-xl p-1 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
                <button 
                  onClick={() => { setLaborProfile('civil'); showToast("Switched to Civil Crew"); }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${laborProfile === 'civil' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Civil
                </button>
                <button 
                  onClick={() => { setLaborProfile('electrical'); showToast("Switched to Electrical Crew ⚡"); }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${laborProfile === 'electrical' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Electrical ⚡
                </button>
              </div>
            </div>

            {/* UPGRADED WEATHER STATE POPULAR IN image_df05aa.png */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Weather State</span>
              <PremiumWeatherSelector 
                value={weatherFactor} 
                onChange={(newVal) => {
                  setWeatherFactor(newVal);
                  logActivityToCloud(`Weather state updated to ${newVal.toUpperCase()}`, 'warning');
                }} 
                isDarkMode={isDarkMode} 
              />
            </div>

            <div className="flex flex-col gap-1 w-48">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Launch Target</span>
              <PremiumCalendarWidget 
                selectedDate={projectStartDate} 
                onChange={(newVal) => {
                  if (newVal) setProjectStartDate(newVal);
                }} 
                isDarkMode={isDarkMode} 
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Document Specs</span>
              <button 
                onClick={() => setIsMetadataCollapsed(!isMetadataCollapsed)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-[#0f172a] border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isMetadataCollapsed ? <ChevronDown size={12}/> : <ChevronUp size={12}/>}
                <span>Header Details</span>
              </button>
            </div>

            <div className="flex gap-2 ml-auto">
              <button onClick={triggerSystemPrint} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Printer size={13}/> Print
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-white border-slate-200'}`}>
                <Settings size={14}/>
              </button>
            </div>
          </div>
        )}
      </header>

      {}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden p-3 sm:p-6 relative flex flex-col min-h-0 z-10">
        <div className="max-w-[1700px] w-full mx-auto flex flex-col gap-4 flex-1 min-h-0">

          {!isMetadataCollapsed && (
            <div id="gantt-export-zone" className={`rounded-2xl border p-4 flex flex-col gap-4 shadow-sm shrink-0 transition-all duration-300 animate-in slide-in-from-top-1 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800/60' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/4 flex justify-start items-center">
                  {logos.left ? <img src={logos.left} className="h-10 object-contain" alt="Left" /> : <CiticoreLogo isDarkMode={isDarkMode}/>}
                </div>
                <div className="w-full md:w-1/2 text-center flex flex-col">
                  <input 
                    value={docMetadata.projectName} 
                    onChange={(e) => setDocMetadata({...docMetadata, projectName: e.target.value.toUpperCase()})}
                    className={`text-center font-black text-sm tracking-tight bg-transparent uppercase border-b border-transparent focus:border-blue-500 outline-none w-full transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                    placeholder="Project Name..."
                  />
                  <input 
                    value={docMetadata.location} 
                    onChange={(e) => setDocMetadata({...docMetadata, location: e.target.value})}
                    className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-transparent border-none outline-none mt-1"
                    placeholder="Location Hub..."
                  />
                </div>
                <div className="w-full md:w-1/4 flex justify-end items-center">
                  {logos.right ? <img src={logos.right} className="h-10 object-contain" alt="Right" /> : <MbvLogo isDarkMode={isDarkMode}/>}
                </div>
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-black uppercase tracking-wider border-t pt-4 ${isDarkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
                <div className="flex flex-col gap-1 border-r border-slate-800/40">
                  <span>Document No:</span>
                  <input value={docMetadata.docNo} onChange={(e) => setDocMetadata({...docMetadata, docNo: e.target.value})} className={`font-mono bg-transparent outline-none w-full font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`} />
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-800/40 px-1">
                  <span>Revision:</span>
                  <input value={docMetadata.revision} onChange={(e) => setDocMetadata({...docMetadata, revision: e.target.value})} className={`bg-transparent outline-none w-full font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`} />
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-800/40 px-1">
                  <span>Effective Date:</span>
                  <input value={docMetadata.date} onChange={(e) => setDocMetadata({...docMetadata, date: e.target.value})} className={`bg-transparent outline-none w-full font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`} />
                </div>
                <div className="flex flex-col gap-1 pl-1">
                  <span>Base Launch:</span>
                  <span className={`font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{projectStartDate}</span>
                </div>
              </div>
            </div>
          )}

          {activePerspective === 'gantt' && (
            <div className="flex-1 flex flex-col min-h-0 relative gap-3 animate-in fade-in duration-200">
              
              <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 ${
                isDarkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-3 flex-1 justify-between sm:justify-start">
                  <input 
                    type="text" 
                    placeholder="Search sequences..."
                    value={filterSearchQuery}
                    onChange={(e) => setFilterSearchQuery(e.target.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border outline-none w-full max-w-xs sm:max-w-sm transition-colors ${
                      isDarkMode 
                        ? 'bg-[#080d1a] border-slate-800 text-white focus:border-blue-500' 
                        : 'bg-slate-100 border-slate-202 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                  
                  <button
                    onClick={() => setIsGanttSidebarVisible(!isGanttSidebarVisible)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                      isGanttSidebarVisible 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-slate-200 dark:bg-slate-800 border-blue-600 dark:border-slate-850 text-blue-800 dark:text-blue-400 hover:bg-slate-300'
                    }`}
                    style={{ minWidth: '105px' }}
                  >
                    {isGanttSidebarVisible ? <EyeOff size={14}/> : <Eye size={14}/>}
                    <span>{isGanttSidebarVisible ? 'Hide List' : 'Show List'}</span>
                  </button>
                </div>
                
                <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                  {['ALL', 'PENDING', 'HOLD', 'APPROVED'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setFilterStatusTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                        filterStatusTag === tag
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : (isDarkMode ? 'bg-[#080d1a] border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100')
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* STABILIZING TIMELINE HEADERS UNDER POPUPS (Correcting image_df7cb1.png overlap) */}
              <div className={`flex border rounded-3xl overflow-hidden flex-grow shadow-sm transition-colors ${isDarkMode ? 'bg-[#080d1a] border-slate-800/80' : 'bg-white border-slate-200'}`}>
                
                {isGanttSidebarVisible && (
                  <div className={`flex w-[55%] sm:w-[45%] md:w-[35%] lg:w-[40%] flex-col shrink-0 z-10 border-r relative transition-all duration-300 ${
                    isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-200'
                  }`}>
                    
                    <div className={`h-[48px] min-h-[48px] max-h-[48px] p-2 font-black text-[9px] flex items-center uppercase tracking-widest border-b transition-colors ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800/80 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}>
                      <span className="w-8 text-center font-bold">Ref</span>
                      <span className="flex-grow px-2 truncate font-bold">Description</span>
                      <span className="w-10 text-center shrink-0 font-bold">Days</span>
                    </div>

                    <div 
                      ref={leftScrollRef}
                      onScroll={handleLeftScroll}
                      className="flex-grow overflow-y-auto min-h-0 scrollbar-none"
                    >
                      {filteredTasks.map((task, index) => (
                        <div 
                          key={task.id} 
                          onClick={() => setActiveTaskModal(task.id)}
                          className={`h-[68px] min-h-[68px] max-h-[68px] flex items-center text-xs group transition-all border-b cursor-pointer ${getRowBgColor(task, index)}`}
                        >
                          <div className="w-8 text-center flex items-center justify-center shrink-0 font-bold font-mono text-[10px] text-blue-500">
                            {task.ref}
                          </div>
                          
                          <div className={`flex-grow h-full flex flex-col justify-center px-2 border-l min-w-0 ${isDarkMode ? 'border-slate-800/40' : 'border-slate-202'}`}>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-bold text-[8px] text-blue-400 uppercase tracking-wider block truncate">
                                {task.desc}
                              </span>
                              <span className={`px-1 rounded text-[7px] font-bold uppercase tracking-wider shrink-0 ${getBadgeStyle(task.qaStatus)}`}>
                                {task.qaStatus}
                              </span>
                            </div>
                            <span className="font-extrabold text-[11px] truncate leading-tight mt-0.5 text-slate-100 dark:text-white">
                              {task.task}
                            </span>
                          </div>
                          
                          <div className={`w-10 h-full border-l flex items-center justify-center font-bold text-center shrink-0 font-mono ${isDarkMode ? 'border-slate-800/40' : 'border-slate-202'}`}>
                            {task.duration}d
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="h-[64px] p-2 flex items-center border-t border-slate-800/80 sticky bottom-0 z-20 shrink-0">
                       <button onClick={addTask} className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all px-2 py-2.5 rounded-xl border border-dashed border-slate-800/80 w-full justify-center text-blue-400 hover:text-blue-300">
                         <Plus size={12}/> Add Parameter
                       </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col relative overflow-x-auto scrollbar-thin">
                  
                  {/* ADJUSTED STICKY TIMELINE Z-INDEX to z-10 SO IT RENDERS BELOW HEADER POPUPS */}
                  <div className={`h-[48px] min-h-[48px] max-h-[48px] flex min-w-max sticky top-0 z-10 border-b transition-colors ${
                    isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-slate-100 border-slate-200'
                  }`}
                  style={{ width: `${headerDays.length * 56}px` }}>
                    {headerDays.map(day => {
                      const isWeekendDay = new Date(projectStartDate).getTime() + day * 86400000;
                      const isSatSun = new Date(isWeekendDay).getDay() === 0 || new Date(isWeekendDay).getDay() === 6;
                      return (
                        <div key={day} className={`w-[56px] h-full flex-shrink-0 text-center border-r flex flex-col justify-center transition-colors ${
                          isDarkMode 
                            ? `border-slate-800/40 ${isSatSun ? 'bg-slate-950/40' : ''}` 
                            : `border-slate-200 ${isSatSun ? 'bg-slate-200' : ''}`
                        }`}>
                          <span className="text-[9px] font-bold leading-tight text-slate-300">{generateDateHeaderStr(projectStartDate, day).split(' ')[0]}</span>
                          <span className="text-[8px] font-bold text-slate-500 leading-tight uppercase">{generateDateHeaderStr(projectStartDate, day).split(' ')[1]}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div 
                    ref={rightScrollRef}
                    onScroll={handleRightScroll}
                    className={`flex-grow relative overflow-y-auto overflow-x-hidden scrollbar-none ${
                      isDarkMode ? "gantt-grid-dark" : "gantt-grid-light"
                    }`}
                    style={{ 
                      scrollbarWidth: 'none', 
                      msOverflowStyle: 'none',
                      width: `${headerDays.length * 56}px`
                    }}
                  >
                    {filteredTasks.map((task) => {
                      const conflict = checkAssetConflict(task);
                      return (
                        <div 
                          key={task.id} 
                          className={`h-[68px] min-h-[68px] max-h-[68px] border-b relative flex items-center ${isDarkMode ? 'border-slate-800/40' : 'border-slate-202'}`}
                          style={{ width: `${headerDays.length * 56}px` }}
                        >
                          <div 
                            onClick={() => setActiveTaskModal(task.id)}
                            className={`absolute h-[38px] rounded-xl shadow-lg transition-all flex items-center justify-between overflow-hidden text-xs font-black border cursor-pointer hover:scale-[1.025] hover:shadow-xl z-10 ${
                              conflict 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400 text-white animate-pulse shadow-amber-500/20'
                                : task.qaStatus === 'HOLD' 
                                  ? 'bg-gradient-to-r from-rose-600 to-red-650 border-rose-500 text-white font-black animate-pulse shadow-rose-500/20' 
                                  : task.qaStatus === 'APPROVED' 
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-500 text-white font-black shadow-emerald-500/20' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white font-black shadow-blue-500/20'
                            }`}
                            style={{ left: `${(task.startDays) * 56 + 4}px`, width: `${(task.adjustedDuration * 56) - 8}px` }}
                          >
                            <div className="absolute top-0 left-0 h-full bg-black/15" style={{ width: `${task.progress || 0}%` }} />
                            <span className="truncate px-3 font-black text-[10px] tracking-wide relative z-10 flex items-center gap-2 text-white">
                              <span className="opacity-90">{task.ref}</span>
                              <span className="opacity-100 font-extrabold">{task.task}</span>
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* STABILIZING TIMELINE HISTOGRAM Z-INDEX to z-10 SO IT RENDERS BELOW HEADER POPUPS */}
                  <div className={`h-[120px] border-t flex min-w-max items-end relative sticky bottom-0 z-10 transition-colors ${
                    isDarkMode ? 'bg-[#080d1a] border-slate-800/80' : 'bg-slate-200 border-slate-202'
                  }`}
                  style={{ width: `${headerDays.length * 56}px` }}>
                    {headerDays.map(day => {
                      const dayManpower = activeFlowTasks.reduce((sum, task) => {
                        if (day >= task.startDays && day < task.startDays + task.adjustedDuration) return sum + task.totalManpower;
                        return sum;
                      }, 
                      0);
                      const heightPercentage = (dayManpower / Math.max(maxManpowerVal, 16)) * 60;
                      return (
                        <div key={`hist-${day}`} className={`w-[56px] h-full flex-shrink-0 border-r flex flex-col justify-end items-center pb-4 ${isDarkMode ? 'border-slate-800/40' : 'border-slate-202'}`}>
                          {dayManpower > 0 && (
                            <div 
                              className={`w-4 rounded-t-md transition-all ${dayManpower > 12 ? 'bg-rose-600 shadow-md shadow-rose-500/10' : 'bg-blue-600 shadow-md shadow-blue-500/10'}`}
                              style={{ height: `${Math.max(4, heightPercentage)}%` }}
                            />
                          )}
                          <span className={`text-[9px] font-black font-mono mt-1 ${dayManpower > 12 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {dayManpower > 0 ? dayManpower : '-'}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                </div>

              </div>
            </div>
          )}

          {activePerspective === 'weekly' && (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0 animate-in fade-in duration-200">
              <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div>
                  <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2 text-blue-400">
                    <CalendarDays size={16} /> 7-Day Cross-Project Outlook Forecast
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Aggregates ongoing operational sequences across all active databases matching today's timeline.</p>
                </div>
                
                <div className={`flex items-center gap-1 border p-1 rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                  <button
                    onClick={() => setActiveForecastFilter('this-week')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      activeForecastFilter === 'this-week' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📅 This Week
                  </button>
                  <button
                    onClick={() => setActiveForecastFilter('all-active')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      activeForecastFilter === 'all-active' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ⚠️ Unfinished
                  </button>
                </div>
              </div>

              {thisWeeksForecastList.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-slate-850 text-center">
                  <CalendarDays size={40} className="text-slate-500 mb-2"/>
                  <h4 className="text-xs font-black uppercase text-slate-300">No Operations Scheduled Inside this Forecast cycle</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">Try adding task rows, adjusting base dates, or shifting the timeline offsets.</p>
                </div>
              ) : (
                <div className="flex-grow overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {thisWeeksForecastList.map(item => {
                      const isOverdue = item.absoluteEndDate < new Date() && item.progress < 100;
                      return (
                        <div
                          key={`${item.parentProjectId}-${item.id}`}
                          onClick={() => {
                            if (item.parentProjectId === activeProjectId) {
                              setActiveTaskModal(item.id);
                            } else {
                              handleSwitchProject(item.parentProjectId);
                              setTimeout(() => setActiveTaskModal(item.id), 300);
                            }
                          }}
                          className={`p-5 rounded-2xl border shadow-lg cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between gap-4 ${
                            isDarkMode ? 'bg-[#0f172a] hover:bg-[#1e293b] border-slate-800 hover:border-slate-700 shadow-[#01040a]' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                          }`}
                        >
                          <div>
                            <div className={`flex justify-between items-start gap-2 border-b pb-3 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-202'}`}>
                              <div className="min-w-0 flex-1">
                                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase block truncate">
                                  {item.parentProjectName || "SUBSTATION SCHEDULER"}
                                </span>
                                <h4 className={`text-sm font-extrabold truncate mt-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                  {item.task}
                                </h4>
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-wider ${getBadgeStyle(item.qaStatus)}`}>
                                {item.qaStatus}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5 mt-4">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="flex items-center gap-1 uppercase tracking-wider text-slate-400 font-bold"><Clock size={11}/> DATES</span>
                                <span className="font-mono text-slate-200 dark:text-slate-200 font-extrabold bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/40">
                                  {item.absoluteStartDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - {item.absoluteEndDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="flex items-center gap-1 uppercase tracking-wider text-slate-400 font-bold"><Truck size={11}/> ALLOCATED ASSET</span>
                                <span className="font-extrabold text-blue-400">{item.assignedAsset || 'None'}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="flex items-center gap-1 uppercase tracking-wider text-slate-400 font-bold"><Users size={11}/> WORKFORCE LOADING</span>
                                <span className="font-extrabold text-slate-300">{item.totalManpower || 0} Workers</span>
                              </div>
                            </div>
                          </div>

                          <div className={`space-y-1.5 pt-4 border-t ${isDarkMode ? 'border-slate-800/80' : 'border-slate-202'}`}>
                            <div className="flex justify-between text-[9px] font-black tracking-widest text-slate-400">
                              <span>PROGRESS COMPLETE</span>
                              <span className="text-slate-200">{item.progress || 0}%</span>
                            </div>
                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                              <div className="h-full bg-blue-500 rounded-full" style={{width: `${item.progress || 0}%`}}></div>
                            </div>
                          </div>

                          {isOverdue && (
                            <div className="mt-1 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-450 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                              <AlertTriangle size={12} />
                              <span>OVERDUE BY COMPLIANCE BUFFER LIMITS</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activePerspective === 'qa' && (
            <div className="flex-grow flex flex-col gap-4 overflow-hidden min-h-0 animate-in fade-in duration-200">
              <div className={`p-5 rounded-3xl border flex items-center justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-sm font-black tracking-widest uppercase text-emerald-450 flex items-center gap-1.5">
                    <ShieldCheck size={16}/> Engineering Compliance Inspection Ledger
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Audit-ready verification list of all critical sequence hold points and requirements.</p>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto space-y-2">
                {activeFlowTasks.map(task => (
                  <div 
                    key={`qa-${task.id}`}
                    onClick={() => setActiveTaskModal(task.id)}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isDarkMode ? 'bg-[#0f172a]/80 hover:bg-[#1e293b] border-slate-800/80 text-slate-200' : 'bg-white border-slate-202 hover:border-slate-300 hover:shadow-sm text-slate-805'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-bold font-mono text-xs text-blue-500">{task.ref}</span>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">{task.desc}</span>
                        <span className={`font-extrabold text-sm block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{task.task}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-505 hidden sm:inline">{Object.keys(task.checklist || {}).length} Parameters</span>
                      <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${getBadgeStyle(task.qaStatus)}`}>
                        {task.qaStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePerspective === 'logistics' && (
            <div className="flex-grow flex flex-col gap-4 overflow-hidden min-h-0 animate-in fade-in duration-200">
              <div className={`p-5 rounded-3xl border flex items-center justify-between ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div>
                  <h3 className="text-sm font-black tracking-widest uppercase text-purple-400 flex items-center gap-1.5">
                    <Truck size={16}/> Heavy Rig & Logistics Equipment Pool
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Configure site machinery, mobilization buffers, and check overlapping booking clashes.</p>
                </div>
                <button
                  onClick={() => setIsAssetModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14}/> Add Asset
                </button>
              </div>

              <div className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customAssets.map(asset => {
                    const isAllocated = activeFlowTasks.filter(t => t.assignedAsset === asset.key);
                    return (
                      <div key={asset.key} className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                        isDarkMode ? 'bg-[#0f172a] border-slate-800/80' : 'bg-white border-slate-202'
                      }`}>
                        <div className="flex items-center gap-3 justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-805 shrink-0">
                              {renderAssetIcon(asset.key)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-mono text-xs font-bold text-blue-400 block">{asset.key}</span>
                              <span className="text-xs font-black truncate block">{asset.label}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveCustomAsset(asset.key)}
                            className="p-1 text-slate-500 hover:text-rose-500 rounded-lg shrink-0 transition-all"
                          >
                            <Trash2 size={13}/>
                          </button>
                        </div>

                        <div className={`space-y-1.5 pt-3 border-t text-[10px] text-slate-450 ${isDarkMode ? 'border-slate-805' : 'border-slate-202'}`}>
                          <div className="flex justify-between font-bold">
                            <span>CLASS:</span>
                            <span className="font-black text-slate-300">{asset.type}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>TRANSIT BUFFER:</span>
                            <span className="font-black text-slate-300">{asset.defaultMobilizationDays} Days</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>ACTIVE DISPATCHES:</span>
                            <span className="font-black text-blue-400">{isAllocated.length} Sequences</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {tomorrowAllocations.length > 0 && (
            <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${isDarkMode ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-600 bg-amber-50'}`}>
              <div className="flex items-center gap-3">
                <Clock className="text-amber-500 shrink-0" size={18}/>
                <p className="text-xs text-slate-300 font-bold text-left">
                  Tomorrow's logistical dispatch warnings detected across active schedule plans.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tomorrowAllocations.map(task => (
                  <span key={task.id} className="bg-slate-900 border border-amber-500/30 px-3 py-1 rounded-lg text-[10px] font-black text-amber-400 flex items-center gap-1">
                    {renderAssetIcon(task.assignedAsset)}
                    <span>{task.assignedAsset} dispatch for {task.ref}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {}
      {customConfirmConfig && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className={`rounded-3xl border p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl transition-all ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-2xl' : 'bg-white border-slate-202 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle size={24}/>
              <h4 className="text-sm font-black uppercase tracking-wider">{customConfirmConfig.title}</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{customConfirmConfig.message}</p>
            <div className="flex gap-2.5 justify-end mt-2">
              <button 
                onClick={() => setCustomConfirmConfig(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  isDarkMode ? 'bg-[#080d1a] text-slate-300 border border-slate-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  customConfirmConfig.onConfirm();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-505 text-white rounded-xl text-xs font-bold"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {isAssetModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border flex flex-col max-h-[85vh] transition-all duration-300 ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-900'
          }`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-202 bg-slate-50'}`}>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2"><Truck className="text-blue-500" size={14}/> Logistics Pool Registry</h3>
              </div>
              <button onClick={() => { setIsAssetModalOpen(false); setAssetValidationWarning(''); }} className="p-1 rounded-lg hover:bg-slate-700/40"><X size={14}/></button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-202'} space-y-4`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Asset Code (Unique Key)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CRN50, HVBT1"
                      value={newAssetCode}
                      onChange={(e) => setNewAssetCode(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Asset Label Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 50-Ton Crawler Crane"
                      value={newAssetName}
                      onChange={(e) => setNewAssetName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-202 text-slate-900'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Class</label>
                    <div className="relative">
                      <select 
                        value={newAssetType}
                        onChange={(e) => setNewAssetType(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none cursor-pointer pr-8 ${
                          isDarkMode ? 'bg-[#0f172a] text-white border-slate-800 [&_option]:bg-[#0f172a]' : 'bg-white text-slate-900 border-slate-202 [&_option]:bg-white'
                        }`}
                      >
                        <option value="Heavy Equipment">Heavy Equipment</option>
                        <option value="Specialized Tools">Specialized Tools</option>
                        <option value="Testing Equipment">Testing Equipment</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <ChevronDown size={14}/>
                      </div>
                    </div>
                  </div>
                  
                  {/* UPGRADED DYNAMIC POPULAR PRESET DROPDOWN AS DETAILED IN image_df628c.png */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Preset Design</label>
                    <PremiumAssetPresetSelector 
                      value={newAssetIconPreset}
                      onChange={(val) => setNewAssetIconPreset(val)}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Mob Buffer</label>
                    <input 
                      type="number" min="0" max="7"
                      value={newAssetMobDays}
                      onChange={(e) => setNewAssetMobDays(parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-[#0f172a] text-white border-slate-800' : 'bg-white text-slate-900 border-slate-202'}`}
                    />
                  </div>
                </div>

                {assetValidationWarning && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-650 text-rose-450 text-[10px] font-black">
                    {assetValidationWarning}
                  </div>
                )}

                <button 
                  onClick={handleAddCustomAsset}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Register Custom Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {activeTaskModal && (() => {
        const currentTaskEditing = activeFlowTasks.find(t => t.id === activeTaskModal);
        if (!currentTaskEditing) return null;
        return (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className={`rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border flex flex-col max-h-[90vh] transition-all duration-300 ${
              isDarkMode 
                ? 'bg-[#0f172a] border-slate-800 text-white shadow-[#01040a]' 
                : 'bg-white border-slate-202 text-slate-900'
            }`}>
              
              <div className={`p-5 border-b flex justify-between items-center shrink-0 ${
                isDarkMode 
                  ? 'border-slate-800 bg-[#080d1a]/80' 
                  : 'border-slate-202 bg-slate-50'
              }`}>
                <div className="text-left">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <ClipboardCheck className="text-blue-500" size={16}/> 
                    <span>Site Field Inspector Card</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-white bg-blue-600 border border-blue-500/20 px-2 py-0.5 rounded-lg text-xs font-black tracking-wide">
                      {currentTaskEditing.ref}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {currentTaskEditing.task}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTaskModal(null)} 
                  className={`p-1.5 rounded-full border transition-colors ${
                    isDarkMode ? 'border-slate-800 hover:bg-slate-750 text-slate-400' : 'border-slate-202 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <X size={16}/>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-grow space-y-6">
                
                <div className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#080d1a] border-slate-800/80' : 'bg-slate-50 border-slate-202'
                }`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    Configure Base Days & Percent Complete
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                        DURATION (BASE DAYS)
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          onClick={() => {
                            const val = Math.max(1, currentTaskEditing.duration - 1);
                            updateTask(currentTaskEditing.id, 'duration', val);
                          }}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-lg transition-colors ${
                            isDarkMode 
                              ? 'bg-[#1e293b] border-slate-800 hover:bg-slate-800 text-slate-200' 
                              : 'bg-white border-slate-202 hover:bg-slate-202 text-slate-900'
                          }`}
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-black text-blue-400 px-3 py-1.5 rounded-xl border border-dashed border-slate-800">
                          {currentTaskEditing.duration} Days
                        </span>
                        <button 
                          onClick={() => {
                            const val = currentTaskEditing.duration + 1;
                            updateTask(currentTaskEditing.id, 'duration', val);
                          }}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-lg transition-colors ${
                            isDarkMode 
                              ? 'bg-[#1e293b] border-slate-800 hover:bg-slate-800 text-slate-200' 
                              : 'bg-white border-slate-202 hover:bg-slate-202 text-slate-900'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-wide">
                        <span>PERCENT COMPLETE (%)</span>
                        <span className="font-mono text-blue-400 text-xs">
                          {currentTaskEditing.progress || 0}%
                        </span>
                      </div>
                      <input 
                        type="range" min="0" max="100" 
                        value={currentTaskEditing.progress || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          updateTask(currentTaskEditing.id, 'progress', val);
                          if (val === 100) {
                            logActivityToCloud(`Task sequence: "${currentTaskEditing.task}" fully COMPLETED!`, 'success');
                          }
                        }}
                        className="mt-3.5 w-full cursor-pointer accent-blue-600 bg-slate-800 rounded-lg h-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Co-Sign Inspector Status
                  </h4>
                  <div className={`grid grid-cols-3 gap-2 p-1.5 rounded-2xl border ${
                    isDarkMode ? 'bg-[#080d1a] border-slate-800/80' : 'bg-slate-100 border-slate-202'
                  }`}>
                    {[
                      { status: 'PENDING', label: 'Active Work', desc: 'In development', activeBg: 'bg-blue-600 text-white shadow-lg border-blue-500' },
                      { status: 'HOLD', label: 'QA HOLD', desc: 'Blocked point', activeBg: 'bg-rose-600 text-white shadow-lg border-rose-500 animate-pulse' },
                      { status: 'APPROVED', label: 'APPROVED', desc: 'Inspection approved', activeBg: 'bg-emerald-600 text-white shadow-lg border-emerald-500' }
                    ].map((card) => {
                      const isActive = currentTaskEditing.qaStatus === card.status;
                      return (
                        <div
                          key={card.status}
                          onClick={() => {
                            updateTask(currentTaskEditing.id, 'qaStatus', card.status);
                            logActivityToCloud(`Inspection status changed to ${card.status}`, card.status === 'APPROVED' ? 'success' : card.status === 'HOLD' ? 'alert' : 'info');
                          }}
                          className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                            isActive
                              ? `${card.activeBg}`
                              : isDarkMode 
                                ? 'border-transparent bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/40' 
                                : 'border-transparent bg-transparent text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span className="block font-black text-[10px] uppercase tracking-wider">{card.label}</span>
                          <span className="block text-[8px] opacity-90 mt-0.5 leading-none font-bold">{card.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Shared Asset Allocation
                  </h4>
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    isDarkMode ? 'bg-[#080d1a] border-slate-800/80' : 'bg-slate-50 border-slate-202'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Truck className="text-blue-500" size={18}/>
                      <div className="text-left">
                        <p className="text-xs font-black text-slate-450">Assign Equipment/Specialized Tooling</p>
                      </div>
                    </div>
                    <div className="relative min-w-[200px] w-full sm:w-auto">
                      <select 
                        value={currentTaskEditing.assignedAsset || 'None'}
                        onChange={(e) => updateTask(currentTaskEditing.id, 'assignedAsset', e.target.value)}
                        className={`pl-3 pr-8 py-2 rounded-xl border text-xs font-black outline-none cursor-pointer w-full transition-colors ${
                          isDarkMode 
                            ? 'bg-[#0f172a] text-white border-slate-800 [&_option]:bg-[#0f172a] [&_option]:text-white' 
                            : 'bg-white text-slate-900 border-slate-202 [&_option]:bg-white [&_option]:text-slate-900'
                        }`}
                      >
                        <option value="None">None</option>
                        {customAssets.map(asset => (
                          <option key={asset.key} value={asset.key}>
                            {asset.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <ChevronDown size={14}/>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UPGRADED CHECKLIST COMPLIANCE SECTION WITH INLINE DYNAMIC INPUT (Ref: image_df04e9.png) */}
                <div className={`p-5 rounded-3xl border ${
                  isDarkMode ? 'bg-[#080d1a] border-slate-800/85' : 'bg-slate-55 border-slate-202'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <ListTodo className="text-blue-500" size={14}/> 
                      <span>Engineering Checklist Compliance</span>
                    </h4>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text"
                      placeholder="Add custom engineering compliance item..."
                      value={newChecklistItemText}
                      onChange={(e) => setNewChecklistItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addChecklistItem(currentTaskEditing.id);
                        }
                      }}
                      className={`flex-grow px-3 py-2 border rounded-xl text-xs font-bold outline-none ${
                        isDarkMode 
                          ? 'bg-[#0f172a] border-slate-800 text-white placeholder-slate-600 focus:border-blue-500' 
                          : 'bg-white border-slate-202 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => addChecklistItem(currentTaskEditing.id)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 transition-all"
                    >
                      <Plus size={14}/> Add
                    </button>
                  </div>

                  {Object.keys(currentTaskEditing.checklist || {}).length === 0 ? (
                    <p className="text-xs text-slate-500 italic font-bold text-center py-4">No checklist parameters registered.</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(currentTaskEditing.checklist).map(([name, completed]) => (
                        <div 
                          key={name}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                            completed 
                              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 font-extrabold' 
                              : isDarkMode 
                                ? 'bg-[#0f172a] border-slate-800/80 text-slate-200 hover:bg-slate-800/40' 
                                : 'bg-white border-slate-202 text-slate-805 hover:bg-slate-100'
                          }`}
                        >
                          <div 
                            onClick={() => toggleChecklistItem(currentTaskEditing.id, name)}
                            className="flex items-center gap-3 flex-grow cursor-pointer select-none"
                          >
                            <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all border ${
                              completed 
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/10' 
                                : isDarkMode 
                                  ? 'bg-[#080d1a] border-slate-700' 
                                  : 'bg-slate-100 border-slate-300'
                            }`}>
                              {completed && <Check size={11} strokeWidth={3} />}
                            </div>
                            <span className="font-extrabold tracking-wide">{name}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteChecklistItem(currentTaskEditing.id, name)}
                            className="p-1 text-slate-550 hover:text-rose-550 rounded-lg transition-colors ml-2"
                            title="Remove Parameter"
                          >
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Labor Crew Requirements ({laborProfile.toUpperCase()} Pool)</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeRoles.map(r => {
                      const countVal = parseInt(currentTaskEditing[r.key]);
                      const count = isNaN(countVal) ? 0 : countVal;
                      return (
                        <div key={r.key} className={`flex items-center gap-2 border rounded-xl p-1.5 transition-colors ${count > 0 ? r.bg : (isDarkMode ? 'bg-[#080d1a] border-slate-800/80 text-slate-505' : 'bg-slate-50 border-slate-202 text-slate-400')}`}>
                          <span className="text-xs pl-0.5">{r.icon} <span className="text-[9px] font-bold uppercase ml-0.5">{r.label}</span></span>
                          <div className={`flex items-center rounded-lg border text-slate-800 overflow-hidden shadow-sm ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-202'}`}>
                            <button onClick={() => adjustWorkerCount(currentTaskEditing.id, r.key, -1)} className={`px-1.5 py-0.5 transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100'}`}><Minus size={10}/></button>
                            <span className={`text-[10px] font-bold w-4 text-center ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{count}</span>
                            <button onClick={() => adjustWorkerCount(currentTaskEditing.id, r.key, 1)} className={`px-1.5 py-0.5 transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100'}`}><Plus size={10}/></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className={`space-y-3 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-202'}`}>
                  {activeRoles.filter(r => (parseInt(currentTaskEditing[r.key]) || 0) > 0).map(r => {
                    const inputs = [];
                    const countVal = parseInt(currentTaskEditing[r.key]);
                    const count = isNaN(countVal) ? 0 : countVal;
                    for(let i=0; i<count; i++) {
                      inputs.push(
                        <input 
                          key={i} type="text" value={currentTaskEditing.assigned?.[r.key]?.[i] || ''}
                          onChange={(e) => assignWorkerName(currentTaskEditing.id, r.key, i, e.target.value)}
                          placeholder={`Enter name for ${r.fullName} #${i+1}...`}
                          className={`px-3 py-2 border rounded-xl text-xs font-semibold w-full outline-none ${
                            isDarkMode ? 'bg-[#080d1a] border-slate-800 text-white placeholder-slate-600' : 'bg-slate-55 border-slate-202 text-slate-800 placeholder-slate-400'
                          }`}
                        />
                      );
                    }
                    return (
                      <div key={r.key} className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider text-left block">{r.fullName} Name Log</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{inputs}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                  <button 
                    onClick={() => triggerTaskRemove(currentTaskEditing.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600/10 hover:bg-rose-650/20 text-rose-450 rounded-xl text-xs font-bold transition-all"
                  >
                    <Trash2 size={13}/>
                    <span>Delete Sequence</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#0f172a] text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-202'}`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-202'}`}>
              <span className="font-bold flex items-center gap-2"><Settings size={14}/> Settings</span>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-lg hover:bg-slate-700/40"><X size={14}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Left Contractor Logo</label>
                <label className="cursor-pointer border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-1">
                  <UploadCloud className="text-blue-500" size={20}/>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('left', e)} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNotificationPaneOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex justify-end">
          <div className={`w-full max-w-sm h-full p-6 flex flex-col justify-between border-l shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white text-slate-900 border-slate-202'}`}>
            <div className="space-y-4 overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3 border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="text-blue-500" size={14}/>
                  <h3 className="text-xs font-black uppercase tracking-wider">Site Activity Stream</h3>
                </div>
                <button onClick={() => setIsNotificationPaneOpen(false)} className="p-1 rounded-md hover:bg-slate-700/40">
                  <X size={14}/>
                </button>
              </div>

              <div className="space-y-2 animate-fade-in">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-3 rounded-xl border text-xs font-bold ${isDarkMode ? 'bg-slate-950/45 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-202 text-slate-805'}`}>
                    <span className="font-bold block">{notif.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-202'}`}>
            <div className="p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Create New Project</h3>
              <input 
                type="text"
                placeholder="e.g. Pagbilao Phase 3B Splicing"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-xs font-bold outline-none mb-4 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-202 text-slate-900'
                }`}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowCreateProjectModal(false)} className="px-4 py-2 text-slate-500 font-bold text-xs">Cancel</button>
                <button onClick={handleCreateNewProject} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase rounded-xl shadow-sm">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}