import React, { useState, useCallback, useEffect } from 'react';
import { 
  CalendarDays, Settings, X, Plus, Trash2, 
  CheckCircle2, Share2, GripVertical, UploadCloud, 
  Users, UserPlus, Hammer, Zap, Minus, BarChart3, Info, Loader2, Printer,
  LayoutDashboard, FilePlus2, Clock, ChevronRight, Home, FolderPlus, Sun, Moon,
  ShieldAlert, CloudRain, ListTodo, ClipboardCheck, ArrowUpDown, Smartphone, Monitor
} from 'lucide-react';

// === CLOUD STORAGE IMPORTS ==================================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-9 w-auto">
    <path d="M15 10 L25 22 L15 34 L20 34 L30 22 L20 10 Z" fill="#EAB308" />
    <path d="M22 10 L32 22 L22 34 L27 34 L37 22 L27 10 Z" fill="#F1C40F" />
    <text x="50" y="24" fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize="15" fill="#3b82f6">CITICORE</text>
    <text x="50" y="34" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="6" fill="#94a3b8" letterSpacing="1.5">CONSTRUCTION</text>
  </svg>
);

const MbvLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-9 w-auto">
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

const copyToClipboard = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
  } else {
      let textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try { document.execCommand('copy'); } catch (err) {}
      textArea.remove();
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// ============================================================================
// MAIN REVOLUTIONIZED APPLICATION
// ============================================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('loading'); // 'loading', 'dashboard', 'editor'
  
  // Responsive display mode configuration (mobile/gantt)
  const [mobileDisplayTab, setMobileDisplayTab] = useState('tasks'); // 'tasks', 'gantt', 'qa'
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  // Friendly onboarding tour state for non-tech-savvy site crews
  const [showTour, setShowTour] = useState(() => {
    return localStorage.getItem('mbv_seen_tour') !== 'true';
  });
  const [tourStep, setTourStep] = useState(1);

  // Dark Theme Preference State (Persistent)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('mbv_dark_mode') !== 'false'; // Default to true (dark theme)
  });

  // Active Weather Scenario State
  const [weatherFactor, setWeatherFactor] = useState('sunny'); // 'sunny', 'heavy_rain', 'typhoon'

  // Dashboard State (List of all saved projects)
  const [projects, setProjects] = useState([]);
  
  // Active Editor State
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [projectStartDate, setProjectStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [appTitle, setAppTitle] = useState("Citicore Field Console");
  const [appSubtitle, setAppSubtitle] = useState("MBV Electric Schedule Architect");
  const [logos, setLogos] = useState({ left: '', right: '' });
  const [docMetadata, setDocMetadata] = useState({
    projectName: "CITICORE 100MW EXPANSION",
    location: "Pagbilao, Quezon Site Office",
    docNo: "DOC-CIT-MBV-901",
    revision: "02",
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
  });

  // UI States
  const [toastMessage, setToastMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('all'); // 'all', 'hold', 'approved'

  // Standard modal custom prompt states to replace raw window.confirm
  const [customPrompt, setCustomPrompt] = useState(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 4000);
  }, []);

  // Window size monitoring for dynamic mobile styling
  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save Theme to LocalStorage on Change
  useEffect(() => {
    localStorage.setItem('mbv_dark_mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const savedProjects = localStorage.getItem('mbv_projects');
    let loadedProjects = savedProjects ? JSON.parse(savedProjects) : [];
    setProjects(loadedProjects);

    if (auth) {
      const initAuth = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (err) {
          console.error("Authentication check failure: ", err);
        }
      };
      initAuth();
      onAuthStateChanged(auth, setUser);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('id');

    if (sharedId) {
      if (db) {
        fetchSharedProject(sharedId, loadedProjects);
      } else {
        showToast("Database is offline. Redirecting back to dashboard.");
        setView('dashboard');
      }
    } else {
      setView('dashboard');
    }
  }, []);

  const fetchSharedProject = async (id, currentProjects) => {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        const newProject = {
          id: id, 
          appTitle: data.appTitle || "Imported Project",
          appSubtitle: data.appSubtitle || "",
          projectStartDate: data.projectStartDate || new Date().toISOString().split('T')[0],
          docMetadata: data.docMetadata || {},
          tasks: data.tasks || INITIAL_TASKS,
          logos: data.logos || { left: '', right: '' },
          lastModified: new Date().toISOString()
        };

        const updatedProjects = [newProject, ...currentProjects.filter(p => p.id !== id)];
        setProjects(updatedProjects);
        localStorage.setItem('mbv_projects', JSON.stringify(updatedProjects));
        
        const url = new URL(window.location.href);
        url.searchParams.delete('id');
        window.history.replaceState({}, document.title, url.toString());

        loadProjectIntoEditor(newProject);
        showToast("Shared schedule loaded into workspace successfully!");
      } else {
        showToast("Shared project link is invalid or expired.");
        setView('dashboard');
      }
    } catch (err) {
      console.error(err);
      showToast("Error establishing network download.");
      setView('dashboard');
    }
  };

  useEffect(() => {
    if (view === 'editor' && activeProjectId) {
      const updatedProjects = projects.map(p => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            appTitle,
            appSubtitle,
            projectStartDate,
            docMetadata,
            tasks,
            logos,
            lastModified: new Date().toISOString()
          };
        }
        return p;
      });
      setProjects(updatedProjects);
      localStorage.setItem('mbv_projects', JSON.stringify(updatedProjects));
    }
  }, [tasks, docMetadata, projectStartDate, appTitle, appSubtitle, logos, activeProjectId, view]);

  // Project managers, QA, & PM Action flows
  const createNewProject = () => {
    const newProject = {
      id: generateId(),
      appTitle: "Citicore 100MW Console",
      appSubtitle: "Site Operations Schedule Blueprint",
      projectStartDate: new Date().toISOString().split('T')[0],
      docMetadata: {
        projectName: "NEW EXPANSION GRID",
        location: "Quezon Substation Hub",
        docNo: "DOC-CIT-MBV-901",
        revision: "01",
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
      },
      tasks: INITIAL_TASKS,
      logos: { left: '', right: '' },
      lastModified: new Date().toISOString()
    };

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('mbv_projects', JSON.stringify(updatedProjects));
    loadProjectIntoEditor(newProject);
  };

  const loadProjectIntoEditor = (project) => {
    setActiveProjectId(project.id);
    setAppTitle(project.appTitle);
    setAppSubtitle(project.appSubtitle);
    setProjectStartDate(project.projectStartDate);
    setDocMetadata(project.docMetadata);
    setTasks(project.tasks);
    setLogos(project.logos || { left: '', right: '' });
    setView('editor');
  };

  const triggerPromptDelete = (id, e) => {
    e.stopPropagation();
    setCustomPrompt({
      title: "Delete Project Schedule?",
      message: "Are you sure you want to permanently clear this workspace model? This cannot be undone.",
      onConfirm: () => {
        const updatedProjects = projects.filter(p => p.id !== id);
        setProjects(updatedProjects);
        localStorage.setItem('mbv_projects', JSON.stringify(updatedProjects));
        showToast("Project deleted from localized storage.");
        setCustomPrompt(null);
      },
      onCancel: () => setCustomPrompt(null)
    });
  };

  const handleShareToCloud = async () => {
    if (!isFirebaseConfigured || !db) {
      showToast("Online sharing database not linked. Working in local sandbox.");
      return;
    }
    
    setIsSavingCloud(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', activeProjectId);
      await setDoc(docRef, {
        tasks, docMetadata, projectStartDate, appTitle, appSubtitle, logos,
        updatedAt: new Date().toISOString()
      });
      
      const url = new URL(window.location.href);
      url.searchParams.set('id', activeProjectId);
      copyToClipboard(url.toString());
      
      showToast("Cloud-Sync success! Dynamic sharing link copied to clipboard.");
    } catch (err) {
      console.error(err);
      showToast("Network transmission error occurred.");
    } finally {
      setIsSavingCloud(false);
    }
  };

  // Weather condition dynamic duration delay adjustment factor
  const fetchWeatherDelayMultiplier = () => {
    if (weatherFactor === 'heavy_rain') return 1.5; // +50% delay
    if (weatherFactor === 'typhoon') return 2.0;    // +100% delay
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
  const globalProgress = Math.round(activeFlowTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / (activeFlowTasks.length || 1));

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
    showToast("New schedule row inserted.");
  };

  const triggerTaskRemove = (id) => {
    setCustomPrompt({
      title: "Remove Task Row?",
      message: "This will immediately eliminate this task card and all of its custom crew names. Proceed?",
      onConfirm: () => {
        setTasks(tasks.filter(t => t.id !== id));
        showToast("Task row deleted.");
        setCustomPrompt(null);
      },
      onCancel: () => setCustomPrompt(null)
    });
  };

  // Checkbox state toggles for QA checkpoints
  const toggleChecklistItem = (taskId, checklistName) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const list = { ...(t.checklist || {}) };
        list[checklistName] = !list[checklistName];
        
        // Auto-approve status if checklist items are 100% checked
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

  // Add customized checks dynamically to task models
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

  // Filter tasks in workspaces based on search matching
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

  // ============================================================================
  // RENDER: LOADING VIEW
  // ============================================================================
  if (view === 'loading') {
    return (
      <div className={`flex flex-col h-screen items-center justify-center transition-all ${isDarkMode ? 'bg-[#0b0f19] text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <h2 className="font-bold text-md">Opening Citicore Workspace...</h2>
      </div>
    );
  }

  // ============================================================================
  // RENDER: DASHBOARD VIEW
  // ============================================================================
  if (view === 'dashboard') {
    return (
      <div className={`flex flex-col h-screen font-sans overflow-y-auto transition-all duration-300 ${isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
        
        {/* Customized Alert Modal */}
        {customPrompt && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl p-6 max-w-sm w-full border ${isDarkMode ? 'bg-[#131c2e] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} shadow-2xl`}>
              <h3 className="font-extrabold text-lg mb-2">{customPrompt.title}</h3>
              <p className="text-sm text-slate-400 mb-6">{customPrompt.message}</p>
              <div className="flex gap-3 justify-end">
                <button onClick={customPrompt.onCancel} className={`px-4 py-2 rounded-lg text-sm font-semibold border ${isDarkMode ? 'border-slate-800 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>Cancel</button>
                <button onClick={customPrompt.onConfirm} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Brand Banner Header */}
        <header className={`border-b px-6 py-5 shadow-lg shrink-0 transition-all ${isDarkMode ? 'bg-[#131c2e]/60 border-slate-900/60' : 'bg-white border-slate-200'}`}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg text-white animate-pulse"><LayoutDashboard size={22} /></div>
              <div>
                <h1 className="font-black text-2xl tracking-tight leading-none">Citicore Grid Consoles</h1>
                <span className="text-[10px] uppercase tracking-widest text-blue-500 font-extrabold">Engineering & QA Control</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className={`p-2.5 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'}`}
                title={isDarkMode ? "Toggle Light Layout" : "Toggle Eye-Comfort Dark Layout"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button onClick={createNewProject} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20 border border-blue-500">
                <FilePlus2 size={16}/> Create New Schedule
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Grid Container */}
        <main className="max-w-6xl mx-auto w-full p-6 md:p-8 flex-grow">
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Live Workspaces ({projects.length})</h2>
              <p className="text-slate-400 text-xs mt-1">Select an active Citicore project timeline grid to load parameters and run scheduling forecasts.</p>
            </div>
          </div>
          
          {projects.length === 0 ? (
            <div className={`text-center py-16 rounded-3xl border border-dashed transition-colors ${isDarkMode ? 'bg-[#131c2e]/30 border-slate-800' : 'bg-white border-slate-200'}`}>
              <FolderPlus size={44} className="mx-auto text-slate-400 mb-3 animate-bounce" />
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No localized schedules recorded</h3>
              <p className="text-slate-500 text-xs mt-1 mb-6 max-w-sm mx-auto">Create a brand new timeline blueprint to initialize site coordinates, curing holds, and crane mobilizations.</p>
              <button onClick={createNewProject} className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 py-2.5 px-6 rounded-xl text-xs font-extrabold uppercase tracking-widest transition">Initialize Sandbox Project</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => loadProjectIntoEditor(p)} 
                  className={`rounded-2xl p-5 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full border ${
                    isDarkMode ? 'bg-[#131c2e]/80 border-slate-800/40 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? 'bg-[#0b0f19] text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-400' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                      <CalendarDays size={18} />
                    </div>
                    <button onClick={(e) => triggerPromptDelete(p.id, e)} className="text-slate-400 hover:text-rose-500 transition-colors p-1" title="Delete Schedule">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                  
                  <h3 className={`font-black text-lg leading-snug mb-1 group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-850'}`}>{p.appTitle}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-wider mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{p.docMetadata?.projectName || "UNTITLED GRID"}</p>
                  
                  <div className={`mt-auto pt-4 border-t flex items-center justify-between text-[11px] font-semibold ${isDarkMode ? 'border-slate-800/40 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                    <span className="flex items-center gap-1.5"><Clock size={13}/> {new Date(p.lastModified).toLocaleDateString()}</span>
                    <span className="flex items-center gap-0.5 text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-all">Launch Console <ChevronRight size={12}/></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ============================================================================
  // RENDER: EDITOR VIEW (Main Application)
  // ============================================================================
  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Scrollbar & Styling overrides without high-contrast borders */}
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#1e293b' : '#cbd5e1'}; border-radius: 6px; }
        ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
        
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          body { background-color: #ffffff !important; color: #000000 !important; }
          header, button, .print\\:hidden { display: none !important; }
          #gantt-export-zone { border: none !important; box-shadow: none !important; padding: 0 !important; width: 100% !important; }
        }
      `}} />

      {/* Dynamic Alerts Modal container */}
      {customPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 max-w-sm w-full border ${isDarkMode ? 'bg-[#131c2e] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-850'} shadow-2xl`}>
            <h3 className="font-extrabold text-lg mb-2">{customPrompt.title}</h3>
            <p className="text-sm text-slate-400 mb-6">{customPrompt.message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={customPrompt.onCancel} className={`px-4 py-2 rounded-lg text-sm font-semibold border ${isDarkMode ? 'border-slate-800 bg-slate-800 text-slate-350' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>Cancel</button>
              <button onClick={customPrompt.onConfirm} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold">Confirm Action</button>
            </div>
          </div>
        </div>
      )}

      {/* ONBOARDING INTERACTIVE TOUR (Designed specifically for non-tech users) */}
      {showTour && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
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

      {/* TOP DESKTOP AND TABLET NAVIGATION BAR */}
      <header className={`border-b px-4 py-3 flex items-center justify-between shadow-md z-20 shrink-0 print:hidden transition-colors ${isDarkMode ? 'bg-[#131c2e]/90 border-slate-900/60' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setView('dashboard')} className={`p-2.5 rounded-xl transition flex items-center justify-center ${isDarkMode ? 'bg-[#0b0f19] text-slate-300 hover:bg-slate-850' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} title="Dashboard Directory">
            <Home size={16} />
          </button>
          
          <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <input 
                type="text" value={appTitle} onChange={(e) => setAppTitle(e.target.value)}
                className={`font-black text-sm md:text-base leading-none bg-transparent border-b border-transparent hover:border-slate-800 focus:border-blue-500 outline-none w-[180px] md:w-[260px] transition-all ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}
                placeholder="Field Console Label"
              />
            </div>
            <input 
              type="text" value={appSubtitle} onChange={(e) => setAppSubtitle(e.target.value)}
              className="text-blue-500 text-[9px] font-black uppercase tracking-widest bg-transparent border-b border-transparent hover:border-blue-900 focus:border-blue-500 outline-none w-[180px] md:w-[260px] mt-0.5"
              placeholder="Division Name"
            />
          </div>
        </div>

        {/* Global Toolbar Handlers */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Weather Simulation Card Tool */}
          <div className={`hidden lg:flex items-center gap-2 border rounded-xl px-3 py-1.5 transition-colors ${isDarkMode ? 'bg-[#0b0f19]/60 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1"><CloudRain size={12}/> Weather:</span>
            <select 
              value={weatherFactor} 
              onChange={(e) => {
                setWeatherFactor(e.target.value);
                showToast(`Weather updated to ${e.target.value.replace('_', ' ').toUpperCase()}. Cascading safety delays adjusted!`);
              }} 
              className="text-xs font-bold bg-transparent outline-none border-none text-blue-400 cursor-pointer"
            >
              <option value="sunny">☀️ Sunny (1.0x)</option>
              <option value="heavy_rain">🌧️ Light Rain (1.5x Buffer)</option>
              <option value="typhoon">🌀 Typhoon Hold (2.0x Hard Delay)</option>
            </select>
          </div>

          <div className={`hidden sm:flex items-center border rounded-xl px-3 py-1.5 text-xs ${isDarkMode ? 'bg-[#0b0f19]/60 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mr-2">Start Date:</span>
            <input type="date" value={projectStartDate} onChange={(e) => setProjectStartDate(e.target.value)} className="text-xs outline-none bg-transparent cursor-pointer font-bold text-blue-400" />
          </div>

          <div className="flex gap-1.5">
            <button onClick={addTask} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shadow-blue-500/15 border border-blue-600">
              <Plus size={14}/> Add Task
            </button>
            
            <button onClick={triggerSystemPrint} className="hidden md:flex bg-slate-850 hover:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider items-center gap-1.5 transition" title="Export High-Fidelity PDF Blueprint">
              <Printer size={14}/> Export
            </button>

            {/* Dark Mode toggle */}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-slate-850 border-slate-850 hover:bg-slate-800 text-amber-400' : 'bg-white border-slate-200 hover:bg-slate-100 text-indigo-650'}`} title="Theme Toggle">
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button onClick={handleShareToCloud} disabled={isSavingCloud} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition">
              {isSavingCloud ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13}/>} Sync
            </button>
            
            <button onClick={() => setIsSettingsOpen(true)} className={`p-2 rounded-xl transition border shadow-sm ${isDarkMode ? 'bg-[#131c2e] border-slate-800/40 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'}`}>
              <Settings size={15}/>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SCROLL CONVERSION HEADER (Active tab control bar on narrow screen widths) */}
      <div className="lg:hidden shrink-0 border-b flex bg-slate-900/40 border-slate-800/40 print:hidden justify-around items-center h-12">
        <button 
          onClick={() => setMobileDisplayTab('tasks')}
          className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 h-full border-b-2 px-3 ${mobileDisplayTab === 'tasks' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'}`}
        >
          <Smartphone size={14}/> Site Cards
        </button>
        <button 
          onClick={() => setMobileDisplayTab('gantt')}
          className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 h-full border-b-2 px-3 ${mobileDisplayTab === 'gantt' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'}`}
        >
          <Monitor size={14}/> Timeline Gantt
        </button>
        <button 
          onClick={() => setMobileDisplayTab('qa')}
          className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 h-full border-b-2 px-3 ${mobileDisplayTab === 'qa' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'}`}
        >
          <ClipboardCheck size={14}/> QA Holds
        </button>
      </div>

      {/* MASTER SCROLLABLE FIELD WORKSPACE */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 relative">
        <div className="max-w-[1550px] mx-auto flex flex-col gap-6 h-full pb-10">
            
            {/* SEARCH AND INTEGRATED FILTERS SUB-PANEL */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
              <div className="relative w-full sm:w-80">
                <input 
                  type="text" 
                  placeholder="Filter tasks by name, ref..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold outline-none border transition-all ${
                    isDarkMode ? 'bg-[#131c2e] border-slate-800/40 text-slate-200 focus:border-blue-500/50' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
                  }`}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">Clear</button>
                )}
              </div>

              {/* Dynamic Information Alert banner to make it feel usable */}
              <div onClick={() => setShowTour(true)} className={`hidden sm:flex items-center gap-2 text-[11px] font-bold cursor-pointer py-1.5 px-3 rounded-lg border hover:scale-98 transition ${
                isDarkMode ? 'bg-blue-950/20 border-blue-500/10 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <span>💡 First time here? Learn how to use the Site Console in 60s!</span>
              </div>

              {/* Status Tabs filters */}
              <div className="flex gap-2 w-full sm:w-auto">
                {['all', 'hold', 'approved'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTabFilter(tab)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                      activeTabFilter === tab 
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                        : (isDarkMode ? 'bg-[#131c2e]/30 border-slate-800/40 text-slate-500 hover:text-slate-300' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600')
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* START OF EXPORT PRINT MODULE ZONE */}
            <div id="gantt-export-zone" className={`rounded-2xl shadow-xl border p-4 md:p-6 flex flex-col gap-5 w-full relative transition-colors duration-200 ${isDarkMode ? 'bg-[#131c2e]/20 border-slate-900/60' : 'bg-white border-slate-200'}`}>
              
              {/* Corporate Head Banner Section */}
              <div className={`border-b pb-5 shrink-0 transition-colors ${isDarkMode ? 'border-slate-800/40' : 'border-slate-200'}`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="w-full md:w-[30%] flex justify-start items-center">
                    {logos.left ? <img src={logos.left} className="h-10 object-contain" alt="Left" /> : <CiticoreLogo />}
                  </div>
                  <div className="w-full md:w-[40%] text-center">
                    <input 
                      value={docMetadata.projectName} onChange={(e) => setDocMetadata({...docMetadata, projectName: e.target.value.toUpperCase()})}
                      className={`w-full text-center text-base md:text-lg font-black tracking-tight bg-transparent uppercase border-b border-transparent hover:border-slate-800 focus:border-blue-500 outline-none transition-all ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                      placeholder="ENTER PROJECT SPEC..."
                    />
                    <input 
                      value={docMetadata.location} onChange={(e) => setDocMetadata({...docMetadata, location: e.target.value})}
                      className="w-full text-center text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-widest bg-transparent border-b border-transparent hover:border-slate-800 focus:border-blue-500 outline-none"
                      placeholder="LOCATION DETAILS..."
                    />
                  </div>
                  <div className="w-full md:w-[30%] flex justify-center md:justify-end items-center">
                    {logos.right ? <img src={logos.right} className="h-10 object-contain" alt="Right" /> : <MbvLogo />}
                  </div>
                </div>
                
                {/* Meta Fields table */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-[9px] font-black uppercase tracking-wider border-t pt-4 transition-colors ${isDarkMode ? 'border-slate-800/40 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                  <div className="flex flex-col gap-1 border-r border-slate-800/40">
                    <span>Document No:</span>
                    <input value={docMetadata.docNo} onChange={(e) => setDocMetadata({...docMetadata, docNo: e.target.value})} className={`font-mono bg-transparent outline-none font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} />
                  </div>
                  <div className="flex flex-col gap-1 border-r border-slate-800/40 pl-0 md:pl-4">
                    <span>Revision:</span>
                    <input value={docMetadata.revision} onChange={(e) => setDocMetadata({...docMetadata, revision: e.target.value})} className={`bg-transparent outline-none font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} />
                  </div>
                  <div className="flex flex-col gap-1 border-r border-slate-800/40 pl-0 md:pl-4">
                    <span>Effective Date:</span>
                    <input value={docMetadata.date} onChange={(e) => setDocMetadata({...docMetadata, date: e.target.value})} className={`bg-transparent outline-none font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} />
                  </div>
                  <div className="flex flex-col gap-1 pl-0 md:pl-4">
                    <span>Site Conditions:</span>
                    <span className="text-blue-400 font-bold tracking-widest">{weatherFactor.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* CORE VIEWPORTS CONTAINER: Switch layout depending on screen size or selected tab */}

              {/* 1. PORTABLE MOBILE CARDS VIEWPORT */}
              {(!isMobileViewport || mobileDisplayTab === 'tasks') && (
                <div className="block lg:hidden space-y-4">
                  {filteredTasks.map((task) => {
                    const isHold = task.qaStatus === 'HOLD';
                    const isApproved = task.qaStatus === 'APPROVED';
                    
                    return (
                      <div 
                        key={task.id}
                        onClick={() => setActiveTaskModal(task.id)}
                        className={`p-4 rounded-xl border transition-all flex flex-col gap-3 relative cursor-pointer ${
                          isHold 
                            ? 'bg-rose-950/20 border-rose-900/40 shadow-lg shadow-rose-900/5' 
                            : isApproved 
                              ? 'bg-emerald-950/15 border-emerald-900/30' 
                              : (isDarkMode ? 'bg-[#131c2e] border-slate-800/40' : 'bg-white border-slate-200')
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">{task.desc}</span>
                            <h4 className={`font-black text-sm mt-0.5 ${isDarkMode ? 'text-slate-100' : 'text-slate-850'}`}>{task.task}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider ${
                            isHold ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : isApproved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {task.qaStatus}
                          </span>
                        </div>

                        {/* Checklist completion status meter */}
                        <div className="flex items-center gap-3">
                          <div className="flex-grow">
                            <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                              <span>PROGRESS:</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${task.progress}%` }}></div>
                            </div>
                          </div>
                          
                          <div className="shrink-0 text-right">
                            <span className="text-[10px] font-black text-slate-400 block">DURATION</span>
                            <span className="text-xs font-black text-slate-200">{task.adjustedDuration} DAYS</span>
                          </div>
                        </div>

                        {/* Shift crew visual summary badge */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/40 text-[10px]">
                          <span className="text-slate-500 font-extrabold flex items-center gap-1"><Users size={12}/> CREW ({task.totalManpower}):</span>
                          {WORKER_ROLES.filter(r => (task[r.key] || 0) > 0).map(r => (
                            <span key={r.key} className="bg-slate-800/80 border border-slate-700/80 px-2 py-0.5 rounded-md font-bold text-slate-300">
                              {r.icon} {r.label}: {task[r.key]}
                            </span>
                          ))}
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); triggerTaskRemove(task.id); }}
                          className="absolute right-3 top-3 text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        >
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. DUAL-SPLIT GANTT TIMELINE ENGINE (Shown on large screen width desktop or focused Gantt tab) */}
              {(!isMobileViewport || mobileDisplayTab === 'gantt' || mobileDisplayTab === 'qa') && (
                <div className={`hidden lg:flex border rounded-2xl overflow-hidden min-h-[450px] shadow-lg transition-colors ${isDarkMode ? 'bg-[#131c2e]/10 border-slate-800/60' : 'bg-white border-slate-200'}`}>
                  
                  {/* Left Spreadsheet Task Spec Sheet Column */}
                  <div className={`w-[45%] flex flex-col shrink-0 z-10 border-r relative transition-colors ${isDarkMode ? 'bg-[#131c2e]/90 border-slate-800/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200'}`}>
                    
                    {/* Header Columns */}
                    <div className={`h-[48px] p-2 font-black text-[9px] flex items-center uppercase tracking-widest sticky top-0 z-20 border-b transition-colors ${isDarkMode ? 'bg-slate-950/80 border-slate-800/60 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                      <span className="w-10 text-center">Ref</span>
                      <span className="flex-grow px-3">Phase / Target Specification</span>
                      <span className="w-12 text-center">Days</span>
                      <span className="w-16 text-center">Progress</span>
                      <span className="w-8 print:hidden"></span>
                    </div>

                    {/* Task spreadsheet list rows */}
                    <div className="flex-grow">
                      {filteredTasks.map((task, index) => {
                        const isHold = task.qaStatus === 'HOLD';
                        const isApproved = task.qaStatus === 'APPROVED';
                        
                        return (
                          <div 
                            key={task.id} 
                            className={`h-[54px] flex items-center text-[10px] group transition-all border-b ${
                              isHold 
                                ? 'bg-[#1f1618] border-rose-950/50' 
                                : isApproved 
                                  ? 'bg-[#121b18] border-emerald-950/50'
                                  : (isDarkMode ? `${index % 2 === 0 ? 'bg-[#131c2e]/40' : 'bg-[#131c2e]/20'} border-slate-800/40` : 'bg-white border-slate-105')
                            }`}
                          >
                            <div className="w-10 h-full text-center flex items-center justify-center relative shrink-0">
                              <GripVertical size={11} className="text-slate-600 absolute left-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity print:hidden" />
                              <input value={task.ref} onChange={(e) => updateTask(task.id, 'ref', e.target.value)} className="font-extrabold text-slate-500 text-center w-full bg-transparent outline-none focus:text-blue-500" />
                            </div>
                            
                            <div className="flex-grow h-full flex flex-col justify-center px-3 border-l border-slate-800/40 min-w-0">
                              <div className="flex items-center gap-2">
                                <input value={task.desc} onChange={(e) => updateTask(task.id, 'desc', e.target.value)} className="font-black text-[8.5px] text-blue-500 uppercase tracking-widest bg-transparent outline-none w-24 mb-0.5 shrink-0" />
                                <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider shrink-0 ${
                                  isHold ? 'bg-rose-500/10 text-rose-400' : isApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                                }`}>
                                  {task.qaStatus}
                                </span>
                              </div>
                              <input value={task.task} onChange={(e) => updateTask(task.id, 'task', e.target.value)} className={`font-bold text-[12px] bg-transparent outline-none rounded-md w-full truncate leading-tight transition-all p-0.5 -ml-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-850'}`} />
                            </div>
                            
                            <div className="w-12 h-full border-l border-slate-800/40 flex items-center justify-center p-1.5 shrink-0">
                              <input 
                                type="number" min="1" value={task.duration} 
                                onChange={(e) => updateTask(task.id, 'duration', parseInt(e.target.value) || 1)} 
                                className={`w-full text-center border rounded-lg py-1 text-xs font-black outline-none transition-all ${
                                  isDarkMode ? 'bg-slate-950 border-slate-800/60 text-slate-200 focus:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`} 
                              />
                            </div>

                            {/* Progress tracking bars */}
                            <div className="w-16 h-full border-l border-slate-800/40 flex flex-col items-center justify-center px-2 shrink-0">
                              <div className="flex items-center gap-0.5 w-full justify-between mb-1.5 font-bold">
                                <input 
                                  type="number" min="0" max="100" value={task.progress || 0} 
                                  onChange={(e) => updateTask(task.id, 'progress', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} 
                                  className={`w-8 text-left bg-transparent rounded text-[11px] font-black outline-none ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`} 
                                />
                                <span className="text-[9px] text-slate-500">%</span>
                              </div>
                              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{width: `${task.progress || 0}%`}}></div>
                              </div>
                            </div>
                            
                            <div className="w-8 h-full flex items-center justify-center shrink-0 border-l border-slate-800/40 print:hidden">
                              <button onClick={() => triggerTaskRemove(task.id)} className="text-slate-500 hover:text-rose-500 transition-colors p-1" title="Delete Task"><Trash2 size={13} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom control panel footer */}
                    <div className="h-[80px] p-4 flex flex-col justify-center border-t border-slate-800/40 sticky bottom-0 z-20 print:hidden">
                       <button onClick={addTask} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all px-4 py-2.5 rounded-xl border border-dashed w-full justify-center ${
                         isDarkMode ? 'bg-slate-950/60 text-blue-400 hover:text-blue-300 border-blue-900/40' : 'bg-blue-50 text-blue-600 border-blue-200'
                       }`}>
                         <Plus size={13} /> Add New Task Row
                       </button>
                    </div>
                  </div>

                  {/* Right Column Layout: Custom Sliding Gantt Calendar scale */}
                  <div id="gantt-scroll-area" className="flex-1 flex flex-col bg-[#0b0f19]/40 relative overflow-x-auto print:overflow-visible">
                    
                    {/* Calendar Scale headers */}
                    <div className={`h-[48px] flex min-w-max sticky top-0 z-20 border-b transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
                      {headerDays.map(day => {
                        const dateStr = generateDateHeaderStr(projectStartDate, day);
                        const isWeekendDay = new Date(projectStartDate).getTime() + day * 86400000;
                        const isSatSun = new Date(isWeekendDay).getDay() === 0 || new Date(isWeekendDay).getDay() === 6;
                        return (
                          <div key={day} className={`w-[44px] h-full flex-shrink-0 text-center border-r flex flex-col justify-center transition-colors ${
                            isDarkMode 
                              ? `border-slate-800/40 ${isSatSun ? 'bg-slate-900/10' : ''}` 
                              : `border-slate-200/50 ${isSatSun ? 'bg-slate-100/60' : ''}`
                          }`}>
                            <span className={`text-[10px] font-black leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>{dateStr.split(' ')[0]}</span>
                            <span className="text-[8px] font-bold text-slate-500 leading-tight uppercase">{dateStr.split(' ')[1]}</span>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Dynamic Grid Background mapping calendar widths */}
                    <div className={`flex-grow min-w-max relative transition-all duration-200 ${
                      isDarkMode 
                        ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iMTAwJSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48bGluZSB4MT0iNDQiIHkxPSIwIiB4Mj0iNDQiIHkyPSIxMDAlIiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')]" 
                        : "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iMTAwJSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48bGluZSB4MT0iNDQiIHkxPSIwIiB4Mj0iNDQiIHkyPSIxMDAlIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')]"
                    }`}>
                       {filteredTasks.map((task) => {
                          const isHold = task.qaStatus === 'HOLD';
                          const isApproved = task.qaStatus === 'APPROVED';
                          
                          return (
                            <div key={task.id} className={`h-[54px] border-b relative flex items-center transition-colors ${isDarkMode ? 'border-slate-800/40' : 'border-slate-100'}`}>
                               <div 
                                 onClick={() => setActiveTaskModal(task.id)}
                                 className={`absolute h-[28px] rounded-lg shadow-lg transition-all flex items-center justify-between overflow-hidden text-[10px] font-bold border cursor-pointer hover:scale-[1.02] hover:ring-2 hover:ring-blue-500/50 print:hover:ring-0
                                   ${isHold 
                                     ? 'bg-rose-950/40 text-rose-300 border-rose-500/40' 
                                     : isApproved 
                                       ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40' 
                                       : 'bg-blue-950/40 text-blue-300 border-blue-500/30'}`}
                                 style={{ left: `${(task.startDays) * 44 + 2}px`, width: `${(task.adjustedDuration * 44) - 4}px` }}
                               >
                                 <div className={`absolute top-0 left-0 h-full ${isHold ? 'bg-rose-500/20' : isApproved ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`} style={{ width: `${task.progress || 0}%` }} />
                                 <div className="absolute inset-0 flex justify-between items-center px-2 z-10 pointer-events-none">
                                   <span className="font-extrabold text-[10px]">{task.adjustedDuration}d</span>
                                   <div className="flex gap-1.5 items-center">
                                     <span className="flex items-center gap-0.5 text-[8px] bg-slate-900/60 border border-slate-800/40 px-1 py-0.5 rounded shadow-sm pointer-events-auto text-slate-300">
                                       <UserPlus size={9}/> Crew
                                     </span>
                                     {task.totalManpower > 0 && <span className="hidden md:flex items-center gap-1 text-[9px] bg-slate-900/60 px-1.5 py-0.5 rounded text-slate-400"><Users size={9}/> {task.totalManpower}</span>}
                                   </div>
                                 </div>
                               </div>
                            </div>
                          )
                       })}
                    </div>
                    
                    {/* Daily Manpower Load Chart Histogram */}
                    <div className={`h-[80px] border-t flex min-w-max items-end relative sticky bottom-0 z-20 transition-colors ${isDarkMode ? 'bg-[#0f172a] border-slate-800/40' : 'bg-white border-slate-300'}`}>
                      <div className={`absolute left-3 top-3 text-[8.5px] font-black uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 rounded shadow-md border ${
                        isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-800/40' : 'bg-white/95 text-slate-500 border-slate-105'
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
                          <div key={`mp-${day}`} className={`w-[44px] h-full flex-shrink-0 border-r flex flex-col justify-end items-center pb-2 relative group ${isDarkMode ? 'border-slate-800/40' : 'border-slate-100'}`}>
                            <div className={`w-6 rounded-t transition-all flex items-end justify-center ${dayManpower > 12 ? 'bg-rose-500/40 group-hover:bg-rose-500/60' : (isDarkMode ? 'bg-[#3b82f6]/20 group-hover:bg-[#3b82f6]/40' : 'bg-indigo-100 group-hover:bg-indigo-300')}`} style={{ height: `${heightPercentage * 0.6}%`, minHeight: dayManpower > 0 ? '4px' : '0' }} ></div>
                            <span className={`text-[10px] font-black mt-1 ${dayManpower > 12 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>{dayManpower > 0 ? dayManpower : '-'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* Visual summaries of metrics */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-bold print:hidden">
                 <span className="flex items-center gap-1.5"><Info size={13}/> Secure local-sync storage initialized. Weather buffer factors verified.</span>
                 <span>Expected Citicore Turn-On Phase: <strong className="text-blue-500 text-sm ml-1">{totalDays} Days</strong></span>
              </div>
            </div>
          </div>
      </div>

      {/* DETAILED DIALOG MODAL (Integrated checklist, QA Hold point clearances, and Quick Presets) */}
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
                  <h3 className="text-lg font-black flex items-center gap-2"><ClipboardCheck size={20} className="text-blue-500" /> Site Field Inspector Card</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1"><span className="text-blue-400 bg-blue-500/10 border border-blue-500/10 px-2 py-0.5 rounded mr-2">{currentTaskEditing.ref}</span> {currentTaskEditing.task}</p>
                </div>
                <button onClick={() => setActiveTaskModal(null)} className={`p-2 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-750 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-400'}`}><X size={16} /></button>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-6">
                
                {/* 1. PROGRESS ADJUSTER WITH NON-TECH PRESETS */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Site Work Progress</h4>
                  
                  {/* Slider Control */}
                  <div className="flex items-center gap-4 mb-4">
                    <input 
                      type="range" min="0" max="100" step="10" 
                      value={currentTaskEditing.progress || 0}
                      onChange={(e) => updateTask(currentTaskEditing.id, 'progress', parseInt(e.target.value))}
                      className="flex-grow accent-blue-500 cursor-pointer"
                    />
                    <span className="font-mono font-black text-sm text-blue-400 w-12 text-right">{currentTaskEditing.progress || 0}%</span>
                  </div>

                  {/* Tactile Fast-Action Presets (Eliminates typing on mobile!) */}
                  <div className="grid grid-cols-3 gap-2">
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
                            // Finish checklist if finished is tapped
                            const list = { ...(currentTaskEditing.checklist || {}) };
                            Object.keys(list).forEach(k => list[k] = true);
                            updateTask(currentTaskEditing.id, 'checklist', list);
                            updateTask(currentTaskEditing.id, 'qaStatus', 'APPROVED');
                          }
                          showToast(`Progress set to ${preset.label} (${preset.value}%)`);
                        }}
                        className={`py-2 px-1 rounded-xl text-center text-[10px] font-black uppercase tracking-wider border transition-all ${
                          currentTaskEditing.progress === preset.value
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                            : (isDarkMode ? 'bg-[#131c2e] border-slate-800/40 text-slate-400 hover:text-slate-350' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100')
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. QA STATUS CARDS FOR THE SITE LEADS */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">QA/QC Hold Point Level</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { status: 'PENDING', label: "Active Site Work", color: "border-blue-500/20 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10" },
                      { status: 'HOLD', label: "🔴 QA Block / Hold", color: "border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10" },
                      { status: 'APPROVED', label: "🟢 Done / Cleared", color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10" }
                    ].map((item) => {
                      const isSelected = currentTaskEditing.qaStatus === item.status;
                      return (
                        <button
                          key={item.status}
                          onClick={() => {
                            updateTask(currentTaskEditing.id, 'qaStatus', item.status);
                            showToast(`Status updated to ${item.status}`);
                          }}
                          className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-center items-center gap-1 ${
                            isSelected 
                              ? (item.status === 'HOLD' ? 'border-rose-500 bg-rose-500/15 text-rose-300 shadow-md shadow-rose-950/10' : item.status === 'APPROVED' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-md shadow-emerald-950/10' : 'border-blue-500 bg-blue-500/15 text-blue-300 shadow-md shadow-blue-950/10')
                              : (isDarkMode ? 'bg-[#131c2e] border-slate-800/40 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                          }`}
                        >
                          <span className="font-black text-[10px] uppercase tracking-wider">{item.status}</span>
                          <span className="text-[8px] opacity-80">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* INSPECTOR SIGN-OFF CHECKLIST (Essential for QA validation) */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-800/40' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5"><ListTodo size={14} className="text-blue-500"/> Engineering Sign-Off Steps</h4>
                  
                  {Object.keys(currentTaskEditing.checklist || {}).length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No checklist parameters set for this task class.</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(currentTaskEditing.checklist).map(([name, completed]) => (
                        <label 
                          key={name}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            completed 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' 
                              : (isDarkMode ? 'bg-[#131c2e] border-slate-800/40 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700')
                          }`}
                        >
                          <span className="font-bold">{name}</span>
                          <input 
                            type="checkbox" 
                            checked={completed} 
                            onChange={() => toggleChecklistItem(currentTaskEditing.id, name)}
                            className="rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 h-4 w-4 shrink-0 bg-slate-950"
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Add checks custom builder input */}
                  <div className="mt-4 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add custom inspector checks (e.g. slump check)" 
                      id="new-check-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addChecklistItem(currentTaskEditing.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className={`flex-grow px-3 py-2 rounded-xl text-xs font-semibold border outline-none ${
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
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* CREW MANNING ASSIGNMENTS */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Labor Crew Requirements</h4>
                  <div className="flex flex-wrap gap-3">
                    {WORKER_ROLES.map(r => {
                      const count = parseInt(currentTaskEditing[r.key]) || 0;
                      return (
                        <div key={r.key} className={`flex items-center gap-3 border rounded-2xl p-2.5 transition-colors ${count > 0 ? r.bg : (isDarkMode ? 'bg-[#0b0f19] border-slate-800/40 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400')}`}>
                          <span className="text-base pl-1">{r.icon} <span className="text-[10px] font-black uppercase ml-1">{r.label}</span></span>
                          <div className={`flex items-center rounded-xl border text-slate-800 overflow-hidden shadow-md ${isDarkMode ? 'bg-[#131c2e] border-slate-800/40' : 'bg-white border-slate-200'}`}>
                            <button onClick={() => adjustWorkerCount(currentTaskEditing.id, r.key, -1)} className={`px-2.5 py-1 transition ${isDarkMode ? 'hover:bg-slate-850 text-slate-300' : 'hover:bg-slate-100'}`}><Minus size={12}/></button>
                            <span className={`text-xs font-black w-5 text-center ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{count}</span>
                            <button onClick={() => adjustWorkerCount(currentTaskEditing.id, r.key, 1)} className={`px-2.5 py-1 transition ${isDarkMode ? 'hover:bg-slate-850 text-slate-300' : 'hover:bg-slate-100'}`}><Plus size={12}/></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* NAMES LOG BOOK */}
                <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-slate-800/40' : 'border-slate-105'}`}>
                  {WORKER_ROLES.filter(r => (currentTaskEditing[r.key] || 0) > 0).map(r => {
                    const inputs = [];
                    for(let i=0; i<parseInt(currentTaskEditing[r.key]); i++) {
                      inputs.push(
                        <input 
                          key={i} type="text" value={currentTaskEditing.assigned?.[r.key]?.[i] || ''}
                          onChange={(e) => assignWorkerName(currentTaskEditing.id, r.key, i, e.target.value)}
                          placeholder={`Enter name for ${r.fullName} #${i+1}...`}
                          className={`px-3 py-2.5 border rounded-xl text-xs font-semibold w-full focus:ring-2 focus:ring-blue-500/45 outline-none ${
                            isDarkMode ? 'bg-[#0b0f19] border-slate-800/40 text-slate-200 focus:bg-slate-900' : 'bg-slate-50 border-slate-250 text-slate-850'
                          }`}
                        />
                      );
                    }
                    return (
                      <div key={r.key} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.fullName} Name Log</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{inputs}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'bg-slate-950/60 border-slate-800/40' : 'bg-slate-50'}`}>
                <button onClick={() => setActiveTaskModal(null)} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg border border-blue-500">Close inspector</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CUSTOM BRANDING SETTINGS PANEL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className={`rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#131c2e] text-slate-100' : 'bg-white text-slate-850'}`}>
            <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-800/40' : 'bg-slate-50'}`}>
              <span className="font-extrabold text-sm flex items-center gap-2"><Settings size={18}/> Console Brand Config</span>
              <button onClick={() => setIsSettingsOpen(false)} className={`p-1.5 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-850 border-slate-800/40 text-slate-400' : 'bg-white text-slate-400'}`}><X size={14} /></button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-wider">Citicore Logo Image File</label>
                <label className={`cursor-pointer border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all ${isDarkMode ? 'bg-[#0b0f19]/45 border-slate-800/40 hover:bg-slate-850' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                  {logos.left ? <img src={logos.left} className="h-10 object-contain" alt="Left" /> : <UploadCloud size={24} className="text-blue-500"/>}
                  <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Select Image</span>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('left', e)} className="hidden" />
                </label>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-wider">MBV Logo Image File</label>
                <label className={`cursor-pointer border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all ${isDarkMode ? 'bg-[#0b0f19]/45 border-slate-800/40 hover:bg-slate-850' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                  {logos.right ? <img src={logos.right} className="h-10 object-contain" alt="Right" /> : <UploadCloud size={24} className="text-blue-500"/>}
                  <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Select Image</span>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('right', e)} className="hidden" />
                </label>
              </div>
            </div>
            
            <div className={`p-4 border-t flex justify-end ${isDarkMode ? 'bg-[#0b0f19]/40 border-slate-800/40' : 'bg-slate-50'}`}>
              <button onClick={() => setIsSettingsOpen(false)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl">Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}