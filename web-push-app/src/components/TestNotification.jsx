import { useState } from "react";
import axios from "axios";

function TestNotification() {
  const [notificationData, setNotificationData] = useState({
    title: "",
    body: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/send-notification",
        notificationData
      );
      alert("Notification sent successfully!");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to send notification");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNotificationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="test-notification">
      <h3>Test Push Notification</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={notificationData.title}
              onChange={handleChange}
              placeholder="Enter notification title"
            />
          </label>
        </div>
        <div>
          <label>
            Body:
            <input
              type="text"
              name="body"
              value={notificationData.body}
              onChange={handleChange}
              placeholder="Enter notification message"
            />
          </label>
        </div>
        <button type="submit">Send Notification</button>
      </form>
    </div>
  );
}

export default TestNotification;
