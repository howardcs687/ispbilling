import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
  getDocs,
  increment 
} from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SignatureCanvas from 'react-signature-canvas';
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
const OUTAGES_COLLECTION = 'isp_outages_v1'; 
const INVOICES_COLLECTION = 'isp_invoices_v1';
const EXPENSES_COLLECTION = 'isp_expenses_v1';
const PRODUCTS_COLLECTION = 'isp_products_v1';
const SERVICE_AREAS_COLLECTION = 'isp_service_areas_v1';
const CONFIG_COLLECTION = 'isp_config_v1';
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

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ApplicationWizard = ({ plan, onClose, onSubmit, db, appId }) => {
  const [step, setStep] = useState(1);
  const [serviceStatus, setServiceStatus] = useState(null); 
  const [position, setPosition] = useState({ lat: 18.4728, lng: 122.1557 }); // Default Center
  
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
                  {serviceStatus === 'None' && <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center"><p className="text-red-700 font-bold">Sorry, we are not yet available in this area.</p></div>}
                  {serviceStatus === 'Coming Soon' && <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center"><p className="text-yellow-800 font-bold">Coming Soon!</p><p className="text-xs text-yellow-600">We are currently building lines here.</p></div>}
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
                      <div className="flex justify-between"><span className="text-slate-500">GPS</span><span className="font-mono text-xs">{formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}</span></div>
                  </div>
                  <button onClick={() => onSubmit(formData)} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200">SUBMIT APPLICATION</button>
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
  const amountVal = parseFloat((doc.amount || '0').toString().replace(/,/g, ''));
  const vat = amountVal - (amountVal / 1.12);
  const baseAmount = amountVal - vat;

  const isReceipt = doc.type === 'Receipt';
  const themeColor = isReceipt ? 'text-green-600' : 'text-red-600';
  const borderColor = isReceipt ? 'border-green-600' : 'border-red-600';
  const label = isReceipt ? 'Official Receipt' : 'Statement of Account';

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
      if (!confirm(`Send this ${label} to ${user.email}?`)) return;
      setSending(true);

      // EMAILJS CONFIGURATION
      const serviceID = 'YOUR_SERVICE_ID';   // Replace with yours
      const templateID = 'YOUR_TEMPLATE_ID'; // Replace with yours
      const publicKey = 'YOUR_PUBLIC_KEY';   // Replace with yours

      const templateParams = {
          to_name: user.username,
          to_email: user.email,
          subject: `${label} - SwiftNet ISP`,
          message: `Dear Subscriber, attached is your ${label} for ${doc.date}. Amount: ₱${amountVal.toLocaleString()}`,
          amount: `₱${amountVal.toLocaleString()}`,
      };

      try {
          await emailjs.send(serviceID, templateID, templateParams, publicKey);
          alert("Email sent successfully!");
      } catch (error) {
          console.error('FAILED...', error);
          alert("Failed to send email. Check console.");
      }
      setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl flex flex-col">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-3"><FileText size={20} /><span className="font-bold">{doc.title}</span></div>
            <div className="flex items-center gap-3">
                <button onClick={handleEmail} disabled={sending} className="text-slate-300 hover:text-white flex items-center gap-1 text-sm disabled:opacity-50 bg-blue-600/20 px-3 py-1 rounded hover:bg-blue-600 transition-colors">
                    <Mail size={16} /> {sending ? 'Sending...' : 'Email to User'}
                </button>
                <button onClick={handleDownload} disabled={downloading} className="text-slate-300 hover:text-white flex items-center gap-1 text-sm disabled:opacity-50">
                    <Download size={16} /> {downloading ? 'PDF...' : 'Download'}
                </button>
                <button onClick={onClose} className="text-slate-300 hover:text-white"><X size={24} /></button>
            </div>
        </div>
        
        <div id="printable-invoice" className="p-8 md:p-12 text-slate-800 font-sans bg-white min-h-[800px] relative">
            <div className={`flex justify-between items-start mb-8 border-b-4 ${borderColor} pb-6`}>
                <div className="flex items-center gap-2">
                    <div className={`${isReceipt ? 'bg-green-600' : 'bg-red-600'} p-2 rounded`}><Wifi className="text-white" size={32} /></div>
                    <div><h1 className={`text-3xl font-bold tracking-tight ${themeColor}`}>SwiftNet<span className="text-slate-800">ISP</span></h1><p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Home Fiber Services</p></div>
                </div>
                <div className="text-right"><h2 className="text-2xl font-bold uppercase text-slate-700">{label}</h2><p className="text-sm text-slate-500">{isReceipt ? 'Paid on:' : 'Statement Date:'} {new Date(doc.date).toLocaleDateString()}</p></div>
            </div>
            
            {isReceipt && (
                <div className="absolute top-40 right-12 border-4 border-green-600/20 text-green-600/20 font-black text-6xl uppercase -rotate-12 p-4 rounded-xl select-none pointer-events-none">PAID</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-1"><p className="text-xs font-bold text-slate-400 uppercase">Account Name</p><p className="font-bold text-lg uppercase">{user.username}</p><p className="text-sm text-slate-600">{user.address || "No address provided"}</p></div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between mb-2"><span className="text-sm font-bold text-slate-500">Account Number</span><span className="text-sm font-bold text-slate-900">{user.accountNumber}</span></div>
                    {isReceipt && <div className="flex justify-between mb-2"><span className="text-sm font-bold text-slate-500">Ref. Number</span><span className="text-sm font-bold text-slate-900">{doc.refNumber || 'N/A'}</span></div>}
                    <div className="flex justify-between border-t border-slate-200 pt-2 mt-2"><span className="text-lg font-bold text-slate-700">{isReceipt ? 'Amount Paid' : 'Amount Due'}</span><span className="text-lg font-bold text-slate-900">₱{amountVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                </div>
            </div>

            <div className="mb-10">
                <h3 className="font-bold text-slate-700 border-b border-slate-300 pb-2 mb-4 uppercase text-sm tracking-wider">Transaction Details</h3>
                <table className="w-full text-sm">
                    <tbody className="text-slate-700">
                        {/* Render Items if available, else fallback to Plan */}
                        {doc.items ? doc.items.map((item, i) => (
                            <tr key={i}>
                                <td className="py-2">{item.description || item.desc}</td>
                                <td className="py-2 text-right">₱{parseFloat(item.amount).toLocaleString()}</td>
                            </tr>
                        )) : (
                            <tr><td className="py-2">Monthly Service Fee ({user.plan || 'Fiber Plan'})</td><td className="py-2 text-right">₱{baseAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                        )}
                        
                        {/* VAT Row if no items or force show */}
                        {!doc.items && <tr><td className="py-2 border-b border-slate-100">Value Added Tax (12%)</td><td className="py-2 border-b border-slate-100 text-right">₱{vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>}
                        
                        <tr><td className={`py-4 font-bold text-lg ${themeColor}`}>Total</td><td className={`py-4 font-bold text-lg ${themeColor} text-right`}>₱{amountVal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                    </tbody>
                </table>
            </div>

            <div className="bg-slate-50 p-6 rounded border border-slate-200 text-center text-xs text-slate-500">
                <p className="font-bold mb-2">THANK YOU FOR YOUR BUSINESS</p>
                <p>This is a system-generated {isReceipt ? 'receipt' : 'invoice'}. No signature required.</p>
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

const Layout = ({ children, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Initialize dark mode from localStorage or default to false
  const [darkMode, setDarkMode] = useState(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('swiftnet_theme') === 'dark';
      }
      return false;
  });

  useEffect(() => {
      // Persist to localStorage
      localStorage.setItem('swiftnet_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);
  
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

const PaymentProofModal = ({ user, onClose, db, appId }) => {
  const [refNumber, setRefNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('GCash');
  const [preview, setPreview] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [loading, setLoading] = useState(false);

  // Magic Function: Compress image to text
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 600; // Resize to 600px width
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setBase64Image(compressedBase64);
        };
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !refNumber) return alert("Please fill in all fields.");
    if (!base64Image) return alert("Please attach a screenshot.");
    
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
            proofImage: base64Image // Saving image as text!
        });

        alert("Proof submitted successfully!");
        onClose();
    } catch(e) {
        console.error("Save Error:", e);
        if (e.message.includes('exceeds the maximum allowed size')) {
            alert("Image too large. Please crop it.");
        } else {
            alert("Error: " + e.message);
        }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
        <div className="bg-white w-[95%] md:w-full max-w-md rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <UploadCloud size={20} className="text-blue-600"/> Upload Payment Proof
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-1">
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Amount Paid</label>
                        <input type="number" required className="w-full border p-2 rounded-lg" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Ref No.</label>
                        <input type="text" required className="w-full border p-2 rounded-lg" placeholder="e.g. 100234" value={refNumber} onChange={e => setRefNumber(e.target.value)} />
                    </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 relative overflow-hidden">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" onChange={handleFileChange} />
                    {preview ? (
                        <div className="relative">
                            <img src={preview} alt="Preview" className="mx-auto h-32 object-contain rounded-lg shadow-sm" />
                            <p className="text-xs text-green-600 font-bold mt-2">Ready to submit</p>
                        </div>
                    ) : (
                        <div>
                            <div className="mx-auto bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center text-blue-500 mb-2"><Image size={20}/></div>
                            <p className="text-sm font-bold text-slate-600 px-4">Tap to attach screenshot</p>
                        </div>
                    )}
                </div>

                <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
                    {loading ? <RefreshCw className="animate-spin" size={18}/> : <CheckCircle size={18}/>}
                    {loading ? 'Compressing & Sending...' : 'Submit Proof'}
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setPreview(URL.createObjectURL(file));
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; 
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            setBase64Image(compressedBase64);
        };
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!base64Image) return alert("Please upload an ID.");
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
                         <img src={preview} className="w-full h-full object-contain" alt="ID Preview" />
                     ) : (
                         <div className="text-center">
                            <Fingerprint size={48} className="text-slate-300 mb-2 mx-auto"/>
                            <p className="text-sm font-bold text-slate-500">Tap to upload ID photo</p>
                         </div>
                     )}
                </div>

                <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Encrypting & Sending...' : 'Submit Verification'}
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

// 3. Subscriber Dashboard
const SubscriberDashboard = ({ userData, onPay, announcements, notifications, tickets, repairs, onConfirmRepair, outages }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
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

  useEffect(() => {
    if (!userData?.id) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', INVOICES_COLLECTION), where('userId', '==', userData.id), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [userData]);

  const MOCK_DOCUMENTS = [
    { id: 1, title: "Service Contract - Swift Fiber", date: "2023-01-15", type: "Contract", size: "1.2 MB", amount: '0.00' },
    { id: 2, title: "Statement of Account - Oct 2023", date: "2023-10-01", type: "Invoice", size: "450 KB", amount: '1,500.00' },
    { id: 3, title: "Statement of Account - Nov 2023", date: "2023-11-01", type: "Invoice", size: "480 KB", amount: '1,500.00' },
  ];

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

  const activeRepairs = (repairs || []).filter(r => r.status !== 'Completed');
  const historyRepairs = (repairs || []).filter(r => r.status === 'Completed');
  
  // Filter active outages
  const activeOutages = (outages || []).filter(o => o.status !== 'Resolved');
  const hasOutage = activeOutages.length > 0;

  if (userData.status === 'applicant' || userData.accountNumber === 'PENDING') {
      // ... (Applicant View logic - Unchanged)
      const handleWizardSubmit = async (addressData) => {
         try {
            const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString(); 
            const fullAddress = `${addressData.street}, ${addressData.barangay}, ${addressData.city}, ${addressData.province}`;
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userData.id), { plan: selectedPlanForApp.name, address: fullAddress, addressDetails: addressData });
            // REPLACE THE OLD sendSystemEmail WITH THIS:
            await sendCustomEmail('order', {
                name: userData.username,
                email: userData.email,
                orderDetails: selectedPlanForApp.name,
                message: `We have received your application for ${selectedPlanForApp.name}. Ticket #${ticketId}. We will review your area coverage shortly.`
            });
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { ticketId, userId: userData.uid, username: userData.username, subject: 'New Subscription Application', message: `Applicant ${userData.username} (${userData.email}) has applied for the ${selectedPlanForApp.name} plan.\nAddress: ${fullAddress}`, status: 'open', adminReply: '', isApplication: true, targetUserId: userData.uid, targetPlan: selectedPlanForApp.name, date: new Date().toISOString() });
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
           {selectedPlanForApp && (<ApplicationWizard plan={selectedPlanForApp} onClose={() => setSelectedPlanForApp(null)} onSubmit={handleWizardSubmit} db={db} appId={appId} />)}
        </div>
      );
  }

  const handlePaymentSubmit = async (e) => { e.preventDefault(); setSubmitting(true); await onPay(userData.id, refNumber, userData.username); setSubmitting(false); setShowQR(false); setRefNumber(''); };
  const handleCreateTicket = async (e) => { if(e) e.preventDefault(); if (!newTicket.subject || !newTicket.message) return; setTicketLoading(true); try { const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { ticketId, userId: userData.uid, username: userData.username, subject: newTicket.subject, message: newTicket.message, status: 'open', adminReply: '', date: new Date().toISOString() }); setNewTicket({ subject: '', message: '' }); await sendCustomEmail('auto_reply', {
            name: userData.username,
            email: userData.email,
            message: `We received your ticket #${ticketId}: "${newTicket.subject}". Our support team is reviewing it now.`
        }); alert(`Ticket #${ticketId} submitted successfully!`); setActiveTab('support'); } catch (error) { console.error("Error creating ticket", error); alert("Failed to submit request."); } setTicketLoading(false); };
  const handleFollowUpTicket = async (ticketId, originalMessage) => { if(!followUpText) return; try { const docRef = doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticketId); const timestamp = new Date().toLocaleString(); const newMessage = `${originalMessage}\n\n--- Follow-up by You (${timestamp}) ---\n${followUpText}`; await updateDoc(docRef, { message: newMessage, status: 'open', date: new Date().toISOString() }); setFollowingUpTo(null); setFollowUpText(''); alert("Follow-up sent successfully!"); } catch(e) { console.error(e); alert("Failed to send follow-up"); } };
  const handleRequestRepair = async (e) => { e.preventDefault(); if(!repairNote) return; try { const randomId = Math.floor(Math.random() * 10000000000).toString().padStart(11, '0'); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), { requestId: randomId, userId: userData.uid, username: userData.username, address: userData.address || "No address provided", type: 'Service Repair - Internet', notes: repairNote, status: 'Submission', stepIndex: 0, technicianNote: 'Waiting for initial evaluation.', dateFiled: new Date().toISOString() }); setRepairNote(''); setShowRepairModal(false); alert("Repair request filed successfully!"); } catch(e) { console.error(e); alert("Failed to request repair."); } };
  const handleApplyPlan = (planName) => { if(confirm(`Apply for ${planName}?`)) { const msg = `Requesting plan change.\n\nCurrent: ${userData.plan}\nNew: ${planName}`; const submitPlanTicket = async () => { setTicketLoading(true); try { const ticketId = Math.floor(10000000 + Math.random() * 90000000).toString(); await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), { ticketId, userId: userData.uid, username: userData.username, subject: 'Plan Change Request', message: msg, status: 'open', adminReply: '', date: new Date().toISOString(), isPlanChange: true, targetPlan: planName }); alert(`Application submitted! Ticket #${ticketId}.`); setActiveTab('support'); } catch(e) { alert("Failed."); } setTicketLoading(false); }; submitPlanTicket(); } };
  const handleUpdatePassword = async (e) => { e.preventDefault(); if (managePass.length < 6) return alert("Min 6 chars."); setUpdatingCreds(true); try { await updatePassword(auth.currentUser, managePass); setManagePass(''); alert("Password updated!"); } catch (error) { if (error.code === 'auth/requires-recent-login') alert("Please re-login."); else alert("Error: " + error.message); } setUpdatingCreds(false); };
  const handleUpdateEmail = async (e) => { e.preventDefault(); if (!manageEmail) return; setUpdatingCreds(true); try { await updateEmail(auth.currentUser, manageEmail); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userData.id), { email: manageEmail }); setManageEmail(''); alert("Email updated!"); } catch (error) { if (error.code === 'auth/requires-recent-login') alert("Please re-login."); else alert("Error: " + error.message); } setUpdatingCreds(false); };
  const getIcon = (type) => { switch(type) { case 'warning': return <AlertCircle size={18} />; case 'success': return <CheckCircle size={18} />; default: return <Megaphone size={18} />; } };
  const getBgColor = (type) => { switch(type) { case 'warning': return 'bg-orange-50 text-orange-600'; case 'success': return 'bg-green-50 text-green-600'; default: return 'bg-blue-50 text-blue-600'; } };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit mx-auto mb-6 overflow-x-auto max-w-full">
        {['overview', 'wallet', 'shop', 'my_id', 'repairs', 'plans', 'speedtest', 'documents', 'rewards', 'support', 'settings'].map(tab => (
           <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
              {tab === 'speedtest' ? <><Gauge size={16}/> Speed Test</> : tab === 'wallet' ? <><Wallet size={16}/> Wallet</> : tab === 'shop' ? <><ShoppingBag size={16}/> Shop</> : tab === 'my_id' ? <><CreditCard size={16}/> My ID</> : tab === 'repairs' ? <><Wrench size={16}/> Repairs</> : tab === 'plans' ? <><Globe size={16}/> Plans</> : tab === 'documents' ? <><FileText size={16}/> Documents</> : tab === 'rewards' ? <><Gift size={16}/> Rewards</> : tab === 'settings' ? <><UserCog size={16}/> Settings</> : tab}
           </button>
        ))}
      </div>
      {activeTab === 'speedtest' && <SpeedTest />}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 shadow-2xl">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-40"></div>
             <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-40"></div>
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Hello, {userData.username} 👋</h2>
                    <p className="text-slate-400">Welcome back to your SwiftNet portal.</p>
                </div>
                <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${userData.status === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${userData.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <span className="text-xs font-bold uppercase tracking-widest">{userData.status}</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Balance Card - Glassmorphism */}
             <div className="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 shadow-xl border border-white/40 bg-white/60 backdrop-blur-xl transition-all hover:shadow-2xl group">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">Total Balance Due</p>
                        <h3 className={`text-5xl font-black tracking-tight ${userData.balance > 0 ? 'text-slate-800' : 'text-green-600'}`}>
                            ₱{userData.balance?.toFixed(2)}
                        </h3>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                        <CreditCard size={32} />
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full bg-white/50 rounded-2xl p-4 border border-white/50">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Due Date</p>
                        <p className={`font-bold text-lg ${isOverdue ? 'text-red-500' : 'text-slate-700'}`}>
                            {new Date(userData.dueDate).toLocaleDateString(undefined, {month:'long', day:'numeric', year:'numeric'})}
                        </p>
                    </div>
                    <div className="flex-1 w-full bg-white/50 rounded-2xl p-4 border border-white/50">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Current Plan</p>
                        <p className="font-bold text-lg text-slate-700">{userData.plan}</p>
                    </div>
                </div>

                {userData.balance > 0 ? (
                    <>
                        <button onClick={() => setShowQR(true)} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3">
                            <Smartphone size={20} /> Pay Now via QR
                        </button>
                        <button onClick={() => setShowProofModal(true)} className="w-full mt-3 py-3 bg-white border-2 border-blue-100 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                            <UploadCloud size={20}/> Upload Payment Receipt
                        </button>
                    </>
                ) : (
                    <div className="mt-6 bg-green-100/50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold">
                        <CheckCircle size={20} /> You are fully paid. Enjoy surfing!
                    </div>
                )}
             </div>

             {/* Notifications Column */}
             <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-6 shadow-xl h-fit">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-700">Notifications</h3>
                    <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{allAlerts.length} New</div>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {allAlerts.length > 0 ? allAlerts.map((ann) => (
                        <div key={ann.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/50 hover:bg-blue-50/50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 p-1.5 rounded-full ${getBgColor(ann.type)}`}>{getIcon(ann.type)}</div>
                                <div>
                                    <p className="text-xs font-bold text-slate-700 mb-0.5">{ann.title}</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">{ann.message}</p>
                                    <p className="text-[9px] text-slate-400 mt-2 font-medium">{new Date(ann.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-slate-400 text-sm">All caught up!</div>
                    )}
                </div>
             </div>
          </div>
        </div>
      )}
      {activeTab === 'wallet' && <SwiftWallet user={userData} db={db} appId={appId} />}
      {activeTab === 'shop' && <Marketplace user={userData} db={db} appId={appId} />}
      {activeTab === 'my_id' && <DigitalID user={userData} />}
      {activeTab === 'repairs' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
               <div><h2 className="text-2xl font-bold text-slate-800">Repair Requests</h2><p className="text-sm text-slate-500">Track status.</p></div>
               <button onClick={() => setShowRepairModal(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-700 shadow-lg flex items-center gap-2"><Hammer size={18} /> Request Repair</button>
            </div>
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-500 uppercase">Active Requests</h3>
               {activeRepairs && activeRepairs.length > 0 ? activeRepairs.map(repair => (<RepairStatusCard key={repair.id} repair={repair} isSubscriber={true} onConfirm={onConfirmRepair} />)) : <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">No active repairs.</div>}
            </div>
            {historyRepairs.length > 0 && (<div className="pt-8 mt-8 border-t border-slate-200"><h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Clock size={18}/> Repair History</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{historyRepairs.map(repair => (<RepairStatusCard key={repair.id} repair={repair} isSubscriber={true} />))}</div></div>)}
         </div>
      )}
      {activeTab === 'documents' && (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <div><h2 className="text-2xl font-bold text-slate-800">My Documents</h2><p className="text-sm text-slate-500">View and download your contracts and statements.</p></div>
              </div>
              {/* Contract CTA */}
              {!userData.contractSigned && (
                  <div className="mb-6 p-6 bg-red-50 border-b border-red-100 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="bg-red-100 p-3 rounded-xl text-red-600"><PenTool size={24}/></div>
                          <div>
                              <h4 className="font-bold text-red-800">Service Contract Pending</h4>
                              <p className="text-xs text-red-600">Please sign your agreement to avoid interruption.</p>
                          </div>
                      </div>
                      <button onClick={() => setShowContract(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 shadow-md">
                          Sign Now
                      </button>
                  </div>
              )}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                      {documents.length > 0 ? documents.map(doc => (
                          <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><FileText size={24} /></div>
                                <div>
                                  <h4 className="font-bold text-slate-800">{doc.title}</h4>
                                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                    <span>{doc.type}</span> • <span>{new Date(doc.date).toLocaleDateString()}</span> • <span className="text-red-600 font-bold">₱{parseFloat(doc.amount).toLocaleString()}</span>
                                  </p>
                                </div>
                              </div>
                              <button onClick={() => setSelectedDoc(doc)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg font-bold text-sm transition-colors"><Eye size={18} /><span className="hidden sm:inline">View Invoice</span></button>
                          </div>
                      )) : <div className="p-8 text-center text-slate-400">No documents found.</div>}
                  </div>
              </div>
          </div>
      )}
      {activeTab === 'rewards' && (
          <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                          <Gift size={32} className="text-white" />
                          <h2 className="text-3xl font-bold">SwiftPoints</h2>
                      </div>
                      <p className="text-yellow-100 font-medium text-lg">Your Balance: <span className="text-4xl font-bold text-white ml-2">{userData.points || 0}</span> pts</p>
                      <p className="text-sm mt-4 text-yellow-50 opacity-90">Earn 50 points for every verified payment!</p>
                  </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Redeem Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                      <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4"><Zap size={24}/></div>
                      <h4 className="font-bold text-slate-800 text-lg">24h Speed Boost</h4>
                      <p className="text-sm text-slate-500 mb-4 flex-grow">Get an extra 50Mbps for 24 hours. Perfect for gaming or large downloads.</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          <span className="font-bold text-slate-800">150 pts</span>
                          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-50" disabled={(userData.points || 0) < 150}>Redeem</button>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                      <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center text-green-600 mb-4"><span className="text-2xl font-bold font-sans">₱</span></div>
                      <h4 className="font-bold text-slate-800 text-lg">₱50 Bill Rebate</h4>
                      <p className="text-sm text-slate-500 mb-4 flex-grow">Deduct ₱50 from your next billing statement instantly.</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          <span className="font-bold text-slate-800">200 pts</span>
                          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-50" disabled={(userData.points || 0) < 200}>Redeem</button>
                      </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col opacity-60">
                      <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center text-slate-500 mb-4"><Smartphone size={24}/></div>
                      <h4 className="font-bold text-slate-800 text-lg">Raffle Entry</h4>
                      <p className="text-sm text-slate-500 mb-4 flex-grow">Win a new iPhone 15! Draw date: Dec 31, 2023.</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          <span className="font-bold text-slate-800">50 pts</span>
                          <button className="bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed">Coming Soon</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
      {activeTab === 'plans' && (<div className="space-y-6"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-slate-800">Available Internet Plans</h2><span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">Current: {userData.plan}</span></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{availablePlans.map((plan) => (<div key={plan.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-slate-100 overflow-hidden flex flex-col"><div className="p-6 bg-gradient-to-br from-slate-50 to-white flex-grow"><h3 className="text-lg font-bold text-slate-800 mb-2">{plan.name}</h3><div className="flex items-center gap-2 mb-4"><Zap size={18} className="text-yellow-500" /><span className="text-sm text-slate-500">High Speed Internet</span></div><ul className="space-y-2 mb-6"><li className="flex items-center gap-2 text-sm text-slate-600"><Check size={14} className="text-green-500"/> Unlimited Data</li></ul></div><div className="p-4 bg-slate-50 border-t border-slate-100"><button onClick={() => handleApplyPlan(plan.name)} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">Request Change <ArrowRight size={16} /></button></div></div>))}</div></div>)}
      {activeTab === 'support' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1 h-fit"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MessageSquare size={20} className="text-blue-600"/> Create New Ticket</h3><form onSubmit={handleCreateTicket} className="space-y-4"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label><select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white" value={newTicket.subject} onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}><option value="">Select...</option><option value="No Internet">No Internet</option><option value="Billing">Billing</option><option value="Other">Other</option></select></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label><textarea required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none h-32 resize-none" value={newTicket.message} onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}></textarea></div><button type="submit" disabled={ticketLoading} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700">{ticketLoading ? 'Submitting...' : 'Submit Ticket'}</button></form></div><div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 h-fit"><h3 className="font-bold text-slate-800 mb-4">My Ticket History</h3><div className="space-y-4 max-h-[600px] overflow-y-auto">{tickets && tickets.length > 0 ? tickets.map(ticket => (<div key={ticket.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50"><div className="flex justify-between items-start mb-2"><h4 className="font-bold text-slate-800">#{ticket.ticketId || '---'} - {ticket.subject}</h4><span className="text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 px-2 py-1 rounded">{ticket.status}</span></div><p className="text-sm text-slate-600 mb-3">{ticket.message}</p>{ticket.adminReply && <div className="bg-white border-l-4 border-blue-500 p-3 rounded-r-lg mt-3"><p className="text-xs font-bold text-blue-600 mb-1">Admin Response:</p><p className="text-sm text-slate-700">{ticket.adminReply}</p></div>}<div className="mt-3 pt-2 border-t border-slate-100">{followingUpTo === ticket.id ? (<div className="mt-2"><textarea className="w-full border p-2 text-sm" rows="2" value={followUpText} onChange={(e) => setFollowUpText(e.target.value)}></textarea><div className="flex gap-2 justify-end"><button onClick={() => setFollowingUpTo(null)} className="text-xs font-bold px-3">Cancel</button><button onClick={() => handleFollowUpTicket(ticket.id, ticket.message)} className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded">Send</button></div></div>) : (<button onClick={() => setFollowingUpTo(ticket.id)} className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-1"><MessageCircle size={14} /> Add Note</button>)}</div></div>)) : <p className="text-center text-slate-400">No tickets found.</p>}</div></div></div>)}
      {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Identity Card */}
              <div className="col-span-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <ShieldCheck size={20} className={userData.kycStatus === 'verified' ? "text-green-500" : "text-slate-400"}/> 
                          Identity Verification
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                          {userData.kycStatus === 'verified' ? 'Your identity is verified.' : 
                           userData.kycStatus === 'pending' ? 'Verification is under review.' : 
                           'Please upload an ID to secure your account.'}
                      </p>
                  </div>

                  {/* Simplified Logic: Shows Button OR Verified Badge OR Pending Badge */}
                  {userData.kycStatus === 'verified' ? (
                      <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold uppercase">Verified</span>
                  ) : userData.kycStatus === 'pending' ? (
                      <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-xs font-bold uppercase">Pending</span>
                  ) : (
                      <button onClick={() => setShowKYC(true)} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 w-full md:w-auto">
                          Verify Now
                      </button>
                  )}
              </div>

              {/* Password & Email Cards */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock size={20} className="text-blue-600"/> Change Password</h3>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <input type="password" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-slate-700" value={managePass} onChange={(e) => setManagePass(e.target.value)} placeholder="New password" />
                      <button type="submit" disabled={updatingCreds} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">{updatingCreds ? 'Updating...' : 'Update'}</button>
                  </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Mail size={20} className="text-blue-600"/> Update Email</h3>
                  <form onSubmit={handleUpdateEmail} className="space-y-4">
                      <input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-slate-700" value={manageEmail} onChange={(e) => setManageEmail(e.target.value)} placeholder="new@email.com" />
                      <button type="submit" disabled={updatingCreds} className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900">{updatingCreds ? 'Updating...' : 'Update'}</button>
                  </form>
              </div>
          </div>
      )}
      {showQR && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4"><div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"><div className="bg-blue-700 p-5 flex justify-between items-center"><h3 className="text-white font-bold flex items-center space-x-2"><CreditCard size={20} /><span>Scan to Pay</span></h3><button onClick={() => setShowQR(false)} className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full"><X size={20} /></button></div><div className="p-8 flex flex-col items-center text-center"><p className="text-slate-600 text-sm mb-6">Scan the QR code with your banking app to pay <span className="font-bold text-slate-900 block text-2xl mt-2">₱{userData.balance.toFixed(2)}</span></p><div className="bg-white p-4 border-2 border-dashed border-blue-200 rounded-2xl shadow-sm mb-8"><img src="/qr-code.png" alt="Payment QR" className="w-48 h-48 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200?text=QR+Image+Missing"; }} /></div><div className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 mb-4">Payment posting will reflect once the admin verifies your payment. Your reference number provided should match on the payment they received.</div><div className="w-full text-left"><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reference Number</label><form onSubmit={handlePaymentSubmit} className="flex gap-3"><input type="text" required placeholder="e.g. Ref-123456" className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium" value={refNumber} onChange={(e) => setRefNumber(e.target.value)} /><button type="submit" disabled={submitting} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 shadow-md shadow-green-200">{submitting ? '...' : 'Verify'}</button></form></div></div></div></div>)}
      {showRepairModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"><div className="bg-red-600 p-5 flex justify-between items-center"><h3 className="text-white font-bold flex items-center gap-2"><Hammer size={20} /> Request Service Repair</h3><button onClick={() => setShowRepairModal(false)} className="text-white/80 hover:text-white"><X size={24} /></button></div><div className="p-6"><p className="text-slate-600 text-sm mb-4">Please describe the issue.</p><textarea className="w-full border border-slate-300 rounded-lg p-3 h-32" value={repairNote} onChange={(e) => setRepairNote(e.target.value)}></textarea><div className="mt-4 flex justify-end gap-2"><button onClick={() => setShowRepairModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button><button onClick={handleRequestRepair} className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">Submit</button></div></div></div></div>)}
      {showProofModal && <PaymentProofModal user={userData} db={db} appId={appId} onClose={() => setShowProofModal(false)} />}
        {showKYC && <KYCModal user={userData} db={db} appId={appId} onClose={() => setShowKYC(false)} />}
      <InvoiceModal doc={selectedDoc} user={userData} onClose={() => setSelectedDoc(null)} />
     {showContract && (
        <ServiceContractModal 
            user={userData} 
            db={db} 
            appId={appId} 
            onClose={() => setShowContract(false)} 
        />
      )}
    </div>
  );
};
const AdminAnalytics = ({ subscribers, payments, tickets }) => {
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
    kycStatus: user.kycStatus || 'none',
    username: user.username || '',
    email: user.email || '',
    accountNumber: user.accountNumber || '',
    plan: user.plan || '',
    address: user.address || '',
    status: user.status || 'active',
    balance: user.balance || 0
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.id);
        await updateDoc(docRef, {
            ...formData,
            balance: parseFloat(formData.balance)
        });
        alert("Subscriber details updated successfully!");
        onClose();
    } catch (e) {
        console.error(e);
        alert("Error updating user: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4 animate-in fade-in">
        <div className="bg-white w-[95%] md:w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Edit size={20} /> Edit Subscriber
                </h3>
                <button onClick={onClose}><X className="text-slate-400 hover:text-white"/></button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                        <input className="w-full border p-2 rounded-lg" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Account No.</label>
                        <input className="w-full border p-2 rounded-lg bg-slate-50 font-mono" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Status</label>
                        <select className="w-full border p-2 rounded-lg" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="active">Active</option>
                            <option value="overdue">Overdue</option>
                            <option value="disconnected">Disconnected</option>
                            <option value="applicant">Applicant</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Internet Plan</label>
                        <select className="w-full border p-2 rounded-lg" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                            <option value="">-- Select Plan --</option>
                            {plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Current Balance</label>
                        <input type="number" className="w-full border p-2 rounded-lg" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Address</label>
                        <textarea className="w-full border p-2 rounded-lg h-20 resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                    </div>
                    {/* KYC Section */}
                    {user.kycImage && (
                        <div className="col-span-2 mt-4 pt-4 border-t border-slate-100">
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Identity Verification ({user.kycType})</label>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex gap-4 items-start">
                                <img src={user.kycImage} alt="KYC" className="w-32 h-24 object-cover rounded-lg border border-slate-300 bg-white cursor-pointer" onClick={() => window.open(user.kycImage, '_blank')} />
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-slate-800 mb-1">Status: <span className="uppercase text-blue-600">{formData.kycStatus}</span></p>
                                    <p className="text-xs text-slate-500 mb-2">Submitted: {user.kycDate ? new Date(user.kycDate).toLocaleDateString() : 'N/A'}</p>
                                    
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setFormData({...formData, kycStatus: 'verified'})} className={`px-3 py-1 rounded text-xs font-bold border ${formData.kycStatus === 'verified' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-600'}`}>
                                            Approve
                                        </button>
                                        <button type="button" onClick={() => setFormData({...formData, kycStatus: 'rejected'})} className={`px-3 py-1 rounded text-xs font-bold border ${formData.kycStatus === 'rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-600'}`}>
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg transition-all">
                        {loading ? 'Saving...' : 'Save Changes'}
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
            message: `Dear ${user.username}, your new Statement of Account for ${monthName} has been generated. Please check your dashboard or view the attachment.`
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
  const [mode, setMode] = useState('bill'); // 'bill' or 'wallet'
  const [processing, setProcessing] = useState(false);

  const filtered = queryText ? subscribers.filter(s => s.username.toLowerCase().includes(queryText.toLowerCase()) || s.accountNumber.includes(queryText)) : [];

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
                      message: `Thank you for visiting our office. Your payment has been posted and the receipt is in your dashboard.`
                  });
              }

              alert(`Bill Paid! Receipt saved to Dashboard & Email Sent.`);
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
                <button onClick={() => setMode('bill')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'bill' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Pay Bill</button>
                <button onClick={() => setMode('wallet')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'wallet' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Load Wallet</button>
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
                                <p className="text-[10px] text-slate-400 uppercase">Wallet Credits</p>
                                <p className="text-emerald-400 font-mono font-bold">₱{selectedUser.walletCredits || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-slate-400 text-xs uppercase font-bold block mb-2">{mode === 'bill' ? 'Payment Amount' : 'Load Amount'}</label>
                        <input type="number" className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 text-3xl font-mono font-bold text-white outline-none focus:border-green-500" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <button onClick={handleTransaction} disabled={processing || !amount} className={`w-full mt-auto py-4 rounded-xl font-bold text-xl shadow-lg transition-all disabled:opacity-50 ${mode === 'bill' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                        {processing ? 'Processing...' : mode === 'bill' ? 'Confirm Payment' : 'Confirm Top-up'}
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
            message: `You have been assigned as a ${formData.role}. Use this password to log in.`
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

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'main_settings'), (snap) => {
        if (snap.exists()) setEnabled(snap.data().maintenanceMode || false);
    });
    return () => unsub();
  }, [db, appId]);

  const toggle = async () => {
      const newState = !enabled;
      if (newState && !confirm("WARNING: Turning this ON will block all subscribers and staff from logging in. Only Admins will have access. Proceed?")) return;
      
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', CONFIG_COLLECTION, 'main_settings'), {
          maintenanceMode: newState
      }, { merge: true });
  };

  return (
    <button onClick={toggle} className={`flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-all ${enabled ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200 text-slate-600'}`}>
        {enabled ? <ToggleRight size={24} className="text-red-600"/> : <ToggleLeft size={24} />}
        <div className="text-left leading-tight">
            <p className="text-xs font-bold uppercase tracking-wider">Maintenance Mode</p>
            <p className="text-[10px] font-bold">{enabled ? 'ACTIVE (Lockdown)' : 'Normal Operation'}</p>
        </div>
    </button>
  );
};

const AdminDashboard = ({ subscribers, announcements, payments, tickets, repairs }) => {
  const [activeTab, setActiveTab] = useState('subscribers'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showAddTechModal, setShowAddTechModal] = useState(false); 
  const [newTech, setNewTech] = useState({ email: '', password: '', username: '' });
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
  const [newUser, setNewUser] = useState({ email: '', password: '', username: '', accountNumber: '', plan: '' });
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', username: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' });
  const [notifyData, setNotifyData] = useState({ targetId: null, targetName: '', title: '', message: '' });
  const [newDueDate, setNewDueDate] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false); 
  const [newJob, setNewJob] = useState({ targetUserId: '', type: 'New Installation', notes: '', assignedTechId: '' });
  
  // NEW: Outage States
  const [outages, setOutages] = useState([]);
const [expenses, setExpenses] = useState([]);
  const [newOutage, setNewOutage] = useState({ area: '', message: '', status: 'Active' });
  const [editingUser, setEditingUser] = useState(null);
  const [billingUser, setBillingUser] = useState(null);
  const [showStaffModal, setShowStaffModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if(fetchedPlans.length === 0) { ['Fiber 100Mbps', 'Fiber 300Mbps'].forEach(async n => await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION), { name: n })); }
      setPlans(fetchedPlans);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), where('role', '==', 'technician'));
    const unsubscribe = onSnapshot(q, (snapshot) => { setTechnicians(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
    return () => unsubscribe();
  }, []);
  
  // Fetch Outages
  useEffect(() => {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', OUTAGES_COLLECTION), orderBy('date', 'desc'));
      const unsubscribe = onSnapshot(q, (s) => setOutages(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      return () => unsubscribe();
  }, []);

// Fetch Expenses (Fixes the crash)
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', EXPENSES_COLLECTION), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [appId, db]);

  const handleStatusChange = async (userId, newStatus) => { try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userId), { status: newStatus }); } catch (e) { console.error(e); } };
  const handleAddBill = async (subscriber) => {
    const amountStr = prompt(`Enter bill amount for ${subscriber.username}:`, "1500");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return alert("Invalid amount");

    const newBalance = (subscriber.balance || 0) + amount;
    const date = new Date();
    // Due date is 15 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    try {
      // 1. Create the Document
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', INVOICES_COLLECTION), {
        userId: subscriber.id,
        title: `Statement of Account - ${monthName}`,
        date: date.toISOString(),
        dueDate: dueDate.toISOString(),
        type: 'Invoice',
        amount: amount, 
        status: 'Unpaid'
      });

      // 2. Update Balance
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, subscriber.id), {
        balance: newBalance,
        status: newBalance > 0 ? 'overdue' : 'active',
        dueDate: dueDate.toISOString()
      });
      alert("Bill added & Statement generated!");
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    }
  };
  const handleChangePassword = async (e) => { e.preventDefault(); if (adminNewPass.length < 6) return alert("Min 6 chars"); try { await updatePassword(auth.currentUser, adminNewPass); alert("Success"); setShowPasswordModal(false); } catch (e) { alert(e.message); } };
  const handleAddSubscriber = async (e) => { e.preventDefault(); setIsCreatingUser(true); let secondaryApp = null; try { secondaryApp = initializeApp(firebaseConfig, "Secondary"); const secondaryAuth = getAuth(secondaryApp); const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password); const newUid = userCredential.user.uid; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), { uid: newUid, username: newUser.username, email: newUser.email, accountNumber: newUser.accountNumber, plan: newUser.plan || (plans[0] ? plans[0].name : 'Basic'), balance: 0, status: 'active', role: 'subscriber', dueDate: new Date().toISOString() }); await deleteApp(secondaryApp); setShowAddModal(false); alert("Success"); } catch (e) { alert(e.message); } setIsCreatingUser(false); };
  const handleAddAdmin = async (e) => { e.preventDefault(); setIsCreatingUser(true); let secondaryApp = null; try { secondaryApp = initializeApp(firebaseConfig, "SecondaryAdmin"); const secondaryAuth = getAuth(secondaryApp); const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newAdmin.email, newAdmin.password); const newUid = userCredential.user.uid; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), { uid: newUid, username: newAdmin.username, email: newAdmin.email, role: 'admin', accountNumber: 'ADMIN', plan: 'N/A', balance: 0, status: 'active', dueDate: new Date().toISOString() }); await deleteApp(secondaryApp); setShowAddAdminModal(false); alert("Admin created"); } catch (e) { alert(e.message); } setIsCreatingUser(false); };
  const handleAddTechnician = async (e) => { e.preventDefault(); setIsCreatingUser(true); let secondaryApp = null; try { secondaryApp = initializeApp(firebaseConfig, "SecondaryTech"); const secondaryAuth = getAuth(secondaryApp); const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newTech.email, newTech.password); const newUid = userCredential.user.uid; await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), { uid: newUid, username: newTech.username, email: newTech.email, role: 'technician', accountNumber: 'TECH', plan: 'N/A', balance: 0, status: 'active', dueDate: new Date().toISOString() }); await deleteApp(secondaryApp); setShowAddTechModal(false); alert("Technician created!"); } catch(e) { alert(e.message); } setIsCreatingUser(false); };
  const handleAddPlan = async (e) => { e.preventDefault(); if(!newPlanName) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION), { name: newPlanName }); setNewPlanName(''); };
  const handleDeletePlan = async (id) => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION, id)); };
  const handlePostAnnouncement = async (e) => { e.preventDefault(); if(!newAnnouncement.title) return; await addDoc(collection(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION), { ...newAnnouncement, date: new Date().toISOString() }); setShowAnnounceModal(false); };
  const handleDeleteAnnouncement = async (id) => { if(confirm("Delete?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION, id)); };
  const handleUpdateDueDate = async (e) => { e.preventDefault(); if (!showDateModal || !newDueDate) return; try { const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, showDateModal.id); await updateDoc(docRef, { dueDate: new Date(newDueDate).toISOString() }); alert("Due date updated successfully!"); setShowDateModal(null); } catch(e) { console.error(e); alert("Failed to update date: " + e.message); } };
  const handleReplyTicket = async (ticketId) => { if(!replyText) return; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticketId), { adminReply: replyText, status: 'resolved' }); setReplyingTo(null); setReplyText(''); } catch(e) { alert("Failed"); } };
  const handleUpdateRepairStatus = async (repairId, currentStep) => { if (currentStep === 3) { alert("Waiting for customer confirmation. You cannot force complete this step."); return; } const newStep = currentStep < 4 ? currentStep + 1 : 4; const statusLabels = ['Submission', 'Evaluation', 'Processing', 'Customer Confirmation', 'Completed']; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId), { stepIndex: newStep, status: statusLabels[newStep] }); } catch(e) { console.error(e); } };
  const handleForceComplete = async (repairId) => { if (!confirm("Force complete this repair? This bypasses customer confirmation.")) return; try { const docRef = doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId); await updateDoc(docRef, { stepIndex: 4, status: 'Completed', completedDate: new Date().toISOString() }); alert("Repair marked as completed by Admin."); } catch(e) { console.error(e); alert("Failed to force complete."); } };
  const handleApprovePlanChange = async (ticket) => { if(!confirm(`Approve plan change to ${ticket.targetPlan} for ${ticket.username}?`)) return; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, ticket.userId), { plan: ticket.targetPlan }); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticket.id), { status: 'resolved', adminReply: `Plan change to ${ticket.targetPlan} approved and updated.` }); alert("Plan updated successfully!"); } catch (e) { console.error(e); alert("Failed to update plan."); } };
  const handleApproveApplication = async (ticket) => { const amountStr = prompt("Enter initial balance/installation fee for this user:", "1500"); if (amountStr === null) return; const amount = parseFloat(amountStr); if (isNaN(amount)) { alert("Invalid amount. Please enter a number."); return; } const newAccountNo = Math.floor(Math.random() * 1000000).toString(); const planName = ticket.targetPlan; try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, ticket.targetUserId), { status: 'active', accountNumber: newAccountNo, plan: planName, balance: amount, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticket.id), { status: 'resolved', adminReply: `Approved! Account Number: ${newAccountNo}. Initial Balance: ₱${amount}. Please proceed to payment.` }); alert(`Application Approved! Assigned Account #${newAccountNo} with balance ₱${amount}`); } catch(e) { alert("Failed to approve."); } };
  const handleOpenNotify = (sub) => { setNotifyData({ targetId: sub.id, targetName: sub.username, title: '', message: '' }); setShowNotifyModal(true); };
  const handleSendNotification = async (e) => { e.preventDefault(); try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', NOTIFICATIONS_COLLECTION), { userId: notifyData.targetId, title: notifyData.title, message: notifyData.message, date: new Date().toISOString(), type: 'info', read: false }); setShowNotifyModal(false); alert("Sent!"); } catch (e) { alert("Failed."); } };
  const handleDeleteSubscriber = async (id) => { if (confirm("Delete subscriber?")) { try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, id)); alert("Deleted."); } catch (e) { alert("Failed."); } } };
  
  // UPDATED: Add Points on Payment Verification
  const handleVerifyPayment = async (paymentId, userId, amountPaid, refNumber) => { 
      if (!confirm("Verify payment and generate Official Receipt?")) return; 
      
      // 1. Get User Data to verify email and current balance
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return alert("User error.");
      const userData = userSnap.data();

      try { 
          // 2. Mark the Payment Record as Verified
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION, paymentId), { 
              status: 'verified', 
              verifiedAt: new Date().toISOString() 
          }); 

          // 3. Update the Subscriber's Balance (Ledger)
          const finalAmount = parseFloat(amountPaid) || 1500;
          const newBalance = (userData.balance || 0) - finalAmount;

          await updateDoc(userRef, { 
              balance: newBalance, 
              status: 'active', 
              lastPaymentDate: new Date().toISOString(),
              points: increment(50) // Auto-Reward Points
          }); 

          // 4. AUTO-GENERATE DOCUMENT (This makes it appear in the "Documents" tab)
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

          // 5. AUTO-SEND EMAIL (This sends the notification)
          if (userData.email) {
              await sendCustomEmail('receipt', {
                  name: userData.username,
                  email: userData.email,
                  amount: `₱${finalAmount.toLocaleString()}`,
                  refNumber: refNumber,
                  message: `Payment verified! We have added the Official Receipt to your Documents tab.`
              });
          }

          alert("Success! Receipt generated in Documents tab & Email sent."); 
      } catch (e) { 
          console.error(e);
          alert("Failed: " + e.message); 
      } 
  };
  
  const handleAssignTech = async (repairId, techUid) => { if(!techUid) return; const tech = technicians.find(t => t.uid === techUid); try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId), { assignedTechId: techUid, assignedTechName: tech.username, stepIndex: 1, status: 'Evaluation' }); } catch(e) { console.error(e); } };
  const handleAdminCreateJob = async (e) => { e.preventDefault(); if(!newJob.targetUserId || !newJob.notes) return alert("Select user and add details."); const targetUser = subscribers.find(u => u.id === newJob.targetUserId); const randomId = Math.floor(Math.random() * 10000000000).toString().padStart(11, '0'); const startStep = newJob.assignedTechId ? 1 : 0; const startStatus = newJob.assignedTechId ? 'Evaluation' : 'Submission'; const assignedTechName = newJob.assignedTechId ? technicians.find(t => t.uid === newJob.assignedTechId)?.username : null; try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), { requestId: randomId, userId: targetUser.uid, username: targetUser.username, address: targetUser.address || "Address not set", type: newJob.type, notes: newJob.notes, status: startStatus, stepIndex: startStep, assignedTechId: newJob.assignedTechId || null, assignedTechName: assignedTechName || null, technicianNote: newJob.assignedTechId ? 'Technician assigned by Admin.' : 'Waiting for assignment.', dateFiled: new Date().toISOString() }); setShowCreateJobModal(false); setNewJob({ targetUserId: '', type: 'New Installation', notes: '', assignedTechId: '' }); alert("Job created successfully!"); } catch(e) { console.error(e); alert("Failed to create job."); } };
  
  // NEW: Post Outage
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
  
  // NEW: Resolve Outage
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
      {/* CHANGE: max-w-[95vw] and overflow-x-auto */}
      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex space-x-1 overflow-x-auto max-w-[95vw] mx-auto md:mx-0 scrollbar-hide">
         {['analytics', 'reports', 'cashier', 'coverage', 'expenses', 'store', 'subscribers', 'network', 'repairs', 'payments', 'tickets', 'plans', 'speedtest'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
                {tab === 'analytics' ? <><Activity size={16} /> Analytics</> : tab === 'reports' ? <><FileBarChart size={16}/> Reports</> : tab === 'cashier' ? <><Calculator size={16}/> Cashier</> : tab === 'coverage' ? <><Map size={16}/> Coverage</> : tab === 'store' ? <><ShoppingBag size={16}/> Store Manager</> : tab === 'expenses' ? <><TrendingDown size={16}/> Expenses</> : tab === 'speedtest' ? <><Gauge size={16} /> Speed Test</> : tab === 'repairs' ? <><Wrench size={16}/> Repairs</> : tab === 'network' ? <><Signal size={16}/> Network</> : tab}
            </button>
         ))}
      </div>
      {activeTab === 'store' && <ProductManager appId={appId} db={db} />}
      {activeTab === 'expenses' && <ExpenseManager appId={appId} db={db} subscribers={subscribers} payments={payments} />}
      {activeTab === 'speedtest' && <SpeedTest />}
      {activeTab === 'analytics' && <AdminAnalytics subscribers={subscribers} payments={payments} tickets={tickets} />}
      {activeTab === 'reports' && <ReportGenerator payments={payments} expenses={expenses || []} subscribers={subscribers} />}
      {activeTab === 'cashier' && <CashierMode subscribers={subscribers} db={db} appId={appId} />}
      {activeTab === 'coverage' && <ServiceAreaManager appId={appId} db={db} />}
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
          {/* Added max-w-[90vw] to ensure it fits within the screen width */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-[90vw] mx-auto lg:max-w-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[800px]"> {/* Added min-w-[800px] to force scroll */}
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
                      <td className="px-6 py-4 text-right space-x-2 flex justify-end items-center">{sub.role !== 'admin' && sub.role !== 'technician' && (<><button onClick={() => setEditingUser(sub)} className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors mr-1" title="Edit Details"><Edit size={16} /></button><button onClick={() => handleOpenNotify(sub)} className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-md transition-colors" title="Send Notification"><Bell size={16} /></button><button onClick={() => setBillingUser(sub)} className="text-blue-600 hover:text-blue-900 text-xs font-bold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">+ Bill</button>{sub.status === 'active' ? <button onClick={() => handleStatusChange(sub.id, 'disconnected')} className="text-red-600 hover:text-red-900 text-xs font-bold border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Cut</button> : <button onClick={() => handleStatusChange(sub.id, 'active')} className="text-green-600 hover:text-green-900 text-xs font-bold border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">Restore</button>}<button onClick={() => handleDeleteSubscriber(sub.id)} className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors ml-2" title="Delete User"><UserX size={16} /></button></>)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
       
       {/* NEW: Network Management Tab */}
       {activeTab === 'network' && (
           <div className="space-y-6">
               <div className="flex justify-between items-center">
                   <div><h2 className="text-2xl font-bold text-slate-800">Network Status Center</h2><p className="text-sm text-slate-500">Manage service outages and maintenance alerts.</p></div>
               </div>
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

       {activeTab === 'tickets' && (<div className="space-y-4"><h2 className="text-xl font-bold text-slate-800">Support Tickets & Applications</h2><div className="grid grid-cols-1 gap-4">{tickets && tickets.length > 0 ? tickets.map(ticket => (<div key={ticket.id} className={`p-5 rounded-xl shadow-sm border ${ticket.isApplication ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}><div className="flex justify-between items-start mb-3"><div><h4 className="font-bold text-lg text-slate-800">#{ticket.ticketId || '---'} - {ticket.subject} {ticket.isApplication && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full ml-2">APPLICATION</span>}</h4><p className="text-xs text-slate-500">From: <span className="font-bold text-blue-600">{ticket.username}</span> • {new Date(ticket.date).toLocaleString()}</p></div><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{ticket.status}</span></div><p className="text-slate-700 text-sm mb-4">{ticket.message}</p>{ticket.isPlanChange && ticket.status === 'open' && (<button onClick={() => handleApprovePlanChange(ticket)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg mb-3 shadow-md transition-colors flex items-center justify-center gap-2"><CheckCircle size={16} /> Approve Plan Change</button>)}{ticket.isApplication && ticket.status === 'open' && (<button onClick={() => handleApproveApplication(ticket)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg mb-3 shadow-md transition-colors">Approve & Assign Account #</button>)}{ticket.adminReply ? <div className="border-t border-slate-200 pt-3"><p className="text-xs font-bold text-slate-400 uppercase mb-1">Your Reply</p><p className="text-sm text-blue-700 font-medium">{ticket.adminReply}</p></div> : (<div className="flex gap-2 mt-2">{replyingTo === ticket.id ? (<div className="w-full"><textarea className="w-full border border-slate-300 rounded-lg p-2 text-sm mb-2" rows="3" value={replyText} onChange={(e) => setReplyText(e.target.value)}></textarea><div className="flex gap-2 justify-end"><button onClick={() => setReplyingTo(null)} className="text-slate-500 text-sm font-bold">Cancel</button><button onClick={() => handleReplyTicket(ticket.id)} className="bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-lg">Send Reply</button></div></div>) : <button onClick={() => { setReplyingTo(ticket.id); setReplyText(''); }} className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors"><MessageSquare size={16} /> Reply</button>}</div>)}</div>)) : <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400">No tickets found.</div>}</div></div>)}
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
       {activeTab === 'plans' && <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><h3 className="font-bold mb-4">Manage Plans</h3><div className="space-y-2">{plans.map(p=><div key={p.id} className="flex justify-between items-center border-b pb-2"><span>{p.name}</span><button onClick={()=>handleDeletePlan(p.id)} className="text-red-500"><Trash2 size={14}/></button></div>)}</div><form className="mt-4 flex gap-2" onSubmit={handleAddPlan}><input className="border p-2 rounded text-sm" placeholder="New Plan" value={newPlanName} onChange={e=>setNewPlanName(e.target.value)}/><button className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Add</button></form></div>}
       {activeTab === 'payments' && <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><h3 className="font-bold mb-4">Payments</h3><div className="space-y-2">{payments.map(p=><div key={p.id} className="flex justify-between border-b pb-2"><span>{p.username}</span><span className="font-mono text-blue-600">{p.refNumber}</span><span className="text-xs text-slate-400">{new Date(p.date).toLocaleDateString()}</span><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.status === 'verified' ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status || 'pending'}</span>{p.status !== 'verified' && (<button onClick={() => handleVerifyPayment(p.id, p.userId, 1500, p.refNumber)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 transition-colors">Verify</button>)}</div>)}</div></div>}
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
    if (user.role === 'admin' || user.role === 'cashier') {
       onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), s => setSubscribers(s.docs.map(d => ({id: d.id, ...d.data()}))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), orderBy('date', 'desc')), s => setPayments(s.docs.map(d => ({id: d.id, ...d.data()}))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), orderBy('dateFiled', 'desc')), s => setRepairs(s.docs.map(d => ({id: d.id, ...d.data()}))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), orderBy('date', 'desc')), s => setTickets(s.docs.map(d => ({id: d.id, ...d.data()}))));
    } 
    else if (user.role === 'technician') {
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION),
            where('assignedTechId', '==', user.uid)
        );
        onSnapshot(q, s => {
            const allAssigned = s.docs.map(d => ({id: d.id, ...d.data()}));
            setRepairs(allAssigned); 
        });
    }
    else {
       onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.uid), s => setMySubscriberData({id: s.id, ...s.data()}));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), where('userId', '==', user.uid)), s => setTickets(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b)=>new Date(b.date)-new Date(a.date))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION), where('userId', '==', user.uid)), s => setRepairs(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b)=>new Date(b.dateFiled)-new Date(a.dateFiled))));
       onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', NOTIFICATIONS_COLLECTION), where('userId', '==', user.uid)), s => {
           setNotifications(s.docs.map(d => ({id: d.id, ...d.data()})));
       });
    }
    onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION), orderBy('date', 'desc')), s => setAnnouncements(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [user]);

  const handleLogout = async () => await signOut(auth);

  const handlePayment = async (id, refNumber) => {
    if (!refNumber) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), { userId: id, username: user.displayName || user.email, refNumber, date: new Date().toISOString(), status: 'submitted' });
      alert(`Payment Submitted for Verification! Ref: ${refNumber}`);
    } catch (e) { alert("Payment failed."); }
  };

  const handleTechUpdateStatus = async (repairId, currentStep) => {
      let nextStatus = '';
      let nextStepIndex = currentStep + 1;
      let note = '';
      if (currentStep === 1) { nextStatus = 'Processing'; note = 'Technician has started repairs.'; } 
      else if (currentStep === 2) { nextStatus = 'Customer Confirmation'; note = 'Repairs completed. Pending customer verification.'; } 
      else { return; }
      try { const docRef = doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId); await updateDoc(docRef, { stepIndex: nextStepIndex, status: nextStatus, technicianNote: note }); } catch (e) { console.error(e); alert("Update failed."); }
  };

  const handleConfirmRepair = async (repairId) => {
      try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', REPAIRS_COLLECTION, repairId);
          await updateDoc(docRef, { stepIndex: 4, status: 'Completed', completedDate: new Date().toISOString() });
          // Need to pass userData to this function or fetch it, assuming 'user' state is available in App scope
          await sendCustomEmail('feedback', {
              name: user.displayName || user.email,
              email: user.email,
              message: `Your repair #${repairId} is complete. How did we do? Click the link to rate us.`,
              link: 'https://www.facebook.com/SwiftnetISP/reviews' 
          });
          alert("Thank you! The repair is now marked as completed.");
      } catch(e) { console.error(e); alert("Failed to confirm."); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600">Loading SwiftNet...</div>;
  if (!user) return <Login onLogin={() => {}} />;

  return (
    <Layout user={user} onLogout={handleLogout}>
      {user.role === 'admin' ? (
        <AdminDashboard subscribers={subscribers} announcements={announcements} payments={payments} tickets={tickets} repairs={repairs} user={user} />
      ) : user.role === 'cashier' ? (
        <CashierDashboard subscribers={subscribers} db={db} appId={appId} />
      ) : user.role === 'technician' ? (
        <TechnicianDashboard repairs={repairs} onTechUpdate={handleTechUpdateStatus} />
      ) : (
        <SubscriberDashboard userData={mySubscriberData || {}} onPay={handlePayment} announcements={announcements} notifications={notifications} tickets={tickets} repairs={repairs} onConfirmRepair={handleConfirmRepair} />
      )}
    </Layout>
  );
}