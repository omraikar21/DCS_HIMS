import {
  useState,
} from "react";

import DataState
  from "../../components/common/DataState";


function StateTest() {

  const [state, setState] =
    useState("loading");


  const fakeError = {
    message:
      "Unable to connect to the server.",
  };


  return (
    <div
      style={{
        padding: "30px",
      }}
    >

      <h1>
        A5 State Test
      </h1>


      <div
        style={{
          display: "flex",
          gap: "10px",
          margin: "20px 0",
          flexWrap: "wrap",
        }}
      >

        <button
          className="primary-button"
          onClick={() =>
            setState("loading")
          }
        >
          Loading
        </button>


        <button
          className="secondary-button"
          onClick={() =>
            setState("error")
          }
        >
          Error
        </button>


        <button
          className="secondary-button"
          onClick={() =>
            setState("empty")
          }
        >
          Empty
        </button>


        <button
          className="secondary-button"
          onClick={() =>
            setState("data")
          }
        >
          Data
        </button>

      </div>


      <div
        className="dashboard-card"
      >

        <DataState

          loading={
            state === "loading"
          }

          error={
            state === "error"
              ? fakeError
              : null
          }

          isEmpty={
            state === "empty"
          }

          onRetry={() =>
            setState("loading")
          }

          loadingType="skeleton"

          emptyTitle="No employees found"

          emptyMessage={
            "There are currently no employees to display."
          }
        >

          <div
            style={{
              padding: "30px",
              textAlign: "center",
            }}
          >

            <h3>
              Employee Data Loaded
            </h3>

            <p>
              This represents the actual
              page content after the API
              returns data.
            </p>

          </div>

        </DataState>

      </div>

    </div>
  );
}


export default StateTest;