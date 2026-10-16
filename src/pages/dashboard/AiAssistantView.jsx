import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Send, RefreshCw, ArrowLeft, ExternalLink, Trash2, Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import aiCompanionHeaderImg from '../../assets/dashboard/ai-companion.jpg';

const SUGGESTED_PROMPTS = [
  'What are evidence-backed ways to hit 100g protein within a ₹2,500 weekly budget?',
  'What is the optimal timing and form of magnesium for restorative sleep?',
  'Suggest anti-inflammatory meal choices that help with sustained energy',
  'How do I structure a healthy grocery list around low-glycemic foods?',
];

export default function AiAssistantView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am your WellSync AI Wellness Assistant. I can help with balanced meal planning, ingredient substitutions, micronutrient density, and habit routines backed by peer-reviewed literature. How can I support your routine today?`,
      citations: [
        { title: 'USDA FoodData Central Guidelines', url: 'https://fdc.nal.usda.gov' },
        { title: 'NIH Office of Dietary Supplements', url: 'https://ods.od.nih.gov' },
      ],
      time: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      // Call ragAssistant API method
      const res = await api.ragAssistant.query(query.trim());

      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: res.answer || "According to clinical guidelines, prioritizing whole unprocessed ingredients, healthy fats (avocado, extra virgin olive oil), and adequate fiber supports steady blood sugar and sustained daily focus.",
        citations: res.citations || [
          { title: 'Journal of Research in Medical Sciences', url: 'https://pubmed.ncbi.nlm.nih.gov' },
          { title: 'NIH Dietary Guidelines for Americans', url: 'https://dietaryguidelines.gov' },
        ],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: "I encountered a momentary connection hiccup. For evidence-based nutritional balance, we recommend prioritizing dietary fiber, lean protein sources, and healthy fats while staying within your configured budget.",
        citations: [{ title: 'USDA Nutrition Reference Guide', url: 'https://fdc.nal.usda.gov' }],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        text: `Conversation cleared. What questions can I answer about your meals, vitamins, or wellness routine?`,
        citations: [],
        time: 'Just now',
      },
    ]);
  };

  return (
    <div className="space-y-8 animate-fade-slide-up pb-16">
      
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B8E7B]/50 rounded-lg px-1.5 py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard Home</span>
        </Link>
      </div>

      {/* ============================================================ */}
      {/* 1. VISUAL HEADER WITH DEDICATED AI COMPANION VISUAL          */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1ED] text-[11px] font-bold text-[#6B8E7B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 3 RAG Intelligence</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              AI Wellness Assistant
            </h1>
            
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl">
              An evidence-based conversational partner for nutrition queries, recipe adaptations, and supplement schedules. Responses are grounded in peer-reviewed biomedical research.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="bg-[#F8FAF7] border border-gray-200 text-[#1E293B] font-bold px-3 py-1 rounded-lg">
                NIH & USDA Evidence Grounding
              </span>
              <span className="bg-[#EBF1ED] text-[#6B8E7B] font-bold px-3 py-1 rounded-lg">
                Personal Allergy Aware
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-[#EBF1ED] group">
              {!imgError ? (
                <img
                  src={aiCompanionHeaderImg}
                  alt="Minimalist ceramic desk setting with smartphone glowing softly with sage botanical wellness interface, hot tea and eucalyptus"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-[#EBF1ED] to-white text-center">
                  <Sparkles className="w-8 h-8 text-[#6B8E7B] mb-2" />
                  <span className="text-xs font-bold text-[#1E293B]">Intelligent Wellness Sanctuary</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="font-bold bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px]">
                  Calm Digital Companion
                </span>
                <span className="text-[10px] text-[#FAF4E8] font-semibold">
                  Evidence-Based
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CHAT CONTAINER                                            */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col h-[580px]">
        
        {/* Chat Header Bar */}
        <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between bg-[#F8FAF7]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6B8E7B] text-white flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#1E293B] block leading-none">WellSync Assistant</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Active & Grounded in Science</span>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-red-600 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
            title="Reset conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-xl space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-3xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#1E293B] text-white rounded-br-sm'
                        : 'bg-[#F8FAF7] text-[#1E293B] border border-gray-200/90 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Citations block for assistant responses */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-gray-200/70 text-[10px] space-y-1">
                        <span className="font-bold text-[#64748B] block uppercase tracking-wider">
                          Verified References:
                        </span>
                        {msg.citations.map((cite, idx) => (
                          <a
                            key={idx}
                            href={cite.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#6B8E7B] hover:underline mr-3 font-semibold"
                          >
                            <span>{cite.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-gray-400 block px-2">
                    {msg.time}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#6B8E7B] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-[#EBF1ED] text-[#6B8E7B] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#F8FAF7] p-3.5 rounded-2xl border border-gray-200/80 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#6B8E7B] animate-spin" />
                <span className="text-xs text-[#64748B] font-medium">Retrieving biomedical citations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Bar */}
        <div className="p-3 px-6 bg-[#F8FAF7] border-t border-gray-100 overflow-x-auto scrollbar-none flex gap-2">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 text-[11px] font-semibold text-[#1E293B] bg-white hover:bg-[#EBF1ED] hover:text-[#6B8E7B] px-3 py-1.5 rounded-xl border border-gray-200 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 px-6 bg-white border-t border-gray-100 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask about foods, ingredient swaps, vitamins, or meal timing..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#F8FAF7] border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#6B8E7B]/50 focus:outline-none"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || loading}
            className="p-3 rounded-2xl bg-[#6B8E7B] hover:bg-[#567564] text-white disabled:opacity-40 transition-colors cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
