import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
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
import { adminGetFDs, adminSettleFD, adminCheckMaturity } from '../services/fdApi';
import { useAuth } from '../context/AuthContext';
import { getAllSavingsDeposits, calculateInterest } from '../services/savingsApi';

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
    'dashboard' | 'applications' | 'service_applications' | 'customers' | 'loans' | 'deposit_products' | 'fd_management' | 'rd_management' | 'cms' | 'branches' | 'announcements' | 'downloads' | 'rag' | 'chatbot' | 'users' | 'employees' | 'audit' | 'settings' | 'memberships'
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
  const [memberships, setMemberships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [savingsDeposits, setSavingsDeposits] = useState<any[]>([]);
  const [serviceApplications, setServiceApplications] = useState<any[]>([]);
  const [selectedServiceApp, setSelectedServiceApp] = useState<any>(null);
  const [adminFds, setAdminFds] = useState<any[]>([]);
  const [adminRds, setAdminRds] = useState<any[]>([]);

  // Announcements States
  const announcements = systemSettings?.announcements?.length > 0 ? systemSettings.announcements : [
    { title: 'Cooperative Fixed Deposit Rates Increased to 8.50%', desc: 'Our governing board has authorized an upward adjustment in FD yield returns to protect capital value for member families.', isPublished: true },
    { title: 'Financial Literacy Program Conducted in Rural Hubs', desc: 'Held simulated training workshops supporting over 300+ women micro-entrepreneurs on savings structures and credit pathways.', isPublished: true },
    { title: 'New Digital Doorstep Banking Service Sanctioned', desc: 'Launched mobile collection systems allowing members to deposit savings and pay EMIs directly through certified agents.', isPublished: true }
  ];
  const [isPublishingNotice, setIsPublishingNotice] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeDesc, setNewNoticeDesc] = useState('');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [adminBranches, setAdminBranches] = useState<any[]>([]);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: '', address: '', phone: '' });

  // Form States (CMS / Settings / Employee Creation)
  const [cmsState, setCmsState] = useState({
      fdRate: 8.50,
      goldLoanRate: 8.50,
      savingsRate: 4.50,
      rdRate: 7.75,
      vehicleLoanRate: 10.00,
      personalLoanRate: 11.50,
      educationalLoanRate: 7.90,
      housingLoanRate: 8.25,
      mortgageLoanRate: 9.50,
      agriculturalLoanRate: 8.50,
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
    fetchBranches();
    loadCmsState();
    loadAuditLogs();
    fetchMemberships();
    fetchApplications();
    fetchServiceApplications();
    fetchAdminFds();
    fetchAdminRds();
  }, []);

  const fetchServiceApplications = async () => {
    try {
      const res = await api.get('/service-applications');
      if (res.data.success) {
        setServiceApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch service applications', err);
    }
  };

  const fetchAdminFds = async () => {
    try {
      const res = await adminGetFDs();
      if (res.success) {
        setAdminFds(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin FDs', err);
    }
  };

  const fetchAdminRds = async () => {
    try {
      const res = await api.get('/rd');
      if (res.data.success) {
        setAdminRds(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin RDs', err);
    }
  };

  const handleFdSettlement = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this settlement?')) return;
    setActionLoading(true);
    try {
      const res = await adminSettleFD(id);
      if (res.success) {
        setSuccess('Fixed Deposit settlement approved.');
        fetchAdminFds();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to settle FD');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckMaturity = async () => {
    setActionLoading(true);
    try {
      const res = await adminCheckMaturity();
      if (res.success) {
        setSuccess(res.message || 'Maturity check completed.');
        fetchAdminFds();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to check maturity');
    } finally {
      setActionLoading(false);
    }
  };

  const handleServiceApplicationStatusChange = async (appId: string, status: string) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.put(`/service-applications/${appId}/status`, { status });
      if (res.data.success) {
        setSuccess(`Service application ${status}`);
        addAuditLog(`Updated service application status to ${status} for ID ${appId}`);
        fetchServiceApplications();
        fetchStats();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update service application status');
    } finally {
      setActionLoading(false);
      setSelectedServiceApp(null);
    }
  };

  const fetchMemberships = async () => {
    try {
      const res = await api.get('/admin/memberships');
      if (res.data.success) {
        setMemberships(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch memberships', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
    }
  };

  const handleApplicationStatusChange = async (appId: string, status: string) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.put(`/applications/${appId}/status`, { status });
      if (res.data.success) {
        setSuccess(`Account application ${status}`);
        addAuditLog(`Updated account application status to ${status} for ID ${appId}`);
        fetchApplications();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update application status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMembershipStatusChange = async (userId: string, status: string) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.put(`/admin/membership/${userId}/status`, { status });
      if (res.data.success) {
        setSuccess(`Membership application ${status}`);
        addAuditLog(`Updated membership status to ${status} for user ${userId}`);
        fetchMemberships();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update membership status');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      const sorted = res.data.sort((a: any, b: any) => {
        if (a.type === 'Head Office' && b.type !== 'Head Office') return -1;
        if (b.type === 'Head Office' && a.type !== 'Head Office') return 1;
        return a.name.localeCompare(b.name);
      });
      setAdminBranches(sorted);
    } catch (err) {
      console.error('Failed to fetch branches', err);
    }
  };

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
          vehicleLoanRate: systemSettings.vehicleLoanRate || 10.00,
          personalLoanRate: systemSettings.personalLoanRate || 11.50,
          educationalLoanRate: systemSettings.educationalLoanRate || 7.90,
          housingLoanRate: systemSettings.housingLoanRate || 8.25,
          mortgageLoanRate: systemSettings.mortgageLoanRate || 9.50,
          agriculturalLoanRate: systemSettings.agriculturalLoanRate || 8.50,
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
        rdRate: Number(cmsState.rdRate),
        vehicleLoanRate: Number(cmsState.vehicleLoanRate),
        personalLoanRate: Number(cmsState.personalLoanRate),
        educationalLoanRate: Number(cmsState.educationalLoanRate),
        housingLoanRate: Number(cmsState.housingLoanRate),
        mortgageLoanRate: Number(cmsState.mortgageLoanRate),
        agriculturalLoanRate: Number(cmsState.agriculturalLoanRate)
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

  const handleCalculateInterest = async () => {
    if (!window.confirm('Are you sure you want to calculate and credit interest to all active savings accounts? This action cannot be undone.')) return;
    
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await calculateInterest();
      if (res.success) {
        setSuccess(`Interest calculated and credited to ${res.processed} accounts successfully.`);
        addAuditLog(`Calculated and credited interest to ${res.processed} savings accounts`);
      } else {
        setError(res.error || 'Failed to calculate interest');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during interest calculation');
    } finally {
      setActionLoading(false);
    }
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
    { name: 'Home', count: loans.filter(l => l.loanType === 'Home Loan' || l.loanType === 'Housing Loan').length || 5 },
    { name: 'Mortgage', count: loans.filter(l => l.loanType === 'Member\'s Mortgage Loans').length || 2 },
    { name: 'Surity', count: loans.filter(l => l.loanType === 'Member\'s Surity Loans').length || 2 },
    { name: 'Gold', count: loans.filter(l => l.loanType === 'Gold Loan').length || 8 },
    { name: 'Vehicle', count: loans.filter(l => l.loanType === 'Vehicle Loan' || l.loanType === 'Member\'s Old Vehicle Loans').length || 4 }
  ];

  const depositGrowthData = [
    { name: 'Savings', value: Math.round(stats.totalDeposits * 0.4) || 20000 },
    { name: 'Fixed Deposits', value: Math.round(stats.totalDeposits * 0.6) || 30000 }
  ];

  const COLORS = ['#0A315C', '#ED7F1E'];

  // Sidebar list matching all 14 requested items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Account Applications', icon: Briefcase },
    { id: 'service_applications', label: 'Loan & Deposit Apps', icon: FileText },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'memberships', label: 'Memberships', icon: ShieldCheck },
    { id: 'deposit_products', label: 'Deposit Products', icon: TrendingUp },
    { id: 'fd_management', label: 'Fixed Deposits', icon: History },
    { id: 'rd_management', label: 'Recurring Deposits', icon: Database },
    { id: 'branches', label: 'Branch Management', icon: MapPin },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'rag', label: 'RAG Knowledge Base', icon: Database },
    { id: 'users', label: 'User Management', icon: UserCheck },
    { id: 'employees', label: 'Employee Management', icon: Contact },
    { id: 'audit', label: 'Audit Logs', icon: History }
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
                className={`w-full flex items-center space-x-3 px-6 py-3 text-xs font-bold transition-all text-left uppercase tracking-wider ${isActive
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

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Deposits</span>
                      <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">₹{(stats.totalDeposits || 0).toLocaleString('en-IN')}</span>
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
                              <stop offset="5%" stopColor="#0A315C" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#0A315C" stopOpacity={0} />
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



                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


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
                              <a
                                href={`mailto:${msg.email}?subject=${encodeURIComponent('Reply to your inquiry at Odiyooru Bank')}&body=${encodeURIComponent(`Hi ${msg.name},\n\nRegarding your message:\n"${msg.message}"\n\n`)}`}
                                className="mt-2 text-[10px] text-primary font-bold hover:underline inline-block"
                              >
                                Reply via Email
                              </a>
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
            {/* NEW TAB: MEMBERSHIPS */}
            {/* ========================================== */}
            {activeTab === 'memberships' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase">Membership Applications</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">Review, approve, or reject new shareholder memberships.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                        <th className="p-4 rounded-l-xl">User & Contact</th>
                        <th className="p-4">Demographics</th>
                        <th className="p-4">Customer ID</th>
                        <th className="p-4">Address</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {memberships.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold italic text-xs">
                            No membership applications found.
                          </td>
                        </tr>
                      ) : (
                        memberships.map((m: any) => (
                          <tr key={m._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">
                                  {m.fullName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{m.fullName}</p>
                                  <p className="text-[10px] text-slate-500">{m.email} | {m.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-xs">
                              <p className="font-semibold text-slate-800">DOB: {m.dob}</p>

                            </td>
                            <td className="p-4 text-xs font-medium text-slate-600">
                              {m.memberId || '-'}
                            </td>
                            <td className="p-4 text-xs font-medium text-slate-600 max-w-[200px] truncate">
                              {m.address}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${m.membershipStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                  m.membershipStatus === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {m.membershipStatus}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {m.membershipStatus === 'pending' ? (
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleMembershipStatusChange(m._id, 'approved')}
                                    disabled={actionLoading}
                                    className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-200"
                                    title="Approve"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleMembershipStatusChange(m._id, 'rejected')}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors border border-rose-200 font-bold text-xs"
                                    title="Disapprove"
                                  >
                                    Disapprove
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-semibold">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB: ACCOUNT APPLICATIONS */}
            {/* ========================================== */}
            {activeTab === 'applications' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase">Account Applications</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">Review, approve, or reject new bank account requests.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                        <th className="p-4 rounded-l-xl">Applicant</th>
                        <th className="p-4">Account Type</th>
                        <th className="p-4">Aadhar & PAN</th>
                        <th className="p-4">Aadhar Document</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {applications.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold italic text-xs">
                            No account applications found.
                          </td>
                        </tr>
                      ) : (
                        applications.map((app: any) => (
                          <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">
                                  {app.nameAsAadhar.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{app.nameAsAadhar}</p>
                                  <p className="text-[10px] text-slate-500">{app.userId?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-xs font-semibold text-slate-800">
                              {app.accountType}
                            </td>
                            <td className="p-4 text-xs">
                              <p className="font-semibold text-slate-800">Aadhar: {app.aadharNumber}</p>
                              <p className="font-semibold text-slate-800">PAN: {app.panNumber}</p>
                            </td>
                            <td className="p-4 text-xs font-medium text-slate-600">
                              <a href={app.aadharDocumentUrl?.includes('example.com') ? '/dummy-aadhar.png' : app.aadharDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                <Eye className="h-4 w-4" /> View Aadhar
                              </a>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                  app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {app.status === 'Pending' ? (
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleApplicationStatusChange(app._id, 'Approved')}
                                    disabled={actionLoading}
                                    className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-200"
                                    title="Approve"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleApplicationStatusChange(app._id, 'Rejected')}
                                    disabled={actionLoading}
                                    className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors border border-rose-200"
                                    title="Reject"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-semibold">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
            <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase">Savings Deposits</h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">Review savings deposit applications.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                      <th className="p-4 rounded-l-xl">User</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Purpose</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Receipt</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {savingsDeposits.map(dep => (
                      <tr key={dep._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{dep.userId?.fullName || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{dep.userId?.email || ''}</p>
                        </td>
                        <td className="p-4 font-black text-[#0A315C]">₹{dep.amount.toLocaleString('en-IN')}</td>
                        <td className="p-4 text-xs font-bold text-slate-600">{dep.purpose}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase ${dep.paymentStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {dep.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono font-bold text-slate-500">{dep.receiptNumber}</td>
                        <td className="p-4 text-xs font-bold text-slate-500">
                          {new Date(dep.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">View details</button>
                        </td>
                      </tr>
                    ))}
                    {savingsDeposits.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 text-xs font-bold">No savings deposits found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* ========================================== */}
            {/* TAB: SERVICE APPLICATIONS */}
            {/* ========================================== */}
            {activeTab === 'service_applications' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase">Loan & Deposit Applications</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">Review complex Gold Loan and FD/RD application forms.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                        <th className="p-4 rounded-l-xl">User</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Date Submitted</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {serviceApplications.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold italic text-xs">
                            No service applications found.
                          </td>
                        </tr>
                      ) : (
                        serviceApplications.map((app: any) => (
                          <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-slate-900">{app.userId?.fullName || 'Unknown'}</p>
                              <p className="text-[10px] text-slate-500">{app.userId?.email || ''}</p>
                            </td>
                            <td className="p-4 text-xs font-semibold text-slate-800">
                              {app.applicationType}
                            </td>
                            <td className="p-4 text-xs text-slate-600">
                              {new Date(app.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                  app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => setSelectedServiceApp(app)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                                >
                                  View Details
                                </button>
                                {app.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => handleServiceApplicationStatusChange(app._id, 'Approved')}
                                      disabled={actionLoading}
                                      className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-200 flex items-center justify-center cursor-pointer"
                                      title="Approve"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleServiceApplicationStatusChange(app._id, 'Rejected')}
                                      disabled={actionLoading}
                                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors border border-rose-200 flex items-center justify-center cursor-pointer"
                                      title="Reject"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
                          <th className="pb-3">Cust ID</th>
                          <th className="pb-3">Member ID</th>
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
                            <td className="py-4 font-mono text-slate-500">{customer.customerId || '—'}</td>
                            <td className="py-4 font-mono text-slate-500">{customer.memberId || '—'}</td>
                            <td className="py-4">{customer.email}</td>
                            <td className="py-4 font-mono text-slate-500">{customer.phone}</td>
                            <td className="py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${customer.status === 'Suspended'
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
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer ${customer.status === 'Suspended'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  }`}
                              >
                                {customer.status === 'Suspended' ? 'Unblock Member' : 'Suspend Member'}
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
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
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
            {/* TAB: FD MANAGEMENT */}
            {/* ========================================== */}
            {activeTab === 'fd_management' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase">Fixed Deposit Management</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">Review maturity settlements and perform daily maturity checks.</p>
                  </div>
                  <button 
                    onClick={handleCheckMaturity}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-[#0F4C81] text-white hover:bg-blue-900 rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Run Maturity Check
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                        <th className="p-4 rounded-l-xl">FD Number</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Principal / Tenure</th>
                        <th className="p-4">Maturity Date / Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminFds.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold italic text-xs">
                            No Fixed Deposits found.
                          </td>
                        </tr>
                      ) : (
                        adminFds.map((fd: any) => (
                          <tr key={fd._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <span className="font-bold text-slate-900 font-mono">{fd.fdNumber}</span>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-slate-900">{fd.userId?.fullName}</p>
                              <p className="text-[10px] text-slate-500">{fd.userId?.customerId}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-bold text-slate-900">₹{(fd.principalAmount || 0).toLocaleString('en-IN')}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{fd.tenureMonths} Months</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-bold text-emerald-700">₹{(fd.maturityAmount || 0).toLocaleString('en-IN')}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{new Date(fd.maturityDate).toLocaleDateString()}</p>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                fd.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                                fd.status === 'Matured' ? 'bg-emerald-100 text-emerald-700' :
                                fd.status === 'Pending Settlement Approval' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {fd.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {fd.status === 'Pending Settlement Approval' ? (
                                <button
                                  onClick={() => handleFdSettlement(fd._id)}
                                  disabled={actionLoading}
                                  className="px-3 py-1.5 bg-[#ED7F1E] text-white hover:bg-[#d66b12] rounded-lg text-[10px] font-bold transition-colors"
                                >
                                  Approve Settlement
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold italic">No action needed</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB: RD MANAGEMENT */}
            {/* ========================================== */}
            {activeTab === 'rd_management' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase">Recurring Deposit Management</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">Review RD applications, approvals, and settlements.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                        <th className="p-4 rounded-l-xl">RD Number</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Monthly Amount</th>
                        <th className="p-4">Tenure</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminRds.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold italic text-xs">
                            No Recurring Deposits found.
                          </td>
                        </tr>
                      ) : (
                        adminRds.map((rd: any) => (
                          <tr key={rd._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <span className="font-bold text-slate-900 font-mono">{rd.rdNumber || 'Pending'}</span>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-slate-900">{rd.userId?.fullName || 'N/A'}</p>
                              <p className="text-[10px] text-slate-500">{rd.userId?.email || 'N/A'}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-bold text-[#0F4C81]">₹{(rd.monthlyAmount || 0).toLocaleString('en-IN')}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-[10px] text-slate-500 font-medium">{rd.tenureMonths} Months</p>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                rd.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                rd.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700' :
                                rd.status === 'Matured' ? 'bg-blue-100 text-blue-700' :
                                rd.status === 'Inactive' ? 'bg-rose-100 text-rose-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {rd.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {rd.status === 'Pending Approval' && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Approve this RD application?')) {
                                      try {
                                        await api.put(`/rd/${rd._id}/approve`);
                                        fetchAdminRds();
                                      } catch (err) {
                                        alert('Failed to approve RD');
                                      }
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700"
                                >
                                  Approve RD
                                </button>
                              )}
                              {rd.status === 'Pending Settlement Approval' && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Approve this settlement?')) {
                                      try {
                                        await api.put(`/rd/${rd._id}/approve-settlement`);
                                        fetchAdminRds();
                                      } catch (err) {
                                        alert('Failed to approve Settlement');
                                      }
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-[#ED7F1E] text-white hover:bg-[#d66b12] rounded-lg text-[10px] font-bold transition-colors"
                                >
                                  Approve Settlement
                                </button>
                              )}
                              {rd.status === 'Inactive' && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Reactivate this RD?')) {
                                      try {
                                        await api.put(`/rd/${rd._id}/reactivate`);
                                        fetchAdminRds();
                                      } catch (err) {
                                        alert('Failed to reactivate RD');
                                      }
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-[10px] font-bold transition-colors"
                                >
                                  Reactivate
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
            )}

            {/* ========================================== */}
            {/* TAB 4: DEPOSIT PRODUCTS & CMS INTEREST RATES */}
            {/* ========================================== */}
            {activeTab === 'deposit_products' && (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm max-w-2xl">
                <div className="pb-6 border-b border-slate-100 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase">Cooperative Products & Rates</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">Configure interest rate schemes. Saved settings will change calculators and layouts on the website instantly.</p>
                  </div>
                  <button 
                    onClick={handleCalculateInterest}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-[#ED7F1E] hover:bg-[#d66b12] text-white rounded-xl text-xs font-bold transition-colors shadow-md whitespace-nowrap flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" /> Credit Savings Interest
                  </button>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Vehicle Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.vehicleLoanRate} onChange={(e) => setCmsState({ ...cmsState, vehicleLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Personal Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.personalLoanRate} onChange={(e) => setCmsState({ ...cmsState, personalLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Educational Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.educationalLoanRate} onChange={(e) => setCmsState({ ...cmsState, educationalLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Housing Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.housingLoanRate} onChange={(e) => setCmsState({ ...cmsState, housingLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mortgage Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.mortgageLoanRate} onChange={(e) => setCmsState({ ...cmsState, mortgageLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Agricultural Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.agriculturalLoanRate} onChange={(e) => setCmsState({ ...cmsState, agriculturalLoanRate: Number(e.target.value) })} />
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Vehicle Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.vehicleLoanRate} onChange={(e) => setCmsState({ ...cmsState, vehicleLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Personal Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.personalLoanRate} onChange={(e) => setCmsState({ ...cmsState, personalLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Educational Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.educationalLoanRate} onChange={(e) => setCmsState({ ...cmsState, educationalLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Housing Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.housingLoanRate} onChange={(e) => setCmsState({ ...cmsState, housingLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mortgage Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.mortgageLoanRate} onChange={(e) => setCmsState({ ...cmsState, mortgageLoanRate: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Agricultural Loan Rate (% p.a.)</label>
                      <input type="number" step="0.05" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs font-bold" value={cmsState.agriculturalLoanRate} onChange={(e) => setCmsState({ ...cmsState, agriculturalLoanRate: Number(e.target.value) })} />
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
                  {adminBranches.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 font-semibold italic">No branches registered.</div>
                  ) : (
                    adminBranches.map((branch: any) => (
                      <div key={branch._id} className={`p-4 border rounded-2xl text-xs flex justify-between items-center transition-all ${branch.isPublished ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                        <div className="flex-1 pr-4">
                          <p className="font-extrabold text-slate-800 uppercase flex items-center space-x-2">
                            <span>{branch.name}</span>
                            {branch.type === 'Head Office' && (
                              <span className="bg-[#0A315C] text-white px-1.5 py-0.5 rounded text-[8px] ml-2 shrink-0">HQ</span>
                            )}
                          </p>
                          <p className="text-slate-500 mt-1 leading-relaxed">{branch.address}</p>
                          <p className="text-slate-400 font-mono mt-1.5 text-[11px]">{branch.phone}</p>
                        </div>
                        <div className="flex flex-col space-y-3 items-end shrink-0 justify-center min-w-[80px]">
                          <button
                            disabled={actionLoading}
                            onClick={async () => {
                              setActionLoading(true);
                              try {
                                await api.put(`/branches/${branch._id}`, { isPublished: !branch.isPublished });
                                fetchBranches();
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setActionLoading(false);
                              }
                            }}
                            className={`text-[11px] font-bold uppercase transition-colors hover:underline ${branch.isPublished ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                          >
                            {branch.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={async () => {
                              if (!window.confirm('Are you sure you want to delete this branch?')) return;
                              setActionLoading(true);
                              try {
                                await api.delete(`/branches/${branch._id}`);
                                fetchBranches();
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setActionLoading(false);
                              }
                            }}
                            className="text-[11px] font-bold uppercase text-red-500 hover:text-red-700 hover:underline transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setIsBranchModalOpen(true)}
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
                  {announcements.map((ann: any, idx: number) => (
                    <div key={idx} className={`p-4 border rounded-xl text-xs flex justify-between items-center transition-all ${ann.isPublished !== false ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                      <div className="flex-1 pr-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800">{ann.title}</span>
                          <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded-full uppercase ${ann.isPublished !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                            {ann.isPublished !== false ? 'Published' : 'Unpublished'}
                          </span>
                        </div>
                        <p className="text-slate-500 leading-normal">{ann.desc}</p>
                      </div>
                      <div className="flex flex-col space-y-3 items-end shrink-0 justify-center min-w-[80px]">
                        <button
                          disabled={actionLoading}
                          onClick={async () => {
                            const updatedAnnouncements = [...announcements];
                            updatedAnnouncements[idx] = { ...ann, isPublished: ann.isPublished === false ? true : false };
                            await updateSystemSettings({ announcements: updatedAnnouncements });
                          }}
                          className={`text-[11px] font-bold uppercase transition-colors hover:underline ${ann.isPublished !== false ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                        >
                          {ann.isPublished !== false ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={async () => {
                            if (!window.confirm('Are you sure you want to remove this announcement?')) return;
                            const updatedAnnouncements = announcements.filter((_: any, i: number) => i !== idx);
                            await updateSystemSettings({ announcements: updatedAnnouncements });
                          }}
                          className="text-[11px] font-bold uppercase text-red-500 hover:text-red-700 hover:underline transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {isPublishingNotice ? (
                  <div className="mt-6 p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                    <input
                      type="text"
                      placeholder="Announcement Title"
                      value={newNoticeTitle}
                      onChange={(e) => setNewNoticeTitle(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-primary"
                    />
                    <textarea
                      placeholder="Announcement Description (Visible to public)"
                      rows={3}
                      value={newNoticeDesc}
                      onChange={(e) => setNewNoticeDesc(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-primary resize-none"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setIsPublishingNotice(false);
                          setNewNoticeTitle('');
                          setNewNoticeDesc('');
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (newNoticeTitle && newNoticeDesc) {
                            const updatedAnnouncements = [...announcements, { title: newNoticeTitle, desc: newNoticeDesc }];
                            await updateSystemSettings({ announcements: updatedAnnouncements });
                            setIsPublishingNotice(false);
                            setNewNoticeTitle('');
                            setNewNoticeDesc('');
                          }
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                      >
                        Submit & Publish
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsPublishingNotice(true)}
                    className="mt-6 px-4 py-2.5 bg-[#0A315C] hover:bg-[#051C36] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Publish Notice Bulletin</span>
                  </button>
                )}
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
                  <h2 className="text-lg font-black text-slate-900 uppercase">RAG Assistant</h2>
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


      {/* BRANCH MODAL */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-150 shadow-2xl animate-scale-up relative">
            <button
              onClick={() => setIsBranchModalOpen(false)}
              className="absolute top-5 right-5 text-slate-455 hover:text-slate-655 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-extrabold text-slate-900 mb-4">Register New Branch</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setActionLoading(true);
              try {
                await api.post('/branches', branchForm);
                fetchBranches();
                addAuditLog(`Registered new branch: ${branchForm.name}`);
                setIsBranchModalOpen(false);
                setBranchForm({ name: '', address: '', phone: '' });
              } catch (e: any) {
                console.error(e);
                alert(e.response?.data?.error || 'Failed to register branch. If you just added this feature, please restart your backend server!');
              } finally {
                setActionLoading(false);
              }
            }}>
              <div className="space-y-3">
                <input required type="text" placeholder="Branch Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs" value={branchForm.name} onChange={e => setBranchForm({ ...branchForm, name: e.target.value })} />
                <input required type="text" placeholder="Branch Address" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs" value={branchForm.address} onChange={e => setBranchForm({ ...branchForm, address: e.target.value })} />
                <input required type="text" placeholder="Phone Number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs" value={branchForm.phone} onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })} />
              </div>
              <button disabled={actionLoading} type="submit" className="mt-4 px-6 py-2.5 bg-[#0A315C] hover:bg-[#051C36] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 w-full">
                {actionLoading ? 'Saving...' : 'Register Branch'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedServiceApp && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 flex justify-center items-start">
          <div className="bg-white w-full max-w-4xl mt-10 mb-10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider">{selectedServiceApp.applicationType} Application</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">Submitted on {new Date(selectedServiceApp.submittedAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedServiceApp(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 flex-grow">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <h4 className="font-bold text-blue-900 text-sm mb-3 border-b border-blue-200 pb-2">Form Data Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedServiceApp.formData)
                    .filter(([key, value]) => {
                      if (['minorDob', 'guardianName', 'introducerName', 'introducerAccountNo'].includes(key)) return false;
                      if (value === '' || value === null || value === undefined || value === '-') return false;
                      return true;
                    })
                    .map(([key, value]: any) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm font-semibold text-slate-800 break-words">
                        {typeof value === 'object' ? JSON.stringify(value) : (value?.toString() || '-')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedServiceApp.images && Object.keys(selectedServiceApp.images).length > 0 && (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <h4 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-200 pb-2">Attached Documents & Signatures</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Object.entries(selectedServiceApp.images).map(([key, base64Url]: any) => (
                      <div key={key} className="flex flex-col items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <span className="text-xs uppercase font-bold text-slate-600 tracking-wider mb-3 w-full text-center border-b border-slate-100 pb-2">{key}</span>
                        {base64Url && typeof base64Url === 'string' && base64Url.startsWith('data:image') ? (
                          <img src={base64Url} alt={key} className="max-w-full h-auto max-h-48 object-contain rounded" />
                        ) : base64Url && typeof base64Url === 'string' && base64Url.startsWith('data:application/pdf') ? (
                          <a href={base64Url} download={`${key}.pdf`} className="text-blue-600 hover:underline font-bold text-sm flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Download PDF
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">No Document / Unsupported format</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4 shrink-0">
              {selectedServiceApp.status === 'Pending' ? (
                <>
                  <button 
                    onClick={() => handleServiceApplicationStatusChange(selectedServiceApp._id, 'Rejected')}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl transition-colors"
                  >
                    Reject Application
                  </button>
                  <button 
                    onClick={() => handleServiceApplicationStatusChange(selectedServiceApp._id, 'Approved')}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors"
                  >
                    Approve Application
                  </button>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-500">
                  This application has already been {selectedServiceApp.status.toLowerCase()}.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
