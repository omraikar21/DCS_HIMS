import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";


const NotificationContext =
  createContext(null);


export function NotificationProvider({
  children,
}) {

  const [notification, setNotification] =
    useState(null);


  const showNotification =
    useCallback(
      ({
        type = "success",
        message = "",
        duration = 3000,
      }) => {

        setNotification({
          type,
          message,
        });


        setTimeout(() => {

          setNotification(null);

        }, duration);

      },
      []
    );


  const success = (message) => {

    showNotification({
      type: "success",
      message,
    });

  };


  const error = (message) => {

    showNotification({
      type: "error",
      message,
    });

  };


  const info = (message) => {

    showNotification({
      type: "info",
      message,
    });

  };


  return (
    <NotificationContext.Provider
      value={{
        notification,
        showNotification,
        success,
        error,
        info,
      }}
    >

      {children}

    </NotificationContext.Provider>
  );
}


export const useNotificationContext =
  () => useContext(
    NotificationContext
  );