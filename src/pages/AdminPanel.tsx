import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Eye, 
  Landmark, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Database, 
  Layers,
  Calendar,
  X,
  FileCode
} from 'lucide-react';
import api from '../services/api';

interface DocumentGroup {
  _id: string; // filename
  title: string;
  category: string;
  chunkCount: number;
  createdAt: string;
  sampleContent: string;
}

interface AdminPanelProps {
  setCurrentTab: (tab: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ setCurrentTab }) => {
  const [documents, setDocuments] = useState<DocumentGroup[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  
  // Loading & Feedback States
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // View Chunks Modal State
  const [selectedDoc, setSelectedDoc] = useState<DocumentGroup | null>(null);
  const [docChunks, setDocChunks] = useState<any[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // Load documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/documents');
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch indexed documents.');
    } finally {
      setLoading(false);
    }
  };

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

    setUploading(true);
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
        setFile(null);
        setTitle('');
        setCategory('General');
        fetchDocuments();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload and index document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`Are you sure you want to delete all vector chunks associated with "${filename}"?`)) {
      return;
    }

    setDeletingId(filename);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.delete(`/admin/document/${encodeURIComponent(filename)}`);
      if (res.data.success) {
        setSuccess(`Successfully deleted document: ${filename}`);
        fetchDocuments();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewChunks = async (doc: DocumentGroup) => {
    setSelectedDoc(doc);
    setLoadingChunks(true);
    setDocChunks([]);
    
    try {
      const res = await api.get('/admin/documents?detail=true');
      if (res.data.success) {
        // Filter chunks belonging to this file source
        const filtered = res.data.data.filter((chunk: any) => chunk.source === doc._id);
        setDocChunks(filtered);
      }
    } catch (err: any) {
      console.error('Failed to load document chunks', err);
    } finally {
      setLoadingChunks(false);
    }
  };

  // Calculate statistics
  const totalDocsCount = documents.length;
  const totalChunksCount = documents.reduce((acc, doc) => acc + doc.chunkCount, 0);
  const categoriesCount = Array.from(new Set(documents.map(doc => doc.category))).length;

  return (
    <section className="bg-slate-50 min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* RAG Page Title */}
        <div className="relative bg-[#0A315C] rounded-3xl p-8 text-white overflow-hidden shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-secondary/15 rounded-full blur-2xl"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0">
              <Database className="h-8 w-8 text-[#ED7F1E]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#ED7F1E] uppercase tracking-widest block">AI Knowledge Console</span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">RAG Documents Indexer</h2>
              <p className="text-xs text-white/70 mt-1">
                Upload and manage documents to expand the AI banking assistant's cooperative knowledge base.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setCurrentTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Dynamic Alerts Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start space-x-3 text-xs animate-slide-down shadow-sm">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start space-x-3 text-xs animate-slide-down shadow-sm">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Statistical Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-[#0A315C] rounded-2xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Indexed Files</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">{totalDocsCount} Documents</span>
            </div>
          </div>
          
          <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-orange-50 text-[#ED7F1E] rounded-2xl">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Text Chunks</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">{totalChunksCount} Vectors</span>
            </div>
          </div>
          
          <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Knowledge Categories</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">{categoriesCount} Categories</span>
            </div>
          </div>
        </div>

        {/* Split Section: Index File Left, Indexed Files Table Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Document Upload Card (Left 4 columns) */}
          <div className="lg:col-span-4 bg-white border border-slate-150 p-6 rounded-3xl shadow-sm h-fit">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
              <Upload className="h-5 w-5 text-[#ED7F1E]" />
              <span>Index Document</span>
            </h3>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* Document Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document Custom Title</label>
                <input
                  type="text"
                  placeholder="e.g. Home Loan Policy"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#0A315C] focus:border-[#0A315C] focus:outline-none text-xs font-semibold text-slate-700 placeholder-slate-400"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Knowledge Category</label>
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

              {/* Drag-drop or browse field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document File</label>
                
                <div className="border border-dashed border-slate-250 p-6 rounded-2xl text-center hover:bg-slate-50 transition-colors cursor-pointer relative bg-slate-50/50">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="h-8 w-8 text-slate-455 mx-auto mb-2" />
                  
                  {file ? (
                    <div className="text-xs text-[#0A315C] font-bold truncate px-2">
                      {file.name}
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[11px] text-slate-500 font-bold block">Drag file here or click to browse</span>
                      <span className="text-[9px] text-slate-400 font-medium block mt-1">Supported: PDF, DOCX, TXT</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Index Trigger Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-[#0A315C] hover:bg-[#051C36] disabled:bg-slate-350 text-white rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#ED7F1E]" />
                    <span>Extracting & Generating Vector Embeddings...</span>
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    <span>Index into RAG Database</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Indexed Documents Table (Right 8 columns) */}
          <div className="lg:col-span-8 bg-white border border-slate-150 p-6 rounded-3xl shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
              <Database className="h-5 w-5 text-[#0A315C]" />
              <span>Indexed Knowledge Library</span>
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
                <span className="text-xs text-slate-400 font-medium">Fetching database vectors...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <FileCode className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No documents indexed in MongoDB yet.</p>
                <p className="text-[10px] text-slate-400 mt-1">Upload banking guidelines to train the AI Assistant.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
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
                        
                        {/* Title */}
                        <td className="py-4 pl-2 font-bold text-slate-900 max-w-[150px] truncate" title={doc.title}>
                          {doc.title}
                        </td>
                        
                        {/* Source Filename */}
                        <td className="py-4 font-mono text-[10px] text-slate-450 truncate max-w-[120px]" title={doc._id}>
                          {doc._id}
                        </td>

                        {/* Category */}
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            doc.category === 'Loans' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            doc.category === 'Deposits' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            doc.category === 'Government Schemes' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            'bg-slate-50 text-slate-600 border border-slate-100'
                          }`}>
                            {doc.category}
                          </span>
                        </td>

                        {/* Chunks count */}
                        <td className="py-4 text-center font-bold text-[#0A315C]">
                          {doc.chunkCount}
                        </td>

                        {/* Actions */}
                        <td className="py-4 text-right pr-2 space-x-2 shrink-0">
                          <button
                            onClick={() => handleViewChunks(doc)}
                            className="p-1.5 bg-slate-50 hover:bg-[#0A315C] text-slate-550 hover:text-white rounded-lg border border-slate-150 transition-colors cursor-pointer inline-flex items-center justify-center"
                            title="View document chunks"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(doc._id)}
                            disabled={deletingId === doc._id}
                            className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white rounded-lg border border-rose-100 hover:border-rose-600 transition-colors cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                            title="Delete document"
                          >
                            {deletingId === doc._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
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

      {/* VIEW CHUNKS MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-150 shadow-2xl animate-scale-up relative flex flex-col max-h-[85vh]">
            
            <button 
              onClick={() => setSelectedDoc(null)} 
              className="absolute top-5 right-5 text-slate-450 hover:text-slate-655 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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

            <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-center text-[10px] text-slate-400 font-bold shrink-0">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Uploaded: {new Date(selectedDoc.createdAt).toLocaleDateString()}</span>
              </span>
              <span>Total: {docChunks.length} chunks</span>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
