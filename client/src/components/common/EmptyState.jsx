import {
  Inbox,
} from "lucide-react";


function EmptyState({
  title = "No data found",
  message = "There is nothing to display here.",
  actionLabel,
  onAction,
}) {

  return (
    <div className="empty-state">

      <div className="empty-state-icon">

        <Inbox
          size={25}
        />

      </div>


      <h3>
        {title}
      </h3>


      <p>
        {message}
      </p>


      {actionLabel &&
        onAction && (

          <button
            className="primary-button"
            onClick={onAction}
          >
            {actionLabel}
          </button>

        )}

    </div>
  );
}


export default EmptyState;