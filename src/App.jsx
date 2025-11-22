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
  CheckSquare,
  Briefcase,
  Phone
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

// --- Helper Functions ---
const sendSystemEmail = async (to, subject, htmlContent) => {
  console.log(`%c[SIMULATED EMAIL] To: ${to}\nSubject: ${subject}`, 'color: blue');
  return true; 
};

// --- Components ---

// 1. Application Wizard (New Form)
const ApplicationWizard = ({ plan, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    province: 'CAGAYAN',
    city: 'STA ANA',
    barangay: 'BGY MAREDE',
    subdivision: '',
    street: '',
    building: '',
    houseNo: '',
    landmark: ''
  });

  const handleNext = () => {
     if (step === 1 && (!formData.fullName || !formData.contactNumber)) {
        alert("Please fill in all personal details.");
        return;
     }
     setStep(step + 1);
  };
  
  const handleBack = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-red-600 p-6 text-white relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-1 relative z-10">New Application</h2>
            <p className="text-red-100 text-sm relative z-10">Applying for: {plan.name}</p>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-20"><X size={24}/></button>
        </div>
        <div className="px-8 pt-6 pb-2">
           <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((s) => (
                 <div key={s} className={`w-full h-2 rounded-full mr-2 ${step >= s ? 'bg-red-500' : 'bg-slate-200'}`}></div>
              ))}
           </div>
           <p className="text-xs text-slate-400 text-right">Step {step} of 3</p>
        </div>
        <div className="p-8 overflow-y-auto flex-grow">
           {step === 1 && (
             <div className="space-y-6">
                <div className="text-center mb-6"><h3 className="text-2xl font-bold text-slate-800">Personal Information</h3><p className="text-slate-500">Please provide your contact details.</p></div>
                <div className="space-y-4">
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label><div className="relative"><User className="absolute left-3 top-3 text-slate-400" size={18} /><input type="text" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. Juan Dela Cruz" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} /></div></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label><div className="relative"><Phone className="absolute left-3 top-3 text-slate-400" size={18} /><input type="tel" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. 0912 345 6789" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} /></div></div>
                </div>
             </div>
           )}
           {step === 2 && (
             <div className="space-y-6">
                <div className="text-center mb-4"><h3 className="text-xl font-bold text-slate-800">Service Address</h3><p className="text-sm text-slate-500">Where should we install your connection?</p></div>
                <div className="grid grid-cols-2 gap-4">
                   <div><label className="text-xs font-bold text-slate-500">Province</label><input className="w-full bg-slate-100 border-none rounded-lg p-3 text-sm font-bold text-slate-700" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} /></div>
                   <div><label className="text-xs font-bold text-slate-500">City</label><input className="w-full bg-slate-100 border-none rounded-lg p-3 text-sm font-bold text-slate-700" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                   <div className="col-span-2"><label className="text-xs font-bold text-slate-500">Barangay</label><input className="w-full bg-slate-100 border-none rounded-lg p-3 text-sm font-bold text-slate-700" value={formData.barangay} onChange={e => setFormData({...formData, barangay: e.target.value})} /></div>
                   <div><label className="text-xs font-bold text-slate-500">Street</label><input className="w-full border border-slate-300 rounded-lg p-3 text-sm" placeholder="Street Name" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} /></div>
                   <div><label className="text-xs font-bold text-slate-500">House No.</label><input className="w-full border border-slate-300 rounded-lg p-3 text-sm" placeholder="e.g. 123" value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} /></div>
                   <div className="col-span-2"><label className="text-xs font-bold text-slate-500">Landmark / Building</label><input className="w-full border border-slate-300 rounded-lg p-3 text-sm" placeholder="e.g. Near the Chapel" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} /></div>
                </div>
             </div>
           )}
           {step === 3 && (
             <div className="text-center space-y-6">
                <h3 className="text-2xl font-bold text-slate-800">Review Application</h3>
                <div className="bg-slate-50 p-6 rounded-xl text-left space-y-4 border border-slate-200">
                   <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-sm text-slate-500">Plan</span><span className="font-bold text-blue-600">{plan.name}</span></div>
                   <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-sm text-slate-500">Applicant</span><span className="font-bold text-slate-800">{formData.fullName}</span></div>
                   <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-sm text-slate-500">Contact</span><span className="font-bold text-slate-800">{formData.contactNumber}</span></div>
                   <div><span className="text-sm text-slate-500 block mb-1">Address</span><span className="font-bold text-slate-800 text-sm">{formData.houseNo} {formData.street}, {formData.barangay}, {formData.city}, {formData.province} {formData.landmark && `(${formData.landmark})`}</span></div>
                </div>
             </div>
           )}
        </div>
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
           {step > 1 && <button onClick={handleBack} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Back</button>}
           {step < 3 ? <button onClick={handleNext} className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">Next</button> : <button onClick={() => onSubmit(formData)} className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700">Submit Application</button>}
        </div>
      </div>
    </div>
  );
};

// 2. Repair Status Card
const RepairStatusCard = ({ repair, isSubscriber, onConfirm, technicians, onAssign, isTechnician, onTechUpdate, isAdmin, onForceComplete }) => {
  const steps = [
    { label: 'Submission', icon: <Check size={16} /> },
    { label: 'Evaluation', icon: <ClipboardList size={16} /> },
    { label: 'Processing', icon: <RefreshCw size={16} /> },
    { label: 'Confirmation', icon: <UserCheck size={16} /> },
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
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isCompleted ? 'text-green-600' : 'text-red-600'}`}>{isCompleted ? 'Completed' : 'Ongoing'}</h4>
            <div className="flex items-center gap-3">
               <div className={`p-3 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-slate-100'}`}>
                  {repair.type === 'New Installation' ? <Briefcase className={`${isCompleted ? 'text-green-600' : 'text-slate-600'}`} size={24} /> : <Wifi className={`${isCompleted ? 'text-green-600' : 'text-slate-600'}`} size={24} />}
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-800">{repair.type || 'Service Repair'}</h3>
                  <p className="text-sm text-slate-500 font-mono">#{repair.requestId}</p>
                  {!isSubscriber && repair.assignedTechName && (<span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit mt-1"><HardHat size={10}/> Tech: {repair.assignedTechName}</span>)}
               </div>
            </div>
         </div>
         {isCompleted && repair.completedDate && (<div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Completed On</p><p className="text-sm font-bold text-slate-700">{new Date(repair.completedDate).toLocaleDateString()}</p></div>)}
      </div>

      {(!isSubscriber) && (
         <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><p className="text-xs font-bold text-slate-400 uppercase">Customer</p><p className="text-sm font-bold text-slate-800 flex items-center gap-1"><User size={14}/> {repair.username}</p></div>
                 <div><p className="text-xs font-bold text-slate-400 uppercase">Service Address</p><p className="text-sm text-slate-700 flex items-center gap-1"><MapPin size={14} className="text-red-500"/> {repair.address || "No address provided"}</p></div>
             </div>
             <div className="mt-3 pt-3 border-t border-slate-200"><p className="text-xs font-bold text-slate-400 uppercase">Details</p><p className="text-sm text-slate-700 italic">"{repair.notes}"</p></div>
         </div>
      )}

      {!isCompleted && (
        <>
          {isSubscriber && (<p className="text-sm text-slate-600 mb-4 border-b border-slate-100 pb-4">Requests are usually processed within 24 hours.</p>)}
          <div className="w-full overflow-x-auto pb-4">
            <div className="relative flex justify-between items-center min-w-[600px] px-2"> 
               <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
               <div className="absolute top-4 left-0 h-1 bg-red-600 -z-0 rounded-full transition-all duration-500" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>
               {steps.map((step, index) => {
                  const isStepCompleted = index <= currentStepIndex;
                  return (<div key={index} className="flex flex-col items-center gap-2 relative group"><div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isStepCompleted ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>{isStepCompleted ? <Check size={16} /> : step.icon}</div><span className={`text-[10px] font-bold text-center w-24 absolute -bottom-8 transition-colors ${isStepCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</span></div>)
               })}
            </div>
          </div>
          <div className="mt-10 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
             <div className="flex gap-3"><div className="text-slate-400 mt-0.5"><Megaphone size={18} /></div><div className="text-sm text-slate-600 w-full"><p className="font-bold text-slate-700 mb-1">Status Update</p>{repair.technicianNote || "Waiting for initial evaluation."}{!isSubscriber && !isTechnician && technicians && (<div className="mt-4 border-t border-slate-200 pt-3"><label className="text-xs font-bold text-slate-500 uppercase block mb-1">Assign Technician</label><select className="w-full border border-slate-300 rounded px-2 py-1 text-sm" value={repair.assignedTechId || ''} onChange={(e) => onAssign(repair.id, e.target.value)}><option value="">-- Select Technician --</option>{technicians.map(t => (<option key={t.id} value={t.uid}>{t.username}</option>))}</select></div>)}</div></div>
             {(isTechnician || isAdmin) && currentStepIndex < 3 && (<div className="mt-2 flex justify-end border-t border-slate-200 pt-3 gap-2">{isAdmin && (<button onClick={() => onForceComplete(repair.id)} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"><CheckSquare size={16} /> Force Complete</button>)}<button onClick={() => onTechUpdate(repair.id, currentStepIndex)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors">{actionLabel.icon} {actionLabel.text}</button></div>)}
             {isAdmin && currentStepIndex === 3 && (<div className="mt-2 flex justify-end border-t border-slate-200 pt-3"><span className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">Waiting for Customer Confirmation</span><button onClick={() => onForceComplete(repair.id)} className="ml-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg font-bold text-xs shadow-sm flex items-center gap-1 transition-colors">Override</button></div>)}
             {isSubscriber && currentStepIndex === 3 && (<div className="mt-2 flex justify-end border-t border-slate-200 pt-3"><div className="flex flex-col items-end gap-2"><p className="text-xs text-slate-500">Technician marked this as resolved. Please confirm.</p><button onClick={() => onConfirm(repair.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"><CheckCircle2 size={16} /> Confirm Resolution</button></div></div>)}
          </div>
        </>
      )}
      
      {isCompleted && (<div className="mt-4 p-3 bg-white rounded-lg border border-green-100 flex items-center gap-3"><CheckCircle2 className="text-green-600" size={20} /><p className="text-sm text-green-800">This issue has been resolved and closed.</p></div>)}
    </div>
  );
};

// 3. Speed Test Component
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

// 4. Layout Component
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
                   {/* Badge Logic */}
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

// 5. Login Component
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

// 6. Subscriber Dashboard
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
  const [selectedPlanForApp, setSelectedPlanForApp] = useState(null); 

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
  const allAlerts = [...(announcements || []).map(a => ({ ...a, isPublic: true })), ...(notifications || []).map(n => ({ ...n, isPublic: false }))].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const activeRepairs = (repairs || []).filter(r => r.status !== 'Completed');
  const historyRepairs = (repairs || []).filter(r => r.status === 'Completed');

  // --- APPLICANT VIEW ---
  if (userData.status === 'applicant' || userData.accountNumber === 'PENDING') {
     const handleWizardSubmit = async (addressData) => {
        try {
            const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString(); 
            const fullAddress = `${addressData.street}, ${addressData.barangay}, ${addressData.city}, ${addressData.province}`;
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userData.id), { 
                plan: selectedPlanForApp.name,
                address: fullAddress,
                addressDetails: addressData,
                contactNumber: addressData.contactNumber, 
                fullName: addressData.fullName 
            });
            await sendSystemEmail(userData.email, 'Plan Application', `Application #${ticketId} for ${selectedPlanForApp.name} received.`);
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { 
              ticketId,
              userId: userData.uid, 
              username: addressData.fullName || userData.username, 
              subject: 'New Subscription Application', 
              message: `Applicant ${addressData.fullName} (${userData.email})\nContact: ${addressData.contactNumber}\nPlan: ${selectedPlanForApp.name}\nAddress: ${fullAddress}`, 
              status: 'open', 
              adminReply: '', 
              isApplication: true, 
              targetUserId: userData.uid, 
              targetPlan: selectedPlanForApp.name, 
              date: new Date().toISOString() 
            });
            setSelectedPlanForApp(null);
            alert(`Application submitted! Ticket #${ticketId}.`);
        } catch(e) { console.error(e); alert("Error submitting application"); }
     };

     return (
        <div className="w-full py-12 animate-in fade-in">
           <div className="text-center mb-12"><h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to SwiftNet!</h1><p className="text-slate-500">To get started, please select an internet plan below.</p></div>
           {userData.plan ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl max-w-xl mx-auto shadow-sm"><div className="flex items-center gap-4"><Hourglass size={32} className="text-yellow-600" /><div><h3 className="text-lg font-bold text-yellow-800">Application Pending</h3><p className="text-yellow-700">You have applied for the <strong>{userData.plan}</strong>. An administrator will review your request.</p></div></div></div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{availablePlans.map(plan => (<div key={plan.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-100 overflow-hidden flex flex-col"><div className="p-6 bg-gradient-to-br from-slate-50 to-white flex-grow"><h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3><div className="flex items-center gap-2 mb-4"><Zap size={18} className="text-yellow-500" /><span className="text-sm text-slate-500">High Speed Internet</span></div><ul className="space-y-2 mb-6"><li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Unlimited Data</li><li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Fiber Optic</li></ul></div><div className="p-4 bg-slate-50 border-t border-slate-100"><button onClick={() => setSelectedPlanForApp(plan)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">Apply Now <ArrowRight size={16} /></button></div></div>))}{availablePlans.length === 0 && <p className="col-span-full text-center text-slate-400">No plans configured by admin yet.</p>}</div>
           )}
           <div className="mt-12 text-center"><button onClick={() => signOut(getAuth(app))} className="text-slate-400 hover:text-slate-600 text-sm underline">Sign Out</button></div>
           {selectedPlanForApp && (<ApplicationWizard plan={selectedPlanForApp} onClose={() => setSelectedPlanForApp(null)} onSubmit={handleWizardSubmit} />)}
        </div>
     );
  }

  const handlePaymentSubmit = async (e) => { e.preventDefault(); setSubmitting(true); await onPay(userData.id, refNumber, userData.username); setSubmitting(false); setShowQR(false); setRefNumber(''); };
  const handleCreateTicket = async (e) => { if(e) e.preventDefault(); if (!newTicket.subject || !newTicket.message) return; setTicketLoading(true); try { const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { ticketId, userId: userData.uid, username: userData.username, subject: newTicket.subject, message: newTicket.message, status: 'open', adminReply: '', date: new Date().toISOString() }); setNewTicket({ subject: '', message: '' }); alert("Request submitted successfully!"); setActiveTab('support'); } catch (error) { console.error("Error creating ticket", error); alert("Failed to submit request."); } setTicketLoading(false); };
  const handleFollowUpTicket = async (ticketId, originalMessage) => { if(!followUpText) return; try { const docRef = doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticketId); const timestamp = new Date().toLocaleString(); const newMessage = `${originalMessage}\n\n--- Follow-up by You (${timestamp}) ---\n${followUpText}`; await updateDoc(docRef, { message: newMessage, status: 'open', date: new Date().toISOString() }); setFollowingUpTo(null); setFollowUpText(''); alert("Follow-up sent successfully!"); } catch(e) { console.error(e); alert("Failed to send follow-up"); } };
  const handleRequestRepair = async (e) => { 
      e.preventDefault(); 
      if(!repairNote) return; 
      try { 
          const randomId = Math.floor(Math.random() * 10000000000).toString().padStart(11, '0'); 
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), { 
              requestId: randomId, 
              userId: userData.uid, 
              username: userData.username, 
              address: userData.address || "No address provided", 
              type: 'Service Repair - Internet', 
              notes: repairNote, 
              status: 'Submission', 
              stepIndex: 0, 
              technicianNote: 'Waiting for initial evaluation.', 
              dateFiled: new Date().toISOString() 
          }); 
          setRepairNote(''); 
          setShowRepairModal(false); 
          alert("Repair request filed successfully!"); 
      } catch(e) { 
          console.error(e); 
          alert("Failed to request repair."); 
      } 
  };
  const handleApplyPlan = (planName) => { if(confirm(`Apply for ${planName}?`)) { const msg = `Requesting plan change.\n\nCurrent: ${userData.plan}\nNew: ${planName}`; const submitPlanTicket = async () => { setTicketLoading(true); try { const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { ticketId, userId: userData.uid, username: userData.username, subject: 'Plan Change Request', message: msg, status: 'open', adminReply: '', date: new Date().toISOString() }); alert(`Application submitted! Ticket #${ticketId}.`); setActiveTab('support'); } catch(e) { alert("Failed."); } setTicketLoading(false); }; submitPlanTicket(); } };
  const handleUpdatePassword = async (e) => { e.preventDefault(); if (managePass.length < 6) return alert("Min 6 chars."); setUpdatingCreds(true); try { await updatePassword(auth.currentUser, managePass); setManagePass(''); alert("Password updated!"); } catch (error) { if (error.code === 'auth/requires-recent-login') alert("Please re-login."); else alert("Error: " + error.message); } setUpdatingCreds(false); };
  const handleUpdateEmail = async (e) => { e.preventDefault(); if (!manageEmail) return; setUpdatingCreds(true); try { await updateEmail(auth.currentUser, manageEmail); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userData.id), { email: manageEmail }); setManageEmail(''); alert("Email updated!"); } catch (error) { if (error.code === 'auth/requires-recent-login') alert("Please re-login."); else alert("Error: " + error.message); } setUpdatingCreds(false); };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit mx-auto mb-6 overflow-x-auto max-w-full">
        {['overview', 'repairs', 'plans', 'speedtest', 'support', 'settings'].map(tab => (
           <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>{tab === 'speedtest' ? <><Gauge size={16}/> Speed Test</> : tab === 'repairs' ? <><Wrench size={16}/> Repairs</> : tab === 'plans' ? <><Globe size={16}/> Plans</> : tab === 'settings' ? <><UserCog size={16}/> Settings</> : tab}
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

      {activeTab === 'repairs' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800">Repair Requests</h2>
                  <p className="text-sm text-slate-500">Track status.</p>
               </div>
               <button onClick={() => setShowRepairModal(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-700 shadow-lg flex items-center gap-2"><Hammer size={18} /> Request Repair</button>
            </div>
            
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-500 uppercase">Active Requests</h3>
               {activeRepairs && activeRepairs.length > 0 ? activeRepairs.map(repair => (
                  <RepairStatusCard 
                     key={repair.id} 
                     repair={repair} 
                     isSubscriber={true} 
                     onConfirm={onConfirmRepair} 
                  />
               )) : <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">No active repairs.</div>}
            </div>
            
            {historyRepairs.length > 0 && (
                <div className="pt-8 mt-8 border-t border-slate-200">
                   <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Clock size={18}/> Repair History</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {historyRepairs.map(repair => (
                           <RepairStatusCard key={repair.id} repair={repair} isSubscriber={true} />
                       ))}
                   </div>
                </div>
            )}
         </div>
      )}

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

// 7. New Technician Dashboard
const TechnicianDashboard = ({ repairs, onTechUpdate }) => {
  const activeTechRepairs = (repairs || []).filter(r => r.status === 'Evaluation' || r.status === 'Processing');
  const historyTechRepairs = (repairs || []).filter(r => r.status === 'Completed');
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200 border-l-4 border-l-orange-500"><h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><HardHat className="text-orange-500" size={32} /> Technician Portal</h1><p className="text-slate-500 mt-1">Active repairs assigned to you.</p></div>
      <div className="space-y-4">{activeTechRepairs.length > 0 ? activeTechRepairs.map(repair => (<RepairStatusCard key={repair.id} repair={repair} isSubscriber={false} isTechnician={true} onTechUpdate={onTechUpdate} />)) : <div className="text-center py-20 bg-white rounded-2xl border border-slate-200"><CheckCircle2 size={48} className="mx-auto text-green-300 mb-3" /><p className="text-slate-500">All active repairs completed!</p></div>}</div>
      {historyTechRepairs.length > 0 && (<div className="pt-8 mt-8 border-t border-slate-200"><h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Clock size={18}/> My Completed Jobs</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{historyTechRepairs.map(repair => (<RepairStatusCard key={repair.id} repair={repair} isSubscriber={false} isTechnician={true} />))}</div></div>)}
    </div>
  );
};

// 8. Admin Dashboard (RESTORED AND FIXED)
const AdminDashboard = ({ subscribers, announcements, payments, tickets, repairs }) => {
  const [activeTab, setActiveTab] = useState('subscribers'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showAddTechModal, setShowAddTechModal] = useState(false); 
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  
  const [adminNewPass, setAdminNewPass] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  
  const [plans, setPlans] = useState([]);
  const [newPlanName, setNewPlanName] = useState('');
  const [technicians, setTechnicians] = useState([]); 
  const [showChangePlanModal, setShowChangePlanModal] = useState(null); // To track which user's plan is being changed

  const [newUser, setNewUser] = useState({ email: '', password: '', username: '', accountNumber: '', plan: '' });
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', username: '' });
  const [newTech, setNewTech] = useState({ email: '', password: '', username: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' });
  const [notifyData, setNotifyData] = useState({ targetId: null, targetName: '', title: '', message: '' });
  
  const [newJob, setNewJob] = useState({ targetUserId: '', type: 'New Installation', notes: '', assignedTechId: '' });

  const [newDueDate, setNewDueDate] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => { const q = query(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION)); onSnapshot(q, s => setPlans(s.docs.map(d => ({ id: d.id, ...d.data() })))); }, []);
  useEffect(() => { const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), where('role', '==', 'technician')); onSnapshot(q, s => setTechnicians(s.docs.map(d => ({ id: d.id, ...d.data() })))); }, []);

  const handleStatusChange = async (userId, newStatus) => { try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userId), { status: newStatus }); } catch (e) { console.error(e); } };
  const handleAddBill = async (userId, currentBalance) => { try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userId), { balance: currentBalance + 50, status: (currentBalance + 50) > 0 ? 'overdue' : 'active', dueDate: new Date().toISOString() }); } catch (e) { console.error(e); } };
  const handleChangePassword = async (e) => { e.preventDefault(); if (adminNewPass.length < 6) return alert("Min 6 chars"); try { await updatePassword(auth.currentUser, adminNewPass); alert("Success"); setShowPasswordModal(false); } catch (e) { alert(e.message); } };
  const handleAddSubscriber = async (e) => { e.preventDefault(); setIsCreatingUser(true); let secondaryApp = null; try { secondaryApp = initializeApp(firebaseConfig, "Secondary"); const secondaryAuth = getAuth(secondaryApp); const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password); const newUid = userCredential.user.uid; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), { uid: newUid, username: newUser.username, email: newUser.email, accountNumber: newUser.accountNumber, plan: newUser.plan || (plans[0] ? plans[0].name : 'Basic'), balance: 0, status: 'active', role: 'subscriber', dueDate: new Date().toISOString() }); await deleteApp(secondaryApp); setShowAddModal(false); alert("Success"); } catch (e) { alert(e.message); } setIsCreatingUser(false); };
  const handleAddAdmin = async (e) => { e.preventDefault(); setIsCreatingUser(true); let secondaryApp = null; try { secondaryApp = initializeApp(firebaseConfig, "SecondaryAdmin"); const secondaryAuth = getAuth(secondaryApp); const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newAdmin.email, newAdmin.password); const newUid = userCredential.user.uid; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), { uid: newUid, username: newAdmin.username, email: newAdmin.email, role: 'admin', accountNumber: 'ADMIN', plan: 'N/A', balance: 0, status: 'active', dueDate: new Date().toISOString() }); await deleteApp(secondaryApp); setShowAddAdminModal(false); alert("Admin created"); } catch (e) { alert(e.message); } setIsCreatingUser(false); };
  const handleAddTechnician = async (e) => { e.preventDefault(); setIsCreatingUser(true); let secondaryApp = null; try { secondaryApp = initializeApp(firebaseConfig, "SecondaryTech"); const secondaryAuth = getAuth(secondaryApp); const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newTech.email, newTech.password); const newUid = userCredential.user.uid; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), { uid: newUid, username: newTech.username, email: newTech.email, role: 'technician', accountNumber: 'TECH', plan: 'N/A', balance: 0, status: 'active', dueDate: new Date().toISOString() }); await deleteApp(secondaryApp); setShowAddTechModal(false); alert("Technician created!"); } catch(e) { alert(e.message); } setIsCreatingUser(false); };
  const handleAddPlan = async (e) => { e.preventDefault(); if(!newPlanName) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION), { name: newPlanName }); setNewPlanName(''); };
  const handleDeletePlan = async (id) => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION, id)); };
  const handlePostAnnouncement = async (e) => { e.preventDefault(); if(!newAnnouncement.title) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION), { ...newAnnouncement, date: new Date().toISOString() }); setShowAnnounceModal(false); };
  const handleDeleteAnnouncement = async (id) => { if(confirm("Delete?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION, id)); };
  const handleUpdateDueDate = async (e) => { e.preventDefault(); try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, showDateModal.id), { dueDate: new Date(newDueDate).toISOString() }); alert("Updated"); setShowDateModal(null); } catch(e) { alert("Failed"); } };
  const handleReplyTicket = async (ticketId) => { if(!replyText) return; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticketId), { adminReply: replyText, status: 'resolved' }); setReplyingTo(null); setReplyText(''); } catch(e) { alert("Failed"); } };
  const handleUpdateRepairStatus = async (repairId, currentStep) => { if (currentStep === 3) return alert("Waiting for customer."); const newStep = currentStep < 4 ? currentStep + 1 : 4; const statusLabels = ['Submission', 'Evaluation', 'Processing', 'Customer Confirmation', 'Completed']; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId), { stepIndex: newStep, status: statusLabels[newStep] }); } catch(e) { console.error(e); } };
  const handleForceComplete = async (repairId) => { if (!confirm("Force complete?")) return; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId), { stepIndex: 4, status: 'Completed', completedDate: new Date().toISOString() }); } catch(e) { alert("Failed"); } };
  const handleApproveApplication = async (ticket) => { const amountStr = prompt("Initial Balance:", "1500"); if (amountStr===null) return; const amount = parseFloat(amountStr); if(isNaN(amount)) return alert("Invalid"); const newAccountNo = Math.floor(Math.random()*1000000).toString(); try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, ticket.targetUserId), { status: 'active', accountNumber: newAccountNo, plan: ticket.targetPlan, balance: amount, dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString() }); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticket.id), { status: 'resolved', adminReply: `Approved! Account #${newAccountNo}. Balance ₱${amount}.` }); alert(`Approved!`); } catch(e) { alert("Failed"); } };
  const handleOpenNotify = (sub) => { setNotifyData({ targetId: sub.id, targetName: sub.username, title: '', message: '' }); setShowNotifyModal(true); };
  const handleSendNotification = async (e) => { e.preventDefault(); try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', NOTIFICATIONS_COLLECTION), { userId: notifyData.targetId, title: notifyData.title, message: notifyData.message, date: new Date().toISOString(), type: 'info', read: false }); setShowNotifyModal(false); alert("Sent!"); } catch (e) { alert("Failed."); } };
  const handleDeleteSubscriber = async (id) => { if (confirm("Delete?")) { try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, id)); alert("Deleted."); } catch (e) { alert("Failed."); } } };
  const handleVerifyPayment = async (paymentId, userId) => { if (!confirm("Verify?")) return; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION, paymentId), { status: 'verified', verifiedAt: new Date().toISOString() }); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userId), { balance: 0, status: 'active', lastPaymentDate: new Date().toISOString() }); alert("Verified!"); } catch (e) { alert("Failed."); } };
  const handleAssignTech = async (repairId, techUid) => { if(!techUid) return; const tech = technicians.find(t => t.uid === techUid); try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId), { assignedTechId: techUid, assignedTechName: tech.username, stepIndex: 1, status: 'Evaluation' }); } catch(e) { console.error(e); } };
  const handleAdminCreateJob = async (e) => { e.preventDefault(); if(!newJob.targetUserId || !newJob.notes) return alert("Details?"); const targetUser = subscribers.find(u => u.id === newJob.targetUserId); const randomId = Math.floor(Math.random() * 10000000000).toString().padStart(11, '0'); const startStep = newJob.assignedTechId ? 1 : 0; const startStatus = newJob.assignedTechId ? 'Evaluation' : 'Submission'; const assignedTechName = newJob.assignedTechId ? technicians.find(t => t.uid === newJob.assignedTechId)?.username : null; try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), { requestId: randomId, userId: targetUser.uid, username: targetUser.username, address: targetUser.address || "No address", type: newJob.type, notes: newJob.notes, status: startStatus, stepIndex: startStep, assignedTechId: newJob.assignedTechId || null, assignedTechName: assignedTechName || null, technicianNote: newJob.assignedTechId ? 'Tech assigned.' : 'Waiting.', dateFiled: new Date().toISOString() }); setShowCreateJobModal(false); alert("Created!"); } catch(e) { alert("Failed."); } };

  // NEW: Change Plan Handler
  const handleChangePlan = async (userId, newPlanName) => {
     try {
         await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userId), { plan: newPlanName });
         alert("Plan updated successfully!");
         setShowChangePlanModal(null);
     } catch(e) {
         console.error(e);
         alert("Failed to update plan.");
     }
  };

  const filteredSubscribers = subscribers.filter(sub => (sub.username?.toLowerCase().includes(searchTerm.toLowerCase()) || sub.accountNumber?.includes(searchTerm)));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit flex space-x-1 overflow-x-auto max-w-full mx-auto md:mx-0">
         {['subscribers', 'repairs', 'payments', 'tickets', 'plans', 'speedtest'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>{tab === 'speedtest' ? <><Gauge size={16} /> Speed Test</> : tab === 'repairs' ? <><Wrench size={16}/> Repairs</> : tab === 'plans' ? <><Globe size={16}/> Plans</> : tab}</button>))}
      </div>
      {activeTab === 'speedtest' && <SpeedTest />}
      {activeTab === 'subscribers' && (
        <>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-slate-800">User Management</h1><p className="text-slate-500 text-sm mt-1">Total Users: {subscribers.length}</p></div><div className="flex items-center gap-3 flex-wrap"><button onClick={() => setShowAnnounceModal(true)} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-sm"><Megaphone size={18} /> Alert</button><button onClick={() => setShowPasswordModal(true)} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-sm"><Lock size={18} /> Pass</button><button onClick={() => setShowAddTechModal(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-orange-200"><HardHat size={18} /> Add Tech</button><button onClick={() => setShowAddAdminModal(true)} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-slate-300"><UserPlus size={18} /> Add Admin</button><button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-blue-200"><Plus size={18} /> Add Subscriber</button></div></div>
           <div className="relative w-full"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} /><input type="text" placeholder="Search users..." className="pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full bg-white shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500 border-b border-slate-200"><tr><th className="px-6 py-4 font-bold">User</th><th className="px-6 py-4 font-bold">Role</th><th className="px-6 py-4 font-bold">Plan</th><th className="px-6 py-4 font-bold">Balance</th><th className="px-6 py-4 font-bold">Due Date</th><th className="px-6 py-4 font-bold">Status</th><th className="px-6 py-4 font-bold text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredSubscribers.map((sub) => (<tr key={sub.id} className="hover:bg-blue-50/30 transition-colors"><td className="px-6 py-4"><div>{sub.username}</div><div className="text-xs text-slate-500 flex flex-col"><span>#{sub.accountNumber}</span><span className="text-indigo-500">{sub.email}</span></div></td><td className="px-6 py-4">{sub.role === 'admin' ? <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 w-fit"><Shield size={10} /> Admin</span> : sub.role === 'technician' ? <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 w-fit"><HardHat size={10} /> Tech</span> : <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Subscriber</span>}</td>
           <td className="px-6 py-4 text-slate-600 font-medium flex items-center gap-2">
              {sub.plan}
              {/* Edit Plan Button */}
              {sub.role !== 'admin' && sub.role !== 'technician' && (
                <button onClick={() => setShowChangePlanModal(sub)} className="text-blue-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors" title="Change Plan">
                   <Edit size={14} />
                </button>
              )}
           </td>
           <td className="px-6 py-4 font-mono font-bold text-slate-700">₱{sub.balance?.toFixed(2) || "0.00"}</td><td className="px-6 py-4 text-slate-600 group relative"><div className="flex items-center gap-2">{new Date(sub.dueDate).toLocaleDateString()}<button onClick={() => { setShowDateModal(sub); setNewDueDate(new Date(sub.dueDate).toISOString().split('T')[0]); }} className="opacity-0 group-hover:opacity-100 text-blue-600 hover:bg-blue-100 p-1.5 rounded-md transition-all"><Calendar size={14} /></button></div></td><td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${sub.status === 'active' ? 'bg-green-100 text-green-700' : sub.status === 'disconnected' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>{sub.status}</span></td><td className="px-6 py-4 text-right space-x-2 flex justify-end items-center">{sub.role !== 'admin' && sub.role !== 'technician' && (<><button onClick={() => handleOpenNotify(sub)} className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-md transition-colors" title="Send Notification"><Bell size={16} /></button><button onClick={() => handleAddBill(sub.id, sub.balance)} className="text-blue-600 hover:text-blue-900 text-xs font-bold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">+ Bill</button>{sub.status === 'active' ? <button onClick={() => handleStatusChange(sub.id, 'disconnected')} className="text-red-600 hover:text-red-900 text-xs font-bold border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Cut</button> : <button onClick={() => handleStatusChange(sub.id, 'active')} className="text-green-600 hover:text-green-900 text-xs font-bold border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">Restore</button>}<button onClick={() => handleDeleteSubscriber(sub.id)} className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors ml-2" title="Delete User"><UserX size={16} /></button></>)}</td></tr>))}</tbody></table></div></div>
        </>
      )}
      {activeTab === 'repairs' && (<div className="space-y-6"><div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-slate-800">Repair Requests</h2><p className="text-sm text-slate-500">Track status.</p></div><div className="flex gap-2"><button onClick={() => setShowCreateJobModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2"><Briefcase size={18} /> Create Job</button><button onClick={() => setShowRepairModal(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-700 shadow-lg flex items-center gap-2"><Hammer size={18} /> Request Repair</button></div></div><div className="space-y-4">{activeRepairs && activeRepairs.length > 0 ? activeRepairs.map(repair => (<RepairStatusCard key={repair.id} repair={repair} isSubscriber={false} technicians={technicians} onAssign={handleAssignTech} isAdmin={true} onTechUpdate={handleUpdateRepairStatus} onForceComplete={handleForceComplete} />)) : <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">No active jobs.</div>}</div><div className="pt-8 border-t border-slate-200"><h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Clock size={18}/> Job History</h3>{historyRepairs && historyRepairs.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{historyRepairs.map(repair => (<RepairStatusCard key={repair.id} repair={repair} isSubscriber={false} />))}</div>) : <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-sm">No completed history.</div>}</div></div>)}
      {activeTab === 'plans' && <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><h3 className="font-bold mb-4">Manage Plans</h3><div className="space-y-2">{plans.map(p=><div key={p.id} className="flex justify-between items-center border-b pb-2"><span>{p.name}</span><button onClick={()=>handleDeletePlan(p.id)} className="text-red-500"><Trash2 size={14}/></button></div>)}</div><form className="mt-4 flex gap-2" onSubmit={handleAddPlan}><input className="border p-2 rounded text-sm" placeholder="New Plan" value={newPlanName} onChange={e=>setNewPlanName(e.target.value)}/><button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Add</button></form></div>}
      {activeTab === 'payments' && <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><h3 className="font-bold mb-4">Payments</h3><div className="space-y-2">{payments.map(p=><div key={p.id} className="flex justify-between border-b pb-2"><span>{p.username}</span><span className="font-mono text-blue-600">{p.refNumber}</span><span className="text-xs text-slate-400">{new Date(p.date).toLocaleDateString()}</span><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.status === 'verified' ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status || 'pending'}</span>{p.status !== 'verified' && (<button onClick={() => handleVerifyPayment(p.id, p.userId)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 transition-colors">Verify</button>)}</div>)}</div></div>}
      {activeTab === 'tickets' && (<div className="space-y-4"><h2 className="text-xl font-bold text-slate-800">Support Tickets & Applications</h2><div className="grid grid-cols-1 gap-4">{tickets && tickets.length > 0 ? tickets.map(ticket => (<div key={ticket.id} className={`p-5 rounded-xl shadow-sm border ${ticket.isApplication ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}><div className="flex justify-between items-start mb-3"><div><h4 className="font-bold text-lg text-slate-800">#{ticket.ticketId || '---'} - {ticket.subject} {ticket.isApplication && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full ml-2">APPLICATION</span>}</h4><p className="text-xs text-slate-500">From: <span className="font-bold text-blue-600">{ticket.username}</span> • {new Date(ticket.date).toLocaleString()}</p></div><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{ticket.status}</span></div><p className="text-slate-700 text-sm mb-4">{ticket.message}</p>{ticket.isApplication && ticket.status === 'open' && (<button onClick={() => handleApproveApplication(ticket)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg mb-3 shadow-md transition-colors">Approve & Assign Account #</button>)}{ticket.adminReply ? <div className="border-t border-slate-200 pt-3"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Your Reply</p><p className="text-sm text-blue-700 font-medium">{ticket.adminReply}</p></div> : (<div className="flex gap-2 mt-2">{replyingTo === ticket.id ? (<div className="w-full"><textarea className="w-full border border-slate-300 rounded-lg p-2 text-sm mb-2" rows="3" value={replyText} onChange={(e) => setReplyText(e.target.value)}></textarea><div className="flex gap-2 justify-end"><button onClick={() => setReplyingTo(null)} className="text-slate-500 text-sm font-bold">Cancel</button><button onClick={() => handleReplyTicket(ticket.id)} className="bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-lg">Send Reply</button></div></div>) : <button onClick={() => { setReplyingTo(ticket.id); setReplyText(''); }} className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors"><MessageSquare size={16} /> Reply</button>}</div>)}</div>)) : <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400">No tickets found.</div>}</div></div>)}
      
      {/* Modals */}
      {/* NEW: Change Plan Modal */}
      {showChangePlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">Change Plan for {showChangePlanModal.username}</h3>
                      <button onClick={() => setShowChangePlanModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  <div className="space-y-2">
                      {plans.map(p => (
                          <button 
                              key={p.id} 
                              onClick={() => handleChangePlan(showChangePlanModal.id, p.name)}
                              className={`w-full text-left p-3 rounded-lg border transition-all ${showChangePlanModal.plan === p.name ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                          >
                              {p.name}
                              {showChangePlanModal.plan === p.name && <span className="text-xs float-right bg-blue-200 px-2 rounded-full">Current</span>}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}
      
      {/* ... (Other modals) ... */}
      {showCreateJobModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Briefcase size={18} /> Create New Job</h3><button onClick={() => setShowCreateJobModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button></div><form onSubmit={handleAdminCreateJob}><div className="space-y-3"><div><label className="text-xs font-bold text-slate-500 uppercase">Select User</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={newJob.targetUserId} onChange={(e) => setNewJob({...newJob, targetUserId: e.target.value})} required><option value="">-- Select User --</option>{subscribers.filter(s => s.role !== 'admin' && s.role !== 'technician').map(u => (<option key={u.id} value={u.id}>{u.username} ({u.accountNumber})</option>))}</select></div><div><label className="text-xs font-bold text-slate-500 uppercase">Job Type</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={newJob.type} onChange={(e) => setNewJob({...newJob, type: e.target.value})}><option value="New Installation">New Installation</option><option value="Service Repair">Service Repair</option><option value="Maintenance">Maintenance</option></select></div><div><label className="text-xs font-bold text-slate-500 uppercase">Job Details / Notes</label><textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 h-24 resize-none" placeholder="Enter installation details..." value={newJob.notes} onChange={(e) => setNewJob({...newJob, notes: e.target.value})} required></textarea></div><div><label className="text-xs font-bold text-slate-500 uppercase">Assign Technician (Optional)</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={newJob.assignedTechId} onChange={(e) => setNewJob({...newJob, assignedTechId: e.target.value})}><option value="">-- Assign Later --</option>{technicians.map(t => (<option key={t.id} value={t.uid}>{t.username}</option>))}</select></div><button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700">Create Job Ticket</button></div></form></div></div>)}
      {showAddTechModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6"><div className="bg-orange-600 p-5 flex justify-between items-center -m-6 mb-6"><h3 className="text-white font-bold flex items-center gap-2"><HardHat size={18} /> Add New Technician</h3><button onClick={() => setShowAddTechModal(false)} className="text-white/80 hover:text-white"><X size={24} /></button></div><form onSubmit={handleAddTechnician} className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tech Name</label><input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={newTech.username} onChange={(e) => setNewTech({...newTech, username: e.target.value})} placeholder="Technician Name" /></div><div className="border-t border-slate-100 pt-2"></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label><input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={newTech.email} onChange={(e) => setNewTech({...newTech, email: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label><input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono" value={newTech.password} onChange={(e) => setNewTech({...newTech, password: e.target.value})} /></div><button type="submit" disabled={isCreatingUser} className="w-full py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700">{isCreatingUser ? 'Creating...' : 'Create Technician Account'}</button></form></div></div>)}
      {showAddAdminModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6"><h3 className="font-bold mb-4">Add Admin</h3><form onSubmit={handleAddAdmin} className="space-y-4"><input className="w-full border p-2 rounded" placeholder="Name" value={newAdmin.username} onChange={e=>setNewAdmin({...newAdmin, username: e.target.value})}/><input className="w-full border p-2 rounded" placeholder="Email" value={newAdmin.email} onChange={e=>setNewAdmin({...newAdmin, email: e.target.value})}/><input className="w-full border p-2 rounded" type="password" placeholder="Password" value={newAdmin.password} onChange={e=>setNewAdmin({...newAdmin, password: e.target.value})}/><div className="flex justify-end gap-2"><button onClick={()=>setShowAddAdminModal(false)} className="text-slate-500">Cancel</button><button className="bg-slate-800 text-white px-4 py-2 rounded">Create</button></div></form></div></div>)}
      {showAddModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"><h3 className="font-bold mb-4">Add Subscriber</h3><form onSubmit={handleAddSubscriber} className="space-y-4"><input className="w-full border p-2 rounded" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})}/><input className="w-full border p-2 rounded" placeholder="Account #" value={newUser.accountNumber} onChange={e=>setNewUser({...newUser, accountNumber: e.target.value})}/><input className="w-full border p-2 rounded" placeholder="Email" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})}/><input className="w-full border p-2 rounded" type="password" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})}/><div className="flex justify-end gap-2"><button onClick={()=>setShowAddModal(false)} className="text-slate-500">Cancel</button><button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button></div></form></div></div>)}
      {showAnnounceModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"><h3 className="font-bold mb-4">Post Announcement</h3><input className="w-full border p-2 rounded mb-2" placeholder="Title" value={newAnnouncement.title} onChange={e=>setNewAnnouncement({...newAnnouncement, title: e.target.value})}/><textarea className="w-full border p-2 rounded mb-2" placeholder="Message" value={newAnnouncement.message} onChange={e=>setNewAnnouncement({...newAnnouncement, message: e.target.value})}></textarea><div className="flex justify-end gap-2"><button onClick={()=>setShowAnnounceModal(false)} className="text-slate-500">Cancel</button><button onClick={handlePostAnnouncement} className="bg-blue-600 text-white px-4 py-2 rounded">Post</button></div></div></div>)}
      {showPasswordModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"><h3 className="font-bold mb-4">Change Password</h3><input className="w-full border p-2 rounded mb-4" type="password" placeholder="New Password" value={adminNewPass} onChange={e=>setAdminNewPass(e.target.value)}/><div className="flex justify-end gap-2"><button onClick={()=>setShowPasswordModal(false)} className="text-slate-500">Cancel</button><button onClick={handleChangePassword} className="bg-blue-600 text-white px-4 py-2 rounded">Update</button></div></div></div>)}
      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-700 p-5 flex justify-between items-center"><h3 className="text-white font-bold">Change Due Date</h3><button onClick={() => setShowDateModal(null)} className="text-white/80 hover:text-white"><X size={24} /></button></div>
            <form onSubmit={handleUpdateDueDate} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Due Date</label><input type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} /></div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Update Date</button>
            </form>
          </div>
        </div>
      )}
       {showNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6">
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Bell size={18} /> Notify {notifyData.targetName}</h3><button onClick={() => setShowNotifyModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button></div>
             <form onSubmit={handleSendNotification}><div className="space-y-3"><div><label className="text-xs font-bold text-slate-500 uppercase">Title</label><input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="e.g. Payment Received" value={notifyData.title} onChange={(e) => setNotifyData({...notifyData, title: e.target.value})} required /></div><div><label className="text-xs font-bold text-slate-500 uppercase">Message</label><textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 h-24 resize-none" placeholder="Write your message here..." value={notifyData.message} onChange={(e) => setNotifyData({...notifyData, message: e.target.value})} required ></textarea></div><button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700">Send Notification</button></div></form>
          </div>
        </div>
       )}
     </div>
   );
};

// 8. Main App Logic (Same as previous)
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
          if (currentUser.email !== ADMIN_EMAIL) {
             console.log("User profile missing. Re-initializing as applicant.");
             firestoreData = { uid: currentUser.uid, username: currentUser.displayName || currentUser.email.split('@')[0], email: currentUser.email, role: 'subscriber', status: 'applicant', accountNumber: 'PENDING', plan: null, balance: 0, dueDate: new Date().toISOString() };
             await setDoc(docRef, firestoreData);
          }
        }

        const isAdmin = currentUser.email === ADMIN_EMAIL || firestoreData.role === 'admin';
        const isTechnician = firestoreData.role === 'technician';

        if (isAdmin) setUser({ ...currentUser, role: 'admin', ...firestoreData });
        else if (isTechnician) setUser({ ...currentUser, role: 'technician', ...firestoreData });
        else { setMySubscriberData(firestoreData); setUser({ ...currentUser, role: 'subscriber', ...firestoreData }); }
      } else { setUser(null); setMySubscriberData(null); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
       onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), s => setSubscribers(s.docs.map(d => ({id: d.id, ...d.data()}))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), orderBy('date', 'desc')), s => setPayments(s.docs.map(d => ({id: d.id, ...d.data()}))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), orderBy('dateFiled', 'desc')), s => setRepairs(s.docs.map(d => ({id: d.id, ...d.data()}))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), orderBy('date', 'desc')), s => setTickets(s.docs.map(d => ({id: d.id, ...d.data()}))));
    } 
    else if (user.role === 'technician') {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), where('assignedTechId', '==', user.uid));
        onSnapshot(q, s => { setRepairs(s.docs.map(d => ({id: d.id, ...d.data()}))); });
    }
    else {
       onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.uid), s => setMySubscriberData({id: s.id, ...s.data()}));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), where('userId', '==', user.uid)), s => setTickets(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b)=>new Date(b.date)-new Date(a.date))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), where('userId', '==', user.uid)), s => setRepairs(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b)=>new Date(b.dateFiled)-new Date(a.dateFiled))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', NOTIFICATIONS_COLLECTION), where('userId', '==', user.uid)), s => { setNotifications(s.docs.map(d => ({id: d.id, ...d.data()}))); });
    }
    onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION), orderBy('date', 'desc')), s => setAnnouncements(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [user]);

  const handleLogout = async () => await signOut(auth);
  const handlePayment = async (id, refNumber) => { if (!refNumber) return; try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), { userId: id, username: user.displayName || user.email, refNumber, date: new Date().toISOString(), status: 'submitted' }); alert(`Payment Submitted for Verification! Ref: ${refNumber}`); } catch (e) { alert("Payment failed."); } };
  const handleTechUpdateStatus = async (repairId, currentStep) => { let nextStatus = ''; let nextStepIndex = currentStep + 1; let note = ''; if (currentStep === 1) { nextStatus = 'Processing'; note = 'Technician has started repairs.'; } else if (currentStep === 2) { nextStatus = 'Customer Confirmation'; note = 'Repairs completed. Pending customer verification.'; } else { return; } try { const docRef = doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId); await updateDoc(docRef, { stepIndex: nextStepIndex, status: nextStatus, technicianNote: note }); } catch (e) { console.error(e); alert("Update failed."); } };
  const handleConfirmRepair = async (repairId) => { try { const docRef = doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId); await updateDoc(docRef, { stepIndex: 4, status: 'Completed', completedDate: new Date().toISOString() }); alert("Thank you! The repair is now marked as completed."); } catch(e) { console.error(e); alert("Failed to confirm."); } };

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