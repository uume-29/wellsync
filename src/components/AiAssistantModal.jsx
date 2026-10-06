import React, { useState } from 'react';
import { X, Sparkles, Send, BookOpen, ShieldCheck, Database, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function AiAssistantModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("What are evidence-backed dietary sources of omega-3s for anti-inflammatory wellness?");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await api.ragAssistant.query(query);
      setResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
        
        {/* Close */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#1E293B] text-[#D9A441] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1E293B]">Grounded AI Wellness Query</h3>
            <p className="text-xs text-[#64748B]">RAG-retrieved answers from peer-reviewed literature</p>
          </div>
        </div>

        {/* Query Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a wellness question..."
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:border-[#6B8E7B] focus:ring-2 focus:ring-[#6B8E7B]/20 outline-none text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#6B8E7B] text-white flex items-center justify-center hover:bg-[#567564] cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Loading / Answer State */}
        {loading && (
          <div className="p-8 text-center bg-[#F8FAF7] rounded-2xl">
            <RefreshCw className="w-6 h-6 text-[#6B8E7B] animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold text-[#1E293B]">Retrieving citations & running safety checks...</p>
          </div>
        )}

        {response && !loading && (
          <div className="bg-[#1E293B] text-white rounded-2xl p-5 space-y-4 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 text-xs">
              <span className="flex items-center gap-1.5 text-[#D9A441] font-semibold">
                <Database className="w-3.5 h-3.5" /> Indexed Knowledge RAG
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Grounding
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              "{response.answer}"
            </p>

            {/* Citations */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Citations & References:</span>
              {response.citations.map((cite, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-[#6B8E7B] font-semibold">
                  <BookOpen className="w-3 h-3 text-[#D9A441]" />
                  <span>{cite.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
