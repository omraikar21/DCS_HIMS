import {
  ShieldX,
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


function Unauthorized() {

  const navigate =
    useNavigate();


  return (
    <div className="unauthorized-page">

      <div className="unauthorized-card">

        <div className="unauthorized-icon">
          <ShieldX size={32} />
        </div>


        <p className="section-label">
          ACCESS DENIED
        </p>


        <h1>
          You don't have permission
        </h1>


        <p>
          Your account does not have
          access to this page.
        </p>


        <button
          className="primary-button"
          onClick={() =>
            navigate(-1)
          }
        >

          <ArrowLeft size={16} />

          Go Back

        </button>

      </div>

    </div>
  );
}


export default Unauthorized;