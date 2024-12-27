import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../auth/api";
function NotificationTester({ token }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState({
    title: "",
    body: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !message.title || !message.body) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/send-notification`,
        {
          receiverId: selectedUser,
          ...message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Gửi thông báo thành công!");
      setMessage({ title: "", body: "" });
    } catch (error) {
      alert(
        "Lỗi khi gửi thông báo: " + error.response?.data?.message ||
          error.message
      );
    }
  };

  return (
    <div className="notification-tester">
      <h2>Gửi thông báo test</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Người nhận:</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            required
          >
            <option value="">Chọn người nhận</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Tiêu đề:</label>
          <input
            type="text"
            value={message.title}
            onChange={(e) => setMessage({ ...message, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Nội dung:</label>
          <textarea
            value={message.body}
            onChange={(e) => setMessage({ ...message, body: e.target.value })}
            required
          />
        </div>

        <button type="submit">Gửi thông báo</button>
      </form>
    </div>
  );
}

export default NotificationTester;
