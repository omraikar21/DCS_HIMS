import {
  LoaderCircle,
} from "lucide-react";


function LoadingSpinner({
  size = 22,
  message = "Loading...",
}) {

  return (
    <div className="loading-state">

      <LoaderCircle
        size={size}
        className="loading-spinner"
      />

      {message && (
        <span>
          {message}
        </span>
      )}

    </div>
  );
}


export default LoadingSpinner;