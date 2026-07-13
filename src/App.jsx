bg-slate-900/40 border-blue-500/30 text-blue-300:MBV Dynamic Scheduler Workspace:App.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  CalendarDays, Settings, X, Plus, Trash2, 
  CheckCircle2, Share2, GripVertical, UploadCloud, 
  Users, UserPlus, Minus, BarChart3, Info, Loader2, Printer,
  LayoutDashboard, FilePlus2, Clock, ChevronRight, Home, FolderPlus, Sun, Moon,
  AlertTriangle, Eye, ArrowRight, ClipboardCheck, ChevronDown, ChevronUp, Folder,
  CloudLightning, Droplets, ShieldCheck, ListTodo, HelpCircle
} from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

let firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

try {
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
  };
} catch (e) {
  // Silent fallback for standalone sandbox environments
}

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
const app = isFirebaseConfigured ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mbv-scheduler-v1';

const CiticoreLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-8 w-auto">
    <path d="M15 10 L25 22 L15 34 L20 34 L30 22 L20 10 Z" fill="#EAB308" />
    <path d="M22 10 L32 22 L22 34 L27 34 L37 22 L27 10 Z" fill="#F1C40F" />
    <text x="50" y="24" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="14" fill="#3b82f6" letterSpacing="-0.03em">CITICORE</text>
    <text x="50" y="34" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="6.5" fill="#64748b" letterSpacing="0.1em">CONSTRUCTION</text>
  </svg>
);

const MbvLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-8 w-auto">
    <rect x="10" y="5" width="35" height="35" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
    <path d="M27 10 L19 23 L26 23 L23 33 L32 19 L25 19 Z" fill="#EAB308" />
    <text x="55" y="24" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="14" fill="#3b82f6" letterSpacing="-0.03em">MBV ELECTRIC</text>
    <text x="55" y="34" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="6.5" fill="#6366f1" letterSpacing="0.1em">POWER SYSTEM</text>
  </svg>
);

const LABOR_PROFILES = {
  civil: [
    { key: 'pm', label: 'PM', fullName: 'Project Manager', bg: 'bg-blue-900/40 border-blue-500/40 text-blue-200 dark:text-blue-200', icon: '👔' },
    { key: 'se', label: 'SE', fullName: 'Site Engineer', bg: 'bg-amber-900/40 border-amber-500/40 text-amber-200 dark:text-amber-200', icon: '📐' },
    { key: 'so', label: 'SO', fullName: 'Safety Officer', bg: 'bg-emerald-900/40 border-emerald-500/40 text-emerald-200 dark:text-emerald-200', icon: '🛡️' },
    { key: 'st', label: 'ST', fullName: 'Steelman', bg: 'bg-slate-800 border-slate-700 text-slate-100 dark:text-slate-100', icon: '⛓️' },
    { key: 'cp', label: 'CP', fullName: 'Carpenter', bg: 'bg-yellow-900/40 border-yellow-500/40 text-yellow-200 dark:text-yellow-200', icon: '🪚' },
    { key: 'ms', label: 'MS', fullName: 'Mason', bg: 'bg-rose-900/40 border-rose-500/40 text-rose-200 dark:text-rose-200', icon: '🧱' },
    { key: 'hl', label: 'HL', fullName: 'Helper', bg: 'bg-teal-900/40 border-teal-500/40 text-teal-200 dark:text-teal-200', icon: '🧹' }
  ],
  electrical: [
    { key: 'pm', label: 'PM', fullName: 'Project Manager', bg: 'bg-blue-900/40 border-blue-500/40 text-blue-200 dark:text-blue-200', icon: '👔' },
    { key: 'ee', label: 'EE', fullName: 'Electrical Engineer', bg: 'bg-purple-900/40 border-purple-500/40 text-purple-200 dark:text-purple-200', icon: '⚡' },
    { key: 'so', label: 'SO', fullName: 'Safety Officer', bg: 'bg-emerald-900/40 border-emerald-500/40 text-emerald-200 dark:text-emerald-200', icon: '🛡️' },
    { key: 'el', label: 'EL', fullName: 'Electrician', bg: 'bg-indigo-900/40 border-indigo-500/40 text-indigo-200 dark:text-indigo-200', icon: '🔌' },
    { key: 'lm', label: 'LM', fullName: 'Lineman', bg: 'bg-cyan-900/40 border-cyan-500/40 text-cyan-200 dark:text-cyan-200', icon: '🧗' },
    { key: 'cs', label: 'CS', fullName: 'Cable Splicer', bg: 'bg-amber-900/40 border-amber-500/40 text-amber-200 dark:text-amber-200', icon: '🪓' },
    { key: 'hl', label: 'HL', fullName: 'Helper', bg: 'bg-teal-900/40 border-teal-500/40 text-teal-200 dark:text-teal-200', icon: '🧹' }
  ]
};

const INITIAL_TASKS = [
  { id: 'T1', ref: '1.0', desc: 'Pre-Construction', task: 'Permit Processing & Mobilization', duration: 2, progress: 100, pm: 1, se: 1, ee: 0, so: 1, st: 0, cp: 0, ms: 0, el: 0, lm: 0, cs: 0, hl: 2, assigned: {}, qaStatus: 'APPROVED', checklist: { 'Mobilization Permit': true, 'Office Container Set': true } },
  { id: 'T2', ref: '1.1', desc: 'Technical Survey', task: 'Geo-staking & Trenching Layout', duration: 1, progress: 100, pm: 1, se: 2, ee: 1, so: 1, st: 0, cp: 0, ms: 0, el: 0, lm: 0, cs: 0, hl: 1, assigned: {}, qaStatus: 'APPROVED', checklist: { 'Boundary Markers Laid': true, 'Topographical Crosscheck': true } },
  { id: 'T3', ref: '2.0', desc: 'Civil Works', task: '1.5m Depth Manual Cable Potholing', duration: 3, progress: 80, pm: 0, se: 1, ee: 0, so: 1, st: 0, cp: 0, ms: 0, el: 0, lm: 0, cs: 0, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Utility Clearance Received': true, 'Depth Level Checked': false } },
  { id: 'T4', ref: '2.1', desc: 'Electrical Grid', task: 'Substation Ground Mesh Assembly', duration: 2, progress: 40, pm: 0, se: 1, ee: 1, so: 1, st: 0, cp: 1, ms: 0, el: 2, lm: 0, cs: 0, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Excavation Safety Barrier Set': true, 'Mesh Ground resistance logged': false } },
  { id: 'T5', ref: '3.0', desc: 'Substation Pad', task: 'Transformer Pad Rebar & Conduit Setup', duration: 3, progress: 0, pm: 0, se: 1, ee: 1, so: 1, st: 4, cp: 2, ms: 0, el: 2, lm: 0, cs: 0, hl: 2, assigned: {}, qaStatus: 'PENDING', checklist: { 'Rebar Bend Specs OK': false, 'Bedding Compactness Signed': false } },
  { id: 'T6', ref: '3.1', desc: 'Equipment Alignment', task: 'Main Circuit Breaker Structural Alignment', duration: 1, progress: 0, pm: 1, se: 2, ee: 2, so: 1, st: 0, cp: 1, ms: 0, el: 3, lm: 0, cs: 0, hl: 1, assigned: {}, qaStatus: 'HOLD', checklist: { 'Plumbness Signed-Off': false, 'Contact Alignment Check': false } },
  { id: 'T7', ref: '4.0', desc: 'Cable Pulling', task: 'Conduit Placement & Pulling MV Feeders', duration: 2, progress: 0, pm: 0, se: 1, ee: 1, so: 1, text: '', st: 2, cp: 2, ms: 4, el: 4, lm: 2, cs: 0, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Formwork Leak Review': false, 'Vibrator Tool Mobilized': false } },
  { id: 'T8', ref: '4.1', desc: 'Curing Period', task: '5-Day Continuous Pad Concrete Wet Curing (Hold)', duration: 5, progress: 0, pm: 0, se: 0, ee: 0, so: 1, st: 0, cp: 0, ms: 1, el: 0, lm: 0, cs: 0, hl: 1, assigned: {}, qaStatus: 'PENDING', checklist: { 'Wet Sack Blanket Placed': false, 'Daily Water Log Checklist': false } },
  { id: 'T9', ref: '5.0', desc: 'Assembly & Splicing', task: 'MV Cable Terminations & Splicing', duration: 3, progress: 0, pm: 1, se: 1, ee: 2, so: 1, st: 2, cp: 2, ms: 0, el: 4, lm: 2, cs: 3, hl: 2, assigned: {}, qaStatus: 'PENDING', checklist: { 'Cable Splicing Certified': false, 'High Potential Test Logged': false } },
  { id: 'T10', ref: '6.0', desc: 'Commissioning', task: 'Substation Transformer Energization & Testing', duration: 2, progress: 0, pm: 1, se: 1, ee: 2, so: 1, st: 0, cp: 0, ms: 0, el: 4, lm: 1, cs: 1, hl: 1, assigned: {}, qaStatus: 'PENDING', checklist: { 'Transformer Insulation Test OK': false, 'Trip Relays Verified': false } },
];

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

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading'); 
  
  // Responsive navigation tabs
  const [mobileDisplayTab, setMobileDisplayTab] = useState('tasks'); 
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isMetadataCollapsed, setIsMetadataCollapsed] = useState(true);

  // Active Labor Profile Toggle
  const [laborProfile, setLaborProfile] = useState('electrical');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Theme Config
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('mbv_dark_mode') !== 'false';
  });

  const [projectList, setProjectList] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('master-schedule');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
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

  // Overlays & Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Filtering states
  const [filterSearchQuery, setFilterSearchQuery] = useState('');
  const [filterStatusTag, setFilterStatusTag] = useState('ALL');

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 4000);
  }, []);

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
      if (!auth) return;
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Bypassed default auth framework: ", err);
      }
    };
    initAuth();

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, setUser);
      return () => unsubscribe();
    } else {
      setView('editor');
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activeRouteParam = urlParams.get('project');

    const localSchedules = localStorage.getItem('mbv_cloud_registry');
    let loadedRegistry = localSchedules ? JSON.parse(localSchedules) : [];

    if (activeRouteParam) {
      fetchSiteSchedule(activeRouteParam, loadedRegistry);
    } else {
      const hasVisited = localStorage.getItem('mbv_has_visited');
      if (!hasVisited) {
        setShowOnboarding(true);
        localStorage.setItem('mbv_has_visited', 'true');
      }
      setView('editor');
    }
  }, [user]);

  const fetchSiteSchedule = async (id, fallbackRegistry) => {
    if (!db) {
      showToast("Cloud config offline. Running local sandbox mode.");
      setView('editor');
      return;
    }
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const payload = snap.data();
        setTasks(payload.tasks || INITIAL_TASKS);
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
        showToast(`"${payload.appTitle}" downloaded from Cloud!`);
      } else {
        showToast("Site data not found on cloud. Initializing locally.");
      }
    } catch (e) {
      console.error(e);
      showToast("Error pulling cloud baseline. Offline mode triggered.");
    } finally {
      setView('editor');
    }
  };

  const handleCreateNewProject = () => {
    if (!newProjectName.trim()) {
      showToast("Please enter a valid project title.");
      return;
    }

    const nextId = newProjectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const duplicateCheck = projectList.find(p => p.id === nextId);
    if (duplicateCheck) {
      showToast("A project with this shortcode reference already exists.");
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
    setDocMetadata({
      projectName: newProjectName.toUpperCase(),
      location: "Active Infrastructure Phase",
      docNo: "DOC-CIT-MBV-" + Math.floor(100 + Math.random() * 900),
      revision: "01",
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
    });

    const url = new URL(window.location.href);
    url.searchParams.set('project', nextId);
    window.history.replaceState({}, document.title, url.toString());

    setShowCreateProjectModal(false);
    setNewProjectName('');
    showToast(`"${newProjectName}" deployed!`);
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
      showToast(`Switched locally to: ${matchingProject.title}`);
    }

    const url = new URL(window.location.href);
    url.searchParams.set('project', id);
    window.history.replaceState({}, document.title, url.toString());
  };

  const handleDeleteProject = (id) => {
    setProjectToDelete(id);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    const freshRegistry = projectList.filter(p => p.id !== projectToDelete);
    setProjectList(freshRegistry);
    localStorage.setItem('mbv_cloud_registry', JSON.stringify(freshRegistry));
    
    showToast("Project workspace purged.");
    setProjectToDelete(null);

    if (activeProjectId === projectToDelete) {
      handleSwitchProject('master-schedule');
    }
  };

  const handleShareToCloud = async () => {
    if (!db) {
      showToast("Database server offline.");
      return;
    }
    setIsSavingCloud(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeProjectId);
      await setDoc(docRef, {
        tasks,
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

      showToast("Cloud Master Updated! Share link ready.");
    } catch (e) {
      console.error(e);
      showToast("Error updating database core layer.");
    } finally {
      setIsSavingCloud(false);
    }
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
        progress: task.progress || 0 
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

  const updateTask = (id, field, value) => setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  
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
      task: 'New Wiring / Conduit Installation Line', 
      duration: 1, 
      progress: 0, 
      pm: 0, se: 0, ee: 0, so: 0, st: 0, cp: 0, ms: 0, el: 1, lm: 0, cs: 0, hl: 1,
      assigned: {}, 
      qaStatus: 'PENDING', 
      checklist: {} 
    }]);
    showToast("Added fresh schedule parameters block.");
  };

  const triggerTaskRemove = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    showToast("Schedule block removed.");
  };

  const toggleChecklistItem = (taskId, itemName) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const currentChecklist = { ...(t.checklist || {}) };
        currentChecklist[itemName] = !currentChecklist[itemName];
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
    
    if (isDarkMode) {
      if (isHold) return 'bg-rose-950/20 border-rose-900/40 hover:bg-rose-950/30';
      if (isApproved) return 'bg-emerald-950/20 border-emerald-900/40 hover:bg-emerald-950/30';
      return index % 2 === 0 ? 'bg-[#131c2e]/60 border-slate-800/40 hover:bg-slate-800/30' : 'bg-[#131c2e]/30 border-slate-800/40 hover:bg-slate-800/20';
    } else {
      if (isHold) return 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/30';
      if (isApproved) return 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/30';
      return index % 2 === 0 ? 'bg-white border-slate-200/60 hover:bg-slate-50/40' : 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50/30';
    }
  };

  const getBadgeStyle = (status) => {
    if (status === 'APPROVED') {
      return 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/40';
    }
    if (status === 'HOLD') {
      return 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/40 dark:border-rose-500/50 font-bold';
    }
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 dark:border-blue-500/40';
  };

  if (view === 'loading') {
    return (
      <div className="h-screen w-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500 h-10 w-10"/>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Accessing Mother Core Infrastructure...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50/60 text-slate-800'}`}>
      
      {/* High contrast custom font injection & viewport scroll rules */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#334155' : '#cbd5e1'}; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
        
        .gantt-grid-light {
          background-image: 
            linear-gradient(to right, rgba(226, 232, 240, 0.7) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(226, 232, 240, 0.7) 1px, transparent 1px);
          background-size: 44px 100%, 100% 54px;
        }
        
        .gantt-grid-dark {
          background-image: 
            linear-gradient(to right, rgba(30, 41, 59, 0.7) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(30, 41, 59, 0.7) 1px, transparent 1px);
          background-size: 44px 100%, 100% 54px;
        }

        /* Prevent system scroll collision in dynamic nested layout viewports */
        .mobile-scroll-container {
          height: calc(100vh - 160px);
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch;
        }

        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          body { background-color: #ffffff !important; color: #000000 !important; }
          header, button, .print\\:hidden { display: none !important; }
          #gantt-export-zone { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
        }
      `}} />

      {/* Dynamic Feedback Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 bg-slate-900/95 text-white border border-slate-750 px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-2.5 backdrop-blur-md transition-all print:hidden">
          <CheckCircle2 className="text-emerald-400" size={16}/>
          <span className="text-xs font-semibold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* ACTION CONTROLS HEADER BAR */}
      <header className={`border-b px-4 py-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-sm z-20 shrink-0 print:hidden transition-colors ${isDarkMode ? 'bg-[#131c2e] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between lg:justify-start gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-blue-600 p-2 rounded-xl text-white shrink-0 shadow-lg shadow-blue-500/15">
              <LayoutDashboard size={18}/>
            </div>
            
            {/* WORKSPACE DROPDOWN SELECTOR */}
            <div className="flex flex-col min-w-0" ref={dropdownRef}>
              <div className="relative">
                <button
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all text-xs font-semibold select-none ${
                    isDarkMode 
                      ? 'bg-[#0f172a] hover:bg-[#1e293b] text-white border-slate-700 hover:border-slate-500' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <Folder className="text-blue-500 shrink-0" size={14}/>
                  <span className="truncate max-w-[150px] sm:max-w-[280px]">
                    {projectList.find(p => p.id === activeProjectId)?.title || 'Switch Project Workspace...'}
                  </span>
                  <ChevronDown className="text-slate-500 shrink-0" size={14}/>
                </button>

                {isProjectDropdownOpen && (
                  <div className={`absolute left-0 mt-2 w-80 rounded-2xl shadow-2xl border p-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-200 ${
                    isDarkMode ? 'bg-[#131c2e] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                  }`}>
                    <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-slate-400 border-b border-slate-850/40 uppercase mb-2">
                      Master Projects Registry
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                      {projectList.map((proj) => (
                        <div 
                          key={proj.id}
                          onClick={() => {
                            handleSwitchProject(proj.id);
                            setIsProjectDropdownOpen(false);
                            showToast(`Switched active environment to "${proj.title}"`);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                            activeProjectId === proj.id 
                              ? 'bg-blue-600/10 text-blue-500 dark:text-blue-400 border border-blue-500/30' 
                              : (isDarkMode ? 'hover:bg-slate-800/80 text-slate-300' : 'hover:bg-slate-50 text-slate-700')
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Folder className={activeProjectId === proj.id ? 'text-blue-400' : 'text-slate-400'} size={13}/>
                            <span className="truncate">{proj.title}</span>
                          </div>
                          {proj.id !== 'master-schedule' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(proj.id);
                                setIsProjectDropdownOpen(false);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                              title="Delete project context"
                            >
                              <Trash2 size={13}/>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-slate-800/40 mt-2.5 pt-2.5">
                      <button 
                        onClick={() => {
                          setShowCreateProjectModal(true);
                          setIsProjectDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all text-xs font-bold uppercase tracking-wider"
                      >
                        <Plus size={14}/> Add New Project Sub-Phase
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-wider truncate mt-1 pl-1">
                {appSubtitle}
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0 lg:hidden">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-white border-slate-300 text-slate-600'}`}>
              {isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className={`p-2 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-600'}`}>
              <Settings size={16}/>
            </button>
          </div>
        </div>

        {/* Action Controls Cluster */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Active Field Discipline Switcher */}
          <div className={`flex items-center gap-1 border rounded-xl p-1 transition-colors ${isDarkMode ? 'bg-[#0b0f19]/80 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 text-slate-400 hidden xl:inline">Discipline:</span>
            <button 
              onClick={() => {
                setLaborProfile('civil');
                showToast("Crew template switched to Civil Engineering baseline");
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                laborProfile === 'civil' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 dark:hover:text-slate-100'
              }`}
            >
              Civil
            </button>
            <button 
              onClick={() => {
                setLaborProfile('electrical');
                showToast("Crew template switched to Electrical Grid Operations ⚡");
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                laborProfile === 'electrical' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 dark:hover:text-slate-100'
              }`}
            >
              Electrical ⚡
            </button>
          </div>

          <button 
            onClick={() => setIsMetadataCollapsed(!isMetadataCollapsed)}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
              isDarkMode ? 'bg-[#0f172a] hover:bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {isMetadataCollapsed ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
            <span className="font-semibold text-xs px-0.5">Specifications</span>
          </button>

          {/* Environmental Multiplier Dropdown */}
          <div className={`flex items-center gap-1 border rounded-xl px-2.5 py-1.5 transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
            <select 
              value={weatherFactor} 
              onChange={(e) => {
                setWeatherFactor(e.target.value);
                showToast(`Weather threshold set to ${e.target.value.replace('_', ' ').toUpperCase()}`);
              }} 
              className={`text-xs font-semibold bg-transparent outline-none border-none text-blue-500 cursor-pointer ${isDarkMode ? '[&_option]:bg-slate-900 [&_option]:text-white' : '[&_option]:bg-white [&_option]:text-slate-800'}`}
            >
              <option value="sunny">☀️ Normal Environment</option>
              <option value="heavy_rain">🌧️ Rain Slowdown (+35%)</option>
              <option value="typhoon">🌀 Typhoon Suspension (+80%)</option>
            </select>
          </div>

          <div className={`hidden lg:flex items-center border rounded-xl px-2.5 py-1.5 text-xs ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
            <input type="date" value={projectStartDate} onChange={(e) => setProjectStartDate(e.target.value)} className="outline-none bg-transparent cursor-pointer font-semibold text-blue-500" />
          </div>

          <div className="flex gap-2">
            <button onClick={addTask} className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-blue-500/10">
              <Plus size={14}/> <span>Add Task Row</span>
            </button>
            
            <button onClick={triggerSystemPrint} className="hidden lg:flex bg-slate-800 hover:bg-slate-750 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider items-center gap-1.5 transition">
              <Printer size={14}/> Export Sheet
            </button>

            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`hidden lg:block p-2 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-[#0f172a] border-slate-700 hover:bg-slate-800 text-amber-400' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-600'}`}>
              {isDarkMode ? <Sun size={14}/> : <Moon size={14}/>}
            </button>

            <button 
              onClick={handleShareToCloud} 
              disabled={isSavingCloud} 
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-md"
              title="Push variations to centralized cloud instance"
            >
              {isSavingCloud ? <Loader2 className="animate-spin" size={14}/> : <Share2 size={14}/>} 
              <span>Sync Cloud</span>
            </button>
            
            <button onClick={() => setIsSettingsOpen(true)} className={`hidden lg:block p-2 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-200' : 'bg-white border-slate-300'}`}>
              <Settings size={14}/>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DISPLAY CONTROL TABS */}
      {isMobileViewport && (
        <div className={`flex border-b text-xs font-semibold uppercase tracking-wider shrink-0 print:hidden ${
          isDarkMode ? 'bg-[#131c2e] border-slate-800' : 'bg-white border-slate-250'
        }`}>
          <button 
            onClick={() => setMobileDisplayTab('tasks')}
            className={`flex-1 py-3.5 text-center transition-colors font-bold ${
              mobileDisplayTab === 'tasks' 
                ? 'border-b-2 border-blue-500 text-blue-500 bg-blue-500/5' 
                : isDarkMode ? 'text-slate-100' : 'text-slate-600'
            }`}
          >
            📋 Inspection Cards
          </button>
          <button 
            onClick={() => setMobileDisplayTab('gantt')}
            className={`flex-1 py-3.5 text-center transition-colors font-bold ${
              mobileDisplayTab === 'gantt' 
                ? 'border-b-2 border-blue-500 text-blue-500 bg-blue-500/5' 
                : isDarkMode ? 'text-slate-100' : 'text-slate-600'
            }`}
          >
            📊 Gantt Timeline
          </button>
          <button 
            onClick={() => setMobileDisplayTab('qa')}
            className={`flex-1 py-3.5 text-center transition-colors font-bold ${
              mobileDisplayTab === 'qa' 
                ? 'border-b-2 border-blue-500 text-blue-500 bg-blue-500/5' 
                : isDarkMode ? 'text-slate-100' : 'text-slate-600'
            }`}
          >
            🛡️ QA/QC Status
          </button>
        </div>
      )}

      {/* CORE WORKSPACE APPLICATION CANVAS */}
      <main className="flex-1 overflow-hidden p-3 md:p-6 flex flex-col min-h-0">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-4 flex-1 min-h-0">

          {/* EXTENDED SPECIFICATIONS INFRASTRUCTURE CARD */}
          {!isMetadataCollapsed && (
            <div id="gantt-export-zone" className={`rounded-2xl border p-4 sm:p-5 flex flex-col gap-4 shadow-sm shrink-0 transition-all duration-300 ${
              isDarkMode ? 'bg-[#131c2e] border-slate-700' : 'bg-white border-slate-250'
            }`}>
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/4 flex justify-start items-center">
                  {logos.left ? <img src={logos.left} className="h-10 object-contain" alt="Left Signatory" /> : <CiticoreLogo/>}
                </div>
                
                <div className="w-full md:w-1/2 text-center flex flex-col">
                  <input 
                    value={docMetadata.projectName} 
                    onChange={(e) => setDocMetadata({...docMetadata, projectName: e.target.value.toUpperCase()})}
                    className={`text-center font-bold text-sm sm:text-base tracking-tight bg-transparent uppercase border-b border-transparent hover:border-slate-500 focus:border-blue-500 outline-none w-full transition-colors ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}
                    placeholder="Project Title..."
                  />
                  <input 
                    value={docMetadata.location} 
                    onChange={(e) => setDocMetadata({...docMetadata, location: e.target.value})}
                    className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-transparent border-none outline-none mt-1"
                    placeholder="Location Hub Context..."
                  />
                </div>

                <div className="w-full md:w-1/4 flex justify-end items-center">
                  {logos.right ? <img src={logos.right} className="h-10 object-contain" alt="Right Signatory" /> : <MbvLogo/>}
                </div>
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-bold uppercase tracking-wider border-t pt-4 transition-colors ${
                isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'
              }`}>
                <div className="flex flex-col gap-1 border-r border-slate-800/40">
                  <span className="text-slate-400 dark:text-slate-400">Document No Reference:</span>
                  <input value={docMetadata.docNo} onChange={(e) => setDocMetadata({...docMetadata, docNo: e.target.value})} className={`font-mono bg-transparent outline-none w-full font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} />
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-800/40 px-1">
                  <span className="text-slate-400 dark:text-slate-400">Revision Chain:</span>
                  <input value={docMetadata.revision} onChange={(e) => setDocMetadata({...docMetadata, revision: e.target.value})} className={`bg-transparent outline-none w-full font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} />
                </div>
                <div className="flex flex-col gap-1 border-r border-slate-800/40 px-1">
                  <span className="text-slate-400 dark:text-slate-400">Effective Log:</span>
                  <input value={docMetadata.date} onChange={(e) => setDocMetadata({...docMetadata, date: e.target.value})} className={`bg-transparent outline-none w-full font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} />
                </div>
                <div className="flex flex-col gap-1 pl-1">
                  <span className="text-slate-400 dark:text-slate-400">Project Launch Day:</span>
                  <span className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{projectStartDate}</span>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC REGISTRY SEARCH AND PILL SYSTEM BAR */}
          <div className={`p-3 rounded-2xl border flex flex-col md:flex-row justify-between items-center gap-3 shrink-0 ${
            isDarkMode ? 'bg-[#131c2e] border-slate-700' : 'bg-white border-slate-250'
          }`}>
            <div className="flex items-center gap-2 w-full md:w-1/2">
              <input 
                type="text" 
                placeholder="Search active project rows by task descriptions, tags or code reference..."
                value={filterSearchQuery}
                onChange={(e) => setFilterSearchQuery(e.target.value)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border outline-none w-full transition-colors ${
                  isDarkMode 
                    ? 'bg-[#0f172a] border-slate-700 text-white placeholder-slate-400 focus:border-blue-500' 
                    : 'bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-500 focus:border-blue-500'
                }`}
              />
            </div>
            
            <div className="flex flex-wrap gap-1.5 shrink-0 w-full md:w-auto justify-start md:justify-end">
              {['ALL', 'PENDING', 'HOLD', 'APPROVED'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterStatusTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    filterStatusTag === tag
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : (isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-100 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100')
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* VIEWPORT PRESENTATION PANELS */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            
            {/* 1. MOBILE NATIVE COMPACT SITE CARDS (CONSTRAINED CONTAINER SCROLL) */}
            {(!isMobileViewport || mobileDisplayTab === 'tasks') && isMobileViewport && (
              <div className="mobile-scroll-container space-y-4 pb-24">
                {filteredTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => setActiveTaskModal(task.id)}
                    className={`p-5 rounded-2xl border flex flex-col gap-4 relative shadow-sm cursor-pointer transition-transform hover:scale-[1.002] ${
                      isDarkMode ? 'bg-[#131c2e] border-slate-700 text-white' : 'bg-white border-slate-250 text-slate-900'
                    }`}
                  >
                    {/* Header: Badge Separation Architecture */}
                    <div className="flex justify-between items-center gap-2 border-b pb-3 border-slate-200/40 dark:border-slate-800/40">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-xs text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md shrink-0">{task.ref}</span>
                        <span className="font-bold text-[10px] tracking-wider uppercase text-slate-400 dark:text-slate-300 truncate max-w-[150px]">{task.desc}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider shrink-0 ${getBadgeStyle(task.qaStatus)}`}>
                        {task.qaStatus}
                      </span>
                    </div>

                    <h4 className={`text-base font-bold tracking-tight leading-snug ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>{task.task}</h4>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300 mr-2">Duration:</span>
                        <div className={`flex items-center rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateTask(task.id, 'duration', Math.max(1, task.duration - 1)); }} 
                            className={`p-2 transition-colors ${isDarkMode ? 'text-slate-300 hover:text-blue-400' : 'text-slate-700 hover:text-blue-500'}`}
                          >
                            <Minus size={13}/>
                          </button>
                          <span className="font-mono font-bold text-xs px-2 text-blue-600 dark:text-blue-400">{task.duration}d</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateTask(task.id, 'duration', task.duration + 1); }} 
                            className={`p-2 transition-colors ${isDarkMode ? 'text-slate-300 hover:text-blue-400' : 'text-slate-700 hover:text-blue-500'}`}
                          >
                            <Plus size={13}/>
                          </button>
                        </div>
                      </div>

                      <span className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                        Inspect Context <ChevronRight size={14}/>
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                      <div className="flex justify-between text-xs font-semibold text-slate-400 dark:text-slate-200">
                        <span>PROGRESS STATUS VALUE</span>
                        <span className="font-mono font-bold">{task.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{width: `${task.progress || 0}%`}}></div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 text-[11px] font-semibold">
                      <span className="text-slate-400 dark:text-slate-300 flex items-center gap-1 uppercase tracking-wider"><Users size={13}/> CREW ({task.totalManpower}):</span>
                      {activeRoles.filter(r => (parseInt(task[r.key]) || 0) > 0).map(r => (
                        <span key={r.key} className="bg-slate-150 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 px-2 py-0.5 rounded font-bold text-slate-700 dark:text-slate-200">
                          {r.icon} {r.label}:{task[r.key]}
                        </span>
                      ))}
                    </div>

                    {/* Isolated Bottom Action Footer - Overlaps Prevented */}
                    <div className="flex justify-end pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                      <button 
                        onClick={(e) => { e.stopPropagation(); triggerTaskRemove(task.id); }}
                        className="text-rose-500 hover:text-rose-600 font-bold text-xs uppercase flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                      >
                        <Trash2 size={13}/> Delete Task Parameter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. DYNAMIC WORKSPACE HORIZONTAL TIMELINE MATRIX */}
            {(!isMobileViewport || mobileDisplayTab === 'gantt') && (
              <div className={`flex border rounded-2xl overflow-hidden flex-1 shadow-sm transition-colors ${isDarkMode ? 'bg-[#131c2e]/10 border-slate-700' : 'bg-slate-50/50 border-slate-250'}`}>
                
                {/* Left side static sheet layout */}
                <div className={`hidden lg:flex w-[45%] md:w-[35%] lg:w-[45%] flex-col shrink-0 z-10 border-r relative transition-colors ${
                  isDarkMode 
                    ? 'bg-[#131c2e] border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]' 
                    : 'bg-white border-slate-250 shadow-[2px_0_5px_-2px_rgba(226,232,240,0.5)]'
                }`}>
                  
                  <div className={`h-[48px] min-h-[48px] max-h-[48px] p-2 font-bold text-[10px] flex items-center uppercase tracking-wider sticky top-0 z-25 border-b transition-colors ${
                    isDarkMode ? 'bg-[#0f172a] border-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600 border-slate-250'
                  }`}>
                    <span className="w-10 text-center font-bold">Ref Code</span>
                    <span className="flex-grow px-3 truncate font-bold">Execution Parameter Description</span>
                    <span className="w-12 text-center shrink-0 font-bold text-slate-400">Days</span>
                    <span className="w-16 text-center shrink-0 font-bold text-slate-400">Progress</span>
                    <span className="w-8 print:hidden shrink-0"></span>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-0">
                    {filteredTasks.map((task, index) => {
                      return (
                        <div 
                          key={task.id} 
                          className={`h-[54px] min-h-[54px] max-h-[54px] flex items-center text-xs group transition-all border-b ${getRowBgColor(task, index)}`}
                        >
                          <div className="w-10 h-full text-center flex items-center justify-center relative shrink-0">
                            <GripVertical className="text-slate-500 absolute left-0 cursor-move opacity-0 group-hover:opacity-100 transition-opacity print:hidden" size={12}/>
                            <input 
                              value={task.ref} 
                              onChange={(e) => updateTask(task.id, 'ref', e.target.value)} 
                              className={`font-mono font-bold text-center w-full bg-transparent outline-none focus:text-blue-500 text-xs ${
                                isDarkMode ? 'text-slate-300' : 'text-slate-700'
                              }`} 
                            />
                          </div>
                          
                          <div className="flex-grow h-full flex flex-col justify-center px-3 border-l border-slate-100 dark:border-slate-800/40 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[9px] text-blue-500 dark:text-blue-400 uppercase tracking-wider shrink-0">
                                {task.desc}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 border ${getBadgeStyle(task.qaStatus)}`}>
                                {task.qaStatus}
                              </span>
                            </div>
                            <input 
                              value={task.task} 
                              onChange={(e) => updateTask(task.id, 'task', e.target.value)} 
                              className={`font-bold text-xs sm:text-sm bg-transparent outline-none rounded-md w-full truncate leading-tight transition-all p-0.5 -ml-0.5 ${
                                isDarkMode ? 'text-white' : 'text-slate-800'
                              }`} 
                            />
                          </div>
                          
                          <div className="w-12 h-full border-l border-slate-100 dark:border-slate-800/40 flex items-center justify-center p-1 shrink-0">
                            <input 
                              type="number" min="1" value={task.duration} 
                              onChange={(e) => updateTask(task.id, 'duration', parseInt(e.target.value) || 1)} 
                              className={`w-full text-center border rounded-lg py-1 text-xs font-bold outline-none transition-all ${
                                isDarkMode 
                                  ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' 
                                  : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                              }`} 
                            />
                          </div>

                          <div className="w-16 h-full border-l border-slate-100 dark:border-slate-800/40 flex flex-col items-center justify-center px-2 shrink-0">
                            <div className="flex items-center gap-0.5 w-full justify-between mb-1 font-bold text-xs">
                              <input 
                                type="number" min="0" max="100" value={task.progress || 0} 
                                onChange={(e) => updateTask(task.id, 'progress', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} 
                                className={`w-8 text-left bg-transparent rounded outline-none font-mono font-bold ${
                                  isDarkMode ? 'text-white' : 'text-slate-800'
                                }`} 
                              />
                              <span className="text-[9px] text-slate-400 font-semibold">%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{width: `${task.progress || 0}%`}}></div>
                            </div>
                          </div>
                          
                          <div className="w-8 h-full flex items-center justify-center shrink-0 border-l border-slate-100 dark:border-slate-800/40 print:hidden">
                            <button onClick={() => triggerTaskRemove(task.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1" title="Purge parameter from list"><Trash2 size={14}/></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-[80px] p-4 flex flex-col justify-center border-t border-slate-100 dark:border-slate-800/40 sticky bottom-0 z-20 print:hidden">
                     <button onClick={addTask} className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all px-2 py-2.5 rounded-xl border border-dashed w-full justify-center ${
                       isDarkMode ? 'bg-[#131c2e] text-blue-400 hover:text-blue-300 border-blue-900/40' : 'bg-blue-50 text-blue-600 border-blue-200'
                     }`}>
                       <Plus size={14}/> Add New Parameter Line
                     </button>
                  </div>
                </div>

                {/* Right side dynamic scale scroll viewport container */}
                <div id="gantt-scroll-area" className="flex-1 flex flex-col bg-[#0b0f19]/5 relative overflow-x-auto print:overflow-visible scrollbar-thin">
                  
                  <div className={`h-[48px] min-h-[48px] max-h-[48px] flex min-w-max sticky top-0 z-25 border-b transition-colors ${
                    isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-slate-100 border-slate-250'
                  }`}>
                    {headerDays.map(day => {
                      const dateStr = generateDateHeaderStr(projectStartDate, day);
                      const isWeekendDay = new Date(projectStartDate).getTime() + day * 86400000;
                      const isSatSun = new Date(isWeekendDay).getDay() === 0 || new Date(isWeekendDay).getDay() === 6;
                      return (
                        <div key={day} className={`w-[44px] h-full flex-shrink-0 text-center border-r flex flex-col justify-center transition-colors ${
                          isDarkMode 
                            ? `border-slate-800/60 ${isSatSun ? 'bg-slate-900/40' : ''}` 
                            : `border-slate-200/60 ${isSatSun ? 'bg-slate-200/50' : ''}`
                        }`}>
                          <span className={`text-[10px] font-bold leading-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{dateStr.split(' ')[0]}</span>
                          <span className="text-[8px] font-bold text-slate-400 leading-tight uppercase tracking-wide">{dateStr.split(' ')[1]}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className={`flex-1 min-w-max relative transition-all duration-200 ${
                    isDarkMode ? "gantt-grid-dark" : "gantt-grid-light"
                  }`}>
                     {filteredTasks.map((task) => {
                        const isHold = task.qaStatus === 'HOLD';
                        const isApproved = task.qaStatus === 'APPROVED';
                        
                        return (
                          <div key={task.id} className={`h-[54px] min-h-[54px] max-h-[54px] border-b relative flex items-center transition-colors ${isDarkMode ? 'border-slate-800/60' : 'border-slate-200/60'}`}>
                             <div 
                               onClick={() => setActiveTaskModal(task.id)}
                               className={`absolute h-[28px] rounded-lg shadow-sm transition-all flex items-center justify-between overflow-hidden text-xs font-bold border cursor-pointer hover:scale-[1.01] hover:ring-2 hover:ring-blue-500/30 print:hover:ring-0
                                 ${isHold 
                                   ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-500/40' 
                                   : isApproved 
                                     ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-500/40' 
                                     : 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-500/40'}`}
                               style={{ left: `${(task.startDays) * 44 + 2}px`, width: `${(task.adjustedDuration * 44) - 4}px` }}
                             >
                               <div className={`absolute top-0 left-0 h-full ${
                                 isHold ? 'bg-rose-500/10 dark:bg-rose-500/20' : isApproved ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : 'bg-blue-500/10 dark:bg-blue-500/20'
                               }`} style={{ width: `${task.progress || 0}%` }} />
                               
                               <div className="absolute inset-0 flex justify-between items-center px-2.5 z-10 pointer-events-none">
                                 <span className="font-bold text-[10px] sm:text-[11px] truncate max-w-[85%]">
                                   <span className="opacity-75 mr-1 text-[9px] font-semibold">{task.ref}</span>
                                   {isMobileViewport ? task.task : `${task.adjustedDuration} Days`}
                                 </span>
                                 
                                 <div className="flex gap-1.5 items-center">
                                   <span className={`flex items-center gap-0.5 text-[8.5px] font-bold border px-1 py-0.5 rounded shadow-sm pointer-events-auto ${
                                     isDarkMode 
                                       ? 'bg-slate-900 border-slate-700 text-slate-100' 
                                       : 'bg-white border-slate-200 text-slate-800'
                                   }`}>
                                     <UserPlus size={10}/> Crew
                                   </span>
                                   {task.totalManpower > 0 && !isMobileViewport && (
                                     <span className={`hidden md:flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${
                                       isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700 border border-slate-300'
                                     }`}>
                                       <Users size={10}/> {task.totalManpower}
                                     </span>
                                   )}
                                 </div>
                               </div>
                             </div>
                          </div>
                        )
                     })}
                  </div>
                  
                  {/* Dynamic Crew Loading Histogram Footer Component */}
                  <div className={`h-[80px] border-t flex min-w-max items-end relative sticky bottom-0 z-20 transition-colors ${
                    isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-300'
                  }`}>
                    <div className={`absolute left-3 top-3 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-2 py-1 rounded shadow border ${
                      isDarkMode ? 'bg-[#0b0f19] text-slate-200 border-slate-700' : 'bg-slate-50 text-slate-700 border-slate-300'
                    }`}>
                      <BarChart3 className="text-blue-500" size={12}/> Manpower Curve Distribution Profile
                    </div>
                    {headerDays.map(day => {
                      const dayManpower = activeFlowTasks.reduce((sum, task) => {
                        if (day >= task.startDays && day < task.startDays + task.adjustedDuration) return sum + task.totalManpower;
                        return sum;
                      }, 0);
                      const heightPercentage = maxManpowerVal > 0 ? (dayManpower / maxManpowerVal) * 100 : 0;
                      return (
                        <div key={`mp-${day}`} className={`w-[44px] h-full flex-shrink-0 border-r flex flex-col justify-end items-center pb-2 relative group ${
                          isDarkMode ? 'border-slate-800/60' : 'border-slate-200'
                        }`}>
                          <div 
                            className={`w-5 rounded-t transition-all flex items-end justify-center ${
                              dayManpower > 12 
                                ? 'bg-rose-500/40 hover:bg-rose-500/65' 
                                : (isDarkMode ? 'bg-indigo-950/70 hover:bg-indigo-900' : 'bg-indigo-200 hover:bg-indigo-300')
                            }`} 
                            style={{ height: `${heightPercentage * 0.6}%`, minHeight: dayManpower > 0 ? '4px' : '0' }} 
                          />
                          <span className={`text-[9.5px] font-mono font-bold mt-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>{dayManpower > 0 ? dayManpower : '-'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* 3. SAFETY CO-SIGN FLAGS REGISTER (CONSTRAINED CONTAINER SCROLL) */}
            {isMobileViewport && mobileDisplayTab === 'qa' && (
              <div className="mobile-scroll-container space-y-4 pb-24">
                <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'bg-[#131c2e] border-slate-700' : 'bg-white border-slate-250'}`}>
                  <ShieldCheck className="mx-auto text-emerald-500 mb-3" size={32}/>
                  <h4 className="text-sm font-bold uppercase tracking-wider">QA/QC Hold Point Inspection Register</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-200 mt-2 leading-relaxed font-normal">
                    Select any project parameter block below to evaluate the engineering checklist gate structure and authorize approval.
                  </p>
                </div>
                {activeFlowTasks.map(task => (
                  <div 
                    key={`qa-row-${task.id}`}
                    onClick={() => setActiveTaskModal(task.id)}
                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer shadow-sm transition-all ${
                      isDarkMode ? 'bg-[#131c2e] border-slate-700 hover:bg-slate-800 text-white' : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="font-mono text-xs text-blue-500 dark:text-blue-400 font-bold shrink-0">{task.ref}</span>
                      <span className="text-sm font-bold truncate text-slate-900 dark:text-slate-100">{task.task}</span>
                    </div>
                    <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${getBadgeStyle(task.qaStatus)}`}>
                      {task.qaStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-300 font-semibold tracking-wide shrink-0 border-t pt-4 border-slate-800/40">
             <span className="flex items-center gap-1.5"><Info size={14}/> Mother link connection secure. System running in localized sandbox frame instance.</span>
             <span className="flex items-center gap-3">
               <span>Global Completed Metrics: <strong className="text-blue-500 font-bold">{overallGlobalProgress}%</strong></span>
               <span>Total Buffer Span: <strong className="text-blue-500 font-bold">{totalDays} Days</strong></span>
             </span>
          </div>

        </div>
      </main>

      {/* FIELD QUALITY INSPECTOR CHECKLIST CONTROL MODAL */}
      {activeTaskModal && (() => {
        const currentTaskEditing = activeFlowTasks.find(t => t.id === activeTaskModal);
        if (!currentTaskEditing) return null;
        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
            <div className={`rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border flex flex-col max-h-[90vh] transition-all duration-300 ${
              isDarkMode ? 'bg-[#131c2e] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}>
              
              <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                <div>
                  <h3 className="text-sm sm:text-base font-bold flex items-center gap-2"><ClipboardCheck className="text-blue-500" size={18}/> Field QC Sign-off Registry</h3>
                  <p className="text-[11px] text-slate-400 font-bold mt-1"><span className="text-blue-500 bg-blue-500/15 border border-blue-500/20 px-1.5 py-0.5 rounded mr-1.5">{currentTaskEditing.ref}</span> {currentTaskEditing.task}</p>
                </div>
                <button onClick={() => setActiveTaskModal(null)} className={`p-1.5 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-400 border-slate-300'}`}><X size={14}/></button>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-5 scrollbar-thin">
                
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Duration Allocation Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-300">DURATION SCALE (DAYS)</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <button 
                          onClick={() => updateTask(currentTaskEditing.id, 'duration', Math.max(1, currentTaskEditing.duration - 1))}
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-bold text-blue-500 px-2">{currentTaskEditing.duration} Days</span>
                        <button 
                          onClick={() => updateTask(currentTaskEditing.id, 'duration', currentTaskEditing.duration + 1)}
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-300">COMPLETION VALUE RANGE (%)</span>
                      <input 
                        type="range" min="0" max="100" 
                        value={currentTaskEditing.progress || 0}
                        onChange={(e) => updateTask(currentTaskEditing.id, 'progress', parseInt(e.target.value) || 0)}
                        className="mt-3.5 w-full cursor-pointer accent-blue-500 text-blue-500 bg-slate-300 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authorized Inspection Threshold</h4>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { status: 'PENDING', label: 'In Progress', desc: 'Discipline construction running', border: 'border-blue-500/30 text-blue-400', bg: 'bg-blue-500/10' },
                      { status: 'HOLD', label: 'QC HOLD POINT', desc: 'Prerequisite verification required', border: 'border-rose-500/30 text-rose-400', bg: 'bg-rose-500/10' },
                      { status: 'APPROVED', label: 'RELEASE SIGNED', desc: 'Site engineer stamp finalized', border: 'border-emerald-500/30 text-emerald-400', bg: 'bg-emerald-500/10' }
                    ].map((card) => (
                      <div
                        key={card.status}
                        onClick={() => {
                          updateTask(currentTaskEditing.id, 'qaStatus', card.status);
                          showToast(`Discipline status matrix updated to ${card.status}`);
                        }}
                        className={`p-2.5 sm:p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                          currentTaskEditing.qaStatus === card.status
                            ? `ring-2 ring-blue-500 ${card.border} ${card.bg}`
                            : (isDarkMode ? 'border-slate-800 bg-slate-900 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-600')
                        }`}
                      >
                        <span className="block font-bold text-[9px] sm:text-[11px] uppercase tracking-wide">{card.label}</span>
                        <span className="block text-[7.5px] sm:text-[8.5px] opacity-75 mt-0.5 leading-none font-medium">{card.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5"><ListTodo className="text-blue-500" size={12}/> Engineering Sign-off Parameters</h4>
                  
                  {Object.keys(currentTaskEditing.checklist || {}).length === 0 ? (
                    <p className="text-xs text-slate-500 italic font-medium">No custom verification steps initialized.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {Object.entries(currentTaskEditing.checklist).map(([name, completed]) => (
                        <label 
                          key={name}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            completed 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 dark:text-emerald-300 font-bold' 
                              : (isDarkMode ? 'bg-[#131c2e] border-slate-700 hover:bg-slate-800 text-slate-200' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800')
                          }`}
                        >
                          <span className="font-bold">{name}</span>
                          <input 
                            type="checkbox" 
                            checked={completed} 
                            onChange={() => toggleChecklistItem(currentTaskEditing.id, name)}
                            className="rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 h-4 w-4 shrink-0 bg-slate-950"
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-1.5">
                    <input 
                      type="text" 
                      placeholder="Add custom engineering checklist parameter..." 
                      id="new-check-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addChecklistItem(currentTaskEditing.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className={`flex-grow px-3 py-2 rounded-xl text-xs font-bold border outline-none ${
                        isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('new-check-input');
                        if (input) {
                          addChecklistItem(currentTaskEditing.id, input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 rounded-xl"
                    >
                      Deploy
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Field Labor Allocation ({laborProfile.toUpperCase()})</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeRoles.map(r => {
                      const countVal = parseInt(currentTaskEditing[r.key]);
                      const count = isNaN(countVal) ? 0 : countVal;
                      return (
                        <div key={r.key} className={`flex items-center gap-2 border rounded-xl p-1.5 transition-colors ${count > 0 ? r.bg : (isDarkMode ? 'bg-[#0b0f19] border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-500')}`}>
                          <span className="text-xs pl-0.5">{r.icon} <span className="text-[9px] font-bold uppercase ml-0.5">{r.label}</span></span>
                          <div className={`flex items-center rounded-lg border text-slate-800 overflow-hidden shadow-sm ${isDarkMode ? 'bg-[#131c2e] border-slate-700' : 'bg-white border-slate-300'}`}>
                            <button onClick={() => adjustWorkerCount(currentTaskEditing.id, r.key, -1)} className={`px-1.5 py-0.5 transition ${isDarkMode ? 'hover:bg-slate-850 text-slate-200' : 'hover:bg-slate-100'}`}><Minus size={10}/></button>
                            <span className={`text-[10px] font-bold w-4 text-center ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{count}</span>
                            <button onClick={() => adjustWorkerCount(currentTaskEditing.id, r.key, 1)} className={`px-1.5 py-0.5 transition ${isDarkMode ? 'hover:bg-slate-850 text-slate-200' : 'hover:bg-slate-100'}`}><Plus size={10}/></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className={`space-y-3 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  {activeRoles.filter(r => (parseInt(currentTaskEditing[r.key]) || 0) > 0).map(r => {
                    const inputs = [];
                    const countVal = parseInt(currentTaskEditing[r.key]);
                    const count = isNaN(countVal) ? 0 : countVal;
                    for(let i=0; i<count; i++) {
                      inputs.push(
                        <input 
                          key={i} type="text" value={currentTaskEditing.assigned?.[r.key]?.[i] || ''}
                          onChange={(e) => assignWorkerName(currentTaskEditing.id, r.key, i, e.target.value)}
                          placeholder={`Signatory reference name for ${r.fullName} #${i+1}...`}
                          className={`px-3 py-2 border rounded-xl text-xs font-bold w-full outline-none ${
                            isDarkMode ? 'bg-[#0b0f19] border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400'
                          }`}
                        />
                      );
                    }
                    return (
                      <div key={r.key} className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{r.fullName} Identity Logs</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{inputs}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <button onClick={() => setActiveTaskModal(null)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm">Save & Collapse</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CONTRACTUAL BRANDING SETTINGS CONFIG MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#131c2e] text-slate-100' : 'bg-white text-slate-800'}`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="font-bold flex items-center gap-2"><Settings size={18}/> Custom Workspace Infrastructure Branding</span>
              <button onClick={() => setIsSettingsOpen(false)} className={`p-1 rounded-md border shadow-sm ${isDarkMode ? 'bg-slate-850 border-slate-700 text-slate-400' : 'bg-white text-slate-400 border-slate-300'}`}><X size={14}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Contractor Signatory Asset (Left)</label>
                <label className={`cursor-pointer border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-1 transition ${isDarkMode ? 'bg-slate-950/40 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-300 hover:bg-slate-100'}`}>
                  {logos.left ? <img src={logos.left} className="h-10 object-contain" alt="Left asset" /> : <UploadCloud className="text-blue-400" size={20}/>}
                  <span className="text-xs font-bold text-slate-400 mt-1 uppercase">Upload Image Asset</span>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('left', e)} className="hidden" />
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Owner Signatory Asset (Right)</label>
                <label className={`cursor-pointer border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-1 transition ${isDarkMode ? 'bg-slate-950/40 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-300 hover:bg-slate-100'}`}>
                  {logos.right ? <img src={logos.right} className="h-10 object-contain" alt="Right asset" /> : <UploadCloud className="text-blue-400" size={20}/>}
                  <span className="text-xs font-bold text-slate-400 mt-1 uppercase">Upload Image Asset</span>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('right', e)} className="hidden" />
                </label>
              </div>
            </div>
            <div className={`p-5 border-t flex justify-end ${isDarkMode ? 'bg-[#131c2e] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <button onClick={() => setIsSettingsOpen(false)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm">Save Parameters</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW DISCIPLINE LAYER INCEPTION MODAL */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border ${isDarkMode ? 'bg-[#131c2e] border-slate-700' : 'bg-white border-slate-300'}`}>
            <div className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Deploy Standalone Sub-Phase</h3>
              <p className="text-xs text-slate-400 mb-4 font-medium">Initializes an isolated operational context sequence in the master dropdown.</p>
              <input 
                type="text"
                placeholder="e.g. Substation Phase 4B Mesh Alignment"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-xs font-bold outline-none mb-4 ${
                  isDarkMode ? 'bg-[#0b0f19] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowCreateProjectModal(false)} className="px-4 py-2 text-slate-400 font-bold text-xs uppercase">Cancel</button>
                <button onClick={handleCreateNewProject} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase rounded-xl">Deploy Sequence</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEXT DELETION SANITY MODAL */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border ${isDarkMode ? 'bg-[#131c2e] border-slate-700' : 'bg-white border-slate-300'}`}>
            <div className="p-6">
              <div className="flex items-center gap-3 text-rose-500 mb-3">
                <AlertTriangle size={24}/>
                <h3 className="text-sm font-bold uppercase tracking-wider">Purge Context Environment</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                Are you certain you want to permanently clear out workspace instance reference <span className="font-mono font-bold text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded">{projectToDelete}</span>? 
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setProjectToDelete(null)} className="px-4 py-2 text-slate-400 font-bold text-xs uppercase">Abort</button>
                <button onClick={confirmDeleteProject} className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase rounded-xl">Finalize Purge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METRIC ONBOARDING WIZARD */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl border shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#131c2e] border-slate-700' : 'bg-white border-slate-300'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1.5"><HelpCircle size={14}/> Grid Infrastructure Execution Manual</span>
                <span className="text-xs text-slate-400 font-bold">{onboardingStep} / 3</span>
              </div>

              {onboardingStep === 1 && (
                <div className="space-y-3">
                  <h3 className="text-sm sm:text-base font-bold">Welcome to MBV Dynamic Scheduler Core</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">This interface synchronizes engineering steps, field labor loads, and quality hold points into a shared reactive view framework.</p>
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                    <p className="text-[11px] text-blue-400 font-bold">💡 Sequence: Access the drop-down switch matrix in the left header cluster to jump context domains seamlessly.</p>
                  </div>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="space-y-3">
                  <h3 className="text-sm sm:text-base font-bold">Hold Point Clearance Matrix</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Quality assurance limits are bound into the row logic loops. Tap any list line or card node to toggle inspections or allocate worker metrics.</p>
                  <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-2xl border border-emerald-500/20">
                    <p className="text-[11px] font-bold">🛑 Guard: Transformer energization and cable splices are held structurally transparent until prerequisites are set to APPROVED.</p>
                  </div>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="space-y-3">
                  <h3 className="text-sm sm:text-base font-bold">Global Database Synchronicity</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">When schedule timelines shift, click the <strong>Sync Cloud</strong> button. This pushes parameters to the primary Firestore schema cluster and duplicates the active link target directly to your clipboard.</p>
                  <div className="bg-blue-600/15 p-3 rounded-2xl border border-blue-500/20">
                    <p className="text-[11px] text-blue-400 font-bold flex items-center gap-1.5"><CheckCircle2 size={12}/> Complete synergy between general contractors and oversight teams.</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center border-t mt-6 pt-4">
                <button 
                  onClick={() => setShowOnboarding(false)} 
                  className="text-xs font-bold text-slate-400 uppercase hover:text-slate-200"
                >
                  Skip Guide
                </button>
                <div className="flex gap-2">
                  {onboardingStep > 1 && (
                    <button 
                      onClick={() => setOnboardingStep(onboardingStep - 1)} 
                      className="px-4 py-2 border rounded-xl text-xs font-bold"
                    >
                      Back
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (onboardingStep < 3) {
                        setOnboardingStep(onboardingStep + 1);
                      } else {
                        setShowOnboarding(false);
                        showToast("Onboarding guide sequence successfully completed.");
                      }
                    }} 
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase rounded-xl flex items-center gap-1"
                  >
                    {onboardingStep === 3 ? 'Initialize Workspace' : 'Continue'} <ArrowRight size={12}/>
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