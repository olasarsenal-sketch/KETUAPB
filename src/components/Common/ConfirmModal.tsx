import React from 'react';
import { AlertTriangle, Trash2, RotateCcw, X, Check } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  detailNote?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  iconType?: 'trash' | 'reset' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  detailNote,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'danger',
  iconType = 'trash',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className={`p-6 text-center ${
          variant === 'danger' 
            ? 'bg-rose-50 border-b border-rose-100' 
            : variant === 'warning'
            ? 'bg-amber-50 border-b border-amber-100'
            : 'bg-emerald-50 border-b border-emerald-100'
        }`}>
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner ${
            variant === 'danger'
              ? 'bg-rose-100 text-rose-600 ring-4 ring-rose-200/50'
              : variant === 'warning'
              ? 'bg-amber-100 text-amber-600 ring-4 ring-amber-200/50'
              : 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-200/50'
          }`}>
            {iconType === 'trash' && <Trash2 className="w-8 h-8" />}
            {iconType === 'reset' && <RotateCcw className="w-8 h-8" />}
            {iconType === 'warning' && <AlertTriangle className="w-8 h-8" />}
          </div>

          <h3 className="text-lg font-black text-slate-900 leading-snug">
            {title}
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Detail Note if provided */}
        {detailNote && (
          <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-medium leading-relaxed">
            ⚠️ {detailNote}
          </div>
        )}

        {/* Buttons */}
        <div className="p-4 bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-xl text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-700/20'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-700/20'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/20'
            }`}
          >
            {isLoading ? (
              <span className="animate-pulse">Memproses...</span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
