import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  CalendarDays, Settings, X, Plus, Trash2, 
  CheckCircle2, Share2, GripVertical, UploadCloud, 
  Users, UserPlus, Hammer, Zap, Minus, BarChart3, Info, Loader2, Printer,
  LayoutDashboard, FilePlus2, Clock, ChevronRight, Home, FolderPlus, Sun, Moon,
  ShieldAlert, CloudRain, ListTodo, ClipboardCheck, ArrowUpDown, Smartphone, Monitor, ChevronDown, ChevronUp, Folder
} from 'lucide-react';

// === CLOUD STORAGE IMPORTS ==================================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

// Safely configure Firebase fallback
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
  // Silent fallback for compilation environments lacking env flags
}

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
const app = isFirebaseConfigured ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mbv-scheduler-v1';

// ============================================================================
// CONSTANTS & LOGOS
// ============================================================================

const CiticoreLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-8 w-auto">
    <path d="M15 10 L25 22 L15 34 L20 34 L30 22 L20 10 Z" fill="#EAB308" />
    <path d="M22 10 L32 22 L22 34 L27 34 L37 22 L27 10 Z" fill="#F1C40F" />
    <text x="50" y="24" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="15" fill="#3b82f6">CITICORE</text>
    <text x="50" y="34" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="6" fill="#94a3b8" letterSpacing="1.5">CONSTRUCTION</text>
  </svg>
);

const MbvLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-8 w-auto">
    <rect x="10" y="5" width="35" height="35" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
    <path d="M27 10 L19 23 L26 23 L23 33 L32 19 L25 19 Z" fill="#EAB308" />
    <text x="55" y="24" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="14" fill="#3b82f6">MBV ELECTRIC</text>
    <text x="55" y="34" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="6.5" fill="#6366f1" letterSpacing="1.2">POWER SYSTEM</text>
  </svg>
);

const WORKER_ROLES = [
  { key: 'pm', label: 'PM', fullName: 'Project Manager', bg: 'bg-blue-900/30 border-blue-500/20 text-blue-400', icon: '👔' },
  { key: 'se', label: 'SE', fullName: 'Site Engineer', bg: 'bg-amber-900/30 border-amber-500/20 text-amber-400', icon: '📐' },
  { key: 'so', label: 'SO', fullName: 'Safety Officer', bg: 'bg-emerald-900/30 border-emerald-500/20 text-emerald-400', icon: '🛡️' },
  { key: 'st', label: 'ST', fullName: 'Steelman', bg: 'bg-slate-800/60 border-slate-700 text-slate-300', icon: '⛓️' },
  { key: 'cp', label: 'CP', fullName: 'Carpenter', bg: 'bg-yellow-900/20 border-yellow-500/20 text-yellow-400', icon: '🪚' },
  { key: 'ms', label: 'MS', fullName: 'Mason', bg: 'bg-rose-900/20 border-rose-500/20 text-rose-400', icon: '🧱' },
  { key: 'hl', label: 'HL', fullName: 'Helper', bg: 'bg-teal-900/20 border-teal-500/20 text-teal-400', icon: '🧹' }
];

const INITIAL_TASKS = [
  { id: 'T1', ref: '1.0', desc: 'Pre-Construction', task: 'Permit Processing & Mobilization', duration: 2, progress: 100, pm: 1, se: 1, so: 1, st: 0, cp: 0, ms: 0, hl: 2, assigned: {}, qaStatus: 'APPROVED', checklist: { 'Mobilization Permit': true, 'Office Container Set': true } },
  { id: 'T2', ref: '1.1', desc: 'Technical Survey', task: 'Geo-staking & Coordinate Review', duration: 1, progress: 100, pm: 1, se: 2, so: 1, st: 0, cp: 0, ms: 0, hl: 1, assigned: {}, qaStatus: 'APPROVED', checklist: { 'Boundary Markers Laid': true, 'Topographical Crosscheck': true } },
  { id: 'T3', ref: '2.0', desc: 'Civil Works', task: '1.5m Depth Manual Potholing', duration: 3, progress: 80, pm: 0, se: 1, so: 1, st: 0, cp: 0, ms: 0, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Utility Clearance Received': true, 'Depth Level Checked': false } },
  { id: 'T4', ref: '2.1', desc: 'Civil Works', task: 'Excavation of Footing Cavities', duration: 2, progress: 40, pm: 0, se: 1, so: 1, st: 0, cp: 1, ms: 0, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Excavation Safety Barrier Set': true, 'Soil Bearing Test Logged': false } },
  { id: 'T5', ref: '3.0', desc: 'Foundation', task: 'Gravel Bedding & Rebar Fabrication', duration: 3, progress: 0, pm: 0, se: 1, so: 1, st: 4, cp: 2, ms: 0, hl: 2, assigned: {}, qaStatus: 'PENDING', checklist: { 'Rebar Bend Specs OK': false, 'Bedding Compactness Signed': false } },
  { id: 'T6', ref: '3.1', desc: 'Foundation', task: 'Anchor Bolt Structural Alignment', duration: 1, progress: 0, pm: 1, se: 2, so: 1, st: 0, cp: 1, ms: 0, hl: 1, assigned: {}, qaStatus: 'HOLD', checklist: { 'Plumbness Signed-Off': false, 'Thread Integrity Check': false } },
  { id: 'T7', ref: '4.0', desc: 'Concreting', task: 'Monolithic Concrete Pouring', duration: 2, progress: 0, pm: 0, se: 1, so: 1, st: 2, cp: 2, ms: 4, hl: 4, assigned: {}, qaStatus: 'PENDING', checklist: { 'Formwork Leak Review': false, 'Vibrator Tool Mobilized': false } },
  { id: 'T8', ref: '4.1', desc: 'Concreting', task: '5-Day Continuous Wet Curing (Hold)', duration: 5, progress: 0, pm: 0, se: 0, so: 1, st: 0, cp: 0, ms: 1, hl: 1, assigned: {}, qaStatus: 'PENDING', checklist: { 'Wet Sack Blanket Placed': false, 'Daily Water Log Checklist': false } },
  { id: 'T9', ref: '5.0', desc: 'Assembly', task: 'Pole Hoisting & Bracing Erection', duration: 3, progress: 0, pm: 1, se: 1, so: 1, st: 2, cp: 2, ms: 0, hl: 2, assigned: {}, qaStatus: 'PENDING', checklist: { 'Crane Path Load-Rated': false, 'Guy-wire Cleat Alignment': false } },
  { id: 'T10', ref: '6.0', desc: 'Commissioning', task: 'Ground Res Testing & Commissioning', duration: 2, progress: 0, pm: 1, se: 1, so: 1, st: 0, cp: 0, ms: 0, hl: 1, assigned: {}, qaStatus: 'PENDING', checklist: { 'Earth Pit Test Complete': false, 'Relay Trip Function Logged': false } },
];

const generateDateHeaderStr = (startDateStr, dayOffset) => {
  const d = new Date(startDateStr);
  d.setDate(d.getDate() + dayOffset);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading'); // 'loading', 'editor'
  
  // Responsive displays
  const [mobileDisplayTab, setMobileDisplayTab] = useState('tasks'); 
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isMetadataCollapsed, setIsMetadataCollapsed] = useState(true);

  // Project select popover state (Replaces natively broken dropdown highlighted in image_65bf21.png)
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Onboarding guide
  const [showTour, setShowTour] = useState(() => {
    return localStorage.getItem('mbv_seen_tour') !== 'true';
  });
  const [tourStep, setTourStep] = useState(1);

  // Dynamic eye-comfort dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('mbv_dark_mode') !== 'false';
  });

  // Weather variables
  const [weatherFactor, setWeatherFactor] = useState('sunny');

  // MULTI-PROJECT ROUTER & SYNC STATE
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const projParam = params.get('project');
    if (projParam) return projParam;
    return localStorage.getItem('mbv_active_project_id') || 'master-schedule';
  });

  const [projectList, setProjectList] = useState([
    { id: 'master-schedule', title: 'Citicore 100MW Solar Project' }
  ]);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Master Schedule Single Authority State
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [projectStartDate, setProjectStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [appTitle, setAppTitle] = useState("Citicore Field Console");
  const [appSubtitle, setAppSubtitle] = useState("MBV Electric Schedule Architect");
  const [logos, setLogos] = useState({ left: '', right: '' });
  const [docMetadata, setDocMetadata] = useState({
    projectName: "CITICORE 100MW SOLAR PROJECT",
    location: "Pagbilao, Quezon Site Office",
    docNo: "DOC-CIT-MBV-901",
    revision: "01",
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
  });

  // UI status metrics
  const [toastMessage, setToastMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('all');
  const [customPrompt, setCustomPrompt] = useState(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 4000);
  }, []);

  // Close custom dropdown when clicking outside to ensure premium interface UX
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
    localStorage.setItem('mbv_dark_mode', isDarkMode);
  }, [isDarkMode]);

  // Persist Active Project preference to device local storage
  useEffect(() => {
    localStorage.setItem('mbv_active_project_id', activeProjectId);
  }, [activeProjectId]);

  // Listen to Auth State, Active Project List, and Current Active Schedule Document
  useEffect(() => {
    if (!auth) {
      setView('editor');
      return;
    }

    const initAuthAndSync = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth initialization issue:", err);
      }
    };

    initAuthAndSync();
    
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && db) {
        // 1. Subscribe to the Global Project Index Document
        const indexDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'project-list-index');
        const unsubscribeIndex = onSnapshot(indexDocRef, (indexSnap) => {
          if (indexSnap.exists()) {
            const indexData = indexSnap.data();
            if (indexData.projects && indexData.projects.length > 0) {
              setProjectList(indexData.projects);
            }
          } else {
            // Write default project list index if empty
            setDoc(indexDocRef, {
              projects: [{ id: 'master-schedule', title: 'Citicore 100MW Solar Project' }]
            }).catch(e => console.error("Error setting index:", e));
          }
        });

        // 2. Subscribe directly to the Active "Mother Link" Project Document ID
        const activeDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeProjectId);
        const unsubscribeActiveProject = onSnapshot(activeDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAppTitle(data.appTitle || "Citicore Field Console");
            setAppSubtitle(data.appSubtitle || "MBV Electric Schedule Architect");
            setProjectStartDate(data.projectStartDate || new Date().toISOString().split('T')[0]);
            setDocMetadata(data.docMetadata || {});
            setTasks(data.tasks || INITIAL_TASKS);
            setLogos(data.logos || { left: '', right: '' });
          } else {
            // First time setup for a new Mother Link Document
            const defaultDocTitle = projectList.find(p => p.id === activeProjectId)?.title || "Citicore Field Console";
            setDoc(activeDocRef, {
              appTitle: defaultDocTitle,
              appSubtitle: "MBV Electric Schedule Architect",
              projectStartDate: new Date().toISOString().split('T')[0],
              docMetadata: {
                projectName: defaultDocTitle.toUpperCase(),
                location: "Pagbilao, Quezon Site Hub",
                docNo: "DOC-CIT-MBV-901",
                revision: "01",
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
              },
              tasks: INITIAL_TASKS,
              logos: { left: '', right: '' },
              updatedAt: new Date().toISOString()
            }).catch(e => console.error("Could not write initial master schedule:", e));
          }
          setView('editor');
        }, (err) => {
          console.error("Active schedule sync failed:", err);
          setView('editor');
        });

        return () => {
          unsubscribeIndex();
          unsubscribeActiveProject();
        };
      } else {
        setView('editor');
      }
    });

    return () => unsubscribeAuth();
  }, [activeProjectId]);

  const handleShareToCloud = async () => {
    if (!isFirebaseConfigured || !db) {
      showToast("Firebase not configured. Operating in offline sandbox.");
      return;
    }
    
    setIsSavingCloud(true);
    try {
      // Write to the active target "Mother Link" document in Firestore
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeProjectId);
      await setDoc(docRef, {
        tasks, docMetadata, projectStartDate, appTitle, appSubtitle, logos,
        updatedAt: new Date().toISOString()
      });
      
      showToast("Mother Link Updated! Everyone on this project site is now synchronized.");
    } catch (err) {
      console.error(err);
      showToast("Network sync failed. Check connection.");
    } finally {
      setIsSavingCloud(false);
    }
  };

  // Creates a brand new, clean site project under its own "Mother Link"
  const handleCreateNewProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const cleanId = newProjectName.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    if (projectList.some(p => p.id === cleanId)) {
      showToast("A project with a similar name already exists.");
      return;
    }

    const updatedList = [...projectList, { id: cleanId, title: newProjectName }];
    
    try {
      const indexDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'project-list-index');
      await setDoc(indexDocRef, { projects: updatedList });

      const activeDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', cleanId);
      await setDoc(activeDocRef, {
        appTitle: newProjectName,
        appSubtitle: "MBV Electric Schedule Architect",
        projectStartDate: new Date().toISOString().split('T')[0],
        docMetadata: {
          projectName: newProjectName.toUpperCase(),
          location: "Pagbilao, Quezon Site Hub",
          docNo: "DOC-CIT-MBV-901",
          revision: "01",
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
        },
        tasks: INITIAL_TASKS,
        logos: { left: '', right: '' },
        updatedAt: new Date().toISOString()
      });

      setProjectList(updatedList);
      setShowCreateProjectModal(false);
      setNewProjectName('');
      handleSwitchProject(cleanId);
      showToast(`Created new project schedule: "${newProjectName}"`);
    } catch (err) {
      console.error("Error creating project:", err);
      showToast("Failed to create new project.");
    }
  };

  const handleSwitchProject = (id) => {
    setActiveProjectId(id);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('project', id);
    window.history.pushState({}, '', newUrl.toString());
  };

  const handleDeleteProject = (id, e) => {
    if (e) e.stopPropagation();
    if (id === 'master-schedule') {
      showToast("The Master Schedule cannot be deleted.");
      return;
    }

    setCustomPrompt({
      title: "Remove Global Project?",
      message: `Are you sure you want to permanently erase the "${projectList.find(p => p.id === id)?.title}" schedule from the cloud network? This cannot be undone.`,
      onConfirm: async () => {
        const updatedList = projectList.filter(p => p.id !== id);
        try {
          const indexDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'project-list-index');
          await setDoc(indexDocRef, { projects: updatedList });
          setProjectList(updatedList);
          showToast("Project directory updated.");
          if (activeProjectId === id) {
            handleSwitchProject('master-schedule');
          }
        } catch (err) {
          showToast("Failed to update global project directory.");
        }
        setCustomPrompt(null);
      },
      onCancel: () => setCustomPrompt(null)
    });
  };

  const fetchWeatherDelayMultiplier = () => {
    if (weatherFactor === 'heavy_rain') return 1.5;
    if (weatherFactor === 'typhoon') return 2.0;
    return 1.0;
  };

  const flowSchedule = useCallback(() => {
    let currentStartDay = 0;
    const multiplier = fetchWeatherDelayMultiplier();

    return tasks.map((task) => {
      const start = currentStartDay;
      const adjustedDuration = Math.max(1, Math.round(task.duration * multiplier));
      currentStartDay += adjustedDuration;
      
      const totalManpower = WORKER_ROLES.reduce((sum, r) => sum + (parseInt(task[r.key]) || 0), 0);
      return { 
        ...task, 
        startDays: start, 
        adjustedDuration,
        totalManpower, 
        progress: task.progress || 0 
      };
    });
  }, [tasks, weatherFactor]);

  const activeFlowTasks = flowSchedule();
  const totalDays = activeFlowTasks.reduce((acc, curr) => acc + curr.adjustedDuration, 0) || 1;
  const headerDays = Array.from({ length: totalDays + 3 }, (_, i) => i);

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
    setTasks(tasks.map(t => t.id === taskId ? { ...t, [roleKey]: Math.max(0, (parseInt(t[roleKey]) || 0) + increment) } : t));
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
      desc: 'Field Work', 
      task: 'New Site Task Item', 
      duration: 1, 
      progress: 0, 
      pm: 0, se: 0, so: 0, st: 0, cp: 0, ms: 0, hl: 1, 
      assigned: {}, 
      qaStatus: 'PENDING', 
      checklist: {} 
    }]);
    showToast("New schedule row added.");
  };

  const triggerTaskRemove = (id) => {
    setCustomPrompt({
      title: "Remove Task Row?",
      message: "Are you sure you want to remove this task? This will immediately slide downstream schedules.",
      onConfirm: () => {
        setTasks(tasks.filter(t => t.id !== id));
        showToast("Task removed.");
        setCustomPrompt(null);
      },
      onCancel: () => setCustomPrompt(null)
    });
  };

  const toggleChecklistItem = (taskId, checklistName) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const list = { ...(t.checklist || {}) };
        list[checklistName] = !list[checklistName];
        
        // Auto QA change based on checklists cleared
        const listValues = Object.values(list);
        let updatedStatus = t.qaStatus;
        if (listValues.length > 0 && listValues.every(val => val === true)) {
          updatedStatus = 'APPROVED';
        } else if (listValues.some(val => val === false) && t.qaStatus === 'APPROVED') {
          updatedStatus = 'PENDING';
        }

        return { ...t, checklist: list, qaStatus: updatedStatus };
      }
      return t;
    }));
  };

  const addChecklistItem = (taskId, text) => {
    if (!text.trim()) return;
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const list = { ...(t.checklist || {}) };
        list[text] = false;
        return { ...t, checklist: list, qaStatus: 'PENDING' };
      }
      return t;
    }));
  };

  const triggerSystemPrint = () => {
    window.print();
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

  const filteredTasks = activeFlowTasks.filter(t => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = t.task.toLowerCase().includes(query) || t.desc.toLowerCase().includes(query) || t.ref.includes(query);
    
    if (activeTabFilter === 'all') return matchesSearch;
    if (activeTabFilter === 'hold') return matchesSearch && t.qaStatus === 'HOLD';
    if (activeTabFilter === 'approved') return matchesSearch && t.qaStatus === 'APPROVED';
    return matchesSearch;
  });

  const dismissTour = () => {
    localStorage.setItem('mbv_seen_tour', 'true');
    setShowTour(false);
  };

  const getRowBgColor = (task, index) => {
    const isHold = task.qaStatus === 'HOLD';
    const isApproved = task.qaStatus === 'APPROVED';
    
    if (isDarkMode) {
      if (isHold) return 'bg-rose-950/15 border-rose-900/30 hover:bg-rose-950/25';
      if (isApproved) return 'bg-emerald-950/15 border-emerald-900/30 hover:bg-emerald-950/25';
      return index % 2 === 0 ? 'bg-[#131c2e]/40 border-slate-800/40 hover:bg-slate-800/20' : 'bg-[#131c2e]/20 border-slate-800/40 hover:bg-slate-800/20';
    } else {
      if (isHold) return 'bg-rose-50/70 border-rose-100 hover:bg-rose-100/60';
      if (isApproved) return 'bg-emerald-50/70 border-emerald-100 hover:bg-emerald-100/60';
      return index % 2 === 0 ? 'bg-white border-slate-100 hover:bg-slate-50/60' : 'bg-slate-50/40 border-slate-100 hover:bg-slate-50/60';
    }
  };

  const getBadgeStyle = (status) => {
    if (status === 'APPROVED') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    }
    if (status === 'HOLD') {
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
    }
    return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50';
  };

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================
  if (view === 'loading') {
    return (
      <div className={`flex flex-col h-screen items-center justify-center transition-all ${isDarkMode ? 'bg-[#0b0f19] text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <h2 className="font-bold text-sm">Opening Mother Link Live Schedule...</h2>
      </div>
    );
  }

  // ============================================================================
  // RENDER: COMPACT MASTER EDITOR
  // ============================================================================
  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Dynamic styling overrides for grid harmony (Light & Dark matching grids) */}
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#1e293b' : '#cbd5e1'}; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
        
        .gantt-grid-light {
          background-image: 
            linear-gradient(to right, #f1f5f9 1px, transparent 1px),
            linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
          background-size: 44px 100%, 100% 54px;
        }
        
        .gantt-grid-dark {
          background-image: 
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px);
          background-size: 44px 100%, 100% 54px;
        }

        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          body { background-color: #ffffff !important; color: #000000 !important; }
          header, button, .print\\:hidden { display: none !important; }
          #gantt-export-zone { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
        }
      `}} />

      {/* Floating active feedback toast container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-emerald-500/20 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-bounce duration-500">
          <CheckCircle2 className="text-emerald-400 w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Dynamic Alerts Modal container */}
      {customPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 max-w-sm w-full border ${isDarkMode ? 'bg-[#131c2e] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-850'} shadow-2xl`}>
            <h3 className="font-extrabold text-lg mb-2">{customPrompt.title}</h3>
            <p className="text-sm text-slate-400 mb-6">{customPrompt.message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={customPrompt.onCancel} className={`px-4 py-2 rounded-lg text-sm font-semibold border ${isDarkMode ? 'border-slate-800 bg-slate-800 text-slate-355' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>Cancel</button>
              <button onClick={customPrompt.onConfirm} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold">Confirm Action</button>
            </div>
          </div>
        </div>
      )}

      {/* ONBOARDING QUICK TOUR */}
      {showTour && (
        <div className="fixed inset-0 bg-slate-955/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border p-6 md:p-8 flex flex-col transition-all ${
            isDarkMode ? 'bg-[#131c2e] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-500 flex items-center gap-1.5">
                <Hammer size={12} className="animate-bounce" /> Field Quick Guide ({tourStep}/3)
              </span>
              <button onClick={dismissTour} className="text-slate-500 hover:text-rose-500 transition-colors"><X size={18} /></button>
            </div>

            {tourStep === 1 && (
              <div className="space-y-4">
                <div className="h-28 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400 text-4xl">🗓️</div>
                <h3 className="font-black text-lg leading-tight">Dynamic Site Calendar</h3>
                <p className="text-xs text-slate-400 leading-relaxed">This screen is our master operational window. When rain delays work or concrete holds require time, the Gantt timeline auto-shifts downstream targets automatically—saving you from tedious manual edits.</p>
              </div>
            )}

            {tourStep === 2 && (
              <div className="space-y-4">
                <div className="h-28 bg-emerald-600/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-400 text-4xl">🛠️</div>
                <h3 className="font-black text-lg leading-tight">Direct Interactive Field Cards</h3>
                <p className="text-xs text-slate-400 leading-relaxed">No complex spreadsheet cells here! Tap on any block on the timeline or click a task on mobile. You'll see a streamlined Quick Editor to instantly sign-off checks or adjust shifts without typing.</p>
              </div>
            )}

            {tourStep === 3 && (
              <div className="space-y-4">
                <div className="h-28 bg-amber-600/10 rounded-2xl flex items-center justify-center border border-amber-500/20 text-amber-400 text-4xl">📊</div>
                <h3 className="font-black text-lg leading-tight">Live Labor Load Balance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Every task monitors its required labor footprint. Scroll down on desktop or view our live histograms to ensure steelmen, helpers, and safety officers are balanced without wasteful downtime.</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800/40">
              <button onClick={dismissTour} className="text-xs font-bold text-slate-500 hover:text-slate-300">Skip Guide</button>
              <div className="flex gap-2">
                {tourStep > 1 && (
                  <button onClick={() => setTourStep(tourStep - 1)} className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-extrabold text-slate-300">Back</button>
                )}
                {tourStep < 3 ? (
                  <button onClick={() => setTourStep(tourStep + 1)} className="px-5 py-2 bg-blue-600 rounded-xl text-xs font-extrabold text-white">Next Step</button>
                ) : (
                  <button onClick={dismissTour} className="px-5 py-2 bg-emerald-600 rounded-xl text-xs font-extrabold text-white">Got It, Let's Work!</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-PROJECT CREATION MODAL */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateNewProject} className={`rounded-2xl p-6 max-w-md w-full border ${isDarkMode ? 'bg-[#131c2e] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-850'} shadow-2xl`}>
            <h3 className="font-black text-lg mb-2 flex items-center gap-2"><Plus className="text-blue-500" size={20}/> Create New Site Project</h3>
            <p className="text-xs text-slate-400 mb-4">Initialize a completely separate, standalone Mother Link schedule for a new contract or location.</p>
            
            <div className="mb-4">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Project Name / Site Tag</label>
              <input 
                type="text" 
                required 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Quezon Substation Hub"
                className={`w-full px-3 py-2 rounded-xl text-sm font-semibold outline-none border transition-all ${
                  isDarkMode ? 'bg-[#0b0f19] border-slate-800 text-slate-200 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'
                }`}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreateProjectModal(false)} className={`px-4 py-2 rounded-lg text-xs font-semibold border ${isDarkMode ? 'border-slate-850 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600'}`}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold">Create & Load Link</button>
            </div>
          </form>
        </div>
      )}

      {/* RESPONSIVE HEADER BAR */}
      {}
      <header className={`border-b px-4 py-3 flex items-center justify-between shadow-sm z-20 shrink-0 print:hidden transition-colors ${isDarkMode ? 'bg-[#131c2e] border-slate-900/60' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shrink-0">
            <LayoutDashboard size={16} />
          </div>
          
          {/* BEAUTIFUL CUSTOM PROJECT SWITCHER (Replaces the broken native list dropdown from image_65bf21.png) */}
          <div className="flex flex-col min-w-0" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-black select-none ${
                  isDarkMode 
                    ? 'bg-[#0f172a] hover:bg-[#1e293b] text-slate-100 border-slate-800/80' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-850 border-slate-200'
                }`}
              >
                <Folder size={14} className="text-blue-500 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[280px]">
                  {projectList.find(p => p.id === activeProjectId)?.title || 'Loading active project...'}
                </span>
                <ChevronDown size={14} className="text-slate-500 shrink-0" />
              </button>

              {/* High-fidelity dropdown panel */}
              {isProjectDropdownOpen && (
                <div className={`absolute left-0 mt-2 w-80 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200 ${
                  isDarkMode ? 'bg-[#131c2e] border-slate-800 text-slate-200' : 'bg-white border-slate-250 text-slate-800'
                }`}>
                  <div className="px-3 py-2 text-[9px] font-black tracking-widest text-slate-500 border-b border-slate-800/40 uppercase mb-2">
                    SITE SCHEDULES DIRECTORY
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                    {projectList.map((proj) => (
                      <div 
                        key={proj.id}
                        onClick={() => {
                          handleSwitchProject(proj.id);
                          setIsProjectDropdownOpen(false);
                          showToast(`Switched active workspace to "${proj.title}"`);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                          activeProjectId === proj.id 
                            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                            : (isDarkMode ? 'hover:bg-slate-800/60 text-slate-300' : 'hover:bg-slate-50 text-slate-700')
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Folder size={12} className={activeProjectId === proj.id ? 'text-blue-400' : 'text-slate-400'} />
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
                            title="Delete project"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-slate-800/40 mt-2 pt-2">
                    <button 
                      onClick={() => {
                        setShowCreateProjectModal(true);
                        setIsProjectDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all text-xs font-black uppercase tracking-wider"
                    >
                      <Plus size={14} /> Create New Project
                    </button>
                  </div>
                </div>
              )}
            </div>
            <span className="text-blue-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest truncate mt-1 pl-1">
              {appSubtitle}
            </span>
          </div>
        </div>

        {/* Action Controls Header Segment */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button 
            onClick={() => setIsMetadataCollapsed(!isMetadataCollapsed)}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
              isDarkMode ? 'bg-[#0b0f19] hover:bg-slate-800 text-slate-300 border-slate-800/40' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Toggle Project Specifications Panel"
          >
            {isMetadataCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            <span className="hidden md:inline font-bold">Specs</span>
          </button>

          {/* Compact Weather Control Selector */}
          <div className={`hidden sm:flex items-center gap-1 border rounded-xl px-2 py-1.5 transition-colors ${isDarkMode ? 'bg-[#0b0f19]/60 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
            <select 
              value={weatherFactor} 
              onChange={(e) => {
                setWeatherFactor(e.target.value);
                showToast(`Weather updated to ${e.target.value.replace('_', ' ').toUpperCase()}. Delays adjusted.`);
              }} 
              className="text-[10px] font-bold bg-transparent outline-none border-none text-blue-500 cursor-pointer"
            >
              <option value="sunny">☀️ Sunny</option>
              <option value="heavy_rain">🌧️ Light Rain</option>
              <option value="typhoon">🌀 Typhoon Hold</option>
            </select>
          </div>

          <div className={`hidden lg:flex items-center border rounded-xl px-2.5 py-1.5 text-[10px] ${isDarkMode ? 'bg-[#0b0f19]/60 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
            <input type="date" value={projectStartDate} onChange={(e) => setProjectStartDate(e.target.value)} className="outline-none bg-transparent cursor-pointer font-bold text-blue-500" />
          </div>

          <div className="flex gap-1 sm:gap-2">
            <button onClick={addTask} className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition shadow-lg shadow-blue-500/15">
              <Plus size={12}/> <span className="hidden sm:inline">Add Task</span>
            </button>
            
            <button onClick={triggerSystemPrint} className="hidden md:flex bg-slate-800 hover:bg-slate-750 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider items-center gap-1 transition">
              <Printer size={12}/> Export
            </button>

            {/* Dark Mode selector */}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-1.5 sm:p-2 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-800 hover:bg-slate-700 text-amber-400' : 'bg-white border-slate-200 hover:bg-slate-100 text-indigo-650'}`}>
              {isDarkMode ? <Sun size={12} /> : <Moon size={12} />}
            </button>

            {/* Sync to Global "Mother Link" Document Button */}
            <button 
              onClick={handleShareToCloud} 
              disabled={isSavingCloud} 
              className="bg-emerald-600 hover:bg-emerald-505 disabled:opacity-50 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition"
              title="Save changes back to the shared mother link"
            >
              {isSavingCloud ? <Loader2 size={12} className="animate-spin" /> : <Share2 size={12}/>} 
              <span>SYNC</span>
            </button>
            
            <button onClick={() => setIsSettingsOpen(true)} className={`p-1.5 sm:p-2 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-[#131c2e] border-slate-800/40 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'}`}>
              <Settings size={12}/>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DISPLAY VIEWPORT SWITCHER CONTROL BAR */}
      <div className="lg:hidden shrink-0 border-b flex bg-[#131c2e] border-slate-800/40 print:hidden justify-around items-center h-12">
        <button 
          onClick={() => setMobileDisplayTab('tasks')}
          className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 h-full border-b-2 px-3 ${mobileDisplayTab === 'tasks' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'}`}
        >
          <Smartphone size={12}/> Site Cards
        </button>
        <button 
          onClick={() => setMobileDisplayTab('gantt')}
          className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 h-full border-b-2 px-3 ${mobileDisplayTab === 'gantt' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'}`}
        >
          <Monitor size={12}/> Timeline Gantt
        </button>
        <button 
          onClick={() => setMobileDisplayTab('qa')}
          className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 h-full border-b-2 px-3 ${mobileDisplayTab === 'qa' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'}`}
        >
          <ClipboardCheck size={12}/> QA Holds
        </button>
      </div>

      {/* WORKSPACE CONTENT AREA */}
      <div className="flex-grow overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 relative">
        <div className="max-w-[1550px] mx-auto flex flex-col gap-4 h-full pb-10">
            
            {/* SEARCH AND TAB BAR FILTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <div className="relative w-full sm:w-72">
                <input 
                  type="text" 
                  placeholder="Filter tasks by name, ref..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-[11px] font-semibold outline-none border transition-all ${
                    isDarkMode ? 'bg-[#131c2e] border-slate-800/40 text-slate-200 focus:border-blue-500/50' : 'bg-white border-slate-250 text-slate-800 focus:border-blue-500'
                  }`}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-355 text-xs">Clear</button>
                )}
              </div>

              {/* Status selectors tabs */}
              <div className="flex gap-1.5 w-full sm:w-auto">
                {['all', 'hold', 'approved'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTabFilter(tab)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                      activeTabFilter === tab 
                        ? 'bg-blue-600/10 border-blue-500 text-blue-500 dark:text-blue-400' 
                        : (isDarkMode ? 'bg-[#131c2e]/30 border-slate-800/40 text-slate-500 hover:text-slate-300' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-850')
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* MASTER EXPORT COMPARTMENT */}
            <div id="gantt-export-zone" className={`rounded-2xl shadow-xl border p-3 sm:p-5 flex flex-col gap-4 w-full relative transition-colors duration-200 ${isDarkMode ? 'bg-[#131c2e]/20 border-slate-900/65' : 'bg-white border-slate-200'}`}>
              
              {/* COLLAPSIBLE DOCUMENT SPECIFICATIONS & METADATA SECTION */}
              {!isMetadataCollapsed && (
                <div className={`border-b pb-4 shrink-0 transition-colors ${isDarkMode ? 'border-slate-800/40' : 'border-slate-150'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="w-full md:w-[30%] flex justify-start items-center">
                      {logos.left ? <img src={logos.left} className="h-8 object-contain" alt="Left" /> : <CiticoreLogo />}
                    </div>
                    
                    <div className="w-full md:w-[40%] text-center">
                      <input 
                        value={docMetadata.projectName} onChange={(e) => setDocMetadata({...docMetadata, projectName: e.target.value.toUpperCase()})}
                        className={`w-full text-center text-sm md:text-base font-black tracking-tight bg-transparent uppercase border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none transition-all ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                        placeholder="ENTER PROJECT SPEC..."
                      />
                      <input 
                        value={docMetadata.location} onChange={(e) => setDocMetadata({...docMetadata, location: e.target.value})}
                        className="w-full text-center text-[9px] text-slate-500 mt-1.5 font-bold uppercase tracking-widest bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none"
                        placeholder="LOCATION DETAILS..."
                      />
                    </div>
                    
                    <div className="w-full md:w-[30%] flex justify-center md:justify-end items-center">
                      {logos.right ? <img src={logos.right} className="h-8 object-contain" alt="Right" /> : <MbvLogo />}
                    </div>
                  </div>
                  
                  {/* Metadata field rows */}
                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-[8px] font-black uppercase tracking-wider border-t pt-3 transition-colors ${isDarkMode ? 'border-slate-800/40 text-slate-500' : 'border-slate-105 text-slate-400'}`}>
                    <div className="flex flex-col gap-0.5 border-r border-slate-800/40">
                      <span>Document No:</span>
                      <input value={docMetadata.docNo} onChange={(e) => setDocMetadata({...docMetadata, docNo: e.target.value})} className={`font-mono bg-transparent outline-none font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} />
                    </div>
                    <div className="flex flex-col gap-0.5 border-r border-slate-800/40 pl-2">
                      <span>Revision:</span>
                      <input value={docMetadata.revision} onChange={(e) => setDocMetadata({...docMetadata, revision: e.target.value})} className={`bg-transparent outline-none font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} />
                    </div>
                    <div className="flex flex-col gap-0.5 border-r border-slate-800/40 pl-2">
                      <span>Effective Date:</span>
                      <input value={docMetadata.date} onChange={(e) => setDocMetadata({...docMetadata, date: e.target.value})} className={`bg-transparent outline-none font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} />
                    </div>
                    <div className="flex flex-col gap-0.5 pl-2">
                      <span>Site Conditions:</span>
                      <span className="text-blue-500 font-bold tracking-widest">{weatherFactor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 1. MOBILE FIELD CARDS LAYOUT */}
              {}
              {(!isMobileViewport || mobileDisplayTab === 'tasks' || mobileDisplayTab === 'qa') && (
                <div className="block lg:hidden space-y-3">
                  {filteredTasks.map((task) => {
                    const isHold = task.qaStatus === 'HOLD';
                    const isApproved = task.qaStatus === 'APPROVED';
                    
                    if (mobileDisplayTab === 'qa' && !isHold && task.qaStatus !== 'PENDING') return null;
                    
                    return (
                      <div 
                        key={task.id}
                        onClick={() => setActiveTaskModal(task.id)}
                        className={`p-4 rounded-2xl border transition-all flex flex-col gap-3.5 relative cursor-pointer active:scale-[0.99] duration-150 ${
                          isHold 
                            ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/45 shadow-lg' 
                            : isApproved 
                              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/45' 
                              : (isDarkMode ? 'bg-[#131c2e] border-slate-800/40' : 'bg-white border-slate-200')
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">{task.desc}</span>
                            <h4 className={`font-black text-xs sm:text-sm mt-0.5 truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-850'}`}>
                              <span className="mr-1.5 text-[10px] px-1 bg-blue-500/10 text-blue-500 rounded">{task.ref}</span> {task.task}
                            </h4>
                          </div>
                          
                          <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider shrink-0 border ${getBadgeStyle(task.qaStatus)}`}>
                            {task.qaStatus}
                          </span>
                        </div>

                        {/* Interactive dynamic controls to allow on-the-go adjustments on mobile */}
                        <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                          <div className="flex-grow">
                            <div className="flex justify-between text-[8px] font-bold text-slate-500 mb-1">
                              <span>PROGRESS:</span>
                              <span>{task.progress}%</span>
                            </div>
                            
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
                            </div>
                          </div>
                          
                          {/* TOUCH TARGET INTUITIVE DAY CONTROLLER */}
                          <div className="shrink-0 flex flex-col items-center border-l border-slate-200 dark:border-slate-800/60 pl-3">
                            <span className="text-[8px] font-black text-slate-500 mb-1">BASE DAYS</span>
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-850 shadow-sm">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTask(task.id, 'duration', Math.max(1, (task.duration || 1) - 1));
                                  showToast(`Adjusted ${task.ref} duration to ${Math.max(1, (task.duration || 1) - 1)} base days`);
                                }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 active:scale-95 transition-all"
                                title="Decrease duration"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-black min-w-[16px] text-center text-blue-600 dark:text-blue-400">
                                {task.duration}
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTask(task.id, 'duration', (task.duration || 1) + 1);
                                  showToast(`Adjusted ${task.ref} duration to ${(task.duration || 1) + 1} base days`);
                                }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 active:scale-95 transition-all"
                                title="Increase duration"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Mobile card footer */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/40 text-[9px]">
                          <span className="text-slate-500 font-extrabold flex items-center gap-1"><Users size={11}/> CREW ({task.totalManpower}):</span>
                          {WORKER_ROLES.filter(r => (task[r.key] || 0) > 0).map(r => (
                            <span key={r.key} className="bg-slate-100 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700/80 px-1.5 py-0.5 rounded font-bold text-slate-600 dark:text-slate-300">
                              {r.icon} {r.label}:{task[r.key]}
                            </span>
                          ))}
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); triggerTaskRemove(task.id); }}
                          className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. RESPONSIVE HORIZONTAL GANTT */}
              {(!isMobileViewport || mobileDisplayTab === 'gantt') && (
                <div className={`flex border rounded-2xl overflow-hidden min-h-[380px] lg:min-h-[450px] shadow-lg transition-colors ${isDarkMode ? 'bg-[#131c2e]/10 border-slate-800/60' : 'bg-slate-50/50 border-slate-200'}`}>
                  
                  {/* Left spreadsheet columns - HIDDEN ON MOBILE SCREEN SIZES */}
                  <div className={`hidden lg:flex w-[45%] md:w-[35%] lg:w-[45%] flex-col shrink-0 z-10 border-r relative transition-colors ${
                    isDarkMode 
                      ? 'bg-[#131c2e] border-slate-800/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]' 
                      : 'bg-white border-slate-150 shadow-[2px_0_5px_-2px_rgba(226,232,240,0.8)]'
                  }`}>
                    
                    {/* Header values */}
                    <div className={`h-[48px] p-2 font-black text-[8px] sm:text-[9.5px] flex items-center uppercase tracking-widest sticky top-0 z-25 border-b transition-colors ${
                      isDarkMode ? 'bg-slate-900 border-slate-800/60 text-slate-400' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      <span className="w-8 sm:w-10 text-center">Ref</span>
                      <span className="flex-grow px-2 sm:px-3 truncate">Work Description</span>
                      <span className="w-8 sm:w-12 text-center shrink-0">Days</span>
                      <span className="w-10 sm:w-16 text-center shrink-0">Progress</span>
                      <span className="w-6 sm:w-8 print:hidden shrink-0"></span>
                    </div>

                    {/* Task rows lists with complete legibility upgrade */}
                    <div className="flex-grow">
                      {filteredTasks.map((task, index) => {
                        return (
                          <div 
                            key={task.id} 
                            className={`h-[54px] flex items-center text-[10px] group transition-all border-b ${getRowBgColor(task, index)}`}
                          >
                            <div className="w-8 sm:w-10 h-full text-center flex items-center justify-center relative shrink-0">
                              <GripVertical size={11} className="text-slate-400 dark:text-slate-600 absolute left-0 cursor-move opacity-0 group-hover:opacity-100 transition-opacity print:hidden" />
                              <input 
                                value={task.ref} 
                                onChange={(e) => updateTask(task.id, 'ref', e.target.value)} 
                                className={`font-mono font-black text-center w-full bg-transparent outline-none focus:text-blue-500 text-[10px] ${
                                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                }`} 
                              />
                            </div>
                            
                            <div className="flex-grow h-full flex flex-col justify-center px-1.5 sm:px-3 border-l border-slate-100 dark:border-slate-800/40 min-w-0">
                              <div className="flex items-center gap-1 sm:gap-2">
                                <span className="font-black text-[7.5px] sm:text-[8.5px] text-blue-500 uppercase tracking-widest bg-transparent outline-none shrink-0">
                                  {task.desc}
                                </span>
                                <span className={`px-1 py-0.5 rounded text-[6.5px] sm:text-[7.5px] font-black uppercase tracking-wider shrink-0 border ${getBadgeStyle(task.qaStatus)}`}>
                                  {task.qaStatus}
                                </span>
                              </div>
                              <input 
                                value={task.task} 
                                onChange={(e) => updateTask(task.id, 'task', e.target.value)} 
                                className={`font-bold text-[10px] sm:text-[12px] bg-transparent outline-none rounded-md w-full truncate leading-tight transition-all p-0.5 -ml-0.5 ${
                                  isDarkMode ? 'text-slate-100' : 'text-slate-850'
                                }`} 
                              />
                            </div>
                            
                            <div className="w-8 sm:w-12 h-full border-l border-slate-100 dark:border-slate-800/40 flex items-center justify-center p-1 shrink-0">
                              <input 
                                type="number" min="1" value={task.duration} 
                                onChange={(e) => updateTask(task.id, 'duration', parseInt(e.target.value) || 1)} 
                                className={`w-full text-center border rounded-lg py-1 text-[10px] sm:text-xs font-black outline-none transition-all ${
                                  isDarkMode 
                                    ? 'bg-slate-950/80 border-slate-800/85 text-slate-200 focus:border-blue-500' 
                                    : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
                                }`} 
                              />
                            </div>

                            {/* Progress update input area */}
                            <div className="w-10 sm:w-16 h-full border-l border-slate-100 dark:border-slate-800/40 flex flex-col items-center justify-center px-1 sm:px-2 shrink-0">
                              <div className="flex items-center gap-0.5 w-full justify-between mb-1 font-bold text-[9px] sm:text-[11px]">
                                <input 
                                  type="number" min="0" max="100" value={task.progress || 0} 
                                  onChange={(e) => updateTask(task.id, 'progress', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} 
                                  className={`w-6 sm:w-8 text-left bg-transparent rounded outline-none font-mono font-bold ${
                                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                                  }`} 
                                />
                                <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold">%</span>
                              </div>
                              <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{width: `${task.progress || 0}%`}}></div>
                              </div>
                            </div>
                            
                            <div className="w-6 sm:w-8 h-full flex items-center justify-center shrink-0 border-l border-slate-100 dark:border-slate-800/40 print:hidden">
                              <button onClick={() => triggerTaskRemove(task.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1" title="Delete Task"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Table bottom panel footer */}
                    <div className="h-[80px] p-2.5 sm:p-4 flex flex-col justify-center border-t border-slate-100 dark:border-slate-800/40 sticky bottom-0 z-20 print:hidden">
                       <button onClick={addTask} className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all px-2 py-2 rounded-xl border border-dashed w-full justify-center ${
                         isDarkMode ? 'bg-slate-955/60 text-blue-450 hover:text-blue-300 border-blue-900/40' : 'bg-blue-55 text-blue-600 border-blue-200'
                       }`}>
                         <Plus size={12} /> Add Task
                       </button>
                    </div>
                  </div>

                  {/* Horizontal Scroll Timeline Section */}
                  <div id="gantt-scroll-area" style={{ WebkitOverflowScrolling: 'touch' }} className="flex-grow flex-1 flex flex-col bg-[#0b0f19]/5 relative overflow-x-auto print:overflow-visible">
                    
                    {/* Headers dates timeline */}
                    <div className={`h-[48px] flex min-w-max sticky top-0 z-25 border-b transition-colors ${
                      isDarkMode ? 'bg-slate-900 border-slate-800/40' : 'bg-slate-100 border-slate-200'
                    }`}>
                      {headerDays.map(day => {
                        const dateStr = generateDateHeaderStr(projectStartDate, day);
                        const isWeekendDay = new Date(projectStartDate).getTime() + day * 86400000;
                        const isSatSun = new Date(isWeekendDay).getDay() === 0 || new Date(isWeekendDay).getDay() === 6;
                        return (
                          <div key={day} className={`w-[44px] h-full flex-shrink-0 text-center border-r flex flex-col justify-center transition-colors ${
                            isDarkMode 
                              ? `border-slate-800/40 ${isSatSun ? 'bg-slate-900/40' : ''}` 
                              : `border-slate-200/60 ${isSatSun ? 'bg-slate-200/45' : ''}`
                          }`}>
                            <span className={`text-[10px] font-black leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-800'}`}>{dateStr.split(' ')[0]}</span>
                            <span className="text-[8px] font-bold text-slate-400 leading-tight uppercase">{dateStr.split(' ')[1]}</span>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Dynamic grid mapping - responsive background classes */}
                    <div className={`flex-grow min-w-max relative transition-all duration-200 ${
                      isDarkMode ? "gantt-grid-dark" : "gantt-grid-light"
                    }`}>
                       {filteredTasks.map((task) => {
                          const isHold = task.qaStatus === 'HOLD';
                          const isApproved = task.qaStatus === 'APPROVED';
                          
                          return (
                            <div key={task.id} className={`h-[54px] border-b relative flex items-center transition-colors ${isDarkMode ? 'border-slate-800/40' : 'border-slate-100'}`}>
                               <div 
                                 onClick={() => setActiveTaskModal(task.id)}
                                 className={`absolute h-[28px] rounded-lg shadow-sm transition-all flex items-center justify-between overflow-hidden text-[10px] font-bold border cursor-pointer hover:scale-[1.02] hover:ring-2 hover:ring-blue-500/50 print:hover:ring-0
                                   ${isHold 
                                     ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/40' 
                                     : isApproved 
                                       ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/40' 
                                       : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500/30'}`}
                                 style={{ left: `${(task.startDays) * 44 + 2}px`, width: `${(task.adjustedDuration * 44) - 4}px` }}
                               >
                                 <div className={`absolute top-0 left-0 h-full ${
                                   isHold ? 'bg-rose-500/10 dark:bg-rose-500/20' : isApproved ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : 'bg-blue-500/10 dark:bg-blue-500/20'
                                 }`} style={{ width: `${task.progress || 0}%` }} />
                                 
                                 <div className="absolute inset-0 flex justify-between items-center px-2.5 z-10 pointer-events-none">
                                   {/* PRO MOBILE UX ENHANCEMENT: Render the title over the bar on small viewports */}
                                   <span className="font-extrabold text-[9px] sm:text-[10px] truncate max-w-[85%]">
                                     <span className="opacity-75 mr-1 text-[8.5px] font-black">{task.ref}</span>
                                     {isMobileViewport ? task.task : `${task.adjustedDuration}d`}
                                   </span>
                                   
                                   <div className="flex gap-1.5 items-center">
                                     <span className={`flex items-center gap-0.5 text-[8px] border px-1 py-0.5 rounded shadow-sm pointer-events-auto ${
                                       isDarkMode 
                                         ? 'bg-slate-900 border-slate-805 text-slate-300' 
                                         : 'bg-white border-slate-200 text-slate-600'
                                     }`}>
                                       <UserPlus size={9}/> Crew
                                     </span>
                                     {task.totalManpower > 0 && !isMobileViewport && (
                                       <span className={`hidden md:flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded ${
                                         isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-600 border border-slate-200'
                                       }`}>
                                         <Users size={9}/> {task.totalManpower}
                                       </span>
                                     )}
                                   </div>
                                 </div>
                               </div>
                            </div>
                          )
                       })}
                    </div>
                    
                    {/* Daily workforce load chart */}
                    <div className={`h-[80px] border-t flex min-w-max items-end relative sticky bottom-0 z-20 transition-colors ${
                      isDarkMode ? 'bg-[#0f172a] border-slate-800/40' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className={`absolute left-3 top-3 text-[8.5px] font-black uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 rounded shadow-md border ${
                        isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-800/40' : 'bg-white/95 text-slate-600 border-slate-200'
                      }`}>
                        <BarChart3 size={11} className="text-blue-500" /> Daily Load Histogram
                      </div>
                      
                      {headerDays.map(day => {
                        const dayManpower = activeFlowTasks.reduce((sum, task) => {
                          if (day >= task.startDays && day < task.startDays + task.adjustedDuration) return sum + task.totalManpower;
                          return sum;
                        }, 0);
                        const heightPercentage = maxManpowerVal > 0 ? (dayManpower / maxManpowerVal) * 100 : 0;
                        return (
                          <div key={`mp-${day}`} className={`w-[44px] h-full flex-shrink-0 border-r flex flex-col justify-end items-center pb-2 relative group ${isDarkMode ? 'border-slate-800/40' : 'border-slate-200'}`}>
                            <div className={`w-6 rounded-t transition-all flex items-end justify-center ${
                              dayManpower > 12 
                                ? 'bg-rose-500/40 dark:bg-rose-500/40 group-hover:bg-rose-500/60' 
                                : (isDarkMode ? 'bg-[#3b82f6]/20 group-hover:bg-[#3b82f6]/40' : 'bg-indigo-300 group-hover:bg-indigo-400')
                            }`} style={{ height: `${heightPercentage * 0.6}%`, minHeight: dayManpower > 0 ? '4px' : '0' }} ></div>
                            <span className={`text-[10px] font-black mt-1 ${dayManpower > 12 ? 'text-rose-500 font-bold' : 'text-slate-600'}`}>{dayManpower > 0 ? dayManpower : '-'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* Status footer information */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-bold print:hidden">
                 <span className="flex items-center gap-1"><Info size={12}/> Secure global Mother Link database synchronized.</span>
                 <span>Turn-On Target: <strong className="text-blue-500 text-sm ml-1">{totalDays} Days</strong></span>
              </div>
            </div>
          </div>
      </div>

      {/* CORE INSPECTION CHECKLIST GATE MODAL */}
      {}
      {activeTaskModal && (() => {
        const currentTaskEditing = activeFlowTasks.find(t => t.id === activeTaskModal);
        if (!currentTaskEditing) return null;
        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
            <div className={`rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border flex flex-col max-h-[90vh] transition-all duration-300 ${
              isDarkMode ? 'bg-[#131c2e] border-slate-800/40' : 'bg-white border-slate-200'
            }`}>
              {/* Header */}
              <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800/40 bg-slate-950/40' : 'border-slate-100 bg-slate-50'}`}>
                <div>
                  <h3 className="text-sm sm:text-base font-black flex items-center gap-2"><ClipboardCheck size={18} className="text-blue-500" /> Site Field Inspector Card</h3>
                  <p className="text-[11px] text-slate-400 font-bold mt-1"><span className="text-blue-450 bg-blue-500/10 border border-blue-500/10 px-1.5 py-0.5 rounded mr-1.5">{currentTaskEditing.ref}</span> {currentTaskEditing.task}</p>
                </div>
                <button onClick={() => setActiveTaskModal(null)} className={`p-1.5 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-750 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-400'}`}><X size={14} /></button>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-5">
                
                {/* DYNAMIC BASE DAYS EDITABLE TARGETS FOR MOBILE (Solves Mobile adjustment limitations) */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Task Duration Base Days (Mobile Friendly)</h4>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        updateTask(currentTaskEditing.id, 'duration', Math.max(1, (currentTaskEditing.duration || 1) - 1));
                        showToast(`Decreased duration to ${Math.max(1, (currentTaskEditing.duration || 1) - 1)} base days`);
                      }}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition active:scale-95"
                    >
                      <Minus size={16} />
                    </button>
                    
                    <input 
                      type="number" 
                      min="1" 
                      value={currentTaskEditing.duration || 1} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        updateTask(currentTaskEditing.id, 'duration', val);
                      }}
                      className="w-24 text-center font-black text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 text-blue-600 dark:text-blue-400 shadow-sm outline-none"
                    />
                    
                    <button 
                      onClick={() => {
                        updateTask(currentTaskEditing.id, 'duration', (currentTaskEditing.duration || 1) + 1);
                        showToast(`Increased duration to ${(currentTaskEditing.duration || 1) + 1} base days`);
                      }}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition active:scale-95"
                    >
                      <Plus size={16} />
                    </button>
                    
                    <div className="text-xs font-bold text-slate-400 ml-2">
                      Base Days (Delay adjust: {currentTaskEditing.adjustedDuration}d)
                    </div>
                  </div>
                </div>

                {/* Progress Slider Preset Buttons */}
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Progress Tracker</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <input 
                      type="range" min="0" max="100" step="10" 
                      value={currentTaskEditing.progress || 0}
                      onChange={(e) => updateTask(currentTaskEditing.id, 'progress', parseInt(e.target.value))}
                      className="flex-grow accent-blue-500 cursor-pointer"
                    />
                    <span className="font-mono font-black text-xs text-blue-550 w-10 text-right">{currentTaskEditing.progress || 0}%</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "Not Started", value: 0 },
                      { label: "Active Work", value: 50 },
                      { label: "Finished", value: 100 }
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => {
                          updateTask(currentTaskEditing.id, 'progress', preset.value);
                          if (preset.value === 100) {
                            const list = { ...(currentTaskEditing.checklist || {}) };
                            Object.keys(list).forEach(k => list[k] = true);
                            updateTask(currentTaskEditing.id, 'checklist', list);
                            updateTask(currentTaskEditing.id, 'qaStatus', 'APPROVED');
                          }
                          showToast(`Progress set to ${preset.label} (${preset.value}%)`);
                        }}
                        className={`py-1.5 px-1 rounded-xl text-center text-[9px] font-black uppercase tracking-wider border transition-all ${
                          currentTaskEditing.progress === preset.value
                            ? 'bg-blue-600/20 border-blue-500 text-blue-500'
                            : (isDarkMode ? 'bg-[#131c2e] border-slate-800/40 text-slate-400 hover:text-slate-355' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100')
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hold status levels */}
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">QA/QC Hold Point Level</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { status: 'PENDING', label: "Active", color: "border-blue-500/20 text-blue-400 bg-blue-500/5" },
                      { status: 'HOLD', label: "🔴 Hold", color: "border-rose-500/20 text-rose-400 bg-rose-500/5" },
                      { status: 'APPROVED', label: "🟢 Cleared", color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" }
                    ].map((item) => {
                      const isSelected = currentTaskEditing.qaStatus === item.status;
                      return (
                        <button
                          key={item.status}
                          onClick={() => {
                            updateTask(currentTaskEditing.id, 'qaStatus', item.status);
                            showToast(`Status updated to ${item.status}`);
                          }}
                          className={`p-2 rounded-xl border text-center transition-all flex flex-col justify-center items-center gap-0.5 ${
                            isSelected 
                              ? (item.status === 'HOLD' ? 'border-rose-500 bg-rose-500/15 text-rose-500' : item.status === 'APPROVED' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-550' : 'border-blue-500 bg-blue-500/15 text-blue-500')
                              : (isDarkMode ? 'bg-[#131c2e] border-slate-800/40 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                          }`}
                        >
                          <span className="font-black text-[9px] uppercase tracking-wider">{item.status}</span>
                          <span className="text-[7.5px] opacity-75">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic checking list */}
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5"><ListTodo size={12} className="text-blue-500"/> Engineering Sign-Off Steps</h4>
                  
                  {Object.keys(currentTaskEditing.checklist || {}).length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic">No checklist parameters set for this task class.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {Object.entries(currentTaskEditing.checklist).map(([name, completed]) => (
                        <label 
                          key={name}
                          className={`flex items-center justify-between p-2 rounded-xl border text-[11px] cursor-pointer transition-all ${
                            completed 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-305' 
                              : (isDarkMode ? 'bg-[#131c2e] border-slate-800/40 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-105 hover:bg-slate-50 text-slate-700')
                          }`}
                        >
                          <span className="font-bold">{name}</span>
                          <input 
                            type="checkbox" 
                            checked={completed} 
                            onChange={() => toggleChecklistItem(currentTaskEditing.id, name)}
                            className="rounded border-slate-850 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 shrink-0 bg-slate-950"
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-1.5">
                    <input 
                      type="text" 
                      placeholder="Add custom inspector checks" 
                      id="new-check-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addChecklistItem(currentTaskEditing.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className={`flex-grow px-3 py-1.5 rounded-xl text-[11px] font-semibold border outline-none ${
                        isDarkMode ? 'bg-slate-900 border-slate-800/40 text-slate-200 focus:border-blue-500/40' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
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
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-3 rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Manpower values adjustment */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Labor Crew Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {WORKER_ROLES.map(r => {
                      const count = parseInt(currentTaskEditing[r.key]) || 0;
                      return (
                        <div key={r.key} className={`flex items-center gap-2 border rounded-xl p-1.5 transition-colors ${count > 0 ? r.bg : (isDarkMode ? 'bg-[#0b0f19] border-slate-800/40 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400')}`}>
                          <span className="text-xs pl-0.5">{r.icon} <span className="text-[9px] font-black uppercase ml-0.5">{r.label}</span></span>
                          <div className={`flex items-center rounded-lg border text-slate-800 overflow-hidden shadow ${isDarkMode ? 'bg-[#131c2e] border-slate-800/40' : 'bg-white border-slate-200'}`}>
                            <button onClick={() => adjustWorkerCount(currentTaskEditing.id, r.key, -1)} className={`px-1.5 py-0.5 transition ${isDarkMode ? 'hover:bg-slate-850 text-slate-300' : 'hover:bg-slate-100'}`}><Minus size={10}/></button>
                            <span className={`text-[10px] font-black w-4 text-center ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{count}</span>
                            <button onClick={() => adjustWorkerCount(currentTaskEditing.id, r.key, 1)} className={`px-1.5 py-0.5 transition ${isDarkMode ? 'hover:bg-slate-850 text-slate-300' : 'hover:bg-slate-100'}`}><Plus size={10}/></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Worker names logging */}
                <div className={`space-y-3 pt-3 border-t ${isDarkMode ? 'border-slate-800/40' : 'border-slate-105'}`}>
                  {WORKER_ROLES.filter(r => (currentTaskEditing[r.key] || 0) > 0).map(r => {
                    const inputs = [];
                    for(let i=0; i<parseInt(currentTaskEditing[r.key]); i++) {
                      inputs.push(
                        <input 
                          key={i} type="text" value={currentTaskEditing.assigned?.[r.key]?.[i] || ''}
                          onChange={(e) => assignWorkerName(currentTaskEditing.id, r.key, i, e.target.value)}
                          placeholder={`Enter name for ${r.fullName} #${i+1}...`}
                          className={`px-3 py-2 border rounded-xl text-[10px] font-semibold w-full outline-none ${
                            isDarkMode ? 'bg-[#0b0f19] border-slate-800/40 text-slate-200' : 'bg-slate-50 border-slate-250 text-slate-850'
                          }`}
                        />
                      );
                    }
                    return (
                      <div key={r.key} className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.fullName} Name Log</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{inputs}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'bg-slate-955/60 border-slate-800/40' : 'bg-slate-50'}`}>
                <button onClick={() => setActiveTaskModal(null)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl">Close Inspector</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* BRANDING CONFIG MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#131c2e] text-slate-100' : 'bg-white text-slate-850'}`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-800/40' : 'bg-slate-50'}`}>
              <span className="font-extrabold text-xs flex items-center gap-2"><Settings size={14}/> Console Brand Config</span>
              <button onClick={() => setIsSettingsOpen(false)} className={`p-1.5 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-850 border-slate-800/40 text-slate-400' : 'bg-white text-slate-400'}`}><X size={12} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Citicore Logo Image File</label>
                <label className={`cursor-pointer border border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all ${isDarkMode ? 'bg-[#0b0f19]/45 border-slate-800/40 hover:bg-slate-850' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                  {logos.left ? <img src={logos.left} className="h-8 object-contain" alt="Left" /> : <UploadCloud size={20} className="text-blue-500"/>}
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Image</span>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('left', e)} className="hidden" />
                </label>
              </div>
              
              <div>
                <label className="block text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">MBV Logo Image File</label>
                <label className={`cursor-pointer border border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 transition-all ${isDarkMode ? 'bg-[#0b0f19]/45 border-slate-800/40 hover:bg-slate-850' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                  {logos.right ? <img src={logos.right} className="h-8 object-contain" alt="Right" /> : <UploadCloud size={20} className="text-blue-500"/>}
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Image</span>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('right', e)} className="hidden" />
                </label>
              </div>
            </div>
            
            <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-800/40' : 'bg-slate-50'}`}>
              <button onClick={() => setIsSettingsOpen(false)} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl">Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}