import React, { useState, useEffect } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword
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
  serverTimestamp
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
  Send
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
const PAYMENTS_COLLECTION = 'isp_payments_v1'; // New collection for payment logs
const TICKETS_COLLECTION = 'isp_tickets_v1';   // New collection for support tickets
const ADMIN_EMAIL = 'admin@swiftnet.com'; 

// --- Components ---

// 1. Shared Layout - Updated for Better Responsiveness
const Layout = ({ children, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 font-sans text-slate-800 flex flex-col">
      <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        {/* Expanded max-width to screen-2xl for better desktop fit */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-white/10 p-2 rounded-lg">
                <Wifi className="h-6 w-6 text-blue-200" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">SwiftNet<span className="text-blue-300">ISP</span></span>
            </div>
            
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-1.5 bg-white/10 rounded-full text-sm border border-white/10 backdrop-blur-md">
                  {user.email === ADMIN_EMAIL ? <Shield size={14} className="text-yellow-300" /> : <User size={14} className="text-blue-200" />}
                  <span className="font-medium tracking-wide">{user.displayName || user.email}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 text-blue-100 hover:text-white"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}

            {user && (
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                  {isMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {isMenuOpen && user && (
          <div className="md:hidden bg-indigo-900 px-4 py-4 space-y-2 border-t border-white/10">
            <div className="text-sm text-blue-200 mb-4 px-2">Logged in as <span className="text-white font-medium">{user.email}</span></div>
            <button 
              onClick={onLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </nav>

      {/* Main content expands to fill space better on large screens */}
      <main className="flex-grow max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

// 2. Login Component
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-white/20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
           <div className="bg-white/20 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-sm shadow-inner">
             <Wifi className="h-8 w-8 text-white" />
           </div>
           <h2 className="text-2xl font-bold text-white mb-1">Welcome to SwiftNet</h2>
           <p className="text-blue-100 text-sm font-light">Secure Subscriber Access</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:translate-y-[-1px] transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// 3. Subscriber Dashboard
const SubscriberDashboard = ({ userData, onPay, announcements, tickets }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [showQR, setShowQR] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [ticketLoading, setTicketLoading] = useState(false);

  if (!userData) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
      <div className="animate-spin mb-4"><RefreshCw /></div>
      <p>Loading your account details...</p>
    </div>
  );

  const isOverdue = userData.status === 'overdue' || userData.status === 'disconnected';
  const formattedDue = new Date(userData.dueDate).toLocaleDateString();

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onPay(userData.id, refNumber, userData.username);
    setSubmitting(false);
    setShowQR(false);
    setRefNumber('');
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;
    setTicketLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), {
        userId: userData.uid, 
        username: userData.username,
        subject: newTicket.subject,
        message: newTicket.message,
        status: 'open',
        adminReply: '',
        date: new Date().toISOString()
      });
      setNewTicket({ subject: '', message: '' });
      alert("Ticket submitted successfully!");
    } catch (error) {
      console.error("Error creating ticket", error);
      alert("Failed to submit ticket.");
    }
    setTicketLoading(false);
  };

  const getIcon = (type) => {
    switch(type) {
      case 'warning': return <AlertCircle size={18} />;
      case 'success': return <CheckCircle size={18} />;
      default: return <Megaphone size={18} />;
    }
  };

  const getBgColor = (type) => {
    switch(type) {
      case 'warning': return 'bg-orange-50 text-orange-600';
      case 'success': return 'bg-green-50 text-green-600';
      default: return 'bg-blue-50 text-blue-600';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit mx-auto mb-6 overflow-x-auto max-w-full">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('support')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'support' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Support & Tickets
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
              <div className={`p-4 rounded-2xl ${userData.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <Activity size={28} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Service Status</p>
                <p className={`text-xl font-bold capitalize ${userData.status === 'active' ? 'text-green-700' : 'text-red-700'}`}>
                  {userData.status}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                <Zap size={28} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Current Plan</p>
                <p className="text-xl font-bold text-slate-800">{userData.plan}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
                <CreditCard size={28} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Balance</p>
                <p className="text-xl font-bold text-slate-800">${userData.balance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Main Content - Adjusts grid for better filling */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-fit">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Billing Overview</h3>
                {userData.balance > 0 && <span className="text-[10px] uppercase font-bold bg-red-100 text-red-600 px-3 py-1 rounded-full">Payment Due</span>}
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Account No.</span>
                  <span className="font-mono font-medium text-slate-700">{userData.accountNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Due Date</span>
                  <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>{formattedDue}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-800 font-bold text-lg">Total Due</span>
                  <span className="text-blue-700 font-bold text-3xl">${userData.balance.toFixed(2)}</span>
                </div>

                {userData.balance > 0 ? (
                  <button 
                    onClick={() => setShowQR(true)}
                    className="w-full mt-4 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 transition-all"
                  >
                    <Smartphone size={20} />
                    <span>Pay with QR Code</span>
                  </button>
                ) : (
                  <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center text-green-700 space-x-2">
                    <CheckCircle size={20} />
                    <span className="font-medium">No payment due. You are all set!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit">
              <h3 className="font-bold text-slate-800 mb-6">System Notifications</h3>
              
              <div className="space-y-4">
                {userData.status === 'disconnected' && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl">
                    <div className="flex items-start">
                      <AlertCircle className="text-red-500 mt-0.5 mr-3" size={20} />
                      <div>
                        <h4 className="font-bold text-red-700">Service Disconnected</h4>
                        <p className="text-sm text-red-600 mt-1">Your internet service is suspended. Please settle your balance to restore service instantly.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {announcements && announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <div key={ann.id} className="flex items-start p-4 bg-slate-50 rounded-xl">
                      <div className={`p-2.5 rounded-full mr-4 flex-shrink-0 ${getBgColor(ann.type)}`}>
                        {getIcon(ann.type)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-700">{ann.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{ann.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(ann.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center p-4 bg-slate-50 rounded-xl text-slate-400 text-sm">
                    No new announcements.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1 h-fit">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-blue-600"/>
                Create New Ticket
              </h3>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  >
                    <option value="">Select Topic...</option>
                    <option value="No Internet Connection">No Internet Connection</option>
                    <option value="Slow Speed">Slow Speed</option>
                    <option value="Billing Issue">Billing Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
                  <textarea 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                    placeholder="Describe your issue..."
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={ticketLoading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {ticketLoading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 h-fit">
              <h3 className="font-bold text-slate-800 mb-4">My Ticket History</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {tickets && tickets.length > 0 ? (
                  tickets.map(ticket => (
                    <div key={ticket.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800">{ticket.subject}</h4>
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{ticket.message}</p>
                      
                      {ticket.adminReply && (
                         <div className="bg-white border-l-4 border-blue-500 p-3 rounded-r-lg mt-3">
                           <p className="text-xs font-bold text-blue-600 mb-1">Admin Response:</p>
                           <p className="text-sm text-slate-700">{ticket.adminReply}</p>
                         </div>
                      )}
                      <div className="text-right mt-2">
                        <span className="text-[10px] text-slate-400">{new Date(ticket.date).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <FileText size={48} className="mx-auto mb-2 opacity-20" />
                    <p>No tickets submitted yet.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-700 p-5 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center space-x-2">
                <CreditCard size={20} />
                <span>Scan to Pay</span>
              </h3>
              <button onClick={() => setShowQR(false)} className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center text-center">
              <p className="text-slate-600 text-sm mb-6">
                Scan the QR code with your banking app to pay
                <span className="font-bold text-slate-900 block text-2xl mt-2">${userData.balance.toFixed(2)}</span>
              </p>
              
              <div className="bg-white p-4 border-2 border-dashed border-blue-200 rounded-2xl shadow-sm mb-8">
                <img 
                  src="/qr-code.png"
                  alt="Payment QR"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/200x200?text=QR+Image+Missing";
                  }}
                />
              </div>

              <div className="w-full text-left">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reference Number</label>
                <form onSubmit={handlePaymentSubmit} className="flex gap-3">
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ref-123456" 
                    className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 shadow-md shadow-green-200"
                  >
                    {submitting ? '...' : 'Verify'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Admin Dashboard
const AdminDashboard = ({ subscribers, announcements, payments, tickets }) => {
  const [activeTab, setActiveTab] = useState('subscribers'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [adminNewPass, setAdminNewPass] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  
  const [plans, setPlans] = useState([]);
  const [newPlanName, setNewPlanName] = useState('');
  
  const [newUser, setNewUser] = useState({ 
    email: '', 
    password: '', 
    username: '', 
    accountNumber: '', 
    plan: '' 
  });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' });
  const [newDueDate, setNewDueDate] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (fetchedPlans.length === 0) {
        ['Fiber 100Mbps', 'Fiber 300Mbps', 'Fiber 1Gbps', 'DSL Basic'].forEach(async (name) => {
           await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION), { name });
        });
      } else {
        setPlans(fetchedPlans);
        if (!newUser.plan && fetchedPlans.length > 0) {
            setNewUser(prev => ({ ...prev, plan: fetchedPlans[0].name }));
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userId);
      await updateDoc(docRef, { status: newStatus });
    } catch (e) {
      console.error("Error updating status", e);
    }
  };

  const handleAddBill = async (userId, currentBalance) => {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, userId);
      await updateDoc(docRef, { 
        balance: currentBalance + 50,
        status: (currentBalance + 50) > 0 ? 'overdue' : 'active',
        dueDate: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error adding bill", e);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (adminNewPass.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    try {
      const user = auth.currentUser;
      await updatePassword(user, adminNewPass);
      alert("Password updated successfully!");
      setShowPasswordModal(false);
      setAdminNewPass('');
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        alert("For security, please logout and login again before changing your password.");
      } else {
        alert("Failed to update password: " + error.message);
      }
    }
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    setIsCreatingUser(true);
    let secondaryApp = null;
    try {
      secondaryApp = initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password);
      const newUid = userCredential.user.uid;
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, newUid), {
        uid: newUid, 
        username: newUser.username,
        email: newUser.email,
        accountNumber: newUser.accountNumber,
        plan: newUser.plan || (plans[0] ? plans[0].name : 'Basic'),
        balance: 0,
        status: 'active',
        role: 'subscriber',
        dueDate: new Date().toISOString()
      });
      await deleteApp(secondaryApp);
      setShowAddModal(false);
      setNewUser({ email: '', password: '', username: '', accountNumber: '', plan: plans[0]?.name || '' });
      alert(`Subscriber created! Give them these credentials:\nEmail: ${newUser.email}\nPassword: ${newUser.password}`);
    } catch (error) {
      console.error("Error adding subscriber:", error);
      if (secondaryApp) await deleteApp(secondaryApp);
      alert(`Failed: ${error.message}`);
    }
    setIsCreatingUser(false);
  };
  
  const handleAddPlan = async (e) => {
      e.preventDefault();
      if(!newPlanName) return;
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION), { name: newPlanName });
      setNewPlanName('');
  };

  const handleDeletePlan = async (id) => {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION, id));
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if(!newAnnouncement.title || !newAnnouncement.message) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION), {
        ...newAnnouncement,
        date: new Date().toISOString()
      });
      setShowAnnounceModal(false);
      setNewAnnouncement({ title: '', message: '', type: 'info' });
    } catch(e) {
      console.error(e);
      alert("Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (id) => {
     if(confirm("Delete this announcement?")) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION, id));
     }
  };

  const handleUpdateDueDate = async (e) => {
      e.preventDefault();
      if (!showDateModal || !newDueDate) return;
      try {
          const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, showDateModal.id);
          await updateDoc(docRef, { dueDate: new Date(newDueDate).toISOString() });
          setShowDateModal(null);
          setNewDueDate('');
      } catch(e) {
          console.error(e);
          alert("Failed to update date");
      }
  };

  const handleReplyTicket = async (ticketId) => {
    if(!replyText) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION, ticketId);
      await updateDoc(docRef, { 
        adminReply: replyText,
        status: 'resolved'
      });
      setReplyingTo(null);
      setReplyText('');
    } catch(e) {
      console.error(e);
      alert("Failed to send reply");
    }
  };

  const filteredSubscribers = subscribers.filter(sub => 
    sub.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.accountNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Admin Tabs */}
      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit flex space-x-1 overflow-x-auto max-w-full mx-auto md:mx-0">
         {['subscribers', 'payments', 'tickets', 'plans'].map(tab => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-5 py-2.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
            >
               {tab}
            </button>
         ))}
      </div>

      {activeTab === 'subscribers' && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Subscriber Management</h1>
              <p className="text-slate-500 text-sm mt-1">Total Subscribers: {subscribers.length}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
               <button 
                onClick={() => setShowAnnounceModal(true)}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-sm"
              >
                <Megaphone size={18} />
                Alert
              </button>
               <button 
                onClick={() => setShowPasswordModal(true)}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-sm"
              >
                <Lock size={18} />
                Pass
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors shadow-lg shadow-blue-200"
              >
                <Plus size={18} />
                Add Subscriber
              </button>
            </div>
          </div>
          
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search subscribers..."
              className="pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">User Info</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Plan</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Balance</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Due Date</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{sub.username}</div>
                        <div className="text-xs text-slate-500 flex flex-col">
                          <span>#{sub.accountNumber}</span>
                          <span className="text-indigo-500">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{sub.plan}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">
                        ${sub.balance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 group relative">
                        <div className="flex items-center gap-2">
                          {new Date(sub.dueDate).toLocaleDateString()}
                          <button 
                            onClick={() => {
                              setShowDateModal(sub);
                              setNewDueDate(new Date(sub.dueDate).toISOString().split('T')[0]);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-blue-600 hover:bg-blue-100 p-1.5 rounded-md transition-all"
                            title="Change Due Date"
                          >
                              <Calendar size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize
                          ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 
                            sub.status === 'disconnected' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleAddBill(sub.id, sub.balance)}
                          className="text-blue-600 hover:text-blue-900 text-xs font-bold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          + Bill
                        </button>
                        
                        {sub.status === 'active' ? (
                           <button 
                             onClick={() => handleStatusChange(sub.id, 'disconnected')}
                             className="text-red-600 hover:text-red-900 text-xs font-bold border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                           >
                             Cut
                           </button>
                        ) : (
                          <button 
                             onClick={() => handleStatusChange(sub.id, 'active')}
                             className="text-green-600 hover:text-green-900 text-xs font-bold border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                           >
                             Restore
                           </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'payments' && (
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Payment Attempts</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                     <tr>
                       <th className="px-4 py-3 font-bold">User</th>
                       <th className="px-4 py-3 font-bold">Reference #</th>
                       <th className="px-4 py-3 font-bold">Date</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {payments && payments.length > 0 ? payments.map(pay => (
                         <tr key={pay.id}>
                            <td className="px-4 py-3 font-medium">{pay.username || 'Unknown'}</td>
                            <td className="px-4 py-3 font-mono text-blue-600 bg-blue-50 w-fit px-2 rounded">{pay.refNumber}</td>
                            <td className="px-4 py-3 text-slate-500">{new Date(pay.date).toLocaleString()}</td>
                         </tr>
                      )) : (
                         <tr><td colSpan={3} className="p-4 text-center text-slate-400">No payment records found.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
         </div>
      )}

      {activeTab === 'tickets' && (
         <div className="space-y-4">
             <h2 className="text-xl font-bold text-slate-800">Support Tickets</h2>
             <div className="grid grid-cols-1 gap-4">
             {tickets && tickets.length > 0 ? tickets.map(ticket => (
               <div key={ticket.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-3">
                     <div>
                        <h4 className="font-bold text-lg text-slate-800">{ticket.subject}</h4>
                        <p className="text-xs text-slate-500">From: <span className="font-bold text-blue-600">{ticket.username}</span> • {new Date(ticket.date).toLocaleString()}</p>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {ticket.status}
                     </span>
                  </div>
                  <p className="bg-slate-50 p-3 rounded-lg text-slate-700 text-sm mb-4">{ticket.message}</p>
                  
                  {ticket.adminReply ? (
                     <div className="border-t border-slate-100 pt-3">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Your Reply</p>
                        <p className="text-sm text-blue-700 font-medium">{ticket.adminReply}</p>
                     </div>
                  ) : (
                     <div className="flex gap-2 mt-2">
                        {replyingTo === ticket.id ? (
                           <div className="w-full">
                              <textarea 
                                 className="w-full border border-slate-300 rounded-lg p-2 text-sm mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                 placeholder="Write a response..."
                                 rows="3"
                                 value={replyText}
                                 onChange={(e) => setReplyText(e.target.value)}
                              ></textarea>
                              <div className="flex gap-2 justify-end">
                                 <button onClick={() => setReplyingTo(null)} className="text-slate-500 text-sm font-bold px-3 py-1">Cancel</button>
                                 <button onClick={() => handleReplyTicket(ticket.id)} className="bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-lg hover:bg-blue-700">Send Reply</button>
                              </div>
                           </div>
                        ) : (
                           <button onClick={() => { setReplyingTo(ticket.id); setReplyText(''); }} className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors">
                              <MessageSquare size={16} /> Reply
                           </button>
                        )}
                     </div>
                  )}
               </div>
             )) : (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400">No tickets found.</div>
             )}
             </div>
         </div>
      )}

      {activeTab === 'plans' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Manage Plans</h2>
                <form onSubmit={handleAddPlan} className="flex gap-2">
                    <input 
                        type="text"
                        required
                        placeholder="New Plan Name"
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold text-sm">Add</button>
                </form>
             </div>
             <div className="space-y-2">
                {plans.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-700">{p.name}</span>
                        <button onClick={() => handleDeletePlan(p.id)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
             </div>
          </div>
      )}

      {/* Modals (Add Subscriber, Date, Password, Announcement) remain same as previous version but simplified here to save space in response. They are included in the full block above. */}
      {/* ... (Modals included in main return) ... */}
      {/* Re-inserting modals for completeness in this response block */}
      
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-700 p-5 flex justify-between items-center">
              <h3 className="text-white font-bold">Add New Subscriber</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddSubscriber} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label><input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} placeholder="John Doe" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account No.</label><input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={newUser.accountNumber} onChange={(e) => setNewUser({...newUser, accountNumber: e.target.value})} placeholder="1005" /></div>
              </div>
              <div className="border-t border-slate-100 pt-2"></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label><input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label><input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plan</label><select className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white" value={newUser.plan} onChange={(e) => setNewUser({...newUser, plan: e.target.value})}>{plans.map(p => (<option key={p.id} value={p.name}>{p.name}</option>))}</select></div>
              <button type="submit" disabled={isCreatingUser} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">{isCreatingUser ? 'Creating...' : 'Create Account'}</button>
            </form>
          </div>
        </div>
      )}

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

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-700 p-5 flex justify-between items-center"><h3 className="text-white font-bold">Change Admin Password</h3><button onClick={() => setShowPasswordModal(false)} className="text-white/80 hover:text-white"><X size={24} /></button></div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label><input type="password" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={adminNewPass} onChange={(e) => setAdminNewPass(e.target.value)} /></div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Update Password</button>
            </form>
          </div>
        </div>
      )}

      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="bg-slate-800 p-5 flex justify-between items-center"><h3 className="text-white font-bold">Post Announcement</h3><button onClick={() => setShowAnnounceModal(false)} className="text-white/80 hover:text-white"><X size={24} /></button></div>
            <div className="p-6">
               <form onSubmit={handlePostAnnouncement} className="space-y-4 mb-6">
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label><input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})} placeholder="e.g. Network Maintenance" /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label><textarea required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" rows="3" value={newAnnouncement.message} onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}></textarea></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label><select className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white" value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}><option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option></select></div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700">Post</button>
               </form>
               <div className="border-t border-slate-100 pt-4"><h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Recent</h4><div className="space-y-2 max-h-40 overflow-y-auto">{announcements && announcements.length > 0 ? announcements.map(ann => (<div key={ann.id} className="flex justify-between items-start p-2 bg-slate-50 rounded border border-slate-100 text-sm"><div><p className="font-bold text-slate-700">{ann.title}</p></div><button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button></div>)) : <p className="text-xs text-slate-400 text-center">No active announcements.</p>}</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Main App Logic
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [mySubscriberData, setMySubscriberData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const isAdmin = currentUser.email === ADMIN_EMAIL;
        if (isAdmin) {
           setUser({ ...currentUser, role: 'admin' });
        } else {
           const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, currentUser.uid);
           const docSnap = await getDoc(docRef);
           if (docSnap.exists()) {
             setMySubscriberData({ id: docSnap.id, ...docSnap.data() });
             setUser({ ...currentUser, role: 'subscriber' });
           } else {
             setUser({ ...currentUser, role: 'subscriber' });
           }
        }
      } else {
        setUser(null);
        setMySubscriberData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- DATA SUBSCRIPTIONS ---

  // 1. Subscribers (Admin Only)
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubscribers(users);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Payments (Admin Only)
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(data);
    });
    return () => unsubscribe();
  }, [user]);

  // 3. Tickets (Admin sees all, User sees theirs)
  useEffect(() => {
    if (!user) return;
    let q;
    if (user.role === 'admin') {
      q = query(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), orderBy('date', 'desc'));
    } else {
      q = query(collection(db, 'artifacts', appId, 'public', 'data', TICKETS_COLLECTION), where('userId', '==', user.uid)); // Filter by user ID
      // Note: Compound queries (where + orderBy) require an index. 
      // For now, we sort in client-side if index fails, or just fetch by userId.
      // To keep it simple without index error:
      // We'll just fetch by userId and sort in Javascript if needed.
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Client side sort to avoid index requirement error for compound queries immediately
      data.sort((a,b) => new Date(b.date) - new Date(a.date));
      setTickets(data);
    });
    return () => unsubscribe();
  }, [user]);

  // 4. My Subscriber Data (User Only)
  useEffect(() => {
     if (!user || user.role !== 'subscriber') return;
     const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, user.uid);
     const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
           setMySubscriberData({ id: docSnap.id, ...docSnap.data() });
        }
     });
     return () => unsubscribe();
  }, [user]);

  // 5. Announcements (Everyone)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', ANNOUNCEMENTS_COLLECTION), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
       const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       setAnnouncements(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handlePayment = async (id, refNumber, username) => {
    if (!refNumber) return;
    try {
      // 1. Create Payment Record
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', PAYMENTS_COLLECTION), {
         userId: id,
         username: username || 'Subscriber',
         refNumber: refNumber,
         date: new Date().toISOString(),
         status: 'submitted'
      });

      // 2. Update User Balance (Auto-process for demo)
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, id);
      await updateDoc(docRef, {
        balance: 0,
        status: 'active', 
        lastPaymentRef: refNumber,
        lastPaymentDate: new Date().toISOString()
      });
      alert(`Payment successful! Ref: ${refNumber}`);
    } catch (e) {
      console.error(e);
      alert("Payment failed. Please try again.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600">Loading SwiftNet...</div>;

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {user.role === 'admin' ? (
        <AdminDashboard 
           subscribers={subscribers} 
           announcements={announcements} 
           payments={payments}
           tickets={tickets}
        />
      ) : (
        <SubscriberDashboard 
          userData={mySubscriberData} 
          onPay={handlePayment} 
          announcements={announcements}
          tickets={tickets}
        />
      )}
    </Layout>
  );
}