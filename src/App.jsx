import React, { useState, useCallback, useEffect } from 'react';
import { 
  CalendarDays, Settings, X, Plus, Trash2, 
  CheckCircle2, Share2, GripVertical, UploadCloud, 
  Users, UserPlus, Hammer, Zap, Minus, BarChart3, Info, Loader2
} from 'lucide-react';

// === CLOUD STORAGE IMPORTS ==================================================
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Initialize Firebase (Replace this config with your actual Firebase details later!)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  // Replace these with your Firebase Project Settings later so your share link works for the public
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET.appspot.com",
  messagingSenderId: "123456",
  appId: "YOUR_APP_ID"
};

const app = firebaseConfig.apiKey !== "YOUR_API_KEY" ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// ============================================================================
// VECTOR LOGOS
// ============================================================================

const CiticoreLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-10 w-auto">
    <path d="M15 10 L25 22 L15 34 L20 34 L30 22 L20 10 Z" fill="#EAB308" />
    <path d="M22 10 L32 22 L22 34 L27 34 L37 22 L27 10 Z" fill="#F1C40F" />
    <text x="50" y="24" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="15" fill="#1E3A8A">CITICORE</text>
    <text x="50" y="34" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="6.5" fill="#475569" letterSpacing="1.5">CONSTRUCTION</text>
  </svg>
);

const MbvLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 45" className="h-10 w-auto">
    <rect x="10" y="5" width="35" height="35" rx="6" fill="#1E3A8A" />
    <path d="M27 10 L19 23 L26 23 L23 33 L32 19 L25 19 Z" fill="#FBBF24" />
    <text x="55" y="24" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="14" fill="#1E3A8A">MBV ELECTRIC</text>
    <text x="55" y="34" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="7" fill="#4F46E5" letterSpacing="1.5">POWER SYSTEM</text>
  </svg>
);

// ============================================================================
// WORKER ROLES & INITIAL DATA
// ============================================================================

const WORKER_ROLES = [
  { key: 'pm', label: 'PM', fullName: 'Project Manager', bg: 'bg-blue-100 border-blue-200 text-blue-700', icon: '👔' },
  { key: 'se', label: 'SE', fullName: 'Site Engineer', bg: 'bg-orange-100 border-orange-200 text-orange-700', icon: '📐' },
  { key: 'so', label: 'SO', fullName: 'Safety Officer', bg: 'bg-emerald-100 border-emerald-200 text-emerald-700', icon: '🛡️' },
  { key: 'st', label: 'ST', fullName: 'Steelman', bg: 'bg-slate-200 border-slate-300 text-slate-800', icon: '⛓️' },
  { key: 'cp', label: 'CP', fullName: 'Carpenter', bg: 'bg-amber-100 border-amber-200 text-amber-800', icon: '🪚' },
  { key: 'ms', label: 'MS', fullName: 'Mason', bg: 'bg-rose-100 border-rose-200 text-rose-800', icon: '🧱' },
  { key: 'hl', label: 'HL', fullName: 'Helper', bg: 'bg-yellow-100 border-yellow-300 text-yellow-900', icon: '🧹' }
];

const INITIAL_TASKS = [
  { id: 'T1', ref: '1.0', desc: 'Pre-Construction', task: 'Permit Processing & Mobilization', duration: 2, progress: 100, pm: 1, se: 1, so: 1, st: 0, cp: 0, ms: 0, hl: 2, assigned: {} },
  { id: 'T2', ref: '1.1', desc: 'Technical Survey', task: 'Geo-staking & Coordinate Review', duration: 1, progress: 100, pm: 1, se: 2, so: 1, st: 0, cp: 0, ms: 0, hl: 1, assigned: {} },
  { id: 'T3', ref: '2.0', desc: 'Civil Works', task: '1.5m Depth Manual Potholing', duration: 3, progress: 80, pm: 0, se: 1, so: 1, st: 0, cp: 0, ms: 0, hl: 4, assigned: {} },
  { id: 'T4', ref: '2.1', desc: 'Civil Works', task: 'Excavation of Footing Cavities', duration: 2, progress: 40, pm: 0, se: 1, so: 1, st: 0, cp: 1, ms: 0, hl: 4, assigned: {} },
  { id: 'T5', ref: '3.0', desc: 'Foundation', task: 'Gravel Bedding & Rebar Fabrication', duration: 3, progress: 0, pm: 0, se: 1, so: 1, st: 4, cp: 2, ms: 0, hl: 2, assigned: {} },
  { id: 'T6', ref: '3.1', desc: 'Foundation', task: 'Anchor Bolt Structural Alignment', duration: 1, progress: 0, pm: 1, se: 2, so: 1, st: 0, cp: 1, ms: 0, hl: 1, assigned: {} },
  { id: 'T7', ref: '4.0', desc: 'Concreting', task: 'Monolithic Concrete Pouring', duration: 2, progress: 0, pm: 0, se: 1, so: 1, st: 2, cp: 2, ms: 4, hl: 4, assigned: {} },
  { id: 'T8', ref: '4.1', desc: 'Concreting', task: '5-Day Continuous Wet Curing (Hold)', duration: 5, progress: 0, pm: 0, se: 0, so: 1, st: 0, cp: 0, ms: 1, hl: 1, assigned: {} },
  { id: 'T9', ref: '5.0', desc: 'Assembly', task: 'Pole Hoisting & Bracing Erection', duration: 3, progress: 0, pm: 1, se: 1, so: 1, st: 2, cp: 2, ms: 0, hl: 2, assigned: {} },
  { id: 'T10', ref: '6.0', desc: 'Commissioning', task: 'Ground Res Testing & Commissioning', duration: 2, progress: 0, pm: 1, se: 1, so: 1, st: 0, cp: 0, ms: 0, hl: 1, assigned: {} },
];

const generateDateHeaderStr = (startDateStr, dayOffset) => {
  const d = new Date(startDateStr);
  d.setDate(d.getDate() + dayOffset);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Tool to copy text cleanly bypassing iframe restrictions
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

// ============================================================================
// APP ENTRY POINT & MASTER SCHEDULER
// ============================================================================

export default function App() {
  // Cloud Auth & Loading States
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [sharedId, setSharedId] = useState(() => new URLSearchParams(window.location.search).get('id'));

  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [projectStartDate, setProjectStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [toastMessage, setToastMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Editable App Title States
  const [appTitle, setAppTitle] = useState("Project Schedule Architect");
  const [appSubtitle, setAppSubtitle] = useState("Interactive Landscape Console");

  // Modal State for Crew Assignment
  const [activeTaskModal, setActiveTaskModal] = useState(null);

  // Custom Branding State
  const [logos, setLogos] = useState({
    left: localStorage.getItem('logo_left') || '',
    right: localStorage.getItem('logo_right') || ''
  });

  // Document metadata parameters
  const [docMetadata, setDocMetadata] = useState({
    projectName: "70.5MWp PAGBILAO 1B AND 27MWp PAGBILAO 2B SOLAR POWER PLANT",
    location: "Brgy. Binahaan and Kanlurang Malicboy, Pagbilao, Quezon Province",
    docNo: "CCI-PMT-WMS-CSPAGEXP-3-CIV-00",
    revision: "01",
    date: "25-Jun-2026",
  });

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 5000);
  }, []);

  // Initialize Cloud Authentication
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Fetch Cloud Data if URL has an ID
  useEffect(() => {
    if (!user || !sharedId || !db) return;
    const loadSharedData = async () => {
      setIsLoadingCloud(true);
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', sharedId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.tasks) setTasks(data.tasks);
          if (data.docMetadata) setDocMetadata(data.docMetadata);
          if (data.projectStartDate) setProjectStartDate(data.projectStartDate);
          if (data.appTitle) setAppTitle(data.appTitle);
          if (data.appSubtitle) setAppSubtitle(data.appSubtitle);
          if (data.logos) {
            setLogos(data.logos);
            if (data.logos.left) localStorage.setItem('logo_left', data.logos.left);
            if (data.logos.right) localStorage.setItem('logo_right', data.logos.right);
          }
          showToast("Cloud project loaded successfully!");
        } else {
          showToast("Shared project link is invalid or expired.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        showToast("Error loading cloud project.");
      } finally {
        setIsLoadingCloud(false);
      }
    };
    loadSharedData();
  }, [user, sharedId, showToast]);

  const handleShare = async () => {
    if (!user || !db) {
      // Mock share if Firebase isn't configured yet
      const mockLink = `${window.location.origin}/?id=${Math.random().toString(36).substr(2, 9)}`;
      copyToClipboard(mockLink);
      showToast("Link copied! (Note: Connect Firebase config to save to cloud)");
      return;
    }
    
    setIsSaving(true);
    try {
      const saveId = sharedId || Math.random().toString(36).substr(2, 9);
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', saveId);
      
      await setDoc(docRef, {
        tasks,
        docMetadata,
        projectStartDate,
        appTitle,
        appSubtitle,
        logos,
        updatedAt: new Date().toISOString()
      });
      
      setSharedId(saveId);
      
      const url = new URL(window.location.href);
      url.searchParams.set('id', saveId);
      copyToClipboard(url.toString());
      
      showToast("Project saved to Cloud! Link copied to your clipboard.");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate share link.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (side, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setLogos(prev => ({...prev, [side]: base64}));
        localStorage.setItem(`logo_${side}`, base64);
        showToast("Logo updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Cascade start days based on sequential duration sums (Waterfall flow)
  const flowSchedule = useCallback(() => {
    let currentStartDay = 0;
    return tasks.map((task) => {
      const start = currentStartDay;
      currentStartDay += task.duration;
      // Calculate total manpower for the task
      const totalManpower = WORKER_ROLES.reduce((sum, r) => sum + (parseInt(task[r.key]) || 0), 0);
      return { 
        ...task, 
        startDays: start, 
        totalManpower,
        progress: task.progress || 0
      };
    });
  }, [tasks]);

  const activeFlowTasks = flowSchedule();
  const totalDays = activeFlowTasks.reduce((acc, curr) => acc + curr.duration, 0) || 1;
  const headerDays = Array.from({ length: totalDays + 2 }, (_, i) => i);
  
  const globalProgress = Math.round(activeFlowTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / (activeFlowTasks.length || 1));

  // Calculate dynamic maximum manpower for daily load histogram scaling
  const maxManpowerVal = Math.max(
    ...headerDays.map(day => 
      activeFlowTasks.reduce((sum, task) => {
        if (day >= task.startDays && day < task.startDays + task.duration) {
          return sum + task.totalManpower;
        }
        return sum;
      }, 0)
    ), 1
  );

  const updateTask = (id, field, value) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const adjustWorkerCount = (taskId, roleKey, increment) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const currentVal = parseInt(t[roleKey]) || 0;
        const newVal = Math.max(0, currentVal + increment);
        return { ...t, [roleKey]: newVal };
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
    const newTask = {
      id: `T${Date.now()}`,
      ref: `NEW`,
      desc: 'New Phase',
      task: 'New Task Description',
      duration: 1,
      progress: 0,
      pm: 0, se: 0, so: 0, st: 0, cp: 0, ms: 0, hl: 1,
      assigned: {}
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Cloud Load Overlay
  if (isLoadingCloud) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <h2 className="font-bold text-lg text-slate-800">Downloading Project Data...</h2>
        <p className="text-sm">Fetching live schedule from cloud servers.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      
      {/* Custom Scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; border: 2px solid #f8fafc; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .hide-scrolls::-webkit-scrollbar { display: none; }
        .hide-scrolls { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-slate-700/50 backdrop-blur-md transition-all">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-md shadow-sm shrink-0">
                <CalendarDays className="text-white" size={18} />
              </div>
              <input 
                type="text"
                value={appTitle}
                onChange={(e) => setAppTitle(e.target.value)}
                className="text-slate-900 font-extrabold text-xl leading-tight tracking-tight bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none px-1 py-0.5 -ml-1 w-[320px] transition-colors"
                placeholder="Enter App Title..."
              />
            </div>
            <input 
              type="text"
              value={appSubtitle}
              onChange={(e) => setAppSubtitle(e.target.value)}
              className="text-blue-600 text-[10px] font-bold uppercase tracking-widest bg-transparent border-b border-transparent hover:border-blue-200 focus:border-blue-500 outline-none px-1 py-0.5 ml-[34px] w-[280px] transition-colors mt-0.5"
              placeholder="Enter App Subtitle..."
            />
          </div>
        </div>

        {/* Global Action Handlers & Progress */}
        <div className="flex items-center gap-4">
          
          <div className="flex flex-col gap-1 w-48 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
              <span>Overall Progress:</span>
              <span className="text-blue-600">{globalProgress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${globalProgress}%`}}></div>
            </div>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-700 transition hover:bg-slate-50 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20">
            <label className="text-[10px] font-bold text-slate-500 mr-2 uppercase tracking-wider">Start Date:</label>
            <input 
              type="date" 
              value={projectStartDate}
              onChange={(e) => setProjectStartDate(e.target.value)}
              className="text-sm outline-none bg-transparent cursor-pointer font-bold text-blue-700 focus:ring-0"
            />
          </div>

          <div className="flex gap-2.5">
            <button onClick={addTask} className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-md shadow-blue-500/20 border border-blue-600">
              <Plus size={16}/> Add Task
            </button>
            
            <div className="h-6 w-px bg-slate-200 mx-1 self-center"></div>

            <button onClick={handleShare} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-md shadow-emerald-500/20 border border-emerald-600">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16}/>}
              Share Link
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="bg-white hover:bg-slate-50 text-slate-600 p-2 rounded-xl transition border border-slate-200 shadow-sm">
              <Settings size={18}/>
            </button>
          </div>
        </div>
      </header>

      {/* MASTER SCROLLABLE WORKSPACE */}
      <div className="flex-grow overflow-auto p-8 relative">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6 h-full min-w-max pb-12">
            
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 flex flex-col gap-6 w-full relative">
              
              {/* Corporate Header Section */}
              <div className="border-b border-slate-300 pb-5 shrink-0 px-2">
                <div className="flex justify-between items-center">
                  <div className="w-[30%] flex justify-start items-center">
                    {logos.left ? <img src={logos.left} className="h-12 object-contain" alt="Logo L" /> : <CiticoreLogo />}
                  </div>
                  <div className="w-[40%] text-center">
                    <input 
                      value={docMetadata.projectName}
                      onChange={(e) => setDocMetadata({...docMetadata, projectName: e.target.value.toUpperCase()})}
                      className="w-full text-center text-lg font-black tracking-tight text-slate-900 bg-transparent uppercase border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none transition-colors"
                      placeholder="ENTER PROJECT NAME..."
                    />
                    <input 
                      value={docMetadata.location}
                      onChange={(e) => setDocMetadata({...docMetadata, location: e.target.value})}
                      className="w-full text-center text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-widest bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none transition-colors"
                      placeholder="ENTER LOCATION DETAILS..."
                    />
                  </div>
                  <div className="w-[30%] flex justify-end items-center">
                    {logos.right ? <img src={logos.right} className="h-12 object-contain" alt="Logo R" /> : <MbvLogo />}
                  </div>
                </div>
                
                {/* Document Meta Fields */}
                <div className="grid grid-cols-4 gap-4 mt-8 text-[9px] text-slate-400 font-bold uppercase tracking-wider border-t border-slate-200 pt-4">
                  <div className="flex flex-col gap-1 border-r border-slate-200 pr-4">
                    <span>Document No:</span>
                    <input value={docMetadata.docNo} onChange={(e) => setDocMetadata({...docMetadata, docNo: e.target.value})} className="font-mono bg-transparent outline-none hover:border-b hover:border-slate-300 text-slate-700 font-semibold" />
                  </div>
                  <div className="flex flex-col gap-1 border-r border-slate-200 px-4">
                    <span>Revision:</span>
                    <input value={docMetadata.revision} onChange={(e) => setDocMetadata({...docMetadata, revision: e.target.value})} className="bg-transparent outline-none hover:border-b hover:border-slate-300 text-slate-700 font-semibold" />
                  </div>
                  <div className="flex flex-col gap-1 border-r border-slate-200 px-4">
                    <span>Effective Date:</span>
                    <input value={docMetadata.date} onChange={(e) => setDocMetadata({...docMetadata, date: e.target.value})} className="bg-transparent outline-none hover:border-b hover:border-slate-300 text-slate-700 font-semibold" />
                  </div>
                  <div className="flex flex-col gap-1 pl-4">
                    <span>Base Start Date:</span>
                    <span className="text-slate-800 font-bold text-sm">{projectStartDate}</span>
                  </div>
                </div>
              </div>

              {/* Core Split Editor Container */}
              <div className="flex border border-slate-200/80 rounded-xl overflow-hidden flex-grow min-h-[450px] bg-white shadow-sm">
                
                {/* Left Pane - Detailed Spreadsheet */}
                <div className="w-[45%] flex flex-col bg-white shrink-0 z-10 border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] relative">
                  
                  {/* Spreadsheet Header */}
                  <div className="h-[48px] bg-slate-50 border-b border-slate-200/80 p-2 font-bold text-[9px] text-slate-500 flex items-center uppercase tracking-widest sticky top-0 z-20">
                    <span className="w-10 text-center">Ref</span>
                    <span className="flex-grow px-3">Phase / Task Description</span>
                    <span className="w-12 text-center" title="Duration Days">Days</span>
                    <span className="w-16 text-center" title="Progress %">Progress</span>
                    <span className="w-8"></span>
                  </div>

                  {/* Spreadsheet Body */}
                  <div className="flex-grow">
                    {activeFlowTasks.map((task, index) => (
                      <div key={task.id} className={`h-[52px] flex items-center text-[10px] group transition-colors border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        
                        <div className="w-10 h-full text-center flex items-center justify-center relative shrink-0">
                          <GripVertical size={12} className="text-slate-300 absolute left-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                          <input 
                            value={task.ref} 
                            onChange={(e) => updateTask(task.id, 'ref', e.target.value)}
                            className="font-bold text-slate-400 text-center w-full bg-transparent outline-none focus:text-blue-600"
                          />
                        </div>
                        
                        <div className="flex-grow h-full flex flex-col justify-center px-3 border-l border-slate-100">
                          <input 
                            value={task.desc} 
                            onChange={(e) => updateTask(task.id, 'desc', e.target.value)}
                            className="font-bold text-[9px] text-blue-500 uppercase tracking-wider bg-transparent outline-none w-full mb-0.5"
                            placeholder="Phase Name"
                          />
                          <input 
                            value={task.task} 
                            onChange={(e) => updateTask(task.id, 'task', e.target.value)}
                            className="font-semibold text-slate-800 text-[12px] bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white outline-none rounded-md w-full leading-tight transition-all p-0.5 -ml-0.5"
                          />
                        </div>
                        
                        <div className="w-12 h-full border-l border-slate-100 flex items-center justify-center p-1.5 shrink-0">
                          <input 
                            type="number" min="1"
                            value={task.duration}
                            onChange={(e) => updateTask(task.id, 'duration', parseInt(e.target.value) || 1)}
                            className="w-full text-center bg-slate-50 border border-slate-200 hover:border-blue-400 focus:bg-white focus:border-blue-500 rounded-md py-1.5 text-xs font-bold text-slate-700 outline-none transition-all"
                          />
                        </div>

                        {/* Visual Progress Bar Column */}
                        <div className="w-16 h-full border-l border-slate-100 flex flex-col items-center justify-center px-2 py-1 shrink-0">
                          <div className="flex items-center gap-0.5 w-full justify-between mb-1">
                            <input 
                              type="number" min="0" max="100"
                              value={task.progress || 0}
                              onChange={(e) => updateTask(task.id, 'progress', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-8 text-left bg-transparent rounded py-0 text-[11px] font-black text-slate-700 outline-none"
                            />
                            <span className="text-[9px] font-bold text-slate-400">%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{width: `${task.progress || 0}%`}}></div>
                          </div>
                        </div>
                        
                        <div className="w-8 h-full flex items-center justify-center shrink-0 border-l border-slate-100">
                          <button onClick={() => removeTask(task.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Delete Task">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Left Pane Sticky Footer (Aligns perfectly with Histogram on the right) */}
                  <div className="h-[80px] p-4 flex flex-col justify-center border-t border-slate-300 bg-white sticky bottom-0 z-20">
                     <button onClick={addTask} className="text-[11px] font-bold text-blue-600 flex items-center gap-1.5 hover:text-blue-800 transition bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-200 border-dashed w-full justify-center">
                       <Plus size={14} /> Add New Task Row
                     </button>
                  </div>
                </div>

                {/* Right Pane - Visual Gantt Timeline */}
                <div id="gantt-scroll-area" className="flex-1 flex flex-col bg-slate-50/30 relative overflow-x-auto">
                  {/* Timeline Header Row */}
                  <div className="h-[48px] bg-slate-50 border-b border-slate-200/80 flex min-w-max sticky top-0 z-20">
                    {headerDays.map(day => {
                      const dateStr = generateDateHeaderStr(projectStartDate, day);
                      const isWeekend = new Date(projectStartDate).getTime() + day * 86400000;
                      const dayOfWeek = new Date(isWeekend).getDay();
                      const isSatSun = dayOfWeek === 0 || dayOfWeek === 6;

                      return (
                        <div key={day} className={`w-[44px] h-full flex-shrink-0 text-center border-r border-slate-200/60 flex flex-col justify-center ${isSatSun ? 'bg-slate-100/80' : ''}`}>
                          <span className="text-[10px] font-black text-slate-700 leading-tight">{dateStr.split(' ')[0]}</span>
                          <span className="text-[8px] font-bold text-slate-400 leading-tight uppercase">{dateStr.split(' ')[1]}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Gantt Bars Area */}
                  <div className="flex-grow min-w-max relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQiIGhlaWdodD0iMTAwJSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48bGluZSB4MT0iNDQiIHkxPSIwIiB4Mj0iNDQiIHkyPSIxMDAlIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')]">
                     {activeFlowTasks.map((task) => {
                        const isHoldPoint = task.task.toLowerCase().includes('hold point') || task.task.toLowerCase().includes('curing');
                        const taskProgress = task.progress || 0;
                        return (
                          <div key={task.id} className="h-[52px] border-b border-slate-200/50 relative group flex items-center">
                             <div 
                               onClick={() => setActiveTaskModal(task.id)}
                               className={`absolute h-[28px] rounded-md shadow-sm transition-all flex items-center justify-between overflow-hidden text-[10px] font-bold border cursor-pointer hover:ring-4 hover:ring-offset-1 hover:ring-blue-200
                                 ${isHoldPoint ? 'bg-amber-100 text-amber-800 border-amber-300/50' : 'bg-blue-100 text-blue-900 border-blue-300/50'}`}
                               style={{ left: `${(task.startDays) * 44 + 2}px`, width: `${(task.duration * 44) - 4}px` }}
                               title="Click to Assign Crew / Manpower"
                             >
                               {/* Dynamic Fill Indicator */}
                               <div 
                                 className={`absolute top-0 left-0 h-full transition-all ${isHoldPoint ? 'bg-amber-400' : 'bg-blue-500'}`}
                                 style={{ width: `${taskProgress}%` }}
                               />
                               {/* Overlay text */}
                               <div className="absolute inset-0 flex justify-between items-center px-2 z-10 pointer-events-none">
                                 <span className={`font-black ${taskProgress > 40 ? 'text-white' : 'text-slate-800'}`}>{task.duration}d</span>
                                 <div className="flex gap-2 items-center">
                                   <span className={`flex items-center gap-1 text-[9px] bg-white/40 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-sm pointer-events-auto ${taskProgress > 70 ? 'text-white' : 'text-slate-800'}`}>
                                     <UserPlus size={10}/> Crew
                                   </span>
                                   {task.totalManpower > 0 && (
                                     <span className={`flex items-center gap-1 text-[9px] bg-white/40 px-1.5 py-0.5 rounded shadow-sm ${taskProgress > 70 ? 'text-white' : 'text-slate-800'}`}>
                                       <Users size={10}/> {task.totalManpower}
                                     </span>
                                   )}
                                   {taskProgress > 0 && (
                                     <span className={`opacity-95 text-[9px] font-bold ${taskProgress > 70 ? 'text-white' : 'text-slate-800'}`}>{taskProgress}%</span>
                                   )}
                                 </div>
                               </div>
                             </div>
                          </div>
                        )
                     })}
                  </div>
                  
                  {/* Manpower Histogram (Bottom Chart Overlay) */}
                  <div className="h-[80px] border-t border-slate-300 flex min-w-max items-end bg-white relative sticky bottom-0 z-20">
                    <div className="absolute left-3 top-3 text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 bg-white/90 px-2 py-1 rounded shadow-sm border border-slate-100">
                      <BarChart3 size={12} className="text-blue-500" /> Daily Manpower Load
                    </div>
                    {headerDays.map(day => {
                      const dayManpower = activeFlowTasks.reduce((sum, task) => {
                        if (day >= task.startDays && day < task.startDays + task.duration) {
                          return sum + task.totalManpower;
                        }
                        return sum;
                      }, 0);
                      const heightPercentage = maxManpowerVal > 0 ? (dayManpower / maxManpowerVal) * 100 : 0;
                      
                      return (
                        <div key={`mp-${day}`} className="w-[44px] h-full flex-shrink-0 border-r border-slate-100 flex flex-col justify-end items-center pb-2 relative group">
                          <div 
                            className="w-7 bg-indigo-200 rounded-t-md transition-all flex items-end justify-center group-hover:bg-indigo-400" 
                            style={{ height: `${heightPercentage * 0.65}%`, minHeight: dayManpower > 0 ? '4px' : '0' }} 
                          ></div>
                          <span className="text-[10px] font-black text-slate-600 mt-1.5">{dayManpower > 0 ? dayManpower : '-'}</span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

              {/* Bottom Info Bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                 <span className="flex items-center gap-1"><Info size={12}/> Click on any colored Gantt bar in the timeline to assign specific worker names to that shift.</span>
                 <span>Total Estimated Duration: <strong className="text-blue-600 text-sm ml-1">{totalDays} Days</strong></span>
              </div>

            </div>
          </div>
      </div>

      {/* ===================================================================== */}
      {/* INTERACTIVE CREW ASSIGNMENT MODAL */}
      {/* ===================================================================== */}
      {activeTaskModal && (
        (() => {
          const currentTaskEditing = activeFlowTasks.find(t => t.id === activeTaskModal);
          if (!currentTaskEditing) return null;
          
          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh] transform transition-all">
                
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><UserPlus size={20}/></div>
                      Assign Shift Crew
                    </h3>
                    <button onClick={() => setActiveTaskModal(null)} className="text-slate-400 hover:text-rose-500 transition bg-white p-1.5 rounded-lg shadow-sm border border-slate-200"><X size={18} /></button>
                  </div>
                  <p className="text-sm text-slate-500 font-semibold mt-2 px-1 tracking-wide">
                    <span className="text-blue-600 mr-2 bg-blue-100 px-2 py-0.5 rounded-md">{currentTaskEditing.ref}</span> {currentTaskEditing.task}
                  </p>
                </div>
                
                <div className="p-8 overflow-y-auto flex-grow bg-white">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">1. Select Required Headcount</p>
                  
                  {/* Quick Role Counters */}
                  <div className="flex flex-wrap gap-4 mb-10">
                    {WORKER_ROLES.map(r => {
                      const count = parseInt(currentTaskEditing[r.key]) || 0;
                      return (
                        <div key={r.key} className={`flex items-center justify-between gap-4 border rounded-2xl p-2 shadow-sm ${count > 0 ? r.bg : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          <div className="flex items-center gap-2 pl-2 pr-2">
                            <span className="text-lg">{r.icon}</span>
                            <span className="text-xs font-bold uppercase">{r.label}</span>
                          </div>
                          <div className="flex items-center bg-white rounded-xl overflow-hidden border border-black/5 shadow-sm">
                            <button onClick={() => adjustWorkerCount(currentTaskEditing.id, r.key, -1)} className="px-3 py-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition"><Minus size={14}/></button>
                            <span className="text-sm font-black w-6 text-center">{count}</span>
                            <button onClick={() => adjustWorkerCount(currentTaskEditing.id, r.key, 1)} className="px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-600 text-slate-400 transition"><Plus size={14}/></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="h-px w-full bg-slate-100 mb-8"></div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">2. Assign Specific Worker Names</p>

                  {WORKER_ROLES.filter(r => (currentTaskEditing[r.key] || 0) > 0).length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center gap-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                      <div className="bg-white p-4 rounded-full shadow-sm"><Users size={28} className="text-slate-300"/></div>
                      <div>
                        <p className="text-base font-bold text-slate-600">No manpower required yet.</p>
                        <p className="text-sm text-slate-400 mt-1">Increase headcount above to assign names.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {WORKER_ROLES.filter(r => (currentTaskEditing[r.key] || 0) > 0).map(r => {
                        const requiredCount = parseInt(currentTaskEditing[r.key]);
                        const inputs = [];
                        for(let i=0; i<requiredCount; i++) {
                          inputs.push(
                            <div key={`${r.key}-${i}`} className="flex items-center gap-3 group">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${r.bg}`}>
                                <span className="text-lg">{r.icon}</span>
                              </div>
                              <input 
                                type="text"
                                value={currentTaskEditing.assigned?.[r.key]?.[i] || ''}
                                onChange={(e) => assignWorkerName(currentTaskEditing.id, r.key, i, e.target.value)}
                                placeholder={`Assign ${r.fullName}...`}
                                className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:bg-white focus:outline-none text-sm font-semibold text-slate-800 transition-all shadow-inner"
                              />
                            </div>
                          );
                        }
                        return (
                          <div key={r.key} className="space-y-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{r.fullName}s</h4>
                            <div className="grid grid-cols-2 gap-4">
                              {inputs}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button onClick={() => setActiveTaskModal(null)} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all">Done Assigning</button>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Branding Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2"><Settings className="text-blue-600" size={18}/> Custom Branding</div>
                <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-rose-500 transition bg-white p-1 rounded-md shadow-sm border border-slate-200"><X size={16} /></button>
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Left Header Logo</label>
                <label className="cursor-pointer bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition hover:bg-slate-100 shadow-inner">
                  {logos.left ? <img src={logos.left} className="h-10 object-contain" alt="Left Preview" /> : <UploadCloud className="text-blue-400" size={24}/>}
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Upload Left Logo</span>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('left', e)} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Right Header Logo</label>
                <label className="cursor-pointer bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition hover:bg-slate-100 shadow-inner">
                  {logos.right ? <img src={logos.right} className="h-10 object-contain" alt="Right Preview" /> : <UploadCloud className="text-blue-400" size={24}/>}
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Upload Right Logo</span>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('right', e)} className="hidden" />
                </label>
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsSettingsOpen(false)} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}