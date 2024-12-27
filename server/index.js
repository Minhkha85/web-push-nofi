const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sequelize = require('./config/database');
const User = require('./models/user.js');
const Notification = require('./models/notification.js');
const Subscription = require('./models/subscription.js');
const { Op } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const publicVapidKey = 'BMU3BY5FJNNGggZrPVrFDEhlA72s7mZDgXM3Fw_74Ty-IdC3BI_4nMP-RKhCh7d3sYhRM3JRnuN8haW6nE6zcUo';
const privateVapidKey = 'LTr0FHoYEzDk9eypI7cPJgseVUIGwhptU7x_a_obNEs';

webpush.setVapidDetails(
  'mailto:minhkha85201@gmail.com',
  publicVapidKey,
  privateVapidKey
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công.');
    
    // Hiển thị thông tin kết nối
    console.log('Database:', process.env.DB_NAME);
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
  } catch (error) {
    console.error('❌ Không thể kết nối đến database:', error);
  }
}
testConnection();
// Middleware xác thực
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Không có token xác thực' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token không hợp lệ' });
    }
    req.user = user;
    next();
  });
};

// Đăng ký tài khoản
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await User.hashPassword(password);
    
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    res.status(400).json({ message: 'Đăng ký thất bại', error: error.message });
  }
});

// Đăng nhập
app.post('/login', async (req, res) => {
  try {
      const { username, password } = req.body;
    //   console.log(username, password);
    const user = await User.findOne({ where: { username } });
    // console.log(user);
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ message: 'Thông tin đăng nhập không chính xác' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Đăng nhập thất bại', error: error.message });
  }
});


app.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.user.id;

    await Subscription.create({
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    });

    res.status(201).json({ message: 'Đăng ký nhận thông báo thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Đăng ký thất bại', error: error.message });
  }
});

// Gửi thông báo
app.post('/send-notification', authenticateToken, async (req, res) => {
  try {
    const { receiverId, title, body } = req.body;
    const senderId = req.user.id;

    // Lưu thông báo vào database
    await Notification.create({
      senderId,
      receiverId,
      title,
      body
    });

    // Lấy subscription của người nhận
    const subscriptions = await Subscription.findAll({
      where: { userId: receiverId }
    });

    // Gửi thông báo đến tất cả các thiết bị của người nhận
    const payload = JSON.stringify({ title, body });
    
    const notifications = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };
      return webpush.sendNotification(pushSubscription, payload);
    });

    await Promise.all(notifications);
    res.json({ message: 'Gửi thông báo thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Gửi thông báo thất bại', error: error.message });
  }
});

// Thêm route để lấy danh sách users
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username'],
      where: {
        id: {
          [Op.ne]: req.user.id 
        }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách users', error: error.message });
  }
});

// Khởi tạo database và khởi động server
sequelize.sync().then(() => {
  app.listen(5000,'0.0.0.0', () => console.log('Server running on port 5000'));
});