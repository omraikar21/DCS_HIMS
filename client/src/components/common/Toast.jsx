import {
  CheckCircle,
  AlertCircle,
  Info,
  X,
} from "lucide-react";


function Toast({
  notification,
  onClose,
}) {

  if (!notification) {

    return null;

  }


  const {
    type,
    message,
  } = notification;


  const icons = {

    success: (
      <CheckCircle size={18} />
    ),

    error: (
      <AlertCircle size={18} />
    ),

    info: (
      <Info size={18} />
    ),

  };


  return (
    <div
      className={`toast toast-${type}`}
    >

      {icons[type]}

      <span>
        {message}
      </span>

      <button
        onClick={onClose}
        className="toast-close"
      >

        <X size={15} />

      </button>

    </div>
  );
}


export default Toast;