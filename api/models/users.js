const sequelize = require('sequelize');
const db = require('~root/config/database');

const user = function(tablename) {
  return db.define(`${tablename}`, {
    id: {
      type: sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    emailVerify: {
      type: sequelize.STRING,
      allowNull: true,
    },
    password: {
      type: sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      type: sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: sequelize.DATE,
      allowNull: false,
    },
  });
};

module.exports = user;
