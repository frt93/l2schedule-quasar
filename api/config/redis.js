const Redis = require('ioredis');

/**
 * Подключение к базе Redis, хранящей информацию о пользователях
 */
module.exports.redisUsersDB = new Redis({
  password: 'pass',
  db: 0,
});
