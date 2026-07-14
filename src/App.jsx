import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  CalendarDays, Settings, X, Plus, Trash2, 
  CheckCircle2, Share2, GripVertical, UploadCloud, 
  Users, UserPlus, Minus, BarChart3, Info, Loader2, Printer,
  LayoutDashboard, FilePlus2, Clock, ChevronRight, Home, FolderPlus, Sun, Moon,
  AlertTriangle, Eye, ArrowRight, ClipboardCheck, ChevronDown, ChevronUp, Folder,
  CloudLightning, Droplets, ShieldCheck, ListTodo, HelpCircle, Truck, Bell, Wrench,
  Menu, MessageSquareShare, Volume2, VolumeX, Sparkles, FileText, Settings2, Hammer,
  SlidersHorizontal, EyeOff
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
        messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: import.meta.env?.VITE_FIREBASE_APP_ID || ""
      };
  }
} catch (e) {
  // Silent fallback for sandbox compile environments
}

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
const app = isFirebaseConfigured ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mbv-scheduler-v1';

const CiticoreLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-8 w-auto">
    <path d="M15 10 L25 22 L15 34 L20 34 L30 22 L20 10 Z" fill="#3b82f6" />
    <path d="M22 10 L32 22 L22 34 L27 34 L37 22 L27 10 Z" fill="#06b6d4" />
    <text x="50" y="24" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="14" fill="#3b82f6" letterSpacing="-0.03em">CITICORE</text>
    <text x="50" y="34" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="6.5" fill="#64748b" letterSpacing="0.1em">CONSTRUCTION</text>
  </svg>
);

const MbvLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-8 w-auto">
    <rect x="10" y="5" width="35" height="35" rx="8" fill="#131c2e" stroke="#3b82f6" strokeWidth="1.5" />
    <path d="M27 10 L19 23 L26 23 L23 33 L32 19 L25 19 Z" fill="#06b6d4" />
    <text x="55" y="24" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="14" fill="#3b82f6" letterSpacing="-0.03em">MBV ELECTRIC</text>
    <text x="55" y="34" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="6.5" fill="#6366f1" letterSpacing="0.1em">POWER SYSTEM</text>
  </svg>
);

const AssetIcons = {
  None: () => (
    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
    </svg>
  ),
  heavy: () => (
    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 13.5v6H5v-6m14 0V9a2 2 0 00-2-2h-3m5 6.5H14m0 0V7m0 0h-4m0 0a2 2 0 00-2 2v4.5H5" />
      <circle cx="8" cy="19" r="2.5" />
      <circle cx="16" cy="19" r="2.5" />
    </svg>
  ),
  case: () => (
    <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M12 11v4M9 13h6" />
    </svg>
  ),
  lightning: () => (
    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  tester: () => (
    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  ),
  crane: () => (
    <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V8l7-4M12 8h9M12 8l4 6" />
      <circle cx="12" cy="17" r="2" />
    </svg>
  )
};

const DEFAULT_SHARED_ASSETS = [
  { key: 'PC135', label: 'PC135 Excavator', iconPreset: 'heavy', type: 'Heavy Equipment', defaultMobilizationDays: 1 },
  { key: 'MVK01', label: 'MV Calibration Kit #1', iconPreset: 'case', type: 'Specialized Tools', defaultMobilizationDays: 0 },
  { key: 'FSA22', label: 'Fusion Splicer Alpha', iconPreset: 'lightning', type: 'Specialized Tools', defaultMobilizationDays: 0 },
  { key: 'PIT99', label: 'Primary Injection Tester', iconPreset: 'tester', type: 'Testing Equipment', defaultMobilizationDays: 1 }
];

const LABOR_PROFILES = {
  civil: [
    { key: 'pm', label: 'PM', fullName: 'Project Manager', bg: 'bg-blue-900/30 border-blue-500/25 text-blue-300', icon: '👔' },
    { key: 'se', label: 'SE', fullName: 'Site Engineer', bg: 'bg-amber-900/30 border-amber-500/25 text-amber-300', icon: '📐' },
    { key: 'so', label: 'SO', fullName: 'Safety Officer', bg: 'bg-emerald-900/30 border-emerald-500/25 text-emerald-300', icon: '🛡️' },
    { key: 'st', label: 'ST', fullName: 'Steelman', bg: 'bg-slate-800/80 border-slate-700/55 text-slate-200', icon: '⛓️' },
    { key: 'cp', label: 'CP', fullName: 'Carpenter', bg: 'bg-yellow-900/30 border-yellow-500/25 text-yellow-300', icon: '🪚' },
    { key: 'ms', label: 'MS', fullName: 'Mason', bg: 'bg-rose-900/30 border-rose-500/25 text-rose-300', icon: '🧱' },
    { key: 'hl', label: 'HL', fullName: 'Helper', bg: 'bg-teal-900/30 border-teal-500/25 text-teal-300', icon: '🧹' }
  ],
  electrical: [
    { key: 'pm', label: 'PM', fullName: 'Project Manager', bg: 'bg-blue-900/30 border-blue-500/25 text-blue-300', icon: '👔' },
    { key: 'ee', label: 'EE', fullName: 'Electrical Engineer', bg: 'bg-purple-900/30 border-purple-500/25 text-purple-300', icon: '⚡' },
    { key: 'so', label: 'SO', fullName: 'Safety Officer', bg: 'bg-emerald-900/30 border-emerald-500/25 text-emerald-300', icon: '🛡️' },
    { key: 'el', label: 'EL', fullName: 'Electrician', bg: 'bg-indigo-900/30 border-indigo-500/25 text-indigo-300', icon: '🔌' },
    { key: 'lm', label: 'LM', fullName: 'Lineman', bg: 'bg-cyan-900/30 border-cyan-500/25 text-cyan-300', icon: '🧗' },
    { key: 'cs', label: 'CS', fullName: 'Cable Splicer', bg: 'bg-amber-900/30 border-amber-500/25 text-amber-300', icon: '🪓' },
    { key: 'hl', label: 'HL', fullName: 'Helper', bg: 'bg-teal-900/30 border-teal-500/25 text-teal-300', icon: '🧹' }
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

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading');
  
  const [activePerspective, setActivePerspective] = useState('gantt'); // 'gantt' | 'weekly' | 'qa' | 'logistics'
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
  const [activeForecastFilter, setActiveForecastFilter] = useState('this-week'); // 'this-week' | 'all-active'

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [filterStatusTag, setFilterStatusTag] = useState('ALL');

  useEffect(() => {
    const pullGlobalDatabaseForecasts = async () => {
      setIsForecastLoading(true);
      try {
        const pooledForecasts = [];
        
        // Always populate with current active schedule first for immediate visibility
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

        // Fetch sibling projects if DB is available
        if (db && user && projectList.length > 1) {
          for (const proj of projectList) {
            if (proj.id === activeProjectId) continue; // Skip active as it's already added
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

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      showToast("Browser does not support desktop notifications");
      return false;
    }
    if (Notification.permission === 'granted') return true;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      showToast("Notification permissions granted!");
      return true;
    }
    return false;
  };

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
      console.warn("Synth audio feedback blocked by user interaction gesture rule:", e);
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

  const handleShareToCloud = async () => {
    if (!db) {
      showToast("Cloud configuration missing.");
      return;
    }
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
        updatedAt: new Date().toISOString()
      });

      const freshRegistry = projectList.map(p => 
        p.id === activeProjectId ? { ...p, title: appTitle, lastModified: new Date().toISOString() } : p
      );
      setProjectList(freshRegistry);
      localStorage.setItem('mbv_cloud_registry', JSON.stringify(freshRegistry));

      const url = new URL(window.location.href);
      url.searchParams.set('project', activeProjectId);
      copyToClipboard(url.toString());

      showToast("Sync Successful! URL copied to clipboard.");
      logActivityToCloud(`Global database synced successfully`, 'success');
    } catch (e) {
      console.error(e);
      showToast("Error synchronizing project data to cloud.");
    } finally {
      setIsSavingCloud(false);
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
    
    if (db && user && (field === 'assignedAsset' || field === 'qaStatus' || field === 'duration')) {
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

  const addTask = () => {
    const newRef = `${tasks.length + 1}.0`;
    setTasks([...tasks, { 
      id: `T${Date.now()}`, 
      ref: newRef, 
      desc: 'Electrical Field Work', 
      task: 'New Wiring / Conduit Installation', 
      duration: 1, 
      progress: 0, 
      pm: 0, se: 0, ee: 0, so: 0, st: 0, cp: 0, ms: 0, el: 1, lm: 0, cs: 0, hl: 1,
      assigned: {}, 
      qaStatus: 'PENDING', 
      checklist: {},
      assignedAsset: 'None'
    }]);
    showToast("New schedule row added.");
    logActivityToCloud("Added a new sequence timeline parameter.", "info");
  };

  const triggerTaskRemove = (id) => {
    const matched = tasks.find(t => t.id === id);
    setTasks(tasks.filter(t => t.id !== id));
    showToast("Schedule row removed.");
    if (matched) {
      logActivityToCloud(`Deleted timeline sequence row: ${matched.task}`, 'alert');
    }
  };

  const toggleChecklistItem = (taskId, itemName) => {
    setTasks(tasks.map(t => {
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

  const addChecklistItem = (taskId, itemName) => {
    if (!itemName.trim()) return;
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const currentChecklist = { ...(t.checklist || {}) };
        currentChecklist[itemName] = false;
        return { ...t, checklist: currentChecklist };
      }
      return t;
    }));
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

  const overallGlobalProgress = Math.round(
    activeFlowTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / (activeFlowTasks.length || 1)
  );

  const getRowBgColor = (task, index) => {
    const isHold = task.qaStatus === 'HOLD';
    const isApproved = task.qaStatus === 'APPROVED';
    const hasConflict = checkAssetConflict(task);
    
    if (isDarkMode) {
      if (hasConflict) return 'bg-amber-950/25 border-amber-500/20 hover:bg-amber-950/35';
      if (isHold) return 'bg-rose-950/20 border-rose-900/30 hover:bg-rose-950/30';
      if (isApproved) return 'bg-emerald-950/15 border-emerald-900/30 hover:bg-emerald-950/25';
      return index % 2 === 0 ? 'bg-[#0f172a] border-slate-800/20 hover:bg-slate-800/15' : 'bg-[#0b0f19] border-slate-800/10 hover:bg-slate-800/10';
    } else {
      if (hasConflict) return 'bg-amber-50/70 border-amber-300/40 hover:bg-amber-100/30';
      if (isHold) return 'bg-rose-50/70 border-rose-200/40 hover:bg-rose-100/30';
      if (isApproved) return 'bg-emerald-50/50 border-emerald-200/40 hover:bg-emerald-100/20';
      return index % 2 === 0 ? 'bg-white border-slate-200 hover:bg-slate-50/40' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50/30';
    }
  };

  const getBadgeStyle = (status) => {
    if (status === 'APPROVED') {
      return 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/40';
    }
    if (status === 'HOLD') {
      return 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30 dark:border-rose-500/40 animate-pulse font-bold';
    }
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 dark:border-blue-500/40';
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
      <div className="h-screen w-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500 h-10 w-10"/>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">Syncing Citicore Mother DB...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#080d1a] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#1e293b' : '#cbd5e1'}; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
        
        .gantt-grid-light {
          background-image: 
            linear-gradient(to right, rgba(226, 232, 240, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.4) 1px, transparent 1px);
          background-size: 44px 100%, 100% 54px;
        }
        
        .gantt-grid-dark {
          background-image: 
            linear-gradient(to right, rgba(30, 41, 59, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 41, 59, 0.3) 1px, transparent 1px);
          background-size: 44px 100%, 100% 54px;
        }

        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          body { background-color: #ffffff !important; color: #000000 !important; }
          header, button, .print\\:hidden { display: none !important; }
          #gantt-export-zone { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
        }
      `}} />

      {}
      <header className={`border-b z-20 shrink-0 transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1e293b] p-2 rounded-xl border border-slate-700 text-white shrink-0 shadow-lg">
              <LayoutDashboard size={18} className="text-blue-500"/>
            </div>
            
            <div className="flex flex-col min-w-0" ref={dropdownRef}>
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold select-none ${
                    isDarkMode 
                      ? 'bg-[#131c2e] hover:bg-[#1e293b] text-white border-slate-700 hover:border-slate-500' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <Folder className="text-blue-500 shrink-0" size={13}/>
                  <span className="truncate max-w-[140px] sm:max-w-[220px]">
                    {projectList.find(p => p.id === activeProjectId)?.title || 'Switch Project...'}
                  </span>
                  <ChevronDown className="text-slate-500 shrink-0" size={12}/>
                </button>

                {isProjectDropdownOpen && (
                  <div className={`absolute left-0 top-10 w-72 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200 ${
                    isDarkMode ? 'bg-[#131c2e] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
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
                          className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                            activeProjectId === proj.id 
                              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-md' 
                              : (isDarkMode ? 'hover:bg-slate-800/80 text-slate-300 border border-transparent' : 'hover:bg-slate-50 text-slate-700 border border-transparent')
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Folder className={activeProjectId === proj.id ? 'text-blue-400' : 'text-slate-400'} size={12}/>
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

                {/* Lightweight specs indicators */}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 shrink-0">
                  {weatherFactor === 'sunny' ? '☀️ Sunny' : weatherFactor === 'heavy_rain' ? '🌧️ Rain Delay' : '🌀 Typhoon Lock'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 hidden sm:inline shrink-0">
                  {laborProfile === 'electrical' ? '⚡ Electrical' : '🏗️ Civil'}
                </span>
              </div>
            </div>
          </div>

          {}
          <div className="flex items-center gap-1 border border-slate-800 p-1 rounded-xl bg-slate-900/30">
            {[
              { id: 'gantt', label: '📊 Gantt Workspace' },
              { id: 'weekly', label: '📅 7-Days Outlook' },
              { id: 'qa', label: '🛡️ QA Compliance' },
              { id: 'logistics', label: '🚚 Logistics Pool' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePerspective(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                  activePerspective === tab.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 shrink-0 justify-end">
            <button 
              onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm transition-all text-xs font-bold uppercase tracking-wider ${
                isControlPanelOpen
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : isDarkMode ? 'bg-[#131c2e] border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 hover:bg-slate-100'
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
              className={`p-2 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-[#131c2e] border-slate-700 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 hover:bg-slate-100'} ${soundEnabled ? 'text-blue-500' : 'text-slate-500'}`} 
            >
              {soundEnabled ? <Volume2 size={14}/> : <VolumeX size={14}/>}
            </button>

            <button onClick={shareToGroupChat} className={`p-2 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
              <MessageSquareShare size={14}/>
            </button>

            <button onClick={() => setIsNotificationPaneOpen(!isNotificationPaneOpen)} className={`p-2 rounded-xl transition border shadow-sm relative ${isDarkMode ? 'bg-[#131c2e] border-slate-700 text-blue-400 hover:bg-slate-800' : 'bg-white border-slate-300 text-blue-600 hover:bg-slate-100'}`}>
              <Bell size={14}/>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            </button>
          </div>
        </div>

        {/* Collapsible Site Controls drawer for uncluttered white space */}
        {isControlPanelOpen && (
          <div className={`px-6 py-4 border-t flex flex-wrap gap-4 items-center animate-in slide-in-from-top-1 duration-200 ${isDarkMode ? 'bg-[#0b0f19]/90' : 'bg-slate-100/50'}`}>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Crew Structuring Profile</span>
              <div className={`flex border rounded-xl p-1 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-200'}`}>
                <button 
                  onClick={() => { setLaborProfile('civil'); showToast("Switched to Civil Crew"); }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${laborProfile === 'civil' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
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

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stochastic Weather State</span>
              <select 
                value={weatherFactor} 
                onChange={(e) => {
                  setWeatherFactor(e.target.value);
                  logActivityToCloud(`Weather state updated to ${e.target.value.toUpperCase()}`, 'warning');
                }} 
                className={`text-xs px-3 py-2 border rounded-xl font-bold outline-none cursor-pointer ${isDarkMode ? 'bg-[#131c2e] border-slate-700 text-blue-400 [&_option]:bg-[#131c2e]' : 'bg-white border-slate-300'}`}
              >
                <option value="sunny">☀️ Sunny (Normal 1.0x)</option>
                <option value="heavy_rain">🌧️ Rain Delay (+35%)</option>
                <option value="typhoon">🌀 Typhoon Lock (+80%)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Launch Target</span>
              <div className={`flex items-center border rounded-xl px-3 py-1.5 text-xs font-bold ${isDarkMode ? 'bg-[#131c2e] border-slate-700 text-blue-500' : 'bg-white border-slate-300'}`}>
                <input type="date" value={projectStartDate} onChange={(e) => setProjectStartDate(e.target.value)} className="outline-none bg-transparent cursor-pointer" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-bold">Document Specs</span>
              <button 
                onClick={() => setIsMetadataCollapsed(!isMetadataCollapsed)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-[#131c2e] border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-300'
                }`}
              >
                {isMetadataCollapsed ? <ChevronDown size={12}/> : <ChevronUp size={12}/>}
                <span>Header Details</span>
              </button>
            </div>

            <div className="flex gap-2 ml-auto">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 text-amber-400 border-slate-700' : 'bg-white text-slate-600 border-slate-300'}`}>
                {isDarkMode ? <Sun size={14}/> : <Moon size={14}/>}
              </button>
              <button onClick={triggerSystemPrint} className="bg-slate-800 hover:bg-slate-750 text-white px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Printer size={13}/> Print
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className={`p-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
                <Settings size={14}/>
              </button>
            </div>
          </div>
        )}
      </header>

      {}
      <main className="flex-1 overflow-hidden p-6 relative flex flex-col min-h-0">
        <div className="max-w-[1700px] w-full mx-auto flex flex-col gap-4 flex-1 min-h-0">

          {/* Collapsible Document Metadata Branding Section */}
          {!isMetadataCollapsed && (
            <div id="gantt-export-zone" className={`rounded-2xl border p-4 flex flex-col gap-4 shadow-sm shrink-0 transition-all duration-300 animate-in slide-in-from-top-1 ${
              isDarkMode ? 'bg-[#131c2e] border-slate-700' : 'bg-white border-slate-250'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/4 flex justify-start items-center">
                  {logos.left ? <img src={logos.left} className="h-10 object-contain" alt="Left" /> : <CiticoreLogo/>}
                </div>
                <div className="w-full md:w-1/2 text-center flex flex-col">
                  <input 
                    value={docMetadata.projectName} 
                    onChange={(e) => setDocMetadata({...docMetadata, projectName: e.target.value.toUpperCase()})}
                    className="text-center font-bold text-sm tracking-tight bg-transparent uppercase border-b border-transparent focus:border-blue-500 outline-none w-full transition-colors"
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
                  {logos.right ? <img src={logos.right} className="h-10 object-contain" alt="Right" /> : <MbvLogo/>}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-bold uppercase tracking-wider border-t pt-4 border-slate-800">
                <div className="flex flex-col gap-1 border-r border-slate-800/40">
                  <span>Document No:</span>
                  <input value={docMetadata.docNo} onChange={(e) => setDocMetadata({...docMetadata, docNo: e.target.value})} className="font-mono bg-transparent outline-none w-full font-bold" />
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-800/40 px-1">
                  <span>Revision:</span>
                  <input value={docMetadata.revision} onChange={(e) => setDocMetadata({...docMetadata, revision: e.target.value})} className="bg-transparent outline-none w-full font-bold" />
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-800/40 px-1">
                  <span>Effective Date:</span>
                  <input value={docMetadata.date} onChange={(e) => setDocMetadata({...docMetadata, date: e.target.value})} className="bg-transparent outline-none w-full font-bold" />
                </div>
                <div className="flex flex-col gap-1 pl-1">
                  <span>Base Launch:</span>
                  <span className="font-bold">{projectStartDate}</span>
                </div>
              </div>
            </div>
          )}

          {/* PERSPECTIVE VIEW 1: DYNAMIC GANTT WORKSPACE */}
          {activePerspective === 'gantt' && (
            <div className="flex-1 flex flex-col min-h-0 relative gap-3 animate-in fade-in duration-200">
              
              {/* Table search filter bar */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 shrink-0 ${
                isDarkMode ? 'bg-[#131c2e]/60 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3 flex-1">
                  <input 
                    type="text" 
                    placeholder="Search active project sequences..."
                    value={filterSearchQuery}
                    onChange={(e) => setFilterSearchQuery(e.target.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border outline-none w-full max-w-sm transition-colors ${
                      isDarkMode 
                        ? 'bg-[#0f172a] border-slate-700 text-white focus:border-blue-500' 
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                  
                  {/* Minimalism button to collapse left spreadsheet sidebar */}
                  <button
                    onClick={() => setIsGanttSidebarVisible(!isGanttSidebarVisible)}
                    className={`hidden lg:flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                      isGanttSidebarVisible 
                        ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isGanttSidebarVisible ? <EyeOff size={13}/> : <Eye size={13}/>}
                    <span>{isGanttSidebarVisible ? 'Hide List' : 'Show List'}</span>
                  </button>
                </div>
                
                <div className="flex gap-1">
                  {['ALL', 'PENDING', 'HOLD', 'APPROVED'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setFilterStatusTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                        filterStatusTag === tag
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : (isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-300 text-slate-600')
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive main split screen panel with customizable workspace columns */}
              <div className={`flex border rounded-3xl overflow-hidden flex-grow shadow-sm transition-colors ${isDarkMode ? 'bg-[#131c2e]/10 border-slate-800' : 'bg-slate-50/50 border-slate-250'}`}>
                
                {/* Left Task Spreadsheet Column list (Can be hidden for clean space) */}
                {isGanttSidebarVisible && (
                  <div className={`flex w-[50%] md:w-[40%] lg:w-[45%] flex-col shrink-0 z-10 border-r relative transition-all duration-300 ${
                    isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    
                    {/* Synchronized header row */}
                    <div className={`h-[48px] min-h-[48px] max-h-[48px] p-2 font-bold text-[9px] flex items-center uppercase tracking-widest border-b transition-colors ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-850 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <span className="w-8 text-center font-bold">Ref</span>
                      <span className="flex-grow px-2 truncate font-bold">Work Description</span>
                      <span className="w-20 text-center shrink-0 font-bold">Asset</span>
                      <span className="w-8 text-center shrink-0 font-bold">Days</span>
                      <span className="w-10 text-center shrink-0 font-bold">Complete</span>
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
                          onClick={() => setActiveTaskModal(task.id)}
                          className={`h-[54px] min-h-[54px] max-h-[54px] flex items-center text-xs group transition-all border-b cursor-pointer ${getRowBgColor(task, index)}`}
                        >
                          <div className="w-8 text-center flex items-center justify-center shrink-0 font-bold font-mono text-[10px] text-blue-500">
                            {task.ref}
                          </div>
                          
                          <div className="flex-grow h-full flex flex-col justify-center px-2 border-l border-slate-800/40 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[8px] text-blue-400 uppercase tracking-wider block truncate">
                                {task.desc}
                              </span>
                              <span className={`px-1 rounded text-[7px] font-black uppercase tracking-wider ${getBadgeStyle(task.qaStatus)}`}>
                                {task.qaStatus}
                              </span>
                            </div>
                            <span className={`font-semibold text-xs truncate leading-tight mt-0.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                              {task.task}
                            </span>
                          </div>

                          <div className="w-20 h-full border-l border-slate-800/40 flex items-center justify-center px-1 shrink-0">
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                              {task.assignedAsset !== 'None' ? task.assignedAsset : '-'}
                            </span>
                          </div>
                          
                          <div className="w-8 h-full border-l border-slate-800/40 flex items-center justify-center font-bold text-center shrink-0 font-mono">
                            {task.duration}d
                          </div>

                          <div className="w-10 h-full border-l border-slate-800/40 flex flex-col items-center justify-center px-1 shrink-0">
                            <span className="font-mono text-[9px] font-bold text-slate-300">{task.progress || 0}%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Left footer column trigger */}
                    <div className="h-[64px] p-2 flex items-center border-t border-slate-800/40 sticky bottom-0 z-20 shrink-0">
                       <button onClick={addTask} className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 transition-all px-2 py-2.5 rounded-xl border border-dashed border-slate-700 w-full justify-center text-blue-400 hover:text-blue-300">
                         <Plus size={12}/> Add Task Parameter
                       </button>
                    </div>
                  </div>
                )}

                {/* Right Timeline Canvas scrollable segment */}
                <div className="flex-1 flex flex-col relative overflow-x-auto scrollbar-thin">
                  
                  {/* Dynamic grid headers */}
                  <div className={`h-[48px] min-h-[48px] max-h-[48px] flex min-w-max sticky top-0 z-25 border-b transition-colors ${
                    isDarkMode ? 'bg-slate-900 border-slate-850' : 'bg-slate-100 border-slate-200'
                  }`}
                  style={{ width: `${headerDays.length * 44}px` }}>
                    {headerDays.map(day => {
                      const isWeekendDay = new Date(projectStartDate).getTime() + day * 86400000;
                      const isSatSun = new Date(isWeekendDay).getDay() === 0 || new Date(isWeekendDay).getDay() === 6;
                      return (
                        <div key={day} className={`w-[44px] h-full flex-shrink-0 text-center border-r flex flex-col justify-center transition-colors ${
                          isDarkMode 
                            ? `border-slate-800/60 ${isSatSun ? 'bg-slate-950/40' : ''}` 
                            : `border-slate-200/60 ${isSatSun ? 'bg-slate-200/50' : ''}`
                        }`}>
                          <span className="text-[9px] font-bold leading-tight text-slate-400">{generateDateHeaderStr(projectStartDate, day).split(' ')[0]}</span>
                          <span className="text-[8px] font-semibold text-slate-500 leading-tight uppercase">{generateDateHeaderStr(projectStartDate, day).split(' ')[1]}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Right timeline blocks linked with explicit width metrics (Fixes cutoffs on scroll!) */}
                  <div 
                    ref={rightScrollRef}
                    onScroll={handleRightScroll}
                    className={`flex-grow relative overflow-y-auto overflow-x-hidden scrollbar-none ${
                      isDarkMode ? "gantt-grid-dark" : "gantt-grid-light"
                    }`}
                    style={{ 
                      scrollbarWidth: 'none', 
                      msOverflowStyle: 'none',
                      width: `${headerDays.length * 44}px`
                    }}
                  >
                    {filteredTasks.map((task) => {
                      const conflict = checkAssetConflict(task);
                      return (
                        <div 
                          key={task.id} 
                          className="h-[54px] min-h-[54px] max-h-[54px] border-b border-slate-800/40 relative flex items-center"
                          style={{ width: `${headerDays.length * 44}px` }}
                        >
                          <div 
                            onClick={() => setActiveTaskModal(task.id)}
                            className={`absolute h-[24px] rounded-lg shadow-sm transition-all flex items-center justify-between overflow-hidden text-xs font-bold border cursor-pointer hover:scale-[1.015] z-10 ${
                              conflict 
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                                : task.qaStatus === 'HOLD' 
                                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                                  : task.qaStatus === 'APPROVED' 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                                    : 'bg-blue-600/15 border-blue-500/30 text-blue-300'
                            }`}
                            style={{ left: `${(task.startDays) * 44 + 2}px`, width: `${(task.adjustedDuration * 44) - 4}px` }}
                          >
                            <div className="absolute top-0 left-0 h-full bg-blue-500/10" style={{ width: `${task.progress || 0}%` }} />
                            <span className="truncate px-2 font-black text-[9px] relative z-10 flex items-center gap-1.5">
                              <span>{task.ref}</span>
                              <span className="opacity-75">{task.task}</span>
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* High-fidelity crew loading metrics */}
                  <div className={`h-[120px] border-t flex min-w-max items-end relative sticky bottom-0 z-25 transition-colors ${
                    isDarkMode ? 'bg-[#0b0f19] border-slate-850' : 'bg-white border-slate-300'
                  }`}
                  style={{ width: `${headerDays.length * 44}px` }}>
                    {headerDays.map(day => {
                      const dayManpower = activeFlowTasks.reduce((sum, task) => {
                        if (day >= task.startDays && day < task.startDays + task.adjustedDuration) return sum + task.totalManpower;
                        return sum;
                      }, 0);
                      const heightPercentage = (dayManpower / Math.max(maxManpowerVal, 16)) * 60;
                      return (
                        <div key={`hist-${day}`} className="w-[44px] h-full flex-shrink-0 border-r border-slate-800/40 flex flex-col justify-end items-center pb-4">
                          {dayManpower > 0 && (
                            <div 
                              className={`w-4 rounded-t-md transition-all ${dayManpower > 12 ? 'bg-rose-500/40' : 'bg-blue-500/30'}`}
                              style={{ height: `${Math.max(4, heightPercentage)}%` }}
                            />
                          )}
                          <span className={`text-[9px] font-bold font-mono mt-1 ${dayManpower > 12 ? 'text-rose-400' : 'text-slate-400'}`}>
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

          {/* PERSPECTIVE VIEW 2: 7-DAYS OUTLOOK (RE-CONFIGURED WITH GUARANTEED FALLBACK CODES) */}
          {activePerspective === 'weekly' && (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0 animate-in fade-in duration-200">
              <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 ${
                isDarkMode ? 'bg-[#131c2e] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-sm font-extrabold tracking-widest uppercase flex items-center gap-2 text-blue-400">
                    <CalendarDays size={16} /> 7-Day Cross-Project Outlook Forecast
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Aggregates ongoing operational sequences across all active databases matching today's timeline.</p>
                </div>
                
                <div className="flex items-center gap-1 border p-1 rounded-xl bg-slate-950/40 border-slate-850">
                  <button
                    onClick={() => setActiveForecastFilter('this-week')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      activeForecastFilter === 'this-week' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📅 This Week
                  </button>
                  <button
                    onClick={() => setActiveForecastFilter('all-active')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                      activeForecastFilter === 'all-active' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ⚠️ All Unfinished Tasks
                  </button>
                </div>
              </div>

              {thisWeeksForecastList.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-slate-800 text-center">
                  <CalendarDays size={40} className="text-slate-600 mb-2"/>
                  <h4 className="text-xs font-black uppercase text-slate-400">No Operations Scheduled Inside this Forecast cycle</h4>
                  <p className="text-xs text-slate-550 max-w-sm mt-1">Try adding task rows, adjusting base dates, or shifting the timeline offsets.</p>
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
                            } else {
                              handleSwitchProject(item.parentProjectId);
                              setTimeout(() => setActiveTaskModal(item.id), 300);
                            }
                          }}
                          className={`p-6 rounded-3xl border shadow-sm cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between gap-4 ${
                            isDarkMode ? 'bg-[#131c2e] border-slate-850 hover:border-slate-700' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-3">
                              <div className="min-w-0 flex-1">
                                <span className="bg-blue-600/15 text-blue-400 px-2.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase block truncate">
                                  {item.parentProjectName}
                                </span>
                                <h4 className={`text-sm font-extrabold truncate mt-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                  {item.task}
                                </h4>
                              </div>
                              <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-wider ${getBadgeStyle(item.qaStatus)}`}>
                                {item.qaStatus}
                              </span>
                            </div>

                            <div className="space-y-2 mt-4 text-xs font-medium text-slate-400">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="flex items-center gap-1 uppercase tracking-wide"><Clock size={11}/> Dates</span>
                                <span className="font-mono text-slate-300">
                                  {item.absoluteStartDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - {item.absoluteEndDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="flex items-center gap-1 uppercase tracking-wide"><Truck size={11}/> Allocated Asset</span>
                                <span className="font-bold text-blue-400">{item.assignedAsset || 'None'}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="flex items-center gap-1 uppercase tracking-wide"><Users size={11}/> Workforce Loading</span>
                                <span className="font-bold text-slate-300">{item.totalManpower || 0} Workers</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-4 border-t border-slate-850">
                            <div className="flex justify-between text-[9px] font-black tracking-widest text-slate-400">
                              <span>PROGRESS COMPLETE</span>
                              <span>{item.progress || 0}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{width: `${item.progress || 0}%`}}></div>
                            </div>
                          </div>

                          {isOverdue && (
                            <div className="mt-1 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
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

          {/* PERSPECTIVE VIEW 3: QA/QC INSPECTIONS GATING REGISTRY */}
          {activePerspective === 'qa' && (
            <div className="flex-grow flex flex-col gap-4 overflow-hidden min-h-0 animate-in fade-in duration-200">
              <div className={`p-6 rounded-3xl border flex items-center justify-between ${
                isDarkMode ? 'bg-[#131c2e] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-sm font-extrabold tracking-widest uppercase text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck size={16}/> Engineering Compliance Inspection Ledger
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Audit-ready verification list of all critical sequence hold points and requirements.</p>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto space-y-3">
                {activeFlowTasks.map(task => (
                  <div 
                    key={`qa-${task.id}`}
                    onClick={() => setActiveTaskModal(task.id)}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer hover:border-slate-500 transition-all ${
                      isDarkMode ? 'bg-[#131c2e]/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-bold font-mono text-xs text-blue-500">{task.ref}</span>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">{task.desc}</span>
                        <span className={`font-semibold text-xs block ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{task.task}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 hidden sm:inline">{Object.keys(task.checklist || {}).length} Parameters</span>
                      <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${getBadgeStyle(task.qaStatus)}`}>
                        {task.qaStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PERSPECTIVE VIEW 4: LOGISTICS EQUIPMENT POOL */}
          {activePerspective === 'logistics' && (
            <div className="flex-grow flex flex-col gap-4 overflow-hidden min-h-0 animate-in fade-in duration-200">
              <div className={`p-6 rounded-3xl border flex items-center justify-between ${
                isDarkMode ? 'bg-[#131c2e] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <h3 className="text-sm font-extrabold tracking-widest uppercase text-purple-400 flex items-center gap-1.5">
                    <Truck size={16}/> Heavy Rig & Logistics Equipment Pool
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Configure site machinery, mobilization buffers, and check overlapping booking clashes.</p>
                </div>
                <button
                  onClick={() => setIsAssetModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus size={14}/> Add Asset
                </button>
              </div>

              <div className="flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customAssets.map(asset => {
                    const isAllocated = activeFlowTasks.filter(t => t.assignedAsset === asset.key);
                    return (
                      <div key={asset.key} className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 ${
                        isDarkMode ? 'bg-[#131c2e]/60 border-slate-850' : 'bg-white border-slate-200'
                      }`}>
                        <div className="flex items-center gap-3 justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                              {renderAssetIcon(asset.key)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-mono text-xs font-black text-blue-400 block">{asset.key}</span>
                              <span className="text-xs font-bold truncate block">{asset.label}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveCustomAsset(asset.key)}
                            className="p-1 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0 transition-all"
                          >
                            <Trash2 size={13}/>
                          </button>
                        </div>

                        <div className="space-y-1.5 pt-3 border-t border-slate-800 text-[10px] text-slate-400">
                          <div className="flex justify-between font-semibold">
                            <span>CLASS:</span>
                            <span className="font-bold text-slate-300">{asset.type}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>TRANSIT BUFFER:</span>
                            <span className="font-bold text-slate-300">{asset.defaultMobilizationDays} Days</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>ACTIVE DISPATCHES:</span>
                            <span className="font-bold text-blue-400">{isAllocated.length} Sequences</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {}
          {tomorrowAllocations.length > 0 && (
            <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <Clock className="text-amber-500 shrink-0" size={18}/>
                <p className="text-xs text-slate-300 font-semibold text-left">
                  Tomorrow's logistical dispatch warnings detected across active schedule plans.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tomorrowAllocations.map(task => (
                  <span key={task.id} className="bg-slate-950/80 border border-amber-500/30 px-3 py-1 rounded-lg text-[10px] font-bold text-amber-400 flex items-center gap-1">
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
      {isAssetModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border flex flex-col max-h-[85vh] transition-all duration-300 ${
            isDarkMode ? 'bg-[#131c2e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-850 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2"><Truck className="text-blue-500" size={14}/> Logistics Pool Registry</h3>
              </div>
              <button onClick={() => { setIsAssetModalOpen(false); setAssetValidationWarning(''); }} className="p-1 rounded-lg hover:bg-slate-800"><X size={14}/></button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 scrollbar-thin">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-100/50'} space-y-4`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Asset Code (Unique Key)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CRN50, HVBT1"
                      value={newAssetCode}
                      onChange={(e) => setNewAssetCode(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-[#131c2e] border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Asset Label Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 50-Ton Crawler Crane"
                      value={newAssetName}
                      onChange={(e) => setNewAssetName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-[#131c2e] border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Class</label>
                    <select 
                      value={newAssetType}
                      onChange={(e) => setNewAssetType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="Heavy Equipment">Heavy Equipment</option>
                      <option value="Specialized Tools">Specialized Tools</option>
                      <option value="Testing Equipment">Testing Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Preset Design</label>
                    <select 
                      value={newAssetIconPreset}
                      onChange={(e) => setNewAssetIconPreset(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="heavy">🚚 Heavy Rig</option>
                      <option value="case">🧳 Calibration Case</option>
                      <option value="lightning">⚡ Electrical Terminal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Mob Buffer</label>
                    <input 
                      type="number" min="0" max="7"
                      value={newAssetMobDays}
                      onChange={(e) => setNewAssetMobDays(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                {assetValidationWarning && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">
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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border flex flex-col max-h-[90vh] transition-all duration-300 ${
              isDarkMode ? 'bg-[#131c2e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-850 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><ClipboardCheck className="text-blue-500" size={14}/> Site Field Inspector Card</h3>
                  <p className="text-[10px] text-slate-400 mt-1"><span className="text-blue-500 bg-blue-500/15 border border-blue-500/20 px-1.5 py-0.5 rounded mr-1.5">{currentTaskEditing.ref}</span> {currentTaskEditing.task}</p>
                </div>
                <button onClick={() => setActiveTaskModal(null)} className="p-1 rounded-lg hover:bg-slate-800"><X size={14}/></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-grow space-y-5 scrollbar-thin">
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2">Configure Base Days & Percent Complete</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-semibold text-slate-500">DURATION (BASE DAYS)</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <button 
                          onClick={() => {
                            const val = Math.max(1, currentTaskEditing.duration - 1);
                            updateTask(currentTaskEditing.id, 'duration', val);
                          }}
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-bold text-blue-500 px-2">{currentTaskEditing.duration} Days</span>
                        <button 
                          onClick={() => {
                            const val = currentTaskEditing.duration + 1;
                            updateTask(currentTaskEditing.id, 'duration', val);
                          }}
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-semibold text-slate-500">PERCENT COMPLETE (%)</span>
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
                        className="mt-3.5 w-full cursor-pointer accent-blue-500 text-blue-500 bg-slate-300 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Co-Sign Inspector Status</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { status: 'PENDING', label: 'Active Work', desc: 'In development', border: 'border-blue-500/30 text-blue-400', bg: 'bg-blue-500/10' },
                      { status: 'HOLD', label: 'QA HOLD', desc: 'Blocked point', border: 'border-rose-500/30 text-rose-400', bg: 'bg-rose-500/10' },
                      { status: 'APPROVED', label: 'APPROVED', desc: 'Inspection approved', border: 'border-emerald-500/30 text-emerald-400', bg: 'bg-emerald-500/10' }
                    ].map((card) => (
                      <div
                        key={card.status}
                        onClick={() => {
                          updateTask(currentTaskEditing.id, 'qaStatus', card.status);
                          logActivityToCloud(`Inspection status for task "${currentTaskEditing.task}" changed to ${card.status}`, card.status === 'APPROVED' ? 'success' : card.status === 'HOLD' ? 'alert' : 'info');
                        }}
                        className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                          currentTaskEditing.qaStatus === card.status
                            ? `ring-2 ring-blue-500 ${card.border} ${card.bg}`
                            : (isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600')
                        }`}
                      >
                        <span className="block font-bold text-[10px] uppercase tracking-wide">{card.label}</span>
                        <span className="block text-[8px] opacity-75 mt-0.5 leading-none font-normal">{card.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">Shared Asset Allocation</h4>
                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-200'} flex flex-col sm:flex-row items-center justify-between gap-3`}>
                    <div className="flex items-center gap-2">
                      <Truck className="text-blue-500" size={16}/>
                      <div className="text-left">
                        <p className="text-xs font-bold">Assign Equipment/Specialized Tooling</p>
                      </div>
                    </div>
                    <div className="relative min-w-[180px]">
                      <select 
                        value={currentTaskEditing.assignedAsset || 'None'}
                        onChange={(e) => updateTask(currentTaskEditing.id, 'assignedAsset', e.target.value)}
                        className="pl-3 pr-8 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer w-full bg-transparent"
                      >
                        <option value="None">None</option>
                        {customAssets.map(asset => (
                          <option key={asset.key} value={asset.key}>{asset.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><ListTodo className="text-blue-500" size={12}/> Engineering Checklist</h4>
                  {Object.keys(currentTaskEditing.checklist || {}).length === 0 ? (
                    <p className="text-xs text-slate-500 italic font-normal">No checklist parameters set.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {Object.entries(currentTaskEditing.checklist).map(([name, completed]) => (
                        <label 
                          key={name}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            completed 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' 
                              : (isDarkMode ? 'bg-[#131c2e] border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-850')
                          }`}
                        >
                          <span>{name}</span>
                          <input 
                            type="checkbox" 
                            checked={completed} 
                            onChange={() => toggleChecklistItem(currentTaskEditing.id, name)}
                            className="rounded text-emerald-600 h-4 w-4 bg-slate-950"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#131c2e] text-slate-100' : 'bg-white text-slate-800'}`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
              <span className="font-bold flex items-center gap-2"><Settings size={14}/> Settings</span>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-lg hover:bg-slate-800"><X size={14}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Left Contractor Logo</label>
                <label className="cursor-pointer border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-1">
                  <UploadCloud className="text-blue-400" size={20}/>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('left', e)} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {isNotificationPaneOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex justify-end">
          <div className={`w-full max-w-sm h-full p-6 flex flex-col justify-between border-l shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-[#131c2e] border-slate-850 text-slate-100' : 'bg-white border-slate-250 text-slate-800'}`}>
            <div className="space-y-4 overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3 border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="text-blue-500" size={14}/>
                  <h3 className="text-xs font-black uppercase tracking-wider">Site Activity Stream</h3>
                </div>
                <button onClick={() => setIsNotificationPaneOpen(false)} className="p-1 rounded-md hover:bg-slate-800">
                  <X size={14}/>
                </button>
              </div>

              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="font-semibold block">{notif.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border ${isDarkMode ? 'bg-[#131c2e] border-slate-700' : 'bg-white border-slate-300'}`}>
            <div className="p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Create New Project</h3>
              <input 
                type="text"
                placeholder="e.g. Pagbilao Phase 3B Splicing"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold outline-none mb-4 ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowCreateProjectModal(false)} className="px-4 py-2 text-slate-400 font-semibold text-xs">Cancel</button>
                <button onClick={handleCreateNewProject} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase rounded-xl">Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}