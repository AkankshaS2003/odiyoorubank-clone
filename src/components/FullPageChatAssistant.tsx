import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Landmark, User, ShieldAlert, BookOpen, Clock, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  sources?: Array<{
    title: string;
    category: string;
    source: string;
    score?: number;
  }>;
}

export const FullPageChatAssistant: React.FC = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load chat history upon component mount
  useEffect(() => {
    loadHistory();
  }, [isAuthenticated]);

  const loadHistory = async () => {
    setErrorMsg(null);
    try {
      const res = await api.get('/chat/history');
      if (res.data.success && res.data.data.length > 0) {
        const historyList = [...res.data.data].reverse();
        const mappedMessages: ChatMessage[] = [];
        
        historyList.forEach((item: any) => {
          mappedMessages.push({
            sender: 'user',
            text: item.question,
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          mappedMessages.push({
            sender: 'assistant',
            text: item.answer,
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sources: item.sources
          });
        });
        setMessages(mappedMessages);
      } else {
        // Welcome greeting fallback if history is empty
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Failed to load chat history', err);
      setMessages([]);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat body on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/chat', { question: textToSend });
      
      if (res.data.success) {
        const { answer, sources } = res.data.data;
        const assistantMsg: ChatMessage = {
          sender: 'assistant',
          text: answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: sources
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      console.error('Chat assistance error:', err);
      setErrorMsg('Failed to fetch banking logs. Running in offline/development fallback.');
      
      // Fallback local keyword answer generation in case backend server is offline or error triggers
      setTimeout(() => {
        let reply = t('chat_resp_default') || 'Sorry, I could not find that information in the bank records.';
        const prompt = textToSend.toLowerCase();

        if (prompt.includes('fd') || prompt.includes('fixed') || prompt.includes('deposit') || prompt.includes('rate')) {
          reply = t('chat_resp_fd') || 'Fixed deposit interest rates are updated to 8.50% p.a. for standard accounts and up to 9.00% for society shareholders.';
        } else if (prompt.includes('gold') || prompt.includes('loan') || prompt.includes('home') || prompt.includes('interest')) {
          reply = t('chat_resp_gold') || 'Cooperative loans include Home Loans starting at 8.5% p.a. and Vehicle Loans at 9.5% p.a.';
        } else if (prompt.includes('time') || prompt.includes('hour') || prompt.includes('open') || prompt.includes('saturday')) {
          reply = t('chat_resp_hours') || 'Bank Timings: Monday-Friday 9:30 AM to 4:30 PM, Saturday 9:30 AM to 1:30 PM.';
        } else if (prompt.includes('hello') || prompt.includes('hi') || prompt.includes('hey')) {
          reply = t('chat_resp_hello') || 'Hello! How can I assist you with bank details today?';
        }

        const assistantMsg: ChatMessage = {
          sender: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: [{ title: 'Offline Fallback Registry', category: 'General', source: 'offline_local_mode' }]
        };
        setMessages(prev => [...prev, assistantMsg]);
        setIsTyping(false);
      }, 700);
    } finally {
      setIsTyping(false);
    }
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    handleSendMessage(messageText);
    setMessageText('');
  };

  const suggestions = [
    { label: 'FD Interest Rates', text: 'What is the interest rate for FD deposits?', desc: 'Check our latest 8.50% interest rates' },
    { label: 'Apply for Home Loan', text: 'What are the required documents and interest rate for a home loan?', desc: 'View criteria and documents required' },
    { label: 'Bank Timings', text: 'What are the bank timings and operational hours?', desc: 'Check opening hours and Saturday schedule' },
    { label: 'Society Share Capital', text: 'How can I become a member of the cooperative society?', desc: 'Membership guidelines and details' }
  ];

  return (
    <div className="flex w-full min-h-[calc(100vh-5rem-4.5rem)] bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Desktop only */}
      <div className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-200 p-6 shrink-0 justify-between">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-150">
            <div className="h-10 w-10 rounded-xl bg-[#0A315C] flex items-center justify-center">
              <Landmark className="h-5 w-5 text-[#ED7F1E]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0A315C] text-sm tracking-tight">Cooperative AI</h3>
              <span className="text-[10px] text-slate-400 font-bold block">RAG-Powered Portal</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">System Information</h4>
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-[#0A315C] font-bold text-[11px]">Knowledge Base Live</p>
                  <p className="text-[9px] text-slate-400">Verified policies uploaded</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-2.5">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-[#0A315C] font-bold text-[11px]">Real-Time Responses</p>
                  <p className="text-[9px] text-slate-400">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Quick Instructions</h4>
            <div className="space-y-2 text-[11px] leading-relaxed text-slate-500 font-medium">
              <p>1. Type your query regarding deposit schemes, loans, interest rates, or society guidelines.</p>
              <p>2. The AI searches verified society documents to supply exact answers.</p>
              <p>3. Sources will be cited at the bottom of matching responses.</p>
            </div>
          </div>
        </div>

        {/* Auth status panel */}
        <div className="pt-4 border-t border-slate-150">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
              <User className="h-8 w-8 text-emerald-600 bg-white p-1 rounded-full border border-emerald-100 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs font-extrabold text-emerald-800 truncate capitalize">{user.fullName || 'Member'}</p>
                <span className="text-[9px] font-bold text-emerald-600 block uppercase">{user.role} Account</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 bg-amber-50 border border-amber-100 p-3 rounded-2xl">
              <ShieldAlert className="h-8 w-8 text-amber-600 bg-white p-1.5 rounded-full border border-amber-100 shrink-0" />
              <div>
                <p className="text-xs font-extrabold text-amber-800">Guest Session</p>
                <span className="text-[9px] font-bold text-amber-600 block uppercase">Chats not saved to profile</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col h-[calc(100vh-5rem-4.5rem)] overflow-hidden">
        {/* Top Header details - Mobile only */}
        <div className="lg:hidden bg-[#0A315C] p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <Landmark className="h-5 w-5 text-[#ED7F1E]" />
            <div>
              <h4 className="font-extrabold text-sm">{t('chat_title') || 'Cooperative AI Assistant'}</h4>
              <span className="text-[10px] text-emerald-400 font-bold block flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-1"></span>
                <span>Online • Verified Sources</span>
              </span>
            </div>
          </div>
          <div className="text-xs font-bold px-2.5 py-1 bg-white/10 rounded-lg">
            {isAuthenticated ? 'Member' : 'Guest'}
          </div>
        </div>

        {/* Message body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 custom-scrollbar flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-auto p-6 space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-[#0A315C] flex items-center justify-center shadow-xl animate-bounce">
                <Landmark className="h-8 w-8 text-[#ED7F1E]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#0A315C] tracking-tight">
                  {t('welcome_title') || 'Welcome to Odiyooru Souharda Cooperative Bank'}
                </h2>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  How can I help you today? Ask me questions about our fixed deposit schemes, loan eligibility, document checklists, branch locations, and society guidelines.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sug.text)}
                    className="p-4 bg-white hover:bg-[#0A315C]/5 text-left border border-slate-200 rounded-2xl shadow-sm hover:border-[#0A315C]/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <p className="text-xs font-extrabold text-[#0A315C]">{sug.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal">{sug.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl w-full mx-auto space-y-6">
              {/* Initial welcome placeholder on top of active messages */}
              <div className="text-center py-4 border-b border-slate-150 mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Beginning of Verified AI Support Session</p>
              </div>

              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start space-x-3.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
                >
                  {/* Avatar Icon */}
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm ${msg.sender === 'user' ? 'bg-[#ED7F1E]' : 'bg-[#0A315C] border border-[#0A315C]/10'}`}>
                    {msg.sender === 'user' ? <User className="h-4.5 w-4.5" /> : <Landmark className="h-4.5 w-4.5 text-[#ED7F1E]" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1">
                    <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-[#0A315C] text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}>
                      <div className="whitespace-pre-wrap font-semibold">{msg.text}</div>
                      
                      {/* Citations Footer */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3.5 pt-2.5 border-t border-slate-100 space-y-1.5">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                            <BookOpen className="h-3.5 w-3.5 text-slate-400 mr-0.5" />
                            <span>Verified Bank References:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {Array.from(new Set(msg.sources.map(s => s.title))).map((title, sIdx) => {
                              const matchingSource = msg.sources!.find(s => s.title === title);
                              return (
                                <span 
                                  key={sIdx} 
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#0A315C]/5 text-[#0A315C] border border-[#0A315C]/10 text-[9px] font-extrabold truncate max-w-[200px]" 
                                  title={`Source document: ${matchingSource?.source || 'policy'}`}
                                >
                                  {title}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block text-right px-2">{msg.time}</span>
                  </div>
                </div>
              ))}

              {/* Typing loader */}
              {isTyping && (
                <div className="flex items-start space-x-3.5 max-w-[85%]">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-[#0A315C] border border-[#0A315C]/10 text-white text-xs font-bold shadow-sm">
                    <Landmark className="h-4.5 w-4.5 text-[#ED7F1E]" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="p-3.5 bg-white border border-slate-200 rounded-3xl rounded-tl-none shadow-sm flex items-center space-x-2 py-5 px-6">
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Suggestion tags bar (shown when messages exist) */}
        {messages.length > 0 && (
          <div className="px-4 py-3 bg-slate-100 border-t border-slate-200 flex space-x-2 overflow-x-auto scrollbar-none text-[11px] font-extrabold text-slate-600 shrink-0 select-none justify-center">
            {suggestions.slice(0, 3).map((tag, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(tag.text)}
                className="px-3.5 py-1.5 bg-white hover:bg-[#0A315C]/5 hover:text-[#0A315C] rounded-full border border-slate-200 shrink-0 transition-colors cursor-pointer shadow-sm"
              >
                {tag.label}
              </button>
            ))}
          </div>
        )}

        {/* Error notification banner */}
        {errorMsg && (
          <div className="px-6 py-2.5 bg-rose-50 border-t border-rose-100 text-rose-800 text-xs font-bold flex items-center space-x-2 shrink-0">
            <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Message input area */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={onSubmitForm} className="max-w-4xl mx-auto flex items-center space-x-3">
            <input
              type="text"
              placeholder={t('chat_placeholder') || 'Ask about interest rates, loans, cooperative guidelines...'}
              className="flex-1 px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:ring-1 focus:ring-[#0A315C] focus:border-[#0A315C] focus:outline-none placeholder-slate-400 text-slate-800 font-semibold"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button
              type="submit"
              disabled={isTyping}
              className="p-3.5 bg-[#0A315C] hover:bg-[#051C36] text-white rounded-2xl shadow-md transition-colors flex items-center justify-center cursor-pointer disabled:bg-slate-300 shrink-0"
            >
              <Send className="h-4.5 w-4.5 text-[#ED7F1E]" />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
            AI Assistant queries are logged for policy research and cooperative bank analytics.
          </p>
        </div>
      </div>
    </div>
  );
};
