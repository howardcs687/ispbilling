import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
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
  Users,
  Search,
  Menu,
  X,
  Plus,
  Calendar,
  Settings,
  Trash2
} from 'lucide-react';

// --- Firebase Configuration ---
// I have pasted your specific keys below. 
// The check for '__firebase_config' ensures it still works in this preview window,
// but uses YOUR keys when deployed to Vercel.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyDMPhjrmo-TnAoVoIBedOimkaUswrLZNp8",
  authDomain: "swiftnet-isp.firebaseapp.com",
  projectId: "swiftnet-isp",
  storageBucket: "swiftnet-isp.firebasestorage.app",
  messagingSenderId: "811380345374",
  appId: "1:811380345374:web:cf70cc43c6037280867c0f",
  measurementId: "G-7S6DBEDDMP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Analytics (conditionally, to prevent errors in some environments)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

const auth = getAuth(app);
const db = getFirestore(app);

// This ID is used to separate data in the database. 
// In production (Vercel), it defaults to 'swiftnet-production'.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'swiftnet-production';

// --- Constants ---
const COLLECTION_NAME = 'isp_users_v1'; 
const PLANS_COLLECTION = 'isp_plans_v1';
const ADMIN_PIN = '1234'; 

// --- Components ---

// 1. Shared Layout
const Layout = ({ children, user, onLogout, title }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Wifi className="h-8 w-8 text-blue-300" />
              <span className="font-bold text-xl tracking-tight">SwiftNet ISP</span>
            </div>
            
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-800 rounded-full text-sm">
                  {user.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                  <span>{user.username}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 hover:bg-blue-600 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}

            {user && (
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-white">
                  {isMenuOpen ? <X /> : <Menu />}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && user && (
          <div className="md:hidden bg-blue-800 px-4 py-4 space-y-2">
            <div className="text-sm text-blue-200 mb-2">Logged in as {user.username}</div>
            <button 
              onClick={onLogout}
              className="flex items-center space-x-2 w-full px-4 py-2 bg-blue-900 rounded hover:bg-blue-700"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

// 2. Login Component
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [mode, setMode] = useState('subscriber'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'admin') {
        if (password === ADMIN_PIN) {
           onLogin({ id: 'admin_01', username: 'Administrator', role: 'admin' });
        } else {
          setError('Invalid Admin PIN');
        }
      } else {
        const usersRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME);
        const q = query(usersRef, where('username', '==', username), where('accountNumber', '==', password));
        onLogin({ username, accountNumber: password, role: 'subscriber' }, true); 
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-blue-700 p-6 text-center">
          <Wifi className="h-12 w-12 text-white mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-white">Welcome to SwiftNet</h2>
          <p className="text-blue-200 text-sm">Manage your connection instantly</p>
        </div>

        <div className="p-8">
          <div className="flex justify-center mb-6 bg-slate-100 p-1 rounded-lg">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'subscriber' ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}
              onClick={() => setMode('subscriber')}
            >
              Subscriber
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'admin' ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}
              onClick={() => setMode('admin')}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {mode === 'admin' ? 'Admin Username' : 'Username'}
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'admin' ? 'admin' : 'john_doe'}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {mode === 'admin' ? 'Admin PIN' : 'Account Number'}
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'admin' ? '1234' : '1001'}
              />
            </div>

            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>
          
          {mode === 'subscriber' && (
             <p className="text-center text-xs text-slate-400 mt-4">
               Demo User: <strong>john_doe</strong> | Account: <strong>1001</strong>
             </p>
          )}
           {mode === 'admin' && (
             <p className="text-center text-xs text-slate-400 mt-4">
               Pin: <strong>1234</strong>
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Subscriber Dashboard
const SubscriberDashboard = ({ userData, onPay }) => {
  const [showQR, setShowQR] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!userData) return <div className="p-8 text-center">Loading account details...</div>;

  const isOverdue = userData.status === 'overdue' || userData.status === 'disconnected';
  const formattedDue = new Date(userData.dueDate).toLocaleDateString();

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onPay(userData.id, refNumber);
    setSubmitting(false);
    setShowQR(false);
    setRefNumber('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className={`p-3 rounded-full ${userData.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Service Status</p>
            <p className={`text-lg font-bold capitalize ${userData.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
              {userData.status}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <Wifi size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Current Plan</p>
            <p className="text-lg font-bold text-slate-800">{userData.plan}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Balance</p>
            <p className="text-lg font-bold text-slate-800">${userData.balance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Billing Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Billing Overview</h3>
            {userData.balance > 0 && <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded">Action Required</span>}
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Account No.</span>
              <span className="font-medium">{userData.accountNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Billing Cycle</span>
              <span className="font-medium">Monthly</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Due Date</span>
              <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>{formattedDue}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-800 font-bold text-lg">Total Due</span>
              <span className="text-blue-700 font-bold text-2xl">${userData.balance.toFixed(2)}</span>
            </div>

            {userData.balance > 0 ? (
              <button 
                onClick={() => setShowQR(true)}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center space-x-2 shadow-lg shadow-blue-200"
              >
                <Smartphone size={20} />
                <span>Pay with QR Code</span>
              </button>
            ) : (
              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center text-green-700 space-x-2">
                <CheckCircle size={20} />
                <span className="font-medium">No payment due. You are all set!</span>
              </div>
            )}
          </div>
        </div>

        {/* Support / Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">System Notifications</h3>
          {userData.status === 'disconnected' ? (
             <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
               <div className="flex items-start">
                 <AlertCircle className="text-red-500 mt-0.5 mr-3" size={20} />
                 <div>
                   <h4 className="font-bold text-red-700">Service Disconnected</h4>
                   <p className="text-sm text-red-600 mt-1">Your internet service has been temporarily suspended due to overdue payment. Please settle your balance to restore service instantly.</p>
                 </div>
               </div>
             </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600"><Wifi size={16} /></div>
                <div>
                  <p className="font-medium text-sm">Network Maintenance</p>
                  <p className="text-xs text-slate-500">Scheduled for Nov 25, 2am - 4am.</p>
                </div>
              </div>
              <div className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <div className="bg-green-100 p-2 rounded-full mr-3 text-green-600"><CheckCircle size={16} /></div>
                <div>
                  <p className="font-medium text-sm">Payment Received</p>
                  <p className="text-xs text-slate-500">Last payment processed on {new Date().toLocaleDateString()}.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-700 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center space-x-2">
                <CreditCard size={20} />
                <span>Scan to Pay</span>
              </h3>
              <button onClick={() => setShowQR(false)} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center text-center">
              <p className="text-slate-600 text-sm mb-4">
                Open your banking app and scan the QR code below to pay 
                <span className="font-bold text-slate-900 block text-xl mt-1">${userData.balance.toFixed(2)}</span>
              </p>
              
              {/* Generated QR Code using API */}
              <div className="bg-white p-4 border-2 border-blue-100 rounded-xl shadow-inner mb-6">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY:${userData.accountNumber}:${userData.balance.toFixed(2)}:SWIFTNET`}
                  alt="Payment QR"
                  className="w-48 h-48 object-contain"
                />
              </div>

              <div className="w-full text-left">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Verification</label>
                <p className="text-xs text-slate-400 mb-2">Enter the reference number from your banking app receipt.</p>
                <form onSubmit={handlePaymentSubmit} className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ref-098123" 
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? '...' : 'Confirm'}
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
const AdminDashboard = ({ subscribers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(null); // Holds user ID or null
  
  const [plans, setPlans] = useState([]);
  const [newPlanName, setNewPlanName] = useState('');
  
  const [newUser, setNewUser] = useState({ username: '', accountNumber: '', plan: '' });
  const [newDueDate, setNewDueDate] = useState('');

  // Fetch Plans
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', PLANS_COLLECTION));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (fetchedPlans.length === 0) {
        // Seed default plans
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

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), {
        username: newUser.username,
        accountNumber: newUser.accountNumber,
        plan: newUser.plan || (plans[0] ? plans[0].name : 'Basic'),
        balance: 0,
        status: 'active',
        role: 'subscriber',
        dueDate: new Date().toISOString()
      });
      setShowAddModal(false);
      setNewUser({ username: '', accountNumber: '', plan: plans[0]?.name || '' });
      alert("Subscriber added successfully!");
    } catch (error) {
      console.error("Error adding subscriber:", error);
      alert("Failed to add subscriber.");
    }
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

  const filteredSubscribers = subscribers.filter(sub => 
    sub.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.accountNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Subscriber Management</h1>
          <p className="text-slate-500 text-sm">Total Subscribers: {subscribers.length}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setShowPlanModal(true)}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Settings size={18} />
            Manage Plans
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Plus size={18} />
            Add Subscriber
          </button>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Account</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Balance</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No subscribers found.</td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{sub.username}</div>
                      <div className="text-xs text-slate-500">#{sub.accountNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{sub.plan}</td>
                    <td className="px-6 py-4 font-mono font-medium">
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
                          className="opacity-0 group-hover:opacity-100 text-blue-600 hover:bg-blue-50 p-1 rounded transition-opacity"
                          title="Change Due Date"
                        >
                            <Calendar size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 
                          sub.status === 'disconnected' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleAddBill(sub.id, sub.balance)}
                        className="text-blue-600 hover:text-blue-900 text-xs font-medium border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                      >
                        + Bill
                      </button>
                      
                      {sub.status === 'active' ? (
                         <button 
                           onClick={() => handleStatusChange(sub.id, 'disconnected')}
                           className="text-red-600 hover:text-red-900 text-xs font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                         >
                           Disconnect
                         </button>
                      ) : (
                        <button 
                           onClick={() => handleStatusChange(sub.id, 'active')}
                           className="text-green-600 hover:text-green-900 text-xs font-medium border border-green-200 px-2 py-1 rounded hover:bg-green-50"
                         >
                           Restore
                         </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subscriber Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-700 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold">Add New Subscriber</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubscriber} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name / Username</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="e.g. Alice Walker"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.accountNumber}
                  onChange={(e) => setNewUser({...newUser, accountNumber: e.target.value})}
                  placeholder="e.g. 2001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Plan</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={newUser.plan}
                  onChange={(e) => setNewUser({...newUser, plan: e.target.value})}
                >
                   {plans.map(p => (
                       <option key={p.id} value={p.name}>{p.name}</option>
                   ))}
                </select>
              </div>
              
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Manage Plans Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-800 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2"><Settings size={18}/> Manage Plans</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
                <form onSubmit={handleAddPlan} className="flex gap-2 mb-4">
                    <input 
                        type="text"
                        required
                        placeholder="New Plan Name (e.g. 5G Home)"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 font-medium">Add</button>
                </form>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {plans.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                            <span className="font-medium text-slate-700">{p.name}</span>
                            <button onClick={() => handleDeletePlan(p.id)} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {plans.length === 0 && <p className="text-center text-slate-400 text-sm">No plans found.</p>}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Date Modal */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-700 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold">Change Due Date</h3>
              <button onClick={() => setShowDateModal(null)} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateDueDate} className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                  Changing due date for <span className="font-bold">{showDateModal.username}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Due Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Date
              </button>
            </form>
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

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Seed Data (Runs if no users found)
  useEffect(() => {
    if (!user) return;
    
    const seedData = async () => {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME));
    };
    seedData();
  }, [user]);

  // Data Sync
  useEffect(() => {
    if (!user) return;

    const colRef = collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME);
    
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (users.length === 0) {
        // Seed Database if empty
        const seed = async () => {
          await addDoc(colRef, {
            username: 'john_doe',
            accountNumber: '1001',
            plan: 'Fiber 100Mbps',
            balance: 49.99,
            dueDate: new Date().toISOString(),
            status: 'overdue',
            role: 'subscriber'
          });
          await addDoc(colRef, {
            username: 'jane_smith',
            accountNumber: '1002',
            plan: 'Fiber 300Mbps',
            balance: 0,
            dueDate: new Date().toISOString(),
            status: 'active',
            role: 'subscriber'
          });
           await addDoc(colRef, {
            username: 'bob_wilson',
            accountNumber: '1003',
            plan: 'DSL Basic',
            balance: 25.00,
            dueDate: new Date().toISOString(),
            status: 'disconnected',
            role: 'subscriber'
          });
        }
        seed();
      }

      setSubscribers(users);

      // If logged in as subscriber, keep my data updated
      if (user.role === 'subscriber') {
        const me = users.find(u => u.accountNumber === user.accountNumber);
        if (me) setMySubscriberData(me);
      }
    }, (err) => console.error("Stream error", err));

    return () => unsubscribe();
  }, [user]);

  const handleLogin = (userData, isSubscriberFetchNeeded) => {
    setUser(userData);
    if(isSubscriberFetchNeeded) {
        // Logic handled by the snapshot listener above once 'user' is set
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMySubscriberData(null);
  };

  const handlePayment = async (id, refNumber) => {
    // Verify payment (simulated)
    if (!refNumber) return;
    
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, id);
      await updateDoc(docRef, {
        balance: 0,
        status: 'active', // Auto restore service on payment
        lastPaymentRef: refNumber,
        lastPaymentDate: new Date().toISOString()
      });
      alert(`Payment successful! Ref: ${refNumber}`);
    } catch (e) {
      alert("Payment failed. Please try again.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600">Connecting to SwiftNet...</div>;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {user.role === 'admin' ? (
        <AdminDashboard subscribers={subscribers} />
      ) : (
        <SubscriberDashboard 
          userData={mySubscriberData} 
          onPay={handlePayment} 
        />
      )}
    </Layout>
  );
}