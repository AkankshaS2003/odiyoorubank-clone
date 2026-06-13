import sys
import re

with open('src/pages/AdminPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove replyMessageId states and add branch modal states
content = content.replace(
'''  // Email Reply State
  const [replyMessageId, setReplyMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');''',
'''  const [adminBranches, setAdminBranches] = useState<any[]>([]);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: '', address: '', phone: '' });'''
)

# 2. Add fetchBranches to useEffect
content = content.replace(
'''    fetchDocuments();
    loadCmsState();
    loadAuditLogs();
    fetchAdminReviews();
  }, []);''',
'''    fetchDocuments();
    fetchBranches();
    loadCmsState();
    loadAuditLogs();
    fetchAdminReviews();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setAdminBranches(res.data);
    } catch (err) {
      console.error('Failed to fetch branches', err);
    }
  };'''
)

# 3. Remove handleReplySubmit
content = re.sub(r'  const handleReplySubmit = async.*?};\n', '', content, flags=re.DOTALL)

# 4. Replace reply button
content = content.replace(
'''                              <button 
                                onClick={() => {
                                  setReplyMessageId(msg._id);
                                  setReplyText(`Hi ${msg.name},\\n\\nRegarding your message:\\n"${msg.message}"\\n\\n`);
                                }}
                                className="mt-2 text-[10px] text-primary font-bold hover:underline inline-block"
                              >
                                Reply via Email
                              </button>''',
'''                              <a 
                                href={`mailto:${msg.email}?subject=${encodeURIComponent('Reply to your inquiry at Odiyooru Bank')}&body=${encodeURIComponent(`Hi ${msg.name},\\n\\nRegarding your message:\\n"${msg.message}"\\n\\n`)}`}
                                className="mt-2 text-[10px] text-primary font-bold hover:underline inline-block"
                              >
                                Reply via Email
                              </a>'''
)

# 5. Replace Reply Modal rendering
content = re.sub(r'      \{\/\* REPLY MODAL \*\/\}.*?      \)\}\n', '', content, flags=re.DOTALL)

# 6. Replace adminBranches rendering
branch_ui_target = '''                <div className="space-y-4">
                  {adminBranches.map((branch, idx) => (
                    <div key={idx} className={`p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex justify-between items-center ${branch.status === 'Simulated' ? 'opacity-60' : ''}`}>
                      <div>
                        <p className="font-extrabold text-slate-800 uppercase">{branch.name}</p>
                        <p className="text-slate-450 mt-0.5">{branch.address}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${branch.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-655'}`}>
                        {branch.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const newBranch = window.prompt("Enter the name of the new branch:");
                    if (newBranch) {
                      setAdminBranches([...adminBranches, { name: newBranch, address: 'Pending location configuration', status: 'Active' }]);
                    }
                  }}
                  className="mt-6 px-4 py-2.5 bg-[#ED7F1E] hover:bg-[#d66a10] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register Society Branch</span>
                </button>'''

branch_ui_replacement = '''                <div className="space-y-4">
                  {adminBranches.map((branch, idx) => (
                    <div key={branch._id || idx} className={`p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex flex-col space-y-3 ${!branch.isPublished ? 'opacity-60' : ''}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-extrabold text-slate-800 uppercase">{branch.name}</p>
                          <p className="text-slate-450 mt-0.5">{branch.address}</p>
                          <p className="text-slate-450 mt-0.5">Phone: {branch.phone}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${branch.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-655'}`}>
                          {branch.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={async () => {
                            try {
                              await api.put(`/branches/${branch._id}`, { isPublished: !branch.isPublished });
                              fetchBranches();
                              addAuditLog(`${branch.isPublished ? 'Unpublished' : 'Published'} branch: ${branch.name}`);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition-colors ${branch.isPublished ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'}`}
                        >
                          {branch.isPublished ? 'Unpublish' : 'Add (Publish)'}
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Delete this branch?')) {
                              try {
                                await api.delete(`/branches/${branch._id}`);
                                fetchBranches();
                                addAuditLog(`Deleted branch: ${branch.name}`);
                              } catch (e) {
                                console.error(e);
                              }
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[10px] uppercase transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsBranchModalOpen(true)}
                  className="mt-6 px-4 py-2.5 bg-[#ED7F1E] hover:bg-[#d66a10] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register Society Branch</span>
                </button>'''

content = content.replace(branch_ui_target, branch_ui_replacement)

# 7. Add Branch Modal at the end
branch_modal = '''      {/* BRANCH MODAL */}
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
              } catch (e) {
                console.error(e);
              } finally {
                setActionLoading(false);
              }
            }}>
              <div className="space-y-3">
                <input required type="text" placeholder="Branch Name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} />
                <input required type="text" placeholder="Branch Address" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs" value={branchForm.address} onChange={e => setBranchForm({...branchForm, address: e.target.value})} />
                <input required type="text" placeholder="Phone Number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0A315C] text-xs" value={branchForm.phone} onChange={e => setBranchForm({...branchForm, phone: e.target.value})} />
              </div>
              <button disabled={actionLoading} type="submit" className="mt-4 px-6 py-2.5 bg-[#0A315C] hover:bg-[#051C36] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 w-full">
                {actionLoading ? 'Saving...' : 'Register Branch'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};'''

content = content.replace('''    </div>\n  );\n};''', branch_modal)

with open('src/pages/AdminPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
