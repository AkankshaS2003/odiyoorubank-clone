import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  FileText,
  MapPin,
  Megaphone,
  Download,
  Database,
  MessageSquare,
  UserCheck,
  Contact,
  History,
  Sliders,
  Bell,
  LogOut,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Trash2,
  UserX,
  Check,
  Search,
  Eye,
  FileCode,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface DocumentGroup {
  _id: string; // filename
  title: string;
  category: string;
  chunkCount: number;
  createdAt: string;
  sampleContent: string;
}

export const AdminPanel: React.FC<{ setCurrentTab: (tab: string) => void }> = ({ setCurrentTab }) => {
  const { user: currentUser, logout, systemSettings, updateSystemSettings } = useAuth();
  
  // Tab State: matching all 14 specified modules
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'customers' | 'loans' | 'deposit_products' | 'cms' | 'branches' | 'announcements' | 'downloads' | 'rag' | 'chatbot' | 'users' | 'employees' | 'audit' | 'settings'
  >('dashboard');

  // RAG Indexer States (Preserved and integrated)
  const [documents, setDocuments] = useState<DocumentGroup[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [selectedDoc, setSelectedDoc] = useState<DocumentGroup | null>(null);
  const [docChunks, setDocChunks] = useState<any[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // General Dashboard Stats
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalEmployees: 0,
    totalLoans: 0,
    approvedLoans: 0,
    pendingLoans: 0,
    rejectedLoans: 0,
    totalAccounts: 0,
    totalDeposits: 0
  });

  // Dynamic Data Lists
  const [loans, setLoans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading & Feedback States
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form States (CMS / Settings / Employee Creation)
  const [cmsState, setCmsState] = useState({
    fdRate: 8.50,
    goldLoanRate: 8.50,
    savingsRate: 4.50,
    rdRate: 7.75,
    marqueeText: '',
    heroTitle: '',
    heroDesc: '',
    aboutText: '',
    contactPhone: '',
    contactEmail: ''
  });

  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'employee'
  });

  // Load stats and settings on mount
  useEffect(() => {
    fetchStats();
    fetchLoans();
    fetchUsers();
    fetchMessages();
    fetchDocuments();
    loadCmsState();
    loadAuditLogs();
  }, []);

  useEffect(() => {
    if (systemSettings) {
      loadCmsState();
    }
  }, [systemSettings]);

  const loadCmsState = () => {
    if (systemSettings) {
      setCmsState({
        fdRate: systemSettings.fdRate || 8.50,
        goldLoanRate: systemSettings.goldLoanRate || 8.50,
        savingsRate: systemSettings.savingsRate || 4.50,
        rdRate: systemSettings.rdRate || 7.75,
        marqueeText: systemSettings.marqueeText || '',
        heroTitle: systemSettings.heroTitle || '',
        heroDesc: systemSettings.heroDesc || '',
        aboutText: systemSettings.aboutText || '',
        contactPhone: systemSettings.contactPhone || '',
        contactEmail: systemSettings.contactEmail || ''
      });
    }
  };

  const addAuditLog = (action: string) => {
    const newLog = {
      id: `LOG-${Date.now()}`,
      user: currentUser?.email || 'Admin',
      action,
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    localStorage.setItem('bank_audit_logs', JSON.stringify(updatedLogs));
  };

  const loadAuditLogs = () => {
    const logs = localStorage.getItem('bank_audit_logs');
    if (logs) {
      setAuditLogs(JSON.parse(logs));
    } else {
      const initialLogs = [
        { id: 'LOG-1', user: 'admin@odiyoorubank.in', action: 'System Initialized', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: 'LOG-2', user: 'admin@odiyoorubank.in', action: 'Seeded default database policies', timestamp: new Date(Date.now() - 3600000).toISOString() }
      ];
      setAuditLogs(initialLogs);
      localStorage.setItem('bank_audit_logs', JSON.stringify(initialLogs));
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await api.get('/admin/loans');
      if (res.data.success) {
        setLoans(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch loans', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get('/admin/messages');
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch contact inquiries', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/admin/documents');
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch indexed docs', err);
    }
  };

  // Update Loan Status
  const handleLoanStatusChange = async (loanId: string, status: 'Approved' | 'Rejected') => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.put(`/admin/loan/${loanId}`, { status });
      if (res.data.success) {
        setSuccess(`Loan status updated to ${status}`);
        addAuditLog(`Updated loan application status to ${status} for Loan ID ${loanId}`);
        fetchLoans();
        fetchStats();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update loan status');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Customer Status (Block/Unblock)
  const handleUserStatusChange = async (userId: string, currentStatus: string) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    const newStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    try {
      const res = await api.put(`/admin/user/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        setSuccess(`User status updated to ${newStatus}`);
        addAuditLog(`Set status of user ${userId} to ${newStatus}`);
        fetchUsers();
        fetchStats();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  // Update User Role
  const handleUserRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.put(`/admin/user/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setSuccess(`User role updated to ${newRole}`);
        addAuditLog(`Updated role of user ${userId} to ${newRole}`);
        fetchUsers();
        fetchStats();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete User
  const handleUserDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.delete(`/admin/user/${userId}`);
      if (res.data.success) {
        setSuccess('User account successfully deleted');
        addAuditLog(`Deleted user account: ${userId}`);
        fetchUsers();
        fetchStats();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Employee
  const handleCreateEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post('/admin/users', newEmployee);
      if (res.data.success) {
        setSuccess(`Employee "${newEmployee.fullName}" successfully registered!`);
        addAuditLog(`Created employee account: ${newEmployee.email} with role: ${newEmployee.role}`);
        setNewEmployee({ fullName: '', email: '', phone: '', password: '', role: 'employee' });
        fetchUsers();
        fetchStats();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Website CMS Config
  const handleCmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    
    // Convert rate values to numbers before storing
    const payload = {
      ...cmsState,
      fdRate: Number(cmsState.fdRate),
      goldLoanRate: Number(cmsState.goldLoanRate),
      savingsRate: Number(cmsState.savingsRate),
      rdRate: Number(cmsState.rdRate)
    };

    const isSuccess = await updateSystemSettings(payload);
    if (isSuccess) {
      setSuccess('Website CMS Settings updated successfully! All changes are visible on the website.');
      addAuditLog('Updated global system settings and interest rates.');
    } else {
      setError('Failed to update system settings.');
    }
    setActionLoading(false);
  };

  // RAG Document Handlers (Indexed vectors)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf' || ext === 'docx' || ext === 'txt') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Unsupported file type. Please upload PDF, DOCX or TXT files.');
        setFile(null);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document to upload.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('category', category);

    try {
      const res = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setSuccess(`Document "${title || file.name}" successfully indexed into ${res.data.data.chunksIndexed} vectors!`);
        addAuditLog(`Indexed knowledge document: ${file.name}`);
        setFile(null);
        setTitle('');
        setCategory('General');
        fetchDocuments();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload and index document.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewChunks = async (doc: DocumentGroup) => {
    setSelectedDoc(doc);
    setLoadingChunks(true);
    setDocChunks([]);
    
    try {
      const res = await api.get('/admin/documents?detail=true');
      if (res.data.success) {
        const filtered = res.data.data.filter((chunk: any) => chunk.source === doc._id);
        setDocChunks(filtered);
      }
    } catch (err: any) {
      console.error('Failed to load document chunks', err);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleDocumentDelete = async (filename: string) => {
    if (!window.confirm(`Are you sure you want to delete all vector chunks associated with "${filename}"?`)) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.delete(`/admin/document/${encodeURIComponent(filename)}`);
      if (res.data.success) {
        setSuccess(`Successfully deleted document: ${filename}`);
        addAuditLog(`Deleted document from RAG index: ${filename}`);
        fetchDocuments();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete document.');
    } finally {
      setActionLoading(false);
    }
  };

  // Recharts Chart Data
  const registrationData = [
    { name: 'Jan', members: 12 },
    { name: 'Feb', members: 19 },
    { name: 'Mar', members: 32 },
    { name: 'Apr', members: 48 },
    { name: 'May', members: 65 },
    { name: 'Jun', members: stats.totalCustomers || 85 }
  ];

  const loanAnalyticsData = [
    { name: 'Personal', count: loans.filter(l => l.loanType === 'Personal Loan').length || 3 },
    { name: 'Home', count: loans.filter(l => l.loanType === 'Home Loan').length || 5 },
    { name: 'Education', count: loans.filter(l => l.loanType === 'Education Loan').length || 2 },
    { name: 'Gold', count: loans.filter(l => l.loanType === 'Gold Loan').length || 8 },
    { name: 'Vehicle', count: loans.filter(l => l.loanType === 'Vehicle Loan').length || 4 }
  ];

  const depositGrowthData = [
    { name: 'Savings', value: Math.round(stats.totalDeposits * 0.4) || 20000 },
    { name: 'Fixed Deposits', value: Math.round(stats.totalDeposits * 0.6) || 30000 }
  ];

  const COLORS = ['#0A315C', '#ED7F1E'];

  // Sidebar list matching all 14 requested items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'loans', label: 'Loan Applications', icon: Briefcase },
    { id: 'deposit_products', label: 'Deposit Products', icon: TrendingUp },
    { id: 'cms', label: 'Website Content', icon: FileText },
    { id: 'branches', label: 'Branch Management', icon: MapPin },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'downloads', label: 'Forms & Downloads', icon: Download },
    { id: 'rag', label: 'RAG Knowledge Base', icon: Database },
    { id: 'chatbot', label: 'Chatbot Analytics', icon: MessageSquare },
    { id: 'users', label: 'User Management', icon: UserCheck },
    { id: 'employees', label: 'Employee Management', icon: Contact },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: Sliders }
  ] as const;

  // Filtered customer list
  const customerUsers = users.filter(u => u.role === 'customer');
  const staffUsers = users.filter(u => u.role !== 'customer');

  const filteredCustomers = customerUsers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  // Check RBAC Permissions
  const isSuperAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isEmployee = currentUser?.role === 'employee';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-64 bg-[#0A315C] text-white flex flex-col shrink-0 border-r border-[#ED7F1E]/20 select-none">
        
        {/* Profile Card Summary */}
        <div className="p-6 border-b border-white/10 bg-[#051C36]">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-[#ED7F1E] flex items-center justify-center font-black text-white text-sm uppercase">
              {currentUser?.fullName?.substring(0, 2) || 'AD'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold leading-none">{currentUser?.fullName || 'Administrator'}</p>
              <p className="text-[10px] text-white/60 truncate mt-1">{currentUser?.email || 'admin@odiyoorubank.in'}</p>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#ED7F1E] text-white tracking-widest">
                {currentUser?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Items */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setError(null);
                  setSuccess(null);
                }}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-xs font-bold transition-all text-left uppercase tracking-wider ${
                  isActive 
                    ? 'bg-[#ED7F1E] text-white border-l-4 border-white' 
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Log out */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              logout();
              setCurrentTab('home');
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-red-650 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Panel</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-grow p-6 lg:p-8 overflow-x-hidden">
        
        {/* Dynamic Alerts Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start space-x-3 text-xs animate-slide-down shadow-sm">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start space-x-3 text-xs animate-slide-down shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* LOADING INDICATOR OVERLAY */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-[#0A315C] animate-spin mb-2" />
            <span className="text-xs text-slate-400 font-medium">Syncing bank data...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* ========================================== */}
            {/* TAB 1: DASHBOARD LANDING PANELS */}
            {/* ========================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-[#0A315C] rounded-2xl">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Customers</span>
                      <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">{stats.totalCustomers}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-orange-50 text-[#ED7F1E] rounded-2xl">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Loans</span>
                      <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">{stats.totalLoans}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Deposits</span>
                      <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">₹{(stats.totalDeposits || 50000).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                      <History className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Approved Loans</span>
                      <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">{stats.approvedLoans}</span>
                    </div>
                  </div>

                </div>

                {/* Recharts Graphical Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Chart 1: Customer registrations */}
                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-6">Customer Registrations Growth</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={registrationData}>
                          <defs>
                            <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0A315C" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#0A315C" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontStyle="bold" />
                          <YAxis stroke="#94A3B8" fontSize={10} fontStyle="bold" />
                          <Tooltip />
                          <Area type="monotone" dataKey="members" stroke="#0A315C" strokeWidth={2} fillOpacity={1} fill="url(#colorMembers)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Loans Count by Type */}
                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-6">Active Credit distribution</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={loanAnalyticsData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontStyle="bold" />
                          <YAxis stroke="#94A3B8" fontSize={10} fontStyle="bold" />
                          <Tooltip />
                          <Bar dataKey="count" fill="#ED7F1E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Deposit Split Chart */}
                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm lg:col-span-1">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-6">Deposits Portfolio</h3>
                    <div className="h-56 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={depositGrowthData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {depositGrowthData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Contact Inquiry Summary Logs */}
                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm lg:col-span-2">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex justify-between items-center">
                      <span>Recent Contact Inquiries</span>
                      <span className="text-[10px] text-white bg-[#0A315C] px-2.5 py-0.5 rounded-full font-black uppercase">
                        {messages.length} total
                      </span>
                    </h3>
                    
                    {messages.length === 0 ? (
                      <div className="text-center py-10 text-xs text-slate-400 font-semibold italic">
                        No recent visitor messages received.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                        {messages.slice(0, 5).map((msg) => (
                          <div key={msg._id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex justify-between items-start gap-4">
                            <div>
                              <p className="font-bold text-slate-800">{msg.name} ({msg.email})</p>
                              <p className="text-slate-500 mt-1 italic">"{msg.message}"</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono tracking-tighter block shrink-0">{new Date(msg.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 2: CUSTOMERS MANAGEMENT */}
            {/* ========================================== */}
            {activeTab === 'customers' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase">Customers Account Directory</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">Suspend or activate member log-ins.</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-semibold"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">No customer accounts matching query.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          <th className="pb-3 pl-2">Member Name</th>
                          <th className="pb-3">Email Address</th>
                          <th className="pb-3">Mobile Contact</th>
                          <th className="pb-3">Account Status</th>
                          <th className="pb-3 text-right pr-2">Security Controls</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-700 font-semibold divide-y divide-slate-100/50">
                        {filteredCustomers.map((customer) => (
                          <tr key={customer._id} className="hover:bg-slate-50/50">
                            <td className="py-4 pl-2 font-bold text-slate-900">{customer.fullName}</td>
                            <td className="py-4">{customer.email}</td>
                            <td className="py-4 font-mono text-slate-500">{customer.phone}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                customer.status === 'Suspended' 
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' 
                                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                                {customer.status || 'Active'}
                              </span>
                            </td>
                            <td className="py-4 text-right pr-2 space-x-2 shrink-0">
                              <button
                                onClick={() => handleUserStatusChange(customer._id, customer.status)}
                                disabled={actionLoading}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer ${
                                  customer.status === 'Suspended'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                }`}
                              >
                                {customer.status === 'Suspended' ? 'Unblock Member' : 'Suspend Member'}
                              </button>

                              <button
                                onClick={() => handleUserDelete(customer._id)}
                                disabled={actionLoading || !isSuperAdmin}
                                className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-655 border border-slate-150 rounded-lg hover:border-red-200 transition-colors disabled:opacity-50 inline-flex items-center cursor-pointer"
                                title={isSuperAdmin ? 'Delete Account' : 'Requires Super Admin privileges'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 3: LOAN APPLICATIONS PANEL */}
            {/* ========================================== */}
            {activeTab === 'loans' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <div className="pb-6 border-b border-slate-100 mb-6">
                  <h2 className="text-lg font-black text-slate-900 uppercase">Cooperative Credit Sanctions</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Review applicant monthly income files and approve or reject loan requests.</p>
                </div>

                {loans.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">No cooperative loan requests lodged.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          <th className="pb-3 pl-2">Applicant</th>
                          <th className="pb-3">Type</th>
                          <th className="pb-3 text-right">Sum Requested</th>
                          <th className="pb-3 text-center">Tenure</th>
                          <th className="pb-3 text-right">Declared Salary</th>
                          <th className="pb-3 text-center">Status</th>
                          <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-700 font-semibold divide-y divide-slate-100/50">
                        {loans.map((loan) => (
                          <tr key={loan._id} className="hover:bg-slate-50/50">
                            <td className="py-4 pl-2">
                              <p className="font-bold text-slate-900">{loan.userId?.fullName || 'Member'}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{loan.userId?.email || 'N/A'}</p>
                            </td>
                            <td className="py-4 font-bold text-[#0A315C]">{loan.loanType}</td>
                            <td className="py-4 text-right font-bold">₹{(loan.amount || 0).toLocaleString('en-IN')}</td>
                            <td className="py-4 text-center font-mono text-slate-500">{loan.tenure} M</td>
                            <td className="py-4 text-right font-mono text-slate-655">₹{(loan.income || 0).toLocaleString('en-IN')}</td>
                            <td className="py-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                loan.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                              }`}>
                                {loan.status || 'Pending'}
                              </span>
                            </td>
                            <td className="py-4 text-right pr-2 space-x-2 shrink-0">
                              {loan.status === 'Pending' ? (
                                <>
                                  <button
                                    onClick={() => handleLoanStatusChange(loan._id, 'Approved')}
                                    disabled={actionLoading}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg border border-emerald-100 hover:border-emerald-600 transition-all cursor-pointer inline-flex items-center justify-center"
                                    title="Approve Loan Application"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleLoanStatusChange(loan._id, 'Rejected')}
                                    disabled={actionLoading}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white rounded-lg border border-rose-100 hover:border-rose-600 transition-all cursor-pointer inline-flex items-center justify-center"
                                    title="Reject Loan Application"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold block pr-4">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 4: DEPOSIT PRODUCTS & CMS INTEREST RATES */}
            {/* ========================================== */}
            {activeTab === 'deposit_products' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm max-w-2xl">
                <div className="pb-6 border-b border-slate-100 mb-6">
                  <h2 className="text-lg font-black text-slate-900 uppercase">Cooperative Deposit Products & Rates</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Configure interest rate schemes. Saved settings will change calculators and layouts on the website instantly.</p>
                </div>

                <form onSubmit={handleCmsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Savings Account Rate (% p.a.)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="1"
                        max="15"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={cmsState.savingsRate}
                        onChange={(e) => setCmsState({ ...cmsState, savingsRate: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Fixed Deposit (FD) Rate (% p.a.)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="1"
                        max="18"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={cmsState.fdRate}
                        onChange={(e) => setCmsState({ ...cmsState, fdRate: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Recurring Deposit (RD) Rate (% p.a.)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="1"
                        max="15"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={cmsState.rdRate}
                        onChange={(e) => setCmsState({ ...cmsState, rdRate: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Gold Loan Interest Rate (% p.a.)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="1"
                        max="22"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={cmsState.goldLoanRate}
                        onChange={(e) => setCmsState({ ...cmsState, goldLoanRate: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || isEmployee}
                    className="px-6 py-3 bg-[#0A315C] hover:bg-[#051C36] disabled:bg-slate-300 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin text-[#ED7F1E]" />}
                    <span>Update Interest Schemes</span>
                  </button>
                </form>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 5: WEBSITE CONTENT CMS */}
            {/* ========================================== */}
            {activeTab === 'cms' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm max-w-3xl">
                <div className="pb-6 border-b border-slate-100 mb-6">
                  <h2 className="text-lg font-black text-slate-900 uppercase">Website Portal CMS Controller</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Configure layout text coordinates, header info, and active content blocks on the website.</p>
                </div>

                <form onSubmit={handleCmsSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Announcement Ticker Marquee Text</label>
                    <textarea
                      rows={3}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-semibold text-slate-700"
                      value={cmsState.marqueeText}
                      onChange={(e) => setCmsState({ ...cmsState, marqueeText: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Hero Sliding Headline</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={cmsState.heroTitle}
                        onChange={(e) => setCmsState({ ...cmsState, heroTitle: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Hero Sliding Subtitle</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={cmsState.heroDesc}
                        onChange={(e) => setCmsState({ ...cmsState, heroDesc: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Home About Us Paragraph</label>
                    <textarea
                      rows={3}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-semibold text-slate-700"
                      value={cmsState.aboutText}
                      onChange={(e) => setCmsState({ ...cmsState, aboutText: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Contact Phone Number</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={cmsState.contactPhone}
                        onChange={(e) => setCmsState({ ...cmsState, contactPhone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Contact Support Email</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={cmsState.contactEmail}
                        onChange={(e) => setCmsState({ ...cmsState, contactEmail: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || isEmployee}
                    className="px-6 py-3 bg-[#0A315C] hover:bg-[#051C36] disabled:bg-slate-300 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin text-[#ED7F1E]" />}
                    <span>Publish CMS Content</span>
                  </button>
                </form>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 6: BRANCH MANAGEMENT (CMS SIMULATION) */}
            {/* ========================================== */}
            {activeTab === 'branches' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm max-w-xl">
                <div className="pb-6 border-b border-slate-100 mb-6">
                  <h2 className="text-lg font-black text-slate-900 uppercase">Branch Network CMS locator</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Publish operational branch coordinates and service desk timings.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-slate-800 uppercase">Central HQ - Odiyooru Post</p>
                      <p className="text-slate-450 mt-0.5">Tq. Uppala Road, Bantwal, Karnataka 574243</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase tracking-wider">Active</span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex justify-between items-center opacity-60">
                    <div>
                      <p className="font-extrabold text-slate-800 uppercase">Mangalore City Branch</p>
                      <p className="text-slate-450 mt-0.5">Kodialbail, Mangaluru, Karnataka 575003</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-655 font-black text-[9px] uppercase tracking-wider">Simulated</span>
                  </div>
                </div>

                <button
                  onClick={() => alert('Add Branch feature simulated!')}
                  className="mt-6 px-4 py-2.5 bg-[#ED7F1E] hover:bg-[#d66a10] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register Society Branch</span>
                </button>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 7: ANNOUNCEMENTS PUBLISHER */}
            {/* ========================================== */}
            {activeTab === 'announcements' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm max-w-xl">
                <div className="pb-6 border-b border-slate-100 mb-6">
                  <h2 className="text-lg font-black text-slate-900 uppercase">Notice & Announcements Publisher</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Publish holiday notice circulars and priority loan campaigns.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">State Best Souharda Award Recipient</span>
                      <span className="text-[9px] font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full uppercase">Published</span>
                    </div>
                    <p className="text-slate-500 leading-normal">Celebrations across all branches in honor of cooperative recognitions.</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">Cooperative FD Interest rate Hike</span>
                      <span className="text-[9px] font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full uppercase">Published</span>
                    </div>
                    <p className="text-slate-500 leading-normal">Interest rates hiked up to 8.50% p.a. for shareholders and seniors.</p>
                  </div>
                </div>

                <button
                  onClick={() => alert('New Notice feature simulated!')}
                  className="mt-6 px-4 py-2.5 bg-[#0A315C] hover:bg-[#051C36] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publish Notice Bulletin</span>
                </button>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 8: FORMS & DOWNLOADS MANAGER */}
            {/* ========================================== */}
            {activeTab === 'downloads' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm max-w-xl">
                <div className="pb-6 border-b border-slate-100 mb-6">
                  <h2 className="text-lg font-black text-slate-900 uppercase">Member Forms & Downloads</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Configure printable PDF forms available on the public portal.</p>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">KYC Account Opening Form</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">kyc_opening.pdf • 1.2 MB</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">142 downloads</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">Shareholder Membership Application Form</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">shareholder_membership.pdf • 920 KB</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">89 downloads</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert('Form indexing simulated!')}
                  className="mt-6 px-4 py-2.5 bg-[#ED7F1E] hover:bg-[#d66a10] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Index PDF Document</span>
                </button>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 9: RAG KNOWLEDGE BASE (Integrated) */}
            {/* ========================================== */}
            {activeTab === 'rag' && (
              <div className="space-y-8">
                {/* RAG Title */}
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase">RAG Policies Indexer</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Upload banking guidelines to train the AI NLP assistant.</p>
                </div>

                {/* Split Section: Index File Left, Indexed Files Table Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Document Upload Card (Left 4 columns) */}
                  <div className="lg:col-span-4 bg-white border border-slate-150 p-6 rounded-3xl shadow-sm h-fit">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase mb-4 flex items-center space-x-2">
                      <Database className="h-4.5 w-4.5 text-[#ED7F1E]" />
                      <span>Index Document</span>
                    </h3>
                    
                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Document Custom Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Home Loan Policy"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0A315C] focus:border-[#0A315C] focus:outline-none text-xs font-semibold text-slate-700"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Knowledge Category</label>
                        <select
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-semibold text-slate-700"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option value="General">General / FAQs</option>
                          <option value="Loans">Loans & Advances</option>
                          <option value="Deposits">Deposits & Savings</option>
                          <option value="Government Schemes">Government Schemes</option>
                          <option value="Timings & Rules">Bank Timings & Rules</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Document File</label>
                        <div className="border border-dashed border-slate-250 p-6 rounded-2xl text-center hover:bg-slate-50 transition-colors cursor-pointer relative bg-slate-50/50">
                          <input
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Download className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                          {file ? (
                            <div className="text-xs text-[#0A315C] font-bold truncate px-2">
                              {file.name}
                              <span className="text-[10px] text-slate-450 font-medium block mt-1">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[11px] text-slate-500 font-bold block">Drag file here or browse</span>
                              <span className="text-[9px] text-slate-400 font-medium block mt-1">PDF, DOCX, TXT</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-3 bg-[#0A315C] hover:bg-[#051C36] disabled:bg-slate-350 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-[#ED7F1E]" />
                            <span>Indexing...</span>
                          </>
                        ) : (
                          <>
                            <Database className="h-4 w-4" />
                            <span>Index Document</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Indexed Documents Table (Right 8 columns) */}
                  <div className="lg:col-span-8 bg-white border border-slate-150 p-6 rounded-3xl shadow-sm">
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase mb-4 flex items-center space-x-2">
                      <Database className="h-4.5 w-4.5 text-[#0A315C]" />
                      <span>Indexed Knowledge Library</span>
                    </h3>

                    {documents.length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <FileCode className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No documents indexed in MongoDB yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-150 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                              <th className="pb-3 pl-2">Title</th>
                              <th className="pb-3">Source File</th>
                              <th className="pb-3">Category</th>
                              <th className="pb-3 text-center">Chunks</th>
                              <th className="pb-3 text-right pr-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs text-slate-700 font-semibold divide-y divide-slate-100/50">
                            {documents.map((doc) => (
                              <tr key={doc._id} className="hover:bg-slate-50/50">
                                <td className="py-4 pl-2 font-bold text-slate-900 max-w-[150px] truncate" title={doc.title}>
                                  {doc.title}
                                </td>
                                <td className="py-4 font-mono text-[10px] text-slate-450 truncate max-w-[120px]" title={doc._id}>
                                  {doc._id}
                                </td>
                                <td className="py-4">
                                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-550/15 text-slate-700 border border-slate-200">
                                    {doc.category}
                                  </span>
                                </td>
                                <td className="py-4 text-center font-bold text-[#0A315C]">{doc.chunkCount}</td>
                                <td className="py-4 text-right pr-2 space-x-2 shrink-0">
                                  <button
                                    onClick={() => handleViewChunks(doc)}
                                    className="p-1.5 bg-slate-50 hover:bg-[#0A315C] text-slate-500 hover:text-white rounded-lg border border-slate-150 transition-colors cursor-pointer inline-flex items-center justify-center"
                                    title="View chunks"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDocumentDelete(doc._id)}
                                    disabled={actionLoading}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white rounded-lg border border-rose-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                                    title="Delete document"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 10: CHATBOT ANALYTICS */}
            {/* ========================================== */}
            {activeTab === 'chatbot' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm max-w-xl">
                <div className="pb-6 border-b border-slate-100 mb-6">
                  <h2 className="text-lg font-black text-slate-900 uppercase">Chatbot Analytics Console</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Monitor AI confidence levels and review questions that the chatbot couldn't resolve.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs space-y-2">
                    <p className="font-extrabold text-rose-800 uppercase flex items-center space-x-1.5">
                      <AlertCircle className="h-4 w-4" />
                      <span>Simulated Unresolved Queries</span>
                    </p>
                    <ul className="space-y-2 list-disc pl-4 text-slate-655 font-bold">
                      <li>"What are the rates of locker rent inside Mangalore branch?"</li>
                      <li>"Can I deposit cash at midnight via Doorstep banking?"</li>
                      <li>"Is there any dividend increase for A-class shares this year?"</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Confidence</span>
                      <span className="text-2xl font-black text-emerald-600 mt-1 block">94.2%</span>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Resolved Rate</span>
                      <span className="text-2xl font-black text-[#0A315C] mt-1 block">98.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 11: USER ACCOUNTS MANAGEMENT */}
            {/* ========================================== */}
            {activeTab === 'users' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <div className="pb-6 border-b border-slate-100 mb-6">
                  <h2 className="text-lg font-black text-slate-900 uppercase">User Accounts & Roles</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Configure roles and operational settings of bank members.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        <th className="pb-3 pl-2">Member Name</th>
                        <th className="pb-3">Email Address</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Security Controls</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-700 font-semibold divide-y divide-slate-100/50">
                      {users.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/50">
                          <td className="py-4 pl-2 font-bold text-slate-900">{item.fullName}</td>
                          <td className="py-4 font-mono">{item.email}</td>
                          <td className="py-4">
                            <select
                              disabled={actionLoading || !isSuperAdmin || item._id === currentUser?._id}
                              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                              value={item.role}
                              onChange={(e) => handleUserRoleChange(item._id, e.target.value)}
                            >
                              <option value="customer">customer</option>
                              <option value="employee">employee</option>
                              <option value="manager">manager</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="py-4 shrink-0">
                            <button
                              onClick={() => handleUserDelete(item._id)}
                              disabled={actionLoading || !isSuperAdmin || item._id === currentUser?._id}
                              className="px-3 py-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-655 font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Revoke Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 12: EMPLOYEE DIRECTORY & MANAGEMENT */}
            {/* ========================================== */}
            {activeTab === 'employees' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Pane: Staff List */}
                <div className="lg:col-span-7 bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-black text-slate-900 uppercase pb-4 border-b border-slate-100 mb-4">Cooperative Staff Directory</h2>
                  
                  <div className="space-y-4">
                    {staffUsers.map((item) => (
                      <div key={item._id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900">{item.fullName}</p>
                          <p className="text-slate-500 mt-0.5">{item.email}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">Contact: {item.phone}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-[#0A315C] text-white font-black text-[9px] uppercase tracking-widest">
                          {item.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Pane: Register Employee Form */}
                <div className="lg:col-span-5 bg-white border border-slate-150 rounded-3xl p-6 shadow-sm h-fit">
                  <h3 className="text-xs font-black text-slate-900 uppercase pb-4 border-b border-slate-100 mb-4 flex items-center space-x-2">
                    <Plus className="h-4.5 w-4.5 text-[#ED7F1E]" />
                    <span>Register Staff Employee</span>
                  </h3>

                  <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={newEmployee.fullName}
                        onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Access Password</label>
                      <input
                        type="password"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Access Role</label>
                      <select
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-xs font-bold"
                        value={newEmployee.role}
                        onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Super Admin</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading || !isSuperAdmin}
                      className="w-full py-3 bg-[#0A315C] hover:bg-[#051C36] disabled:bg-slate-300 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      {actionLoading && <Loader2 className="h-4 w-4 animate-spin text-[#ED7F1E]" />}
                      <span>Add Staff Employee</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 13: AUDIT LOGS */}
            {/* ========================================== */}
            {activeTab === 'audit' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <div className="pb-6 border-b border-slate-100 mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase">System Audit Trails</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">Audit logs tracing staff activities.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all local audit logs?')) {
                        setAuditLogs([]);
                        localStorage.removeItem('bank_audit_logs');
                      }
                    }}
                    disabled={!isSuperAdmin}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-655 font-bold text-xs rounded-xl border border-red-200 cursor-pointer disabled:opacity-50"
                  >
                    Clear Audit Logs
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-150 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        <th className="pb-3 pl-2">Timestamp</th>
                        <th className="pb-3">Personnel</th>
                        <th className="pb-3">Action Completed</th>
                        <th className="pb-3 text-right pr-2">Reference ID</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 font-semibold divide-y divide-slate-100/50">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="py-4 pl-2 font-mono text-[10px] text-slate-450">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-4 font-bold text-slate-900">{log.user}</td>
                          <td className="py-4 italic">"{log.action}"</td>
                          <td className="py-4 text-right pr-2 font-mono text-[10px] text-slate-400">{log.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 14: SETTINGS & RAG ENDPOINTS */}
            {/* ========================================== */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm max-w-xl">
                <div className="pb-6 border-b border-slate-100 mb-6">
                  <h2 className="text-lg font-black text-slate-900 uppercase">System Parameters Configuration</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Configure vector database connections and system limits.</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); alert('Saved Settings configuration!'); }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">FastAPI RAG API Base URL</label>
                    <input
                      type="url"
                      required
                      placeholder="http://localhost:8000"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                      defaultValue="http://localhost:8000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Monthly Loan Limit Caps (Per User)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold"
                      defaultValue="₹25,00,000"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-3 bg-[#0A315C] hover:bg-[#051C36] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-colors cursor-pointer"
                  >
                    Save Configuration
                  </button>
                </form>
              </div>
            )}
          </>
        )}

      </main>

      {/* VIEW RAG CHUNKS MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-150 shadow-2xl animate-scale-up relative flex flex-col max-h-[85vh]">
            
            <button 
              onClick={() => setSelectedDoc(null)} 
              className="absolute top-5 right-5 text-slate-455 hover:text-slate-655 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="border-b border-slate-100 pb-4 mb-4">
              <span className="text-[9px] font-black text-[#ED7F1E] uppercase tracking-wider bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">{selectedDoc.category}</span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">{selectedDoc.title}</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Source: {selectedDoc._id}</p>
            </div>

            {loadingChunks ? (
              <div className="flex flex-col items-center justify-center py-20 flex-1">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <span className="text-xs text-slate-400 font-medium">Extracting indexed vectors...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {docChunks.map((chunk, idx) => (
                  <div key={chunk._id || idx} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-xs relative hover:border-slate-300 transition-colors">
                    <span className="absolute top-3 right-4 font-mono text-[9px] text-[#0A315C] font-bold bg-[#0A315C]/10 px-2 py-0.5 rounded-full">Vector {idx + 1}</span>
                    <p className="font-semibold text-slate-800 leading-relaxed pr-16 whitespace-pre-wrap">{chunk.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-center text-[10px] text-slate-450 font-bold shrink-0">
              <span>Uploaded: {new Date(selectedDoc.createdAt).toLocaleDateString()}</span>
              <span>Total: {docChunks.length} chunks</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
