import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ 
  isOpen, 
  message, 
  type = 'info', 
  onClose,
  onConfirm,
  confirmText = 'Ya',
  cancelText = 'Batal'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'success': return 'text-primary border-primary/30';
      case 'error': return 'text-error border-error/30';
      default: return 'text-secondary border-secondary/30';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`bg-[#1c1b1b] border ${getColorClass()} p-8 rounded-xl shadow-2xl max-w-sm w-full transform scale-100 transition-transform`}>
        <div className="flex flex-col items-center text-center space-y-4">
          <span className={`material-symbols-outlined text-6xl ${getColorClass().split(' ')[0]}`}>
            {getIcon()}
          </span>
          <h3 className="font-headline text-xl font-bold text-on-surface">
            {onConfirm ? 'Konfirmasi' : (type === 'success' ? 'Berhasil' : type === 'error' ? 'Kesalahan' : 'Informasi')}
          </h3>
          <p className="text-secondary font-body text-sm leading-relaxed">{message}</p>
          
          {onConfirm ? (
            <div className="flex gap-3 w-full mt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-on-surface font-bold py-3 px-4 rounded-lg transition-colors border border-outline-variant/30 uppercase tracking-widest text-xs"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 bg-primary text-[#3d2f00] hover:brightness-110 font-bold py-3 px-4 rounded-lg transition-colors uppercase tracking-widest text-xs"
              >
                {confirmText}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="mt-4 w-full bg-[#2a2a2a] hover:bg-[#353534] text-on-surface font-bold py-3 px-6 rounded-lg transition-colors border border-outline-variant/50 uppercase tracking-widest text-xs"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
