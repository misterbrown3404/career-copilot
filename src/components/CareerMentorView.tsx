import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Send, 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  Search, 
  CornerDownRight,
  User,
  Loader2
} from 'lucide-react';
import { CareerMentor, ChatMessage, UserProfile } from '../types';
import { initialMentors } from '../utils/dummyData';
import AIErrorDialog from './AIErrorDialog';

interface CareerMentorViewProps {
  user: UserProfile;
  theme?: 'light' | 'dark';
}

export default function CareerMentorView({ user, theme = 'dark' }: CareerMentorViewProps) {
  const isLight = theme === 'light';

  const [mentors] = useState<CareerMentor[]>(initialMentors);
  const [selectedMentor, setSelectedMentor] = useState<CareerMentor>(initialMentors[0]);
  
  // Store separate chat histories per mentor to preserve context
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    const initial: Record<string, ChatMessage[]> = {};
    initialMentors.forEach(m => {
      initial[m.id] = [
        {
          id: `msg-welcome-${m.id}`,
          sender: 'assistant',
          text: m.greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    });
    return initial;
  });

  // Load chat logs on mount
  useEffect(() => {
    if (!user?.email) return;

    const loadChats = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/user/data', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.chats && Object.keys(data.chats).length > 0) {
            const merged = { ...chatHistories, ...data.chats };
            setChatHistories(merged);
          }
        }
      } catch (err) {
        console.error('Error loading live chat logs:', err);
      }
    };

    loadChats();
  }, [user?.email]);

  // Synchronize chat logs back to server
  const saveChatsToServer = async (updatedChats: Record<string, ChatMessage[]>) => {
    if (!user?.email) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/user/data/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type: 'chats',
          data: updatedChats
        })
      });
    } catch (err) {
      console.error('Failed to save chat logs:', err);
    }
  };

  // Auto-save chats to server whenever history changes
  useEffect(() => {
    if (!user?.email) return;
    
    const hasUserMessages = (Object.values(chatHistories) as ChatMessage[][]).some(history => 
      history.some(msg => msg.sender === 'user')
    );
    if (hasUserMessages) {
      saveChatsToServer(chatHistories);
    }
  }, [chatHistories, user?.email]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState('');

  const activeHistory = chatHistories[selectedMentor.id] || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeHistory, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;
    setLastMessage(textToSend);

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Append user message immediately to the current history
    const updatedHistory = [...activeHistory, userMsg];
    setChatHistories(prev => ({
      ...prev,
      [selectedMentor.id]: updatedHistory
    }));
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini/mentor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          mentorId: selectedMentor.id,
          mentorDetails: selectedMentor
        })
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistories(prev => ({
        ...prev,
        [selectedMentor.id]: [...updatedHistory, assistantMsg]
      }));
    } catch (err: any) {
      console.error('Error conducting mentor consultation:', err);
      setAiError(err?.message || 'The mentor AI service is temporarily unavailable. Please try again.');
      const errorMsg: ChatMessage = {
        id: `msg-error-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistories(prev => ({
        ...prev,
        [selectedMentor.id]: [...updatedHistory, errorMsg]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestClick = (presetText: string) => {
    handleSendMessage(presetText);
  };

  // Dedicated prompt suggestions based on selected mentor's domain
  const suggestionsMap: Record<string, string[]> = {
    'mentor-tech': [
      'What core system questions should I expect at Stripe?',
      'How do I explain microservice bottlenecks in an interview?',
      'Suggest a full stack project to highlight scalability.'
    ],
    'mentor-prod': [
      'How should I structure a Product Sense answer?',
      'How do I answer "What is your favorite product and why"?',
      'Explain key product metrics definitions.'
    ],
    'mentor-hr': [
      'How do I answer: "What is your salary expectation?"',
      'Script a base salary counter-offer request.',
      'How do I explain a 6-month career break?'
    ],
    'mentor-general': [
      'How do I beat imposter syndrome during interviews?',
      'Help me draft a long-term career milestone strategy.',
      'How do I transition from Dev to Lead Architect?'
    ]
  };

  const activeSuggestions = suggestionsMap[selectedMentor.id] || suggestionsMap['mentor-tech'];

  return (
    <div className="space-y-6">
      <AIErrorDialog
        open={!!aiError}
        message={aiError || ''}
        onClose={() => setAiError(null)}
        onRetry={() => handleSendMessage(lastMessage)}
        theme={theme}
      />
      {/* View Header */}
      <div>
        <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${
          isLight ? 'text-neutral-900' : 'text-white'
        }`}>
          <Users className={`w-6 h-6 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
          <span>Career Mentors</span>
        </h1>
        <p className={`text-sm mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-450'}`}>
          Chat with specialized executive consultants in software architecture, product delivery, behavioral strategy, and high-compensation salary negotiations.
        </p>
      </div>

      {/* Main Panel layout: Left selectors, Right active Chatroom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px] items-stretch">
        
        {/* Left Column: Mentors roster */}
        <div className={`lg:col-span-4 border rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto shadow-sm transition-colors ${
          isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}>
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider px-2">Advisory Team Roster</span>
          
          <div className="space-y-2 flex-1">
            {mentors.map((m) => {
              const isSelected = selectedMentor.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMentor(m)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 group focus:outline-none focus:ring-2 cursor-pointer ${
                    isSelected
                      ? isLight 
                        ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                        : 'bg-green-400/10 border-green-400/20 shadow-sm'
                      : isLight 
                      ? 'border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50' 
                      : 'border-neutral-850 hover:border-neutral-700 hover:bg-neutral-950/40'
                  }`}
                  aria-label={`Select career advisor ${m.name}`}
                >
                  <img
                    src={m.avatar}
                    alt={m.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full border border-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-bold text-xs truncate transition-colors ${
                      isLight ? 'text-neutral-900 group-hover:text-indigo-600' : 'text-white group-hover:text-green-400'
                    }`}>
                      {m.name}
                    </h3>
                    <p className="text-[10.5px] text-neutral-500 truncate font-semibold">{m.role}</p>
                    
                    {/* Domain label */}
                    <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider text-neutral-400 mt-1">
                      {m.category === 'tech' ? 'Technical Focus' : m.category === 'product' ? 'Product Sense' : m.category === 'hr' ? 'HR & Salary' : 'Long-term Strategy'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat container */}
        <div className={`lg:col-span-8 border rounded-2xl flex flex-col overflow-hidden shadow-sm transition-colors ${
          isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}>
          
          {/* Active Mentor Header */}
          <div className={`px-5 py-4 border-b flex items-center gap-3 ${
            isLight ? 'border-neutral-100 bg-neutral-50' : 'border-neutral-850 bg-neutral-950'
          }`}>
            <img
              src={selectedMentor.avatar}
              alt={selectedMentor.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border border-slate-200"
            />
            <div className="min-w-0 flex-1">
              <h2 className={`font-bold text-sm leading-none ${isLight ? 'text-neutral-950' : 'text-white'}`}>{selectedMentor.name}</h2>
              <p className="text-[10.5px] text-neutral-500 font-semibold truncate mt-0.5">{selectedMentor.bio}</p>
            </div>
          </div>

          {/* Chat bubbles container */}
          <div className={`flex-1 p-5 overflow-y-auto space-y-4 ${
            isLight ? 'bg-neutral-50/50' : 'bg-neutral-950/20'
          }`}>
            <AnimatePresence initial={false}>
              {activeHistory.map((msg) => {
                const isMe = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-xs border ${
                      isMe 
                        ? 'bg-neutral-100 border-neutral-200 text-neutral-600' 
                        : isLight 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-green-400 border-green-500 text-neutral-950'
                    }`}>
                      {isMe ? <User className="w-4.5 h-4.5" /> : selectedMentor.name[0]}
                    </div>

                    {/* Bubble */}
                    <div className="space-y-1">
                      <div className={`px-4 py-2.5 text-xs rounded-2xl leading-relaxed text-justify ${
                        isMe 
                          ? isLight 
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100' 
                            : 'bg-green-400 text-neutral-950 rounded-tr-none shadow-md'
                          : isLight 
                          ? 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none shadow-sm' 
                          : 'bg-neutral-950 border border-neutral-850 text-white rounded-tl-none shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className={`block text-[9px] text-slate-400 font-bold ${isMe ? 'text-right' : ''}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 max-w-[80%]"
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-xs border ${
                    isLight ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-green-400 border-green-500 text-neutral-950'
                  }`}>
                    {selectedMentor.name[0]}
                  </div>
                  <div className={`border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 ${
                    isLight ? 'bg-white border-neutral-200' : 'bg-neutral-950 border-neutral-850'
                  }`}>
                    <Loader2 className={`w-3.5 h-3.5 animate-spin ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedMentor.name.split(' ')[0]} is typing...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div className={`px-5 py-2.5 border-t flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none ${
            isLight ? 'border-neutral-100 bg-neutral-50' : 'border-neutral-850 bg-neutral-950'
          }`} aria-label="Quick questions suggestion list">
            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${isLight ? 'text-indigo-600' : 'text-green-400'}`} />
              <span>Ask:</span>
            </span>
            {activeSuggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestClick(sug)}
                className={`text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm cursor-pointer transition-all focus:outline-none ${
                  isLight 
                    ? 'text-neutral-700 bg-white border border-neutral-200 hover:border-indigo-300 hover:text-indigo-600' 
                    : 'text-neutral-300 bg-neutral-900 border border-neutral-800 hover:border-green-400 hover:text-green-400'
                }`}
                aria-label={`Ask mentor: ${sug}`}
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Bottom input bar */}
          <div className={`p-4 border-t ${isLight ? 'border-neutral-100 bg-white' : 'border-neutral-850 bg-neutral-950/10'}`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
                className={`flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl border focus:outline-none transition-colors ${
                  isLight 
                    ? 'border-neutral-200 bg-neutral-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-neutral-900' 
                    : 'border-neutral-800 bg-neutral-900 focus:border-green-400 focus:ring-1 focus:ring-green-400 text-white'
                }`}
                placeholder={`Ask ${selectedMentor.name} a career question...`}
                aria-label={`Type message to ${selectedMentor.name}`}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className={`p-3 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                  inputText.trim() && !isTyping
                    ? isLight 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-green-400 hover:bg-green-500 text-neutral-950'
                    : isLight 
                    ? 'bg-neutral-50 text-neutral-400 border border-neutral-200 cursor-not-allowed' 
                    : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <Send className="w-4 h-4 fill-current" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

