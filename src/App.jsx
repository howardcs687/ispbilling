import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, 
  AreaChart, Area // <--- These were missing!
} from 'recharts';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Essential for map styling
import emailjs from '@emailjs/browser';
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
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
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
  limit,
  getDoc,
  orderBy,
  serverTimestamp,
  getDocs,
  increment, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { getDatabase, ref, onValue } from "firebase/database";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SignatureCanvas from 'react-signature-canvas';
import Tesseract from 'tesseract.js';
import { 
  Wifi, CreditCard, User, LogOut, Shield, CheckCircle, AlertCircle, 
  Smartphone, Activity, Search, Menu, X, Plus, Settings, Trash2, Zap, 
  Mail, Lock, Eye, EyeOff, RefreshCw, Calendar, Megaphone, MessageSquare, 
  FileText, Send, ArrowRight, Gauge, Download, Upload, UserPlus, UserCog, 
  Globe, Check, MessageCircle, Wrench, ClipboardList, UserCheck, Hammer, 
  Hourglass, HelpCircle, Bell, Hash, UserX, Clock, HardHat, PlayCircle, 
  History, MapPin, CheckSquare, Briefcase, Signal, Gift, AlertTriangle,
  DollarSign, TrendingUp, TrendingDown, Package, PlusCircle, MinusCircle,
  Music, Volume2, QrCode, ShoppingBag, ArrowUpCircle, Edit, Map, 
  Calculator, UploadCloud, Image, 
  PieChart as PieChartIcon, // <--- FIXED: Renamed to avoid conflict
  FileBarChart, 
  Siren, 
  FileWarning, 
  BookOpen, 
  ChevronRight, 
  Edit3,
  Sun, Moon,
  PenTool, FileSignature,
  ShieldCheck, FileCheck, Fingerprint,
  Wallet, ArrowRightLeft, ArrowUpRight, ArrowDownLeft,
  ToggleLeft, ToggleRight,
  Server, Cloud, Copy, Phone,
  Headphones, ArrowDownCircle, HardDrive, PhoneCall, Video, CloudRain, Info, XCircle, LifeBuoy,
  Bot,       // <--- ADDED THIS
  Loader2, Save, Tv, Film, Users, Trophy, Target, Timer, Sparkles, Rocket, Flag, ThumbsUp, TimerReset,
  Flame, Heart, Share2, MoreHorizontal, CornerDownRight, Smile, Camera, 
} from 'lucide-react';

// --- Firebase Configuration --
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyDMPhjrmo-TnAoVoIBedOimkaUswrLZNp8",
  authDomain: "swiftnet-isp.firebaseapp.com",
  databaseURL: "https://swiftnet-isp-default-rtdb.asia-southeast1.firebasedatabase.app",
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
const storage = getStorage(app);
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'swiftnet-production';

// --- Cookie Helper Functions ---
const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
};

// --- Constants ---
const COLLECTION_NAME = 'isp_users_v1'; 
const PLANS_COLLECTION = 'isp_plans_v1';
const ANNOUNCEMENTS_COLLECTION = 'isp_announcements_v1';
const PAYMENTS_COLLECTION = 'isp_payments_v1'; 
const TICKETS_COLLECTION = 'isp_tickets_v1';
const REPAIRS_COLLECTION = 'isp_repairs_v1'; 
const NOTIFICATIONS_COLLECTION = 'isp_notifications_v1';
const OUTAGES_COLLECTION = 'isp_outages_v1'; 
const INVOICES_COLLECTION = 'isp_invoices_v1';
const EXPENSES_COLLECTION = 'isp_expenses_v1';
const PRODUCTS_COLLECTION = 'isp_products_v1';
const SERVICE_AREAS_COLLECTION = 'isp_service_areas_v1';
const STATUS_COLLECTION = 'isp_status_v1';
const CONFIG_COLLECTION = 'isp_config_v1';
const SMS_QUEUE_COLLECTION = 'isp_sms_queue_v1';
const SMS_COLLECTION = 'isp_sms_logs_v1';
const DIGITAL_GOODS_COLLECTION = 'isp_digital_goods_v1';
const USER_INVENTORY_COLLECTION = 'isp_user_inventory_v1';
const ADMIN_EMAIL = 'admin@swiftnet.com'; 

// --- Helper Functions ---
// --- Email Configuration ---
// REPLACE THESE WITH YOUR ACTUAL EMAILJS KEYS
// --- Email Configuration (Master Template Version) ---
const EMAIL_CONFIG = {
  serviceID: 'service_rku0sea',       // Get from EmailJS Dashboard
  publicKey: 'gULI8936r5B6AVPx1',       // Get from Account > API Keys
  masterTemplateID: 'template_wcdg2vn' // Create just 1 template and paste ID here
};

// Central Email Function (The Master Handler)
const sendCustomEmail = async (type, data) => {
  
  // 1. Define Subjects dynamically based on the 'type'
  let dynamicSubject = "Notification from SwiftNet";
  let extraDetails = "";

  switch (type) {
      case 'welcome':
          dynamicSubject = "Welcome to the SwiftNet Family!";
          break;
      case 'otp':
          dynamicSubject = "Secure Access: Your Login Credentials";
          extraDetails = `Access Code: ${data.code}`;
          break;
      case 'order':
          dynamicSubject = "Order Confirmation";
          extraDetails = `Item: ${data.orderDetails}`;
          break;
      case 'feedback':
          dynamicSubject = "Repair Complete - We value your feedback";
          extraDetails = `Click to rate: ${data.link}`;
          break;
      case 'auto_reply':
          dynamicSubject = "We received your Ticket";
          break;
      case 'invoice':
          dynamicSubject = "New Statement of Account Available";
          extraDetails = `Amount Due: ${data.amount}`;
          break;
      case 'receipt':
          dynamicSubject = "Payment Received - Official Receipt";
          extraDetails = `Ref: ${data.refNumber} | Amount: ${data.amount}`;
          break;
      default:
          dynamicSubject = "New Notification";
  }

  // 2. Build the Params for the Master Template
  const params = {
    to_name: data.name,
    to_email: data.email,
    subject: dynamicSubject, // <--- This fills the {{subject}} in EmailJS
    message: data.message || '', 
    footer_details: extraDetails // <--- This fills the {{footer_details}}
  };

  try {
    await emailjs.send(EMAIL_CONFIG.serviceID, EMAIL_CONFIG.masterTemplateID, params, EMAIL_CONFIG.publicKey);
    console.log(`Email (${type}) sent successfully!`);
  } catch (error) {
    console.error("Email failed:", error);
  }
};

// --- COMPONENTS (Ordered bottom-up to avoid hoisting issues) ---

// --- [PROFESSIONAL FEATURE 1] TOAST NOTIFICATIONS ---
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-bold animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto ${
            toast.type === 'success' ? 'bg-emerald-600' : 
            toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={18}/> : 
           toast.type === 'error' ? <AlertCircle size={18}/> : <Info size={18}/>}
          {toast.message}
          <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-70 hover:opacity-100"><X size={14}/></button>
        </div>
      ))}
    </div>
  );
};

// --- [PROFESSIONAL FEATURE 2] SKELETON LOADER ---
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
);

// --- [PROFESSIONAL FEATURE 3] AUDIT LOGGER ---
const logAudit = async (db, appId, actor, action, target, details = '') => {
  try {
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_audit_logs'), {
      timestamp: new Date().toISOString(),
      actor: actor.username || actor.email || 'System',
      role: actor.role || 'system',
      action: action,
      target: target,
      details: details
    });
    console.log(`Audit: ${action} on ${target}`);
  } catch (e) {
    console.error("Audit Log Failed", e);
  }
};

// --- [PROFESSIONAL FEATURE 4] GUEST PAY MODAL ---
const GuestPayModal = ({ onClose, db, appId, onAddToast }) => {
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  const [refNo, setRefNo] = useState('');
  const [step, setStep] = useState(1);
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const findUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Find user by Account Number
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), where('accountNumber', '==', accountNo));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      onAddToast("Account not found. Please check the number.", "error");
      setLoading(false);
    } else {
      const user = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      setTargetUser(user);
      setStep(2);
      setLoading(false);
    }
  };

  const submitPayment = async () => {
    if(!amount || !refNo) return onAddToast("Please fill all fields", "error");
    setLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), {
        userId: targetUser.id,
        username: targetUser.username,
        refNumber: refNo,
        amount: parseFloat(amount),
        method: 'Guest Pay',
        date: new Date().toISOString(),
        status: 'pending_approval'
      });
      onAddToast("Payment Submitted! Admin will verify shortly.", "success");
      onClose();
    } catch(e) {
      onAddToast("Error submitting payment.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
            <Zap size={24}/>
          </div>
          <h3 className="font-bold text-xl text-slate-800">Quick Pay</h3>
          <p className="text-slate-500 text-xs">Pay bills for friends & family instantly.</p>
        </div>

        {step === 1 ? (
          <form onSubmit={findUser} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Account Number</label>
              <input className="w-full border p-3 rounded-xl text-center font-mono text-lg tracking-widest" placeholder="100000" value={accountNo} onChange={e=>setAccountNo(e.target.value)} required autoFocus/>
            </div>
            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Find Account'}
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-right-10">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
              <p className="text-xs text-blue-500 font-bold uppercase">Paying For</p>
              <p className="font-bold text-lg text-blue-900">{targetUser.username}</p>
              <p className="text-xs text-slate-500">Current Balance: ₱{(targetUser.balance||0).toLocaleString()}</p>
            </div>
            
            <input className="w-full border p-3 rounded-xl text-sm" type="number" placeholder="Amount Paid (₱)" value={amount} onChange={e=>setAmount(e.target.value)} />
            <input 
              className="w-full border p-3 rounded-xl text-sm" 
              placeholder="Reference No. (GCash/Maya)" 
              value={refNo} 
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setRefNo(val);
                } else {
                  alert("Please enter only a number that matches the reference number on your proof of payment.");
                }
              }} 
            />
            
            <button onClick={submitPayment} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200">
               {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Submit Payment'}
            </button>
            <button onClick={()=>setStep(1)} className="w-full text-slate-400 text-xs hover:text-slate-600">Back</button>
          </div>
        )}
      </div>
    </div>
  );
};

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = getCookie("swiftnet_cookie_consent");
    if (!consent) {
      setTimeout(() => setIsVisible(true), 2000); // 2 second delay before showing
    }
  }, []);

  const handleAccept = () => {
    setCookie("swiftnet_cookie_consent", "true", 365); // Remember for 1 year
    setIsVisible(false);
  };

  const handleDecline = () => {
    setCookie("swiftnet_cookie_consent", "false", 7); // Ask again in a week
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md text-white p-6 z-[200] border-t border-slate-700 shadow-2xl animate-in slide-in-from-bottom-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-full hidden md:block">
            <ShieldCheck size={24} className="text-white"/>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">We value your privacy</h4>
            <p className="text-slate-300 text-sm max-w-2xl">
              We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleDecline}
            className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-slate-300 hover:bg-white/10 transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

// --- [FEATURE 4] REAL SPONSORED WIFI PORTAL (MIKROTIK) ---
const HotspotPortal = ({ onLogin, db, appId }) => {
  const [step, setStep] = useState('landing'); 
  const [timeLeft, setTimeLeft] = useState(15); 
  const [adData, setAdData] = useState(null);
  
  // MikroTik Parameters State
  const [mtParams, setMtParams] = useState({
    loginUrl: '', // usually http://10.5.50.1/login
    dst: '',      // original destination
    mac: ''
  });

  // 1. Initialize: Parse URL & Fetch Ad
  useEffect(() => {
    // A. Parse MikroTik URL Parameters
    const params = new URLSearchParams(window.location.search);
    // MikroTik sends 'link-login-only' or 'link-login'
    const routerLogin = params.get('link-login-only') || params.get('link-login') || 'http://10.5.50.1/login'; 
    const dst = params.get('dst') || 'https://google.com';
    const mac = params.get('mac');

    setMtParams({ loginUrl: routerLogin, dst, mac });

    // B. Fetch REAL Ad from Database
    const fetchAd = async () => {
        try {
            // Get the first active ad from 'isp_ads_campaigns' 
            const adCollection = collection(db, 'artifacts', appId, 'public', 'data', 'isp_ads_campaigns');
            const q = query(adCollection, where('status', '==', 'active'), limit(1));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                setAdData(snapshot.docs[0].data());
            } else {
                // Fallback ONLY if no campaign is active in DB
                setAdData({
                    title: "Default Sponsor",
                    sponsor: "SwiftNet ISP",
                    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
                });
            }
        } catch (e) { console.error("Ad fetch error", e); }
    };
    fetchAd();
  }, [db, appId]);

  const startAd = () => {
    if (!adData) return;
    setStep('watching');
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeAd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeAd = async () => {
    // 1. Log Real View to Database
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_ad_views_v1'), {
            date: new Date().toISOString(),
            sponsor: adData.sponsor,
            mac: mtParams.mac || 'unknown',
            revenue: 0.50 // Hardcoded value or fetch from adData.cpm
        });
    } catch(e) { console.error("Log error", e); }

    setStep('logging_in');
    
    // 2. TRIGGER REAL MIKROTIK LOGIN
    // We submit the hidden form below automatically
    setTimeout(() => {
        const form = document.getElementById('mikrotik-login-form');
        if (form) form.submit();
    }, 1000);
  };

  if (!adData) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Portal...</div>;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      
      {/* --- HIDDEN FORM FOR REAL MIKROTIK AUTH --- */}
      {/* You must create a user in MikroTik: Name="free_ad_user", Pass="12345" */}
      <form id="mikrotik-login-form" action={mtParams.loginUrl} method="post" className="hidden">
          <input type="hidden" name="username" value="free_ad_user" />
          <input type="hidden" name="password" value="12345" />
          <input type="hidden" name="dst" value={mtParams.dst} />
      </form>

      <div className="max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="bg-red-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                <Wifi size={32} className="text-white"/>
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">SwiftNet<span className="text-red-200">Free</span></h1>
            <p className="text-white/80 text-sm">Sponsored Public WiFi</p>
        </div>

        <div className="p-8 text-center">
            
            {step === 'landing' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Get Free Internet Access</h2>
                    <p className="text-slate-500 mb-8 text-sm">
                        Watch a short video from our sponsor to unlock 30 minutes of browsing time.
                    </p>
                    
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 flex items-center gap-3 text-left">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                            <Bot size={20}/>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold">Today's Sponsor</p>
                            <p className="font-bold text-slate-800">{adData.sponsor}</p>
                        </div>
                    </div>

                    <button onClick={startAd} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2">
                        <PlayCircle size={20}/> Watch to Connect
                    </button>
                    
                    <button onClick={onLogin} className="mt-6 text-slate-400 text-xs font-bold hover:text-red-600 transition-colors">
                        Existing Member Login
                    </button>
                </div>
            )}

            {step === 'watching' && (
                <div className="animate-in zoom-in-95">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-4">Ad ending in {timeLeft}s</p>
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-lg mb-6 group">
                        <video autoPlay muted playsInline className="w-full h-full object-cover">
                            <source src={adData.videoUrl} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                            {timeLeft}s
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 italic">"Please wait while we configure your connection..."</p>
                </div>
            )}

            {step === 'logging_in' && (
                <div className="flex flex-col items-center py-10">
                    <Loader2 size={48} className="text-red-600 animate-spin mb-4"/>
                    <h3 className="font-bold text-slate-700">Connecting to Network...</h3>
                    <p className="text-xs text-slate-400">Submitting credentials to Router...</p>
                </div>
            )}

        </div>
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400">Powered by SwiftNet Hotspot System v2.0</p>
        </div>
      </div>
    </div>
  );
};

// --- [FEATURE 4] ADMIN AD MANAGER ---
// --- [UPDATED FEATURE] ADMIN AD MANAGER WITH VIDEO UPLOAD ---
const AdManager = ({ db, appId }) => {
    const [stats, setStats] = useState({ views: 0, revenue: 0 });
    const [ads, setAds] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    
    // New Ad Form State
    const [newAd, setNewAd] = useState({ 
        sponsor: '', 
        videoFile: null 
    });

    // 1. Fetch Stats & Existing Ads
    useEffect(() => {
        // Stats Listener
        const qStats = query(collection(db, 'artifacts', appId, 'public', 'data', 'isp_ad_views_v1'));
        const unsubStats = onSnapshot(qStats, (snapshot) => {
            let totalViews = 0, totalRev = 0;
            snapshot.forEach(doc => { const data = doc.data(); totalViews += 1; totalRev += (data.revenue || 0); });
            setStats({ views: totalViews, revenue: totalRev });
        });

        // Campaigns Listener
        const qAds = query(collection(db, 'artifacts', appId, 'public', 'data', 'isp_ads_campaigns'));
        const unsubAds = onSnapshot(qAds, (snapshot) => {
            setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { unsubStats(); unsubAds(); };
    }, [db, appId]);

    // 2. Handle File Selection
    const handleFileChange = (e) => {
        if(e.target.files[0]) {
            setNewAd({ ...newAd, videoFile: e.target.files[0] });
        }
    };

    // 3. Upload Video & Save Campaign
    const handleUpload = async () => {
        if (!newAd.sponsor || !newAd.videoFile) return alert("Please fill sponsor name and select a video.");
        
        setIsUploading(true);
        try {
            // A. Upload to Firebase Storage
            // We use a timestamp in the name to make it unique
            const videoRef = storageRef(storage, `ad_videos/${Date.now()}_${newAd.videoFile.name}`);
            
            // Uploading...
            const snapshot = await uploadBytes(videoRef, newAd.videoFile);
            
            // Get the public URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            // B. Save Metadata to Firestore
            // We set status: 'active' so it shows up immediately
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_ads_campaigns'), {
                sponsor: newAd.sponsor,
                videoUrl: downloadURL,
                status: 'active',
                dateCreated: new Date().toISOString()
            });

            alert("Ad Campaign Created Successfully!");
            setNewAd({ sponsor: '', videoFile: null }); // Reset form

        } catch (error) {
            console.error("Upload failed", error);
            alert("Error uploading video: " + error.message);
        }
        setIsUploading(false);
    };

    // 4. Delete/Stop Campaign
    const handleDelete = async (id) => {
        if(confirm("Stop and delete this ad campaign?")) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'isp_ads_campaigns', id));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Stats Header */}
            <div className="bg-gradient-to-r from-purple-900 to-slate-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 flex justify-between items-center">
                    <div><h2 className="text-3xl font-black mb-1">Sponsored WiFi</h2><p className="text-purple-200">Monetize your free users.</p></div>
                    <div className="text-right"><p className="text-xs font-bold uppercase tracking-widest text-purple-300">Total Earnings</p><p className="text-4xl font-black text-white">₱{stats.revenue.toFixed(2)}</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Form */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><UploadCloud size={20}/> Upload New Video Ad</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Sponsor Name</label>
                            <input 
                                className="w-full border p-3 rounded-xl mt-1" 
                                placeholder="e.g. Aling Nena Store" 
                                value={newAd.sponsor} 
                                onChange={e => setNewAd({...newAd, sponsor: e.target.value})}
                            />
                        </div>

                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                            <input 
                                type="file" 
                                accept="video/mp4,video/webm" 
                                onChange={handleFileChange} 
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            {newAd.videoFile ? (
                                <div className="text-green-600 font-bold flex flex-col items-center">
                                    <FileBarChart size={32} className="mb-2"/>
                                    {newAd.videoFile.name}
                                    <span className="text-xs font-normal text-slate-500">{(newAd.videoFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center">
                                    <Video size={32} className="mb-2"/>
                                    <span className="text-sm font-bold">Click to Select Video</span>
                                    <span className="text-xs">MP4 or WebM (Max 10MB recommended)</span>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleUpload} 
                            disabled={isUploading}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 flex justify-center gap-2"
                        >
                            {isUploading ? <Loader2 className="animate-spin"/> : <Upload size={20}/>}
                            {isUploading ? 'Uploading Video...' : 'Launch Campaign'}
                        </button>
                    </div>
                </div>

                {/* Active Campaigns List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800">Active Campaigns</h3>
                    {ads.map(ad => (
                        <div key={ad.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                            <video src={ad.videoUrl} className="w-24 h-16 bg-black rounded-lg object-cover" muted />
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800">{ad.sponsor}</h4>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">{ad.status}</span>
                            </div>
                            <button onClick={() => handleDelete(ad.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                        </div>
                    ))}
                    {ads.length === 0 && <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">No active ads. The default video will play.</div>}
                </div>
            </div>
        </div>
    );
};

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // Fetches real weather for Santa Ana, Cagayan (Lat: 18.47, Lng: 122.15)
    fetch('https://api.open-meteo.com/v1/forecast?latitude=18.4728&longitude=122.1557&current_weather=true')
      .then(res => res.json())
      .then(data => setWeather(data.current_weather))
      .catch(err => console.error("Weather error", err));
  }, []);

  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-2">
            <MapPin size={14} className="text-blue-100"/>
            <span className="text-xs font-bold uppercase text-blue-100">Santa Ana, Cagayan</span>
        </div>
        <div className="text-3xl font-black mt-1">{weather.temperature}°C</div>
        <div className="text-sm font-medium opacity-90 flex items-center gap-1">
            <CloudRain size={14}/> Wind: {weather.windspeed} km/h
        </div>
      </div>
      <Sun size={48} className="text-yellow-300 animate-pulse"/>
    </div>
  );
};

const MaintenanceBanner = ({ db, appId }) => {
  const [targetDate, setTargetDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // 1. Listen to Real Database Settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'main_settings'), (doc) => {
        if (doc.exists() && doc.data().maintenanceSchedule) {
            // Only set date if it's in the future
            const schedule = new Date(doc.data().maintenanceSchedule);
            if (schedule > new Date()) {
                setTargetDate(schedule);
            } else {
                setTargetDate(null);
            }
        } else {
            setTargetDate(null);
        }
    });
    return () => unsub();
  }, [db, appId]);

  // 2. Countdown Logic
  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const distance = new Date(targetDate) - now;
      
      if (distance < 0) {
        setTimeLeft('EXPIRED');
        setTargetDate(null); // Hide immediately when time is up
        clearInterval(interval);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate || timeLeft === 'EXPIRED') return null;

  return (
    <div className="bg-orange-600 text-white px-4 py-3 rounded-xl shadow-md mb-6 flex items-center justify-between animate-in slide-in-from-top-5">
        <div className="flex items-center gap-3">
            <Wrench className="animate-spin-slow" size={20}/>
            <div>
                <p className="font-bold text-sm">Scheduled Maintenance</p>
                <p className="text-xs opacity-90">System upgrade in progress.</p>
            </div>
        </div>
        <div className="font-mono text-xl font-black bg-orange-700/50 px-3 py-1 rounded-lg">
            {timeLeft}
        </div>
    </div>
  );
};

const KnowledgeBase = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState('');
  
  const faqs = [
    { q: "How do I change my WiFi Password?", a: "To change your password, connect to your router, open 192.168.1.1 in your browser, and log in with the details found on the sticker under your device." },
    { q: "My internet is slow (Red LOS Light)", a: "A red LOS light means a fiber cut. Please file a repair ticket immediately." },
    { q: "Where can I pay my bill?", a: "We accept GCash, Maya, and 7-Eleven. Use the 'Wallet' tab to upload your proof of payment." },
    { q: "What is the FUP limit?", a: "Our Fiber 1699 plan has no data cap. Fiber 999 has a fair usage policy of 500GB/month." }
  ];

  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BookOpen size={20} className="text-blue-600"/> Knowledge Base</h3>
        <input className="w-full border p-2 rounded-lg text-sm mb-4 bg-slate-50" placeholder="Search help articles..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <div className="space-y-2">
            {filtered.map((item, i) => (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                    <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-50 transition-colors">
                        <span className="font-bold text-sm text-slate-700">{item.q}</span>
                        <ChevronRight size={16} className={`transition-transform ${openIndex === i ? 'rotate-90' : ''}`}/>
                    </button>
                    {openIndex === i && <div className="p-3 pt-0 text-sm text-slate-600 bg-slate-50 border-t border-slate-100">{item.a}</div>}
                </div>
            ))}
        </div>
    </div>
  );
};

const VideoSupport = ({ user }) => {
  // 🔴 STEP 1: Paste your Admin Zoom Invite Link here
  // Get this from Zoom App -> Meetings -> Copy Invitation
  const ZOOM_MEETING_URL = "https://zoom.us/j/95247752936?pwd=KQY7CFPxbQyO1PSQPQIPaLyPgWraf8.1"; 

  const startCall = () => {
    // This opens the Zoom app or browser directly
    window.open(ZOOM_MEETING_URL, '_blank');
  };

  return (
    <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-6 rounded-2xl text-white shadow-lg flex justify-between items-center animate-in fade-in">
        <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
                <Video size={20} className="text-blue-200"/> Zoom Support
            </h3>
            <p className="text-sm opacity-90 max-w-[200px]">
                Speak with a technician live via Zoom.
            </p>
        </div>
        <button 
            onClick={startCall} 
            className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 hover:scale-105 transition-all shadow-md flex items-center gap-2"
        >
            <Video size={16}/> Join Meeting
        </button>
    </div>
  );
};

const ScheduledCallback = ({ user, db, appId }) => {
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), {
            ticketId: Math.floor(Math.random() * 900000).toString(),
            userId: user.uid,
            username: user.username,
            subject: "Scheduled Callback Request",
            message: `Customer requests a phone call at: ${time}`,
            status: 'open',
            date: new Date().toISOString(),
            isCallback: true
        });
        alert("Callback requested!");
    } catch(e) { alert("Error"); }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><PhoneCall size={18} className="text-green-600"/> Request Callback</h3>
        <p className="text-xs text-slate-500 mb-4">We'll call you at your preferred time.</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input type="datetime-local" className="flex-1 border p-2 rounded-lg text-sm" value={time} onChange={e=>setTime(e.target.value)} required/>
            <button disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs">{loading ? '...' : 'Book'}</button>
        </form>
    </div>
  );
};

// --- [NEW] DATA RECORDER (Creates the history) ---
// This invisible component saves traffic stats to Firestore every 10 minutes
// --- [UPDATED] TRAFFIC RECORDER ---
const TrafficRecorder = ({ db, app, appId }) => {
  useEffect(() => {
    const rtdb = getDatabase(app);
    const trafficRef = ref(rtdb, 'monitor/traffic');
    let currentTraffic = { rx: 0, tx: 0 };

    const unsubscribe = onValue(trafficRef, (snapshot) => {
        const val = snapshot.val();
        if(val) currentTraffic = val;
    });

    const saveLog = async () => {
        if(currentTraffic.rx === 0 && currentTraffic.tx === 0) return;
        try {
            // FIX: Use backticks ` ` and slashes / for the path
            const path = `artifacts/${appId}/public/data/isp_traffic_logs`;
            await addDoc(collection(db, path), {
                date: new Date().toISOString(),
                download: currentTraffic.rx,
                upload: currentTraffic.tx
            });
            console.log("Traffic history saved.");
        } catch(e) { console.error("Log error", e); }
    };

    const interval = setInterval(saveLog, 10 * 60 * 1000); 
    return () => { unsubscribe(); clearInterval(interval); }
  }, [db, app, appId]);

  return null; 
};

// --- [UPDATED] PEAK USAGE GRAPH (Reads the history) ---
// --- [UPDATED] PEAK USAGE GRAPH ---
const PeakUsageGraph = ({ db, appId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
        try {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            
            // FIX: Use backticks ` ` and slashes / for the path
            const path = `artifacts/${appId}/public/data/isp_traffic_logs`;
            
            const q = query(
                collection(db, path),
                where('date', '>=', yesterday),
                orderBy('date', 'asc')
            );

            const snapshot = await getDocs(q);
            const points = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    time: new Date(d.date).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'}),
                    usage: d.download
                };
            });

            if(points.length === 0) {
                setData([{ time: 'Now', usage: 0 }]);
            } else {
                setData(points);
            }
        } catch (e) {
            console.error("Graph error:", e);
        }
        setLoading(false);
    };

    loadHistory();
  }, [db, appId]);

  // ... (The rest of the render return code stays the same) ...
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-80 w-full flex flex-col">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-red-500"/> Peak Usage History (24h)
        </h3>
        
        {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">Loading history...</div>
        ) : data.length <= 1 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
                <p>No history yet.</p>
                <p className="text-xs mt-1">Keep the Admin dashboard open to record data.</p>
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10}} minTickGap={30}/>
                    <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                    <Area type="monotone" dataKey="usage" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" />
                </AreaChart>
            </ResponsiveContainer>
        )}
    </div>
  );
};

const ApplicationWizard = ({ plan, onClose, onSubmit, db, appId }) => {
  const [step, setStep] = useState(1);
  const [serviceStatus, setServiceStatus] = useState(null); 
  const [position, setPosition] = useState({ lat: 18.4728, lng: 122.1557 }); // Default Center
  const [isSwitcher, setIsSwitcher] = useState(false); // <--- NEW FEATURE STATE
  
  const [formData, setFormData] = useState({
    province: 'CAGAYAN',
    city: '',
    barangay: '',
    street: '',
    landmark: '',
    lat: '',
    lng: ''
  });

  const checkAvailability = async () => {
    if (!formData.city || !formData.barangay) return alert("Please enter City and Barangay");
    const cityUpper = formData.city.toUpperCase().trim();
    const brgyUpper = formData.barangay.toUpperCase().trim();

    const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', SERVICE_AREAS_COLLECTION), 
        where('city', '==', cityUpper),
        where('barangay', '==', brgyUpper)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        setServiceStatus('None');
    } else {
        const area = snapshot.docs[0].data();
        setServiceStatus(area.status);
        if (area.status === 'Available') setStep(2);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        setFormData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
      },
    });
    return position === null ? null : <Marker position={position}></Marker>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-red-600 p-6 text-white relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-1">New Application</h2>
            <p className="text-red-100 text-sm">Selected: {plan.name}</p>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={24}/></button>
        </div>
        <div className="px-8 pt-6 pb-2">
           <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((id) => (
                 <div key={id} className={`w-full h-2 rounded-full mr-2 ${step >= id ? 'bg-red-600' : 'bg-slate-200'}`}></div>
              ))}
           </div>
           <p className="text-xs text-slate-400 text-right">Step {step} of 4</p>
        </div>
        <div className="p-8 overflow-y-auto flex-grow">
            {step === 1 && (
              <div className="space-y-6">
                  <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-800">Check Availability</h3>
                      <p className="text-slate-500">Enter your location to see if we cover your area.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-xs font-bold text-slate-500 uppercase">Province</label><input className="w-full border p-3 rounded-lg bg-slate-100 text-slate-500" value="CAGAYAN" readOnly /></div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase">City</label><input className="w-full border p-3 rounded-lg uppercase" placeholder="STA ANA" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                      <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Barangay</label><input className="w-full border p-3 rounded-lg uppercase" placeholder="BGY MAREDE" value={formData.barangay} onChange={e => setFormData({...formData, barangay: e.target.value})} /></div>
                  </div>

                  {/* --- NEW: SWITCHER PROMO SECTION --- */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            id="switcher" 
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isSwitcher}
                            onChange={e => setIsSwitcher(e.target.checked)}
                          />
                          <label htmlFor="switcher" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                              Switching from PLDT/Globe/Converge?
                          </label>
                      </div>
                      {isSwitcher && (
                          <div className="mt-2 text-xs text-blue-700 ml-8 animate-in slide-in-from-top-2">
                              <p className="font-bold">🎉 Promo Eligible!</p>
                              <p>Upload your previous bill later to get <span className="font-bold bg-yellow-200 px-1 rounded text-yellow-900">FREE INSTALLATION</span> and 50% OFF your first month.</p>
                          </div>
                      )}
                  </div>
                  {/* ----------------------------------- */}

                  {serviceStatus === 'None' && <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center"><p className="text-red-700 font-bold">Sorry, we are not yet available in this area.</p></div>}
                  {serviceStatus === 'Coming Soon' && <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center"><p className="text-yellow-800 font-bold">Coming Soon!</p><p className="text-xs text-yellow-600">We are currently building lines here.</p></div>}
                  
                  {/* THIS IS THE BUTTON YOU WERE LOOKING FOR */}
                  <button onClick={checkAvailability} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">CHECK COVERAGE</button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4 h-full flex flex-col">
                  <div className="text-center"><h3 className="text-xl font-bold text-slate-800">Pin Your Exact Location</h3><p className="text-sm text-slate-500">Click on the map where your house is located.</p></div>
                  <div className="flex-grow rounded-xl overflow-hidden border-2 border-slate-200 h-[300px] relative z-0">
                      <MapContainer center={[18.4728, 122.1557]} zoom={13} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                          <LocationMarker />
                      </MapContainer>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2 text-xs text-blue-700"><MapPin size={16}/> Coordinates: {formData.lat ? `${formData.lat.toFixed(6)}, ${formData.lng.toFixed(6)}` : 'Click map to set'}</div>
                  <button onClick={() => formData.lat ? setStep(3) : alert("Please pin location first")} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">CONFIRM LOCATION</button>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 text-center">Complete Address</h3>
                  <div className="grid grid-cols-1 gap-4">
                      <div><label className="text-xs font-bold text-slate-500 uppercase">Street / Purok</label><input className="w-full border p-3 rounded-lg" placeholder="e.g. Purok 1, Main St." value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} /></div>
                      <div><label className="text-xs font-bold text-slate-500 uppercase">Landmark</label><input className="w-full border p-3 rounded-lg" placeholder="e.g. Near the Yellow Store" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} /></div>
                  </div>
                  <button onClick={() => setStep(4)} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 mt-4">NEXT</button>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6 text-center">
                  <h3 className="text-2xl font-bold text-slate-800">Review Application</h3>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500 font-bold">Plan</span><span className="font-bold text-blue-600">{plan.name}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Address</span><span>{formData.street}, {formData.barangay}, {formData.city}</span></div>
                      {isSwitcher && <div className="flex justify-between"><span className="text-slate-500 font-bold">Promo</span><span className="font-bold text-green-600">Switcher (Free Install)</span></div>}
                      <div className="flex justify-between"><span className="text-slate-500">GPS</span><span className="font-mono text-xs">{formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}</span></div>
                  </div>
                  {/* --- UPDATED SUBMIT: Passes isSwitcher data --- */}
                  <button onClick={() => onSubmit({ ...formData, isSwitcher })} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200">SUBMIT APPLICATION</button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

const InvoiceModal = ({ doc, user, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);

  if (!doc) return null;

  // --- LOGIC: Determine Document Type ---
  const isContract = doc.type === 'Contract';
  const isReceipt = doc.type === 'Receipt';
  
  // Theme Settings
  const themeColor = isReceipt ? 'text-green-600' : isContract ? 'text-blue-900' : 'text-red-600';
  const borderColor = isReceipt ? 'border-green-600' : isContract ? 'border-blue-900' : 'border-red-600';
  const label = isReceipt ? 'Official Receipt' : isContract ? 'Service Agreement' : 'Statement of Account';

  // Invoice Math (Only needed for non-contracts)
  const amountVal = parseFloat((doc.amount || '0').toString().replace(/,/g, ''));
  const vat = amountVal - (amountVal / 1.12);
  const baseAmount = amountVal - vat;

  const handleDownload = async () => {
    setDownloading(true);
    const element = document.getElementById('printable-invoice');
    try {
        await new Promise(r => setTimeout(r, 100));
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${doc.title.replace(/\s+/g, '_')}.pdf`);
    } catch (err) { alert("Error generating PDF."); }
    setDownloading(false);
  };

  const handleEmail = async () => {
      // (Your existing email logic remains here - kept brief for readability)
      if (!confirm(`Send this ${label} to ${user.email}?`)) return;
      alert("Email sent! (Simulation)"); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl flex flex-col">
        {/* Header Toolbar */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-3"><FileText size={20} /><span className="font-bold">{doc.title}</span></div>
            <div className="flex items-center gap-3">
                <button onClick={handleEmail} disabled={sending} className="text-slate-300 hover:text-white flex items-center gap-1 text-sm bg-blue-600/20 px-3 py-1 rounded hover:bg-blue-600 transition-colors"><Mail size={16} /> Email</button>
                <button onClick={handleDownload} disabled={downloading} className="text-slate-300 hover:text-white flex items-center gap-1 text-sm"><Download size={16} /> PDF</button>
                <button onClick={onClose} className="text-slate-300 hover:text-white"><X size={24} /></button>
            </div>
        </div>
        
        <div id="printable-invoice" className="p-8 md:p-12 text-slate-800 font-sans bg-white min-h-[800px] relative">
            {/* 1. Header Section */}
            <div className={`flex justify-between items-start mb-8 border-b-4 ${borderColor} pb-6`}>
                <div className="flex items-center gap-2">
                    <div className={`${isReceipt ? 'bg-green-600' : isContract ? 'bg-blue-900' : 'bg-red-600'} p-2 rounded`}><Wifi className="text-white" size={32} /></div>
                    <div><h1 className={`text-3xl font-bold tracking-tight ${themeColor}`}>SwiftNet<span className="text-slate-800">ISP</span></h1><p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Home Fiber Services</p></div>
                </div>
                <div className="text-right"><h2 className="text-2xl font-bold uppercase text-slate-700">{label}</h2><p className="text-sm text-slate-500">{isContract ? 'Signed On:' : 'Date:'} {new Date(doc.date).toLocaleDateString()}</p></div>
            </div>
            
            {/* 2. Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-1"><p className="text-xs font-bold text-slate-400 uppercase">Account Name</p><p className="font-bold text-lg uppercase">{user.username}</p><p className="text-sm text-slate-600">{user.address || "No address provided"}</p></div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between mb-2"><span className="text-sm font-bold text-slate-500">Account Number</span><span className="text-sm font-bold text-slate-900">{user.accountNumber}</span></div>
                    {/* Only show amount box if NOT a contract */}
                    {!isContract && (
                        <div className="flex justify-between border-t border-slate-200 pt-2 mt-2"><span className="text-lg font-bold text-slate-700">{isReceipt ? 'Amount Paid' : 'Amount Due'}</span><span className="text-lg font-bold text-slate-900">₱{amountVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                    )}
                    {/* Show Plan Name for Contracts */}
                    {isContract && (
                         <div className="flex justify-between border-t border-slate-200 pt-2 mt-2"><span className="text-lg font-bold text-slate-700">Service Plan</span><span className="text-lg font-bold text-slate-900">{user.plan || 'Standard Fiber'}</span></div>
                    )}
                </div>
            </div>

            {/* 3. CONTENT AREA: Switches based on type */}
            {isContract ? (
                // --- CONTRACT VIEW ---
                <div className="mb-10 text-sm text-slate-700 leading-relaxed space-y-4 border p-6 rounded-xl bg-slate-50">
                    <h3 className="font-bold uppercase mb-2 border-b pb-2">Terms of Service Agreement</h3>
                    <p><strong>1. SERVICE:</strong> The Provider agrees to supply fiber internet connection speed of {user.plan || 'Standard Plan'} to the registered address.</p>
                    <p><strong>2. PAYMENT:</strong> The Subscriber agrees to pay the monthly fee on or before the due date. Failure to pay may result in disconnection.</p>
                    <p><strong>3. LOCK-IN PERIOD:</strong> This contract has a minimum lock-in period of 24 months. Pre-termination fees apply.</p>
                    <p><strong>4. USAGE:</strong> Illegal activities, hacking, or reselling of bandwidth is strictly prohibited.</p>
                    <div className="mt-8 pt-4 border-t border-slate-300">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Signed by Subscriber</p>
                        {user.signature ? (
                            <img src={user.signature} alt="Signature" className="h-16 object-contain border-b border-black" />
                        ) : (
                            <p className="text-red-500 font-bold italic">[Signature Not Found]</p>
                        )}
                        <p className="font-bold mt-1 uppercase">{user.username}</p>
                        <p className="text-xs text-slate-500">Date Signed: {new Date(doc.date).toLocaleDateString()}</p>
                    </div>
                </div>
            ) : (
                // --- INVOICE/RECEIPT VIEW ---
                <div className="mb-10">
                    <h3 className="font-bold text-slate-700 border-b border-slate-300 pb-2 mb-4 uppercase text-sm tracking-wider">Transaction Details</h3>
                    <table className="w-full text-sm">
                        <tbody className="text-slate-700">
                            {doc.items ? doc.items.map((item, i) => (
                                <tr key={i}><td className="py-2">{item.description || item.desc}</td><td className="py-2 text-right">₱{parseFloat(item.amount).toLocaleString()}</td></tr>
                            )) : (
                                <tr><td className="py-2">Monthly Service Fee ({user.plan || 'Fiber Plan'})</td><td className="py-2 text-right">₱{baseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                            )}
                            {!doc.items && <tr><td className="py-2 border-b border-slate-100">Value Added Tax (12%)</td><td className="py-2 border-b border-slate-100 text-right">₱{vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>}
                            <tr><td className={`py-4 font-bold text-lg ${themeColor}`}>Total</td><td className={`py-4 font-bold text-lg ${themeColor} text-right`}>₱{amountVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Footer */}
            <div className="bg-slate-50 p-6 rounded border border-slate-200 text-center text-xs text-slate-500">
                <p className="font-bold mb-2">THANK YOU FOR YOUR BUSINESS</p>
                <p>This is a system-generated document.</p>
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center"><span>https://www.swiftnet.com/</span><span>Hotline: 0968-385-9759</span></div>
            </div>
        </div>
      </div>
    </div>
  );
};

const RepairStatusCard = ({ repair, isSubscriber, onConfirm, technicians, onAssign, isTechnician, onTechUpdate, isAdmin, onForceComplete }) => {
  const steps = [
    { label: 'Submission', icon: <Check size={16} /> },
    { label: 'Evaluation', icon: <ClipboardList size={16} /> },
    { label: 'Processing', icon: <RefreshCw size={16} /> },
    { label: 'Customer Confirmation', icon: <UserCheck size={16} /> },
    { label: 'Completed', icon: <CheckCircle size={16} /> }
  ];

  const currentStepIndex = repair.stepIndex || 0;
  const isCompleted = repair.status === 'Completed';
  
  const getActionLabel = () => {
      if (currentStepIndex === 0) return { text: "Start Evaluation", icon: <ClipboardList size={16} /> };
      if (currentStepIndex === 1) return { text: "Start Processing", icon: <PlayCircle size={16} /> };
      if (currentStepIndex === 2) return { text: "Mark for Confirmation", icon: <CheckCircle size={16} /> };
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
                  {repair.type === 'New Installation' ? <Briefcase className={`${isCompleted ? 'text-green-600' : 'text-slate-600'}`} size={24} /> : <Wifi className={`${isCompleted ? 'text-green-600' : 'text-slate-600'}`} size={24} />}
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-800">{repair.type || 'Service Repair'}</h3>
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
                 <p className="text-xs font-bold text-slate-400 uppercase">Details</p>
                 <p className="text-sm text-slate-700 italic">"{repair.notes}"</p>
             </div>
         </div>
      )}

      {!isCompleted && (
        <>
          {isSubscriber && (
             <p className="text-sm text-slate-600 mb-4 border-b border-slate-100 pb-4">
                 Requests are usually processed within 24 hours.
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
                   
                   {/* ADMIN: Assign Technician */}
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

             {/* TECHNICIAN & ADMIN ACTION */}
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
             
             {/* ADMIN WAITING MESSAGE */}
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

             {/* CUSTOMER CONFIRMATION */}
             {isSubscriber && currentStepIndex === 3 && (
                 <div className="mt-2 flex justify-end border-t border-slate-200 pt-3">
                     <div className="flex flex-col items-end gap-2">
                        <p className="text-xs text-slate-500">Technician marked this as resolved. Please confirm.</p>
                        <button 
                           onClick={() => onConfirm(repair.id)}
                           className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-colors"
                        >
                           <CheckCircle size={16} /> Confirm Resolution
                        </button>
                     </div>
                 </div>
             )}
          </div>
        </>
      )}
      
      {isCompleted && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-green-100 flex items-center gap-3">
              <CheckCircle className="text-green-600" size={20} />
              <p className="text-sm text-green-800">This request has been completed.</p>
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

const BackgroundMusic = () => {
  const [playing, setPlaying] = useState(false);
  const [audio] = useState(new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'));

  useEffect(() => {
    audio.loop = true;
    audio.volume = 0.3; 
    return () => audio.pause();
  }, [audio]);

  const toggle = () => {
    if (playing) audio.pause();
    else audio.play().catch(e => console.log("Audio play failed (interaction needed first)"));
    setPlaying(!playing);
  };

  return (
    <button 
      onClick={toggle}
      className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl backdrop-blur-md transition-all duration-500 ${playing ? 'bg-indigo-600/90 text-white w-40' : 'bg-white/80 text-slate-600 w-12 hover:w-40 overflow-hidden group'}`}
    >
      <div className={`flex-shrink-0 ${playing ? 'animate-spin-slow' : ''}`}>
        {playing ? <Volume2 size={20} /> : <Music size={20} />}
      </div>
      <span className={`whitespace-nowrap text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${playing ? 'opacity-100' : ''}`}>
        {playing ? 'Vibing...' : 'Play Music'}
      </span>
    </button>
  );
};

import { GoogleGenerativeAI } from "@google/generative-ai";


// --- CONFIGURATION ---
const GEMINI_API_KEY = "AIzaSyD4TVNm6C_7awuVHYGguSeKjc1BpHzGUM0"; // <--- PASTE KEY HERE

const GeminiChatWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: `Hi ${user?.username || 'there'}! I'm the SwiftNet AI. Ask me about plans, repairs, or billing.` }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !GEMINI_API_KEY) return;

    const userMessage = input;
    const previousMessages = [...messages]; 
    
    setInput('');
    setLoading(true);

    // 1. Add User Message to UI
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);

    try {
      // Initialize the Generative AI client
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      
      // Use the standard model name. The SDK will handle the correct API version.
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `You are the helpful customer support AI for SwiftNet ISP. 
        Keep answers concise (under 50 words). 
        Current User: ${user?.username || 'Guest'}.
        Technical: Red LOS = fiber cut. Slow = restart router.
        Billing: GCash/Maya accepted.`
      });

      // Gemini history MUST start with a 'user' message.
      // We filter out your initial 'model' greeting from the history sent to the API.
      const chatHistory = previousMessages
        .filter((msg, index) => index !== 0) 
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const chat = model.startChat({
        history: chatHistory,
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      // 2. Add AI Response to UI
      setMessages(prev => [...prev, { role: 'model', text: text }]);

    } catch (error) {
      console.error("Gemini Details:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "I'm having trouble connecting. Please ensure your API key is valid and you have updated the @google/generative-ai library." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ... (Keep your existing return/JSX code)
  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed bottom-6 right-6 z-[60] bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform border-2 border-white/20"
      >
        {isOpen ? <X size={24}/> : <MessageCircle size={24}/>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60] w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 p-4 flex items-center gap-3">
             <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2 rounded-lg">
                <Bot size={20} className="text-white" />
             </div>
             <div>
                <h3 className="font-bold text-white text-sm">SwiftNet Assistant</h3>
                <p className="text-[10px] text-blue-200 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Powered by Gemini
                </p>
             </div>
          </div>

          <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-3 flex flex-col">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm shadow-sm ${
                    m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
               <div className="flex justify-start">
                  <div className="bg-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2 text-xs">
                     <Loader2 size={14} className="animate-spin"/> Typing...
                  </div>
               </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
                disabled={loading || !input.trim()} 
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-50 transition-colors"
            >
                <Send size={18}/>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

// --- [START NEW COMPONENTS] ---

// 1. Flash Promo Manager (Admin)
const FlashPromoManager = ({ db, appId }) => {
  const [promo, setPromo] = useState({ title: '', discount: '', active: false });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'flash_promo'), (snap) => {
      if (snap.exists()) setPromo(snap.data());
    });
    return () => unsub();
  }, [db, appId]);

  const handleSave = async () => {
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'flash_promo'), promo);
    alert("Promo Updated! Subscribers will see this immediately.");
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 rounded-2xl text-white shadow-xl mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl flex items-center gap-2"><Sparkles className="text-yellow-400"/> Flash Promo Controller</h3>
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase">{promo.active ? 'LIVE' : 'OFF'}</span>
            <button onClick={() => setPromo({...promo, active: !promo.active})} className={`w-12 h-6 rounded-full transition-colors relative ${promo.active ? 'bg-green-500' : 'bg-slate-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${promo.active ? 'left-7' : 'left-1'}`}></div>
            </button>
        </div>
      </div>
      <div className="space-y-3 text-slate-900">
        <input className="w-full p-2 rounded-lg" placeholder="Promo Title (e.g. 50% OFF Next Month)" value={promo.title} onChange={e => setPromo({...promo, title: e.target.value})} />
        <input className="w-full p-2 rounded-lg" placeholder="Offer Details (e.g. Upgrade to Fiber 200Mbps now!)" value={promo.discount} onChange={e => setPromo({...promo, discount: e.target.value})} />
        <button onClick={handleSave} className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold w-full py-2 rounded-lg">Update Promo</button>
      </div>
    </div>
  );
};

// 2. Flash Promo Banner (Subscriber)
const FlashPromoBanner = ({ user, db, appId }) => {
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'flash_promo'), (snap) => {
      if (snap.exists() && snap.data().active) setPromo(snap.data());
      else setPromo(null);
    });
    return () => unsub();
  }, [db, appId]);

  const handleClaim = async () => {
    if(!confirm("Claim this offer? Admin will adjust your billing.")) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), {
        ticketId: Math.floor(Math.random() * 9000000).toString(),
        userId: user.uid,
        username: user.username,
        subject: `CLAIMED PROMO: ${promo.title}`,
        message: `User claimed the Flash Sale: ${promo.discount}`,
        status: 'open',
        date: new Date().toISOString(),
        isOrder: true
    });
    alert("Offer Claimed! Check your ticket status.");
  };

  if (!promo) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-4 rounded-2xl shadow-lg mb-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2 border-2 border-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm animate-pulse"><Timer size={24}/></div>
            <div>
                <h3 className="font-black text-lg uppercase tracking-tight">{promo.title}</h3>
                <p className="text-sm font-medium opacity-90">{promo.discount}</p>
            </div>
        </div>
        <button onClick={handleClaim} className="relative z-10 bg-white text-red-600 px-6 py-2 rounded-xl font-bold shadow-xl hover:scale-105 transition-transform whitespace-nowrap">
            CLAIM NOW
        </button>
    </div>
  );
};

// 3. Entertainment Widget (Subscriber)
const EntertainmentWidget = ({ user, db, appId }) => {
  const bundles = [
    { name: 'Netflix Premium', price: 549, icon: <Film size={24} className="text-red-600"/>, color: 'bg-black text-white' },
    { name: 'Disney+ Mobile', price: 159, icon: <Tv size={24} className="text-blue-400"/>, color: 'bg-blue-900 text-white' },
    { name: 'NBA League Pass', price: 499, icon: <Trophy size={24} className="text-orange-500"/>, color: 'bg-slate-100 text-slate-800 border' }
  ];

  const handleSubscribe = async (bundle) => {
    if(!confirm(`Add ${bundle.name} to your monthly bill for ₱${bundle.price}?`)) return;
    
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), {
        ticketId: Math.floor(Math.random() * 9000000).toString(),
        userId: user.uid,
        username: user.username,
        subject: `Subscription: ${bundle.name}`,
        message: `Please activate ${bundle.name} for my account. I accept the +₱${bundle.price} monthly charge.`,
        status: 'open',
        date: new Date().toISOString(),
        isOrder: true
    });
    alert("Request Sent! You will receive an email with your login details.");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Tv size={20} className="text-purple-600"/> Entertainment Add-ons</h3>
        <div className="space-y-3">
            {bundles.map((b, i) => (
                <div key={i} className={`p-4 rounded-xl flex justify-between items-center ${b.color} shadow-sm transition-transform hover:scale-[1.02] cursor-pointer`} onClick={() => handleSubscribe(b)}>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">{b.icon}</div>
                        <div>
                            <p className="font-bold text-sm">{b.name}</p>
                            <p className="text-xs opacity-70">Add to plan</p>
                        </div>
                    </div>
                    <span className="font-bold text-sm">+₱{b.price}</span>
                </div>
            ))}
        </div>
    </div>
  );
};

// 4. Agent Dashboard (Reseller)
const AgentDashboard = ({ user, db, appId, onLogout }) => {
  const [leads, setLeads] = useState([]);
  const [newLead, setNewLead] = useState({ name: '', address: '', phone: '', plan: 'Fiber 1699' });
  
  useEffect(() => {
    const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'isp_leads_v1'), 
        where('agentId', '==', user.uid),
        orderBy('date', 'desc')
    );
    const unsub = onSnapshot(q, (s) => setLeads(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [user, db, appId]);

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if(!newLead.name || !newLead.address) return;

    try {
        const leadRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_leads_v1'), {
            ...newLead,
            agentId: user.uid,
            agentName: user.username,
            status: 'Pending',
            date: new Date().toISOString()
        });

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), {
            ticketId: Math.floor(Math.random() * 900000).toString(),
            userId: user.uid,
            username: user.username,
            subject: `New Lead: ${newLead.name}`,
            message: `Agent ${user.username} submitted a new application for ${newLead.name} at ${newLead.address}. Plan: ${newLead.plan}. Contact: ${newLead.phone}. Check Leads Database.`,
            status: 'open',
            date: new Date().toISOString(),
            isApplication: true,
            isAgentLead: true
        });

        setNewLead({ name: '', address: '', phone: '', plan: 'Fiber 1699' });
        alert("Lead Submitted! Commission will be credited once installed.");
    } catch(e) { alert("Error: " + e.message); }
  };

  const totalComm = leads.filter(l => l.status === 'Paid').length * 500;
  const pending = leads.filter(l => l.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
        <nav className="bg-teal-700 text-white p-4 shadow-lg sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Target className="text-teal-200"/>
                    <span className="font-bold text-lg">SwiftNet<span className="text-teal-200">Agent</span></span>
                </div>
                <button onClick={onLogout} className="bg-teal-800 p-2 rounded-lg hover:bg-teal-900"><LogOut size={18}/></button>
            </div>
        </nav>

        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-teal-500">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Earnings</p>
                    <h2 className="text-3xl font-black text-teal-700">₱{totalComm.toLocaleString()}</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-orange-500">
                    <p className="text-xs font-bold text-slate-400 uppercase">Pending Installs</p>
                    <h2 className="text-3xl font-black text-orange-600">{pending}</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-500">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Leads</p>
                    <h2 className="text-3xl font-black text-blue-600">{leads.length}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><UserPlus size={20}/> Submit New Application</h3>
                    <form onSubmit={handleSubmitLead} className="space-y-3">
                        <input className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Customer Name" value={newLead.name} onChange={e=>setNewLead({...newLead, name: e.target.value})} required/>
                        <input className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Full Address" value={newLead.address} onChange={e=>setNewLead({...newLead, address: e.target.value})} required/>
                        <input className="w-full border p-3 rounded-xl bg-slate-50" placeholder="Phone Number" value={newLead.phone} onChange={e=>setNewLead({...newLead, phone: e.target.value})} required/>
                        <select className="w-full border p-3 rounded-xl bg-slate-50" value={newLead.plan} onChange={e=>setNewLead({...newLead, plan: e.target.value})}>
                            <option>Fiber 1699 (Up to 200Mbps)</option>
                            <option>Fiber 2099 (Up to 400Mbps)</option>
                            <option>Fiber 999 (Prepaid)</option>
                        </select>
                        <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">Submit Application</button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700">Application History</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {leads.map(lead => (
                            <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                    <p className="font-bold text-slate-800">{lead.name}</p>
                                    <p className="text-xs text-slate-500">{lead.address} • {lead.plan}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{new Date(lead.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        lead.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                                        lead.status === 'Installed' ? 'bg-blue-100 text-blue-700' : 
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {lead.status}
                                    </span>
                                    {lead.status === 'Paid' && <p className="text-xs font-bold text-green-600 mt-1">+₱500.00</p>}
                                </div>
                            </div>
                        ))}
                        {leads.length === 0 && <p className="p-8 text-center text-slate-400">No applications submitted yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
// --- [END NEW COMPONENTS] ---

// --- [NEW FEATURE] REMOTE ACCESS SERVICE MANAGER (ADMIN) ---
const RemoteAccessAdmin = ({ db, appId }) => {
  const [settings, setSettings] = useState({ price: 1200, lastPort: 10000 });
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'remote_access_config'), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'isp_remote_access_v1'), orderBy('expiryDate', 'asc'));
    const unsubSubs = onSnapshot(q, (snap) => {
      setSubscriptions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubConfig(); unsubSubs(); };
  }, [db, appId]);

  const handleManualFulfill = async (subId, currentUrl) => {
    const url = prompt("Enter Remote URL:PORT (e.g. 124.6.182.10:10001):", currentUrl || "");
    if (url === null) return;
    
    // Extract port from the URL if possible for the 'Last Port' tracker
    const portMatch = url.match(/:(\d+)$/);
    const usedPort = portMatch ? parseInt(portMatch[1]) : settings.lastPort;

    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'isp_remote_access_v1', subId), { vpnUrl: url, status: 'Ready' });
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'remote_access_config'), { lastPort: usedPort });
    alert("Subscriber updated!");
  };

  const handleUpdatePrice = async () => {
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'remote_access_config'), settings);
    alert("Settings Saved!");
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* HEADER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
             <p className="text-xs font-bold text-slate-400 uppercase mb-1">Last Assigned Port</p>
             <h2 className="text-4xl font-black text-yellow-400">{settings.lastPort}</h2>
             <p className="text-[10px] mt-2 opacity-60 italic">Check this before creating a new NAT rule in Winbox.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase">Set Yearly Price (₱)</label>
              <div className="flex gap-2">
                  <input type="number" className="flex-1 border-b-2 border-slate-200 p-2 text-xl font-bold outline-none" value={settings.price} onChange={e => setSettings({...settings, price: parseFloat(e.target.value)})}/>
                  <button onClick={handleUpdatePrice} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs">Save</button>
              </div>
          </div>
      </div>

      {/* PORT REGISTRY TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b font-bold text-slate-700 flex justify-between items-center">
            <span>Subscriber Port Registry</span>
            <span className="text-[10px] bg-white px-2 py-1 rounded border">Ordered by Expiration</span>
        </div>
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b">
                <tr>
                    <th className="px-6 py-3">Subscriber</th>
                    <th className="px-6 py-3">Address & Port</th>
                    <th className="px-6 py-3">Expires</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {subscriptions.map(sub => (
                    <tr key={sub.id} className={new Date(sub.expiryDate) < new Date() ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{sub.username}</p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sub.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 animate-pulse'}`}>{sub.status}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-blue-600">{sub.vpnUrl || '---'}</td>
                        <td className="px-6 py-4">
                            <p className="text-xs text-slate-600">{new Date(sub.expiryDate).toLocaleDateString()}</p>
                            {new Date(sub.expiryDate) < new Date() && <p className="text-[9px] text-red-600 font-bold uppercase">Expired</p>}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => handleManualFulfill(sub.id, sub.vpnUrl)} className="text-blue-600 hover:underline font-bold text-xs">Configure</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {subscriptions.length === 0 && <p className="p-12 text-center text-slate-400">No subscriptions found.</p>}
      </div>
    </div>
  );
};


// --- [NEW FEATURE] REMOTE ACCESS WIDGET (SUBSCRIBER) ---
const RemoteAccessSubscriber = ({ user, db, appId }) => {
  const [config, setConfig] = useState({ price: 1200 }); // Default to 1200/year
  const [mySub, setMySub] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'remote_access_config')).then(s => {
      if(s.exists()) setConfig(s.data());
    });
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'isp_remote_access_v1'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setMySub({ id: snap.docs[0].id, ...snap.docs[0].data() });
    });
    return () => unsub();
  }, [user, db, appId]);

  const handlePurchase = async () => {
    if ((user.walletCredits || 0) < config.price) {
      return alert(`Insufficient credits. You need ₱${config.price} for a 1-year subscription.`);
    }

    if (!confirm(`Subscribe to MikroTik Remote Access for 1 FULL YEAR for ₱${config.price}?`)) return;

    setLoading(true);
    try {
      // Calculate Expiry: Exactly 365 days from now
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_remote_access_v1'), {
        userId: user.uid,
        username: user.username,
        datePurchased: new Date().toISOString(),
        expiryDate: expiry.toISOString(), // <--- 1 Year Expiry
        status: 'Pending Admin Setup',
        price: config.price,
        vpnUrl: '' 
      });

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.id), {
        walletCredits: increment(-config.price)
      });

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), {
          userId: user.uid,
          username: user.username,
          amount: -config.price,
          type: 'Remote Access (1 Year Plan)',
          date: new Date().toISOString(),
          status: 'verified'
      });

      alert("Yearly Subscription Activated! Admin will now set up your unique port.");
    } catch(e) { alert("Error: " + e.message); }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Globe size={20} className="text-blue-600"/> MikroTik Remote Access</h3>
          <p className="text-sm text-slate-500">Access Winbox from any network.</p>
        </div>
        <div className="bg-blue-600 px-3 py-1 rounded-full text-white font-bold text-xs">₱{config.price}/year</div>
      </div>

      {mySub ? (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-3">
             <span className="text-[10px] font-bold text-slate-400 uppercase">Valid Until: {new Date(mySub.expiryDate).toLocaleDateString()}</span>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${mySub.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{mySub.status}</span>
          </div>
          {mySub.vpnUrl ? (
            <div className="flex gap-2">
                 <code className="flex-1 bg-white border p-2 rounded text-sm font-mono text-blue-600 truncate">{mySub.vpnUrl}</code>
                 <button onClick={() => {navigator.clipboard.writeText(mySub.vpnUrl); alert("Copied!")}} className="p-2 bg-white border rounded hover:bg-slate-50"><Copy size={16}/></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500 text-xs italic"><Loader2 size={14} className="animate-spin"/> Configuring your port...</div>
          )}
        </div>
      ) : (
        <button onClick={handlePurchase} disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg">Buy 1 Year Access</button>
      )}
    </div>
  );
};
// Existing Code continues...

const Layout = ({ children, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Initialize dark mode from localStorage or default to false
  // Initialize dark mode from Cookie or default to false
  const [darkMode, setDarkMode] = useState(() => {
      if (typeof window !== 'undefined') {
          // Changed from localStorage to getCookie
          return getCookie('swiftnet_theme') === 'dark';
      }
      return false;
  });

  useEffect(() => {
      // Persist to Cookie instead of localStorage
      setCookie('swiftnet_theme', darkMode ? 'dark' : 'light', 365);
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);
  // --- [PROFESSIONAL FEATURE 5] IDLE TIMER ---
  useEffect(() => {
    let timeoutId;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Logout after 15 minutes (900000ms) of inactivity
      timeoutId = setTimeout(() => {
        alert("Session expired due to inactivity."); // Keeping basic alert here for safety disconnect
        onLogout();
      }, 900000); 
    };

    // Listen for activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer(); // Start timer

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [onLogout]);
  return (
    <div className={`min-h-screen font-sans flex flex-col relative overflow-x-hidden transition-colors duration-300 ${darkMode ? 'text-slate-100 selection:bg-blue-500 selection:text-white' : 'text-slate-800 selection:bg-indigo-200 selection:text-indigo-900'}`}>
      
      {/* --- MAGIC DARK MODE STYLES --- */}
      {/* This style block forces the app into Dark Mode without editing every component */}
      {darkMode && (
        <style>{`
            .bg-white { background-color: #0f172a !important; color: #f1f5f9 !important; border-color: #1e293b !important; }
            .bg-slate-50 { background-color: #1e293b !important; color: #e2e8f0 !important; border-color: #334155 !important; }
            .bg-slate-100 { background-color: #334155 !important; color: #e2e8f0 !important; }
            .text-slate-800, .text-slate-700, .text-slate-900 { color: #f8fafc !important; }
            .text-slate-600, .text-slate-500 { color: #94a3b8 !important; }
            .border-slate-200, .border-slate-100 { border-color: #334155 !important; }
            .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
            input, select, textarea { background-color: #1e293b !important; color: white !important; border-color: #475569 !important; }
            /* Fix for specific colored backgrounds to remain visible but readable */
            .bg-blue-50 { background-color: rgba(59, 130, 246, 0.1) !important; }
            .bg-green-50 { background-color: rgba(34, 197, 94, 0.1) !important; }
            .bg-red-50 { background-color: rgba(239, 68, 68, 0.1) !important; }
            .bg-orange-50 { background-color: rgba(249, 115, 22, 0.1) !important; }
            .bg-yellow-50 { background-color: rgba(234, 179, 8, 0.1) !important; }
            .bg-purple-50 { background-color: rgba(168, 85, 247, 0.1) !important; }
        `}</style>
      )}

      {/* Background Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {darkMode ? (
            // Dark Mode Background
            <div className="absolute inset-0 bg-slate-950">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]"></div>
            </div>
        ) : (
            // Light Mode Background
            <>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-100 to-indigo-100"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-300/30 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-300/30 blur-[100px] animate-pulse delay-1000"></div>
            </>
        )}
      </div>

      {/* Nav - z-[100] ensures it stays on top */}
      <nav className={`sticky top-0 z-[100] backdrop-blur-xl border-b shadow-sm transition-colors duration-300 ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/70 border-white/20'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                    <Wifi className="h-6 w-6 text-white" />
                </div>
                <span className={`font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${darkMode ? 'from-white to-slate-400' : 'from-slate-800 to-slate-600'}`}>
                    SwiftNet<span className="text-indigo-500">ISP</span>
                </span>
            </div>
            
            <div className="flex items-center gap-4">
                {/* DARK MODE TOGGLE BUTTON */}
                <button 
                    onClick={toggleTheme} 
                    className={`p-2 rounded-full transition-all duration-300 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {user && (
                  <div className="hidden md:flex items-center gap-4">
                    <div className={`flex items-center gap-3 px-5 py-2 rounded-full border shadow-inner ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100/50 border-white/50'}`}>
                       {user.role === 'admin' ? <Shield size={16} className="text-indigo-500" /> : 
                        user.role === 'technician' ? <HardHat size={16} className="text-orange-500" /> : 
                        <User size={16} className="text-blue-500" />}
                       <span className={`font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{user.displayName || user.email}</span>
                    </div>
                    <button onClick={onLogout} className="p-3 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-full transition-all duration-300 group" title="Sign Out">
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {/* Mobile Hamburger */}
                {user && (
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && user && (
            <div className={`md:hidden absolute top-20 left-0 w-full backdrop-blur-2xl border-b shadow-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 ${darkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-white/20'}`}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                   {user.role === 'admin' ? <Shield size={20} className="text-indigo-500" /> : 
                    user.role === 'technician' ? <HardHat size={20} className="text-orange-500" /> : 
                    <User size={20} className="text-blue-500" />}
                   <div>
                       <p className={`font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{user.displayName || user.email}</p>
                       <p className="text-xs text-slate-500 uppercase">{user.role}</p>
                   </div>
                </div>
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-4 rounded-xl font-bold hover:bg-red-500/20 transition-colors">
                    <LogOut size={20} /> Sign Out
                </button>
            </div>
        )}
      </nav>

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>
      
      <GeminiChatWidget user={user} />

      <BackgroundMusic />
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
      let userUid;
      
      if (isSignUp) {
         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
         userUid = userCredential.user.uid; // Fix: Use userUid variable
         await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userUid), {
           uid: userUid,
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

         // Send welcome email if enabled (Optional, based on your previous features)
         if (typeof sendCustomEmail === 'function') {
             await sendCustomEmail('welcome', {
                name: name,
                email: email,
                message: 'Welcome to the SwiftNet family! Your application is under review.'
             });
         }

      } else {
         // 1. Authenticate
         const userCredential = await signInWithEmailAndPassword(auth, email, password);
         userUid = userCredential.user.uid;

         // 2. Check Maintenance Mode
         const configRef = doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'main_settings');
         const configSnap = await getDoc(configRef);
         
         if (configSnap.exists() && configSnap.data().maintenanceMode) {
             // 3. Check User Role
             const userRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userUid);
             const userSnap = await getDoc(userRef);
             
             // If user is NOT admin, kick them out with YOUR CUSTOM MESSAGE
             if (userSnap.exists() && userSnap.data().role !== 'admin') {
                 await signOut(auth);
                 throw new Error("⚠️ SYSTEM UNDER MAINTENANCE, A NEW FEATURE WILL BE DEPLOYED SOON, PLEASE TRY AGAIN LATER. ⚠️");
             }
         }
      }
    } catch (err) {
      console.error(err);
      
      // THIS IS THE NEW LINE THAT MAKES IT POP UP
      alert(err.message); 
      
      setError(err.message);
      // Force logout if error occurred after auth but before validation
      if (auth.currentUser) await signOut(auth);
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
     e.preventDefault();
     if (!recoveryEmail) return;
     setRecoveryLoading(true);
     try {
        // FIX: Directly ask Auth to send email (Bypassing database permission check)
        await sendPasswordResetEmail(auth, recoveryEmail);
        
        alert("If this email is registered, you will receive a password reset link shortly.");
        setShowForgot(false);
        setRecoveryEmail('');
     } catch(e) { 
        console.error(e);
        // Even if user not found, Firebase might throw an error we can catch
        if (e.code === 'auth/user-not-found') {
            alert("This email is not registered in our system.");
        } else {
            alert("Error: " + e.message); 
        }
     }
     setRecoveryLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg shadow-blue-500/40 mb-4">
              <Wifi className="h-8 w-8 text-white" />
           </div>
           <h2 className="text-3xl font-black text-white tracking-tight">SwiftNet<span className="text-blue-400">ISP</span></h2>
           <p className="text-slate-400 mt-2 text-sm">Experience the speed of light.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           {isSignUp && (
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 ml-1 uppercase">Full Name</label>
                <input type="text" required className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
             </div>
           )}
           <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 ml-1 uppercase">Email Address</label>
              <input type="email" required className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@swiftnet.com" />
           </div>
           <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 ml-1 uppercase">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
           </div>

           {error && <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}

           <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Access Portal')}
           </button>
        </form>

        <div className="mt-6 text-center space-y-3">
           {!isSignUp && <button onClick={() => setShowForgot(true)} className="text-sm text-slate-400 hover:text-white transition-colors">Forgot Password?</button>}
           <div className="pt-4 border-t border-white/10">
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-slate-300 hover:text-white transition-colors">
                 {isSignUp ? 'Already a subscriber? Sign In' : "Don't have an account? Apply Now"}
              </button>
           </div>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-slate-900 border border-white/20 w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in zoom-in-95">
              <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
              <p className="text-slate-400 text-sm mb-4">We will send a recovery link to your email.</p>
              <input type="email" value={recoveryEmail} onChange={e=>setRecoveryEmail(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white mb-4 outline-none" placeholder="Enter email" />
              <div className="flex gap-2 justify-end">
                 <button onClick={()=>setShowForgot(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
                 <button onClick={handleForgotPassword} disabled={recoveryLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">{recoveryLoading ? 'Sending...' : 'Send Link'}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const DigitalID = ({ user }) => {
  const handleDownloadID = async () => {
    const element = document.getElementById('digital-id-card');
    try {
        await new Promise(r => setTimeout(r, 100));
        const canvas = await html2canvas(element, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 55, 50, 100, 60); 
        pdf.save(`SwiftNet_ID_${user.accountNumber}.pdf`);
    } catch (e) {
        alert("Error downloading ID");
    }
  };

  // Generate QR based on Account Number (or UID if Account # is pending)
  const qrData = user.accountNumber !== 'PENDING' ? user.accountNumber : user.uid;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&bgcolor=ffffff`;

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Digital Member ID</h2>
            
            {/* THE ID CARD */}
            <div id="digital-id-card" className="relative w-[400px] h-[240px] rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-500 group">
                
                {/* Background Design */}
                <div className="absolute inset-0 bg-slate-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900"></div>
                    {/* Animated shine effect */}
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-md">
                                <Wifi size={20} className="text-white"/>
                            </div>
                            <div>
                                <span className="font-bold tracking-widest text-lg block leading-none">SwiftNet</span>
                                <span className="text-[8px] uppercase tracking-[0.2em] text-blue-200">Fiber Internet</span>
                            </div>
                        </div>
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-500 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                            {user.plan || 'Subscriber'}
                        </span>
                    </div>

                    <div className="flex flex-row items-center justify-between gap-4 mt-2">
                        {/* Chip & Details */}
                        <div className="space-y-4">
                            <div className="w-10 h-8 bg-gradient-to-tr from-yellow-200 to-yellow-500 rounded-md shadow-inner opacity-90 border border-yellow-600/30"></div> 
                            <div>
                                <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Account Number</p>
                                <p className="font-mono text-lg tracking-widest text-blue-100 shadow-black drop-shadow-sm">
                                    {user.accountNumber}
                                </p>
                            </div>
                        </div>

                        {/* REAL QR CODE */}
                        <div className="bg-white p-1.5 rounded-xl shadow-lg">
                            <img 
                                src={qrUrl} 
                                alt="ID QR" 
                                className="w-20 h-20 object-contain rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="mt-1">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Subscriber Name</p>
                        <p className="font-bold text-lg tracking-wide uppercase truncate">{user.username}</p>
                    </div>
                </div>
            </div>

            <p className="text-slate-500 text-sm mt-6 text-center max-w-sm">
                This QR code contains your unique <strong>Account Number</strong>. Show this to the admin for quick scanning during payments or repairs.
            </p>

            <button 
                onClick={handleDownloadID}
                className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg"
            >
                <Download size={18}/> Download ID Card
            </button>
        </div>
    </div>
  );
};

// --- [FEATURE 1] AI PAYMENT OCR COMPONENT ---
const PaymentProofModal = ({ user, onClose, db, appId }) => {
  const [refNumber, setRefNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('GCash');
  const [preview, setPreview] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false); // New Scanning State
  const [ocrStatus, setOcrStatus] = useState(''); // Text feedback

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setScanning(true);
    setOcrStatus("Initializing AI Scanner...");

    // 2. Compress Image Logic (Existing)
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Increased slightly for better OCR
        const scaleSize = MAX_WIDTH / img.width;
        
        if (img.width > MAX_WIDTH) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
        } else {
            canvas.width = img.width;
            canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Save compressed for upload
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setBase64Image(compressedBase64);

        // 3. START AI SCANNING (Tesseract)
        runOCR(compressedBase64);
      };
    };
    reader.readAsDataURL(file);
  };

  const runOCR = async (imageSrc) => {
    setOcrStatus("Reading Receipt Details...");
    try {
      const result = await Tesseract.recognize(
        imageSrc,
        'eng',
        { logger: m => {
            if(m.status === 'recognizing text') setOcrStatus(`Scanning... ${(m.progress * 100).toFixed(0)}%`);
          } 
        }
      );

      const text = result.data.text;
      console.log("OCR Result:", text); // For debugging

      // --- SMART REGEX FOR GCASH / MAYA ---
      // Look for Reference Numbers (Usually 8-13 digits)
      const refMatch = text.match(/(Ref|Reference|No\.|Trans ID)[\s:.]*([0-9]{8,15})/i);
      
      // Look for Amounts (P 1,500.00 or 1500.00)
      // Matches "P 100", "Amount 100.00", "Total 100"
      const amountMatch = text.match(/(Amount|Total|Paid|P)[\s:.]*P?[\s]*([\d,]+\.\d{2})/i);

      if (refMatch && refMatch[2]) {
        setRefNumber(refMatch[2]);
        setOcrStatus("✅ Reference Found!");
      } else {
        setOcrStatus("⚠️ Could not read Ref No. Please type manually.");
      }

      if (amountMatch && amountMatch[2]) {
        // Remove commas for the number input
        const cleanAmount = amountMatch[2].replace(/,/g, '');
        setAmount(cleanAmount);
      }

      setScanning(false);

    } catch (err) {
      console.error(err);
      setScanning(false);
      setOcrStatus("Manual entry required.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !refNumber) return alert("Please fill in all fields.");
    if (!base64Image) return alert("Please wait for image processing.");
    
    setLoading(true);
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), {
            userId: user.uid,
            username: user.username,
            refNumber: refNumber,
            amount: parseFloat(amount),
            method: method,
            date: new Date().toISOString(),
            status: 'pending_approval',
            proofImage: base64Image
        });
        alert("Proof submitted successfully!");
        onClose();
    } catch(e) { alert("Error: " + e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
        <div className="bg-white w-[95%] md:w-full max-w-md rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <UploadCloud size={20} className="text-blue-600"/> Upload Payment Proof
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-1">
                {/* Method Selection */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Payment Method</label>
                    <div className="flex gap-2">
                        {['GCash', 'Maya', 'Bank'].map(m => (
                            <button type="button" key={m} onClick={() => setMethod(m)} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${method === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 relative overflow-hidden transition-colors">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" onChange={handleFileChange} />
                    {preview ? (
                        <div className="relative">
                            <img src={preview} alt="Preview" className="mx-auto h-40 object-contain rounded-lg shadow-sm" />
                            {scanning && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg">
                                    <div className="animate-spin text-white mb-2"><Bot size={24}/></div>
                                    <p className="text-white text-xs font-bold animate-pulse">AI Scanning...</p>
                                </div>
                            )}
                            <p className={`text-xs font-bold mt-2 ${scanning ? 'text-blue-500' : 'text-green-600'}`}>
                                {scanning ? ocrStatus : ocrStatus || "Image Ready"}
                            </p>
                        </div>
                    ) : (
                        <div className="py-4">
                            <div className="mx-auto bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center text-blue-500 mb-2"><Image size={24}/></div>
                            <p className="text-sm font-bold text-slate-600 px-4">Tap to attach screenshot</p>
                            <p className="text-[10px] text-slate-400 mt-1">Our AI will read the details for you</p>
                        </div>
                    )}
                </div>

                {/* Fields (Auto-filled) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Amount Paid</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₱</span>
                            <input type="number" required className={`w-full border p-2 pl-7 rounded-lg font-bold ${amount ? 'bg-green-50 border-green-200 text-green-700' : ''}`} placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Ref No.</label>
                        <input 
                          type="text" 
                          required 
                          className={`w-full border p-2 rounded-lg font-mono ${refNumber ? 'bg-green-50 border-green-200 text-green-700' : ''}`} 
                          placeholder="e.g. 100234" 
                          value={refNumber} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) {
                              setRefNumber(val);
                            } else {
                              alert("Please enter only a number that matches the reference number on your proof of payment.");
                            }
                          }} 
                        />
                    </div>
                </div>

                <button disabled={loading || scanning} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
                    {loading ? <RefreshCw className="animate-spin" size={18}/> : <CheckCircle size={18}/>}
                    {loading ? 'Sending...' : 'Submit Proof'}
                </button>
            </form>
            <button onClick={onClose} className="w-full mt-2 text-slate-400 text-xs font-bold hover:text-slate-600">Cancel</button>
        </div>
    </div>
  );
};

const ServiceContractModal = ({ user, onClose, db, appId }) => {
  const sigCanvas = React.useRef({});
  const [loading, setLoading] = useState(false);

  const clear = () => sigCanvas.current.clear();

  const handleSign = async () => {
    if (sigCanvas.current.isEmpty()) return alert("Please sign the contract.");
    
    setLoading(true);
    const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    
    try {
        const docPDF = new jsPDF();
        
        docPDF.setFontSize(20);
        docPDF.setFont("helvetica", "bold");
        docPDF.text("SWIFTNET SERVICE AGREEMENT", 105, 20, null, null, "center");
        
        docPDF.setFontSize(10);
        docPDF.setFont("helvetica", "normal");
        const text = `
        This Agreement is made between SwiftNet ISP (Provider) and ${user.username} (Subscriber).

        1. SERVICE: The Provider agrees to supply fiber internet connection speed of ${user.plan || 'Standard Plan'} to the address: ${user.address || 'Registered Address'}.
        
        2. PAYMENT: The Subscriber agrees to pay the monthly fee on or before the due date. Failure to pay may result in disconnection.
        
        3. LOCK-IN PERIOD: This contract has a minimum lock-in period of 24 months. Pre-termination fees apply.
        
        4. USAGE: Illegal activities, hacking, or reselling of bandwidth is strictly prohibited.

        I, the undersigned, acknowledge that I have read and understood the terms and conditions.
        `;
        
        const splitText = docPDF.splitTextToSize(text, 180);
        docPDF.text(splitText, 15, 40);

        docPDF.text("Signed by:", 15, 120);
        docPDF.addImage(signatureData, 'PNG', 15, 125, 60, 30);
        
        docPDF.text("Date Signed:", 100, 120);
        docPDF.text(new Date().toLocaleDateString(), 100, 130);

        docPDF.save(`Contract_${user.username}.pdf`);

        // Save status to DB (saving signature as text string for spark plan compatibility)
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.id), {
            contractSigned: true,
            contractDate: new Date().toISOString(),
            signature: signatureData 
        });

        // Add to Documents list
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', INVOICES_COLLECTION), {
            userId: user.id,
            title: `Service Contract (Signed)`,
            date: new Date().toISOString(),
            type: 'Contract',
            amount: '0.00',
            status: 'Signed'
        });

        alert("Contract Signed & Saved!");
        onClose();

    } catch (e) {
        alert("Error saving contract: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
        <div className="bg-white w-[95%] md:w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg flex items-center gap-2"><FileSignature size={20}/> Sign Contract</h3>
                <button onClick={onClose}><X className="text-slate-400 hover:text-white"/></button>
            </div>

            <div className="p-6 overflow-y-auto">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600 mb-6 h-40 overflow-y-scroll">
                    <p className="font-bold mb-2 text-slate-800">TERMS AND CONDITIONS</p>
                    <p className="mb-2">1. The Subscriber shall pay the monthly service fee on time.</p>
                    <p className="mb-2">2. The Provider guarantees 80% service reliability.</p>
                    <p className="mb-2">3. Contract lock-in period is 24 months.</p>
                    <p className="mb-2">4. Equipment (Modem/ONU) remains property of SwiftNet.</p>
                    <p>5. Any illegal use of the connection voids this contract.</p>
                </div>

                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Sign Below (Use finger or mouse)</p>
                <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white hover:border-blue-400 transition-colors">
                    <SignatureCanvas 
                        penColor='black'
                        canvasProps={{width: 450, height: 150, className: 'sigCanvas'}}
                        ref={sigCanvas}
                    />
                </div>
                <button onClick={clear} className="text-xs text-red-500 font-bold mt-2 hover:underline">Clear Signature</button>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                <button onClick={handleSign} disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Signing...' : 'Sign & Accept'}
                </button>
            </div>
        </div>
    </div>
  );
};

const KYCModal = ({ user, onClose, db, appId }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [idType, setIdType] = useState('National ID');
  const [loading, setLoading] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false); // New state to track processing

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 1. Set Preview immediately
    setPreview(URL.createObjectURL(file));
    setIsImageReady(false); // Reset ready state
    
    const reader = new FileReader();

    // 2. DEFINE the listener FIRST (Fixes the bug)
    reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 600; 
            const scaleSize = MAX_WIDTH / img.width;
            
            // Calculate new dimensions (keeping aspect ratio)
            if (img.width > MAX_WIDTH) {
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
            } else {
                canvas.width = img.width;
                canvas.height = img.height;
            }

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 3. Set the state with the compressed image
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            setBase64Image(compressedBase64);
            setIsImageReady(true); // Mark as ready
        };
    };

    // 3. EXECUTE the read LAST
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!base64Image) return alert("Please wait for the image to process or upload again.");
    setLoading(true);

    try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.id), {
            kycStatus: 'pending',
            kycType: idType,
            kycImage: base64Image,
            kycDate: new Date().toISOString()
        });
        alert("ID Submitted! Admin will review it shortly.");
        onClose();
    } catch (e) {
        alert("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
        <div className="bg-white w-[95%] md:w-full max-w-md rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={24} className="text-blue-600"/> Verify Identity
                </h3>
                <button onClick={onClose}><X size={20} className="text-slate-400"/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-1">
                <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-700 border border-blue-100">
                    To prevent fraud, please upload a clear photo of a valid Government ID.
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ID Type</label>
                    <select className="w-full border p-3 rounded-xl bg-slate-50 text-slate-700" value={idType} onChange={e => setIdType(e.target.value)}>
                        <option>National ID</option>
                        <option>Driver's License</option>
                        <option>Passport</option>
                        <option>UMID</option>
                        <option>Postal ID</option>
                        <option>Voter's ID</option>
                    </select>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl h-48 flex flex-col items-center justify-center hover:bg-slate-50 relative overflow-hidden cursor-pointer transition-colors">
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                      {preview ? (
                          <div className="relative w-full h-full">
                            <img src={preview} className="w-full h-full object-contain" alt="ID Preview" />
                            {/* Visual indicator that processing is done */}
                            {isImageReady && <div className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow">Ready</div>}
                          </div>
                      ) : (
                          <div className="text-center">
                             <Fingerprint size={48} className="text-slate-300 mb-2 mx-auto"/>
                             <p className="text-sm font-bold text-slate-500">Tap to upload ID photo</p>
                          </div>
                      )}
                </div>

                <button disabled={loading || (preview && !isImageReady)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400">
                    {loading ? 'Encrypting & Sending...' : (preview && !isImageReady) ? 'Processing Image...' : 'Submit Verification'}
                </button>
            </form>
        </div>
    </div>
  );
};

const SwiftWallet = ({ user, db, appId }) => {
  const [transferEmail, setTransferEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), 
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user, db, appId]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferEmail || !amount) return;
    const transferVal = parseFloat(amount);
    if (transferVal > (user.walletCredits || 0)) return alert("Insufficient balance.");

    setLoading(true);
    try {
        const usersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME);
        const q = query(usersRef, where('email', '==', transferEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Recipient email not found.");
            setLoading(false);
            return;
        }

        const recipient = querySnapshot.docs[0];
        
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.id), {
            walletCredits: (user.walletCredits || 0) - transferVal
        });

        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, recipient.id), {
            walletCredits: (recipient.data().walletCredits || 0) + transferVal
        });

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), {
            userId: user.uid,
            username: user.username,
            amount: -transferVal, 
            type: 'Transfer Sent',
            refNumber: `TR-${Math.floor(Math.random()*999999)}`,
            date: new Date().toISOString(),
            status: 'verified'
        });

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), {
            userId: recipient.id,
            username: recipient.data().username,
            amount: transferVal, 
            type: 'Transfer Received',
            refNumber: `TR-${Math.floor(Math.random()*999999)}`,
            date: new Date().toISOString(),
            status: 'verified'
        });

        alert("Transfer Successful!");
        setTransferEmail('');
        setAmount('');
    } catch(e) {
        alert("Transfer failed: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                        <Wallet size={32} className="text-white" />
                    </div>
                    <div className="text-right">
                        <p className="text-emerald-100 font-bold uppercase text-xs tracking-widest mb-1">Current Balance</p>
                        <h2 className="text-5xl font-black tracking-tight">₱{(user.walletCredits || 0).toLocaleString()}</h2>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ArrowRightLeft className="text-emerald-600" size={20}/> Pasaload (Transfer)
                </h3>
                <form onSubmit={handleTransfer} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Recipient Email</label>
                        <input required type="email" className="w-full border p-3 rounded-xl bg-slate-50 text-sm outline-none focus:border-emerald-500" placeholder="friend@swiftnet.com" value={transferEmail} onChange={e => setTransferEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Amount</label>
                        <input required type="number" className="w-full border p-3 rounded-xl bg-slate-50 text-sm outline-none focus:border-emerald-500" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <button disabled={loading} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-50">
                        {loading ? 'Processing...' : 'Send Credits'}
                    </button>
                </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <History className="text-slate-400" size={20}/> Wallet History
                    </h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2">
                    {history.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${item.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {item.amount > 0 ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-700">{item.type || 'Transaction'}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(item.date).toLocaleString()}</p>
                                </div>
                            </div>
                            <span className={`font-mono font-bold ${item.amount > 0 ? 'text-green-600' : 'text-slate-800'}`}>
                                {item.amount > 0 ? '+' : ''}₱{Math.abs(item.amount).toLocaleString()}
                            </span>
                        </div>
                    ))}
                    {history.length === 0 && <p className="text-center text-slate-400 text-sm py-10">No transactions yet.</p>}
                </div>
            </div>
        </div>
    </div>
  );
};

const NetworkStatusWidget = ({ db, appId }) => {
  const [status, setStatus] = useState({
    local: 'operational',
    upstream: 'operational',
    global: 'operational',
    message: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', STATUS_COLLECTION, 'main_status'), (doc) => {
        if (doc.exists()) setStatus(doc.data());
    });
    return () => unsub();
  }, [db, appId]);

  const StatusIndicator = ({ label, value, icon }) => {
      let color = 'bg-green-500';
      let text = 'Operational';
      let pulse = '';
      
      if (value === 'degradation') { color = 'bg-yellow-500'; text = 'Issues Detected'; }
      if (value === 'outage') { color = 'bg-red-600'; text = 'Service Outage'; pulse = 'animate-pulse'; }

      return (
        <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/40 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg text-slate-600 shadow-sm">{icon}</div>
                <div>
                    <p className="text-xs font-bold text-slate-600 uppercase">{label}</p>
                    <p className={`text-[10px] font-bold ${value === 'operational' ? 'text-green-700' : value === 'degradation' ? 'text-yellow-700' : 'text-red-700'}`}>
                        {text}
                    </p>
                </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${color} ${pulse} shadow-lg`}></div>
        </div>
      );
  };

  return (
    <div className="space-y-4 mb-6 animate-in slide-in-from-top-4">
        {status.message && (
            <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
                <AlertTriangle size={20} className="shrink-0"/>
                <p className="text-xs font-bold">{status.message}</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusIndicator label="SwiftNet Network" value={status.local} icon={<Server size={16}/>} />
            <StatusIndicator label="Upstream (ISP)" value={status.upstream} icon={<Globe size={16}/>} />
            <StatusIndicator label="Global Services" value={status.global} icon={<Activity size={16}/>} />
        </div>
    </div>
  );
};

const SmartDiagnostics = ({ user, db, appId, onTicketCreate }) => {
  const [stage, setStage] = useState('start'); 
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (text) => setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), text }]);

  const handleStart = () => {
    setStage('checking');
    setLogs([]);
    addLog("Initializing Router Diagnostic...");
    
    setTimeout(() => {
        addLog("Checking Account Status... Active");
        
        if (user.balance > 0) {
            addLog("⚠️ Alert: Service Restricted due to Balance.");
            setTimeout(() => setStage('billing_issue'), 1000);
        } else {
            setTimeout(() => setStage('modem_check'), 1500);
        }
    }, 1500);
  };

  const handleLightIssue = (lightName) => {
      if (lightName === 'wireless') {
          // WIRELESS light is OFF -> WiFi Radio is broken/off
          addLog("⚠️ Issue: WiFi Signal is Missing.");
          addLog("Diagnosis: Router WiFi radio is disabled or broken.");
          setStage('wifi_issue');
      } else if (lightName === 'internet') {
          // INTERNET light is OFF -> Connection to Tower is lost
          addLog("❌ Critical: No Internet Connection Detected.");
          addLog("Diagnosis: Cable from antenna disconnected or Tower Signal lost.");
          setStage('no_internet');
      } else {
          // All Green
          addLog("✅ Device Indicators: Normal");
          setStage('restart');
      }
  };

  const handleRestartConfirm = () => {
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          setStage('final_check');
      }, 3000); 
  };

  const handleAutoFile = async (issueType) => {
      setLoading(true);
      const ticketId = Math.floor(100000 + Math.random() * 900000).toString();
      
      let subject = "Internet Issue";
      let priority = "Normal";
      
      if (issueType === 'signal_loss') { subject = "🔴 URGENT: Internet Light OFF (Signal Lost)"; priority = "High"; }
      if (issueType === 'wifi_radio') { subject = "Router Issue: No WiFi Signal"; priority = "Medium"; }
      if (issueType === 'slow') { subject = "Slow Internet Speed"; priority = "Low"; }

      const fullLog = logs.map(l => `[${l.time}] ${l.text}`).join('\n');

      try {
          // Hardcoded 'isp_tickets_v1' to ensure it hits the exact Admin collection
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_tickets_v1'), {
              ticketId,
              userId: user.uid,
              username: user.username,
              subject: subject,
              message: `AUTO-TECH DIAGNOSTIC REPORT:\n\n${fullLog}\n\nUser Issue: ${issueType}`,
              status: 'open',
              priority: priority,
              date: new Date().toISOString(),
              timestamp: Date.now(), // Helps with sorting
              isApplication: false,
              isPlanChange: false
          });
          
          alert(`Ticket #${ticketId} Auto-Filed Successfully! Check the 'Support' tab to see it.`);
          setStage('start'); 
      } catch (e) {
          console.error("Ticket File Error:", e);
          alert("Error filing ticket: " + e.message);
      }
      setLoading(false);
  };

  return (
    <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 text-slate-100 font-mono animate-in fade-in">
        {/* Terminal Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Router Diagnostics v3.0</div>
        </div>

        <div className="p-8 min-h-[400px] flex flex-col relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.95),rgba(17,24,39,0.95)),url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-50 pointer-events-none"></div>

            {stage === 'start' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                    <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
                        <Wifi size={48} className="text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Connection Troubleshooter</h3>
                    <p className="text-slate-400 max-w-md mb-8">Scan your router for WiFi broadcast or internet signal issues.</p>
                    <button onClick={handleStart} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                        <Activity size={18} /> Start Diagnostics
                    </button>
                </div>
            )}

            {stage === 'checking' && (
                <div className="flex-1 flex flex-col justify-end z-10">
                    <div className="space-y-2 font-mono text-sm">
                        {logs.map((log, i) => (
                            <div key={i} className="text-green-400 animate-in slide-in-from-left-2">
                                <span className="text-slate-500 mr-2">[{log.time}]</span>
                                {log.text}
                            </div>
                        ))}
                        <div className="text-blue-400 animate-pulse">_ Analyzing router status...</div>
                    </div>
                </div>
            )}

            {stage === 'billing_issue' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                    <div className="bg-red-500/20 p-4 rounded-full mb-4"><AlertCircle size={40} className="text-red-500" /></div>
                    <h3 className="text-xl font-bold text-white">Service Suspended</h3>
                    <p className="text-slate-400 mb-6">Your internet is restricted due to an unpaid balance.</p>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 w-full max-w-xs">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total Due</span>
                            <span className="text-green-400 font-bold">₱{user.balance?.toFixed(2)}</span>
                        </div>
                    </div>
                    <button onClick={() => window.location.reload()} className="text-white underline text-sm">Refresh Status</button>
                </div>
            )}

            {stage === 'modem_check' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center z-10 animate-in zoom-in-95">
                    <h3 className="text-xl font-bold text-white mb-2">Check Router Lights</h3>
                    <p className="text-slate-400 mb-8 text-sm">Look at your device. Are all 3 lights ON?</p>
                    
                    {/* VISUALIZER: POWER | WIFI | INTERNET */}
                    <div className="flex gap-6 mb-10 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                        {/* POWER */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_15px_#22c55e]"></div>
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider">POWER</span>
                        </div>
                        {/* WIRELESS (The user's WiFi) */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_#22c55e]"></div>
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider">WIRELESS</span>
                        </div>
                        {/* INTERNET (The link to ISP) */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_#22c55e]"></div>
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider">INTERNET</span>
                        </div>
                    </div>

                    <p className="text-slate-300 mb-4 font-bold">Which light is OFF or RED?</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                        <button onClick={() => handleLightIssue('wireless')} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white p-3 rounded-lg text-sm font-bold">
                            "WIRELESS" is OFF
                        </button>
                        <button onClick={() => handleLightIssue('internet')} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white p-3 rounded-lg text-sm font-bold">
                            "INTERNET" is OFF
                        </button>
                        <button onClick={() => handleLightIssue('none')} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg text-sm font-bold">
                            All Lights GREEN
                        </button>
                    </div>
                </div>
            )}

            {stage === 'wifi_issue' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                    <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
                        <Wifi size={32} className="text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">WiFi Radio Issue</h3>
                    <p className="text-slate-400 mb-6 max-w-sm text-sm">
                        The "Wireless" light is off. This means your router isn't broadcasting a signal for your phone to connect to.
                    </p>
                    <button disabled={loading} onClick={() => handleAutoFile('wifi_radio')} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold w-full max-w-sm flex items-center justify-center gap-2">
                        {loading ? 'Processing...' : 'Report Broken WiFi'}
                    </button>
                </div>
            )}

            {stage === 'no_internet' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <Globe size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Signal Lost to Tower</h3>
                    <p className="text-slate-400 mb-6 max-w-sm text-sm">
                        The "Internet" light is off. Check the black cable coming from the antenna outside. If it's plugged in, our tower signal might be blocked.
                    </p>
                    <button disabled={loading} onClick={() => handleAutoFile('signal_loss')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold w-full max-w-sm flex items-center justify-center gap-2">
                        {loading ? 'Processing...' : <><Hammer size={18}/> Report Signal Loss</>}
                    </button>
                </div>
            )}

            {stage === 'restart' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                    <RefreshCw size={40} className="text-blue-400 mb-4 animate-spin-slow" />
                    <h3 className="text-xl font-bold text-white">Refresh Connection</h3>
                    <p className="text-slate-400 mb-6 max-w-sm text-sm">
                        Your lights look okay. Please unplug the power adapter for 10 seconds, then plug it back in to refresh your IP.
                    </p>
                    <button onClick={handleRestartConfirm} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold">
                        I have restarted it
                    </button>
                </div>
            )}

            {stage === 'final_check' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                    <h3 className="text-xl font-bold text-white mb-4">Did that fix it?</h3>
                    <div className="flex gap-4">
                        <button onClick={() => setStage('start')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                            <CheckCircle size={18}/> Yes, It's Working!
                        </button>
                        <button onClick={() => handleAutoFile('slow')} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold">
                            No, still slow/broken
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};



// --- FEATURE 1: REFERRAL SYSTEM COMPONENT ---
const ReferralSystem = ({ user }) => {
  const [copied, setCopied] = useState(false);
  // Generate a code: First 3 letters of name + Last 4 of ID
  const referralCode = (user.username.slice(0,3) + user.uid.slice(-4)).toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black mb-1 flex items-center gap-2">
            <Gift className="animate-bounce" /> Invite & Earn
          </h3>
          <p className="text-pink-100 text-sm max-w-sm">
            Give friends <span className="font-bold text-white">₱100 off</span> their installation. You get <span className="font-bold text-white">₱100 bill credits</span> when they join!
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl flex items-center gap-3 border border-white/30">
          <div className="px-4 py-2 font-mono font-bold text-xl tracking-widest border-r border-white/30 border-dashed">
            {referralCode}
          </div>
          <button onClick={handleCopy} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Copy Code">
            {copied ? <CheckCircle size={20}/> : <Copy size={20}/>}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- FEATURE 3: FAMILY PLAN WIDGET ---
const FamilyPlanWidget = ({ user, db, appId }) => {
  const [email, setEmail] = useState('');
  
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    if (!confirm(`Send invitation to ${email} to join your Family Cluster?`)) return;
    
    // In a real app, this would send an email or create a notification
    alert(`Invitation sent to ${email}! Once they accept, you'll both get 5% off monthly.`);
    setEmail('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
      <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
        <UserPlus size={20} className="text-purple-600"/> Family & Neighbor Plan
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Link 3 accounts in your neighborhood to get a <span className="font-bold text-green-600">5% Discount</span> for everyone.
      </p>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
           <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">You</div>
           <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs border-2 border-white border-dashed"><Plus size={14}/></div>
           <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs border-2 border-white border-dashed"><Plus size={14}/></div>
        </div>
        <span className="text-xs text-slate-400 font-medium">2 slots open</span>
      </div>

      <form onSubmit={handleInvite} className="flex gap-2">
        <input 
          type="email" 
          placeholder="Neighbor's Email" 
          className="flex-1 border p-2 rounded-lg text-sm bg-slate-50 outline-none focus:border-purple-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button className="bg-purple-600 text-white px-3 py-2 rounded-lg font-bold text-xs hover:bg-purple-700">Invite</button>
      </form>
    </div>
  );
};

// --- FEATURE 4: STUDENT DISCOUNT VERIFICATION ---
// --- [FIXED] STUDENT PROMO MODAL ---
const StudentPromoModal = ({ onClose, user, db, appId }) => {
  const [preview, setPreview] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle Image Compression
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 600;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setBase64Image(canvas.toDataURL('image/jpeg', 0.6));
        };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!base64Image) return alert("Please upload your School ID.");
    setLoading(true);

    try {
        const ticketId = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save to Tickets Collection
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_tickets_v1'), {
            ticketId,
            userId: user.uid,
            username: user.username,
            subject: "Student Discount Application",
            message: "I am applying for the 10% Student Discount. Please verify my attached ID.",
            attachmentUrl: base64Image, // <--- SAVING THE IMAGE HERE
            status: 'open',
            date: new Date().toISOString(),
            isApplication: true
        });

        alert("Application Submitted! Ticket #" + ticketId + " created.");
        onClose();
    } catch (e) {
        console.error(e);
        alert("Error submitting: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600"/> Student Discount
          </h3>
          <button onClick={onClose}><X size={20} className="text-slate-400"/></button>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-800 mb-4 border border-blue-100">
          Students and Teachers get <strong>10% OFF</strong> monthly fees. Upload a valid School ID.
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-xl h-40 flex flex-col items-center justify-center bg-slate-50 hover:bg-white cursor-pointer relative overflow-hidden">
             <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
             {preview ? (
                <img src={preview} className="w-full h-full object-contain" alt="Preview"/>
             ) : (
                <div className="text-center text-slate-400">
                  <Upload size={24} className="mx-auto mb-1"/>
                  <span className="text-xs">Tap to upload ID</span>
                </div>
             )}
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Apply Discount'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- FEATURE 5: SWITCH & SAVE CALCULATOR ---
const SwitchCalculator = () => {
  const [currentBill, setCurrentBill] = useState(1699);
  const swiftNetPrice = 1499; // Assume comparable plan
  const yearlySavings = (currentBill - swiftNetPrice) * 12;

  return (
    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden border border-slate-700">
       <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
       <div className="relative z-10">
         <h3 className="text-2xl font-bold mb-2">Switch & Save Calculator</h3>
         <p className="text-slate-400 text-sm mb-6">See how much you save by switching to SwiftNet Fiber.</p>
         
         <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Your Current Monthly Bill (PLDT/Globe)</label>
              <div className="flex items-center gap-4">
                 <input 
                   type="range" min="1299" max="3500" step="100" 
                   value={currentBill} onChange={e => setCurrentBill(Number(e.target.value))}
                   className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                 />
                 <span className="font-mono font-bold text-xl w-20">₱{currentBill}</span>
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex justify-between items-center">
               <div>
                 <p className="text-xs text-slate-300">You could save</p>
                 <p className="text-3xl font-black text-green-400">₱{yearlySavings > 0 ? yearlySavings.toLocaleString() : 0}</p>
                 <p className="text-xs text-slate-300">per year with SwiftNet!</p>
               </div>
               <button className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-transform hover:scale-105">
                 Switch Now
               </button>
            </div>
         </div>
       </div>
    </div>
  );
};

// --- [FEATURE: MULTI-SITE BUSINESS DASHBOARD] ---
const BusinessDashboard = ({ user, db, appId, onPay }) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSite, setShowAddSite] = useState(false);
  const [newSite, setNewSite] = useState({ name: '', address: '', plan: 'Business Fiber 100' });

  // 1. Real Data Fetch: Find all accounts linked to this Business Owner
  useEffect(() => {
    const fetchSites = async () => {
        // Query users where 'linkedTo' equals the current user's UID
        // OR users where 'uid' is the current user (include self)
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'isp_users_v1'),
            where('linkedTo', '==', user.uid)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const linkedSites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Combined list: Self + Linked Accounts
            const allSites = [
                { ...user, isMaster: true, siteName: 'Main HQ' }, 
                ...linkedSites
            ];
            setSites(allSites);
            setLoading(false);
        });
        return () => unsubscribe();
    };
    fetchSites();
  }, [user, db, appId]);

  // 2. Aggregate Calculations
  const totalBalance = sites.reduce((acc, site) => acc + (site.balance || 0), 0);
  const activeSites = sites.filter(s => s.status === 'active').length;
  const issueSites = sites.filter(s => s.status !== 'active').length;

  // 3. Request New Branch Installation
  const handleRequestBranch = async (e) => {
      e.preventDefault();
      if(!newSite.address) return;
      
      const ticketId = Math.floor(Math.random() * 9000000).toString();
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_tickets_v1'), {
          ticketId,
          userId: user.uid,
          username: user.username,
          subject: `New Branch Request: ${newSite.name}`,
          message: `BUSINESS EXPANSION: Requesting new line for ${newSite.name} at ${newSite.address}. Plan: ${newSite.plan}. Please link to my master account (${user.accountNumber}).`,
          status: 'open',
          date: new Date().toISOString(),
          isApplication: true,
          targetPlan: newSite.plan,
          isBusinessExpansion: true // Special tag for Admins
      });
      alert(`Request Sent! Ticket #${ticketId}`);
      setShowAddSite(false);
  };

  // 4. Pay All Logic
  const handlePayAll = () => {
      // In a real scenario, this would loop through IDs or create a bulk payment record
      // For now, we direct them to pay the Main Account, and Admin distributes
      // OR we just summon the payment modal for the total amount
      alert("Please generate a specialized Payment QR for ₱" + totalBalance.toLocaleString());
      // Logic to trigger onPay would go here
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading Enterprise Data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-in fade-in">
        
        {/* Enterprise Header */}
        <div className="bg-slate-900 text-white pt-10 pb-24 px-6 md:px-10">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">{user.username} <span className="text-yellow-400">Enterprise</span></h1>
                    <p className="text-slate-400">Multi-Site Management Console</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowAddSite(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
                        <PlusCircle size={18}/> Add Branch
                    </button>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-16">
            
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-blue-500">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Balance Due</p>
                    <h2 className="text-3xl font-black text-slate-800 mt-1">₱{totalBalance.toLocaleString()}</h2>
                    {totalBalance > 0 && <button onClick={handlePayAll} className="mt-3 text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">Pay All Now &rarr;</button>}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500">
                    <p className="text-xs font-bold text-slate-400 uppercase">Online Sites</p>
                    <h2 className="text-3xl font-black text-green-600 mt-1">{activeSites}</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-red-500">
                    <p className="text-xs font-bold text-slate-400 uppercase">Offline / Issues</p>
                    <h2 className="text-3xl font-black text-red-600 mt-1">{issueSites}</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-purple-500">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Bandwidth</p>
                    {/* Sum of speeds logic or static value */}
                    <h2 className="text-3xl font-black text-purple-600 mt-1">{(sites.length * 100)} <span className="text-sm text-slate-400">Mbps</span></h2> 
                </div>
            </div>

            {/* Sites Grid */}
            <h3 className="font-bold text-slate-700 text-xl mb-4 flex items-center gap-2"><Briefcase size={20}/> Your Locations</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sites.map(site => (
                    <div key={site.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                        <div className={`w-full md:w-2 bg-${site.status === 'active' ? 'green' : 'red'}-500`}></div>
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-lg text-slate-800">{site.siteName || site.username} {site.isMaster && '(HQ)'}</h4>
                                    <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12}/> {site.address || 'Address not updated'}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${site.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {site.status}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Account No.</p>
                                    <p className="font-mono text-sm font-bold text-slate-700">{site.accountNumber}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Current Bill</p>
                                    <p className={`font-mono text-sm font-bold ${site.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        ₱{(site.balance || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button onClick={() => alert(`Switching view to ${site.siteName}... (Logic to swap dashboard context goes here)`)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-2 rounded-lg text-xs font-bold hover:bg-slate-50">
                                    Manage Site
                                </button>
                                {site.balance > 0 && (
                                    <button onClick={() => onPay(site.id, 'CASH-SITE', site.username)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700">
                                        Pay Bill
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Modal: Add New Branch */}
        {showAddSite && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                    <h3 className="text-xl font-bold mb-4">Add New Branch</h3>
                    <form onSubmit={handleRequestBranch} className="space-y-3">
                        <input className="w-full border p-3 rounded-lg" placeholder="Branch Name (e.g. Downtown Cafe)" value={newSite.name} onChange={e=>setNewSite({...newSite, name: e.target.value})} required/>
                        <input className="w-full border p-3 rounded-lg" placeholder="Full Installation Address" value={newSite.address} onChange={e=>setNewSite({...newSite, address: e.target.value})} required/>
                        <select className="w-full border p-3 rounded-lg" value={newSite.plan} onChange={e=>setNewSite({...newSite, plan: e.target.value})}>
                            <option>Business Fiber 100 (₱2,500)</option>
                            <option>Business Fiber 300 (₱3,500)</option>
                            <option>Enterprise Dedicated (Quote)</option>
                        </select>
                        <div className="flex gap-2 pt-2">
                            <button type="button" onClick={() => setShowAddSite(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                            <button className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Submit Request</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

// --- NEW COMPONENT: Community Sign Up M
const CommunitySignupModal = ({ onClose, db, appId, onLoginSuccess }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create Auth User using the global 'auth' object
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;

      // 2. Create Profile (Role: community_member)
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'isp_users_v1', uid), {
        uid: uid,
        username: formData.username,
        email: formData.email,
        role: 'community_member', // <--- SPECIAL ROLE
        status: 'active',         // Active immediately so they can login
        plan: null,               // No internet plan yet
        balance: 0,
        dateCreated: new Date().toISOString()
      });

      alert("Welcome to the Community! You can now post and comment.");
      if(onLoginSuccess) onLoginSuccess();
      onClose();

    } catch (error) {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 text-teal-600">
            <Users size={24}/>
          </div>
          <h3 className="font-bold text-xl text-slate-800">Join the Community</h3>
          <p className="text-slate-500 text-xs">Create a free account to post updates, buy & sell, and comment.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input className="w-full border p-3 rounded-xl text-sm" placeholder="Full Name (e.g. Juan Dela Cruz)" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} required/>
          <input className="w-full border p-3 rounded-xl text-sm" type="email" placeholder="Email Address" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required/>
          <input className="w-full border p-3 rounded-xl text-sm" type="password" placeholder="Create Password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required/>
          
          <button disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all">
            {loading ? 'Creating...' : 'Sign Up Free'}
          </button>
        </form>
        
        <p className="text-xs text-center text-slate-400 mt-4">
          Want internet? You can apply for a SwiftNet Fiber plan inside using this same account.
        </p>
      </div>
    </div>
  );
};


const LiveIPTV = () => {
  // Try using an embed-specific link if available
  const IPTV_SOURCE_URL = "https://iptv-two-delta.vercel.app/"; 

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 relative">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-1.5 rounded-lg"><Tv className="text-white" size={18} /></div>
            <span className="font-bold text-white text-sm">SwiftNet Live</span>
          </div>
        </div>
        <div className="aspect-video w-full bg-black">
          <iframe 
            src={IPTV_SOURCE_URL} 
            className="w-full h-full" 
            // Add these specific permissions to fix "Load Failed"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-same-origin allow-scripts allow-top-navigation"
            allowFullScreen 
          />
        </div>
      </div>
    </div>
  );
};

// 3. Subscriber Dashboard
const SubscriberDashboard = ({ userData, onPay, announcements, notifications, tickets, repairs, onConfirmRepair, outages, db, appId }) => {
  // --- STATE ---
  // Default tab logic: If they are just a community member, start on 'community' tab
  const [activeTab, setActiveTab] = useState(userData.role === 'community_member' ? 'community' : 'overview');
  const [showQR, setShowQR] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
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
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showContract, setShowContract] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [paymentQRUrl, setPaymentQRUrl] = useState(null);
  const [customModal, setCustomModal] = useState(null); 

  // --- LOGIC: DETERMINE USER TYPE ---
  const isCommunityMember = userData.role === 'community_member';
  // A "Pure Applicant" is someone who applied for internet immediately (not via community sign up)
  const isPureApplicant = userData.status === 'applicant' && userData.role === 'subscriber';

  // --- EFFECTS ---
  useEffect(() => {
    if (!userData?.id) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', INVOICES_COLLECTION), where('userId', '==', userData.id), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [userData]);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'payment_qr');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().image) {
          setPaymentQRUrl(docSnap.data().image);
        }
      } catch (e) { console.error("QR Fetch Error", e); }
    };
    fetchQR();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAvailablePlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // --- HANDLERS ---
  const handlePurchase = async (product) => {
    if (!confirm(`Request to order: ${product.name}? An agent will contact you.`)) return;
    try {
        const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString();
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), {
            ticketId, userId: userData.uid, username: userData.username, subject: `Order: ${product.name}`, message: `Customer wants to subscribe to promo: ${product.name} (${product.price}).`, status: 'open', adminReply: '', date: new Date().toISOString(), isOrder: true
        });
        await sendCustomEmail('order', { name: userData.username, email: userData.email, orderDetails: product.name, message: `We received your request for ${product.name}. A technician will contact you shortly.` });
        alert("Request sent! A ticket has been created.");
    } catch (e) { alert("Error sending request."); }
  };

  const handleWizardSubmit = async (addressData) => {
    try {
        const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString();
        const fullAddress = `${addressData.street}, ${addressData.barangay}, ${addressData.city}, ${addressData.province}`;
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userData.id), { plan: selectedPlanForApp.name, address: fullAddress, addressDetails: addressData, isSwitcher: addressData.isSwitcher || false });
        const promoNote = addressData.isSwitcher ? " [PROMO: SWITCHER - FREE INSTALLATION APPLIES]" : "";
        await sendCustomEmail('order', { name: userData.username, email: userData.email, orderDetails: selectedPlanForApp.name + promoNote, message: `We have received your application for ${selectedPlanForApp.name}. Ticket #${ticketId}. We will review your area coverage shortly.` });
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { ticketId, userId: userData.uid, username: userData.username, subject: 'New Subscription Application', message: `Applicant ${userData.username} (${userData.email}) has applied for the ${selectedPlanForApp.name} plan.\nAddress: ${fullAddress}\n\n${promoNote}`, status: 'open', adminReply: '', isApplication: true, targetUserId: userData.uid, targetPlan: selectedPlanForApp.name, date: new Date().toISOString() });
        setSelectedPlanForApp(null);
        alert(`Application submitted! Ticket #${ticketId}.`);
    } catch(e) { console.error(e); alert("Error submitting application"); }
  };

  const handlePaymentSubmit = async (e) => { e.preventDefault(); setSubmitting(true); await onPay(userData.id, refNumber, userData.username); setSubmitting(false); setShowQR(false); setRefNumber(''); };
  
  const handleCreateTicket = async (e) => { if(e) e.preventDefault(); if (!newTicket.subject || !newTicket.message) return; setTicketLoading(true); try { const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { ticketId, userId: userData.uid, username: userData.username, subject: newTicket.subject, message: newTicket.message, status: 'open', adminReply: '', date: new Date().toISOString() }); setNewTicket({ subject: '', message: '' }); await sendCustomEmail('auto_reply', { name: userData.username, email: userData.email, message: `We received your ticket #${ticketId}: "${newTicket.subject}". Our support team is reviewing it now.` }); alert(`Ticket #${ticketId} submitted successfully!`); setActiveTab('support'); } catch (error) { console.error("Error creating ticket", error); alert("Failed to submit request."); } setTicketLoading(false); };
  
  const handleFollowUpTicket = async (ticketId, originalMessage) => { if(!followUpText) return; try { const docRef = doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticketId); const timestamp = new Date().toLocaleString(); const newMessage = `${originalMessage}\n\n--- Follow-up by You (${timestamp}) ---\n${followUpText}`; await updateDoc(docRef, { message: newMessage, status: 'open', date: new Date().toISOString() }); setFollowingUpTo(null); setFollowUpText(''); alert("Follow-up sent successfully!"); } catch(e) { console.error(e); alert("Failed to send follow-up"); } };
  
  const handleRequestRepair = async (e) => { e.preventDefault(); if(!repairNote) return; try { const randomId = Math.floor(Math.random() * 10000000000).toString().padStart(11, '0'); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), { requestId: randomId, userId: userData.uid, username: userData.username, address: userData.address || "No address provided", type: 'Service Repair - Internet', notes: repairNote, status: 'Submission', stepIndex: 0, technicianNote: 'Waiting for initial evaluation.', dateFiled: new Date().toISOString() }); setRepairNote(''); setShowRepairModal(false); alert("Repair request filed successfully!"); } catch(e) { console.error(e); alert("Failed to request repair."); } };
  
  const handleApplyPlan = (planName) => { if(confirm(`Apply for ${planName}?`)) { const msg = `Requesting plan change.\n\nCurrent: ${userData.plan}\nNew: ${planName}`; const submitPlanTicket = async () => { setTicketLoading(true); try { const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { ticketId, userId: userData.uid, username: userData.username, subject: 'Plan Change Request', message: msg, status: 'open', adminReply: '', date: new Date().toISOString(), isPlanChange: true, targetPlan: planName }); alert(`Application submitted! Ticket #${ticketId}.`); setActiveTab('support'); } catch(e) { alert("Failed."); } setTicketLoading(false); }; submitPlanTicket(); } };
  
  const handleUpdatePassword = async (e) => { e.preventDefault(); if (managePass.length < 6) return alert("Min 6 chars."); setUpdatingCreds(true); try { await updatePassword(auth.currentUser, managePass); setManagePass(''); alert("Password updated!"); } catch (error) { if (error.code === 'auth/requires-recent-login') alert("Please re-login."); else alert("Error: " + error.message); } setUpdatingCreds(false); };
  
  const handleUpdateEmail = async (e) => { e.preventDefault(); if (!manageEmail) return; setUpdatingCreds(true); try { await updateEmail(auth.currentUser, manageEmail); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userData.id), { email: manageEmail }); setManageEmail(''); alert("Email updated!"); } catch (error) { if (error.code === 'auth/requires-recent-login') alert("Please re-login."); else alert("Error: " + error.message); } setUpdatingCreds(false); };

  // --- NEW HANDLER: Upgrade from Community to Internet ---
  const handleUpgrade = async (plan) => {
      if(!confirm(`Apply for ${plan.name}? We will review your application.`)) return;
      
      // Update User Doc with Plan (Status remains active, but they become an 'applicant' for internet effectively)
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'isp_users_v1', userData.id), {
          plan: plan.name,
          applicationDate: new Date().toISOString(),
      });

      // Create Ticket for Admin to Approve & Assign Account No.
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_tickets_v1'), {
          ticketId: Math.floor(Math.random() * 900000).toString(),
          userId: userData.uid,
          username: userData.username,
          subject: "Existing Community Member Applying for Internet",
          message: `User ${userData.username} (Community Account) wants to upgrade to ${plan.name}. Please approve and assign Account Number.`,
          status: 'open',
          date: new Date().toISOString(),
          isApplication: true,
          targetPlan: plan.name,
          targetUserId: userData.uid 
      });
      alert("Application Sent! You can continue using the Community features while we process your internet line.");
  };

  const getIcon = (type) => { switch(type) { case 'warning': return <AlertCircle size={18} />; case 'success': return <CheckCircle size={18} />; default: return <Megaphone size={18} />; } };
  const getBgColor = (type) => { switch(type) { case 'warning': return 'bg-orange-50 text-orange-600'; case 'success': return 'bg-green-50 text-green-600'; default: return 'bg-blue-50 text-blue-600'; } };

  if (!userData) return <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500"><div className="animate-spin mb-4"><RefreshCw /></div><p>Loading your account details...</p></div>;

  const isOverdue = userData.status === 'overdue' || userData.status === 'disconnected';
  const allAlerts = [ ...(announcements || []).map(a => ({ ...a, isPublic: true })), ...(notifications || []).map(n => ({ ...n, isPublic: false })) ].sort((a, b) => new Date(b.date) - new Date(a.date));
  const activeRepairs = (repairs || []).filter(r => r.status !== 'Completed');
  const historyRepairs = (repairs || []).filter(r => r.status === 'Completed');

  // --- APPLICANT VIEW (BLOCKING) ---
  // Only block if they are a Pure Applicant. Community Members bypass this.
  if (isPureApplicant || (userData.accountNumber === 'PENDING' && !isCommunityMember)) {
      return (
        <div className="w-full py-12 animate-in fade-in">
           <div className="text-center mb-12"><h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to SwiftNet!</h1><p className="text-slate-500">To get started, please select an internet plan below.</p></div>
           {userData.plan ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl max-w-xl mx-auto shadow-sm"><div className="flex items-center gap-4"><Hourglass size={32} className="text-yellow-600" /><div><h3 className="text-lg font-bold text-yellow-800">Application Pending</h3><p className="text-yellow-700">You have applied for the <strong>{userData.plan}</strong>. An administrator will review your request.</p></div></div></div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{availablePlans.map(plan => (<div key={plan.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-slate-100 overflow-hidden flex flex-col"><div className="p-6 bg-gradient-to-br from-slate-50 to-white flex-grow"><h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3><div className="flex items-center gap-2 mb-4"><Zap size={18} className="text-yellow-500" /><span className="text-sm text-slate-500">High Speed Internet</span></div><ul className="space-y-2 mb-6"><li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Unlimited Data</li><li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Fiber Optic</li></ul></div><div className="p-4 bg-slate-50 border-t border-slate-100"><button onClick={() => setSelectedPlanForApp(plan)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">Apply Now <ArrowRight size={16} /></button></div></div>))}{availablePlans.length === 0 && <p className="col-span-full text-center text-slate-400">No plans configured by admin yet.</p>}</div>
           )}
           <div className="mt-12 text-center"><button onClick={() => signOut(getAuth(app))} className="text-slate-400 hover:text-slate-600 text-sm underline">Sign Out</button></div>
           {selectedPlanForApp && (<ApplicationWizard plan={selectedPlanForApp} onClose={() => setSelectedPlanForApp(null)} onSubmit={handleWizardSubmit} db={db} appId={appId} />)}
        </div>
      );
  }

  // --- DYNAMIC TABS LIST ---
  const tabs = isCommunityMember 
    ? ['community', 'plans', 'shop', 'settings']
    : ['overview', 'live', 'community', 'family', 'auto_tech', 'wallet', 'shop', 'my_id', 'repairs', 'plans', 'speedtest', 'documents', 'rewards', 'support', 'settings'];

  // --- SUBSCRIBER / COMMUNITY VIEW ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      
      {/* TABS MENU */}
      <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit mx-auto mb-6 overflow-x-auto max-w-full">
        {tabs.map(tab => (
           <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
              {tab === 'community' ? <><Users size={16}/> Community</> : 
              tab === 'live' ? <><Tv size={16}/> Live TV</> :
               tab === 'speedtest' ? <><Gauge size={16}/> Speed Test</> : 
               tab === 'auto_tech' ? <><Zap size={16}/> Auto-Tech</> : 
               tab === 'wallet' ? <><Wallet size={16}/> Wallet</> : 
               tab === 'shop' ? <><ShoppingBag size={16}/> Shop</> : 
               tab === 'my_id' ? <><CreditCard size={16}/> My ID</> : 
               tab === 'repairs' ? <><Wrench size={16}/> Repairs</> : 
               tab === 'plans' ? (isCommunityMember ? <><Wifi size={16}/> Get Internet</> : <><Globe size={16}/> Plans</>) : 
               tab === 'documents' ? <><FileText size={16}/> Documents</> : 
               tab === 'rewards' ? <><Gift size={16}/> Rewards</> : 
               tab === 'settings' ? <><UserCog size={16}/> Settings</> : tab}
           </button>
        ))}
      </div>

      {/* --- CONTENT TABS --- */}
      
      {/* 1. COMMUNITY TAB */}
      {activeTab === 'community' && (
         <CommunityPage 
            onNavigate={() => {}} 
            onLogin={() => {}} 
            db={db} 
            appId={appId}
            user={userData} 
         />
      )}

      {/* 2. PLANS TAB (Modified for Community Members) */}
      {activeTab === 'plans' && (
          <div className="space-y-6">
             {isCommunityMember ? (
               <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg mb-6">
                  <h2 className="text-2xl font-bold">Upgrade to Fiber Internet</h2>
                  <p>You are currently a Community Member. Choose a plan to activate your home internet.</p>
               </div>
             ) : (
               <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-800">Available Internet Plans</h2><span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">Current: {userData.plan}</span></div>
             )}
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePlans.map((plan) => (
                   <div key={plan.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 overflow-hidden flex flex-col">
                      <div className="p-6 bg-gradient-to-br from-slate-50 to-white flex-grow">
                          <h3 className="text-lg font-bold text-slate-800 mb-2">{plan.name}</h3>
                          <div className="flex items-center gap-2 mb-4"><Zap size={18} className="text-yellow-500" /><span className="text-sm text-slate-500">High Speed Internet</span></div>
                          <ul className="space-y-2 mb-6"><li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Unlimited Data</li></ul>
                      </div>
                      <div className="p-4 bg-slate-50 border-t border-slate-100">
                          <button 
                            onClick={() => isCommunityMember ? handleUpgrade(plan) : handleApplyPlan(plan.name)} 
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                            {isCommunityMember ? 'Apply for This Plan' : 'Request Change'} <ArrowRight size={16} />
                          </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
      )}

      {/* 3. OVERVIEW TAB (Full Subscribers Only) */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <FlashPromoBanner user={userData} db={db} appId={appId} />
          <ReferralSystem user={userData} />
          
          <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-slate-700">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">Limited Offer</div>
                <h3 className="text-2xl font-bold text-white mb-1">Secure Your Home with SwiftCam</h3>
                <p className="text-slate-400 text-sm max-w-md">Get 2 HD CCTV Cameras installed + Mobile App Access. Add to your plan for only <span className="text-white font-bold">₱300/mo</span>.</p>
             </div>
             <button onClick={() => handlePurchase({name: 'CCTV Bundle (2 Cameras)', price: '300/mo or 2500 Cash', id: 'promo_cctv'})} className="relative z-10 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                <ShieldCheck size={18}/> Get Protected
             </button>
          </div>

          <MaintenanceBanner db={db} appId={appId} />
          <NetworkStatusWidget db={db} appId={appId} />
          <RemoteAccessSubscriber user={userData} db={db} appId={appId} />
          
           
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 shadow-2xl">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-40"></div>
             <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-40"></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div><h2 className="text-3xl font-bold mb-2">Hello, {userData.username} 👋</h2><p className="text-slate-400">Welcome back to your SwiftNet portal.</p></div>
                <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${userData.status === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                   <div className={`w-2 h-2 rounded-full ${userData.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                   <span className="text-xs font-bold uppercase tracking-widest">{userData.status}</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 shadow-xl border border-white/40 bg-white/60 backdrop-blur-xl transition-all hover:shadow-2xl group">
                <div className="flex justify-between items-start mb-8">
                    <div><p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Total Balance Due</p><h3 className={`text-5xl font-black tracking-tight ${userData.balance > 0 ? 'text-slate-800' : 'text-green-600'}`}>₱{userData.balance?.toFixed(2)}</h3></div>
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform duration-300"><CreditCard size={32} /></div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full bg-white/50 rounded-2xl p-4 border border-white/50"><p className="text-xs text-slate-400 font-bold uppercase mb-1">Due Date</p><p className={`font-bold text-lg ${isOverdue ? 'text-red-500' : 'text-slate-700'}`}>{new Date(userData.dueDate).toLocaleDateString(undefined, {month:'long', day:'numeric', year:'numeric'})}</p></div>
                    <div className="flex-1 w-full bg-white/50 rounded-2xl p-4 border border-white/50"><p className="text-xs text-slate-400 font-bold uppercase mb-1">Current Plan</p><p className="font-bold text-lg text-slate-700">{userData.plan}</p></div>
                </div>

                {userData.balance > 0 ? (
                    <>
                        <button onClick={() => setShowQR(true)} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3"><Smartphone size={20} /> Pay Now via QR</button>
                        <button onClick={() => setShowProofModal(true)} className="w-full mt-3 py-3 bg-white border-2 border-blue-100 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"><UploadCloud size={20}/> Upload Payment Receipt</button>
                    </>
                ) : (
                    <div className="mt-6 bg-green-100/50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold"><CheckCircle size={20} /> You are fully paid. Enjoy surfing!</div>
                )}
             </div>

             <div className="space-y-6">
                <EntertainmentWidget user={userData} db={db} appId={appId} />
                <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-xl h-fit">
                    <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-slate-700">Notifications</h3><div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{allAlerts.length} New</div></div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {allAlerts.length > 0 ? allAlerts.map((ann) => (
                            <div key={ann.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/50 hover:bg-blue-50/50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-1.5 rounded-full ${getBgColor(ann.type)}`}>{getIcon(ann.type)}</div>
                                    <div><p className="text-xs font-bold text-slate-700 mb-0.5">{ann.title}</p><p className="text-[10px] text-slate-500 leading-relaxed">{ann.message}</p><p className="text-[9px] text-slate-400 mt-2 font-medium">{new Date(ann.date).toLocaleDateString()}</p></div>
                                </div>
                            </div>
                        )) : <div className="text-center py-8 text-slate-400 text-sm">All caught up!</div>}
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* 4. OTHER TABS (Same logic as before) */}
      {/* LIVE IPTV TAB */}
      {activeTab === 'live' && <LiveIPTV />}
      {activeTab === 'speedtest' && <SpeedTest />}
      {activeTab === 'family' && (
        <div className="space-y-6 animate-in fade-in">
           <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-slate-800">Family & Neighborhood</h2><p className="text-slate-500">Manage linked accounts and shared savings.</p></div></div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FamilyPlanWidget user={userData} db={db} appId={appId} /><div className="bg-blue-50 p-6 rounded-2xl border border-blue-100"><h4 className="font-bold text-blue-800 mb-2">How it works</h4><ul className="list-disc list-inside text-sm text-blue-700 space-y-2"><li>Invite neighbors using their registered email.</li><li>Once 3 households are linked, a 5% discount is applied automatically.</li><li>Bill payments remain separate.</li></ul></div></div>
        </div>
      )}
      {activeTab === 'auto_tech' && <SmartDiagnostics user={userData} db={db} appId={appId} />}
      {activeTab === 'wallet' && <SwiftWallet user={userData} db={db} appId={appId} />}
      {activeTab === 'shop' && <Marketplace user={userData} db={db} appId={appId} />}
      {activeTab === 'my_id' && <DigitalID user={userData} />}
      
      {activeTab === 'repairs' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-slate-800">Repair Requests</h2><p className="text-sm text-slate-500">Track status.</p></div><button onClick={() => setShowRepairModal(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-700 shadow-lg flex items-center gap-2"><Hammer size={18} /> Request Repair</button></div>
            <div className="space-y-4"><h3 className="text-sm font-bold text-slate-500 uppercase">Active Requests</h3>{activeRepairs && activeRepairs.length > 0 ? activeRepairs.map(repair => (<RepairStatusCard key={repair.id} repair={repair} isSubscriber={true} onConfirm={onConfirmRepair} />)) : <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">No active repairs.</div>}</div>
            {historyRepairs.length > 0 && (<div className="pt-8 mt-8 border-t border-slate-200"><h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Clock size={18}/> Repair History</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{historyRepairs.map(repair => (<RepairStatusCard key={repair.id} repair={repair} isSubscriber={true} />))}</div></div>)}
         </div>
      )}

      {activeTab === 'documents' && (
          <div className="space-y-6">
              <div className="flex justify-between items-center"><div><h2 className="text-2xl font-bold text-slate-800">My Documents</h2><p className="text-sm text-slate-500">View and download your contracts and statements.</p></div></div>
              {!userData.contractSigned && (<div className="mb-6 p-6 bg-red-50 border-b border-red-100 rounded-2xl flex items-center justify-between"><div className="flex items-center gap-4"><div className="bg-red-100 p-3 rounded-xl text-red-600"><PenTool size={24}/></div><div><h4 className="font-bold text-red-800">Service Contract Pending</h4><p className="text-xs text-red-600">Please sign your agreement to avoid interruption.</p></div></div><button onClick={() => setShowContract(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 shadow-md">Sign Now</button></div>)}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"><div className="divide-y divide-slate-100">{documents.length > 0 ? documents.map(doc => (<div key={doc.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"><div className="flex items-center gap-4"><div className="bg-blue-50 p-3 rounded-xl text-blue-600"><FileText size={24} /></div><div><h4 className="font-bold text-slate-800">{doc.title}</h4><p className="text-xs text-slate-500 mt-1 flex items-center gap-2"><span>{doc.type}</span> • <span>{new Date(doc.date).toLocaleDateString()}</span> • <span className="text-red-600 font-bold">₱{parseFloat(doc.amount).toLocaleString()}</span></p></div></div><button onClick={() => setSelectedDoc(doc)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg font-bold text-sm transition-colors"><Eye size={18} /><span className="hidden sm:inline">View Invoice</span></button></div>)) : <div className="p-8 text-center text-slate-400">No documents found.</div>}</div></div>
          </div>
      )}

      {activeTab === 'rewards' && (
          <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg"><div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16"></div><div className="relative z-10"><div className="flex items-center gap-3 mb-2"><Gift size={32} className="text-white" /><h2 className="text-3xl font-bold">SwiftPoints</h2></div><p className="text-yellow-100 font-medium text-lg">Your Balance: <span className="text-4xl font-bold text-white ml-2">{userData.points || 0}</span> pts</p><p className="text-sm mt-4 text-yellow-50 opacity-90">Earn 50 points for every verified payment!</p></div></div>
              <h3 className="text-xl font-bold text-slate-800">Redeem Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col"><div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4"><Zap size={24}/></div><h4 className="font-bold text-slate-800 text-lg">24h Speed Boost</h4><p className="text-sm text-slate-500 mb-4 flex-grow">Get an extra 50Mbps for 24 hours.</p><div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100"><span className="font-bold text-slate-800">150 pts</span><button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-50" disabled={(userData.points || 0) < 150}>Redeem</button></div></div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col"><div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center text-green-600 mb-4"><span className="text-2xl font-bold font-sans">₱</span></div><h4 className="font-bold text-slate-800 text-lg">₱50 Bill Rebate</h4><p className="text-sm text-slate-500 mb-4 flex-grow">Deduct ₱50 from your next billing statement.</p><div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100"><span className="font-bold text-slate-800">200 pts</span><button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-50" disabled={(userData.points || 0) < 200}>Redeem</button></div></div>
              </div>
          </div>
      )}
      
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6"><VideoSupport user={userData} /><ScheduledCallback user={userData} db={db} appId={appId} /><KnowledgeBase /></div>
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MessageSquare size={20} className="text-blue-600"/> Create New Ticket</h3><form onSubmit={handleCreateTicket} className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label><select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white" value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}><option value="">Select...</option><option value="No Internet">No Internet</option><option value="Billing">Billing</option><option value="Other">Other</option></select></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label><textarea required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none h-32 resize-none" value={newTicket.message} onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}></textarea></div><button type="submit" disabled={ticketLoading} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700">{ticketLoading ? 'Submitting...' : 'Submit Ticket'}</button></form></div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit"><h3 className="font-bold text-slate-800 mb-4">My Ticket History</h3><div className="space-y-4 max-h-[600px] overflow-y-auto">{tickets && tickets.length > 0 ? tickets.map(ticket => (<div key={ticket.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50"><div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-800">#{ticket.ticketId || '---'} - {ticket.subject}</h4><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${ticket.status==='open'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{ticket.status}</span></div><p className="text-sm text-slate-600 mb-3">{ticket.message}</p>{ticket.adminReply && <div className="bg-white border-l-4 border-blue-500 p-3 rounded-r-lg mt-3"><p className="text-xs font-bold text-blue-600 mb-1">Admin Response:</p><p className="text-sm text-slate-700">{ticket.adminReply}</p></div>}<div className="mt-3 pt-2 border-t border-slate-100">{followingUpTo === ticket.id ? (<div className="mt-2"><textarea className="w-full border p-2 text-sm" rows="2" value={followUpText} onChange={(e) => setFollowUpText(e.target.value)}></textarea><div className="flex gap-2 justify-end"><button onClick={() => setFollowingUpTo(null)} className="text-xs font-bold px-3">Cancel</button><button onClick={() => handleFollowUpTicket(ticket.id, ticket.message)} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">Send</button></div></div>) : (<button onClick={() => setFollowingUpTo(ticket.id)} className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-1"><MessageCircle size={14} /> Add Note</button>)}</div></div>)) : <p className="text-center text-slate-400">No tickets found.</p>}</div></div>
            </div>
        </div>
      )}

      {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4"><div><h3 className="font-bold text-slate-800 flex items-center gap-2"><ShieldCheck size={20} className={userData.kycStatus === 'verified' ? "text-green-500" : "text-slate-400"}/> Identity Verification</h3><p className="text-sm text-slate-500 mt-1">{userData.kycStatus === 'verified' ? 'Your identity is verified.' : userData.kycStatus === 'pending' ? 'Verification is under review.' : 'Please upload an ID to secure your account.'}</p></div>{userData.kycStatus === 'verified' ? (<span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold uppercase">Verified</span>) : userData.kycStatus === 'pending' ? (<span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-xs font-bold uppercase">Pending</span>) : (<button onClick={() => setShowKYC(true)} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 w-full md:w-auto">Verify Now</button>)}</div>
              <div className="col-span-full bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white flex justify-between items-center relative overflow-hidden"><div className="relative z-10"><h3 className="font-bold text-lg flex items-center gap-2"><BookOpen size={20}/> Student & Teacher Discount</h3><p className="text-blue-100 text-sm">Get 10% OFF your monthly service fee.</p></div><button onClick={() => setCustomModal('student')} className="relative z-10 bg-white text-blue-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-50">Apply</button><div className="absolute -right-10 -bottom-20 text-white/10"><BookOpen size={150}/></div></div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock size={20} className="text-blue-600"/> Change Password</h3><form onSubmit={handleUpdatePassword} className="space-y-4"><input type="password" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-slate-700" value={managePass} onChange={(e) => setManagePass(e.target.value)} placeholder="New password" /><button type="submit" disabled={updatingCreds} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">{updatingCreds ? 'Updating...' : 'Update'}</button></form></div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Mail size={20} className="text-blue-600"/> Update Email</h3><form onSubmit={handleUpdateEmail} className="space-y-4"><input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-slate-700" value={manageEmail} onChange={(e) => setManageEmail(e.target.value)} placeholder="new@email.com" /><button type="submit" disabled={updatingCreds} className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900">{updatingCreds ? 'Updating...' : 'Update'}</button></form></div>
          </div>
      )}

      {showQR && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4"><div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"><div className="bg-blue-700 p-5 flex justify-between items-center"><h3 className="text-white font-bold flex items-center space-x-2"><CreditCard size={20} /><span>Scan to Pay</span></h3><button onClick={() => setShowQR(false)} className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full"><X size={20} /></button></div><div className="p-8 flex flex-col items-center text-center"><p className="text-slate-600 text-sm mb-6">Scan the QR code with your banking app to pay <span className="font-bold text-slate-900 block text-2xl mt-2">₱{userData.balance.toFixed(2)}</span></p><div className="bg-white p-4 border-2 border-dashed border-blue-200 rounded-2xl shadow-sm mb-8"><img src={paymentQRUrl || "/qr-code.png"} alt="Payment QR" className="w-48 h-48 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200?text=Ask+Admin+for+QR"; }} /></div><div className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 mb-4">Payment posting will reflect once the admin verifies your payment. Your reference number provided should match on the payment they received.</div><div className="w-full text-left"><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reference Number</label><form onSubmit={handlePaymentSubmit} className="flex gap-3">
        <input 
          type="text" 
          required 
          placeholder="e.g. 123456" 
          className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
          value={refNumber} 
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*$/.test(val)) {
              setRefNumber(val);
            } else {
              alert("Please enter only a number that matches the reference number on your proof of payment.");
            }
          }} 
        />
        <button type="submit" disabled={submitting} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 shadow-md shadow-green-200">{submitting ? '...' : 'Verify'}</button></form></div></div></div></div>)}
      
      {showRepairModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"><div className="bg-red-600 p-5 flex justify-between items-center"><h3 className="text-white font-bold flex items-center gap-2"><Hammer size={20} /> Request Service Repair</h3><button onClick={() => setShowRepairModal(false)} className="text-white/80 hover:text-white"><X size={24} /></button></div><div className="p-6"><p className="text-slate-600 text-sm mb-4">Please describe the issue.</p><textarea className="w-full border border-slate-300 rounded-lg p-3 h-32" value={repairNote} onChange={(e) => setRepairNote(e.target.value)}></textarea><div className="mt-4 flex justify-end gap-2"><button onClick={() => setShowRepairModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button><button onClick={handleRequestRepair} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Submit</button></div></div></div></div>)}
      {showProofModal && <PaymentProofModal user={userData} db={db} appId={appId} onClose={() => setShowProofModal(false)} />}
      {showKYC && <KYCModal user={userData} db={db} appId={appId} onClose={() => setShowKYC(false)} />}
      <InvoiceModal doc={selectedDoc} user={userData} onClose={() => setSelectedDoc(null)} />
      {showContract && <ServiceContractModal user={userData} db={db} appId={appId} onClose={() => setShowContract(false)} />}
      
      {customModal === 'student' && (
            <StudentPromoModal 
                onClose={() => setCustomModal(null)} 
                user={userData} 
                db={db} 
                appId={appId} 
            />
        )}
    </div>
  );
};

const DigitalGoodsAdmin = ({ db, appId }) => {
  const [activeView, setActiveView] = useState('catalog'); // 'catalog' or 'orders'
  const [products, setProducts] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', wholesalePrice: '', srp: '', category: 'Streaming', stockMode: 'Manual', description: '' });
  const [fulfillCode, setFulfillCode] = useState({}); // Stores input for each order

  // Fetch Catalog
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', DIGITAL_GOODS_COLLECTION));
    const unsub = onSnapshot(q, (s) => setProducts(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [db, appId]);

  // Fetch Pending Orders
  useEffect(() => {
    const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', USER_INVENTORY_COLLECTION),
        where('status', '==', 'Pending Delivery')
    );
    const unsub = onSnapshot(q, (s) => setPendingOrders(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [db, appId]);

  // Add Item to Catalog
  const handleAdd = async (e) => {
    e.preventDefault();
    if(!newItem.name || !newItem.wholesalePrice) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', DIGITAL_GOODS_COLLECTION), {
      ...newItem,
      wholesalePrice: parseFloat(newItem.wholesalePrice),
      srp: parseFloat(newItem.srp),
      status: 'Active',
      updatedAt: new Date().toISOString()
    });
    setNewItem({ name: '', wholesalePrice: '', srp: '', category: 'Streaming', stockMode: 'Manual', description: '' });
    alert("Digital Good Added!");
  };

  const handleDelete = async (id) => {
    if(confirm("Remove this item from the reseller catalog?")) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', DIGITAL_GOODS_COLLECTION, id));
    }
  };

  // --- THE MAGIC: Fulfill Order ---
  const handleFulfill = async (orderId, retailerId) => {
      const code = fulfillCode[orderId];
      if(!code) return alert("Please enter the code or credentials first.");

      if(!confirm("Send these credentials to the retailer?")) return;

      try {
          // 1. Update the Inventory Item (This makes it visible to Retailer)
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', USER_INVENTORY_COLLECTION, orderId), {
              status: 'Active', // Or 'Ready'
              credentials: code,
              dateFulfilled: new Date().toISOString()
          });

          // 2. Notify Retailer via Notification System (Optional but good)
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', NOTIFICATIONS_COLLECTION), {
              userId: retailerId,
              title: 'Order Ready',
              message: `Your order is ready! Code: ${code}`,
              date: new Date().toISOString(),
              type: 'success',
              read: false
          });

          alert("Order Fulfilled! Retailer has received the code.");
          
          // Clear input
          setFulfillCode(prev => ({...prev, [orderId]: ''}));

      } catch(e) {
          console.error(e);
          alert("Error fulfilling order: " + e.message);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShoppingBag size={20} className="text-purple-600"/> Digital Goods Manager
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveView('catalog')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeView === 'catalog' ? 'bg-white shadow text-purple-700' : 'text-slate-500'}`}
                >
                    Catalog
                </button>
                <button 
                    onClick={() => setActiveView('orders')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeView === 'orders' ? 'bg-white shadow text-purple-700' : 'text-slate-500'}`}
                >
                    Pending Orders
                    {pendingOrders.length > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 rounded-full">{pendingOrders.length}</span>}
                </button>
            </div>
        </div>

        {activeView === 'catalog' && (
            <>
                <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl">
                    <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Item Name</label><input className="w-full border p-2 rounded" placeholder="e.g. Zoom Pro (1 Month)" value={newItem.name} onChange={e=>setNewItem({...newItem, name: e.target.value})} required/></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Wholesale Cost (Your Price)</label><input type="number" className="w-full border p-2 rounded" placeholder="150" value={newItem.wholesalePrice} onChange={e=>setNewItem({...newItem, wholesalePrice: e.target.value})} required/></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Suggested Retail Price (SRP)</label><input type="number" className="w-full border p-2 rounded" placeholder="200" value={newItem.srp} onChange={e=>setNewItem({...newItem, srp: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Category</label><select className="w-full border p-2 rounded" value={newItem.category} onChange={e=>setNewItem({...newItem, category: e.target.value})}><option>Streaming</option><option>Gaming</option><option>Productivity</option><option>Vouchers</option></select></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Delivery Mode</label><select className="w-full border p-2 rounded" value={newItem.stockMode} onChange={e=>setNewItem({...newItem, stockMode: e.target.value})}><option value="Manual">Manual Processing (Ticket)</option><option value="Auto">Instant Code (Future)</option></select></div>
                    <button className="col-span-2 bg-purple-600 text-white font-bold py-2 rounded hover:bg-purple-700">Add to Catalog</button>
                </form>

                <div className="space-y-2">
                    {products.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-3 border rounded-lg bg-white hover:bg-purple-50">
                            <div>
                                <p className="font-bold text-slate-800">{p.name}</p>
                                <p className="text-xs text-slate-500">{p.category} • SRP: ₱{p.srp}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-mono font-bold text-purple-600">₱{p.wholesalePrice}</span>
                                <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}

        {activeView === 'orders' && (
            <div className="space-y-4">
                {pendingOrders.length === 0 ? (
                    <p className="text-center text-slate-400 py-10">No pending orders. Good job!</p>
                ) : (
                    pendingOrders.map(order => (
                        <div key={order.id} className="border-2 border-yellow-100 bg-yellow-50/50 p-4 rounded-xl">
                            <div className="flex justify-between mb-2">
                                <div>
                                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded uppercase">New Order</span>
                                    <h4 className="font-bold text-slate-800 mt-1">{order.itemName}</h4>
                                    <p className="text-xs text-slate-500">Ordered by User ID: {order.userId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400">Paid</p>
                                    <p className="font-mono font-black text-green-600">₱{order.cost}</p>
                                </div>
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Enter Credentials / Code to Send</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="flex-1 border p-2 rounded text-sm font-mono"
                                        placeholder="e.g. Code: 1234-5678 or User: admin / Pass: 123"
                                        value={fulfillCode[order.id] || ''}
                                        onChange={(e) => setFulfillCode({...fulfillCode, [order.id]: e.target.value})}
                                    />
                                    <button 
                                        onClick={() => handleFulfill(order.id, order.userId)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-700 shadow-lg shadow-green-200"
                                    >
                                        Send & Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};


const AdminAnalytics = ({ subscribers, payments, tickets, db, appId }) => {
  const activeUsers = subscribers.filter(s => s.status === 'active').length;
  const inactiveUsers = subscribers.filter(s => s.status !== 'active').length;
  const totalBalance = subscribers.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const verifiedPayments = payments.filter(p => p.status === 'verified').length;
  const pendingPayments = payments.filter(p => p.status !== 'verified').length;

  const userStatusData = [
    { name: 'Active', value: activeUsers },
    { name: 'Inactive/Overdue', value: inactiveUsers },
  ];
  const COLORS = ['#16a34a', '#dc2626'];

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const resolvedTickets = tickets.filter(t => t.status !== 'open').length;
  const ticketData = [
    { name: 'Support Tickets', Open: openTickets, Resolved: resolvedTickets },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl"><DollarSign size={24} /></div>
                    <div><p className="text-sm text-slate-500 font-bold uppercase">Pending Collectibles</p><h3 className="text-2xl font-bold text-slate-800">₱{totalBalance.toLocaleString()}</h3></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><User size={24} /></div>
                    <div><p className="text-sm text-slate-500 font-bold uppercase">Total Subscribers</p><h3 className="text-2xl font-bold text-slate-800">{subscribers.length}</h3></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><CreditCard size={24} /></div>
                    <div><p className="text-sm text-slate-500 font-bold uppercase">Payments to Verify</p><h3 className="text-2xl font-bold text-slate-800">{pendingPayments}</h3></div>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-80">
                <h3 className="font-bold text-slate-700 mb-4">Subscriber Health</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={userStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {userStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* --- FIX APPLIED HERE: Passing the required props --- */}
                <PeakUsageGraph db={db} appId={appId} />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-80">
                <h3 className="font-bold text-slate-700 mb-4">Support Ticket Status</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ticketData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} />
                        <Legend />
                        <Bar dataKey="Open" fill="#facc15" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Resolved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

const ExpenseManager = ({ appId, db, subscribers, payments }) => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Bandwidth' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', EXPENSES_COLLECTION), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [appId, db]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', EXPENSES_COLLECTION), {
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      date: new Date().toISOString()
    });
    setNewExpense({ title: '', amount: '', category: 'Bandwidth' });
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    if(confirm("Delete this expense record?")) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', EXPENSES_COLLECTION, id));
    }
  };

  // Mock total revenue calculation (Balance + 50k base) + Real Expenses
  // This calculates actual money received from verified payments
const totalRevenue = payments
  .filter(p => p.status === 'verified')
  .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 1500), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl"><TrendingUp size={24} /></div>
                    <div><p className="text-sm text-slate-500 font-bold uppercase">Total Revenue</p><h3 className="text-2xl font-bold text-slate-800">₱{totalRevenue.toLocaleString()}</h3></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl"><TrendingDown size={24} /></div>
                    <div><p className="text-sm text-slate-500 font-bold uppercase">Total Expenses</p><h3 className="text-2xl font-bold text-slate-800">₱{totalExpenses.toLocaleString()}</h3></div>
                </div>
            </div>
            <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 ${netProfit >= 0 ? 'border-b-4 border-b-green-500' : 'border-b-4 border-b-red-500'}`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><DollarSign size={24} /></div>
                    <div><p className="text-sm text-slate-500 font-bold uppercase">Net Profit</p><h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>₱{netProfit.toLocaleString()}</h3></div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Expense Log</h3>
                <button onClick={() => setIsAdding(!isAdding)} className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                    {isAdding ? 'Cancel' : <><Plus size={16}/> Add Expense</>}
                </button>
            </div>
            
            {isAdding && (
                <form onSubmit={handleAdd} className="p-6 bg-slate-50 border-b border-slate-100 flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Item Name</label>
                        <input className="w-full border p-2 rounded text-sm" placeholder="e.g. Bandwidth Payment" value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} required />
                    </div>
                    <div className="w-40">
                         <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                         <select className="w-full border p-2 rounded text-sm" value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                            <option>Bandwidth</option><option>Salaries</option><option>Rent</option><option>Supplies</option><option>Utilities</option><option>Other</option>
                         </select>
                    </div>
                    <div className="w-32">
                        <label className="text-xs font-bold text-slate-500 uppercase">Cost (₱)</label>
                        <input type="number" className="w-full border p-2 rounded text-sm" placeholder="0.00" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} required />
                    </div>
                    <button className="bg-red-600 text-white px-6 py-2 rounded font-bold text-sm hover:bg-red-700">Record</button>
                </form>
            )}

            <div className="divide-y divide-slate-100">
                {expenses.length > 0 ? expenses.map(ex => (
                    <div key={ex.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-50 p-2 rounded-lg text-red-500"><TrendingDown size={20}/></div>
                            <div>
                                <p className="font-bold text-slate-800">{ex.title}</p>
                                <p className="text-xs text-slate-500">{ex.category} • {new Date(ex.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="font-bold text-red-600">- ₱{ex.amount.toLocaleString()}</span>
                            <button onClick={() => handleDelete(ex.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    </div>
                )) : <p className="p-8 text-center text-slate-400">No expenses recorded yet.</p>}
            </div>
        </div>
    </div>
  );
};

const ProductManager = ({ appId, db }) => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', category: 'Add-on' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', PRODUCTS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [appId, db]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PRODUCTS_COLLECTION), newProduct);
    setNewProduct({ name: '', price: '', description: '', category: 'Add-on' });
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    if(confirm("Delete this product?")) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', PRODUCTS_COLLECTION, id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center">
            <div><h2 className="text-2xl font-bold text-slate-800">Store Inventory</h2><p className="text-sm text-slate-500">Manage items visible in the Subscriber Shop.</p></div>
            <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700">
                {isAdding ? 'Cancel' : <><Plus size={16}/> Add Product</>}
            </button>
        </div>

        {isAdding && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Product Name</label>
                            <input className="w-full border p-2 rounded-lg" placeholder="e.g. Mesh Router" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Price Label</label>
                            <input className="w-full border p-2 rounded-lg" placeholder="e.g. ₱1,500 /mo" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                            <select className="w-full border p-2 rounded-lg" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                <option>Add-on</option><option>Hardware</option><option>Upgrade</option><option>Gaming</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                            <input className="w-full border p-2 rounded-lg" placeholder="Short description..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} required/>
                        </div>
                    </div>
                    <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold w-full hover:bg-green-700">Save Product</button>
                </form>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase">{p.category}</span>
                        <button onClick={() => handleDelete(p.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">{p.name}</h4>
                    <p className="text-sm text-slate-500 mb-4 h-10">{p.description}</p>
                    <div className="font-bold text-blue-600 bg-blue-50 p-2 rounded-lg text-center">{p.price}</div>
                </div>
            ))}
            {products.length === 0 && <p className="col-span-full text-center text-slate-400 py-10">No products in store.</p>}
        </div>
    </div>
  );
};

const Marketplace = ({ user, db, appId }) => {
  const [products, setProducts] = useState([]);
  const [buying, setBuying] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', PRODUCTS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [appId, db]);

  const getIcon = (cat) => {
      if(cat === 'Hardware') return <Wifi size={32} className="text-purple-500"/>;
      if(cat === 'Gaming') return <Zap size={32} className="text-yellow-500"/>;
      if(cat === 'Upgrade') return <ArrowUpCircle size={32} className="text-green-500"/>;
      return <Globe size={32} className="text-blue-500"/>;
  };

  const handlePurchase = async (product) => {
    if (!confirm(`Request to order: ${product.name}? An agent will contact you.`)) return;
    setBuying(product.id);
    try {
        const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString();
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), {
            ticketId,
            userId: user.uid,
            username: user.username,
            subject: `Order: ${product.name}`,
            message: `Customer wants to purchase/subscribe to: ${product.name} (${product.price}).`,
            status: 'open',
            adminReply: '',
            date: new Date().toISOString(),
            isOrder: true
        });
        await sendCustomEmail('order', {
            name: user.username,
            email: user.email || 'user@example.com',
            orderDetails: product.name + " - " + product.price,
            message: `We received your request for ${product.name}. A technician will contact you shortly.`
        });
        alert("Order request sent!");
    } catch (e) { alert("Error sending request."); }
    setBuying(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
                <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                    <ShoppingBag className="text-indigo-400"/> Upgrade Store
                </h2>
                <p className="text-slate-300 max-w-lg">Enhance your internet experience. Purchase add-ons and hardware directly.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map(product => (
                <div key={product.id} className="p-6 rounded-2xl border-2 border-slate-100 bg-white hover:shadow-lg transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-50 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                            {getIcon(product.category)}
                        </div>
                        <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full text-sm">
                            {product.price}
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">{product.name}</h3>
                    <p className="text-sm text-slate-600 mb-6 min-h-[40px]">{product.description}</p>
                    <button onClick={() => handlePurchase(product)} disabled={buying === product.id} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors shadow-md disabled:opacity-50">
                        {buying === product.id ? 'Processing...' : 'Request Order'}
                    </button>
                </div>
            ))}
            {products.length === 0 && <div className="col-span-full text-center text-slate-400 py-10">Store is currently empty. Check back soon!</div>}
        </div>
    </div>
  );
};

const EditSubscriberModal = ({ user, plans, onClose, db, appId }) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    contactNumber: user.contactNumber || '',
    accountNumber: user.accountNumber || '',
    plan: user.plan || '',
    address: user.address || '',
    status: user.status || 'active',
    balance: user.balance || 0,
    kycStatus: user.kycStatus || 'none',
    role: user.role || 'subscriber',
  });
  const [loading, setLoading] = useState(false);

  // --- AUTOMATION LOGIC ---
  // When status changes to active, auto-generate account number if missing
  useEffect(() => {
    if (formData.status === 'active' && (formData.accountNumber === 'PENDING' || !formData.accountNumber)) {
      const newGeneratedNo = Math.floor(100000 + Math.random() * 900000).toString();
      setFormData(prev => ({ ...prev, accountNumber: newGeneratedNo }));
    }
  }, [formData.status]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (formData.status === 'active' && !formData.plan) {
        return alert("Please assign a Plan before activating.");
    }

    setLoading(true);
    try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.id);
        
        // Check if we are activating an applicant for the first time
        const activatingNow = user.status === 'applicant' && formData.status === 'active';

        await updateDoc(docRef, {
            ...formData,
            balance: parseFloat(formData.balance)
        });

        // Trigger Welcome Email with Account Number if just activated
        if (activatingNow && formData.email) {
            await sendCustomEmail('otp', {
                name: formData.username,
                email: formData.email,
                code: formData.accountNumber,
                message: `Congratulations! Your SwiftNet account is now active. Your official Account Number is ${formData.accountNumber}. Use this for all your future payments and support requests. You may now proceed on your payment for the Activation.`
            });
        }
        
        alert("Subscriber updated and activation email sent!");
        onClose();
    } catch (e) {
        alert("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg flex items-center gap-2"><Edit size={20} /> Edit Subscriber</h3>
                <button onClick={onClose}><X className="text-slate-400 hover:text-white"/></button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Status</label>
                        <select 
                            className={`w-full border p-3 rounded-lg font-bold ${formData.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white'}`} 
                            value={formData.status} 
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="applicant">Applicant (Pending)</option>
                            <option value="active">Active (Assign Account No.)</option>
                            <option value="overdue">Overdue</option>
                            <option value="disconnected">Disconnected</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Account Number</label>
                        <input 
                            className="w-full border p-2 rounded-lg bg-slate-50 font-mono font-bold text-blue-600" 
                            placeholder="Auto-generated on Active"
                            value={formData.accountNumber} 
                            onChange={e => setFormData({...formData, accountNumber: e.target.value})} 
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Internet Plan</label>
                        <select className="w-full border p-2 rounded-lg" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} required>
                            <option value="">-- Select Plan --</option>
                            {plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                        <input className="w-full border p-2 rounded-lg" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Balance (₱)</label>
                        <input type="number" className="w-full border p-2 rounded-lg" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} />
                    </div>
                    
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address</label>
                        <textarea className="w-full border p-2 rounded-lg h-20 resize-none text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700">
                        {loading ? 'Saving...' : 'Save & Activate'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

const ServiceAreaManager = ({ appId, db }) => {
  const [areas, setAreas] = useState([]);
  const [newArea, setNewArea] = useState({ city: '', barangay: '', status: 'Available' });

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', SERVICE_AREAS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAreas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [appId, db]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newArea.city || !newArea.barangay) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', SERVICE_AREAS_COLLECTION), {
        ...newArea,
        city: newArea.city.toUpperCase(),
        barangay: newArea.barangay.toUpperCase()
    });
    setNewArea({ city: '', barangay: '', status: 'Available' });
  };

  const handleDelete = async (id) => await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', SERVICE_AREAS_COLLECTION, id));

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={20}/> Serviceable Areas</h3>
            <form onSubmit={handleAdd} className="flex gap-4 items-end mb-6">
                <input className="border p-2 rounded w-full" placeholder="City (e.g. STA ANA)" value={newArea.city} onChange={e=>setNewArea({...newArea, city: e.target.value})} />
                <input className="border p-2 rounded w-full" placeholder="Barangay (e.g. MAREDE)" value={newArea.barangay} onChange={e=>setNewArea({...newArea, barangay: e.target.value})} />
                <select className="border p-2 rounded" value={newArea.status} onChange={e=>setNewArea({...newArea, status: e.target.value})}>
                    <option>Available</option><option>Coming Soon</option>
                </select>
                <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Add</button>
            </form>
            <div className="space-y-2">
                {areas.map(area => (
                    <div key={area.id} className="flex justify-between p-3 bg-slate-50 rounded border border-slate-100">
                        <span className="font-bold text-slate-700">{area.barangay}, {area.city}</span>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${area.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{area.status}</span>
                            <button onClick={() => handleDelete(area.id)} className="text-red-500"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

const BillingModal = ({ user, onClose, db, appId }) => {
  // Start with an empty list so you have full control
  const [items, setItems] = useState([]); 
  
  // Input state
  const [newItem, setNewItem] = useState({ description: '', amount: '' });
  const [loading, setLoading] = useState(false);

  // Auto-calculate Total
  const total = items.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0);

  const addItem = (e) => {
    e.preventDefault();
    if(!newItem.description || !newItem.amount) return;
    
    // Add to list
    setItems([...items, { ...newItem, amount: parseFloat(newItem.amount) }]);
    
    // Reset inputs for next entry
    setNewItem({ description: '', amount: '' });
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (items.length === 0) return alert("Please add at least one item to the bill.");
    setLoading(true);
    
    try {
        const date = new Date();
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15); // Default 15 days due

        // 1. Create the Invoice Document
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', INVOICES_COLLECTION), {
            userId: user.id,
            title: `Statement - ${monthName}`,
            date: date.toISOString(),
            dueDate: dueDate.toISOString(),
            type: 'Invoice',
            amount: total,
            items: items, // Save the detailed list
            status: 'Unpaid'
        });

        // 2. Update User Balance
        const newBalance = (user.balance || 0) + total;
        
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.id), {
            balance: newBalance,
            status: newBalance > 0 ? 'overdue' : 'active',
            dueDate: dueDate.toISOString()
        });

        // AUTOMATIC EMAIL: Send Invoice Notification
        await sendCustomEmail('invoice', {
            name: user.username,
            email: user.email,
            amount: `₱${total.toLocaleString()}`,
            message: `Dear ${user.username}, your new Statement of Account for ${monthName} has been generated. Please check your dashboard or view the attachment.You can access through this link: www.jwreport.site`
        });

        alert("Invoice Generated Successfully!");
        onClose();
    } catch (e) {
        alert("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
        <div className="bg-white w-[95%] md:w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20}/> Custom Invoice Builder</h3>
                <button onClick={onClose}><X className="text-slate-400 hover:text-white"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                {/* Header Info */}
                <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-blue-500 uppercase">Billed To</p>
                        <p className="font-bold text-blue-900">{user.username}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-blue-500 uppercase">Current Balance</p>
                        <p className="font-bold text-blue-900">₱{(user.balance || 0).toLocaleString()}</p>
                    </div>
                </div>

                {/* List of Added Items */}
                <div className="space-y-2 mb-6">
                    {items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-sm font-medium text-slate-700">{item.description}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900">₱{item.amount.toLocaleString()}</span>
                                <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-center text-slate-400 text-xs italic">List is empty. Add items below.</p>}
                </div>

                {/* Input Form */}
                <form onSubmit={addItem} className="flex gap-2 mb-6">
                    <input 
                        className="flex-1 border p-2 rounded-lg text-sm outline-none focus:border-blue-500" 
                        placeholder="Description (e.g. Monthly Fee)" 
                        value={newItem.description} 
                        onChange={e => setNewItem({...newItem, description: e.target.value})} 
                        autoFocus
                    />
                    <input 
                        type="number" 
                        className="w-24 border p-2 rounded-lg text-sm outline-none focus:border-blue-500" 
                        placeholder="Amount" 
                        value={newItem.amount} 
                        onChange={e => setNewItem({...newItem, amount: e.target.value})} 
                    />
                    <button className="bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300"><Plus size={20}/></button>
                </form>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="text-xl font-bold text-slate-800">Total Bill</span>
                    <span className="text-2xl font-black text-blue-600">₱{total.toLocaleString()}</span>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200">
                <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Processing...' : 'Generate Invoice'}
                </button>
            </div>
        </div>
    </div>
  );
};

const CashierMode = ({ subscribers, db, appId }) => {
  const [queryText, setQueryText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('bill'); // 'bill', 'wallet', or 'prepaid'
  const [processing, setProcessing] = useState(false);

  const filtered = queryText 
    ? subscribers.filter(s => {
        // Ensure username and accountNumber exist before calling string methods
        const name = s.username ? s.username.toLowerCase() : "";
        const accNo = s.accountNumber ? s.accountNumber : "";
        const search = queryText.toLowerCase();

        return name.includes(search) || accNo.includes(queryText);
      }) 
    : [];

  const handleTransaction = async () => {
      if (!amount || !selectedUser) return;
      setProcessing(true);
      
      const newRef = `POS-${Math.floor(100000 + Math.random() * 900000)}`;
      const val = parseFloat(amount);

      try {
          if (mode === 'bill') {
              // --- BILL PAYMENT LOGIC ---

              // 1. Update Balance
              const newBalance = (selectedUser.balance || 0) - val;
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, selectedUser.id), {
                  balance: newBalance, lastPaymentDate: new Date().toISOString()
              });

              // 2. Save Payment Record
              await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), {
                  userId: selectedUser.id, username: selectedUser.username, refNumber: newRef, amount: val, date: new Date().toISOString(), status: 'verified', type: 'Walk-in Cash'
              });

              // 3. AUTO-GENERATE DOCUMENT (This puts it in the Documents tab)
              await addDoc(collection(db, 'artifacts', appId, 'public', 'data', INVOICES_COLLECTION), {
                  userId: selectedUser.id,
                  title: `Official Receipt - Walk-in`,
                  date: new Date().toISOString(),
                  type: 'Receipt',
                  refNumber: newRef,
                  amount: val,
                  status: 'Paid',
                  items: [{ description: 'Cash Payment (Walk-in)', amount: val }]
              });

              // 4. AUTO-SEND EMAIL
              if (selectedUser.email) {
                  await sendCustomEmail('receipt', {
                      name: selectedUser.username,
                      email: selectedUser.email,
                      amount: `₱${val.toLocaleString()}`, 
                      refNumber: newRef,
                      message: `Thank you for visiting our office. Your payment has been posted and the receipt is in your dashboard.You can access through this link: www.jwreport.site`
                  });
              }

              alert(`Bill Paid! Receipt saved to Dashboard & Email Sent.`);
          } else if (mode === 'prepaid') {
              // --- PREPAID TIME LOADING LOGIC ---
              
              // 1. Determine Days based on Amount
              let daysToAdd = 0;
              if (val === 50) daysToAdd = 1;   // ₱50 = 1 Day
              else if (val === 200) daysToAdd = 7; // ₱200 = 1 Week
              else if (val === 700) daysToAdd = 30; // ₱700 = 1 Month
              else return alert("Invalid Prepaid Amount. Standard rates: 50 (1d), 200 (7d), or 700 (30d).");

              // 2. Calculate New Due Date
              // If currently disconnected or overdue, start from NOW. If active, add to existing date.
              const currentDue = new Date(selectedUser.dueDate);
              const now = new Date();
              const baseDate = (currentDue > now && selectedUser.status === 'active') ? currentDue : now;
              
              const newDueDate = new Date(baseDate);
              newDueDate.setDate(newDueDate.getDate() + daysToAdd);

              // 3. Update User
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, selectedUser.id), {
                  status: 'active', // Reactivate service immediately
                  dueDate: newDueDate.toISOString(),
                  balance: 0 // Prepaid users usually don't run a negative balance
              });

              // 4. Log Payment
              await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), {
                  userId: selectedUser.id, username: selectedUser.username, refNumber: newRef, amount: val, date: new Date().toISOString(), status: 'verified', type: 'Prepaid Load'
              });

              alert(`Success! Added ${daysToAdd} Days. New Expiry: ${newDueDate.toLocaleDateString()}`);

          } else {
              // --- WALLET TOP-UP LOGIC ---
              const newCredits = (selectedUser.walletCredits || 0) + val;
              
              // 1. Update Credits
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, selectedUser.id), {
                  walletCredits: newCredits
              });

              // 2. Log Transaction
              await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), {
                  userId: selectedUser.id, username: selectedUser.username, refNumber: newRef, amount: val, date: new Date().toISOString(), status: 'verified', type: 'Wallet Top-up'
              });

              // 3. Send Email Notification for Top-up
              if (selectedUser.email) {
                  await sendCustomEmail('receipt', {
                      name: selectedUser.username,
                      email: selectedUser.email,
                      amount: `₱${val.toLocaleString()}`, 
                      refNumber: newRef,
                      message: `Your SwiftWallet has been loaded with ₱${val.toLocaleString()}. New Balance: ₱${newCredits.toLocaleString()}`
                  });
              }

              alert(`Wallet Loaded! New Credits: ₱${newCredits}`);
          }
          
          setSelectedUser(null); setAmount(''); setQueryText('');
      } catch(e) { alert("Error: " + e.message); }
      setProcessing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-150px)] pb-20 lg:pb-0">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[500px] lg:h-auto">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><User size={20}/> Find Subscriber</h3>
            <div className="relative mb-4">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20}/>
                <input className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg" placeholder="Search Name or Account #" value={queryText} onChange={e => setQueryText(e.target.value)} autoFocus />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
                {filtered.map(sub => (
                    <div key={sub.id} onClick={() => setSelectedUser(sub)} className={`p-4 rounded-xl border cursor-pointer hover:bg-blue-50 transition-all ${selectedUser?.id === sub.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-100'}`}>
                        <div className="flex justify-between items-center">
                            <div><p className="font-bold text-lg">{sub.username}</p><p className={`text-xs ${selectedUser?.id === sub.id ? 'text-blue-100' : 'text-slate-500'}`}>#{sub.accountNumber}</p></div>
                            <div className="text-right"><p className="font-mono font-black text-xl">₱{sub.balance?.toLocaleString()}</p><p className={`text-[10px] font-bold uppercase ${selectedUser?.id === sub.id ? 'text-blue-200' : 'text-slate-400'}`}>{sub.status}</p></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="w-full lg:w-[400px] bg-slate-900 rounded-2xl shadow-2xl p-8 text-white flex flex-col h-auto min-h-[500px]">
            <h3 className="font-black text-2xl mb-6 flex items-center gap-3"><Calculator className="text-green-400"/> POS Terminal</h3>
            
            {/* Mode Toggle */}
            <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
                <button onClick={() => setMode('bill')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'bill' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Pay Bill</button>
                <button onClick={() => setMode('prepaid')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'prepaid' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Prepaid Load</button>
                <button onClick={() => setMode('wallet')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'wallet' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Wallet</button>
            </div>

            {selectedUser ? (
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                        <p className="text-slate-400 text-xs uppercase font-bold">Customer</p>
                        <p className="text-xl font-bold truncate">{selectedUser.username}</p>
                        <div className="flex gap-4 mt-2">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 uppercase">Bill Balance</p>
                                <p className="text-red-400 font-mono font-bold">₱{selectedUser.balance}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 uppercase">Expiry</p>
                                <p className="text-yellow-400 font-mono font-bold text-xs">{new Date(selectedUser.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-slate-400 text-xs uppercase font-bold block mb-2">{mode === 'bill' ? 'Payment Amount' : mode === 'prepaid' ? 'Load Amount (50/200/700)' : 'Load Amount'}</label>
                        <input type="number" className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 text-3xl font-mono font-bold text-white outline-none focus:border-green-500" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <button onClick={handleTransaction} disabled={processing || !amount} className={`w-full mt-auto py-4 rounded-xl font-bold text-xl shadow-lg transition-all disabled:opacity-50 ${mode === 'bill' ? 'bg-blue-600 hover:bg-blue-500' : mode === 'prepaid' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                        {processing ? 'Processing...' : mode === 'bill' ? 'Confirm Payment' : mode === 'prepaid' ? 'Load Prepaid' : 'Confirm Top-up'}
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                    <User size={64} className="mb-4 opacity-20"/>
                    <p>Select a user to start</p>
                </div>
            )}
        </div>
    </div>
  );
};

const AddStaffModal = ({ onClose }) => {
  const [formData, setFormData] = useState({ email: '', password: '', username: '', role: 'cashier' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Create user in a secondary app instance to avoid logging out the admin
    let secondaryApp = null;
    try {
        secondaryApp = initializeApp(firebaseConfig, "Secondary");
        const secondaryAuth = getAuth(secondaryApp);
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
        
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userCredential.user.uid), {
            uid: userCredential.user.uid,
            username: formData.username,
            email: formData.email,
            role: formData.role, 
            status: 'active',
            accountNumber: 'STAFF',
            balance: 0,
            dateCreated: new Date().toISOString()
        });

        await deleteApp(secondaryApp);
        await sendCustomEmail('otp', {
            name: formData.username,
            email: formData.email,
            code: formData.password, 
            message: `You have been assigned as a ${formData.role}. Use your email that has been sent to us or the one you use in appylying. Use this password to log in. You can access through this link: www.jwreport.site`
        });
        alert(`${formData.role.toUpperCase()} account created successfully!`);
        onClose();
    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
        if (secondaryApp) await deleteApp(secondaryApp);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-blue-600"/> Add Staff Member
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Staff Name</label>
                    <input className="w-full border p-2 rounded-lg" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                    <select className="w-full border p-2 rounded-lg bg-blue-50 font-bold text-blue-700" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="cashier">Cashier (Billing Only)</option>
                        <option value="technician">Technician (Repairs Only)</option>
                        <option value="iptv_reseller">IPTV Reseller (Create Subs)</option>
                        <option value="retailer">Retailer (Digital Goods)</option>
                        <option value="agent">Sales Agent (Reseller)</option>
                        <option value="admin">Admin (Full Access)</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                    <input type="email" className="w-full border p-2 rounded-lg" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                    <input type="text" className="w-full border p-2 rounded-lg font-mono" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div className="flex gap-2 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
                    <button disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

const ReportGenerator = ({ payments, expenses, subscribers }) => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    const element = document.getElementById('monthly-report-print');
    
    try {
        await new Promise(r => setTimeout(r, 100));
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Financial_Report_${month}.pdf`);
    } catch (e) {
        alert("Error generating report");
    }
    setGenerating(false);
  };

  // Filter Data by Selected Month
  const selectedDate = new Date(month);
  const selectedMonthIndex = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  const monthlyPayments = payments.filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === selectedMonthIndex && d.getFullYear() === selectedYear && p.status === 'verified';
  });

  const monthlyExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === selectedMonthIndex && d.getFullYear() === selectedYear;
  });

  const newSubscribers = subscribers.filter(s => {
      // Assuming you have a dateCreated, if not fallback to dueDate comparison or mock
      const d = new Date(s.dateCreated || s.dueDate); 
      return d.getMonth() === selectedMonthIndex && d.getFullYear() === selectedYear;
  });

  const totalIncome = monthlyPayments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
  const totalExpense = monthlyExpenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex justify-between items-end">
            <div>
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><FileBarChart size={20} className="text-blue-600"/> Monthly Financial Reports</h3>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Select Period</label>
                <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="border p-2 rounded-lg font-bold text-slate-700 outline-none focus:border-blue-500"/>
            </div>
            <button onClick={generatePDF} disabled={generating} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50">
                <Download size={18}/> {generating ? 'Generating...' : 'Download PDF Report'}
            </button>
        </div>

        {/* PREVIEW AREA (This gets printed) */}
        <div className="overflow-auto bg-slate-100 p-4 rounded-xl border border-slate-200">
            <div id="monthly-report-print" className="bg-white p-12 w-[800px] mx-auto shadow-sm min-h-[1000px] text-slate-800 relative">
                
                {/* Report Header */}
                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">SwiftNet<span className="text-blue-600">ISP</span></h1>
                        <p className="text-sm text-slate-500 font-bold">Financial Performance Report</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-slate-700">{new Date(month).toLocaleDateString(undefined, {month:'long', year:'numeric'})}</p>
                        <p className="text-xs text-slate-400">Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-center">
                        <p className="text-xs font-bold text-green-600 uppercase">Total Income</p>
                        <p className="text-2xl font-black text-green-800">₱{totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-center">
                        <p className="text-xs font-bold text-red-600 uppercase">Total Expenses</p>
                        <p className="text-2xl font-black text-red-800">₱{totalExpense.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 border rounded-lg text-center ${netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                        <p className="text-xs font-bold text-slate-600 uppercase">Net Profit</p>
                        <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>₱{netProfit.toLocaleString()}</p>
                    </div>
                </div>

                {/* Growth Metrics */}
                <div className="mb-8">
                    <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase text-xs tracking-widest">Business Growth</h3>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-100 p-3 rounded-full"><UserPlus size={20}/></div>
                            <div>
                                <p className="font-bold text-xl">{newSubscribers.length}</p>
                                <p className="text-xs text-slate-500">New Subscribers</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-100 p-3 rounded-full"><CheckCircle size={20}/></div>
                            <div>
                                <p className="font-bold text-xl">{monthlyPayments.length}</p>
                                <p className="text-xs text-slate-500">Successful Payments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-100 p-3 rounded-full"><TrendingUp size={20}/></div>
                            <div>
                                <p className="font-bold text-xl">{((netProfit / (totalIncome || 1)) * 100).toFixed(1)}%</p>
                                <p className="text-xs text-slate-500">Profit Margin</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expense Breakdown Table */}
                <div className="mb-8">
                    <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase text-xs tracking-widest">Expense Breakdown</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="p-2">Description</th>
                                <th className="p-2">Category</th>
                                <th className="p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyExpenses.map((ex, i) => (
                                <tr key={i} className="border-b border-slate-100">
                                    <td className="p-2 font-bold text-slate-700">{ex.title}</td>
                                    <td className="p-2 text-slate-500 text-xs uppercase">{ex.category}</td>
                                    <td className="p-2 text-right text-red-600 font-mono font-bold">- ₱{ex.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                            {monthlyExpenses.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-slate-400 italic">No expenses recorded.</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                    <p className="font-bold text-slate-800">SwiftNet Internet Service Provider</p>
                    <p className="text-xs text-slate-500">Confidential Financial Document • Authorized Personnel Only</p>
                </div>

            </div>
        </div>
    </div>
  );
};

const MaintenanceSwitch = ({ db, appId }) => {
  const [enabled, setEnabled] = useState(false);
  const [schedule, setSchedule] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'main_settings'), (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            setEnabled(data.maintenanceMode || false);
            // Format date for input field (YYYY-MM-DDTHH:mm)
            if (data.maintenanceSchedule) {
                const d = new Date(data.maintenanceSchedule);
                // Adjust to local ISO string for input value
                const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                setSchedule(localIso);
            }
        }
    });
    return () => unsub();
  }, [db, appId]);

  const toggle = async () => {
      const newState = !enabled;
      if (newState && !confirm("WARNING: Turning this ON will block subscribers from logging in. Proceed?")) return;
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'main_settings'), {
          maintenanceMode: newState
      }, { merge: true });
  };

  const handleSchedule = async (e) => {
      const newDate = e.target.value;
      setSchedule(newDate);
      // Save schedule to DB
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'main_settings'), {
          maintenanceSchedule: newDate ? new Date(newDate).toISOString() : null
      }, { merge: true });
  };

  return (
    <div className="flex gap-4">
        {/* Lockdown Switch */}
        <button onClick={toggle} className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all ${enabled ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200 text-slate-600'}`}>
            {enabled ? <ToggleRight size={24} className="text-red-600"/> : <ToggleLeft size={24} />}
            <div className="text-left leading-tight">
                <p className="text-xs font-bold uppercase tracking-wider">Lockdown Mode</p>
                <p className="text-[10px] font-bold">{enabled ? 'ACTIVE' : 'Normal'}</p>
            </div>
        </button>

        {/* Schedule Timer Input */}
        <div className="flex items-center gap-2 bg-white border-2 border-slate-200 px-3 rounded-xl">
            <Clock size={18} className="text-orange-500"/>
            <div className="flex flex-col">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Set Countdown Timer</label>
                <input 
                    type="datetime-local" 
                    className="text-xs font-bold text-slate-700 outline-none bg-transparent"
                    value={schedule}
                    onChange={handleSchedule}
                />
            </div>
            {schedule && <button onClick={() => handleSchedule({target: {value: ''}})} className="text-red-400 hover:text-red-600"><X size={14}/></button>}
        </div>
    </div>
  );
};

const NetworkStatusManager = ({ db, appId }) => {
  const [status, setStatus] = useState({
    local: 'operational', // operational, degradation, outage
    upstream: 'operational',
    global: 'operational',
    message: '',
    lastUpdated: new Date().toISOString()
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', STATUS_COLLECTION, 'main_status'), (doc) => {
        if (doc.exists()) setStatus(doc.data());
    });
    return () => unsub();
  }, [db, appId]);

  const updateStatus = async (key, value) => {
    const newStatus = { ...status, [key]: value, lastUpdated: new Date().toISOString() };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', STATUS_COLLECTION, 'main_status'), newStatus);
  };

  const handleMessageSave = async () => {
      await updateStatus('message', status.message);
      alert("Public incident message updated!");
  };

  const StatusButton = ({ label, value, current, onClick }) => (
      <button 
        onClick={onClick}
        className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all border-2 ${current === value 
            ? (value === 'operational' ? 'bg-green-500 text-white border-green-500' 
            : value === 'degradation' ? 'bg-yellow-500 text-white border-yellow-500' 
            : 'bg-red-600 text-white border-red-600')
            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
        }`}
      >
          {label}
      </button>
  );

  return (
    <div className="space-y-6 animate-in fade-in">

      {/* --- NEW: ADDED LIVE USER TABLE HERE --- */}
        
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Activity className="text-blue-600"/> Network Control Center
            </h3>

            <div className="space-y-6">

              
                {/* Local Network */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Server size={16} className="text-slate-500"/>
                        <span className="text-xs font-bold text-slate-500 uppercase">Local Network (SwiftNet)</span>
                    </div>
                    <div className="flex gap-2">
                        <StatusButton label="Operational" value="operational" current={status.local} onClick={() => updateStatus('local', 'operational')} />
                        <StatusButton label="Slow / Maint." value="degradation" current={status.local} onClick={() => updateStatus('local', 'degradation')} />
                        <StatusButton label="Major Outage" value="outage" current={status.local} onClick={() => updateStatus('local', 'outage')} />
                    </div>
                </div>

                {/* Upstream */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Globe size={16} className="text-slate-500"/>
                        <span className="text-xs font-bold text-slate-500 uppercase">Upstream (PLDT/Globe Backhaul)</span>
                    </div>
                    <div className="flex gap-2">
                        <StatusButton label="Operational" value="operational" current={status.upstream} onClick={() => updateStatus('upstream', 'operational')} />
                        <StatusButton label="High Latency" value="degradation" current={status.upstream} onClick={() => updateStatus('upstream', 'degradation')} />
                        <StatusButton label="Down" value="outage" current={status.upstream} onClick={() => updateStatus('upstream', 'outage')} />
                    </div>
                </div>

                {/* Global Services */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Cloud size={16} className="text-slate-500"/>
                        <span className="text-xs font-bold text-slate-500 uppercase">Global Apps (FB, YouTube)</span>
                    </div>
                    <div className="flex gap-2">
                        <StatusButton label="Operational" value="operational" current={status.global} onClick={() => updateStatus('global', 'operational')} />
                        <StatusButton label="Issues Reported" value="degradation" current={status.global} onClick={() => updateStatus('global', 'degradation')} />
                        <StatusButton label="Down" value="outage" current={status.global} onClick={() => updateStatus('global', 'outage')} />
                    </div>
                </div>
            </div>
        </div>

        {/* Public Message */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Public Incident Message (Ticker)</label>
            <div className="flex gap-2">
                <input 
                    className="flex-1 border p-3 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Fiber Cut in Brgy Marede. Tech dispatched. ETR 2hrs."
                    value={status.message}
                    onChange={e => setStatus({...status, message: e.target.value})}
                />
                <button onClick={handleMessageSave} className="bg-blue-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-blue-700">Update</button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Leave empty to hide the ticker on user dashboard.</p>
        </div>
    </div>
  );
};

const PlanManageModal = ({ plan, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    price: plan?.price || '',
    speed: plan?.speed || '',
    category: plan?.category || 'Home', // <--- NEW: Default Category
    features: plan?.features ? plan.features.join(', ') : '' // Convert array to string for editing
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      // Convert comma-separated string back to array, removing extra spaces
      features: formData.features.split(',').map(f => f.trim()).filter(f => f !== '')
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 text-xl">{plan ? 'Edit Plan' : 'Create New Plan'}</h3>
          <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Plan Name</label>
            <input className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Fiber Unli 1699" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Price (₱)</label>
              <input type="number" className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 transition-colors" placeholder="1699" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Speed</label>
              <input className="w-full border p-3 rounded-xl outline-none focus:border-blue-500 transition-colors" placeholder="200 Mbps" value={formData.speed} onChange={e => setFormData({...formData, speed: e.target.value})} required />
            </div>
          </div>

          {/* --- NEW: CATEGORY DROPDOWN --- */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Category</label>
            <select 
              className="w-full border p-3 rounded-xl bg-white text-slate-700 outline-none focus:border-blue-500 transition-colors cursor-pointer" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
                <option value="Home">Home Fiber</option>
                <option value="Business">Business / Failover</option>
                <option value="Prepaid">Prepaid Kit</option>
            </select>
          </div>
          {/* ----------------------------- */}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Features (Comma separated)</label>
            <textarea className="w-full border p-3 rounded-xl h-24 resize-none outline-none focus:border-blue-500 transition-colors" placeholder="Unlimited Data, Free Modem, Netflix Ready" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} />
          </div>
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30">
            {plan ? 'Update Plan' : 'Create Plan'}
          </button>
        </form>
      </div>
    </div>
  );
};


// --- NEW COMPONENT: Admin QR Code Uploader ---
const PaymentQRSettings = ({ db, appId }) => {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Load existing QR on mount
  useEffect(() => {
    const loadQR = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'payment_qr');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPreview(docSnap.data().image);
        }
      } catch (e) {
        console.error("Error loading QR", e);
      }
    };
    loadQR();
  }, [db, appId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        // Resize to save database space (Max width 500px)
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPreview(canvas.toDataURL('image/jpeg', 0.7)); // Quality 0.7
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      // Save to isp_config_v1 collection
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'payment_qr'), {
        image: preview,
        updatedAt: new Date().toISOString()
      });
      alert("QR Code updated successfully! Subscribers will see this immediately.");
    } catch (e) {
      console.error(e);
      alert("Error saving QR: " + e.message);
    }
    setUploading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-2xl">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <QrCode size={20} className="text-blue-600"/> Payment QR Code Settings
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        Upload your GCash/Maya QR code here. This image will be shown to subscribers when they click "Pay via QR".
      </p>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 rounded-2xl p-4 w-64 h-64 flex items-center justify-center bg-slate-50 hover:bg-white transition-colors">
          <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
          {preview ? (
            <img src={preview} alt="QR Preview" className="w-full h-full object-contain rounded-lg" />
          ) : (
            <div className="text-center text-slate-400">
              <UploadCloud size={32} className="mx-auto mb-2"/>
              <span className="text-xs font-bold">Click to Upload</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-xs leading-relaxed border border-blue-100">
            <strong>Note:</strong> Please ensure the QR code is clear. The system automatically optimizes the image size for faster loading.
          </div>
          <button 
            onClick={handleSave} 
            disabled={uploading || !preview}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
            {uploading ? 'Saving...' : 'Save QR Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RetailerDashboard = ({ user, db, appId, onLogout }) => {
  const [activeTab, setActiveTab] = useState('shop'); 
  const [goods, setGoods] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [buying, setBuying] = useState(null);
  
  // --- NEW STATES FOR TOP-UP FEATURE ---
  const [showTopUpQR, setShowTopUpQR] = useState(false);
  const [paymentQRUrl, setPaymentQRUrl] = useState(null);
  const [topUpForm, setTopUpForm] = useState({ amount: '', ref: '' });
  const [isSubmittingTopUp, setIsSubmittingTopUp] = useState(false);

  // 1. Fetch Admin Payment QR
  useEffect(() => {
    const fetchQR = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'payment_qr');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().image) {
          setPaymentQRUrl(docSnap.data().image);
        }
      } catch (e) { console.error("QR Fetch Error", e); }
    };
    fetchQR();
  }, [db, appId]);

  // Data Fetching for Shop & Inventory
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', DIGITAL_GOODS_COLLECTION));
    const unsub = onSnapshot(q, (s) => setGoods(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [db, appId]);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', USER_INVENTORY_COLLECTION), where('userId', '==', user.uid), orderBy('dateBought', 'desc'));
    const unsub = onSnapshot(q, (s) => setInventory(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [user, db, appId]);

  // --- NEW HANDLER: Submit Top Up Request ---
  const handleRequestTopUp = async (e) => {
    e.preventDefault();
    if(!topUpForm.amount || !topUpForm.ref) return alert("Please fill all fields");
    
    setIsSubmittingTopUp(true);
    try {
        // 1. Create a Payment record for Admin to see in "Payments" tab
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), {
            userId: user.uid,
            username: user.username,
            amount: parseFloat(topUpForm.amount),
            refNumber: topUpForm.ref,
            type: 'Retailer Wallet Top-up',
            status: 'pending_approval',
            date: new Date().toISOString()
        });

        // 2. Create a Ticket to ensure Admin gets a notification
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), {
            ticketId: Math.floor(Math.random() * 900000).toString(),
            userId: user.uid,
            username: user.username,
            subject: "Retailer Top-up Request",
            message: `URGENT: Retailer ${user.username} has sent ₱${topUpForm.amount}. Please verify Reference #${topUpForm.ref} and add credits to their wallet.`,
            status: 'open',
            date: new Date().toISOString(),
            isOrder: true
        });

        alert("Top-up request sent! Admin will verify your payment and load your credits shortly.");
        setShowTopUpQR(false);
        setTopUpForm({ amount: '', ref: '' });
    } catch(e) {
        alert("Error sending request: " + e.message);
    }
    setIsSubmittingTopUp(false);
  };

  const handleBuy = async (item) => {
    if((user.walletCredits || 0) < item.wholesalePrice) return alert("Insufficient credits. Please Top Up your wallet first.");
    if(!confirm(`Purchase ${item.name} for ₱${item.wholesalePrice}?`)) return;
    setBuying(item.id);
    try {
        const newBalance = (user.walletCredits || 0) - item.wholesalePrice;
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.id), { walletCredits: newBalance });
        const purchaseRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', USER_INVENTORY_COLLECTION), {
            userId: user.uid, itemId: item.id, itemName: item.name, cost: item.wholesalePrice, srp: item.srp,
            dateBought: new Date().toISOString(), status: 'Pending Delivery', credentials: '', customerName: ''
        });
        const ticketId = Math.floor(Math.random() * 9000000).toString();
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), {
            ticketId, userId: user.uid, username: user.username,
            subject: `Retailer Order: ${item.name}`,
            message: `AUTO-ORDER: Retailer ${user.username} purchased ${item.name}. Please fulfill Item #${purchaseRef.id}.`,
            status: 'open', date: new Date().toISOString(), isOrder: true, targetInventoryId: purchaseRef.id
        });
        alert("Purchase successful!");
    } catch(e) { alert("Transaction failed."); }
    setBuying(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
        <nav className="bg-purple-900 text-white p-4 shadow-lg sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2"><ShoppingBag className="text-yellow-400"/><span className="font-bold text-lg">SwiftNet<span className="text-yellow-400">Retailer</span></span></div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] uppercase text-purple-300 font-bold">Wallet Balance</p>
                        <p className="font-mono text-xl font-bold text-yellow-400">₱{(user.walletCredits || 0).toLocaleString()}</p>
                    </div>
                    <button onClick={onLogout} className="bg-purple-800 hover:bg-purple-700 p-2 rounded-lg"><LogOut size={18}/></button>
                </div>
            </div>
        </nav>

        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                <button onClick={()=>setActiveTab('shop')} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab==='shop' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}><ShoppingBag size={18}/> Buy Stock</button>
                <button onClick={()=>setActiveTab('inventory')} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab==='inventory' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}><Server size={18}/> Inventory</button>
                <button onClick={()=>setActiveTab('wallet')} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab==='wallet' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}><Wallet size={18}/> Wallet</button>
            </div>
            
            {activeTab === 'shop' && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Wholesale Catalog</h2>
                            <p className="opacity-90">Purchase stock using your wallet balance.</p>
                        </div>
                        <button onClick={() => setShowTopUpQR(true)} className="bg-yellow-400 text-purple-900 px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                            <PlusCircle size={18}/> TOP UP WALLET
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{goods.map(item => (<div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all flex flex-col"><div className="flex justify-between items-start mb-4"><span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded uppercase">{item.category}</span><span className="text-xs font-bold text-slate-400">SRP: ₱{item.srp}</span></div><h3 className="text-xl font-bold text-slate-800 mb-2">{item.name}</h3><p className="text-slate-500 text-sm mb-6 flex-grow">{item.description || "Premium subscription ready for resale."}</p><div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100"><div><p className="text-[10px] text-slate-400 uppercase font-bold">Your Cost</p><p className="text-2xl font-black text-purple-600">₱{item.wholesalePrice}</p></div><button onClick={() => handleBuy(item)} disabled={buying===item.id} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50">{buying===item.id ? 'Buying...' : 'Purchase'}</button></div></div>))}</div>
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"><div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center"><h3 className="font-bold text-slate-700">Stock on Hand</h3><span className="bg-white border px-3 py-1 rounded-lg text-xs font-bold text-slate-500">Total Items: {inventory.length}</span></div><div className="divide-y divide-slate-100">{inventory.map(inv => (<div key={inv.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-slate-50 transition-colors"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><h4 className="font-bold text-slate-800 text-lg">{inv.itemName}</h4><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${inv.status==='Sold' ? 'bg-green-100 text-green-700' : inv.status==='Pending Delivery' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{inv.status}</span></div><p className="text-xs text-slate-500">Purchased: {new Date(inv.dateBought).toLocaleDateString()} • Cost: ₱{inv.cost}</p>{inv.status !== 'Pending Delivery' && (<div className="mt-3 bg-slate-100 p-3 rounded-lg border border-slate-200 font-mono text-sm text-slate-700 break-all select-all">{inv.credentials || "No credentials provided yet."}</div>)}</div><div className="flex items-center gap-2">{inv.status === 'Pending Delivery' ? (<span className="text-xs text-slate-400 italic">Waiting for Admin...</span>) : inv.status === 'Sold' ? (<div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Sold To</p><p className="font-bold text-slate-700">{inv.customerName}</p></div>) : (<button onClick={() => handleMarkSold(inv)} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200">Mark as Sold</button>)}</div></div>))}{inventory.length === 0 && <div className="p-12 text-center text-slate-400">Your inventory is empty.</div>}</div></div>
            )}
            
            {activeTab === 'wallet' && <SwiftWallet user={user} db={db} appId={appId} />}
        </div>

        {/* --- MODAL: TOP UP QR & REQUEST FORM --- */}
        {showTopUpQR && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
                <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                    <div className="bg-purple-700 p-6 text-center text-white shrink-0">
                        <button onClick={() => setShowTopUpQR(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X/></button>
                        <h3 className="text-xl font-bold">Wallet Top-Up</h3>
                        <p className="text-xs opacity-80">Scan QR and submit request below</p>
                    </div>
                    
                    <div className="p-6 overflow-y-auto space-y-6">
                        {/* 1. QR DISPLAY */}
                        <div className="flex flex-col items-center">
                            <div className="bg-slate-100 p-3 rounded-2xl border-2 border-dashed border-slate-200 mb-2">
                                {paymentQRUrl ? (
                                    <img src={paymentQRUrl} alt="Admin QR" className="w-44 h-44 object-contain rounded-lg" />
                                ) : (
                                    <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-[10px] text-center p-4 italic">
                                        QR code not yet uploaded by admin.
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin GCash/Maya QR</p>
                        </div>

                        {/* 2. REQUEST FORM */}
                        <form onSubmit={handleRequestTopUp} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Send size={16} className="text-purple-600"/> Submit Request</h4>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Amount Sent (₱)</label>
                                <input 
                                    type="number" 
                                    className="w-full border p-3 rounded-xl text-lg font-bold bg-white" 
                                    placeholder="0.00" 
                                    value={topUpForm.amount} 
                                    onChange={e => setTopUpForm({...topUpForm, amount: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reference Number</label>
                                <input 
                                    type="text" 
                                    className="w-full border p-3 rounded-xl font-mono bg-white" 
                                    placeholder="GCash Ref No." 
                                    value={topUpForm.ref} 
                                    onChange={e => setTopUpForm({...topUpForm, ref: e.target.value})} 
                                    required 
                                />
                            </div>
                            <button 
                                disabled={isSubmittingTopUp} 
                                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 disabled:opacity-50 transition-all"
                            >
                                {isSubmittingTopUp ? 'Sending Request...' : 'Submit Notification'}
                            </button>
                        </form>
                        
                        <p className="text-[10px] text-center text-slate-400 leading-tight">
                            Admin will manually verify the reference number before credits are added to your wallet.
                        </p>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

// --- [UPDATED] IPTV RESELLER DASHBOARD WITH RENEWAL & SECONDARY INSTANCE ---
const IPTVResellerDashboard = ({ user, db, appId, onLogout }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSub, setNewSub] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // 1. Fetch Reseller's Clients
  useEffect(() => {
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME),
      where('resellerId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (s) => {
      setSubscribers(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user.uid, db, appId]);

  // 2. CREATE CLIENT (Using Secondary Instance)
  const handleCreateSubscriber = async (e) => {
    e.preventDefault();
    
    // Check if Reseller's own account is active
    if (user.status !== 'active') {
      return alert("Your reseller account is EXPIRED. Please renew your own account with Super Admin to create or renew clients.");
    }

    if ((user.walletCredits || 0) < 1) return alert("No Credits! Contact Admin to top up.");
    
    setLoading(true);
    let secondaryApp = null;
    try {
      // THE SECONDARY INSTANCE: Prevents Reseller from being logged out
      // We use a random string to ensure the instance name is unique every time
      const instanceName = `IPTV_Creator_${Date.now()}`;
      secondaryApp = initializeApp(firebaseConfig, instanceName);
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newSub.email, newSub.password);
      const newUid = userCredential.user.uid;

      // Define Client Expiry (30 Days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), {
        uid: newUid,
        username: newSub.username,
        email: newSub.email,
        role: 'subscriber',
        status: 'active',
        resellerId: user.uid,
        isIPTVOnly: true,
        accountNumber: `IPTV-${Math.floor(100000 + Math.random() * 900000)}`,
        balance: 0,
        dueDate: expiryDate.toISOString(),
        dateCreated: new Date().toISOString()
      });

      // Deduct Credit
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.id), {
        walletCredits: increment(-1)
      });

      alert("Client Created! 1 Credit Deducted.");
      setShowAddModal(false);
      setNewSub({ username: '', email: '', password: '' });
      
      // Clean up secondary instance
      await deleteApp(secondaryApp);
    } catch (error) {
      alert("Error: " + error.message);
      if (secondaryApp) await deleteApp(secondaryApp);
    }
    setLoading(false);
  };

  // 3. RENEW CLIENT LOGIC
  const handleRenewClient = async (client) => {
    // Check Reseller Status First
    if (user.status !== 'active') {
      return alert("Access Denied: Your Reseller account is inactive. Renew your account with Admin first.");
    }

    if ((user.walletCredits || 0) < 1) {
      return alert("Insufficient Credits! Please top up to renew clients.");
    }

    if (!confirm(`Renew ${client.username} for another 30 days? (-1 Credit)`)) return;

    try {
      const currentDueDate = new Date(client.dueDate || Date.now());
      const now = new Date();
      
      // If already expired, start from today. If not, add 30 days to existing due date.
      const baseDate = currentDueDate > now ? currentDueDate : now;
      const newDueDate = new Date(baseDate);
      newDueDate.setDate(newDueDate.getDate() + 30);

      const clientRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, client.id);
      await updateDoc(clientRef, {
        dueDate: newDueDate.toISOString(),
        status: 'active'
      });

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.id), {
        walletCredits: increment(-1)
      });

      alert(`${client.username} renewed until ${newDueDate.toLocaleDateString()}`);
    } catch (e) {
      alert("Renewal failed: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-1.5 rounded-lg text-indigo-900"><Tv size={20}/></div>
            <span className="font-black text-xl tracking-tight">IPTV<span className="text-yellow-400">Panel</span></span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] uppercase text-indigo-300 font-bold">Reseller Status: <span className={user.status === 'active' ? 'text-green-400' : 'text-red-400'}>{user.status}</span></p>
              <p className="font-mono text-xl font-bold text-yellow-400">{user.walletCredits || 0} Credits</p>
            </div>
            <button onClick={onLogout} className="bg-indigo-800 p-2 rounded-lg hover:bg-indigo-700 transition-colors"><LogOut size={18}/></button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {user.status !== 'active' && (
          <div className="mb-6 bg-red-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
            <AlertTriangle size={24}/>
            <p className="font-bold">Your Reseller Account has EXPIRED. Creation and Renewals are disabled.</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">My IPTV Subscribers</h2>
          <button 
            disabled={user.status !== 'active'}
            onClick={() => setShowAddModal(true)} 
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <UserPlus size={20}/> New Account
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="px-6 py-4 font-bold">Client Name</th>
                <th className="px-6 py-4 font-bold">Due Date</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscribers.map(s => {
                const isExpired = new Date(s.dueDate) < new Date();
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">{s.username}</td>
                    <td className="px-6 py-4 font-mono">{new Date(s.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleRenewClient(s)}
                        disabled={user.status !== 'active'}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Renew (+30d)
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {subscribers.length === 0 && <div className="p-20 text-center text-slate-400">No clients yet.</div>}
        </div>
      </div>

      {/* Modal remains the same but add status check to button */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-xl mb-6">Create IPTV User</h3>
            <form onSubmit={handleCreateSubscriber} className="space-y-4">
              <input className="w-full border p-3 rounded-xl" placeholder="Username" value={newSub.username} onChange={e=>setNewSub({...newSub, username: e.target.value})} required />
              <input className="w-full border p-3 rounded-xl" type="email" placeholder="Email" value={newSub.email} onChange={e=>setNewSub({...newSub, email: e.target.value})} required />
              <input className="w-full border p-3 rounded-xl" type="text" placeholder="Password" value={newSub.password} onChange={e=>setNewSub({...newSub, password: e.target.value})} required />
              <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">
                {loading ? 'Creating Account...' : 'Activate (-1 Credit)'}
              </button>
              <button type="button" onClick={()=>setShowAddModal(false)} className="w-full text-slate-400 text-sm">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- [FEATURE 3] ZONE STARTER MANAGER (ADMIN) ---
const CrowdfundManager = ({ db, appId }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [newCamp, setNewCamp] = useState({ area: '', target: 20, deadline: '', description: '' });

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'isp_crowdfunds_v1'));
    const unsub = onSnapshot(q, (s) => setCampaigns(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [db, appId]);

  const handleLaunch = async (e) => {
    e.preventDefault();
    if(!newCamp.area) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_crowdfunds_v1'), {
        ...newCamp, current: 0, status: 'Active', dateCreated: new Date().toISOString()
    });
    setNewCamp({ area: '', target: 20, deadline: '', description: '' });
    alert("Campaign Launched!");
  };

  const handleClose = async (id) => {
      if(!confirm("End this campaign?")) return;
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'isp_crowdfunds_v1', id), { status: 'Closed' });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10"><h2 className="text-3xl font-black mb-2 flex items-center gap-3"><Rocket className="text-orange-500"/> Zone Starter</h2><p className="text-blue-200">Launch crowdfunding campaigns to fund new expansion areas risk-free.</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                <h3 className="font-bold text-slate-800 mb-4">Launch New Zone</h3>
                <form onSubmit={handleLaunch} className="space-y-4">
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Target Area</label><input className="w-full border p-2 rounded-lg" placeholder="e.g. Brgy. San Juan" value={newCamp.area} onChange={e=>setNewCamp({...newCamp, area: e.target.value})} required/></div>
                    <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-bold text-slate-500 uppercase">Target Signups</label><input type="number" className="w-full border p-2 rounded-lg" value={newCamp.target} onChange={e=>setNewCamp({...newCamp, target: e.target.value})} required/></div><div><label className="text-xs font-bold text-slate-500 uppercase">Deadline</label><input type="date" className="w-full border p-2 rounded-lg" value={newCamp.deadline} onChange={e=>setNewCamp({...newCamp, deadline: e.target.value})} required/></div></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase">Description / Hook</label><textarea className="w-full border p-2 rounded-lg h-20" placeholder="e.g. If we reach 20 signups, we build fiber next week!" value={newCamp.description} onChange={e=>setNewCamp({...newCamp, description: e.target.value})}></textarea></div>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Launch Campaign</button>
                </form>
            </div>
            <div className="lg:col-span-2 space-y-4">
                {campaigns.map(camp => (
                    <div key={camp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6">
                        <div className="flex-1"><div className="flex justify-between items-start mb-2"><h3 className="font-bold text-xl text-slate-800">{camp.area}</h3><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${camp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{camp.status}</span></div><p className="text-sm text-slate-500 mb-4">{camp.description}</p><div className="space-y-2"><div className="flex justify-between text-xs font-bold text-slate-600"><span>{camp.current} Reserved</span><span>Goal: {camp.target}</span></div><div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000" style={{width: `${(camp.current/camp.target)*100}%`}}></div></div></div></div>
                        <div className="flex flex-col justify-center border-l border-slate-100 pl-6 gap-2"><div className="text-center"><p className="text-3xl font-black text-slate-800">{Math.round((camp.current/camp.target)*100)}%</p><p className="text-xs text-slate-400 uppercase font-bold">Funded</p></div>{camp.status === 'Active' && <button onClick={() => handleClose(camp.id)} className="text-red-500 text-xs font-bold hover:underline mt-2">End Campaign</button>}</div>
                    </div>
                ))}
                {campaigns.length === 0 && <div className="p-10 text-center text-slate-400">No active campaigns.</div>}
            </div>
        </div>
    </div>
  );
};

// --- [FEATURE 3] PUBLIC ZONE WIDGET ---
const ZoneStarterWidget = ({ db, appId }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '' });

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'isp_crowdfunds_v1'), where('status', '==', 'Active'));
    const unsub = onSnapshot(q, (s) => setCampaigns(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [db, appId]);

  const handleReserve = async (e) => {
      e.preventDefault();
      if(!selected || !form.name) return;
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'isp_crowdfunds_v1', selected.id), { current: increment(1) });
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), {
          ticketId: Math.floor(Math.random() * 9000000).toString(),
          subject: `Zone Pre-Order: ${selected.area}`,
          message: `NEW RESERVATION: ${form.name} (${form.contact}) wants to join the ${selected.area} expansion.`,
          status: 'open',
          date: new Date().toISOString(),
          isApplication: true,
          userId: 'GUEST', username: form.name
      });
      alert("Reservation Confirmed! We will contact you once the zone is activated.");
      setSelected(null); setForm({ name: '', contact: '' });
  };

  if(campaigns.length === 0) return null;

  return (
    <div className="my-12">
        <div className="text-center mb-8"><h2 className="text-3xl font-black text-slate-900 mb-2 flex justify-center items-center gap-2"><Rocket className="text-red-600"/> Expansion Zones</h2><p className="text-slate-500">Vote for your area! If we reach the target, we build fiber lines next week.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(camp => (
                <div key={camp.id} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:-translate-y-1 transition-transform">
                    <div className="bg-slate-900 p-4 text-white flex justify-between items-center"><h3 className="font-bold text-lg">{camp.area}</h3><div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded"><TimerReset size={12}/> {new Date(camp.deadline).toLocaleDateString()}</div></div>
                    <div className="p-6">
                        <p className="text-sm text-slate-600 mb-6 h-10">{camp.description}</p>
                        <div className="mb-6"><div className="flex justify-between text-xs font-bold text-slate-500 mb-2"><span>{camp.current} Joined</span><span>Target: {camp.target}</span></div><div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${camp.current >= camp.target ? 'bg-green-500' : 'bg-red-500'} transition-all duration-1000`} style={{width: `${Math.min((camp.current/camp.target)*100, 100)}%`}}></div></div></div>
                        {selected?.id === camp.id ? (
                            <form onSubmit={handleReserve} className="animate-in fade-in">
                                <input className="w-full border p-2 rounded mb-2 text-sm" placeholder="Your Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required/>
                                <input className="w-full border p-2 rounded mb-2 text-sm" placeholder="Phone Number" value={form.contact} onChange={e=>setForm({...form, contact: e.target.value})} required/>
                                <div className="flex gap-2"><button type="button" onClick={()=>setSelected(null)} className="flex-1 bg-slate-200 text-slate-600 py-2 rounded text-xs font-bold">Cancel</button><button className="flex-1 bg-green-600 text-white py-2 rounded text-xs font-bold hover:bg-green-700">Confirm</button></div>
                            </form>
                        ) : (<button onClick={()=>setSelected(camp)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"><ThumbsUp size={18}/> Pre-Order Now</button>)}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

const RouterQRStickerModal = ({ user, onClose }) => {
  useEffect(() => {
    // Small delay to ensure the QR image has loaded before printing
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Use your actual deployed domain here
  const baseUrl = window.location.origin;
  const repairUrl = `${baseUrl}?mode=auto_repair&uid=${user.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(repairUrl)}`;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm px-4 print:bg-white print:inset-0 print:absolute">
      {/* Container - Hidden for screen, visible for print via CSS */}
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-xs w-full text-center border-2 border-slate-100 print:shadow-none print:border-none print:m-0 print:p-4">
        
        <div className="flex flex-col items-center">
          <div className="bg-red-600 text-white p-2 rounded-t-lg w-full mb-0">
             <h2 className="font-black text-sm uppercase tracking-tighter">SwiftNet Support</h2>
          </div>
          
          <div className="border-2 border-red-600 p-4 w-full rounded-b-lg">
            <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Scan for Technical Help</p>
            <img src={qrUrl} alt="Repair QR" className="w-40 h-40 mx-auto mb-3" />
            
            <div className="bg-slate-100 p-2 rounded">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Subscriber</p>
              <p className="text-xs font-black text-slate-800 truncate">{user.username}</p>
              <p className="text-[9px] font-mono text-slate-500">Acct: {user.accountNumber}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="mt-6 w-full py-2 bg-slate-800 text-white rounded-lg font-bold text-xs print:hidden"
        >
          Close & Return
        </button>
      </div>

      {/* Print-only CSS to hide everything else */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .fixed { position: absolute !important; top: 0; left: 0; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const AdminDashboard = ({ subscribers, announcements, payments, tickets, repairs, user }) => {
  const [activeTab, setActiveTab] = useState('subscribers');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showAddTechModal, setShowAddTechModal] = useState(false);
  const [newTech, setNewTech] = useState({ email: '', password: '', username: '' });
  const [showDateModal, setShowDateModal] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [adminNewPass, setAdminNewPass] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', username: '', accountNumber: '', plan: '' });
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', username: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' });
  const [notifyData, setNotifyData] = useState({ targetId: null, targetName: '', title: '', message: '' });
  const [newDueDate, setNewDueDate] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [newJob, setNewJob] = useState({ targetUserId: '', type: 'New Installation', notes: '', assignedTechId: '' });
  
  // Outage States
  const [outages, setOutages] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [newOutage, setNewOutage] = useState({ area: '', message: '', status: 'Active' });
  const [editingUser, setEditingUser] = useState(null);
  const [qrStickerUser, setQrStickerUser] = useState(null);
  const [billingUser, setBillingUser] = useState(null);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // --- 1. Fetch Plans ---
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if(fetchedPlans.length === 0) { ['Fiber 100Mbps', 'Fiber 300Mbps'].forEach(async n => await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION), { name: n })); }
      setPlans(fetchedPlans);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. Fetch Technicians ---
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), where('role', '==', 'technician'));
    const unsubscribe = onSnapshot(q, (snapshot) => { setTechnicians(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    return () => unsubscribe();
  }, []);
  
  // --- 3. Fetch Outages ---
  useEffect(() => {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', OUTAGES_COLLECTION), orderBy('date', 'desc'));
      const unsubscribe = onSnapshot(q, (s) => setOutages(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      return () => unsubscribe();
  }, []);

  // --- 4. Fetch Expenses ---
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', EXPENSES_COLLECTION), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [appId, db]);

  // --- Handlers ---
  const handleStatusChange = async (userId, newStatus) => { try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userId), { status: newStatus }); } catch (e) { console.error(e); } };
  
  const handleChangePassword = async (e) => { e.preventDefault(); if (adminNewPass.length < 6) return alert("Min 6 chars"); try { await updatePassword(auth.currentUser, adminNewPass); alert("Success"); setShowPasswordModal(false); } catch (e) { alert(e.message); } };
  
  const handleAddSubscriber = async (e) => { e.preventDefault(); setIsCreatingUser(true); let secondaryApp = null; try { secondaryApp = initializeApp(firebaseConfig, "Secondary"); const secondaryAuth = getAuth(secondaryApp); const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password); const newUid = userCredential.user.uid; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), { uid: newUid, username: newUser.username, email: newUser.email, accountNumber: newUser.accountNumber, plan: newUser.plan || (plans[0] ? plans[0].name : 'Basic'), balance: 0, status: 'active', role: 'subscriber', dueDate: new Date().toISOString() }); await deleteApp(secondaryApp); setShowAddModal(false); alert("Success"); } catch (e) { alert(e.message); } setIsCreatingUser(false); };
  
  const handleAddAdmin = async (e) => { e.preventDefault(); setIsCreatingUser(true); let secondaryApp = null; try { secondaryApp = initializeApp(firebaseConfig, "SecondaryAdmin"); const secondaryAuth = getAuth(secondaryApp); const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newAdmin.email, newAdmin.password); const newUid = userCredential.user.uid; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), { uid: newUid, username: newAdmin.username, email: newAdmin.email, role: 'admin', accountNumber: 'ADMIN', plan: 'N/A', balance: 0, status: 'active', dueDate: new Date().toISOString() }); await deleteApp(secondaryApp); setShowAddAdminModal(false); alert("Admin created"); } catch (e) { alert(e.message); } setIsCreatingUser(false); };
  
  const handleAddTechnician = async (e) => { e.preventDefault(); setIsCreatingUser(true); let secondaryApp = null; try { secondaryApp = initializeApp(firebaseConfig, "SecondaryTech"); const secondaryAuth = getAuth(secondaryApp); const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newTech.email, newTech.password); const newUid = userCredential.user.uid; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), { uid: newUid, username: newTech.username, email: newTech.email, role: 'technician', accountNumber: 'TECH', plan: 'N/A', balance: 0, status: 'active', dueDate: new Date().toISOString() }); await deleteApp(secondaryApp); setShowAddTechModal(false); alert("Technician created!"); } catch(e) { alert(e.message); } setIsCreatingUser(false); };
  
  const openNewPlanModal = () => {
    setEditingPlan(null);
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (plan) => {
    setEditingPlan(plan);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (planData) => {
    try {
      if (editingPlan) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION, editingPlan.id), planData);
        alert("Plan updated successfully!");
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION), planData);
        alert("New plan created!");
      }
      setIsPlanModalOpen(false);
      setEditingPlan(null);
    } catch (e) {
      console.error(e);
      alert("Error saving plan: " + e.message);
    }
  };

  const handleDeletePlan = async (id) => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION, id)); };
  
  const handlePostAnnouncement = async (e) => { e.preventDefault(); if(!newAnnouncement.title) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION), { ...newAnnouncement, date: new Date().toISOString() }); setShowAnnounceModal(false); };
  
  const handleUpdateDueDate = async (e) => { e.preventDefault(); if (!showDateModal || !newDueDate) return; try { const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, showDateModal.id); await updateDoc(docRef, { dueDate: new Date(newDueDate).toISOString() }); alert("Due date updated successfully!"); setShowDateModal(null); } catch(e) { console.error(e); alert("Failed to update date: " + e.message); } };
  
  const handleReplyTicket = async (ticketId) => { if(!replyText) return; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticketId), { adminReply: replyText, status: 'resolved' }); setReplyingTo(null); setReplyText(''); } catch(e) { alert("Failed"); } };
  
  const handleUpdateRepairStatus = async (repairId, currentStep) => { if (currentStep === 3) { alert("Waiting for customer confirmation. You cannot force complete this step."); return; } const newStep = currentStep < 4 ? currentStep + 1 : 4; const statusLabels = ['Submission', 'Evaluation', 'Processing', 'Customer Confirmation', 'Completed']; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId), { stepIndex: newStep, status: statusLabels[newStep] }); } catch(e) { console.error(e); } };
  
  const handleForceComplete = async (repairId) => { if (!confirm("Force complete this repair? This bypasses customer confirmation.")) return; try { const docRef = doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId); await updateDoc(docRef, { stepIndex: 4, status: 'Completed', completedDate: new Date().toISOString() }); alert("Repair marked as completed by Admin."); } catch(e) { console.error(e); alert("Failed to force complete."); } };
  
  const handleApprovePlanChange = async (ticket) => { if(!confirm(`Approve plan change to ${ticket.targetPlan} for ${ticket.username}?`)) return; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, ticket.userId), { plan: ticket.targetPlan }); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticket.id), { status: 'resolved', adminReply: `Plan change to ${ticket.targetPlan} approved and updated.` }); alert("Plan updated successfully!"); } catch (e) { console.error(e); alert("Failed to update plan."); } };
  
  const handleApproveApplication = async (ticket) => {
    const targetUid = ticket.targetUserId || ticket.userId;
    if (!targetUid) return alert("Error: Cannot identify the user ID.");

    const userRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, targetUid);
    const userSnap = await getDoc(userRef);
    let planToAssign = ticket.targetPlan || (userSnap.exists() ? userSnap.data().plan : '');

    if (!planToAssign) {
        planToAssign = prompt("Please confirm the Plan to assign:", "Fiber 1699");
        if (!planToAssign) return;
    }

    const amountStr = prompt(`Set initial balance/installation fee for ${ticket.username}:`, "1500");
    if (amountStr === null) return;
    const amount = parseFloat(amountStr) || 0;

    // --- AUTOMATIC ACCOUNT NUMBER GENERATION ---
    const autoAccountNo = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // 1. Update User Profile
      await updateDoc(userRef, {
        status: 'active',
        accountNumber: autoAccountNo,
        plan: planToAssign,
        balance: amount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      // 2. Resolve Ticket
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticket.id), {
        status: 'resolved',
        adminReply: `Approved! Account Number ${autoAccountNo} assigned. Plan: ${planToAssign}.`
      });

      // 3. Send Email via EmailJS
      if (userSnap.exists() && userSnap.data().email) {
          await sendCustomEmail('otp', { 
              name: ticket.username,
              email: userSnap.data().email,
              code: autoAccountNo, // Using the 'otp' template logic to highlight the Account No.
              message: `Your application has been approved! Your account is now active under the ${planToAssign}. You can now log in to the portal using your registered email.`
          });
      }

      alert(`Success! Account #${autoAccountNo} is now active and email sent.`);
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    }
  };

  const handleOpenNotify = (sub) => { setNotifyData({ targetId: sub.id, targetName: sub.username, title: '', message: '' }); setShowNotifyModal(true); };
  
  const handleSendNotification = async (e) => { e.preventDefault(); try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', NOTIFICATIONS_COLLECTION), { userId: notifyData.targetId, title: notifyData.title, message: notifyData.message, date: new Date().toISOString(), type: 'info', read: false }); setShowNotifyModal(false); alert("Sent!"); } catch (e) { alert("Failed."); } };
  
  const handleDeleteSubscriber = async (id) => { 
      if (confirm("Delete subscriber? This action is irreversible.")) { 
          try { 
              await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, id)); 
              // --- AUDIT LOG ENTRY ---
              await logAudit(db, appId, user, 'DELETE_USER', id, 'Admin removed subscriber');
              alert("Deleted."); // You can replace this with addToast("Deleted", "success") if you pass addToast prop to AdminDashboard
          } catch (e) { 
              alert("Failed."); 
          } 
      } 
  };
  
  const handleVerifyPayment = async (paymentId, userId, amountPaid, refNumber) => { 
      if (!confirm("Verify payment and generate Official Receipt?")) return; 
      
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return alert("User error.");
      const userData = userSnap.data();

      try { 
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION, paymentId), { 
              status: 'verified', 
              verifiedAt: new Date().toISOString() 
          }); 

          const finalAmount = parseFloat(amountPaid) || 1500;
          const newBalance = (userData.balance || 0) - finalAmount;

          await updateDoc(userRef, { 
              balance: newBalance, 
              status: 'active', 
              lastPaymentDate: new Date().toISOString(),
              points: increment(50) 
          }); 

          const date = new Date();
          const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
          
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', INVOICES_COLLECTION), {
              userId: userId,
              title: `Official Receipt - ${monthName}`,
              date: date.toISOString(),
              type: 'Receipt', 
              refNumber: refNumber, 
              amount: finalAmount, 
              status: 'Paid',
              items: [{ description: 'Payment Verified', amount: finalAmount }]
          });

          if (userData.email) {
              await sendCustomEmail('receipt', {
                  name: userData.username,
                  email: userData.email,
                  amount: `₱${finalAmount.toLocaleString()}`,
                  refNumber: refNumber,
                  message: `Payment verified! We have added the Official Receipt to your Documents tab. You can access through this link: www.jwreport.site`
              });
          }

          alert("Success! Receipt generated & Email sent."); 
      } catch (e) { 
          console.error(e);
          alert("Failed: " + e.message); 
      } 
  };
  
  const handleAssignTech = async (repairId, techUid) => { if(!techUid) return; const tech = technicians.find(t => t.uid === techUid); try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId), { assignedTechId: techUid, assignedTechName: tech.username, stepIndex: 1, status: 'Evaluation' }); } catch(e) { console.error(e); } };
  
  const handleAdminCreateJob = async (e) => { e.preventDefault(); if(!newJob.targetUserId || !newJob.notes) return alert("Select user and add details."); const targetUser = subscribers.find(u => u.id === newJob.targetUserId); const randomId = Math.floor(Math.random() * 10000000000).toString().padStart(11, '0'); const startStep = newJob.assignedTechId ? 1 : 0; const startStatus = newJob.assignedTechId ? 'Evaluation' : 'Submission'; const assignedTechName = newJob.assignedTechId ? technicians.find(t => t.uid === newJob.assignedTechId)?.username : null; try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), { requestId: randomId, userId: targetUser.uid, username: targetUser.username, address: targetUser.address || "Address not set", type: newJob.type, notes: newJob.notes, status: startStatus, stepIndex: startStep, assignedTechId: newJob.assignedTechId || null, assignedTechName: assignedTechName || null, technicianNote: newJob.assignedTechId ? 'Technician assigned by Admin.' : 'Waiting for assignment.', dateFiled: new Date().toISOString() }); setShowCreateJobModal(false); setNewJob({ targetUserId: '', type: 'New Installation', notes: '', assignedTechId: '' }); alert("Job created successfully!"); } catch(e) { console.error(e); alert("Failed to create job."); } };
  
  const handlePostOutage = async (e) => {
      e.preventDefault();
      if(!newOutage.area) return;
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', OUTAGES_COLLECTION), {
              ...newOutage,
              date: new Date().toISOString(),
              status: 'Active'
          });
          setNewOutage({ area: '', message: '', status: 'Active' });
          alert("Outage Posted");
      } catch(e) { console.error(e); }
  };
  
  const handleResolveOutage = async (id) => {
      if(!confirm("Resolve outage?")) return;
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', OUTAGES_COLLECTION, id), { status: 'Resolved' });
      } catch(e) { console.error(e); }
  };

  const filteredSubscribers = subscribers.filter(sub => (sub.username?.toLowerCase().includes(searchTerm.toLowerCase()) || sub.accountNumber?.includes(searchTerm)));
  const activeRepairs = (repairs || []).filter(r => r.status !== 'Completed');
  const historyRepairs = (repairs || []).filter(r => r.status === 'Completed');

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex space-x-1 overflow-x-auto max-w-[95vw] mx-auto md:mx-0 scrollbar-hide">
         {['analytics', 'live', 'marketing', 'remote_access', 'status', 'ads', 'reports', 'cashier', 'coverage', 'expansion', 'expenses', 'store', 'digital_goods', 'subscribers', 'network', 'repairs', 'payments', 'tickets', 'plans', 'speedtest', 'setting'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
                {tab === 'analytics' ? <><Activity size={16} /> Analytics</> : tab === 'live' ? <><Tv size={16}/> Live TV</> : tab === 'marketing' ? <><Sparkles size={16}/> Marketing</> : tab === 'status' ? <><Activity size={16}/> Network Status</> : tab === 'reports' ? <><FileBarChart size={16}/> Reports</> : tab === 'cashier' ? <><Calculator size={16}/> Cashier</> : tab === 'coverage' ? <><Map size={16}/> Coverage</> : tab === 'expansion' ? <><Rocket size={16}/> Expansion</> : tab === 'store' ? <><ShoppingBag size={16}/> Store Manager</> : tab === 'digital_goods' ? <><Server size={16}/> Digital Goods</> : tab === 'expenses' ? <><TrendingDown size={16}/> Expenses</> : tab === 'speedtest' ? <><Gauge size={16} /> Speed Test</> : tab === 'repairs' ? <><Wrench size={16}/> Repairs</> : tab === 'network' ? <><Signal size={16}/> Network</> : tab}
            </button>
         ))}
      </div>
      
      {activeTab === 'live' && <LiveIPTV />}
      {activeTab === 'store' && <ProductManager appId={appId} db={db} />}
      {activeTab === 'digital_goods' && <DigitalGoodsAdmin db={db} appId={appId} />}
      {activeTab === 'remote_access' && <RemoteAccessAdmin db={db} appId={appId} />}
      {activeTab === 'status' && <NetworkStatusManager db={db} appId={appId} />}
      {activeTab === 'ads' && <AdManager db={db} appId={appId} />}
      {activeTab === 'expenses' && <ExpenseManager appId={appId} db={db} subscribers={subscribers} payments={payments} />}
      {activeTab === 'marketing' && (
          <div className="space-y-6">
              <FlashPromoManager db={db} appId={appId} />
              <AdManager db={db} appId={appId} /> 
          </div>
      )}

      {activeTab === 'speedtest' && <SpeedTest />}
      {activeTab === 'analytics' && <AdminAnalytics subscribers={subscribers} payments={payments} tickets={tickets} db={db} appId={appId} />}
      {activeTab === 'reports' && <ReportGenerator payments={payments} expenses={expenses || []} subscribers={subscribers} />}
      {activeTab === 'cashier' && <CashierMode subscribers={subscribers} db={db} appId={appId} />}
      {activeTab === 'setting' && <PaymentQRSettings db={db} appId={appId} />}
      {activeTab === 'coverage' && <ServiceAreaManager appId={appId} db={db} />}
      {activeTab === 'expansion' && (
        <div className="space-y-6">
            <CrowdfundManager db={db} appId={appId} />
            <ServiceAreaManager db={db} appId={appId} /> 
        </div>
      )}
      
      {activeTab === 'subscribers' && (
        <>
           <div className="mb-6 flex justify-between items-center bg-slate-100 p-4 rounded-2xl border border-slate-200">
          <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <Shield size={20}/> System Control
          </h2>
          <MaintenanceSwitch db={db} appId={appId} />
         </div>
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div><h1 className="text-3xl font-bold text-slate-800">User Management</h1><p className="text-slate-500 text-sm mt-1">Total Users: {subscribers.length}</p></div>
            <div className="flex items-center gap-3 flex-wrap">
               <button onClick={() => setShowAnnounceModal(true)} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-sm"><Megaphone size={18} /> Alert</button>
               <button onClick={() => setShowPasswordModal(true)} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-sm"><Lock size={18} /> Pass</button>
               <button onClick={() => setShowStaffModal(true)} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-slate-300"><UserPlus size={18} /> Add Staff</button>
               <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-blue-200"><Plus size={18} /> Add Subscriber</button>
            </div>
          </div>
          <div className="relative w-full"><Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} /><input type="text" placeholder="Search users..." className="pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full bg-white shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-[90vw] mx-auto lg:max-w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200"><tr><th className="px-6 py-4 font-bold">User</th><th className="px-6 py-4 font-bold">Role</th><th className="px-6 py-4 font-bold">Plan</th><th className="px-6 py-4 font-bold">Balance</th><th className="px-6 py-4 font-bold">Points</th><th className="px-6 py-4 font-bold">Due Date</th><th className="px-6 py-4 font-bold">Status</th><th className="px-6 py-4 font-bold text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4"><div>{sub.username}</div><div className="text-xs text-slate-500 flex flex-col"><span>#{sub.accountNumber}</span><span className="text-indigo-500">{sub.email}</span></div></td>
                      <td className="px-6 py-4">{sub.role === 'admin' ? <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 w-fit"><Shield size={10} /> Admin</span> : sub.role === 'technician' ? <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 w-fit"><HardHat size={10} /> Tech</span> : <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Subscriber</span>}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{sub.plan}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">₱{sub.balance?.toFixed(2) || "0.00"}</td>
                      <td className="px-6 py-4 font-bold text-yellow-600 flex items-center gap-1"><Gift size={12}/> {sub.points || 0}</td>
                      <td className="px-6 py-4 text-slate-600 group relative"><div className="flex items-center gap-2">{new Date(sub.dueDate).toLocaleDateString()}<button onClick={() => { setShowDateModal(sub); setNewDueDate(new Date(sub.dueDate).toISOString().split('T')[0]); }} className="opacity-0 group-hover:opacity-100 text-blue-600 hover:bg-blue-100 p-1.5 rounded-md transition-all"><Calendar size={14} /></button></div></td>
                      <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${sub.status === 'active' ? 'bg-green-100 text-green-700' : sub.status === 'disconnected' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>{sub.status}</span></td>
                      <td className="px-6 py-4 text-right space-x-2 flex justify-end items-center">{sub.role !== 'admin' && sub.role !== 'technician' && (<><button onClick={() => setEditingUser(sub)} className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors mr-1" title="Edit Details"><Edit size={16} /></button><button 
  onClick={() => setQrStickerUser(sub)} 
  className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-md transition-colors" 
  title="Print Router Sticker"
>
  <QrCode size={16} />
</button><button onClick={() => handleOpenNotify(sub)} className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-md transition-colors" title="Send Notification"><Bell size={16} /></button><button onClick={() => setBillingUser(sub)} className="text-blue-600 hover:text-blue-900 text-xs font-bold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">+ Bill</button>{sub.status === 'active' ? <button onClick={() => handleStatusChange(sub.id, 'disconnected')} className="text-red-600 hover:text-red-900 text-xs font-bold border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Cut</button> : <button onClick={() => handleStatusChange(sub.id, 'active')} className="text-green-600 hover:text-green-900 text-xs font-bold border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">Restore</button>}<button onClick={() => handleDeleteSubscriber(sub.id)} className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors ml-2" title="Delete User"><UserX size={16} /></button></>)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
       
       {activeTab === 'network' && (
           <div className="space-y-6">
               <div className="flex justify-between items-center">
                   <div><h2 className="text-2xl font-bold text-slate-800">Network Status Center</h2><p className="text-sm text-slate-500">Manage service outages and maintenance alerts.</p></div>
               </div>
              <WeatherWidget />
               
               
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                   <h3 className="font-bold mb-4">Post New Outage/Alert</h3>
                   <form onSubmit={handlePostOutage} className="flex gap-4 items-end">
                       <div className="flex-1">
                           <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Affected Area</label>
                           <input className="w-full border p-2 rounded-lg text-sm" placeholder="e.g. Brgy. Marede" value={newOutage.area} onChange={e=>setNewOutage({...newOutage, area: e.target.value})} />
                       </div>
                       <div className="flex-[2]">
                           <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Message/Reason</label>
                           <input className="w-full border p-2 rounded-lg text-sm" placeholder="e.g. Fiber cut due to road works. ETR 4 hours." value={newOutage.message} onChange={e=>setNewOutage({...newOutage, message: e.target.value})} />
                       </div>
                       <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-700">Post Alert</button>
                   </form>
               </div>
               <div className="space-y-4">
                   <h3 className="font-bold text-slate-700">Active Alerts</h3>
                   {outages.map(outage => (
                       <div key={outage.id} className={`p-4 rounded-xl border flex justify-between items-center ${outage.status === 'Resolved' ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-red-50 border-red-200'}`}>
                           <div>
                               <div className="flex items-center gap-2">
                                   <h4 className="font-bold text-slate-800">{outage.area}</h4>
                                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${outage.status === 'Resolved' ? 'bg-gray-200 text-gray-600' : 'bg-red-200 text-red-800'}`}>{outage.status}</span>
                               </div>
                               <p className="text-sm text-slate-600">{outage.message}</p>
                               <p className="text-xs text-slate-400 mt-1">{new Date(outage.date).toLocaleString()}</p>
                           </div>
                           {outage.status !== 'Resolved' && (
                               <button onClick={() => handleResolveOutage(outage.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700">Mark Resolved</button>
                           )}
                       </div>
                   ))}
                   {outages.length === 0 && <p className="text-slate-400 text-center py-8">No network alerts recorded.</p>}
               </div>
           </div>
       )}

        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Support Tickets & Applications</h2>
            <div className="grid grid-cols-1 gap-4">
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-5 rounded-xl shadow-sm border ${
                      ticket.isApplication
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-slate-800">
                          #{ticket.ticketId || '---'} - {ticket.subject}{' '}
                          {ticket.isApplication && (
                            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full ml-2">
                              APPLICATION
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500">
                          From: <span className="font-bold text-blue-600">{ticket.username}</span> •{' '}
                          {new Date(ticket.date).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          ticket.status === 'open'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    {/* Message Body */}
                    <p className="text-slate-700 text-sm mb-4 whitespace-pre-wrap">{ticket.message}</p>

                    {/* Attachment Viewer */}
                    {ticket.attachmentUrl && (
                      <div className="mb-4 bg-slate-100 p-3 rounded-lg border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                          Attached Document
                        </p>
                        <img
                          src={ticket.attachmentUrl}
                          alt="Attachment"
                          className="h-32 object-contain rounded-md border border-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity bg-white"
                          onClick={() => {
                            const w = window.open("");
                            w.document.write('<img src="' + ticket.attachmentUrl + '" style="width:100%"/>');
                          }}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    {ticket.isPlanChange && ticket.status === 'open' && (
                      <button
                        onClick={() => handleApprovePlanChange(ticket)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg mb-3 shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} /> Approve Plan Change
                      </button>
                    )}
                    {ticket.isApplication && ticket.status === 'open' && (
                      <button
                        onClick={() => handleApproveApplication(ticket)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg mb-3 shadow-md transition-colors"
                      >
                        Approve & Assign Account #
                      </button>
                    )}

                    {/* Reply Section */}
                    {ticket.adminReply ? (
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Your Reply</p>
                        <p className="text-sm text-blue-700 font-medium">{ticket.adminReply}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        {replyingTo === ticket.id ? (
                          <div className="w-full">
                            <textarea
                              className="w-full border border-slate-300 rounded-lg p-2 text-sm mb-2"
                              rows="3"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            ></textarea>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="text-slate-500 text-sm font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReplyTicket(ticket.id)}
                                className="bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-lg"
                              >
                                Send Reply
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingTo(ticket.id);
                              setReplyText('');
                            }}
                            className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors"
                          >
                            <MessageSquare size={16} /> Reply
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400">
                  No tickets found.
                </div>
              )}
            </div>
          </div>
        )}

       {activeTab === 'repairs' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
               <div><h2 className="text-2xl font-bold text-slate-800">Repair & Installation Requests</h2><p className="text-sm text-slate-500">Track service jobs.</p></div>
               <div className="flex gap-2">
                   <button onClick={() => setShowCreateJobModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2"><Briefcase size={18} /> Create Job</button>
                   <button onClick={() => setShowRepairModal(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-700 shadow-lg flex items-center gap-2"><Hammer size={18} /> Request Repair</button>
               </div>
            </div>
            <div className="space-y-4">
               {activeRepairs && activeRepairs.length > 0 ? activeRepairs.map(repair => (<RepairStatusCard key={repair.id} repair={repair} isSubscriber={false} technicians={technicians} onAssign={handleAssignTech} isAdmin={true} onTechUpdate={handleUpdateRepairStatus} onForceComplete={handleForceComplete} />)) : <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">No active jobs.</div>}
            </div>
            <div className="pt-8 border-t border-slate-200"><h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Clock size={18}/> Job History</h3>{historyRepairs && historyRepairs.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">{historyRepairs.map(repair => (<RepairStatusCard key={repair.id} repair={repair} isSubscriber={false} />))}</div>) : <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-sm">No completed history.</div>}</div>
         </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Internet Plans</h2>
              <p className="text-sm text-slate-500">These plans appear on the Landing Page.</p>
            </div>
            <button onClick={openNewPlanModal} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg">
              <Plus size={18}/> Add Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative group hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl text-slate-800">{p.name}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => openEditPlanModal(p)} className="text-slate-400 hover:text-blue-600"><Edit size={18}/></button>
                    <button onClick={() => handleDeletePlan(p.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                </div>
                
                <div className="text-3xl font-black text-blue-600 mb-2">
                  ₱{p.price || '0'}<span className="text-sm text-slate-400 font-medium">/mo</span>
                </div>
                <div className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500"/> {p.speed || 'N/A'}
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  {p.features && p.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={14} className="text-green-500"/> {feat}
                    </div>
                  ))}
                  {(!p.features || p.features.length === 0) && <span className="text-xs text-slate-400 italic">No features listed</span>}
                </div>
              </div>
            ))}
            {plans.length === 0 && <p className="col-span-full text-center text-slate-400 py-10">No plans configured yet.</p>}
          </div>

          {/* Render the Modal */}
          {isPlanModalOpen && (
            <PlanManageModal 
              plan={editingPlan} 
              onClose={() => setIsPlanModalOpen(false)} 
              onSave={handleSavePlan} 
            />
          )}
        </div>
      )}

       {activeTab === 'payments' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold mb-4 text-slate-800">Payments & Verifications</h3>
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p.id} className="flex flex-col md:flex-row justify-between items-center border-b border-slate-100 pb-3 last:border-0 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                
                <div className="mb-2 md:mb-0 w-full md:w-auto">
                  <span className="font-bold text-slate-800 block">{p.username}</span>
                  <span className="text-xs text-slate-400">{new Date(p.date).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto mb-2 md:mb-0">
                   <span className="font-mono text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded text-sm">{p.refNumber}</span>
                   <span className="font-bold text-slate-700">₱{parseFloat(p.amount || 0).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    
                    {p.proofImage ? (
                        <button 
                           onClick={() => {
                                const win = window.open("");
                                win.document.write(
                                    `<iframe src="${p.proofImage}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                                );
                            }}
                           className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                        >
                           <Image size={16}/> View Proof
                        </button>
                    ) : (
                        <span className="text-xs text-slate-400 italic">No Image</span>
                    )}

                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                       {p.status || 'pending'}
                    </span>

                    {p.status !== 'verified' && (
                       <button 
                         onClick={() => handleVerifyPayment(p.id, p.userId, p.amount, p.refNumber)} 
                         className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-sm"
                       >
                           Verify
                       </button>
                    )}
                </div>
              </div>
            ))}
            {payments.length === 0 && <p className="text-center text-slate-400 py-8">No payments found.</p>}
          </div>
        </div>
      )}
       {activeTab === 'speedtest' && <SpeedTest />}
       
       {showCreateJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6">
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Briefcase size={18} /> Create New Job</h3><button onClick={() => setShowCreateJobModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button></div>
             <form onSubmit={handleAdminCreateJob}>
                <div className="space-y-3">
                   <div><label className="text-xs font-bold text-slate-500 uppercase">Select User</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={newJob.targetUserId} onChange={(e) => setNewJob({...newJob, targetUserId: e.target.value})} required><option value="">-- Select User --</option>{subscribers.filter(s => s.role !== 'admin' && s.role !== 'technician').map(u => (<option key={u.id} value={u.id}>{u.username} ({u.accountNumber})</option>))}</select></div>
                   <div><label className="text-xs font-bold text-slate-500 uppercase">Job Type</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={newJob.type} onChange={(e) => setNewJob({...newJob, type: e.target.value})}><option value="New Installation">New Installation</option><option value="Service Repair">Service Repair</option><option value="Maintenance">Maintenance</option></select></div>
                   <div><label className="text-xs font-bold text-slate-500 uppercase">Job Details / Notes</label><textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 h-24 resize-none" placeholder="Enter installation details or issue description..." value={newJob.notes} onChange={(e) => setNewJob({...newJob, notes: e.target.value})} required></textarea></div>
                   <div><label className="text-xs font-bold text-slate-500 uppercase">Assign Technician (Optional)</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={newJob.assignedTechId} onChange={(e) => setNewJob({...newJob, assignedTechId: e.target.value})}><option value="">-- Assign Later --</option>{technicians.map(t => (<option key={t.id} value={t.uid}>{t.username}</option>))}</select></div>
                   <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700">Create Job Ticket</button>
                </div>
             </form>
          </div>
        </div>
       )}
       {showAddTechModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6"><div className="bg-orange-600 p-5 flex justify-between items-center -m-6 mb-6"><h3 className="text-white font-bold flex items-center gap-2"><HardHat size={18} /> Add New Technician</h3><button onClick={() => setShowAddTechModal(false)} className="text-white/80 hover:text-white"><X size={24} /></button></div><form onSubmit={handleAddTechnician} className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tech Name</label><input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={newTech.username} onChange={(e) => setNewTech({...newTech, username: e.target.value})} placeholder="Technician Name" /></div><div className="border-t border-slate-100 pt-2"></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label><input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={newTech.email} onChange={(e) => setNewTech({...newTech, email: e.target.value})} /></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label><input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono" value={newTech.password} onChange={(e) => setNewTech({...newTech, password: e.target.value})} /></div><button type="submit" disabled={isCreatingUser} className="w-full py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700">{isCreatingUser ? 'Creating...' : 'Create Technician Account'}</button></form></div></div>)}
       {showAddAdminModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6"><h3 className="font-bold mb-4">Add Admin</h3><form onSubmit={handleAddAdmin} className="space-y-4"><input className="w-full border p-2 rounded" placeholder="Name" value={newAdmin.username} onChange={e=>setNewAdmin({...newAdmin, username: e.target.value})}/><input className="w-full border p-2 rounded" placeholder="Email" value={newAdmin.email} onChange={e=>setNewAdmin({...newAdmin, email: e.target.value})}/><input className="w-full border p-2 rounded" type="password" placeholder="Password" value={newAdmin.password} onChange={e=>setNewAdmin({...newAdmin, password: e.target.value})}/><div className="flex justify-end gap-2"><button onClick={()=>setShowAddAdminModal(false)} className="text-slate-500">Cancel</button><button className="bg-slate-800 text-white px-4 py-2 rounded">Create</button></div></form></div></div>)}
       {showAddModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"><h3 className="font-bold mb-4">Add Subscriber</h3><form onSubmit={handleAddSubscriber} className="space-y-4"><input className="w-full border p-2 rounded" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})}/><input className="w-full border p-2 rounded" placeholder="Account #" value={newUser.accountNumber} onChange={e=>setNewUser({...newUser, accountNumber: e.target.value})}/><input className="w-full border p-2 rounded" placeholder="Email" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})}/><input className="w-full border p-2 rounded" type="password" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})}/><div className="flex justify-end gap-2"><button onClick={()=>setShowAddModal(false)} className="text-slate-500">Cancel</button><button className="bg-blue-600 text-white px-4 py-2 rounded">Add</button></div></form></div></div>)}
       {showAnnounceModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"><h3 className="font-bold mb-4">Post Announcement</h3><input className="w-full border p-2 rounded mb-2" placeholder="Title" value={newAnnouncement.title} onChange={e=>setNewAnnouncement({...newAnnouncement, title: e.target.value})}/><textarea className="w-full border p-2 rounded mb-2" placeholder="Message" value={newAnnouncement.message} onChange={e=>setNewAnnouncement({...newAnnouncement, message: e.target.value})}></textarea><div className="flex justify-end gap-2"><button onClick={()=>setShowAnnounceModal(false)} className="text-slate-500">Cancel</button><button onClick={handlePostAnnouncement} className="bg-blue-600 text-white px-4 py-2 rounded">Post</button></div></div></div>)}
       {showPasswordModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"><h3 className="font-bold mb-4">Change Password</h3><input className="w-full border p-2 rounded mb-4" type="password" placeholder="New Password" value={adminNewPass} onChange={e=>setAdminNewPass(e.target.value)}/><div className="flex justify-end gap-2"><button onClick={()=>setShowPasswordModal(false)} className="text-slate-500">Cancel</button><button onClick={handleChangePassword} className="bg-blue-600 text-white px-4 py-2 rounded">Update</button></div></div></div>)}
       {showDateModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200"><div className="bg-blue-700 p-5 flex justify-between items-center"><h3 className="text-white font-bold">Change Due Date</h3><button onClick={() => setShowDateModal(null)} className="text-white/80 hover:text-white"><X size={24} /></button></div><form onSubmit={handleUpdateDueDate} className="p-6 space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Due Date</label><input type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} /></div><button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Update Date</button></form></div></div>)}
       {editingUser && (
        <EditSubscriberModal 
            user={editingUser} 
            plans={plans} 
            db={db} 
            appId={appId} 
            onClose={() => setEditingUser(null)} 
        />
        )}
       {showNotifyModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6"><div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Bell size={18} /> Notify {notifyData.targetName}</h3><button onClick={() => setShowNotifyModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button></div><form onSubmit={handleSendNotification}><div className="space-y-3"><div><label className="text-xs font-bold text-slate-500 uppercase">Title</label><input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="e.g. Payment Received" value={notifyData.title} onChange={(e) => setNotifyData({...notifyData, title: e.target.value})} required /></div><div><label className="text-xs font-bold text-slate-500 uppercase">Message</label><textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 h-24 resize-none" placeholder="Write your message here..." value={notifyData.message} onChange={(e) => setNotifyData({...notifyData, message: e.target.value})} required ></textarea></div><button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700">Send Notification</button></div></form></div></div>)}
       
       {qrStickerUser && (
          <div className="print-area">
            <RouterQRStickerModal user={qrStickerUser} onClose={() => setQrStickerUser(null)} />
          </div>
        )}
       {/* Billing Modal Render */}
     {billingUser && (
       <BillingModal 
           user={billingUser} 
           db={db} 
           appId={appId} 
           onClose={() => setBillingUser(null)} 
       />
     )}
     {showStaffModal && <AddStaffModal onClose={() => setShowStaffModal(false)} />}
     </div>
   );
};

const CashierDashboard = ({ subscribers, db, appId }) => {
    return (
        <div className="p-6 animate-in fade-in">
            <div className="mb-6 flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-xl text-green-700">
                    <Calculator size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Billing Station</h1>
                    <p className="text-slate-500 text-sm">Authorized Personnel Only</p>
                </div>
            </div>
            {/* Reusing the CashierMode component we built earlier */}
            <CashierMode subscribers={subscribers} db={db} appId={appId} />
        </div>
    );
};

// 5. New Technician Dashboard (Unchanged)
const TechnicianDashboard = ({ repairs, onTechUpdate }) => {
    const activeTechRepairs = (repairs || []).filter(r => r.status === 'Evaluation' || r.status === 'Processing');
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
               {activeTechRepairs.length > 0 ? activeTechRepairs.map(repair => (
                   <RepairStatusCard key={repair.id} repair={repair} isSubscriber={false} isTechnician={true} onTechUpdate={onTechUpdate} />
               )) : <div className="text-center py-20 bg-white rounded-2xl border border-slate-200"><CheckCircle size={48} className="mx-auto text-green-300 mb-3" /><p className="text-slate-500">All active repairs completed!</p></div>}
            </div>
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

// --- SHARED PUBLIC NAVBAR ---
const PublicNavbar = ({ onNavigate, onLogin, activePage, onQuickPay }) => (
  <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="bg-red-600 p-2 rounded-lg">
            <Wifi className="text-white h-6 w-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">
            SwiftNet<span className="text-red-600">Home</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-600">
          {['plans', 'coverage', 'community', 'support', 'about'].map((item) => (
            <button 
              key={item}
              onClick={() => onNavigate(item)}
              className={`uppercase transition-colors ${activePage === item ? 'text-red-600' : 'hover:text-red-600'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
            {/* NEW QUICK PAY BUTTON */}
            <button onClick={onQuickPay} className="hidden md:flex items-center gap-1 text-slate-600 hover:text-blue-600 font-bold text-sm mr-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all">
                <Zap size={16}/> Quick Pay
            </button>
            <button onClick={onLogin} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-red-200">
            My Account
            </button>
        </div>
      </div>
    </div>
  </nav>
);

// --- 1. SUPPORT PAGE ---
const SupportPage = ({ onNavigate, onLogin }) => (
  <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
    <PublicNavbar onNavigate={onNavigate} onLogin={onLogin} activePage="support" />
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-slate-900 mb-4">How can we help?</h1>
        <p className="text-slate-500 text-lg">Our technical team is on standby 24/7.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><Phone size={24}/></div>
          <h3 className="font-bold text-lg mb-2">Call Us</h3>
          <p className="text-slate-500">0968-385-9759</p>
          <p className="text-slate-400 text-sm mt-1">Mon-Sun, 8AM - 8PM</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600"><Mail size={24}/></div>
          <h3 className="font-bold text-lg mb-2">Email Support</h3>
          <p className="text-slate-500">ramoshowardkingsley58@gmail.com</p>
          <p className="text-slate-400 text-sm mt-1">Response within 24 hours</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600"><MapPin size={24}/></div>
          <h3 className="font-bold text-lg mb-2">Visit Office</h3>
          <p className="text-slate-500">Santa Ana, Cagayan</p>
          <p className="text-slate-400 text-sm mt-1">Walk-ins Welcome</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white">
          <h3 className="font-bold text-xl">Frequently Asked Questions</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { q: "How do I pay my bill?", a: "You can pay via GCash, Maya, or Bank Transfer directly from your user dashboard." },
            { q: "What is the lock-in period?", a: "Our standard fiber plans come with a 24-month lock-in period." },
            { q: "My internet is slow, what do I do?", a: "Try restarting your modem for 10 seconds. If the issue persists, create a ticket in your dashboard." }
          ].map((faq, i) => (
            <div key={i} className="p-6">
              <h4 className="font-bold text-slate-800 mb-2">{faq.q}</h4>
              <p className="text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- 2. COVERAGE PAGE ---
const CoveragePage = ({ onNavigate, onLogin, db, appId }) => {
  const [areas, setAreas] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'isp_service_areas_v1'));
    const unsub = onSnapshot(q, (s) => setAreas(s.docs.map(d => d.data())));
    return () => unsub();
  }, [db, appId]);

  const filtered = areas.filter(a => 
    a.city.toLowerCase().includes(search.toLowerCase()) || 
    a.barangay.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <PublicNavbar onNavigate={onNavigate} onLogin={onLogin} activePage="coverage" />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Service Availability</h1>
          <p className="text-slate-500">Check if SwiftNet Fiber is available in your area.</p>
        </div>

        <ZoneStarterWidget db={db} appId={appId} />
        <div className="border-t border-slate-200 my-12"></div>

        <div className="max-w-md mx-auto mb-12 relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20}/>
          <input 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Search Barangay or City..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((area, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">{area.barangay}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest">{area.city}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${area.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {area.status}
              </span>
            </div>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-center text-slate-400">No areas found matching your search.</p>}
        </div>
      </div>
    </div>
  );
};

// --- HELPER: Image Compressor (Keeps Firestore fast) ---
const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600; // Limit width to 600px
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.6)); // 60% Quality
            };
        };
    });
};

// --- COMPONENT: FRIEND MANAGER (FIXED) ---
const FriendManager = ({ user, db, appId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [requests, setRequests] = useState([]);
    const [friends, setFriends] = useState([]);

    // Load Friends & Requests
    useEffect(() => {
        if (!user?.uid) return;
        const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'isp_users_v1', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                setFriends(docSnap.data().friends || []);
                setRequests(docSnap.data().friendRequests || []);
            }
        });
        return () => unsub();
    }, [user, db, appId]);

    const handleSearch = async () => {
        if (!searchTerm) return;
        setSearchResults([]); // Clear previous
        
        // Simple search: Find users where username >= searchTerm
        // Note: Firestore is case-sensitive. Ideally, store a lowercase username field.
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'isp_users_v1'), 
            where('username', '>=', searchTerm), 
            where('username', '<=', searchTerm + '\uf8ff')
        );
        
        const snap = await getDocs(q);
        const results = snap.docs
            .map(d => ({uid: d.id, ...d.data()}))
            .filter(u => u.uid !== user.uid); // Don't show self

        setSearchResults(results);
        if(results.length === 0) alert("No users found.");
    };

    const sendRequest = async (targetUser) => {
        try {
            const targetRef = doc(db, 'artifacts', appId, 'public', 'data', 'isp_users_v1', targetUser.uid);
            await updateDoc(targetRef, {
                friendRequests: arrayUnion({ uid: user.uid, username: user.username })
            });
            alert(`Request sent to ${targetUser.username}!`);
        } catch (e) {
            console.error(e);
            alert("Error sending request.");
        }
    };

    const acceptRequest = async (requester) => {
        try {
            const myRef = doc(db, 'artifacts', appId, 'public', 'data', 'isp_users_v1', user.uid);
            const theirRef = doc(db, 'artifacts', appId, 'public', 'data', 'isp_users_v1', requester.uid);

            // Add to both sides
            await updateDoc(myRef, {
                friends: arrayUnion({ uid: requester.uid, username: requester.username }),
                friendRequests: arrayRemove(requester)
            });
            await updateDoc(theirRef, {
                friends: arrayUnion({ uid: user.uid, username: user.username })
            });
            alert("Friend Added!");
        } catch (e) {
            alert("Error accepting request.");
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><UserPlus size={18}/> Friends</h3>
            
            {/* Friend Requests */}
            {requests.length > 0 && (
                <div className="mb-4 bg-yellow-50 p-3 rounded-lg animate-in slide-in-from-top-2">
                    <p className="text-xs font-bold text-yellow-800 uppercase mb-2">Pending Requests</p>
                    {requests.map((req, i) => (
                        <div key={i} className="flex justify-between items-center mb-2 last:mb-0">
                            <span className="text-sm font-bold">{req.username}</span>
                            <button onClick={() => acceptRequest(req)} className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700">Accept</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Search */}
            <div className="flex gap-2 mb-4">
                <input className="border p-2 rounded-lg w-full text-sm outline-none focus:border-blue-500" placeholder="Find people..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}/>
                <button onClick={handleSearch} className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-700"><Search size={16}/></button>
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto mb-4 border border-slate-100 rounded-lg">
                    {searchResults.map(u => (
                        <div key={u.uid} className="flex justify-between items-center p-2 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                            <span className="text-sm font-medium">{u.username}</span>
                            <button onClick={() => sendRequest(u)} className="text-blue-600 text-xs font-bold hover:bg-blue-50 px-2 py-1 rounded">+ Add</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Friend List */}
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">My Friends ({friends.length})</p>
                <div className="flex flex-wrap gap-2">
                    {friends.map((f, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div> {f.username}
                        </span>
                    ))}
                    {friends.length === 0 && <p className="text-xs text-slate-400 italic">No friends yet.</p>}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: VIDEO CALL MODAL (Jitsi Embed) ---
const VideoCallModal = ({ roomName, onClose, username }) => {
    // Generates a unique, secure room URL
    // Using a community server (Guifi.net) that allows anonymous rooms
const jitsiUrl = `https://meet.guifi.net/${roomName}#config.prejoinPageEnabled=false&userInfo.displayName="${username}"`;

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white border-b border-slate-700">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                    <Video size={24} className="text-red-500 animate-pulse"/> 
                    Secure Video Call
                </h3>
                <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm">
                    End Call
                </button>
            </div>
            <div className="flex-1 relative">
                <iframe 
                    src={jitsiUrl} 
                    className="w-full h-full border-0" 
                    allow="camera; microphone; fullscreen; display-capture"
                ></iframe>
            </div>
        </div>
    );
};

// --- COMPONENT: CHAT SYSTEM (FIXED VIDEO CALLS) ---
const ChatSystem = ({ user, db, appId }) => {
    const [activeChat, setActiveChat] = useState(null);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatImage, setChatImage] = useState(null);
    const [friends, setFriends] = useState([]);
    
    // Group Chat States
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    
    const [activeCall, setActiveCall] = useState(null);

    // 1. Fetch My Chats
    useEffect(() => {
        if (!user?.uid) return;
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'isp_chats_v1'), where('participants', 'array-contains', user.uid), orderBy('lastUpdated', 'desc'));
        const unsub = onSnapshot(q, (s) => setChats(s.docs.map(d => ({id: d.id, ...d.data()}))));
        
        getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'isp_users_v1', user.uid)).then(s => {
            if(s.exists()) setFriends(s.data().friends || []);
        });
        return () => unsub();
    }, [user, db, appId]);

    // 2. Fetch Messages
    useEffect(() => {
        if(!activeChat) return;
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'isp_chats_v1', activeChat.id, 'messages'), orderBy('timestamp', 'asc'));
        const unsub = onSnapshot(q, (s) => setMessages(s.docs.map(d => d.data())));
        return () => unsub();
    }, [activeChat, db, appId]);

    const handleSendMessage = async (customText = null, type = 'text') => {
        if(!newMessage && !chatImage && !customText) return;
        
        let imgUrl = null;
        if(chatImage) imgUrl = await compressImage(chatImage);

        const msgData = {
            senderId: user.uid,
            senderName: user.username,
            text: customText || newMessage,
            image: imgUrl,
            type: type,
            timestamp: new Date().toISOString()
        };

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_chats_v1', activeChat.id, 'messages'), msgData);
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'isp_chats_v1', activeChat.id), {
            lastMessage: type === 'call' ? '📞 Video Call started' : (newMessage || 'Sent an image'),
            lastUpdated: new Date().toISOString()
        });

        setNewMessage('');
        setChatImage(null);
    };

    const startDirectChat = async (friend) => {
        const existingChat = chats.find(c => c.type === 'direct' && c.participants.includes(friend.uid));
        if (existingChat) {
            setActiveChat(existingChat);
        } else {
            const ref = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_chats_v1'), { 
                name: friend.username, 
                participants: [user.uid, friend.uid], 
                type: 'direct', 
                lastMessage: 'Chat started', 
                lastUpdated: new Date().toISOString() 
            });
            setActiveChat({ id: ref.id, name: friend.username, type: 'direct' });
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName || selectedMembers.length === 0) return alert("Enter name and select members");
        const participantIds = [user.uid, ...selectedMembers.map(m => m.uid)];
        const ref = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_chats_v1'), {
            name: newGroupName,
            participants: participantIds,
            type: 'group',
            createdBy: user.username,
            lastMessage: 'Group created',
            lastUpdated: new Date().toISOString()
        });
        setActiveChat({ id: ref.id, name: newGroupName, type: 'group' });
        setShowCreateGroup(false);
        setNewGroupName('');
        setSelectedMembers([]);
    };

    const toggleMemberSelection = (friend) => {
        if (selectedMembers.find(m => m.uid === friend.uid)) {
            setSelectedMembers(prev => prev.filter(m => m.uid !== friend.uid));
        } else {
            setSelectedMembers(prev => [...prev, friend]);
        }
    };

    // --- FIX IS HERE ---
    const startVideoCall = async () => {
        // 1. Generate unique Room ID
        const roomName = `SwiftNet-${activeChat.id}-${Date.now()}`;
        
        // 2. Embed the Room ID into the message text with a separator "||"
        await handleSendMessage(`JOIN_CALL||${roomName}`, 'call');
        
        // 3. Join that specific room
        setActiveCall(roomName);
    };

    const joinVideoCall = (messageText) => {
        // 1. Extract the Room ID from the message
        const roomName = messageText.split('||')[1]; 
        if(roomName) setActiveCall(roomName);
        else alert("Error: Invalid Room ID");
    };
    // -------------------

    return (
        <>
            {activeCall && <VideoCallModal roomName={activeCall} username={user.username} onClose={() => setActiveCall(null)} />}

            <div className="fixed bottom-0 right-4 w-80 bg-white shadow-2xl rounded-t-xl border border-slate-300 flex flex-col z-[100]" style={{height: activeChat ? '500px' : 'auto'}}>
                <div className="bg-slate-900 text-white p-3 rounded-t-xl flex justify-between items-center cursor-pointer shadow-md" onClick={() => !activeChat && setShowCreateGroup(false)}>
                    <div className="font-bold flex items-center gap-2">
                        {activeChat ? (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); setActiveChat(null); }}><ArrowDownLeft size={16}/></button>
                                <span>{activeChat.name}</span>
                            </>
                        ) : (
                            <><MessageCircle size={18}/> Messaging</>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {!activeChat && (
                            <button onClick={(e) => { e.stopPropagation(); setShowCreateGroup(!showCreateGroup); }} className="bg-slate-700 p-1.5 rounded-full hover:bg-slate-600 text-xs" title="Create Group"><Plus size={14} /></button>
                        )}
                        {activeChat && (
                            <button onClick={(e) => { e.stopPropagation(); startVideoCall(); }} className="bg-green-600 p-1.5 rounded-full hover:bg-green-500" title="Start Video Call"><Video size={14} /></button>
                        )}
                        <button onClick={(e) => {e.stopPropagation(); setActiveChat(null); setShowCreateGroup(false);}}><X size={16}/></button>
                    </div>
                </div>

                {!activeChat ? (
                    <div className="p-4 h-96 overflow-y-auto bg-slate-50">
                        {showCreateGroup && (
                            <div className="mb-4 bg-white p-3 rounded-lg border border-blue-200 shadow-sm animate-in slide-in-from-top-5">
                                <input className="w-full border-b p-2 mb-2 text-sm outline-none" placeholder="Group Name" value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} />
                                <p className="text-xs font-bold text-slate-400 mb-2">Select Members:</p>
                                <div className="max-h-24 overflow-y-auto mb-2">
                                    {friends.map(f => (
                                        <div key={f.uid} onClick={() => toggleMemberSelection(f)} className={`flex items-center gap-2 p-1 cursor-pointer text-sm ${selectedMembers.find(m=>m.uid===f.uid) ? 'bg-blue-100 text-blue-700' : ''}`}>
                                            <div className={`w-3 h-3 border rounded-full ${selectedMembers.find(m=>m.uid===f.uid) ? 'bg-blue-600 border-blue-600' : 'border-slate-400'}`}></div>
                                            {f.username}
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleCreateGroup} className="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded hover:bg-blue-700">Create Group</button>
                            </div>
                        )}
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Recent Chats</p>
                        {chats.map(chat => (
                            <div key={chat.id} onClick={() => setActiveChat(chat)} className="p-3 bg-white mb-2 rounded-xl border border-slate-100 hover:bg-blue-50 cursor-pointer shadow-sm transition-colors flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${chat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'}`}>{chat.name[0].toUpperCase()}</div>
                                <div className="overflow-hidden"><p className="font-bold text-sm text-slate-800 truncate">{chat.name}</p><p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p></div>
                            </div>
                        ))}
                        <p className="text-xs font-bold text-slate-400 uppercase mt-4 mb-2">Start Chat</p>
                        {friends.map(f => (
                            <div key={f.uid} onClick={() => startDirectChat(f)} className="flex items-center gap-3 p-2 hover:bg-slate-100 cursor-pointer rounded-lg">
                                <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">{f.username[0]}</div>
                                <span className="text-sm font-medium">{f.username}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="flex-1 p-3 overflow-y-auto bg-slate-100 flex flex-col gap-2">
                            {messages.map((m, i) => (
                                <div key={i} className={`max-w-[85%] p-2 rounded-lg text-sm ${m.type === 'call' ? 'bg-slate-800 text-white self-center text-center w-full' : m.senderId === user.uid ? 'self-end bg-blue-600 text-white rounded-tr-none' : 'self-start bg-white border rounded-tl-none'}`}>
                                    {activeChat.type === 'group' && m.senderId !== user.uid && <p className="text-[9px] font-bold opacity-60 mb-1">{m.senderName}</p>}
                                    {m.image && <img src={m.image} className="rounded mb-1 max-w-full" alt="sent"/>}
                                    
                                    {m.type === 'call' ? (
                                        <div>
                                            <p className="font-bold mb-2 flex items-center justify-center gap-2"><Video size={16}/> Incoming Video Call</p>
                                            <button onClick={() => joinVideoCall(m.text)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold w-full">Join Call</button>
                                        </div>
                                    ) : (
                                        <p>{m.text}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-2 bg-white border-t">
                            {chatImage && <div className="text-xs text-green-600 mb-1 flex justify-between bg-green-50 p-1 rounded">Image selected <button onClick={()=>setChatImage(null)} className="text-red-500 font-bold">x</button></div>}
                            <div className="flex gap-2">
                                <label className="cursor-pointer text-slate-400 hover:text-blue-600 p-2"><Camera size={20}/><input type="file" className="hidden" accept="image/*" onChange={e => setChatImage(e.target.files[0])}/></label>
                                <input className="flex-1 border rounded-full px-3 text-sm outline-none focus:border-blue-500" placeholder="Type..." value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()}/>
                                <button onClick={() => handleSendMessage()} className="text-blue-600 p-2 hover:bg-blue-50 rounded-full"><Send size={20}/></button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

// --- 3. COMMUNITY PAGE (Updated with Video Uploads) ---
const CommunityPage = ({ onNavigate, onLogin, db, appId, user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [showCommunitySignup, setShowCommunitySignup] = useState(false);
  
  const [isWriting, setIsWriting] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postFile, setPostFile] = useState(null); // Stores either Image or Video file
  const [fileType, setFileType] = useState('image'); // 'image' or 'video'
  const [posting, setPosting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch Posts
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'isp_community_posts'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [db, appId]);

  const handleInteraction = () => {
    if (user) { setIsWriting(true); } 
    else if (confirm("You need an account to post or comment.\n\nOK = Login")) { onLogin(); }
  };

  const handleFileSelect = (e, type) => {
      const file = e.target.files[0];
      if(file) {
          // Validations
          if (type === 'video' && file.size > 50 * 1024 * 1024) return alert("Video too large (Max 50MB)");
          setPostFile(file);
          setFileType(type);
      }
  };

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() && !postFile) return;
    setPosting(true);
    setUploadProgress(10);
    
    let mediaUrl = null;

    try {
        if (postFile) {
            if (fileType === 'image') {
                // Images: Compress directly to DB string (Fast, cheap)
                mediaUrl = await compressImage(postFile);
                setUploadProgress(100);
            } else {
                // Videos: Upload to Storage Bucket (Required for large files)
                // Use the storage instance we imported at the top
                const videoRef = storageRef(getStorage(), `community_videos/${Date.now()}_${postFile.name}`);
                setUploadProgress(50);
                await uploadBytes(videoRef, postFile);
                setUploadProgress(80);
                mediaUrl = await getDownloadURL(videoRef);
                setUploadProgress(100);
            }
        }

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'isp_community_posts'), {
            author: user.username || 'Anonymous',
            authorId: user.uid,
            content: newPostContent,
            mediaUrl: mediaUrl, // Stores Base64 string OR Firebase Storage URL
            mediaType: fileType, // 'image' or 'video'
            date: new Date().toISOString(),
            likes: 0,
            comments: []
        });

        setNewPostContent('');
        setPostFile(null);
        setIsWriting(false);
    } catch (e) {
        console.error(e);
        alert("Error posting: " + e.message);
    }
    setPosting(false);
    setUploadProgress(0);
  };

  const toggleComments = (id) => setActiveCommentId(activeCommentId === id ? null : id);

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-800">
      {!user && <PublicNavbar onNavigate={onNavigate} onLogin={onLogin} activePage="community" />}

      <div className="max-w-7xl mx-auto px-0 md:px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT SIDEBAR */}
        <div className="hidden lg:block space-y-4">
           {user && <FriendManager user={user} db={db} appId={appId} />}
           {!user && <div className="bg-white p-4 rounded-xl shadow-sm border border-teal-100 text-center"><h3 className="font-bold text-slate-800 text-sm mb-1">New here?</h3><button onClick={() => setShowCommunitySignup(true)} className="w-full bg-teal-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-teal-700 shadow-md">Sign Up Free</button></div>}
        </div>

        {/* CENTER FEED */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* CREATE POST */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mx-2 md:mx-0 transition-all">
             <div className="flex gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400"><User size={20}/></div>
                {isWriting ? (
                    <div className="flex-1">
                        <textarea autoFocus className="w-full bg-slate-50 rounded-xl p-3 text-sm outline-none border border-slate-200 resize-none h-24" placeholder={`What's on your mind?`} value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)}/>
                        
                        {/* Preview */}
                        {postFile && (
                            <div className="mb-2 relative w-fit">
                                {fileType === 'image' ? 
                                    <img src={URL.createObjectURL(postFile)} className="h-24 rounded border" alt="preview"/> :
                                    <div className="h-24 w-32 bg-black rounded flex items-center justify-center text-white"><Video size={24}/></div>
                                }
                                <button onClick={()=>setPostFile(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-2">
                            <div className="flex gap-2">
                                <label className="cursor-pointer flex items-center gap-1 text-slate-500 hover:text-green-600 px-2 py-1 rounded bg-green-50 border border-green-100">
                                    <Camera size={14}/> <span className="text-xs font-bold">Photo</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')}/>
                                </label>
                                <label className="cursor-pointer flex items-center gap-1 text-slate-500 hover:text-red-600 px-2 py-1 rounded bg-red-50 border border-red-100">
                                    <Video size={14}/> <span className="text-xs font-bold">Video</span>
                                    <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileSelect(e, 'video')}/>
                                </label>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsWriting(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                                <button onClick={handleSubmitPost} disabled={posting} className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {posting ? `Uploading ${uploadProgress}%` : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div onClick={handleInteraction} className="flex-1 bg-slate-100 rounded-full px-4 flex items-center text-slate-500 text-sm cursor-pointer hover:bg-slate-200 h-10">What's on your mind?</div>
                )}
             </div>
          </div>

          {/* FEED */}
          {loading ? <div className="p-8 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/> Loading...</div> : (
            posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 mx-2 md:mx-0 overflow-hidden">
                <div className="p-4 flex gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">{post.author[0]}</div>
                   <div><h4 className="font-bold text-slate-800 text-sm">{post.author}</h4><p className="text-xs text-slate-400">{new Date(post.date).toLocaleDateString()}</p></div>
                </div>
                <div className="px-4 pb-2">
                    <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>
                    
                    {/* Render Media */}
                    {post.mediaUrl && (
                        <div className="rounded-lg overflow-hidden border border-slate-100 bg-black">
                            {post.mediaType === 'video' ? (
                                <video controls className="w-full max-h-[500px]">
                                    <source src={post.mediaUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img src={post.mediaUrl} alt="post" className="w-full object-cover max-h-[500px]"/>
                            )}
                        </div>
                    )}
                </div>
                <div className="px-4 py-3 flex justify-between items-center text-xs text-slate-500 border-b border-slate-100"><div className="flex items-center gap-1"><div className="bg-blue-500 text-white p-1 rounded-full"><ThumbsUp size={10} fill="white"/></div><span>{post.likes || 0}</span></div></div>
                <div className="flex px-2 py-1">
                   <button onClick={handleInteraction} className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-lg text-slate-600 font-bold text-sm"><ThumbsUp size={18}/> Like</button>
                   <button onClick={() => user ? toggleComments(post.id) : handleInteraction()} className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded-lg text-slate-600 font-bold text-sm"><MessageSquare size={18}/> Comment</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="hidden lg:block space-y-4">
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200"><h3 className="font-bold text-slate-500 text-xs uppercase mb-3">Sponsored</h3><div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50"><div className="w-16 h-16 bg-slate-800 rounded"></div><div><p className="font-bold text-sm">Fiber Internet</p><p className="text-xs text-slate-500">Switch Now</p></div></div></div>
        </div>
      </div>

      {user && <ChatSystem user={user} db={db} appId={appId} />}
      {showCommunitySignup && <CommunitySignupModal onClose={() => setShowCommunitySignup(false)} db={db} appId={appId} />}
    </div>
  );
};

// --- 3. PLANS PAGE ---
const PlansPage = ({ onNavigate, onLogin, plans }) => {
  
  // 🔴 PASTE YOUR GOOGLE FORM LINK HERE
  const GOOGLE_FORM_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSf6mi60XHqiD7cVTBGJGSl8a7-HWXM3uy9wL7C1eTbWvQNLXA/viewform?usp=header"; 

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <PublicNavbar onNavigate={onNavigate} onLogin={onLogin} activePage="plans" />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Unstoppable Fiber Plans</h1>
          <p className="text-slate-500">Choose the speed that fits your lifestyle.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-4">{plan.name}</h3>
              <div className="text-5xl font-black text-slate-900 mb-6">{plan.speed}</div>
              <div className="text-3xl font-bold text-red-600 mb-8">₱{plan.price}<span className="text-sm text-slate-400">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {plan.features?.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600"><Check size={18} className="text-green-500"/> {f}</li>
                ))}
              </ul>
              {/* --- UPDATE: Changed onClick to open Google Form --- */}
              <button 
                onClick={() => window.open(GOOGLE_FORM_LINK, '_blank')} 
                className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-red-600 transition-colors"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 4. ABOUT PAGE ---
const AboutPage = ({ onNavigate, onLogin }) => (
  <div className="min-h-screen bg-white font-sans text-slate-800">
    <PublicNavbar onNavigate={onNavigate} onLogin={onLogin} activePage="about" />
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black text-slate-900 mb-6">About SwiftNet</h1>
      <p className="text-lg text-slate-600 mb-6 leading-relaxed">
        SwiftNet is a premier Internet Service Provider dedicated to bridging the digital divide in the Philippines. Founded in 2023, we started with a simple mission: to provide affordable, reliable, and high-speed fiber internet to underserved communities.
      </p>
      <p className="text-lg text-slate-600 mb-6 leading-relaxed">
        We believe that internet access is a right, not a privilege. By utilizing the latest Fiber-to-the-Home (FTTH) technology, we ensure that our subscribers enjoy seamless connectivity for work, education, and entertainment.
      </p>
      <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Our Mission</h2>
      <p className="text-slate-600 mb-6">To empower every household with world-class internet connectivity.</p>
      <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Our Vision</h2>
      <p className="text-slate-600">To be the most trusted and customer-centric ISP in the region.</p>
    </div>
  </div>
);

// --- 5. PRIVACY POLICY PAGE ---
const PrivacyPage = ({ onNavigate, onLogin }) => (
  <div className="min-h-screen bg-white font-sans text-slate-800">
    <PublicNavbar onNavigate={onNavigate} onLogin={onLogin} activePage="privacy" />
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
      <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
        <p><strong>Last Updated: December 2025</strong></p>
        <p>At SwiftNet, we respect your privacy and are committed to protecting your personal data.</p>
        <h3 className="text-lg font-bold text-slate-800">1. Information We Collect</h3>
        <p>We collect information you provide directly to us, such as your name, email address, phone number, and installation address when you apply for a subscription.</p>
        <h3 className="text-lg font-bold text-slate-800">2. How We Use Your Information</h3>
        <p>We use your data to provide, maintain, and improve our services, process payments, and communicate with you about your account.</p>
        <h3 className="text-lg font-bold text-slate-800">3. Data Security</h3>
        <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access.</p>
      </div>
    </div>
  </div>
);

// --- NEW LANDING PAGE COMPONENT (PLDT STYLE) ---
const LandingPage = ({ onLoginClick, onNavigate, plans, onQuickPay }) => {
  // Default fallback plans if none loaded or database is empty--
  const displayPlans = plans && plans.length > 0 ? plans : [
    { name: 'Fiber Starter', speed: '50 Mbps', price: '999', features: ['Unlimited Data', 'Free Installation'], category: 'Home' },
    { name: 'Fiber Pro', speed: '100 Mbps', price: '1499', features: ['Unlimited Data', 'Priority Support'], category: 'Home' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* USE SHARED NAVBAR */}
      <PublicNavbar 
            onNavigate={onNavigate} 
            onLogin={onLoginClick} 
            activePage="landing" 
            onQuickPay={onQuickPay} 
       />

      {/* HERO */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-48 flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Unstoppable</span> Speed.
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Connect your home to the fastest fiber network. Stream in 4K, game without lag, and work efficiently.
            </p>
            <div className="flex gap-4">
              <button onClick={() => onNavigate('plans')} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-red-500/20">
                View Plans
              </button>
              <button onClick={() => onNavigate('coverage')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
                Check Availability
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4">
          
        </div>
      </div>

      {/* PLANS SECTION (Categorized) */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* 1. HOME FIBER PLANS */}
            <div className="text-center mb-16">
                <span className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Residential</span>
                <h2 className="text-3xl font-black text-slate-900 mb-4">Home Fiber Plans</h2>
                <p className="text-slate-500">Perfect for streaming, gaming, and working from home.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              {displayPlans.filter(p => !p.category || p.category === 'Home').map((plan, idx) => (
                 <div key={idx} className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                     
                     <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-4">{plan.name}</h3>
                     <div className="text-5xl font-black text-slate-900 mb-6">{plan.speed}</div>
                     <div className="text-3xl font-bold text-red-600 mb-8">₱{plan.price}<span className="text-sm text-slate-400 font-medium">/mo</span></div>
                     
                     <ul className="space-y-4 mb-8">
                        {plan.features?.map((f, i) => (
                          <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                              <Check size={16} className="text-green-500 flex-shrink-0"/> {f}
                          </li>
                        ))}
                     </ul>

                     <button onClick={() => onNavigate('plans')} className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-red-600 transition-colors shadow-lg">
                        View Details
                     </button>
                 </div>
              ))}
            </div>

            {/* 2. BUSINESS / FAILOVER PLANS (Dark Section) */}
            <div className="bg-slate-900 rounded-3xl p-8 md:p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1 bg-yellow-500 text-slate-900 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Enterprise Grade</span>
                        <h2 className="text-3xl font-black text-white mb-4">Business & Failover Lines</h2>
                        <p className="text-slate-400">Keep your business online 24/7 with redundant fiber connections.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {displayPlans.filter(p => p.category === 'Business').map((plan, idx) => (
                            <div key={idx} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-yellow-500/50 transition-colors relative">
                                <div className="absolute top-0 right-0 bg-yellow-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">Priority Support</div>
                                <h3 className="text-lg font-bold text-slate-300 uppercase tracking-widest mb-4">{plan.name}</h3>
                                <div className="text-4xl font-black text-white mb-4">{plan.speed}</div>
                                <div className="text-2xl font-bold text-yellow-500 mb-6">₱{plan.price}<span className="text-sm text-slate-500">/mo</span></div>
                                <button onClick={() => onNavigate('plans')} className="w-full py-3 rounded-xl font-bold text-slate-900 bg-white hover:bg-yellow-500 transition-colors">
                                    Get Business Line
                                </button>
                            </div>
                        ))}
                        {displayPlans.filter(p => p.category === 'Business').length === 0 && (
                            <div className="col-span-3 text-center text-slate-500 py-10 border border-dashed border-slate-700 rounded-xl">
                                Contact us for custom Enterprise Quotes.
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
      </div>

      {/* FEATURES PREVIEW */}
      <div className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-12">Why Choose SwiftNet?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Zap size={32}/></div>
              <h3 className="font-bold text-xl mb-2">Lightning Fast</h3>
              <p className="text-slate-500">Up to 1Gbps dedicated fiber speeds.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><ShieldCheck size={32}/></div>
              <h3 className="font-bold text-xl mb-2">Secure & Reliable</h3>
              <p className="text-slate-500">99.9% Uptime guarantee with secure routing.</p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Headphones size={32}/></div>
              <h3 className="font-bold text-xl mb-2">24/7 Support</h3>
              <p className="text-slate-500">Real human support whenever you need it.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="font-black text-2xl tracking-tighter text-white block mb-4">SwiftNet<span className="text-red-600">ISP</span></span>
            <p className="max-w-xs">Connecting communities with the speed of light.</p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('about')} className="hover:text-white">About Us</button></li>
              <li><button onClick={() => onNavigate('plans')} className="hover:text-white">Our Plans</button></li>
              <li><button onClick={() => onNavigate('coverage')} className="hover:text-white">Check Coverage</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-white">Privacy Policy</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Contact</h5>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone size={14}/> 0968-385-9759</li>
              <li className="flex items-center gap-2"><Mail size={14}/> ramoshowardkingsley58@gmail.com</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- NEW COMPONENT: QR REPAIR PORTAL ---
const QRRepairPortal = ({ db, appId }) => {
  const [status, setStatus] = useState('verifying'); // verifying, confirming, success
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');

    if (uid) {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, uid);
      getDoc(userRef).then(snap => {
        if (snap.exists()) {
          setTargetUser({ id: snap.id, ...snap.data() });
          setStatus('confirming');
        } else {
          alert("Invalid Router ID. Please contact support.");
        }
      });
    }
  }, [db, appId]);

  const handleAutoFile = async () => {
    setLoading(true);
    try {
        const ticketId = Math.floor(100000 + Math.random() * 900000).toString();
        const repairId = Math.floor(Math.random() * 10000000000).toString().padStart(11, '0');
        const timestamp = new Date().toISOString();

        // --- ACTION 1: Create the High-Priority Ticket ---
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), {
            ticketId,
            userId: targetUser.uid,
            username: targetUser.username,
            subject: "🔴 ROUTER QR SCAN: SOS",
            message: `EMERGENCY: Customer scanned the physical router sticker. 
                      Address: ${targetUser.address || 'Not Set'}
                      Account: ${targetUser.accountNumber}`,
            status: 'open',
            priority: 'High',
            date: timestamp,
            isAutoGenerated: true
        });

        // --- ACTION 2: Create the Repair Job Automatically ---
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), {
            requestId: repairId,
            userId: targetUser.uid,
            username: targetUser.username,
            address: targetUser.address || "Address not provided",
            type: 'Direct Router Scan', // This tells the tech it's a QR scan
            notes: `System generated via physical QR scan. Customer is reporting a complete signal loss or router issue.`,
            status: 'Evaluation', // Moves it straight to the evaluation stage
            stepIndex: 1, 
            technicianNote: 'Waiting for technician assignment.',
            dateFiled: timestamp,
            isAutoGenerated: true // Matches our security rule
        });

        setStatus('success');
    } catch (e) {
        console.error("Auto-file error:", e);
        alert("Error: " + e.message);
    }
    setLoading(false);
};

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="bg-red-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <QrCode size={32} />
          </div>
          <h2 className="text-xl font-black uppercase">SwiftNet Support</h2>
          <p className="text-red-100 text-xs">Direct Router Link</p>
        </div>
        <div className="p-8 text-center">
          {status === 'verifying' && <Loader2 className="animate-spin mx-auto text-red-600" size={40} />}
          {status === 'confirming' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Need Technical Help?</h3>
              <p className="text-slate-500 mb-8 text-sm">Hi <strong>{targetUser?.username}</strong>, click below to alert our team that your internet is down.</p>
              <button onClick={handleAutoFile} disabled={loading} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <AlertTriangle size={20} />} Report Connection Issue
              </button>
            </div>
          )}
          {status === 'success' && (
            <div className="py-6 animate-in scale-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} /></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Request Sent</h3>
              <p className="text-slate-500 text-sm">A technician will check your line shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 6. Main App Logic
export default function App() {
  // --- STATE: SYSTEM & UI ---
  const [isQRRepairMode, setIsQRRepairMode] = useState(false);
  const [isHotspotMode, setIsHotspotMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [publicPage, setPublicPage] = useState('landing');
  
  // --- STATE: PROFESSIONAL FEATURES (NEW) ---
  const [showGuestPay, setShowGuestPay] = useState(false);
  const [toasts, setToasts] = useState([]);

  // --- STATE: DATA ---
  const [user, setUser] = useState(null);
  const [mySubscriberData, setMySubscriberData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // --- HELPER: TOASTS ---
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // --- EFFECT: CHECK HOTSPOT MODE ---
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'hotspot') {
    setIsHotspotMode(true);
  }
  // --- ADD THIS LINE ---
  if (params.get('mode') === 'auto_repair') {
    setIsQRRepairMode(true);
  }
}, []);

  // --- EFFECT: FETCH PUBLIC PLANS ---
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlans(fetchedPlans);
    });
    return () => unsubscribe();
  }, []);

  // --- EFFECT: AUTHENTICATION CHECK ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          let firestoreData = {};
          if (docSnap.exists()) {
            firestoreData = { id: docSnap.id, ...docSnap.data() };
          } else {
            // Fallback for missing profiles (auto-heal)
            if (currentUser.email !== ADMIN_EMAIL) {
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

          // Role Determination
          const isAdmin = currentUser.email === ADMIN_EMAIL || firestoreData.role === 'admin';
          const isTechnician = firestoreData.role === 'technician';
          const isCashier = firestoreData.role === 'cashier';
          const isRetailer = firestoreData.role === 'retailer';
          const isAgent = firestoreData.role === 'agent';
          const isBusiness = firestoreData.role === 'business';

          let finalRole = 'subscriber';
          if (isAdmin) finalRole = 'admin';
          else if (isTechnician) finalRole = 'technician';
          else if (isCashier) finalRole = 'cashier';
          else if (isRetailer) finalRole = 'retailer';
          else if (isAgent) finalRole = 'agent';
          else if (isBusiness) finalRole = 'business';

          setUser({ ...currentUser, role: finalRole, ...firestoreData });

          if (finalRole === 'subscriber' || finalRole === 'business') {
            setMySubscriberData(firestoreData);
          }
          
          addToast(`Welcome back, ${firestoreData.username || 'User'}`, 'success');

        } catch (e) {
          console.error("Auth Error", e);
          addToast("Error loading profile", "error");
        }
      } else {
        setUser(null);
        setMySubscriberData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- EFFECT: DATA SUBSCRIPTIONS (Based on Role) ---
  useEffect(() => {
    if (!user) return;

    // 1. ADMIN & CASHIER: See Everything
    if (user.role === 'admin' || user.role === 'cashier') {
       const unsubSubscribers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), s => setSubscribers(s.docs.map(d => ({id: d.id, ...d.data()}))));
       const unsubPayments = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), orderBy('date', 'desc')), s => setPayments(s.docs.map(d => ({id: d.id, ...d.data()}))));
       const unsubRepairs = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), orderBy('dateFiled', 'desc')), s => setRepairs(s.docs.map(d => ({id: d.id, ...d.data()}))));
       
       const ticketCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'isp_tickets_v1');
       const unsubTickets = onSnapshot(ticketCollectionRef, (snapshot) => {
         const fetchedTickets = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
         setTickets(fetchedTickets.sort((a,b) => new Date(b.date) - new Date(a.date)));
       });
       
       return () => { unsubSubscribers(); unsubPayments(); unsubRepairs(); unsubTickets(); };
    } 
    // 2. TECHNICIAN: See Assigned Jobs
    else if (user.role === 'technician') {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), where('assignedTechId', '==', user.uid));
        const unsub = onSnapshot(q, s => setRepairs(s.docs.map(d => ({id: d.id, ...d.data()}))));
        return () => unsub();
    }
    // 3. SUBSCRIBER/BUSINESS: See Own Data
    else if (user.role === 'subscriber' || user.role === 'business') {
       const unsubSelf = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.uid), s => setMySubscriberData({id: s.id, ...s.data()}));
       const unsubTickets = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), where('userId', '==', user.uid)), s => setTickets(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b)=>new Date(b.date)-new Date(a.date))));
       const unsubRepairs = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), where('userId', '==', user.uid)), s => setRepairs(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b)=>new Date(b.dateFiled)-new Date(a.dateFiled))));
       const unsubNotifs = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', NOTIFICATIONS_COLLECTION), where('userId', '==', user.uid)), s => setNotifications(s.docs.map(d => ({id: d.id, ...d.data()}))));
       
       return () => { unsubSelf(); unsubTickets(); unsubRepairs(); unsubNotifs(); };
    }
    
    // Global Announcements (Everyone sees this)
    const unsubAnnounce = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION), orderBy('date', 'desc')), s => setAnnouncements(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsubAnnounce();

  }, [user]);

  // --- HANDLERS ---

  const handleLogout = async () => {
      await signOut(auth);
      setShowLogin(false);
      setPublicPage('landing');
      addToast("Logged out successfully", "info");
  };

  const handleLoginClick = () => setShowLogin(true);

  // Core Function: Handle Payments (Passed to Subscriber/Business Dash)
  const handlePayment = async (id, refNumber, username) => {
    if (!refNumber) return addToast("Reference number missing", "error");
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), { 
          userId: id, 
          username: username || user.username, 
          refNumber, 
          date: new Date().toISOString(), 
          status: 'pending_approval', // Changed from 'submitted' to match your other logic
          amount: 0 // Optional: can be updated by admin later
      });
      addToast(`Payment Submitted! Ref: ${refNumber}`, "success");
    } catch (e) { 
        console.error(e);
        addToast("Payment submission failed.", "error"); 
    }
  };

  // Core Function: Technician Updates (Passed to Tech Dash)
  const handleTechUpdateStatus = async (repairId, currentStep) => {
      let nextStatus = '';
      let nextStepIndex = currentStep + 1;
      let note = '';
      if (currentStep === 1) { nextStatus = 'Processing'; note = 'Technician has started repairs.'; } 
      else if (currentStep === 2) { nextStatus = 'Customer Confirmation'; note = 'Repairs completed. Pending customer verification.'; } 
      else { return; }
      
      try { 
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId); 
          await updateDoc(docRef, { stepIndex: nextStepIndex, status: nextStatus, technicianNote: note }); 
          addToast("Status Updated", "success");
      } catch (e) { 
          console.error(e); 
          addToast("Update failed.", "error"); 
      }
  };

  // Core Function: Subscriber Confirms Repair (Passed to Sub Dash)
  const handleConfirmRepair = async (repairId) => {
      try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId);
          await updateDoc(docRef, { stepIndex: 4, status: 'Completed', completedDate: new Date().toISOString() });
          
          // Send Feedback Email
          if (user?.email) {
             await sendCustomEmail('feedback', {
                name: user.displayName || user.username,
                email: user.email,
                message: `Your repair #${repairId} is complete. How did we do?`,
                link: 'https://www.facebook.com/SwiftnetISP/reviews' 
             });
          }
          addToast("Repair marked as completed. Thank you!", "success");
      } catch(e) { 
          console.error(e); 
          addToast("Failed to confirm repair.", "error"); 
      }
  };

  // --- RENDER ---

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center animate-pulse">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <Wifi size={32} />
            </div>
            <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">Loading SwiftNet...</p>
        </div>
    </div>
  );

  // 1. Hotspot Portal (No Auth Required)
if (isHotspotMode) {
    return <HotspotPortal onLogin={() => setIsHotspotMode(false)} db={db} appId={appId} />;
}

// --- ADD THIS BLOCK ---
if (isQRRepairMode) {
    return <QRRepairPortal db={db} appId={appId} />;
}

  // 2. Main Application
  return (
    <>
      {/* Global Overlays */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {showGuestPay && <GuestPayModal onClose={()=>setShowGuestPay(false)} db={db} appId={appId} onAddToast={addToast} />}
      
      {/* 3. Authenticated Views */}
      {user ? (
        <Layout user={user} onLogout={handleLogout}>
           {user.role === 'admin' ? (
             <AdminDashboard 
                subscribers={subscribers} 
                announcements={announcements} 
                payments={payments} 
                tickets={tickets} 
                repairs={repairs} 
                user={user} 
                db={db} 
                appId={appId} 
             />
            ) : user.role === 'iptv_reseller' ? ( // ADD THIS BLOCK
            <IPTVResellerDashboard 
                user={user} 
                db={db} 
                appId={appId} 
                onLogout={handleLogout} 
            />
           ) : user.role === 'cashier' ? (
             <CashierDashboard subscribers={subscribers} db={db} appId={appId} />
           ) : user.role === 'technician' ? (
             <TechnicianDashboard repairs={repairs} onTechUpdate={handleTechUpdateStatus} />
           ) : user.role === 'retailer' ? (
             <RetailerDashboard user={user} db={db} appId={appId} onLogout={handleLogout} />
           ) : user.role === 'agent' ? ( 
             <AgentDashboard user={user} db={db} appId={appId} onLogout={handleLogout} />
           ) : user.role === 'business' ? (
             <BusinessDashboard user={user} db={db} appId={appId} onPay={handlePayment} />
           ) : (
             // Default Subscriber View
             <SubscriberDashboard 
                userData={mySubscriberData || {}} 
                onPay={handlePayment} 
                announcements={announcements} 
                notifications={notifications} 
                tickets={tickets} 
                repairs={repairs} 
                onConfirmRepair={handleConfirmRepair} 
                db={db} 
                appId={appId}
             />
           )}
        </Layout>
      ) : showLogin ? (
        // 4. Login Modal Overlay
        <div className="relative">
          <Login onLogin={() => {}} />
          <button onClick={() => setShowLogin(false)} className="fixed top-6 right-6 text-white bg-black/20 hover:bg-black/40 p-2 rounded-full z-50 transition-colors">
            <X size={24} />
          </button>
        </div>
      ) : (
        // 5. Public Pages (Landing, Support, Coverage, etc.)
        <>
            {publicPage === 'support' && <SupportPage onNavigate={setPublicPage} onLogin={handleLoginClick} />}
            {publicPage === 'coverage' && <CoveragePage onNavigate={setPublicPage} onLogin={handleLoginClick} db={db} appId={appId} />}
            {/* --- ADD THIS LINE HERE --- */}
            {publicPage === 'community' && <CommunityPage onNavigate={setPublicPage} onLogin={handleLoginClick} db={db} appId={appId} />}
            {publicPage === 'plans' && <PlansPage onNavigate={setPublicPage} onLogin={handleLoginClick} plans={plans} />}
            {publicPage === 'about' && <AboutPage onNavigate={setPublicPage} onLogin={handleLoginClick} />}
            {publicPage === 'privacy' && <PrivacyPage onNavigate={setPublicPage} onLogin={handleLoginClick} />}
            
            {/* Default Landing Page */}
            {publicPage === 'landing' && (
                <div className="min-h-screen bg-white font-sans text-slate-800">
                    {publicPage === 'landing' && (
                        <LandingPage 
                            onLoginClick={handleLoginClick} 
                            onNavigate={setPublicPage} 
                            plans={plans} 
                            onQuickPay={() => setShowGuestPay(true)} 
                        />
                    )}
                </div>
            )}
            
            {/* Cookie Consent Banner (Only on public pages) */}
            <CookieConsentBanner />
        </>
      )}
    </>
  );
}