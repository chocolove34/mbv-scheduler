import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  CalendarDays, Settings, X, Plus, Trash2, 
  CheckCircle2, Share2, GripVertical, UploadCloud, 
  Users, UserPlus, Minus, BarChart3, Info, Loader2, Printer,
  LayoutDashboard, FilePlus2, Clock, ChevronRight, Home, FolderPlus, Sun, Moon,
  AlertTriangle, Eye, ArrowRight, ClipboardCheck, ChevronDown, ChevronUp, Folder,
  CloudLightning, Droplets, ShieldCheck, ListTodo, HelpCircle, Truck, Bell, Wrench,
  Menu, MessageSquareShare, Volume2, VolumeX, Sparkles, FileText, Settings2, Hammer,
  SlidersHorizontal, EyeOff, Check, Calendar, Trash, ChevronLeft
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
        authDomain: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "",
        projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "",
        storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: import.meta.env?.VITE_FIREBASE_APP_ID || ""
      };
  }
} catch (e) {
  // Silent fallback for compilation sandbox
}

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
const app = isFirebaseConfigured ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mbv-scheduler-v1';

const CiticoreLogo = ({ isDarkMode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-9 w-auto">
    <path d="M15 10 L25 22 L15 34 L20 34 L30 22 L20 10 Z" fill="#2563eb" />
    <path d="M22 10 L32 22 L22 34 L27 34 L37 22 L27 10 Z" fill="#0891b2" />
    <text x="50" y="24" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="14" fill={isDarkMode ? "#60a5fa" : "#1e3a8a"} letterSpacing="-0.03em">CITICORE</text>
    <text x="50" y="34" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="7" fill={isDarkMode ? "#94a3b8" : "#334155"} letterSpacing="0.1em">CONSTRUCTION</text>
  </svg>
);

const MbvLogo = ({ isDarkMode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-9 w-auto">
    <rect x="10" y="5" width="35" height="35" rx="8" fill="#1e293b" stroke="#2563eb" strokeWidth="2" />
    <path d="M27 10 L19 23 L26 23 L23 33 L32 19 L25 19 Z" fill="#06b6d4" />
    <text x="55" y="24" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="14" fill="#2563eb" letterSpacing="-0.03em">MBV ELECTRIC</text>
    <text x="55" y="34" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="7" fill={isDarkMode ? "#818cf8" : "#4338ca"} letterSpacing="0.1em">POWER SYSTEM</text>
  </svg>
);

const AssetIcons = {
  None: () => (
    <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
    </svg>
  ),
  heavy: () => (
    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 13.5v6H5v-6m14 0V9a2 2 0 00-2-2h-3m5 6.5H14m0 0V7m0 0h-4m0 0a2 2 0 00-2 2v4.5H5" />
      <circle cx="8" cy="19" r="2.5" />
      <circle cx="16" cy="19" r="2.5" />
    </svg>
  ),
  case: () => (
    <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M12 11v4M9 13h6" />
    </svg>
  ),
  lightning: () => (
    <svg className="w-4 h-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  tester: () => (
    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  ),
  crane: () => (
    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V8l7-4M12 8h9M12 8l4 6" />
      <circle cx="12" cy="17" r="2" />
    </svg>
  )
};

const LOGISTICAL_ASSET_PRESETS = [
  { key: 'heavy', label: 'Heavy Rig / Transport', emoji: '🚚', desc: 'Transformers & bulk MV machinery hauls' },
  { key: 'crane', label: 'Heavy Lift Crane', emoji: '🏗️', desc: 'Structural bays, towers and steelworks positioning' },
  { key: 'heavy_excavator', label: 'Excavator / earth trencher', emoji: '🚜', desc: 'Duct banks, cable trenches and mesh digging' },
  { key: 'case', label: 'Precision Calibration Suite', emoji: '🧳', desc: 'Relay protection and voltage check instruments' },
  { key: 'lightning', label: 'Substation Transformer Terminal', emoji: '⚡', desc: 'Power switchgear terminals & line alignment' },
  { key: 'tester', label: 'Primary Injection Tester', emoji: '📊', desc: 'Insulation monitoring and loop check tester' },
  { key: 'pickup', label: 'Crew Utility Dispatch', emoji: '🛻', desc: 'Field teams transport and safety patrols' },
  { key: 'splicer', label: 'Optical Fiber Splicer', emoji: '🔌', desc: 'RTU control panel & SCADA telemetry link' }
];

const DEFAULT_SHARED_ASSETS = [
  { key: 'PC135', label: 'PC135 Excavator', iconPreset: 'heavy', type: 'Heavy Equipment', defaultMobilizationDays: 1 },
  { key: 'MVK01', label: 'MV Calibration Kit #1', iconPreset: 'case', type: 'Specialized Tools', defaultMobilizationDays: 0 },
  { key: 'FSA22', label: 'Fusion Splicer Alpha', iconPreset: 'lightning', type: 'Specialized Tools', defaultMobilizationDays: 0 },
  { key: 'PIT99', label: 'Primary Injection Tester', iconPreset: 'tester', type: 'Testing Equipment', defaultMobilizationDays: 1 }
];

const LABOR_PROFILES = {
  civil: [
    { key: 'pm', label: 'PM', fullName: 'Project Manager', bg: 'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-900/30 dark:border-blue-500/25 dark:text-blue-300', icon: '👔' },
    { key: 'se', label: 'SE', fullName: 'Site Engineer', bg: 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-900/30 dark:border-amber-500/25 dark:text-amber-300', icon: '📐' },
    { key: 'so', label: 'SO', fullName: 'Safety Officer', bg: 'bg-emerald-100 border-emerald-400 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-500/25 dark:text-emerald-300', icon: '🛡️' },
    { key: 'st', label: 'ST', fullName: 'Steelman', bg: 'bg-slate-200 border-slate-400 text-slate-900 dark:bg-slate-800 dark:border-slate-700/55 dark:text-slate-200', icon: '⛓️' },
    { key: 'cp', label: 'CP', fullName: 'Carpenter', bg: 'bg-yellow-100 border-yellow-400 text-yellow-900 dark:bg-yellow-900/30 dark:border-yellow-500/25 dark:text-yellow-300', icon: '🪚' },
    { key: 'ms', label: 'MS', fullName: 'Mason', bg: 'bg-rose-100 border-rose-400 text-rose-900 dark:bg-rose-900/30 dark:border-rose-500/25 dark:text-rose-300', icon: '🧱' },
    { key: 'hl', label: 'HL', fullName: 'Helper', bg: 'bg-teal-100 border-teal-400 text-teal-900 dark:bg-teal-900/30 dark:border-teal-500/25 dark:text-teal-300', icon: '🧹' }
  ],
  electrical: [
    { key: 'pm', label: 'PM', fullName: 'Project Manager', bg: 'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-900/30 dark:border-blue-500/25 dark:text-blue-300', icon: '👔' },
    { key: 'ee', label: 'EE', fullName: 'Electrical Engineer', bg: 'bg-purple-100 border-purple-400 text-purple-900 dark:bg-purple-900/30 dark:border-purple-500/25 dark:text-purple-300', icon: '⚡' },
    { key: 'so', label: 'SO', fullName: 'Safety Officer', bg: 'bg-emerald-100 border-emerald-400 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-500/25 dark:text-emerald-300', icon: '🛡️' },
    { key: 'el', label: 'EL', fullName: 'Electrician', bg: 'bg-indigo-100 border-indigo-400 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-500/25 dark:text-indigo-300', icon: '🔌' },
    { key: 'lm', label: 'LM', fullName: 'Lineman', bg: 'bg-cyan-100 border-cyan-400 text-cyan-900 dark:bg-cyan-900/30 dark:border-cyan-500/25 dark:text-cyan-300', icon: '🧗' },
    { key: 'cs', label: 'CS', fullName: 'Cable Splicer', bg: 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-900/30 dark:border-amber-500/25 dark:text-amber-300', icon: '🪓' },
    { key: 'hl', label: 'HL', fullName: 'Helper', bg: 'bg-teal-100 border-teal-400 text-teal-900 dark:bg-teal-900/30 dark:border-teal-500/25 dark:text-teal-300', icon: '🧹' }
  ]
};

const INITIAL_TASKS = [
  { id: 'T1', ref: '1.0', desc: 'Pre-Construction', task: 'Permit Processing & Mobilization', duration: 2, progress: 100, pm: 1, se: 1, ee: 0, so: 1, st: 0, cp: 0, ms: 0, el: 0, lm: 0, cs: 0, hl: 2, assigned: {}, qaStatus: 'APPROVED', checklist: { 'Mobilization Permit': true, 'Office Container Set': true }, assignedAsset: 'None', dailyLabor: [], assetAllocations: [] },
  { id: 'T2', ref: '1.1', desc: 'Technical Survey', task: 'Geo-staking & Trenching Layout', duration: 1, progress: 100, pm: 1, se: 2, ee: 1, so: 1, st: 0, cp: 0, ms: 0, el: 0, lm: 0, cs: 0, hl: 1, assigned: {}, qaStatus: 'APPROVED', checklist: { 'Boundary Markers Laid': true, 'Topographical Crosscheck': true }, assignedAsset: 'None', dailyLabor: [], assetAllocations: [] },
  { id: 'T3', ref: '2.0', desc: 'Civil Works', task: '1.5m Depth Manual Cable Potholing', duration: 3, progress: 80, pm: 0, se: 1, ee: 0, so: 1, st: 0, cp: 0, ms: 0, el: 0, lm: 0, cs: 0, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Utility Clearance Received': true, 'Depth Level Checked': false }, assignedAsset: 'PC135', dailyLabor: [], assetAllocations: [] },
  { id: 'T4', ref: '2.1', desc: 'Electrical Grid', task: 'Substation Ground Mesh Assembly', duration: 2, progress: 40, pm: 0, se: 1, ee: 1, so: 1, st: 0, cp: 1, ms: 0, el: 2, lm: 0, cs: 0, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Excavation Safety Barrier Set': true, 'Mesh Ground resistance logged': false }, assignedAsset: 'None', dailyLabor: [], assetAllocations: [] },
  { id: 'T5', ref: '3.0', desc: 'Substation Pad', task: 'Transformer Pad Rebar & Conduit Setup', duration: 3, progress: 0, pm: 0, se: 1, ee: 1, so: 1, st: 4, cp: 2, ms: 0, el: 2, lm: 0, cs: 0, hl: 2, assigned: {}, qaStatus: 'PENDING', checklist: { 'Rebar Bend Specs OK': false, 'Bedding Compactness Signed': false }, assignedAsset: 'None', dailyLabor: [], assetAllocations: [] },
  { id: 'T6', ref: '3.1', desc: 'Equipment Alignment', task: 'Main Circuit Breaker Structural Alignment', duration: 1, progress: 0, pm: 1, se: 2, ee: 2, so: 1, st: 0, cp: 1, ms: 0, el: 3, lm: 0, cs: 0, hl: 1, assigned: {}, qaStatus: 'HOLD', checklist: { 'Plumbness Signed-Off': false, 'Contact Alignment Check': false }, assignedAsset: 'MVK01', dailyLabor: [], assetAllocations: [] },
  { id: 'T7', ref: '4.0', desc: 'Cable Pulling', task: 'Conduit Placement & Pulling MV Feeders', duration: 2, progress: 0, pm: 0, se: 1, ee: 1, so: 1, st: 2, cp: 2, ms: 4, el: 4, lm: 2, cs: 0, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Formwork Leak Review': false, 'Vibrator Tool Mobilized': false }, assignedAsset: 'None', dailyLabor: [], assetAllocations: [] },
  { id: 'T8', ref: '4.1', desc: 'Curing Period', task: '5-Day Continuous Pad Concrete Wet Curing (Hold)', duration: 5, progress: 0, pm: 0, se: 0, ee: 0, so: 1, st: 0, cp: 0, ms: 1, el: 0, lm: 0, cs: 0, hl: 1, assigned: {}, qaStatus: 'PENDING', checklist: { 'Wet Sack Blanket Placed': false, 'Daily Water Log Checklist': false }, assignedAsset: 'None', dailyLabor: [], assetAllocations: [] },
  { id: 'T9', ref: '5.0', desc: 'Assembly & Splicing', task: 'MV Cable Terminations & Splicing', duration: 3, progress: 0, pm: 1, se: 1, ee: 2, so: 1, st: 2, cp: 2, ms: 0, el: 4, lm: 2, cs: 3, hl: 2, assigned: {}, qaStatus: 'PENDING', checklist: { 'Cable Splicing Certified': false, 'High Potential Test Logged': false }, assignedAsset: 'FSA22', dailyLabor: [], assetAllocations: [] },
  { id: 'T10', ref: '6.0', desc: 'Commissioning', task: 'Substation Transformer Energization & Testing', duration: 2, progress: 0, pm: 1, se: 1, ee: 2, so: 1, st: 0, cp: 0, ms: 0, el: 4, lm: 1, cs: 1, hl: 1, assigned: {}, qaStatus: 'PENDING', checklist: { 'Transformer Insulation Test OK': false, 'Trip Relays Verified': false }, assignedAsset: 'PIT99', dailyLabor: [], assetAllocations: [] },
];

const getDailyLaborForTask = (task, neededLength) => {
  let list = task.dailyLabor ? [...task.dailyLabor] : [];
  while (list.length < neededLength) {
    list.push({
      pm: task.pm !== undefined ? task.pm : 0,
      se: task.se !== undefined ? task.se : 0,
      ee: task.ee !== undefined ? task.ee : 0,
      so: task.so !== undefined ? task.so : 0,
      st: task.st !== undefined ? task.st : 0,
      cp: task.cp !== undefined ? task.cp : 0,
      ms: task.ms !== undefined ? task.ms : 0,
      el: task.el !== undefined ? task.el : 0,
      lm: task.lm !== undefined ? task.lm : 0,
      cs: task.cs !== undefined ? task.cs : 0,
      hl: task.hl !== undefined ? task.hl : 0,
      assigned: task.assigned ? JSON.parse(JSON.stringify(task.assigned)) : {}
    });
  }
  if (list.length > neededLength) {
    list = list.slice(0, neededLength);
  }
  return list;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading');
  
  const [activePerspective, setActivePerspective] = useState('gantt');
  const [isGanttSidebarVisible, setIsGanttSidebarVisible] = useState(true);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isMetadataCollapsed, setIsMetadataCollapsed] = useState(true);

  // New Collapsible UI States (Addresses image_ed1927.png and image_ed190d.png)
  const [isAlertCenterExpanded, setIsAlertCenterExpanded] = useState(false);
  const [isBookToolExpanded, setIsBookToolExpanded] = useState(false);

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

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  
  const [showWeatherDropdown, setShowWeatherDropdown] = useState(false);
  const weatherDropdownRef = useRef(null);

  const [showAssetIconDropdown, setShowAssetIconDropdown] = useState(false);
  const assetDropdownRef = useRef(null);

  const [newChecklistItemText, setNewChecklistItemText] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const [alertCenterAssetFilter, setAlertCenterAssetFilter] = useState('ALL');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    isSyncingLeftScroll.current = true;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [filterStatusTag, setFilterStatusTag] = useState('ALL');

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
      
      const normalizedDailyLabor = getDailyLaborForTask(task, adjustedDuration);
      
      const totalManpowerAcrossDays = normalizedDailyLabor.reduce((accumSum, dailyObj) => {
        const dayTotal = activeRoles.reduce((sum, r) => {
          const val = parseInt(dailyObj[r.key]);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);
        return accumSum + dayTotal;
      }, 0);

      return { 
        ...task, 
        startDays: start, 
        adjustedDuration,
        dailyLabor: normalizedDailyLabor,
        totalManpower: Math.round(totalManpowerAcrossDays / adjustedDuration), 
        progress: task.progress || 0,
        assignedAsset: task.assignedAsset || 'None',
        assetAllocations: task.assetAllocations || []
      };
    });
  }, [tasks, weatherFactor, laborProfile]);

  const activeFlowTasks = flowSchedule();
  const totalDays = activeFlowTasks.reduce((acc, curr) => acc + curr.adjustedDuration, 0) || 1;
  const headerDays = Array.from({ length: totalDays + 3 }, (_, i) => i);

  const compileAllProjectAllocations = useCallback(() => {
    const allocations = [];

    activeFlowTasks.forEach(task => {
      const taskStartOffset = task.startDays;
      const taskDuration = task.adjustedDuration;

      if (task.assetAllocations && task.assetAllocations.length > 0) {
        task.assetAllocations.forEach(alloc => {
          if (alloc.dayOffset < taskDuration) {
            const allocAbsDate = new Date(projectStartDate);
            allocAbsDate.setDate(allocAbsDate.getDate() + taskStartOffset + alloc.dayOffset);
            allocations.push({
              id: alloc.id,
              taskId: task.id,
              taskRef: task.ref,
              taskName: task.task,
              projectId: activeProjectId,
              projectTitle: appTitle,
              assetKey: alloc.assetKey,
              dayOffset: alloc.dayOffset,
              startTime: alloc.startTime || "08:00",
              endTime: alloc.endTime || "17:00",
              absDateStr: allocAbsDate.toISOString().split('T')[0]
            });
          }
        });
      } else if (task.assignedAsset && task.assignedAsset !== 'None') {
        for (let i = 0; i < taskDuration; i++) {
          const allocAbsDate = new Date(projectStartDate);
          allocAbsDate.setDate(allocAbsDate.getDate() + taskStartOffset + i);
          allocations.push({
            id: `${task.id}-fb-${i}`,
            taskId: task.id,
            taskRef: task.ref,
            taskName: task.task,
            projectId: activeProjectId,
            projectTitle: appTitle,
            assetKey: task.assignedAsset,
            dayOffset: i,
            startTime: "00:00",
            endTime: "23:59",
            absDateStr: allocAbsDate.toISOString().split('T')[0]
          });
        }
      }
    });

    allProjectsTasks.forEach(otherTask => {
      if (otherTask.parentProjectId === activeProjectId) return;

      const taskDuration = otherTask.calculatedDuration || otherTask.duration;
      if (otherTask.assetAllocations && otherTask.assetAllocations.length > 0) {
        otherTask.assetAllocations.forEach(alloc => {
          if (alloc.dayOffset < taskDuration) {
            const allocAbsDate = new Date(otherTask.absoluteStartDate || projectStartDate);
            allocAbsDate.setDate(allocAbsDate.getDate() + alloc.dayOffset);
            allocations.push({
              id: alloc.id,
              taskId: otherTask.id,
              taskRef: otherTask.ref,
              taskName: otherTask.task,
              projectId: otherTask.parentProjectId,
              projectTitle: otherTask.parentProjectName || otherTask.parentProjectId,
              assetKey: alloc.assetKey,
              dayOffset: alloc.dayOffset,
              startTime: alloc.startTime || "08:00",
              endTime: alloc.endTime || "17:00",
              absDateStr: allocAbsDate.toISOString().split('T')[0]
            });
          }
        });
      } else if (otherTask.assignedAsset && otherTask.assignedAsset !== 'None') {
        for (let i = 0; i < taskDuration; i++) {
          const allocAbsDate = new Date(otherTask.absoluteStartDate || projectStartDate);
          allocAbsDate.setDate(allocAbsDate.getDate() + i);
          allocations.push({
            id: `${otherTask.id}-fb-${i}`,
            taskId: otherTask.id,
            taskRef: otherTask.ref,
            taskName: otherTask.task,
            projectId: otherTask.parentProjectId,
            projectTitle: otherTask.parentProjectName || otherTask.parentProjectId,
            assetKey: otherTask.assignedAsset,
            dayOffset: i,
            startTime: "00:00",
            endTime: "23:59",
            absDateStr: allocAbsDate.toISOString().split('T')[0]
          });
        }
      }
    });

    return allocations;
  }, [activeFlowTasks, projectStartDate, activeProjectId, appTitle, allProjectsTasks]);

  const allAllocations = compileAllProjectAllocations();

  const checkLogisticalConflictForAllocation = useCallback((alloc) => {
    if (!alloc.assetKey || alloc.assetKey === 'None') return null;

    for (let other of allAllocations) {
      if (other.id === alloc.id || (other.taskId === alloc.taskId && other.projectId === alloc.projectId)) continue;

      if (other.assetKey === alloc.assetKey && other.absDateStr === alloc.absDateStr) {
        const [shA, smA] = alloc.startTime.split(':').map(Number);
        const [ehA, emA] = alloc.endTime.split(':').map(Number);
        const [shB, smB] = other.startTime.split(':').map(Number);
        const [ehB, emB] = other.endTime.split(':').map(Number);

        const valAStart = shA * 60 + smA;
        const valAEnd = ehA * 60 + emA;
        const valBStart = shB * 60 + smB;
        const valBEnd = ehB * 60 + emB;

        if (valAStart < valBEnd && valAEnd > valBStart) {
          const assetName = customAssets.find(a => a.key === alloc.assetKey)?.label || alloc.assetKey;
          return {
            assetName,
            conflictProject: other.projectTitle,
            conflictTaskName: other.taskName,
            conflictTaskRef: other.taskRef,
            conflictTime: `${other.startTime} - ${other.endTime}`,
            date: alloc.absDateStr
          };
        }
      }
    }
    return null;
  }, [allAllocations, customAssets]);

  const checkAssetConflict = (taskToCheck) => {
    const taskAllocs = allAllocations.filter(a => a.taskId === taskToCheck.id && a.projectId === activeProjectId);
    if (taskAllocs.length === 0 && taskToCheck.assignedAsset && taskToCheck.assignedAsset !== 'None') {
      const dummyAlloc = {
        id: `${taskToCheck.id}-fb-check`,
        taskId: taskToCheck.id,
        projectId: activeProjectId,
        assetKey: taskToCheck.assignedAsset,
        absDateStr: projectStartDate, 
        startTime: "00:00",
        endTime: "23:59"
      };
      for (let i = 0; i < taskToCheck.adjustedDuration; i++) {
        const d = new Date(projectStartDate);
        d.setDate(d.getDate() + taskToCheck.startDays + i);
        dummyAlloc.absDateStr = d.toISOString().split('T')[0];
        const conflict = checkLogisticalConflictForAllocation(dummyAlloc);
        if (conflict) return conflict;
      }
    }

    for (let alloc of taskAllocs) {
      const conflict = checkLogisticalConflictForAllocation(alloc);
      if (conflict) return conflict;
    }
    return null;
  };

  useEffect(() => {
    if (!db || !user || !activeProjectId) return;
    if (tasks.length === 0) return;

    const delayDebounceFn = setTimeout(async () => {
      setIsSavingCloud(true);
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeProjectId);
        await setDoc(docRef, {
          tasks,
          customAssets,
          docMetadata,
          projectStartDate,
          appTitle,
          appSubtitle,
          logos,
          weatherFactor,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        setProjectList(prev => {
          const matchedItem = prev.find(p => p.id === activeProjectId);
          if (matchedItem && matchedItem.title === appTitle) return prev;
          const updated = prev.map(p => 
            p.id === activeProjectId ? { ...p, title: appTitle, lastModified: new Date().toISOString() } : p
          );
          localStorage.setItem('mbv_cloud_registry', JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.warn("Automated Cloud Autosave suspended: ", err);
      } finally {
        setIsSavingCloud(false);
      }
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [tasks, customAssets, docMetadata, projectStartDate, appTitle, appSubtitle, logos, weatherFactor, db, user, activeProjectId]);

  const getTodayAllocations = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return allAllocations.filter(a => {
      const assetMatch = alertCenterAssetFilter === 'ALL' || a.assetKey === alertCenterAssetFilter;
      return a.absDateStr === todayStr && assetMatch;
    });
  };

  const getTomorrowAllocations = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomStr = tomorrow.toISOString().split('T')[0];
    return allAllocations.filter(a => {
      const assetMatch = alertCenterAssetFilter === 'ALL' || a.assetKey === alertCenterAssetFilter;
      return a.absDateStr === tomStr && assetMatch;
    });
  };

  const todayAllocations = getTodayAllocations();
  const tomorrowAllocations = getTomorrowAllocations();

  useEffect(() => {
    const activeToday = getTodayAllocations();
    const activeTomorrow = getTomorrowAllocations();
    
    const newAlerts = [];
    activeToday.forEach(alloc => {
      const conflict = checkLogisticalConflictForAllocation(alloc);
      newAlerts.push({
        id: `today-${alloc.id}`,
        type: conflict ? 'alert' : 'success',
        text: conflict 
          ? `⚠️ DISPATCH CLASH TODAY: [${alloc.assetKey}] overlaps in "${alloc.projectTitle}" at ${alloc.startTime}-${alloc.endTime}!` 
          : `⚡ TODAY'S DISPATCH: [${alloc.assetKey}] (${alloc.startTime} - ${alloc.endTime}) is active on "${alloc.taskName}"`,
        time: 'Active Now'
      });
    });
    
    activeTomorrow.forEach(alloc => {
      const conflict = checkLogisticalConflictForAllocation(alloc);
      newAlerts.push({
        id: `tomorrow-${alloc.id}`,
        type: conflict ? 'alert' : 'warning',
        text: conflict 
          ? `🚨 TOMORROW CLASH WARNING: [${alloc.assetKey}] has upcoming overlap for "${alloc.projectTitle}"` 
          : `🚚 TOMORROW'S MOBILIZATION: Prepare [${alloc.assetKey}] for "${alloc.taskName}" (${alloc.startTime} - ${alloc.endTime})`,
        time: 'Upcoming'
      });
    });
    
    if (newAlerts.length > 0) {
      setNotifications(prev => {
        const filtered = prev.filter(n => !n.id.toString().startsWith('today-') && !n.id.toString().startsWith('tomorrow-'));
        return [...newAlerts, ...filtered];
      });
    }
  }, [projectStartDate, tasks, weatherFactor, activeProjectId, alertCenterAssetFilter, allProjectsTasks]);

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
  }, [appTitle, playAlertSound]);

  useEffect(() => {
    localStorage.setItem('mbv_dark_mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProjectDropdownOpen(false);
      }
      if (weatherDropdownRef.current && !weatherDropdownRef.current.contains(event.target)) {
        setShowWeatherDropdown(false);
      }
      if (assetDropdownRef.current && !assetDropdownRef.current.contains(event.target)) {
        setShowAssetIconDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 1024);
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
        setWeatherFactor(payload.weatherFactor || 'sunny');
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
        setWeatherFactor(payload.weatherFactor || 'sunny');
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
    setTasks(INITIAL_TASKS.map(t => ({...t, progress: 0, qaStatus: 'PENDING', assigned: {}, dailyLabor: [], assetAllocations: []})));
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
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    const freshRegistry = projectList.filter(p => p.id !== projectToDelete);
    setProjectList(freshRegistry);
    localStorage.setItem('mbv_cloud_registry', JSON.stringify(freshRegistry));
    
    showToast("Project deleted successfully.");
    setProjectToDelete(null);

    if (activeProjectId === projectToDelete) {
      handleSwitchProject('master-schedule');
    }
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
    const isAssigned = tasks.some(t => t.assignedAsset === assetKey || (t.assetAllocations && t.assetAllocations.some(a => a.assetKey === assetKey)));
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

  const activeRoles = LABOR_PROFILES[laborProfile];

  const maxManpowerVal = Math.max(
    ...headerDays.map(day => 
      activeFlowTasks.reduce((sum, task) => {
        if (day >= task.startDays && day < task.startDays + task.adjustedDuration) {
          const dayIdx = day - task.startDays;
          const currentDayLabor = getDailyLaborForTask(task, task.adjustedDuration)[dayIdx];
          if (currentDayLabor) {
            return sum + activeRoles.reduce((roleSum, role) => {
              const val = parseInt(currentDayLabor[role.key]);
              return roleSum + (isNaN(val) ? 0 : val);
            }, 0);
          }
        }
        return sum;
      }, 0)
    ), 1
  );

  const updateTask = async (id, field, value) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, [field]: value } : t);
    setTasks(updatedTasks);
    
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
      assignedAsset: 'None',
      dailyLabor: [],
      assetAllocations: []
    }];
    setTasks(updatedTasks);
    showToast("New schedule row added.");
    logActivityToCloud("Added a new sequence timeline parameter.", "info");
  };

  const triggerTaskRemove = (id) => {
    const matched = tasks.find(t => t.id === id);
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    showToast("Schedule row removed.");
    if (matched) {
      logActivityToCloud(`Deleted timeline sequence row: ${matched.task}`, 'alert');
    }
  };

  const adjustWorkerCount = (taskId, roleKey, increment, dayIdx) => {
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        const currentAdjustedDuration = Math.max(1, Math.round(t.duration * fetchWeatherDelayMultiplier()));
        const dailyLabor = getDailyLaborForTask(t, currentAdjustedDuration);
        
        const dayObj = { ...dailyLabor[dayIdx] };
        const currentVal = parseInt(dayObj[roleKey]) || 0;
        dayObj[roleKey] = Math.max(0, currentVal + increment);
        
        const newDailyLabor = [...dailyLabor];
        newDailyLabor[dayIdx] = dayObj;
        
        return { ...t, dailyLabor: newDailyLabor };
      }
      return t;
    }));
  };

  const assignWorkerName = (taskId, roleKey, index, name, dayIdx) => {
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        const currentAdjustedDuration = Math.max(1, Math.round(t.duration * fetchWeatherDelayMultiplier()));
        const dailyLabor = getDailyLaborForTask(t, currentAdjustedDuration);
        
        const dayObj = { ...dailyLabor[dayIdx] };
        const newAssigned = { ...(dayObj.assigned || {}) };
        if (!newAssigned[roleKey]) newAssigned[roleKey] = [];
        newAssigned[roleKey][index] = name;
        dayObj.assigned = newAssigned;
        
        const newDailyLabor = [...dailyLabor];
        newDailyLabor[dayIdx] = dayObj;
        
        return { ...t, dailyLabor: newDailyLabor };
      }
      return t;
    }));
  };
  
  const toggleChecklistItem = (taskId, itemName) => {
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === taskId) {
        const currentChecklist = { ...(t.checklist || {}) };
        currentChecklist[itemName] = !currentChecklist[itemName];
        
        const stateStr = currentChecklist[itemName] ? "APPROVED" : "PENDING";
        logActivityToCloud(`Checklist: "${itemName}" marked as ${stateStr}`, 'success');
        
        return { ...t, checklist: currentChecklist };
      }
      return t;
    }));
  };

  const addCustomChecklistItem = (taskId) => {
    if (!newChecklistItemText.trim()) return;
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const currentChecklist = { ...(t.checklist || {}) };
        currentChecklist[newChecklistItemText.trim()] = false;
        logActivityToCloud(`Added customized checklist criteria: "${newChecklistItemText.trim()}"`, 'info');
        return { ...t, checklist: currentChecklist };
      }
      return t;
    }));
    setNewChecklistItemText('');
    showToast("Checklist criteria added!");
  };

  const removeCustomChecklistItem = (taskId, itemName) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const currentChecklist = { ...(t.checklist || {}) };
        delete currentChecklist[itemName];
        logActivityToCloud(`Removed checklist criteria: "${itemName}"`, 'alert');
        return { ...t, checklist: currentChecklist };
      }
      return t;
    }));
    showToast("Checklist criteria removed.");
  };

  const addAssetAllocation = (taskId, assetKey, dayOffset, startTime, endTime) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const currentAllocs = t.assetAllocations ? [...t.assetAllocations] : [];
        const newAlloc = {
          id: `${t.id}-alloc-${Date.now()}`,
          assetKey,
          dayOffset: parseInt(dayOffset) || 0,
          startTime: startTime || "08:00",
          endTime: endTime || "17:00"
        };
        
        const isDuplicate = currentAllocs.some(a => a.assetKey === assetKey && a.dayOffset === newAlloc.dayOffset && a.startTime === newAlloc.startTime);
        if (isDuplicate) {
          showToast("A dispatch matching these values already exists on this sequence.");
          return t;
        }

        const updated = [...currentAllocs, newAlloc];
        showToast("Logistical slot assigned successfully.");
        return { ...t, assetAllocations: updated };
      }
      return t;
    }));
  };

  const removeAssetAllocation = (taskId, allocId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const currentAllocs = t.assetAllocations ? [...t.assetAllocations] : [];
        const updated = currentAllocs.filter(a => a.id !== allocId);
        showToast("Allocation slot removed.");
        return { ...t, assetAllocations: updated };
      }
      return t;
    }));
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
      if (hasConflict) return 'bg-amber-950/40 border-amber-500/30 hover:bg-amber-950/50';
      if (isHold) return 'bg-rose-950/30 border-rose-900/40 hover:bg-rose-950/40';
      if (isApproved) return 'bg-[#152e25] border-emerald-900/40 hover:bg-[#1b3a2e] text-emerald-100';
      return index % 2 === 0 ? 'bg-[#0f172a] border-slate-800 hover:bg-slate-800/30' : 'bg-[#0b0f19] border-slate-800 hover:bg-slate-800/20';
    } else {
      if (hasConflict) return 'bg-amber-100 border-amber-600 hover:bg-amber-150';
      if (isHold) return 'bg-rose-100 border-rose-600 hover:bg-rose-150';
      if (isApproved) return 'bg-emerald-50 border-emerald-500 hover:bg-emerald-100';
      return index % 2 === 0 ? 'bg-white border-slate-300 hover:bg-slate-100' : 'bg-slate-100 border-slate-300 hover:bg-slate-150';
    }
  };

  const getBadgeStyle = (status) => {
    if (status === 'APPROVED') {
      return 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500 font-extrabold';
    }
    if (status === 'HOLD') {
      return 'bg-rose-600 text-white dark:bg-rose-500/20 dark:text-rose-300 border-rose-500 animate-pulse font-black';
    }
    return 'bg-blue-600 text-white dark:bg-blue-500/20 dark:text-blue-300 border-blue-500 font-extrabold';
  };

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

  const renderPremiumCalendar = () => {
    const currentYear = calendarViewDate.getFullYear();
    const currentMonth = calendarViewDate.getMonth();
    
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const daysArray = [];
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= totalDaysInMonth; i++) {
      daysArray.push(i);
    }

    const handleMonthChange = (direction) => {
      setCalendarViewDate(new Date(currentYear, currentMonth + direction, 1));
    };

    const handleSelectDay = (day) => {
      if (!day) return;
      const selectedDate = new Date(currentYear, currentMonth, day);
      const formatted = selectedDate.toISOString().split('T')[0];
      setProjectStartDate(formatted);
      setShowCalendar(false);
      logActivityToCloud(`Base launch target shifted to ${formatted}`, 'info');
    };

    return (
      <div className={`absolute left-0 mt-2 p-4 rounded-3xl shadow-2xl z-50 w-72 border backdrop-blur-xl transition-all ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => handleMonthChange(-1)} 
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-black transition-all"
          >
            ←
          </button>
          <span className="text-xs font-extrabold uppercase tracking-widest">{monthNames[currentMonth]} {currentYear}</span>
          <button 
            onClick={() => handleMonthChange(1)} 
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-black transition-all"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[9px] font-black uppercase text-center mb-2 text-slate-500">
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs">
          {daysArray.map((day, idx) => {
            const isToday = day && new Date(currentYear, currentMonth, day).toISOString().split('T')[0] === projectStartDate;
            return (
              <button
                key={idx}
                disabled={!day}
                onClick={() => handleSelectDay(day)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold transition-all ${
                  !day ? 'opacity-0 pointer-events-none' :
                  isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' :
                  isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    );
  };

  if (view === 'loading') {
    return (
      <div className="h-screen w-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500 h-10 w-10"/>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">Syncing Citicore Mother DB...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#080d1a] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-tap-highlight-color: transparent;
        }

        .overflow-y-auto, .overflow-x-auto {
          -webkit-overflow-scrolling: touch;
        }

        select, input {
          -webkit-appearance: none;
          appearance: none;
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${isDarkMode ? 'rgba(15, 23, 42, 0.3)' : '#cbd5e1'}; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#334155' : '#475569'}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #2563eb; }
        
        .gantt-grid-light {
          background-image: 
            linear-gradient(to right, rgba(148, 163, 184, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.4) 1px, transparent 1px);
          background-size: 56px 100%, 100% 68px;
        }
        
        .gantt-grid-dark {
          background-image: 
            linear-gradient(to right, rgba(71, 85, 105, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(71, 85, 105, 0.5) 1px, transparent 1px);
          background-size: 56px 100%, 100% 68px;
        }

        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          body { background-color: #ffffff !important; color: #000000 !important; }
          header, button, .print\\:hidden { display: none !important; }
          #gantt-export-zone { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
        }
      `}} />

      {/* HEADER SECTION - Fixed z-index & Flex layout */}
      <header className={`border-b z-30 shrink-0 transition-colors relative ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="px-4 py-3 sm:px-6 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative">
          <div className="flex items-center gap-2 sm:gap-3 justify-between md:justify-start z-10">
            <div className="flex items-center gap-2">
              <div className="bg-[#1e293b] p-2 rounded-xl border border-slate-700 text-white shrink-0 shadow-lg">
                <LayoutDashboard size={18} className="text-blue-500"/>
              </div>
              
              <div className="flex flex-col min-w-0" ref={dropdownRef}>
                <div className="relative flex items-center gap-2">
                  <button
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-black select-none ${
                      isDarkMode 
                        ? 'bg-[#131c2e] hover:bg-[#1e293b] text-white border-slate-700' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
                    }`}
                  >
                    <Folder className="text-blue-600 shrink-0" size={13}/>
                    <span className="truncate max-w-[120px] sm:max-w-[220px]">
                      {projectList.find(p => p.id === activeProjectId)?.title || 'Switch Project...'}
                    </span>
                    <ChevronDown className="text-slate-900 dark:text-slate-200 shrink-0" size={12}/>
                  </button>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-xl">
                    {isSavingCloud ? (
                      <span className="flex items-center gap-1.5 text-[10px] text-blue-500 font-extrabold animate-pulse">
                        <Loader2 size={11} className="animate-spin" />
                        <span className="hidden sm:inline">Syncing...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-extrabold">
                        <CloudLightning size={11} className="animate-bounce" />
                        <span className="hidden sm:inline">Live Synced</span>
                      </span>
                    )}
                  </div>

                  {isProjectDropdownOpen && (
                    <div className={`absolute left-0 top-10 w-72 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200 ${
                      isDarkMode ? 'bg-[#131c2e] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                    }`}>
                      <div className="px-3 py-1.5 text-[9px] font-black tracking-widest text-slate-400 border-b border-slate-800 uppercase mb-2">
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
                            className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                              activeProjectId === proj.id 
                                ? 'bg-blue-600/15 text-blue-900 dark:text-blue-400 border border-blue-500 shadow-md' 
                                : (isDarkMode ? 'hover:bg-slate-800/80 text-slate-300 border border-transparent' : 'hover:bg-slate-100 text-slate-800 border border-slate-200')
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Folder className={activeProjectId === proj.id ? 'text-blue-600' : 'text-slate-505'} size={12}/>
                              <span className="truncate">{proj.title}</span>
                            </div>
                            {proj.id !== 'master-schedule' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(proj.id);
                                  setIsProjectDropdownOpen(false);
                                }}
                                className="p-1 text-slate-600 hover:text-rose-600 rounded transition-colors shrink-0"
                              >
                                <Trash2 size={12}/>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-slate-800 mt-2 pt-2">
                        <button 
                          onClick={() => {
                            setShowCreateProjectModal(true);
                            setIsProjectDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all text-[10px] font-black uppercase tracking-wider shadow-md"
                        >
                          <Plus size={12}/> Create New Project
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="relative" ref={weatherDropdownRef}>
                    <button
                      onClick={() => setShowWeatherDropdown(!showWeatherDropdown)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-black ${
                        isDarkMode 
                          ? 'bg-[#131c2e] hover:bg-[#1e293b] text-blue-404 border-slate-700' 
                          : 'bg-slate-100 hover:bg-slate-200 text-blue-800 border-slate-300'
                      }`}
                    >
                      <span>
                        {weatherFactor === 'sunny' ? '☀️ Sunny (Normal)' : weatherFactor === 'heavy_rain' ? '🌧️ Rain Delay' : '🌀 Typhoon Lock'}
                      </span>
                      <ChevronDown size={12} />
                    </button>

                    {showWeatherDropdown && (
                      <div className={`absolute left-0 top-10 w-64 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                        isDarkMode ? 'bg-[#131c2e] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-950'
                      }`}>
                        <div className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 mb-2">
                          Stochastic Weather State
                        </div>
                        {[
                          { key: 'sunny', label: '☀️ Sunny (Normal 1.0x)', desc: 'Optimal progress condition' },
                          { key: 'heavy_rain', label: '🌧️ Rain Delay (+35%)', desc: 'Precipitation buffer multiplier' },
                          { key: 'typhoon', label: '🌀 Typhoon Lock (+80%)', desc: 'Severe weather safety hold' }
                        ].map(weather => (
                          <button
                            key={weather.key}
                            onClick={() => {
                              setWeatherFactor(weather.key);
                              setShowWeatherDropdown(false);
                              logActivityToCloud(`Weather state updated to ${weather.key.toUpperCase()}`, 'warning');
                            }}
                            className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-all ${
                              weatherFactor === weather.key 
                                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' 
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <div>
                              <span className="font-extrabold block">{weather.label}</span>
                              <span className="text-[10px] text-slate-400 block">{weather.desc}</span>
                            </div>
                            {weatherFactor === weather.key && <Check size={14} className="text-blue-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-slate-100 text-slate-900 border-slate-300'}`}
            >
              {isDarkMode ? <Sun size={15}/> : <Moon size={15}/>}
            </button>
          </div>

          {/* Premium Perspectives Dashboard Tab bar (Addresses image_eca7b1.png) */}
          <div className="flex items-center justify-start overflow-x-auto scrollbar-none w-full md:w-auto -mx-4 px-4 md:mx-0 md:px-0 z-10">
            <div className={`flex items-center gap-1.5 border p-1 rounded-2xl whitespace-nowrap shadow-md bg-opacity-90 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              {[
                { id: 'gantt', label: 'GANTT', icon: BarChart3, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20' },
                { id: 'weekly', label: 'OUTLOOK', icon: Clock, color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20' },
                { id: 'qa', label: 'QA', icon: ShieldCheck, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
                { id: 'logistics', label: 'LOGISTICS', icon: Truck, color: 'from-purple-600 to-violet-600', shadow: 'shadow-purple-500/20' }
              ].map(tab => {
                const IconComponent = tab.icon;
                const isSelected = activePerspective === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePerspective(tab.id)}
                    className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 group ${
                      isSelected 
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg ${tab.shadow} scale-[1.03]` 
                        : 'text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <IconComponent size={14} className={`${isSelected ? 'text-white' : 'text-slate-400 group-hover:scale-110 transition-transform'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions Stack - Placed with high z-index to avoid overlay intercept issues */}
          <div className="flex gap-2 shrink-0 justify-end md:justify-start z-20 relative">
            <button 
              onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm transition-all text-xs font-black uppercase tracking-wider ${
                isControlPanelOpen
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : isDarkMode ? 'bg-[#131c2e] border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
              }`}
              title="Site Control Center"
            >
              <SlidersHorizontal size={13}/>
              <span className="hidden sm:inline">Controls</span>
            </button>

            <button 
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                showToast(soundEnabled ? "Audio alerts muted" : "Audio alerts enabled 🔊");
              }} 
              className={`p-2 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-[#131c2e] border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'} ${soundEnabled ? 'text-blue-600' : 'text-slate-500'}`} 
            >
              {soundEnabled ? <Volume2 size={14}/> : <VolumeX size={14}/>}
            </button>

            <button onClick={shareToGroupChat} className={`p-2 rounded-xl transition border shadow-sm relative ${isDarkMode ? 'bg-[#131c2e] border-slate-700 text-blue-400 hover:bg-slate-800' : 'bg-white border-slate-300 text-blue-900 hover:bg-slate-100'}`}>
              <MessageSquareShare size={14}/>
            </button>

            <button onClick={() => setIsNotificationPaneOpen(!isNotificationPaneOpen)} className={`p-2 rounded-xl transition border shadow-sm relative ${isDarkMode ? 'bg-[#131c2e] border-slate-700 text-blue-400 hover:bg-slate-800' : 'bg-white border-slate-300 text-blue-900 hover:bg-slate-100'}`}>
              <Bell size={14}/>
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
            
            {/* Settins gear icon button (Addresses image_ed1923.png click action issue) */}
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className={`p-2 rounded-xl transition border shadow-sm cursor-pointer z-30 hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-[#131c2e] border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'}`}
              title="Interactive Project Settings"
            >
              <Settings size={14} className="animate-spin-slow text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Dynamic drop-down sub-controls */}
        {isControlPanelOpen && (
          <div className={`px-4 py-3 sm:px-6 sm:py-4 border-t flex flex-wrap gap-4 items-center animate-in slide-in-from-top-1 duration-200 ${isDarkMode ? 'bg-[#0b0f19]/90' : 'bg-slate-100/95 border-slate-200'}`}>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Crew Structuring Profile</span>
              <div className={`flex border rounded-xl p-1 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-300'}`}>
                <button 
                  onClick={() => { setLaborProfile('civil'); showToast("Switched to Civil Crew"); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    laborProfile === 'civil' 
                      ? 'bg-amber-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Civil 🏗️
                </button>
                <button 
                  onClick={() => { setLaborProfile('electrical'); showToast("Switched to Electrical Crew ⚡"); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    laborProfile === 'electrical' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Electrical ⚡
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 relative">
              <span className="text-[10px] font-black text-slate-404 uppercase tracking-wider">Base Launch Target</span>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black transition-all ${
                  isDarkMode ? 'bg-[#131c2e] border-slate-707 text-blue-404' : 'bg-white border-slate-300 text-blue-800'
                }`}
              >
                <Calendar size={14} />
                <span>{projectStartDate}</span>
              </button>

              {showCalendar && renderPremiumCalendar()}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-slate-404 uppercase tracking-wider">Document Specs</span>
              <button 
                onClick={() => setIsMetadataCollapsed(!isMetadataCollapsed)}
                className={`px-3 py-2 rounded-xl border text-xs font-black flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-[#131c2e] border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-300 hover:bg-slate-100'
                }`}
              >
                {isMetadataCollapsed ? <ChevronDown size={12}/> : <ChevronUp size={12}/>}
                <span>Header Details</span>
              </button>
            </div>

            <div className="flex gap-2 ml-auto">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-white text-slate-800 border-slate-300 shadow-sm'}`}>
                {isDarkMode ? <Sun size={14}/> : <Moon size={14}/>}
              </button>
              <button onClick={triggerSystemPrint} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Printer size={13}/> Print
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN VIEW AREA */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden p-3 sm:p-6 relative flex flex-col min-h-0">
        <div className="max-w-[1700px] w-full mx-auto flex flex-col gap-4 flex-1 min-h-0">

          {!isMetadataCollapsed && (
            <div id="gantt-export-zone" className={`rounded-2xl border p-4 flex flex-col gap-4 shadow-sm shrink-0 transition-all duration-300 animate-in slide-in-from-top-1 ${
              isDarkMode ? 'bg-[#131c2e] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/4 flex justify-start items-center">
                  {logos.left ? <img src={logos.left} className="h-10 object-contain" alt="Left" /> : <CiticoreLogo isDarkMode={isDarkMode}/>}
                </div>
                <div className="w-full md:w-1/2 text-center flex flex-col">
                  <input 
                    value={docMetadata.projectName} 
                    onChange={(e) => setDocMetadata({...docMetadata, projectName: e.target.value.toUpperCase()})}
                    className={`text-center font-black text-sm tracking-tight bg-transparent uppercase border-b border-transparent focus:border-blue-500 outline-none w-full transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
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

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-black uppercase tracking-wider border-t pt-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex flex-col gap-1 border-r border-slate-400 dark:border-slate-800">
                  <span>Document No:</span>
                  <input value={docMetadata.docNo} onChange={(e) => setDocMetadata({...docMetadata, docNo: e.target.value})} className={`font-mono bg-transparent outline-none w-full font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} />
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-400 dark:border-slate-800 px-1">
                  <span>Revision:</span>
                  <input value={docMetadata.revision} onChange={(e) => setDocMetadata({...docMetadata, revision: e.target.value})} className={`bg-transparent outline-none w-full font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} />
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-400 dark:border-slate-800 px-1">
                  <span>Effective Date:</span>
                  <input value={docMetadata.date} onChange={(e) => setDocMetadata({...docMetadata, date: e.target.value})} className={`bg-transparent outline-none w-full font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} />
                </div>
                <div className="flex flex-col gap-1 pl-1">
                  <span>Base Launch:</span>
                  <span className={`font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{projectStartDate}</span>
                </div>
              </div>
            </div>
          )}

          {activePerspective === 'gantt' && (
            <div className="flex-1 flex flex-col min-h-0 relative gap-3 animate-in fade-in duration-200">
              
              <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 ${
                isDarkMode ? 'bg-[#131c2e]/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-3 flex-1 justify-between sm:justify-start">
                  <input 
                    type="text" 
                    placeholder="Search active project sequences..."
                    value={filterSearchQuery}
                    onChange={(e) => setFilterSearchQuery(e.target.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border outline-none w-full max-w-xs sm:max-w-sm transition-colors ${
                      isDarkMode 
                        ? 'bg-[#0f172a] border-slate-700 text-white focus:border-blue-500' 
                        : 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-600'
                    }`}
                  />
                  
                  <button
                    onClick={() => setIsGanttSidebarVisible(!isGanttSidebarVisible)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                      isGanttSidebarVisible 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-800 dark:text-blue-404 hover:bg-slate-300'
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
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                        filterStatusTag === tag
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : (isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100')
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* TIMELINE GANTT PLOTTER */}
              <div className={`flex border rounded-3xl overflow-hidden flex-grow shadow-sm transition-colors ${isDarkMode ? 'bg-[#131c2e]/10 border-slate-800' : 'bg-white border-slate-200'}`}>
                
                {isGanttSidebarVisible && (
                  <div className={`flex w-[60%] sm:w-[50%] md:w-[40%] lg:w-[45%] flex-col shrink-0 z-10 border-r relative transition-all duration-300 ${
                    isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    
                    <div className={`h-[48px] min-h-[48px] max-h-[48px] p-2 font-black text-[9px] flex items-center uppercase tracking-widest border-b transition-colors ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-800'
                    }`}>
                      <span className="w-8 text-center font-black">Ref</span>
                      <span className="flex-grow px-2 truncate font-black">Work Description</span>
                      <span className="w-10 text-center shrink-0 font-black">Days</span>
                    </div>

                    <div 
                      ref={leftScrollRef}
                      onScroll={handleLeftScroll}
                      className="flex-grow overflow-y-auto min-h-0 scrollbar-none"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {filteredTasks.map((task, index) => (
                        <div 
                          key={task.id} 
                          onClick={() => {
                            setActiveTaskModal(task.id);
                            setSelectedDayIndex(0);
                          }}
                          className={`h-[68px] min-h-[68px] max-h-[68px] flex items-center text-xs group transition-all border-b cursor-pointer ${getRowBgColor(task, index)}`}
                        >
                          <div className="w-8 text-center flex items-center justify-center shrink-0 font-black font-mono text-[10px] text-blue-700 dark:text-blue-400">
                            {task.ref}
                          </div>
                          
                          <div className={`flex-grow h-full flex flex-col justify-center px-3 border-l min-w-0 ${isDarkMode ? 'border-slate-800/40' : 'border-slate-300'}`}>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-black text-[8px] text-blue-700 dark:text-blue-400 uppercase tracking-wider block truncate">
                                {task.desc}
                              </span>
                              <span className={`px-1 rounded text-[7px] font-black uppercase tracking-wider shrink-0 ${getBadgeStyle(task.qaStatus)}`}>
                                {task.qaStatus}
                              </span>
                            </div>
                            <span className={`font-black text-xs truncate leading-tight mt-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                              {task.task}
                            </span>
                          </div>
                          
                          <div className={`w-10 h-full border-l flex items-center justify-center font-black text-center shrink-0 font-mono ${isDarkMode ? 'border-slate-800/40 text-slate-100' : 'border-slate-300 text-slate-800'}`}>
                            {task.duration}d
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="h-[64px] p-2 flex items-center border-t border-slate-300 dark:border-slate-800 sticky bottom-0 z-20 shrink-0">
                       <button onClick={addTask} className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all px-2 py-2.5 rounded-xl border border-dashed border-slate-400 dark:border-slate-700 w-full justify-center text-blue-700 dark:text-blue-400 hover:text-blue-800">
                         <Plus size={12}/> Add Task Parameter
                       </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col relative overflow-x-auto scrollbar-thin z-10">
                  
                  <div className={`h-[48px] min-h-[48px] max-h-[48px] flex min-w-max sticky top-0 z-20 border-b transition-colors ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
                  }`}
                  style={{ width: `${headerDays.length * 56}px` }}>
                    {headerDays.map(day => {
                      const isWeekendDay = new Date(projectStartDate).getTime() + day * 86400000;
                      const isSatSun = new Date(isWeekendDay).getDay() === 0 || new Date(isWeekendDay).getDay() === 6;
                      
                      const currentAbsoluteDate = new Date(projectStartDate);
                      currentAbsoluteDate.setDate(currentAbsoluteDate.getDate() + day);
                      const currentAbsDateStr = currentAbsoluteDate.toISOString().split('T')[0];

                      const activeAllocationsOnDay = allAllocations.filter(a => a.absDateStr === currentAbsDateStr);

                      return (
                        <div key={day} className={`w-[56px] h-full flex-shrink-0 text-center border-r flex flex-col justify-center relative transition-colors ${
                          isDarkMode 
                            ? `border-slate-800/60 ${isSatSun ? 'bg-slate-950/40' : ''}` 
                            : `border-slate-300 ${isSatSun ? 'bg-slate-200' : ''}`
                        }`}>
                          <span className="text-[9px] font-black leading-tight text-slate-800 dark:text-slate-300">{generateDateHeaderStr(projectStartDate, day).split(' ')[0]}</span>
                          <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 leading-tight uppercase">{generateDateHeaderStr(projectStartDate, day).split(' ')[1]}</span>
                          
                          {activeAllocationsOnDay.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 max-w-[48px] overflow-hidden bg-blue-600/25 px-1 py-0.5 rounded-full border border-blue-500/20">
                              {activeAllocationsOnDay.map((alloc, idx) => (
                                <span key={idx} title={`${alloc.assetKey} (${alloc.startTime}-${alloc.endTime})`} className="text-[7.5px] leading-none shrink-0">
                                  {customAssets.find(a => a.key === alloc.assetKey)?.iconPreset === 'case' ? '🧳' : 
                                   customAssets.find(a => a.key === alloc.assetKey)?.iconPreset === 'lightning' ? '⚡' : 
                                   customAssets.find(a => a.key === alloc.assetKey)?.iconPreset === 'tester' ? '📊' : '🚚'}
                                </span>
                              ))}
                            </div>
                          )}
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
                          className={`h-[68px] min-h-[68px] max-h-[68px] border-b relative flex items-center ${isDarkMode ? 'border-slate-800/40' : 'border-slate-300'}`}
                          style={{ width: `${headerDays.length * 56}px` }}
                        >
                          {headerDays.map(day => {
                            const currentAbsoluteDate = new Date(projectStartDate);
                            currentAbsoluteDate.setDate(currentAbsoluteDate.getDate() + day);
                            const currentAbsDateStr = currentAbsoluteDate.toISOString().split('T')[0];

                            const isToolInUseThisDay = allAllocations.some(a => a.taskId === task.id && a.projectId === activeProjectId && a.absDateStr === currentAbsDateStr);
                            if (isToolInUseThisDay) {
                              return (
                                <div 
                                  key={`bg-day-${day}`}
                                  className="absolute top-0 bottom-0 w-[56px] pointer-events-none bg-blue-500/5 border-r border-blue-500/10 dark:bg-blue-400/5 dark:border-blue-400/10"
                                  style={{ left: `${day * 56}px` }}
                                />
                              );
                            }
                            return null;
                          })}

                          <div 
                            onClick={() => {
                              setActiveTaskModal(task.id);
                              setSelectedDayIndex(0);
                            }}
                            className={`absolute h-[38px] rounded-xl shadow-lg transition-all flex items-center justify-between overflow-hidden text-xs font-black border cursor-pointer hover:scale-[1.025] hover:shadow-xl z-10 ${
                              conflict 
                                ? 'from-amber-600 to-amber-700 border-amber-500 text-white shadow-amber-500/10'
                                : task.qaStatus === 'HOLD' 
                                  ? 'from-rose-600 to-rose-700 border-rose-500 text-white animate-pulse shadow-rose-500/10' 
                                  : task.qaStatus === 'APPROVED' 
                                    ? 'from-emerald-600 to-emerald-700 border-emerald-500 text-white shadow-emerald-500/10' 
                                    : 'from-blue-600 to-blue-700 border-blue-500 text-white shadow-blue-500/10'
                            } bg-gradient-to-r`}
                            style={{ left: `${(task.startDays) * 56 + 4}px`, width: `${(task.adjustedDuration * 56) - 8}px` }}
                          >
                            <div className="absolute top-0 left-0 h-full bg-slate-950/20" style={{ width: `${task.progress || 0}%` }} />
                            <span className="truncate px-3 font-black text-[9px] relative z-10 flex items-center gap-1.5 text-white">
                              <span>{task.ref}</span>
                              <span className="opacity-100">{task.task}</span>
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className={`h-[120px] border-t flex min-w-max items-end relative sticky bottom-0 z-20 transition-colors ${
                    isDarkMode ? 'bg-[#0b0f19] border-slate-800' : 'bg-slate-200 border-slate-300'
                  }`}
                  style={{ width: `${headerDays.length * 56}px` }}>
                    {headerDays.map(day => {
                      const dayManpower = activeFlowTasks.reduce((sum, task) => {
                        if (day >= task.startDays && day < task.startDays + task.adjustedDuration) {
                          const dayIdx = day - task.startDays;
                          const currentDayLabor = getDailyLaborForTask(task, task.adjustedDuration)[dayIdx];
                          if (currentDayLabor) {
                            return sum + activeRoles.reduce((roleSum, role) => {
                              const val = parseInt(currentDayLabor[role.key]);
                              return roleSum + (isNaN(val) ? 0 : val);
                            }, 0);
                          }
                        }
                        return sum;
                      }, 0);
                      const heightPercentage = (dayManpower / Math.max(maxManpowerVal, 16)) * 60;
                      return (
                        <div key={`hist-${day}`} className={`w-[56px] h-full flex-shrink-0 border-r flex flex-col justify-end items-center pb-4 ${isDarkMode ? 'border-slate-800/40' : 'border-slate-300'}`}>
                          {dayManpower > 0 && (
                            <div 
                              className={`w-4 rounded-t-md transition-all ${dayManpower > 12 ? 'bg-rose-600 animate-pulse' : 'bg-blue-600'}`}
                              style={{ height: `${Math.max(4, heightPercentage)}%` }}
                            />
                          )}
                          <span className={`text-[9px] font-black font-mono mt-1 ${dayManpower > 12 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-800 dark:text-slate-400'}`}>
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

          {/* ADDITIONAL PERSPECTIVES */}
          {activePerspective === 'weekly' && (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0 animate-in fade-in duration-200">
              <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 ${
                isDarkMode ? 'bg-[#131c2e] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2 text-blue-700 dark:text-blue-404">
                    <CalendarDays size={16} /> 7-Day Cross-Project Outlook Forecast
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Aggregates ongoing operational sequences across all active databases matching today's timeline.</p>
                </div>
                
                <div className={`flex items-center gap-1 border p-1 rounded-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
                  <button
                    onClick={() => setActiveForecastFilter('this-week')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      activeForecastFilter === 'this-week' ? 'bg-blue-600 text-white' : 'text-slate-550 dark:text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📅 This Week
                  </button>
                  <button
                    onClick={() => setActiveForecastFilter('all-active')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      activeForecastFilter === 'all-active' ? 'bg-blue-600 text-white' : 'text-slate-550 dark:text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ⚠️ All Unfinished Tasks
                  </button>
                </div>
              </div>

              {thisWeeksForecastList.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-slate-400 dark:border-slate-800 text-center">
                  <CalendarDays size={40} className="text-slate-500 mb-2"/>
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-400">No Operations Scheduled Inside this Forecast cycle</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">Try adding task rows, adjusting base dates, or shifting the timeline offsets.</p>
                </div>
              ) : (
                <div className="flex-grow overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {thisWeeksForecastList.map(item => {
                      const isOverdue = item.absoluteEndDate < new Date() && item.progress < 100;
                      return (
                        <div
                          key={`${item.parentProjectId}-${item.id}`}
                          onClick={() => {
                            if (item.parentProjectId === activeProjectId) {
                              setActiveTaskModal(item.id);
                              setSelectedDayIndex(0);
                            } else {
                              handleSwitchProject(item.parentProjectId);
                              setTimeout(() => {
                                setActiveTaskModal(item.id);
                                setSelectedDayIndex(0);
                              }, 300);
                            }
                          }}
                          className={`p-6 rounded-3xl border shadow-sm cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between gap-4 ${
                            isDarkMode ? 'bg-[#131c2e] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-300 hover:border-slate-400 shadow-md'
                          }`}
                        >
                          <div>
                            <div className={`flex justify-between items-start gap-2 border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                              <div className="min-w-0 flex-1">
                                <span className="bg-blue-600/15 text-blue-900 dark:text-blue-404 px-2.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase block truncate">
                                  {item.parentProjectName}
                                </span>
                                <h4 className={`text-sm font-black truncate mt-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                  {item.task}
                                </h4>
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-wider ${getBadgeStyle(item.qaStatus)}`}>
                                {item.qaStatus}
                              </span>
                            </div>

                            <div className="space-y-2 mt-4 text-xs font-bold text-slate-400">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="flex items-center gap-1 uppercase tracking-wide text-slate-500"><Clock size={11}/> Dates</span>
                                <span className="font-mono text-slate-800 dark:text-slate-300">
                                  {item.absoluteStartDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - {item.absoluteEndDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="flex items-center gap-1 uppercase tracking-wide text-slate-500"><Truck size={11}/> Primary Asset</span>
                                <span className="font-black text-blue-800 dark:text-blue-404">{item.assignedAsset || 'None'}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="flex items-center gap-1 uppercase tracking-wide text-slate-505"><Users size={11}/> Average Workforce</span>
                                <span className="font-black text-slate-800 dark:text-slate-300">{item.totalManpower || 0} Workers</span>
                              </div>
                            </div>
                          </div>

                          <div className={`space-y-1.5 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-202'}`}>
                            <div className="flex justify-between text-[9px] font-black tracking-widest text-slate-404">
                              <span>PROGRESS COMPLETE</span>
                              <span className="text-slate-850 dark:text-slate-200">{item.progress || 0}%</span>
                            </div>
                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-300'}`}>
                              <div className="h-full bg-blue-600 rounded-full" style={{width: `${item.progress || 0}%`}}></div>
                            </div>
                          </div>

                          {isOverdue && (
                            <div className="mt-1 p-2 bg-rose-500/15 border border-rose-600 rounded-xl text-rose-500 text-[10px] font-black flex items-center gap-1.5 animate-pulse">
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
              <div className={`p-6 rounded-3xl border flex items-center justify-between ${
                isDarkMode ? 'bg-[#131c2e] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-sm font-black tracking-widest uppercase text-emerald-750 dark:text-emerald-404 flex items-center gap-1.5">
                    <ShieldCheck size={16}/> Engineering Compliance Inspection Ledger
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Audit-ready verification list of all critical sequence hold points and requirements.</p>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto space-y-3">
                {activeFlowTasks.map(task => (
                  <div 
                    key={`qa-${task.id}`}
                    onClick={() => {
                      setActiveTaskModal(task.id);
                      setSelectedDayIndex(0);
                    }}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isDarkMode ? 'bg-[#131c2e]/60 border-slate-800 text-slate-200' : 'bg-white border-slate-300 hover:border-slate-500 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-black font-mono text-xs text-blue-600 dark:text-blue-500">{task.ref}</span>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block"> {task.desc}</span>
                        <span className={`font-black text-xs block ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{task.task}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-500 hidden sm:inline">{Object.keys(task.checklist || {}).length} Parameters</span>
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
              <div className={`p-6 rounded-3xl border flex items-center justify-between ${
                isDarkMode ? 'bg-[#131c2e] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-sm font-black tracking-widest uppercase text-purple-800 dark:text-purple-404 flex items-center gap-1.5">
                    <Truck size={16}/> Heavy Rig & Logistics Equipment Pool
                  </h3>
                  <p className="text-xs text-slate-404 mt-1">Configure site machinery, mobilization buffers, and check overlapping booking clashes.</p>
                </div>
                <button
                  onClick={() => setIsAssetModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14}/> Add Asset
                </button>
              </div>

              <div className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customAssets.map(asset => {
                    const isAllocated = allAllocations.filter(a => a.assetKey === asset.key && a.projectId === activeProjectId);
                    return (
                      <div key={asset.key} className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 ${
                        isDarkMode ? 'bg-[#131c2e]/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <div className="flex items-center gap-3 justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shrink-0">
                              {renderAssetIcon(asset.key)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-mono text-xs font-black text-blue-800 dark:text-blue-400 block">{asset.key}</span>
                              <span className="text-xs font-black truncate block">{asset.label}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveCustomAsset(asset.key)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg shrink-0 transition-all"
                          >
                            <Trash2 size={13}/>
                          </button>
                        </div>

                        <div className={`space-y-1.5 pt-3 border-t text-[10px] text-slate-400 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                          <div className="flex justify-between font-bold">
                            <span>CLASS:</span>
                            <span className="font-black text-slate-800 dark:text-slate-300">{asset.type}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>TRANSIT BUFFER:</span>
                            <span className="font-black text-slate-800 dark:text-slate-300">{asset.defaultMobilizationDays} Days</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>DAILY RESERVATIONS (CURRENT WORKSPACE):</span>
                            <span className="font-black text-blue-800 dark:text-blue-404">{isAllocated.length} Slots</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE DISPATCH & MOBILIZATION ALERT CENTER (COLLAPSIBLE / ACCORDION - Addresses image_ed1927.png) */}
          <div className={`rounded-3xl border flex flex-col shadow-lg transition-all duration-300 overflow-hidden relative shrink-0 ${
            isDarkMode ? 'bg-[#131c2e]/90 border-blue-500/20' : 'bg-blue-50 border-blue-200'
          }`}>
            {/* Alert Center Header Strip */}
            <div 
              onClick={() => setIsAlertCenterExpanded(!isAlertCenterExpanded)}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <Bell className={`text-blue-500 shrink-0 ${isAlertCenterExpanded ? 'animate-bounce' : ''}`} size={16}/>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-blue-400 flex items-center gap-2">
                  <span>Live Dispatch & Mobilization Alert Center</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {todayAllocations.length} Active Today
                  </span>
                </h4>
              </div>
              
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                {/* Embedded Select Filter Control */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase hidden sm:inline">Filter Asset:</span>
                  <div className="relative">
                    <select 
                      value={alertCenterAssetFilter} 
                      onChange={(e) => setAlertCenterAssetFilter(e.target.value)}
                      className={`pl-3 pr-8 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none border cursor-pointer ${
                        isDarkMode ? 'bg-[#0f172a] border-slate-700 text-blue-404' : 'bg-white border-slate-300 text-blue-800 shadow-sm'
                      }`}
                    >
                      <option value="ALL">ALL VEHICLES / TOOLS</option>
                      {customAssets.map(a => (
                        <option key={a.key} value={a.key}>{a.key} - {a.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-550">
                      <ChevronDown size={11} />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAlertCenterExpanded(!isAlertCenterExpanded)}
                  className={`p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-400`}
                >
                  {isAlertCenterExpanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                </button>
              </div>
            </div>

            {/* Collapsible Content Area */}
            {isAlertCenterExpanded && (
              <div className="p-5 border-t border-slate-750/10 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-top-1 duration-200">
                <div className="space-y-2.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Active Dispatches Today
                  </span>
                  {todayAllocations.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No tool dispatches scheduled for today.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {todayAllocations.map((alloc, idx) => {
                        const conflict = checkLogisticalConflictForAllocation(alloc);
                        return (
                          <span 
                            key={idx} 
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 ${
                              conflict 
                                ? 'bg-rose-500/10 border border-rose-500 text-rose-500 animate-pulse' 
                                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-850 dark:text-emerald-300'
                            }`}
                          >
                            {renderAssetIcon(alloc.assetKey)}
                            <span>{alloc.assetKey} ({alloc.startTime}-{alloc.endTime}) dispatch for {alloc.taskRef} ({alloc.taskName})</span>
                            {conflict && <AlertTriangle size={11} className="text-rose-500 ml-1" />}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Clock size={11}/> Scheduled Mobilizations Tomorrow
                  </span>
                  {tomorrowAllocations.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No tool dispatches scheduled for tomorrow.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tomorrowAllocations.map((alloc, idx) => {
                        const conflict = checkLogisticalConflictForAllocation(alloc);
                        return (
                          <span 
                            key={idx} 
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5 ${
                              conflict 
                                ? 'bg-rose-500/10 border border-rose-500 text-rose-500' 
                                : 'bg-amber-500/10 border border-amber-500/30 text-amber-850 dark:text-amber-300'
                            }`}
                          >
                            {renderAssetIcon(alloc.assetKey)}
                            <span>{alloc.assetKey} ({alloc.startTime}-{alloc.endTime}) ready for {alloc.taskRef} ({alloc.taskName})</span>
                            {conflict && <AlertTriangle size={11} className="text-rose-500 ml-1" />}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ASSETS / LOGISTICS MODAL */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className={`rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border flex flex-col max-h-[85vh] transition-all duration-300 ${
            isDarkMode ? 'bg-[#131c2e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-100'}`}>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2"><Truck className="text-blue-600" size={14}/> Logistics Pool Registry</h3>
              </div>
              <button onClick={() => { setIsAssetModalOpen(false); setAssetValidationWarning(''); }} className="p-1.5 rounded-lg hover:bg-slate-300"><X size={14}/></button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 scrollbar-thin">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-404 uppercase mb-1">Asset Code (Unique Key)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CRN50, HVBT1"
                      value={newAssetCode}
                      onChange={(e) => setNewAssetCode(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-404 uppercase mb-1">Asset Label Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 50-Ton Crawler Crane"
                      value={newAssetName}
                      onChange={(e) => setNewAssetName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-404 uppercase mb-1">Class</label>
                    <div className="relative">
                      <select 
                        value={newAssetType}
                        onChange={(e) => setNewAssetType(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none cursor-pointer pr-8 ${
                          isDarkMode ? 'bg-[#131c2e] text-white border-slate-700 [&_option]:bg-[#131c2e]' : 'bg-white text-slate-900 border-slate-300 [&_option]:bg-white'
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
                  
                  <div className="relative" ref={assetDropdownRef}>
                    <label className="block text-[9px] font-black text-slate-404 uppercase mb-1">Preset Design</label>
                    <button
                      type="button"
                      onClick={() => setShowAssetIconDropdown(!showAssetIconDropdown)}
                      className={`w-full text-left px-3 py-2 border rounded-xl text-xs font-bold flex items-center justify-between ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <span>
                        {LOGISTICAL_ASSET_PRESETS.find(p => p.key === newAssetIconPreset)?.emoji || '🚚'}{' '}
                        {LOGISTICAL_ASSET_PRESETS.find(p => p.key === newAssetIconPreset)?.label || 'Heavy Rig'}
                      </span>
                      <ChevronDown size={12} />
                    </button>

                    {showAssetIconDropdown && (
                      <div className={`absolute left-0 mt-1 w-72 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in max-h-60 overflow-y-auto ${
                        isDarkMode ? 'bg-[#131c2e] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-900'
                      }`}>
                        {LOGISTICAL_ASSET_PRESETS.map(preset => (
                          <button
                            key={preset.key}
                            type="button"
                            onClick={() => {
                              setNewAssetIconPreset(preset.key);
                              setShowAssetIconDropdown(false);
                            }}
                            className={`w-full text-left p-2 rounded-xl flex items-center gap-3 text-xs transition-all ${
                              newAssetIconPreset === preset.key 
                                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' 
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="text-lg">{preset.emoji}</span>
                            <div className="text-left">
                              <span className="font-extrabold block">{preset.label}</span>
                              <span className="text-[10px] text-slate-404 block">{preset.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-404 uppercase mb-1">Mob Buffer</label>
                    <input 
                      type="number" min="0" max="7"
                      value={newAssetMobDays}
                      onChange={(e) => setNewAssetMobDays(parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-707' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                </div>

                {assetValidationWarning && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-600 text-rose-500 text-[10px] font-black">
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

      {/* DETAILED TASK EDIT & TOOL DISPATCH WORKCARD (Addresses image_ed190d.png) */}
      {activeTaskModal && (() => {
        const currentTaskEditing = activeFlowTasks.find(t => t.id === activeTaskModal);
        if (!currentTaskEditing) return null;
        
        const currentDailyLabor = getDailyLaborForTask(currentTaskEditing, currentTaskEditing.adjustedDuration);
        const dayLaborObj = currentDailyLabor[selectedDayIndex] || currentDailyLabor[0];

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className={`rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border flex flex-col max-h-[92vh] transition-all duration-300 ${
              isDarkMode 
                ? 'bg-[#0f172a]/95 border-slate-800 text-white' 
                : 'bg-white border-slate-300 text-slate-900'
            }`}>
              
              <div className={`p-5 border-b flex justify-between items-center ${
                isDarkMode 
                  ? 'border-slate-800 bg-[#1e293b]/50' 
                  : 'border-slate-200 bg-slate-100'
              }`}>
                <div className="text-left">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <ClipboardCheck className="text-blue-500" size={16}/> 
                    <span>Site Field Inspector Card</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-white bg-blue-600 border border-blue-500 px-2 py-0.5 rounded-lg text-xs font-black tracking-wide">
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
                    isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-300 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <X size={16}/>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-grow space-y-6 scrollbar-thin">
                
                <div className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#111827] border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-slate-800">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Configure Sequence Details
                    </h4>
                    <button 
                      onClick={() => {
                        triggerTaskRemove(currentTaskEditing.id);
                        setActiveTaskModal(null);
                      }}
                      className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>Delete Sequence</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Ref Code</label>
                      <input 
                        type="text" 
                        value={currentTaskEditing.ref || ''} 
                        onChange={(e) => updateTask(currentTaskEditing.id, 'ref', e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-xl text-xs font-bold outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                        }`}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Phase / Description Category</label>
                      <input 
                        type="text" 
                        value={currentTaskEditing.desc || ''} 
                        onChange={(e) => updateTask(currentTaskEditing.id, 'desc', e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-xl text-xs font-bold outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8">
                      <label className="block text-[9px] font-black text-slate-404 uppercase mb-1">Detailed Operational Sequence Title</label>
                      <input 
                        type="text" 
                        value={currentTaskEditing.task || ''} 
                        onChange={(e) => updateTask(currentTaskEditing.id, 'task', e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-xl text-xs font-bold outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-650'
                        }`}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[9px] font-black text-slate-404 uppercase mb-1">Compliance Status</label>
                      <div className="relative">
                        <select 
                          value={currentTaskEditing.qaStatus || 'PENDING'} 
                          onChange={(e) => updateTask(currentTaskEditing.id, 'qaStatus', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none cursor-pointer pr-8 ${
                            isDarkMode 
                              ? 'bg-[#131c2e] text-white border-slate-700 [&_option]:bg-[#131c2e]' 
                              : 'bg-white text-slate-900 border-slate-300 [&_option]:bg-white'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="HOLD">HOLD</option>
                          <option value="APPROVED">APPROVED</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          <ChevronDown size={14}/>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4">
                    <div className="sm:col-span-4">
                      <label className="block text-[9px] font-black text-slate-404 uppercase mb-1">Duration (Baseline Days)</label>
                      <input 
                        type="number" min="1" max="60"
                        value={currentTaskEditing.duration || 1} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          updateTask(currentTaskEditing.id, 'duration', val);
                          setSelectedDayIndex(0);
                        }}
                        className={`w-full px-3 py-1.5 border rounded-xl text-xs font-bold outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                        }`}
                      />
                    </div>
                    <div className="sm:col-span-8">
                      <label className="block text-[9px] font-black text-slate-404 uppercase mb-1">Task Progress ({currentTaskEditing.progress || 0}%)</label>
                      <input 
                        type="range" min="0" max="100" step="5"
                        value={currentTaskEditing.progress || 0}
                        onChange={(e) => updateTask(currentTaskEditing.id, 'progress', parseInt(e.target.value) || 0)}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* GRANULAR DISPATCHES BUILDER (Addresses image_ed190d.png - Collapsible Booking form) */}
                <div className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#111827] border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div 
                    onClick={() => setIsBookToolExpanded(!isBookToolExpanded)}
                    className="flex justify-between items-center cursor-pointer select-none pb-2 border-b dark:border-slate-800 mb-3"
                  >
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Truck size={14} className="text-blue-500" />
                      <span>Granular Tool Dispatches (Day & Time Bookings)</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-black">
                        {currentTaskEditing.assetAllocations?.length || 0} Scheduled
                      </span>
                      {isBookToolExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                    </div>
                  </div>

                  {isBookToolExpanded && (
                    <div className="p-3.5 bg-slate-100 dark:bg-slate-900 border rounded-2xl mb-4 animate-in slide-in-from-top-1 duration-150">
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">Book Shared Tool Slot</span>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        addAssetAllocation(
                          currentTaskEditing.id,
                          formData.get('assetKey'),
                          parseInt(formData.get('dayOffset')),
                          formData.get('startTime'),
                          formData.get('endTime')
                        );
                      }} className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
                        <div>
                          <label className="block text-[8px] font-black text-slate-400 uppercase mb-1">Active Day</label>
                          <select name="dayOffset" className="w-full text-xs p-1.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 cursor-pointer">
                            {Array.from({ length: currentTaskEditing.adjustedDuration }).map((_, idx) => (
                              <option key={idx} value={idx}>Day {idx + 1}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-slate-404 uppercase mb-1">Tool / Vehicle</label>
                          <select name="assetKey" className="w-full text-xs p-1.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 cursor-pointer">
                            {customAssets.map(a => (
                              <option key={a.key} value={a.key}>{a.label} ({a.key})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-slate-404 uppercase mb-1">Start Time</label>
                          <input name="startTime" type="time" defaultValue="08:00" className="w-full text-xs p-1 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 font-mono" required />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-slate-404 uppercase mb-1">End Time</label>
                          <input name="endTime" type="time" defaultValue="17:00" className="w-full text-xs p-1.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 font-mono" required />
                        </div>
                        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                          Add dispatch
                        </button>
                      </form>
                    </div>
                  )}

                  {/* RESERVATIONS OVERLAPPING CLASH LIST */}
                  <div className="space-y-1.5">
                    {allAllocations.filter(a => a.taskId === currentTaskEditing.id && a.projectId === activeProjectId).map((alloc, i) => {
                      const conflict = checkLogisticalConflictForAllocation(alloc);
                      return (
                        <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                          conflict 
                            ? 'bg-rose-500/10 border-rose-500 animate-pulse text-rose-800 dark:text-rose-300' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                        }`}>
                          <div className="flex items-center gap-2">
                            {renderAssetIcon(alloc.assetKey)}
                            <span>Day {alloc.dayOffset + 1} - <span className="font-mono text-blue-600 dark:text-blue-400">[{alloc.assetKey}]</span> from {alloc.startTime} to {alloc.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {conflict && (
                              <span className="text-[8px] font-black uppercase tracking-wider bg-rose-500 text-white px-1.5 py-0.5 rounded animate-bounce" title={`Overlaps with project "${conflict.conflictProject}" task "${conflict.conflictTaskName}"`}>
                                Overlap CLASH
                              </span>
                            )}
                            <button 
                              type="button" 
                              onClick={() => removeAssetAllocation(currentTaskEditing.id, alloc.id)} 
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* INSPECTION CHECKLIST CODES */}
                <div className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#111827] border-slate-800/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-slate-800">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-blue-500" />
                      <span>Engineering Checklist Compliance Gates</span>
                    </h4>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add compliance criteria option..."
                      value={newChecklistItemText}
                      onChange={(e) => setNewChecklistItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomChecklistItem(currentTaskEditing.id);
                        }
                      }}
                      className={`flex-grow px-3 py-2 border rounded-xl text-xs font-semibold outline-none ${
                        isDarkMode 
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' 
                          : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-inner'
                      }`}
                    />
                    <button 
                      type="button"
                      onClick={() => addCustomChecklistItem(currentTaskEditing.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow"
                    >
                      <Plus size={14}/> Add Option
                    </button>
                  </div>

                  <div className="space-y-2 mt-4">
                    {Object.entries(currentTaskEditing.checklist || {}).map(([name, checked]) => (
                      <label 
                        key={name} 
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                          checked 
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300' 
                            : isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-[#1e293b]' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={checked} 
                            onChange={() => toggleChecklistItem(currentTaskEditing.id, name)}
                            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold leading-none">{name}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeCustomChecklistItem(currentTaskEditing.id, name);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>

                {/* MANPOWER CONFIGS */}
                <div className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#111827] border-slate-800/80' : 'bg-slate-50 border-slate-202'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-404">
                      Day-by-Day Manpower Allocations
                    </h4>
                    <span className="text-[10px] bg-blue-500/10 text-blue-404 px-2 py-0.5 rounded-lg border border-blue-500/20 font-mono">
                      Active: Day {selectedDayIndex + 1} of {currentTaskEditing.adjustedDuration}
                    </span>
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
                    {Array.from({ length: currentTaskEditing.adjustedDuration }).map((_, idx) => {
                      const dailyRolesObj = currentDailyLabor[idx] || {};
                      const dayCrewCount = activeRoles.reduce((sum, role) => {
                        const val = parseInt(dailyRolesObj[role.key]);
                        return sum + (isNaN(val) ? 0 : val);
                      }, 0);

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedDayIndex(idx)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border shrink-0 flex flex-col items-center gap-1 min-w-[70px] ${
                            selectedDayIndex === idx
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10'
                              : isDarkMode 
                                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' 
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>Day {idx + 1}</span>
                          <span className={`text-[9px] font-mono px-1 rounded ${selectedDayIndex === idx ? 'bg-blue-705 text-white' : 'bg-slate-800 text-slate-300'}`}>
                            {dayCrewCount} Pax
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 space-y-5">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-404">
                      Labor Crew Requirements (Day {selectedDayIndex + 1})
                    </h5>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {activeRoles.map(role => {
                        const count = parseInt(dayLaborObj[role.key]) || 0;
                        return (
                          <div key={role.key} className={`p-3 rounded-xl border flex flex-col justify-between ${
                            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <div className="flex justify-between items-center">
                              <span className="text-xs">{role.icon} {role.label}</span>
                              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                                {count}
                              </span>
                            </div>
                            <div className="flex gap-1 mt-2.5">
                              <button 
                                type="button"
                                onClick={() => adjustWorkerCount(currentTaskEditing.id, role.key, -1, selectedDayIndex)}
                                className="flex-1 bg-slate-800 text-white hover:bg-slate-700 py-1 rounded-lg text-xs font-bold"
                              >
                                -
                              </button>
                              <button 
                                type="button"
                                onClick={() => adjustWorkerCount(currentTaskEditing.id, role.key, 1, selectedDayIndex)}
                                className="flex-1 bg-blue-600 text-white hover:bg-blue-500 py-1 rounded-lg text-xs font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Field Identity Logs (Day {selectedDayIndex + 1})
                      </h5>
                      <div className="space-y-3">
                        {activeRoles.map(role => {
                          const limitCount = parseInt(dayLaborObj[role.key]) || 0;
                          if (limitCount === 0) return null;
                          return (
                            <div key={`names-${role.key}`} className="space-y-1.5">
                              <span className="text-[9px] font-black text-slate-404 uppercase tracking-widest block">
                                {role.icon} {role.fullName} Identity logs
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Array.from({ length: limitCount }).map((_, workerIdx) => {
                                  const nameVal = (dayLaborObj.assigned?.[role.key]?.[workerIdx]) || '';
                                  return (
                                    <input
                                      key={`${role.key}-${workerIdx}`}
                                      type="text"
                                      placeholder={`Enter name for ${role.fullName} #${workerIdx + 1}...`}
                                      value={nameVal}
                                      onChange={(e) => assignWorkerName(currentTaskEditing.id, role.key, workerIdx, e.target.value, selectedDayIndex)}
                                      className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold outline-none ${
                                        isDarkMode 
                                          ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' 
                                          : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-inner'
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* CREATE SUB-PROJECT DIALOG */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border p-5 ${
            isDarkMode ? 'bg-[#131c2e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <h3 className="text-xs font-black uppercase tracking-wider mb-4">Initialize Sub-Project Workspace</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-404 uppercase mb-1">Workspace/Substation Title Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Quezon Substation Phase 3B"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowCreateProjectModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateNewProject}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE SYSTEM SETTINGS MODAL (Addresses Settings Click Action) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className={`rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border p-6 ${
            isDarkMode ? 'bg-[#131c2e] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex justify-between items-center mb-6 pb-2 border-b dark:border-slate-800">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-404">
                <Settings className="animate-spin-slow" size={18} />
                <h3 className="text-sm font-black uppercase tracking-widest">Interactive Project Settings</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Citicore System Workspace Title</label>
                <input 
                  type="text" 
                  value={appTitle} 
                  onChange={(e) => setAppTitle(e.target.value)} 
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-404 mb-1">Citicore Substation Subtitle</label>
                <input 
                  type="text" 
                  value={appSubtitle} 
                  onChange={(e) => setAppSubtitle(e.target.value)} 
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t dark:border-slate-800">
                <div>
                  <span className="block text-[10px] font-black uppercase text-slate-404 mb-1">Color Palette Mode</span>
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-bold ${
                      isDarkMode ? 'bg-slate-900 border-slate-707 text-white' : 'bg-slate-100 border-slate-300 text-slate-900 shadow-sm'
                    }`}
                  >
                    {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
                    <span>{isDarkMode ? "Light Theme" : "Dark Theme"}</span>
                  </button>
                </div>

                <div>
                  <span className="block text-[10px] font-black uppercase text-slate-404 mb-1">Audio Warning Synth</span>
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-bold ${
                      soundEnabled ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>{soundEnabled ? "Enabled" : "Muted"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t dark:border-slate-800 flex gap-2">
                <button 
                  onClick={() => {
                    setTasks(INITIAL_TASKS);
                    setCustomAssets(DEFAULT_SHARED_ASSETS);
                    setProjectStartDate(new Date().toISOString().split('T')[0]);
                    showToast("Database reset to factory default parameters.");
                  }}
                  className="px-4 py-2 bg-rose-605/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-rose-500/20"
                >
                  Reset Data
                </button>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="ml-auto px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE PROJECT DIALOG */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border p-5 ${
            isDarkMode ? 'bg-[#131c2e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-909'
          }`}>
            <h3 className="text-xs font-black uppercase tracking-wider mb-2 text-rose-500">Delete Workspace?</h3>
            <p className="text-xs text-slate-400 mb-4">Are you sure you want to delete this workspace and erase all schedules associated with it? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setProjectToDelete(null)}
                className="flex-1 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteProject}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR COMMUNICATIONS PANE */}
      {isNotificationPaneOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={() => setIsNotificationPaneOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className={`w-screen max-w-md border-l transform transition-all ease-in-out duration-300 ${isDarkMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <div className="h-full flex flex-col py-6 bg-transparent shadow-xl">
                <div className="px-6 flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="text-blue-500" size={18} />
                    <h2 className="text-sm font-black uppercase tracking-widest">Site Communications Log</h2>
                  </div>
                  <button onClick={() => setIsNotificationPaneOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X size={18} />
                  </button>
                </div>
                <div className="relative flex-1 py-6 px-6 overflow-y-auto space-y-3">
                  {notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                      <Bell className="w-10 h-10 text-slate-400 mb-2" />
                      <p className="text-xs font-bold">No active site notifications.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 rounded-2xl border transition-all flex gap-3 ${
                        notif.type === 'alert' ? 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-200 animate-pulse' :
                        notif.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200' :
                        notif.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-200'
                      }`}>
                        <div className="mt-0.5">
                          {notif.type === 'alert' ? <AlertTriangle size={15} className="text-rose-500" /> :
                           notif.type === 'warning' ? <AlertTriangle size={15} className="text-amber-500" /> :
                           notif.type === 'success' ? <CheckCircle2 size={15} className="text-emerald-500" /> :
                           <Info size={15} className="text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold leading-relaxed">{notif.text}</p>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-1">{notif.time}</span>
                        </div>
                        <button 
                          onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))} 
                          className="text-slate-404 hover:text-slate-650"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => { setNotifications([]); showToast("Cleared communications history"); }} 
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-202 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Clear All Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
