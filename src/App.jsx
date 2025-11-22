import React, { useState, useEffect } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateEmail,
  sendPasswordResetEmail, 
  signInAnonymously 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  getDoc,
  orderBy,
  serverTimestamp,
  getDocs 
} from 'firebase/firestore';
import { 
  Wifi, 
  CreditCard, 
  User, 
  LogOut, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Smartphone,
  Activity,
  Search,
  Menu,
  X,
  Plus,
  Settings,
  Trash2,
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  Megaphone,
  MessageSquare,
  FileText,
  Send,
  ArrowRight,
  Gauge,
  Download, 
  Upload,
  UserPlus,
  UserCog,
  Globe, 
  Check,
  MessageCircle,
  Wrench, 
  ClipboardList, 
  UserCheck, 
  CheckCircle2, 
  Hammer,
  Hourglass,
  HelpCircle,
  Bell,
  Hash,
  UserX,
  PhilippinePeso,
  Clock,
  HardHat,
  PlayCircle,
  History,
  MapPin,
  CheckSquare 
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyDMPhjrmo-TnAoVoIBedOimkaUswrLZNp8",
  authDomain: "swiftnet-isp.firebaseapp.com",
  projectId: "swiftnet-isp",
  storageBucket: "swiftnet-isp.firebasestorage.app",
  messagingSenderId: "811380345374",
  appId: "1:811380345374:web:cf70cc43c6037280867c0f",
  measurementId: "G-7S6DBEDDMP"
};

// Initialize Default App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'swiftnet-production';

// --- Constants ---
const COLLECTION_NAME = 'isp_users_v1'; 
const PLANS_COLLECTION = 'isp_plans_v1';
const ANNOUNCEMENTS_COLLECTION = 'isp_announcements_v1';
const PAYMENTS_COLLECTION = 'isp_payments_v1'; 
const TICKETS_COLLECTION = 'isp_tickets_v1';
const REPAIRS_COLLECTION = 'isp_repairs_v1'; 
const NOTIFICATIONS_COLLECTION = 'isp_notifications_v1';
const ADMIN_EMAIL = 'admin@swiftnet.com'; 

// --- Odoo Configuration ---
const ODOO_CONFIG = {
  url: "https://swiftnetisp1.odoo.com", 
  db: "swiftnetisp1",             
  username: "howardkingsleyramos5@gmail.com",      
  password: "Howard020405@"  
};

// --- Helper Functions ---
const sendSystemEmail = async (to, subject, htmlContent) => {
  console.log(`%c[SIMULATED EMAIL] To: ${to}\nSubject: ${subject}`, 'color: blue');
  return true; 
};

// --- Helper Components ---

const RepairStatusCard = ({ repair, isSubscriber, onConfirm, technicians, onAssign, isTechnician, onTechUpdate, isAdmin, onForceComplete }) => {
  const steps = [
    { label: 'Submission', icon: <Check size={16} /> },
    { label: 'Evaluation', icon: <ClipboardList size={16} /> },
    { label: 'Processing', icon: <RefreshCw size={16} /> },
    { label: 'Customer Confirmation', icon: <UserCheck size={16} /> },
    { label: 'Completed', icon: <CheckCircle2 size={16} /> }
  ];

  const currentStepIndex = repair.stepIndex || 0;
  const isCompleted = repair.status === 'Completed';
  
  const getActionLabel = () => {
     if (currentStepIndex === 0) return { text: "Start Evaluation", icon: <ClipboardList size={16} /> };
     if (currentStepIndex === 1) return { text: "Start Processing", icon: <PlayCircle size={16} /> };
     if (currentStepIndex === 2) return { text: "Mark for Confirmation", icon: <CheckCircle2 size={16} /> };
     return { text: "Update Status", icon: <RefreshCw size={16} /> };
  };

  const actionLabel = getActionLabel();

  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-slate-200'} p-6 mb-6 animate-in fade-in slide-in-from-bottom-4`}>
      <div className="flex justify-between items-start mb-4">
         <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isCompleted ? 'text-green-600' : 'text-red-600'}`}>
              {isCompleted ? 'Completed Repair' : 'Ongoing'}
            </h4>
            <div className="flex items-center gap-3">
               <div className={`p-3 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-slate-100'}`}>
                  <Wifi className={`${isCompleted ? 'text-green-600' : 'text-slate-600'}`} size={24} />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-800">Service Repair - Internet</h3>
                  <p className="text-sm text-slate-500 font-mono">#{repair.requestId}</p>
                  {!isSubscriber && repair.assignedTechName && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit mt-1">
                          <HardHat size={10}/> Tech: {repair.assignedTechName}
                      </span>
                  )}
               </div>
            </div>
         </div>
         {isCompleted && repair.completedDate && (
             <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Completed On</p>
                <p className="text-sm font-bold text-slate-700">{new Date(repair.completedDate).toLocaleDateString()}</p>
             </div>
         )}
      </div>

      {(!isSubscriber) && (
         <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                     <p className="text-xs font-bold text-slate-400 uppercase">Customer</p>
                     <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <User size={14}/> {repair.username}
                     </p>
                 </div>
                 <div>
                     <p className="text-xs font-bold text-slate-400 uppercase">Service Address</p>
                     <p className="text-sm text-slate-700 flex items-center gap-1">
                        <MapPin size={14} className="text-red-500"/> {repair.address || "No address provided"}
                     </p>
                 </div>
             </div>
             <div className="mt-3 pt-3 border-t border-slate-200">
                 <p className="text-xs font-bold text-slate-400 uppercase">Reported Issue</p>
                 <p className="text-sm text-slate-700 italic">"{repair.notes}"</p>
             </div>
         </div>
      )}

      {!isCompleted && (
        <>
          {isSubscriber && (
             <p className="text-sm text-slate-600 mb-4 border-b border-slate-100 pb-4">
                 Repairs are usually completed within 24 hours.
             </p>
          )}

          {/* Stepper UI */}
          <div className="w-full overflow-x-auto pb-4">
            <div className="relative flex justify-between items-center min-w-[600px] px-2"> 
               <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
               <div 
                  className="absolute top-4 left-0 h-1 bg-red-600 -z-0 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
               ></div>
               {steps.map((step, index) => {
                  const isStepCompleted = index <= currentStepIndex;
                  return (
                     <div key={index} className="flex flex-col items-center gap-2 relative group">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                           isStepCompleted 
                              ? 'bg-red-600 border-red-600 text-white' 
                              : 'bg-white border-slate-200 text-slate-300'
                        }`}>
                           {isStepCompleted ? <Check size={16} /> : step.icon} 
                        </div>
                        <span className={`text-[10px] font-bold text-center w-24 absolute -bottom-8 transition-colors ${
                           isStepCompleted ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                           {step.label}
                        </span>
                     </div>
                  )
               })}
            </div>
          </div>
          
          <div className="mt-10 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
             <div className="flex gap-3">
                <div className="text-slate-400 mt-0.5"><Megaphone size={18} /></div>
                <div className="text-sm text-slate-600 w-full">
                   <p className="font-bold text-slate-700 mb-1">Status Update</p>
                   {repair.technicianNote || "Waiting for initial evaluation."}
                   
                   {!isSubscriber && !isTechnician && technicians && (
                       <div className="mt-4 border-t border-slate-200 pt-3">
                           <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Assign Technician</label>
                           <select 
                              className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                              value={repair.assignedTechId || ''}
                              onChange={(e) => onAssign(repair.id, e.target.value)}
                           >
                               <option value="">-- Select Technician --</option>
                               {technicians.map(t => (
                                   <option key={t.id} value={t.uid}>{t.username}</option>
                               ))}
                           </select>
                       </div>
                   )}
                </div>
             </div>

             {(isTechnician || isAdmin) && currentStepIndex < 3 && ( 
                 <div className="mt-2 flex justify-end border-t border-slate-200 pt-3 gap-2">
                    {isAdmin && (
                        <button 
                            onClick={() => onForceComplete(repair.id)}
                            className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"
                        >
                            <CheckSquare size={16} /> Force Complete
                        </button>
                    )}
                    <button 
                        onClick={() => onTechUpdate(repair.id, currentStepIndex)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"
                    >
                        {actionLabel.icon} {actionLabel.text}
                    </button>
                 </div>
             )}
             
             {isAdmin && currentStepIndex === 3 && (
                 <div className="mt-2 flex justify-end border-t border-slate-200 pt-3">
                      <span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">Waiting for Customer Confirmation</span>
                      <button 
                            onClick={() => onForceComplete(repair.id)}
                            className="ml-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg font-bold text-xs shadow-sm flex items-center gap-1 transition-colors"
                        >
                            Override
                        </button>
                 </div>
             )}

             {isSubscriber && currentStepIndex === 3 && (
                 <div className="mt-2 flex justify-end border-t border-slate-200 pt-3">
                     <div className="flex flex-col items-end gap-2">
                        <p className="text-xs text-slate-500">Technician marked this as resolved. Please confirm.</p>
                        <button 
                            onClick={() => onConfirm(repair.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"
                        >
                            <CheckCircle2 size={16} /> Confirm Resolution
                        </button>
                     </div>
                 </div>
             )}
          </div>
        </>
      )}
      
      {isCompleted && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-green-100 flex items-center gap-3">
              <CheckCircle2 className="text-green-600" size={20} />
              <p className="text-sm text-green-800">This issue has been resolved and closed.</p>
          </div>
      )}
    </div>
  );
};

const SpeedTest = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 h-full min-h-[500px] flex flex-col items-center justify-center text-center animate-in fade-in duration-500 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-100 to-white opacity-50 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        <div className="mb-8"><h2 className="text-3xl font-bold text-slate-800 mb-2">Test Your Connection</h2><p className="text-slate-500">Launch the secure speed test to measure your internet performance.</p></div>
        <button onClick={() => window.open('https://www.speedtest.net/', 'Ookla Speedtest', 'width=800,height=600')} className="group relative flex items-center justify-center w-40 h-40 rounded-full bg-transparent border-4 border-blue-100 hover:border-blue-200 transition-all duration-500 focus:outline-none"><div className="absolute inset-0 m-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-200 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center"><span className="text-4xl font-black text-white tracking-widest group-hover:tracking-[0.2em] transition-all">GO</span></div></button>
      </div>
    </div>
  );
};

const Layout = ({ children, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 font-sans text-slate-800 flex flex-col">
      <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2"><div className="bg-white/10 p-2 rounded-lg"><Wifi className="h-6 w-6 text-blue-200" /></div><span className="font-bold text-xl tracking-tight text-white">SwiftNet<span className="text-blue-300">ISP</span></span></div>
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-1.5 bg-white/10 rounded-full text-sm border border-white/10 backdrop-blur-md">
                   {user.role === 'admin' ? <Shield size={14} className="text-yellow-300" /> : 
                    user.role === 'technician' ? <HardHat size={14} className="text-orange-300" /> : 
                    <User size={14} className="text-blue-200" />}
                  <span className="font-medium tracking-wide">{user.displayName || user.email}</span>
                </div>
                <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 text-blue-100 hover:text-white" title="Logout"><LogOut size={20} /></button>
              </div>
            )}
            {user && <div className="md:hidden"><button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">{isMenuOpen ? <X /> : <Menu />}</button></div>}
          </div>
        </div>
        {isMenuOpen && user && <div className="md:hidden bg-indigo-900 px-4 py-4 space-y-2 border-t border-white/10"><button onClick={onLogout} className="flex items-center space-x-3 w-full px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><LogOut size={18} /><span>Sign Out</span></button></div>}
      </nav>
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [name, setName] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
         const newUid = userCredential.user.uid;
         await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), {
            uid: newUid,
            username: name || email.split('@')[0],
            email: email,
            role: 'subscriber',
            status: 'applicant', 
            accountNumber: 'PENDING',
            plan: null, 
            balance: 0,
            address: '', 
            dueDate: new Date().toISOString()
         });
      } else {
         await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
     e.preventDefault();
     if (!recoveryEmail) return;
     setRecoveryLoading(true);
     try {
        const usersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME);
        const q = query(usersRef, where('email', '==', recoveryEmail));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) { alert("This email is not registered in our system."); setRecoveryLoading(false); return; }
        await sendPasswordResetEmail(auth, recoveryEmail);
        alert("Success! A password reset link has been sent to your email.");
        setShowForgot(false);
        setRecoveryEmail('');
     } catch(e) { console.error(e); alert("Error: " + e.message); }
     setRecoveryLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-white/20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
           <div className="bg-white/20 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm shadow-inner"><Wifi className="h-8 w-8 text-white" /></div>
           <h2 className="text-2xl font-bold text-white mb-1">Welcome to SwiftNet</h2>
           <p className="text-blue-100 text-sm font-light">{isSignUp ? 'Create your account' : 'Secure Subscriber Access'}</p>
        </div>
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (<div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label><input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" /></div>)}
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label><input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></div>
            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Password</label><div className="relative"><input type={showPassword ? "text" : "password"} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            {error && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100"><AlertCircle size={16} />{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70">{loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}</button>
          </form>
          <div className="mt-4 text-center flex flex-col gap-2">{!isSignUp && (<button onClick={() => setShowForgot(true)} className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">Forgot Password?</button>)}<button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-sm text-slate-500 hover:text-blue-600 underline">{isSignUp ? 'Already have an account? Sign In' : 'No account? Create one'}</button></div>
        </div>
      </div>
      {showForgot && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200"><div className="bg-slate-800 p-5 flex justify-between items-center"><h3 className="text-white font-bold flex items-center gap-2"><HelpCircle size={18} /> Account Recovery</h3><button onClick={() => setShowForgot(false)} className="text-white/80 hover:text-white"><X size={24} /></button></div><div className="p-6"><p className="text-slate-600 text-sm mb-4">Enter your registered email address.</p><form onSubmit={handleForgotPassword}><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label><input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none mb-4" placeholder="name@example.com" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} /><button type="submit" disabled={recoveryLoading} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">{recoveryLoading ? 'Checking...' : 'Submit Request'}</button></form></div></div></div>)}
    </div>
  );
};

// 3. Subscriber Dashboard
const SubscriberDashboard = ({ userData, onPay, announcements, notifications, tickets, repairs, onConfirmRepair }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [showQR, setShowQR] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [ticketLoading, setTicketLoading] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [repairNote, setRepairNote] = useState('');
  const [availablePlans, setAvailablePlans] = useState([]);
  const [manageEmail, setManageEmail] = useState('');
  const [managePass, setManagePass] = useState('');
  const [updatingCreds, setUpdatingCreds] = useState(false);
  const [followUpText, setFollowUpText] = useState('');
  const [followingUpTo, setFollowingUpTo] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailablePlans(fetchedPlans);
    });
    return () => unsubscribe();
  }, []);

  if (!userData) return <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500"><div className="animate-spin mb-4"><RefreshCw /></div><p>Loading your account details...</p></div>;

  const isOverdue = userData.status === 'overdue' || userData.status === 'disconnected';

  const allAlerts = [
    ...(announcements || []).map(a => ({ ...a, isPublic: true })),
    ...(notifications || []).map(n => ({ ...n, isPublic: false }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (userData.status === 'applicant' || userData.accountNumber === 'PENDING') {
     const handleSelectPlan = async (plan) => {
        if(confirm(`Do you want to apply for the ${plan.name}?`)) {
           try {
              const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString(); 
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userData.id), { plan: plan.name });
              
              await sendSystemEmail(userData.email, 'Plan Application', `Application #${ticketId} for ${plan.name} received.`);

              await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { 
                ticketId,
                userId: userData.uid, 
                username: userData.username, 
                subject: 'New Subscription Application', 
                message: `Applicant ${userData.username} (${userData.email}) has applied for the ${plan.name} plan. Please approve and assign an account number.`, 
                status: 'open', 
                adminReply: '', 
                isApplication: true, 
                targetUserId: userData.uid, 
                targetPlan: plan.name, 
                date: new Date().toISOString() 
              });
              alert(`Application submitted! Ticket #${ticketId}.`);
           } catch(e) { console.error(e); alert("Error submitting application"); }
        }
     };
     return (
        <div className="w-full py-12 animate-in fade-in">
           <div className="text-center mb-12"><h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to SwiftNet!</h1><p className="text-slate-500">To get started, please select an internet plan below.</p></div>
           {userData.plan ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl max-w-xl mx-auto shadow-sm"><div className="flex items-center gap-4"><Hourglass size={32} className="text-yellow-600" /><div><h3 className="text-lg font-bold text-yellow-800">Application Pending</h3><p className="text-yellow-700">You have applied for the <strong>{userData.plan}</strong>. An administrator will review your request.</p></div></div></div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{availablePlans.map(plan => (<div key={plan.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-100 overflow-hidden flex flex-col"><div className="p-6 bg-gradient-to-br from-slate-50 to-white flex-grow"><h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3><div className="flex items-center gap-2 mb-4"><Zap size={18} className="text-yellow-500" /><span className="text-sm text-slate-500">High Speed Internet</span></div><ul className="space-y-2 mb-6"><li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Unlimited Data</li><li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Fiber Optic</li></ul></div><div className="p-4 bg-slate-50 border-t border-slate-100"><button onClick={() => handleSelectPlan(plan)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">Apply Now <ArrowRight size={16} /></button></div></div>))}{availablePlans.length === 0 && <p className="col-span-full text-center text-slate-400">No plans configured by admin yet.</p>}</div>
           )}
           <div className="mt-12 text-center"><button onClick={() => signOut(getAuth(app))} className="text-slate-400 hover:text-slate-600 text-sm underline">Sign Out</button></div>
        </div>
     );
  }

  // ... (Dashboard handlers) ...
  const handlePaymentSubmit = async (e) => { e.preventDefault(); setSubmitting(true); await onPay(userData.id, refNumber, userData.username); setSubmitting(false); setShowQR(false); setRefNumber(''); };
  const handleCreateTicket = async (e) => { 
      if(e) e.preventDefault(); 
      if (!newTicket.subject || !newTicket.message) return; 
      setTicketLoading(true); 
      try { 
          const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString(); 
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { 
              ticketId,
              userId: userData.uid, 
              username: userData.username, 
              subject: newTicket.subject, 
              message: newTicket.message, 
              status: 'open', 
              adminReply: '', 
              date: new Date().toISOString() 
          }); 
          setNewTicket({ subject: '', message: '' }); 
          alert(`Ticket #${ticketId} submitted successfully!`); 
          setActiveTab('support'); 
      } catch (error) { console.error("Error creating ticket", error); alert("Failed to submit request."); } 
      setTicketLoading(false); 
  };
  const handleFollowUpTicket = async (ticketId, originalMessage) => { if(!followUpText) return; try { const docRef = doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticketId); const timestamp = new Date().toLocaleString(); const newMessage = `${originalMessage}\n\n--- Follow-up by You (${timestamp}) ---\n${followUpText}`; await updateDoc(docRef, { message: newMessage, status: 'open', date: new Date().toISOString() }); setFollowingUpTo(null); setFollowUpText(''); alert("Follow-up sent successfully!"); } catch(e) { console.error(e); alert("Failed to send follow-up"); } };
  const handleRequestRepair = async (e) => { e.preventDefault(); if(!repairNote) return; try { const randomId = Math.floor(Math.random() * 10000000000).toString().padStart(11, '0'); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), { requestId: randomId, userId: userData.uid, username: userData.username, address: userData.address || "No address provided", type: 'Service Repair - Internet', notes: repairNote, status: 'Submission', stepIndex: 0, technicianNote: 'Waiting for initial evaluation.', dateFiled: new Date().toISOString() }); setRepairNote(''); setShowRepairModal(false); alert("Repair request filed successfully!"); } catch(e) { console.error(e); alert("Failed to request repair."); } };
  const handleApplyPlan = (planName) => { if(confirm(`Apply for ${planName}?`)) { const msg = `Requesting plan change.\n\nCurrent: ${userData.plan}\nNew: ${planName}`; const submitPlanTicket = async () => { setTicketLoading(true); try { const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { ticketId, userId: userData.uid, username: userData.username, subject: 'Plan Change Request', message: msg, status: 'open', adminReply: '', date: new Date().toISOString() }); alert(`Application submitted! Ticket #${ticketId}.`); setActiveTab('support'); } catch(e) { alert("Failed."); } setTicketLoading(false); }; submitPlanTicket(); } };
  const handleUpdatePassword = async (e) => { e.preventDefault(); if (managePass.length < 6) return alert("Min 6 chars."); setUpdatingCreds(true); try { await updatePassword(auth.currentUser, managePass); setManagePass(''); alert("Password updated!"); } catch (error) { if (error.code === 'auth/requires-recent-login') alert("Please re-login."); else alert("Error: " + error.message); } setUpdatingCreds(false); };
  const handleUpdateEmail = async (e) => { e.preventDefault(); if (!manageEmail) return; setUpdatingCreds(true); try { await updateEmail(auth.currentUser, manageEmail); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userData.id), { email: manageEmail }); setManageEmail(''); alert("Email updated!"); } catch (error) { if (error.code === 'auth/requires-recent-login') alert("Please re-login."); else alert("Error: " + error.message); } setUpdatingCreds(false); };

  const getIcon = (type) => { switch(type) { case 'warning': return <AlertCircle size={18} />; case 'success': return <CheckCircle size={18} />; default: return <Megaphone size={18} />; } };
  const getBgColor = (type) => { switch(type) { case 'warning': return 'bg-orange-50 text-orange-600'; case 'success': return 'bg-green-50 text-green-600'; default: return 'bg-blue-50 text-blue-600'; } };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit mx-auto mb-6 overflow-x-auto max-w-full">
        {['overview', 'repairs', 'plans', 'speedtest', 'support', 'settings'].map(tab => (
           <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
              {tab === 'speedtest' ? <><Gauge size={16}/> Speed Test</> : tab === 'repairs' ? <><Wrench size={16}/> Repairs</> : tab === 'plans' ? <><Globe size={16}/> Plans</> : tab === 'settings' ? <><UserCog size={16}/> Settings</> : tab}
           </button>
        ))}
      </div>

      {activeTab === 'speedtest' && <SpeedTest />}

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
              <div className={`p-4 rounded-2xl ${userData.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}><Activity size={28} /></div>
              <div><p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Service Status</p><p className={`text-xl font-bold capitalize ${userData.status === 'active' ? 'text-green-700' : 'text-red-700'}`}>{userData.status}</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-600"><Zap size={28} /></div>
              <div><p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Current Plan</p><p className="text-xl font-bold text-slate-800">{userData.plan}</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600"><CreditCard size={28} /></div>
              <div><p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Balance</p><p className="text-xl font-bold text-slate-800">₱{userData.balance?.toFixed(2)}</p></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-fit">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Billing Overview</h3>
                {userData.balance > 0 && <span className="text-[10px] uppercase font-bold bg-red-100 text-red-600 px-3 py-1 rounded-full">Payment Due</span>}
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-500">Account No.</span><span className="font-mono font-medium text-slate-700">{userData.accountNumber}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-500">Due Date</span><span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>{new Date(userData.dueDate).toLocaleDateString()}</span></div>
                <div className="flex justify-between items-center pt-2"><span className="text-slate-800 font-bold text-lg">Total Due</span><span className="text-blue-700 font-bold text-3xl">₱{userData.balance?.toFixed(2)}</span></div>
                {userData.balance > 0 ? (
                  <button onClick={() => setShowQR(true)} className="w-full mt-4 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 transition-all"><Smartphone size={20} /><span>Pay with QR Code</span></button>
                ) : <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center text-green-700 space-x-2"><CheckCircle size={20} /><span className="font-medium">No payment due. You are all set!</span></div>}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit">
              <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-slate-800">System Notifications</h3><button onClick={() => setActiveTab('support')} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">Report Issue <ArrowRight size={14} /></button></div>
              <div className="space-y-4">
                {userData.status === 'disconnected' && (<div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl"><div className="flex items-start"><AlertCircle className="text-red-500 mt-0.5 mr-3" size={20} /><div><h4 className="font-bold text-red-700">Service Disconnected</h4><p className="text-sm text-red-600 mt-1">Your internet service is suspended.</p></div></div></div>)}
                {/* Mapping Combined Alerts */}
                {allAlerts && allAlerts.length > 0 ? allAlerts.map((ann) => (
                  <div key={ann.id} className={`flex items-start p-4 rounded-xl border ${ann.isPublic ? 'bg-slate-50 border-transparent' : 'bg-blue-50 border-blue-100'}`}>
                    <div className={`p-2.5 rounded-full mr-4 flex-shrink-0 ${getBgColor(ann.type)}`}>{getIcon(ann.type)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                         <p className="font-bold text-sm text-slate-700">{ann.title}</p>
                         {!ann.isPublic && <span className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-bold uppercase">Private</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{ann.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(ann.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) : <div className="flex items-center justify-center p-4 bg-slate-50 rounded-xl text-slate-400 text-sm">No new announcements.</div>}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'repairs' && <div className="space-y-6"><div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-slate-800">Repair Requests</h2><p className="text-sm text-slate-500">Track status.</p></div><button onClick={() => setShowRepairModal(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-700 shadow-lg flex items-center gap-2"><Hammer size={18} /> Request Repair</button></div><div className="space-y-4">{repairs && repairs.length > 0 ? repairs.map(repair => <RepairStatusCard key={repair.id} repair={repair} isSubscriber={true} onConfirm={onConfirmRepair} />) : <div className="text-center py-16 bg-white rounded-2xl border border-slate-200"><Wrench size={48} className="mx-auto text-slate-300 mb-3" /><p className="text-slate-500">No active repair requests.</p></div>}</div></div>}
      {/* Other tabs (plans, support, settings) remain same */}
      {activeTab === 'plans' && (<div className="space-y-6"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-800">Available Internet Plans</h2><span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">Current: {userData.plan}</span></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{availablePlans.map((plan) => (<div key={plan.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 overflow-hidden flex flex-col"><div className="p-6 bg-gradient-to-br from-slate-50 to-white flex-grow"><h3 className="text-lg font-bold text-slate-800 mb-2">{plan.name}</h3><div className="flex items-center gap-2 mb-4"><Zap size={18} className="text-yellow-500" /><span className="text-sm text-slate-500">High Speed Internet</span></div><ul className="space-y-2 mb-6"><li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Unlimited Data</li></ul></div><div className="p-4 bg-slate-50 border-t border-slate-100"><button onClick={() => handleApplyPlan(plan.name)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">Request Change <ArrowRight size={16} /></button></div></div>))}</div></div>)}
      {activeTab === 'support' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1 h-fit"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MessageSquare size={20} className="text-blue-600"/> Create New Ticket</h3><form onSubmit={handleCreateTicket} className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label><select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white" value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}><option value="">Select...</option><option value="No Internet">No Internet</option><option value="Billing">Billing</option><option value="Other">Other</option></select></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label><textarea required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none h-32 resize-none" value={newTicket.message} onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}></textarea></div><button type="submit" disabled={ticketLoading} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700">{ticketLoading ? 'Submitting...' : 'Submit Ticket'}</button></form></div><div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 h-fit"><h3 className="font-bold text-slate-800 mb-4">My Ticket History</h3><div className="space-y-4 max-h-[600px] overflow-y-auto">{tickets && tickets.length > 0 ? tickets.map(ticket => (<div key={ticket.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50"><div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-800">#{ticket.ticketId || '---'} - {ticket.subject}</h4><span className="text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 px-2 py-1 rounded">{ticket.status}</span></div><p className="text-sm text-slate-600 mb-3">{ticket.message}</p>{ticket.adminReply && <div className="bg-white border-l-4 border-blue-500 p-3 rounded-r-lg mt-3"><p className="text-xs font-bold text-blue-600 mb-1">Admin Response:</p><p className="text-sm text-slate-700">{ticket.adminReply}</p></div>}<div className="mt-3 pt-2 border-t border-slate-100">{followingUpTo === ticket.id ? (<div className="mt-2"><textarea className="w-full border p-2 text-sm" rows="2" value={followUpText} onChange={(e) => setFollowUpText(e.target.value)}></textarea><div className="flex gap-2 justify-end"><button onClick={() => setFollowingUpTo(null)} className="text-xs font-bold px-3">Cancel</button><button onClick={() => handleFollowUpTicket(ticket.id, ticket.message)} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">Send</button></div></div>) : (<button onClick={() => setFollowingUpTo(ticket.id)} className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-1"><MessageCircle size={14} /> Add Note</button>)}</div></div>)) : <p className="text-center text-slate-400">No tickets found.</p>}</div></div></div>)}
      {activeTab === 'settings' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock size={20} className="text-blue-600"/> Change Password</h3><form onSubmit={handleUpdatePassword} className="space-y-4"><input type="password" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={managePass} onChange={(e) => setManagePass(e.target.value)} placeholder="New password" /><button type="submit" disabled={updatingCreds} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">{updatingCreds ? 'Updating...' : 'Update'}</button></form></div><div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Mail size={20} className="text-blue-600"/> Update Email</h3><form onSubmit={handleUpdateEmail} className="space-y-4"><input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={manageEmail} onChange={(e) => setManageEmail(e.target.value)} placeholder="new@email.com" /><button type="submit" disabled={updatingCreds} className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900">{updatingCreds ? 'Updating...' : 'Update'}</button></form></div></div>)}

      {showQR && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4"><div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"><div className="bg-blue-700 p-5 flex justify-between items-center"><h3 className="text-white font-bold flex items-center space-x-2"><CreditCard size={20} /><span>Scan to Pay</span></h3><button onClick={() => setShowQR(false)} className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full"><X size={20} /></button></div><div className="p-8 flex flex-col items-center text-center"><p className="text-slate-600 text-sm mb-6">Scan the QR code with your banking app to pay <span className="font-bold text-slate-900 block text-2xl mt-2">₱{userData.balance.toFixed(2)}</span></p><div className="bg-white p-4 border-2 border-dashed border-blue-200 rounded-2xl shadow-sm mb-8"><img src="/qr-code.png" alt="Payment QR" className="w-48 h-48 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200?text=QR+Image+Missing"; }} /></div>
      <div className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 mb-4">Payment posting will reflect once the admin verifies your payment. Your reference number provided should match on the payment they received.</div>
      <div className="w-full text-left"><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reference Number</label><form onSubmit={handlePaymentSubmit} className="flex gap-3"><input type="text" required placeholder="e.g. Ref-123456" className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={refNumber} onChange={(e) => setRefNumber(e.target.value)} /><button type="submit" disabled={submitting} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 shadow-md shadow-green-200">{submitting ? '...' : 'Verify'}</button></form></div></div></div></div>)}
      {showRepairModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"><div className="bg-red-600 p-5 flex justify-between items-center"><h3 className="text-white font-bold flex items-center gap-2"><Hammer size={20} /> Request Service Repair</h3><button onClick={() => setShowRepairModal(false)} className="text-white/80 hover:text-white"><X size={24} /></button></div><div className="p-6"><p className="text-slate-600 text-sm mb-4">Please describe the issue.</p><textarea className="w-full border border-slate-300 rounded-lg p-3 h-32" value={repairNote} onChange={(e) => setRepairNote(e.target.value)}></textarea><div className="mt-4 flex justify-end gap-2"><button onClick={() => setShowRepairModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button><button onClick={handleRequestRepair} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Submit</button></div></div></div></div>)}
    </div>
  );
};

// 5. New Technician Dashboard
const TechnicianDashboard = ({ repairs, onTechUpdate }) => {
    const activeTechRepairs = (repairs || []).filter(r => r.status === 'Evaluation' || r.status === 'Processing');
    
    // CHANGE: Show completed history for technicians too
    // This fetches ALL tickets assigned to this tech from 'repairs' prop which now contains everything due to App.jsx update
    const historyTechRepairs = (repairs || []).filter(r => r.status === 'Completed');

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200 border-l-4 border-l-orange-500">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <HardHat className="text-orange-500" size={32} /> Technician Portal
                </h1>
                <p className="text-slate-500 mt-1">Active repairs assigned to you.</p>
            </div>

            <div className="space-y-4">
               {activeTechRepairs.length > 0 ? (
                   activeTechRepairs.map(repair => (
                       <RepairStatusCard 
                          key={repair.id} 
                          repair={repair} 
                          isSubscriber={false} 
                          isTechnician={true}
                          onTechUpdate={onTechUpdate}
                       />
                   ))
               ) : (
                   <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                       <CheckCircle2 size={48} className="mx-auto text-green-300 mb-3" />
                       <p className="text-slate-500">All active repairs completed!</p>
                   </div>
               )}
            </div>
            
            {/* NEW: History Section */}
            {historyTechRepairs.length > 0 && (
                <div className="pt-8 mt-8 border-t border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Clock size={18}/> My Completed Jobs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {historyTechRepairs.map(repair => (
                            <RepairStatusCard key={repair.id} repair={repair} isSubscriber={false} isTechnician={true} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// 6. Main App Logic
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [mySubscriberData, setMySubscriberData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [notifications, setNotifications] = useState([]); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, currentUser.uid);
        const docSnap = await getDoc(docRef);
        let firestoreData = {};
        
        if (docSnap.exists()) {
          firestoreData = { id: docSnap.id, ...docSnap.data() };
        } else {
          // AUTO RE-CREATE FOR DELETED USERS
          if (currentUser.email !== ADMIN_EMAIL) {
             console.log("User profile missing. Re-initializing as applicant.");
             firestoreData = {
                uid: currentUser.uid,
                username: currentUser.displayName || currentUser.email.split('@')[0],
                email: currentUser.email,
                role: 'subscriber',
                status: 'applicant', 
                accountNumber: 'PENDING', 
                plan: null,
                balance: 0,
                dueDate: new Date().toISOString()
             };
             await setDoc(docRef, firestoreData);
          }
        }

        const isAdmin = currentUser.email === ADMIN_EMAIL || firestoreData.role === 'admin';
        const isTechnician = firestoreData.role === 'technician';

        if (isAdmin) setUser({ ...currentUser, role: 'admin', ...firestoreData });
        else if (isTechnician) setUser({ ...currentUser, role: 'technician', ...firestoreData });
        else {
           setMySubscriberData(firestoreData);
           setUser({ ...currentUser, role: 'subscriber', ...firestoreData });
        }
      } else {
        setUser(null);
        setMySubscriberData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Subscriptions
  useEffect(() => {
    if (!user) return;
    
    // Admin Subs
    if (user.role === 'admin') {
       onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), s => setSubscribers(s.docs.map(d => ({id: d.id, ...d.data()}))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), orderBy('date', 'desc')), s => setPayments(s.docs.map(d => ({id: d.id, ...d.data()}))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), orderBy('dateFiled', 'desc')), s => setRepairs(s.docs.map(d => ({id: d.id, ...d.data()}))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), orderBy('date', 'desc')), s => setTickets(s.docs.map(d => ({id: d.id, ...d.data()}))));
    } 
    // Technician Subs
    else if (user.role === 'technician') {
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION),
            where('assignedTechId', '==', user.uid)
        );
        onSnapshot(q, s => {
            // CHANGE: Removed .filter() here so tech gets ALL assigned tickets
            const allAssigned = s.docs.map(d => ({id: d.id, ...d.data()}));
            setRepairs(allAssigned); 
        });
    }
    // Subscriber Subs
    else {
       onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.uid), s => setMySubscriberData({id: s.id, ...s.data()}));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), where('userId', '==', user.uid)), s => setTickets(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b)=>new Date(b.date)-new Date(a.date))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), where('userId', '==', user.uid)), s => setRepairs(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b)=>new Date(b.dateFiled)-new Date(a.dateFiled))));
       
       // NEW: Fetch Private Notifications for Subscriber
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', NOTIFICATIONS_COLLECTION), where('userId', '==', user.uid)), s => {
           setNotifications(s.docs.map(d => ({id: d.id, ...d.data()})));
       });
    }
    // Common Subs
    onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION), orderBy('date', 'desc')), s => setAnnouncements(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [user]);

  const handleLogout = async () => await signOut(auth);

  const handlePayment = async (id, refNumber) => {
    if (!refNumber) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), { userId: id, username: user.displayName || user.email, refNumber, date: new Date().toISOString(), status: 'submitted' });
      // Removed automatic balance clearing
      alert(`Payment Submitted for Verification! Ref: ${refNumber}`);
    } catch (e) { alert("Payment failed."); }
  };

  // Technician Handler: Two-step process (Evaluation -> Processing -> Confirmation)
  const handleTechUpdateStatus = async (repairId, currentStep) => {
      let nextStatus = '';
      let nextStepIndex = currentStep + 1;
      let note = '';

      if (currentStep === 1) {
          nextStatus = 'Processing';
          note = 'Technician has started repairs.';
      } else if (currentStep === 2) {
          nextStatus = 'Customer Confirmation';
          note = 'Repairs completed. Pending customer verification.';
      } else {
          return; // Should not happen via UI logic
      }

      try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId);
          await updateDoc(docRef, {
              stepIndex: nextStepIndex,
              status: nextStatus,
              technicianNote: note
          });
      } catch (e) {
          console.error(e);
          alert("Update failed.");
      }
  };

  const handleConfirmRepair = async (repairId) => {
      try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId);
          await updateDoc(docRef, { 
             stepIndex: 4, 
             status: 'Completed',
             completedDate: new Date().toISOString() // Save completion date
          });
          alert("Thank you! The repair is now marked as completed.");
      } catch(e) { console.error(e); alert("Failed to confirm."); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600">Loading SwiftNet...</div>;
  if (!user) return <Login onLogin={() => {}} />;

  return (
    <Layout user={user} onLogout={handleLogout}>
      {user.role === 'admin' ? (
        <AdminDashboard subscribers={subscribers} announcements={announcements} payments={payments} tickets={tickets} repairs={repairs} />
      ) : user.role === 'technician' ? (
        <TechnicianDashboard repairs={repairs} onTechUpdate={handleTechUpdateStatus} />
      ) : (
        <SubscriberDashboard userData={mySubscriberData || {}} onPay={handlePayment} announcements={announcements} notifications={notifications} tickets={tickets} repairs={repairs} onConfirmRepair={handleConfirmRepair} />
      )}
    </Layout>
  );
}