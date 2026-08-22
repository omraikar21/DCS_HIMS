import {
  AlertTriangle,
} from "lucide-react";


function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {

  if (!open) {

    return null;

  }


  return (
    <div className="confirm-overlay">

      <div className="confirm-dialog">

        <div className="confirm-icon">

          <AlertTriangle
            size={24}
          />

        </div>


        <h3>
          {title}
        </h3>


        <p>
          {message}
        </p>


        <div className="confirm-actions">

          <button
            className="secondary-button"
            onClick={onCancel}
          >
            {cancelText}
          </button>


          <button
            className="danger-button"
            onClick={onConfirm}
          >
            {confirmText}
          </button>

        </div>

      </div>

    </div>
  );
}


export default ConfirmDialog;