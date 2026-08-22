import {
  AlertCircle,
} from "lucide-react";


function FormError({
  message,
}) {

  if (!message) {
    return null;
  }


  return (
    <p className="form-error">

      <AlertCircle
        size={13}
      />

      <span>
        {message}
      </span>

    </p>
  );
}


export default FormError;