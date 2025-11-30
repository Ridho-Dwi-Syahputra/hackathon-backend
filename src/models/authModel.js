const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  users_id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    allowNull: false,
    comment: 'UUID untuk user ID'
  },
  full_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 150]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  total_xp: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned'),
    allowNull: false,
    defaultValue: 'active'
  },
  user_image_url: {
    type: DataTypes.STRING(512),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JWT token untuk authentication'
  },
  
  // ====== ATRIBUT BARU =======
  fcm_token: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Firebase Cloud Messaging token untuk push notifications'
  },
  notification_preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      quiz_reminder: true,
      achievement_unlock: true,
      cultural_event: true,
      weekly_challenge: true,
      friend_activity: false,
      marketing: false
    },
    comment: 'JSON preferences untuk notifikasi user'
  },
  // ============================
  
  token_validity: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Waktu kadaluarsa token'
  }
}, {
  // Sequelize options
  tableName: 'users',
  timestamps: false, // Karena kita pakai created_at dan updated_at manual
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
  
  // Indexes
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['fcm_token']
    }
  ],

  // Hooks untuk auto-update updated_at
  hooks: {
    beforeUpdate: (user) => {
      user.updated_at = new Date();
    }
  }
});

// Instance methods
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Hapus password_hash dan token dari response
  delete values.password_hash;
  delete values.token;
  delete values.token_validity;
  
  return values;
};

// Static methods
User.findByEmail = function(email) {
  return this.findOne({
    where: { email },
    attributes: ['users_id', 'email', 'full_name', 'password_hash', 'total_xp', 'status', 'user_image_url', 'fcm_token', 'notification_preferences']
  });
};

User.findByToken = function(token) {
  return this.findOne({
    where: { 
      token,
      status: 'active'
    },
    attributes: ['users_id', 'email', 'full_name', 'status', 'fcm_token', 'notification_preferences']
  });
};

module.exports = User;