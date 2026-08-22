import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";


function ErrorMessage({
  message = "Something went wrong.",
  onRetry,
}) {

  return (
    <div className="error-state">

      <div className="error-state-icon">

        <AlertCircle
          size={24}
        />

      </div>


      <h3>
        Unable to load data
      </h3>


      <p>
        {message}
      </p>


      {onRetry && (

        <button
          className="secondary-button"
          onClick={onRetry}
        >

          <RefreshCw
            size={14}
          />

          Try Again

        </button>

      )}

    </div>
  );
}


export default ErrorMessage;