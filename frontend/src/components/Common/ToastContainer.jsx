import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ toast, onRemove }) => {
  const { id, message, type } = toast;

  const icons = {
    success: <CheckCircle size={18} className="text-success" />,
    error: <AlertCircle size={18} className="text-danger" />,
    info: <Info size={18} className="text-primary" />,
  };

  const borderColors = {
    success: 'border-l-success',
    error: 'border-l-danger',
    info: 'border-l-primary',
  };

  return (
    <div className={`toast-item ${type}`} onClick={() => onRemove(id)}>
      <div className="toast-icon">
        {icons[type] || icons.info}
      </div>
      <div className="toast-content">
        {message}
      </div>
      <button className="toast-close" onClick={(e) => { e.stopPropagation(); onRemove(id); }}>
        <X size={14} />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
