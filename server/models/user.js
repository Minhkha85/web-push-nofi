module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  User.associate = (models) => {
    User.hasMany(models.PushSubscription);
    User.hasMany(models.Notification, { as: 'SentNotifications', foreignKey: 'senderId' });
    User.hasMany(models.Notification, { as: 'ReceivedNotifications', foreignKey: 'receiverId' });
  };

  return User;
}; 