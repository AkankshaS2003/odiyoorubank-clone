import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Landmark, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const AIChatAssistant: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize greeting upon component load or language change
  useEffect(() => {
    setMessages([
      {
        sender: 'assistant',
        text: t('welcome_msg'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [t]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat body
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const prompt = messageText.toLowerCase();
    setMessageText('');

    // Simulated responses based on keyword queries using localized strings
    setTimeout(() => {
      let reply = t('chat_resp_default');

      if (prompt.includes('fd') || prompt.includes('fixed') || prompt.includes('deposit') || prompt.includes('rate') || prompt.includes('ಠೇವಣಿ') || prompt.includes('ब्याज')) {
        reply = t('chat_resp_fd');
      } else if (prompt.includes('gold') || prompt.includes('loan') || prompt.includes('credit') || prompt.includes('ಚಿನ್ನ') || prompt.includes('ऋण')) {
        reply = t('chat_resp_gold');
      } else if (prompt.includes('member') || prompt.includes('share') || prompt.includes('join') || prompt.includes('dividend') || prompt.includes('ಸದಸ್ಯ') || prompt.includes('शेयर')) {
        reply = t('chat_resp_member');
      } else if (prompt.includes('time') || prompt.includes('hour') || prompt.includes('open') || prompt.includes('saturday') || prompt.includes('ಸಮಯ') || prompt.includes('समय')) {
        reply = t('chat_resp_hours');
      } else if (prompt.includes('kyc') || prompt.includes('aadhaar') || prompt.includes('pan') || prompt.includes('ಆಧಾರ್')) {
        reply = t('chat_resp_kyc');
      } else if (prompt.includes('hello') || prompt.includes('hi') || prompt.includes('hey') || prompt.includes('ನಮಸ್ತೆ') || prompt.includes('नमस्ते')) {
        reply = t('chat_resp_hello');
      }

      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    }, 850);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Floating Chat Circle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all animate-float"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Floating Chat Dialogue Window */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[480px] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-scale-up">
          
          {/* Header */}
          <div className="bg-primary p-4.5 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Landmark className="h-4.5 w-4.5 text-secondary" />
              </div>
              <div>
                <h4 className="font-bold text-sm">{t('chat_title')}</h4>
                <span className="text-[10px] text-white/70 font-semibold block">{t('chat_status')}</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex items-start space-x-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold ${msg.sender === 'user' ? 'bg-secondary' : 'bg-primary'}`}>
                  {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Landmark className="h-3.5 w-3.5 text-secondary" />}
                </div>

                <div className="space-y-0.5">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium block text-right px-1">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Bubbles */}
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-150 flex space-x-1.5 overflow-x-auto scrollbar-none text-[10px] font-bold text-slate-600">
            {[
              { label: t('chat_suggest_fd'), text: 'FD Interest Rates' },
              { label: t('chat_suggest_gold'), text: 'Gold Loan Details' },
              { label: t('chat_suggest_member'), text: 'Become a Member' },
              { label: t('chat_suggest_hours'), text: 'Branch Hours' }
            ].map((tag, i) => (
              <button
                key={i}
                onClick={() => {
                  setMessageText(tag.text);
                }}
                className="px-2.5 py-1 bg-white hover:bg-primary/5 hover:text-primary rounded-full border border-slate-200 shrink-0 transition-colors"
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Chat Form Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-150 bg-white flex items-center space-x-2">
            <input
              type="text"
              placeholder={t('chat_placeholder')}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none placeholder-slate-400 text-slate-800"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button
              type="submit"
              className="p-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow transition-colors flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
