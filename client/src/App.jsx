import AppRoutes
  from "./routes/AppRoutes";

import Toast
  from "./components/common/Toast";

import {
  useNotification,
} from "./hooks/useNotification";


function App() {

  const {
    notification,
  } = useNotification();


  return (

    <>

      <AppRoutes />

      <Toast
        notification={
          notification
        }
      />

    </>

  );

}


export default App;