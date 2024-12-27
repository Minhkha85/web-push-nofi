const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Subscription extends Model {}

Subscription.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  endpoint: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  p256dh: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  auth: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Subscription'
});

module.exports = Subscription; 