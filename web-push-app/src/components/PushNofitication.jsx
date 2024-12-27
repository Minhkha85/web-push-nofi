import { useEffect, useState } from "react";
import axios from "axios";

function PushNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("default");

  // Đảm bảo PUBLIC_VAPID_KEY khớp với key trong server
  const PUBLIC_VAPID_KEY =
    "BMU3BY5FJNNGggZrPVrFDEhlA72s7mZDgXM3Fw_74Ty-IdC3BI_4nMP-RKhCh7d3sYhRM3JRnuN8haW6nE6zcUo";

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = async () => {
    if (!("serviceWorker" in navigator)) {
      alert("Service Worker không được hỗ trợ trên trình duyệt này");
      return;
    }
    if (!("PushManager" in window)) {
      alert("Push notification không được hỗ trợ trên trình duyệt này");
      return;
    }

    setPermissionStatus(Notification.permission);
    await registerServiceWorker();
  };

  async function registerServiceWorker() {
    try {
      const reg = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
      });

      setRegistration(reg);

      // Kiểm tra subscription hiện tại
      const existingSubscription = await reg.pushManager.getSubscription();
      setIsSubscribed(!!existingSubscription);

      // Đảm bảo service worker đã active
      if (reg.active) {
        console.log("Service Worker đã active");
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  async function subscribeToNotifications() {
    try {
      if (!registration || !registration.pushManager) {
        throw new Error("Push manager không khả dụng");
      }

      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission !== "granted") {
        throw new Error("Cần cấp quyền thông báo");
      }

      // Convert VAPID key
      const applicationServerKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);

      // Đăng ký subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      // Gửi subscription lên server
      await axios.post("http://localhost:5000/subscribe", subscription, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setIsSubscribed(true);
      console.log("Push Notification subscription successful:", subscription);
    } catch (error) {
      console.error("Subscription error:", error);
      alert(`Lỗi đăng ký: ${error.message}`);
    }
  }

  function urlBase64ToUint8Array(base64String) {
    try {
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
    } catch (error) {
      console.error("Error converting VAPID key:", error);
      throw new Error("Invalid VAPID key format");
    }
  }

  return (
    <div className="push-notification-container">
      <h2>Push Notification Demo</h2>

      {permissionStatus === "denied" ? (
        <div>
          <p>
            Thông báo đã bị chặn. Vui lòng cho phép thông báo trong cài đặt
            trình duyệt.
          </p>
        </div>
      ) : !isSubscribed ? (
        <button onClick={subscribeToNotifications}>
          Đăng ký nhận thông báo
        </button>
      ) : (
        <p>Đã đăng ký nhận thông báo thành công!</p>
      )}

      <div>
        <p>Trạng thái quyền thông báo: {permissionStatus}</p>
        <p>
          Trạng thái đăng ký: {isSubscribed ? "Đã đăng ký" : "Chưa đăng ký"}
        </p>
      </div>
    </div>
  );
}

export default PushNotification;
