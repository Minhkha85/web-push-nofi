import { useState, useEffect } from "react";
import Login from "./components/Login";
import PushNotification from "./components/PushNotification";
import NotificationTester from "./components/NotificationTester";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="app">
      {!token ? (
        <Login onLoginSuccess={setToken} />
      ) : (
        <div className="dashboard">
          <div className="header">
            <h1>Hệ thống thông báo</h1>
            <button onClick={handleLogout}>Đăng xuất</button>
          </div>

          <div className="content">
            <PushNotification token={token} />
            <NotificationTester token={token} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
