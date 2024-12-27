import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../auth/api";

function PushNotification({ token }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("default");

  const PUBLIC_VAPID_KEY =
    "BMU3BY5FJNNGggZrPVrFDEhlA72s7mZDgXM3Fw_74Ty-IdC3BI_4nMP-RKhCh7d3sYhRM3JRnuN8haW6nE6zcUo";

  useEffect(() => {
    if (token) {
      initializeNotifications();
    }
  }, [token]);

  const initializeNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications không được hỗ trợ trên trình duyệt này");
      return;
    }

    try {
      // Đăng ký Service Worker
      const reg = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
      });
      setRegistration(reg);

      // Kiểm tra subscription hiện tại
      const existingSubscription = await reg.pushManager.getSubscription();
      if (existingSubscription) {
        setIsSubscribed(true);
        return;
      }

      // Nếu chưa có subscription và chưa từ chối quyền, hiện prompt
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);

        if (permission === "granted") {
          await subscribeToNotifications(reg);
        }
      }
    } catch (error) {
      console.error("Lỗi khởi tạo notifications:", error);
    }
  };

  const subscribeToNotifications = async (reg) => {
    try {
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });

      // Gửi subscription lên server
      await axios.post(`${API_URL}/subscribe`, subscription, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setIsSubscribed(true);
      console.log("Đăng ký nhận thông báo thành công!");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
    }
  };

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <div className="push-notification-container">
      <h2>Trạng thái thông báo</h2>
      {permissionStatus === "denied" ? (
        <div className="notification-blocked">
          <p>
            Thông báo đã bị chặn. Vui lòng cho phép thông báo trong cài đặt
            trình duyệt.
          </p>
        </div>
      ) : (
        <p className="notification-status">
          {isSubscribed
            ? "✅ Đã đăng ký nhận thông báo"
            : "❌ Chưa đăng ký nhận thông báo"}
        </p>
      )}
    </div>
  );
}

export default PushNotification;

