module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { as: 'Sender', foreignKey: 'senderId' });
    Notification.belongsTo(models.User, { as: 'Receiver', foreignKey: 'receiverId' });
  };

  return Notification;
};