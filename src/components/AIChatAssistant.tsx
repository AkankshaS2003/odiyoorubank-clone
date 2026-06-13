import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Landmark, User, ShieldAlert, BookOpen, Maximize, Minimize } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
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

export const AIChatAssistant: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Simple Markdown formatter for the bot's text
  const formatMarkdown = (text: string) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#0A315C]">$1</strong>');
    formatted = formatted.replace(/^\*\s+(.*)$/gm, '<div class="flex items-start mt-1"><span class="mr-2 text-[#ED7F1E] font-black">•</span><span>$1</span></div>');
    return formatted;
  };

  // Initialize and load chat history upon component mount
  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

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
            time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        });
        setMessages(mappedMessages);
      } else {
        // Welcome greeting fallback if history is empty
        setMessages([
          {
            sender: 'assistant',
            text: t('welcome_msg') || 'Welcome to Odiyooru Cooperative Bank. How can I help you today?',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      console.error('Failed to load chat history', err);
      // Fallback greeting if history request fails (e.g. before token setup)
      setMessages([
        {
          sender: 'assistant',
          text: t('welcome_msg') || 'Welcome to Odiyooru Cooperative Bank. How can I help you today?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat body on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isTyping) return;

    const currentText = messageText;
    const userMsg: ChatMessage = {
      sender: 'user',
      text: currentText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setMessageText('');
    setIsTyping(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/chat', { question: currentText });
      
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
      
      // Fallback local keyword answer generation in case backend server is down or error triggers
      setTimeout(() => {
        let reply = t('chat_resp_default') || 'Sorry, I could not find that information in the bank records.';
        const prompt = currentText.toLowerCase();

        if (prompt.includes('fd') || prompt.includes('fixed') || prompt.includes('deposit') || prompt.includes('rate')) {
          reply = t('chat_resp_fd') || 'Fixed deposit rates start from 4.5% up to 9.00% for society shareholders.';
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
      return;
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 select-none">
      
      {/* Floating Chat Circle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-[#0A315C] hover:bg-[#051C36] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all animate-float cursor-pointer border border-[#0A315C]/20"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="h-6 w-6 text-[#ED7F1E]" />
        </button>
      )}

      {/* Floating Chat Dialogue Window */}
      {isOpen && (
        <div className={`bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-scale-up ${isFullScreen ? 'fixed inset-2 md:inset-6 z-[9999]' : 'w-80 md:w-[420px] h-[520px]'}`}>
          
          {/* Header */}
          <div className="bg-[#0A315C] p-4 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <Landmark className="h-5 w-5 text-[#ED7F1E]" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm">{t('chat_title') || 'Cooperative AI Assistant'}</h4>
                <span className="text-[10px] text-emerald-400 font-bold block flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-1"></span>
                  <span>{t('chat_status') || 'Online • Verified Bank Records'}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex items-start space-x-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold shadow-sm ${msg.sender === 'user' ? 'bg-[#ED7F1E]' : 'bg-[#0A315C] border border-[#0A315C]/10'}`}>
                  {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Landmark className="h-3.5 w-3.5 text-[#ED7F1E]" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-0.5">
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#0A315C] text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none shadow-[0_2px_8px_rgb(0,0,0,0.04)]'
                  }`}>
                    {/* Answer text */}
                    {msg.sender === 'user' ? (
                      <div className="whitespace-pre-wrap font-semibold">{msg.text}</div>
                    ) : (
                      <div className="whitespace-pre-wrap font-medium" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />
                    )}
                    
                    {/* Citations Footer */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                          <BookOpen className="h-3 w-3 text-slate-400 mr-0.5" />
                          <span>Bank References:</span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {Array.from(new Set(msg.sources.map(s => s.title))).map((title, sIdx) => {
                            const matchingSource = msg.sources!.find(s => s.title === title);
                            return (
                              <span 
                                key={sIdx} 
                                className="inline-flex items-center px-2 py-0.5 rounded bg-[#0A315C]/5 text-[#0A315C] border border-[#0A315C]/10 text-[8.5px] font-bold truncate max-w-[170px]" 
                                title={`Source: ${matchingSource?.source || 'policy'}`}
                              >
                                {title}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                  <span className="text-[9px] text-slate-400 font-medium block text-right px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Bouncing Typing Loader */}
            {isTyping && (
              <div className="flex items-start space-x-2.5 max-w-[85%]">
                <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 bg-[#0A315C] border border-[#0A315C]/10 text-white text-[10px] font-bold shadow-sm">
                  <Landmark className="h-3.5 w-3.5 text-[#ED7F1E]" />
                </div>
                <div className="space-y-0.5">
                  <div className="p-3 bg-white border border-slate-150 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1.5 py-4">
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Bubbles */}
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-150 flex space-x-1.5 overflow-x-auto scrollbar-none text-[10px] font-bold text-slate-600 shrink-0 select-none">
            {[
              { label: t('chat_suggest_fd') || 'FD Rates', text: 'What is the interest rate for FD deposits?' },
              { label: t('chat_suggest_gold') || 'Home Loan', text: 'What are the required documents and interest rate for a home loan?' },
              { label: 'Timings', text: 'What are the bank timings and operational hours?' },
              { label: 'Vehicle Loan', text: 'What documents are required for a vehicle loan?' }
            ].map((tag, i) => (
              <button
                key={i}
                onClick={() => {
                  setMessageText(tag.text);
                }}
                className="px-3 py-1 bg-white hover:bg-[#0A315C]/5 hover:text-[#0A315C] rounded-full border border-slate-200 shrink-0 transition-colors cursor-pointer"
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Error notifications */}
          {errorMsg && (
            <div className="px-4 py-2 bg-rose-50 border-t border-rose-100 text-rose-800 text-[10px] font-bold flex items-center space-x-2 shrink-0">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chat Form Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-150 bg-white flex items-center space-x-2 shrink-0">
            <input
              type="text"
              placeholder={t('chat_placeholder') || 'Ask me about timings, loans, deposits...'}
              className="flex-1 px-3.5 py-2.5 text-xs border border-slate-250 rounded-xl focus:ring-1 focus:ring-[#0A315C] focus:border-[#0A315C] focus:outline-none placeholder-slate-400 text-slate-800 font-semibold"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button
              type="submit"
              disabled={isTyping}
              className="p-3 bg-[#0A315C] hover:bg-[#051C36] text-white rounded-xl shadow transition-colors flex items-center justify-center cursor-pointer disabled:bg-slate-300"
            >
              <Send className="h-4 w-4 text-[#ED7F1E]" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
