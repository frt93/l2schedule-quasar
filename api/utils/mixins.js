const config = require('../config');
const jwt = require('jsonwebtoken');
const jwtToken = config.jwtSignature;

/**
 * Форматируем строку для проверки на совпадение
 * @param value             Значение, которая надо отфарматировать
 * @return String
 */
const toLowerCaseAndReplaceSpaces = value => {
  return value
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '');
};

/**
 * Проверяем валидность токена авторизации
 * @param req               Объект запроса серверу
 * @param res               Объект ответа сервера
 * @return String
 */
const tokenVerify2 = (req, res) => {
  const token = req.headers['x-access-token'];
  if (!token)
    return res.status(400).send({ type: 'error', message: 'x-access-token header not found.' });

  jwt.verify(token, jwtToken, (error, result) => {
    if (error)
      return res.status(403).send({ type: 'error', message: 'Provided token is invalid.', error });
    return { error, result };
  });
};

module.exports = { toLowerCaseAndReplaceSpaces, tokenVerify2 };
