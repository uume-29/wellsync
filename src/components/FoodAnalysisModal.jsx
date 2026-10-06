import React, { useState } from 'react';
import { X, Camera, Sparkles, CheckCircle2, RefreshCw, Upload, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function FoodAnalysisModal({ isOpen, onClose }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('avocado_toast');

  if (!isOpen) return null;

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setResult(null);
    try {
      const data = await api.foodVision.analyzeImage(null);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF4E8] text-[#D9A441] flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1E293B]">Food Intelligence Vision AI</h3>
            <p className="text-xs text-[#64748B]">Simulate meal photo analysis & macro breakdown</p>
          </div>
        </div>

        {/* Upload Zone Simulation */}
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-[#F8FAF7] mb-6">
          <div className="w-12 h-12 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center mb-3 text-[#6B8E7B]">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#1E293B] mb-1">Upload a meal photo or select sample</p>
          <p className="text-[11px] text-[#64748B] mb-4">PNG, JPG up to 10MB</p>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 bg-[#6B8E7B] hover:bg-[#567564] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Nutrients...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D9A441]" /> Run AI Vision Extraction
              </>
            )}
          </button>
        </div>

        {/* Results Screen */}
        {result && (
          <div className="bg-[#EBF1ED]/70 rounded-2xl p-5 border border-[#6B8E7B]/30 space-y-4 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-3 border-b border-[#6B8E7B]/20">
              <span className="text-sm font-extrabold text-[#1E293B]">{result.foodName}</span>
              <span className="text-xs font-bold text-white bg-[#6B8E7B] px-2.5 py-1 rounded-full">
                {result.calories} kcal
              </span>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl">
                <span className="text-[10px] text-[#64748B] block font-semibold">Protein</span>
                <span className="text-xs font-bold text-[#1E293B]">{result.macros.protein}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl">
                <span className="text-[10px] text-[#64748B] block font-semibold">Carbs</span>
                <span className="text-xs font-bold text-[#1E293B]">{result.macros.carbs}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl">
                <span className="text-[10px] text-[#64748B] block font-semibold">Fats</span>
                <span className="text-xs font-bold text-[#1E293B]">{result.macros.healthyFats}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl">
                <span className="text-[10px] text-[#64748B] block font-semibold">Fiber</span>
                <span className="text-xs font-bold text-[#1E293B]">{result.macros.fiber}</span>
              </div>
            </div>

            {/* Micronutrients */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-[#1E293B]">Key Micronutrients:</span>
              {result.micronutrients.map((micro, idx) => (
                <span key={idx} className="text-[10px] bg-white text-[#6B8E7B] font-semibold px-2 py-0.5 rounded border border-[#6B8E7B]/20">
                  {micro}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
              <span>Glycemic Load: <strong className="text-[#1E293B]">{result.glycemicImpact}</strong></span>
              <span>Vision Confidence: <strong className="text-[#6B8E7B]">{Math.round(result.confidence * 100)}%</strong></span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
