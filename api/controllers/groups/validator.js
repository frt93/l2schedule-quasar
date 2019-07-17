const messages = require('./lang');

/**
 * Генерируем ошибки
 *
 * @param {String} name       Имя ошибки
 * @param res                 Объект ответа сервера
 * @param params              Переменная (или объект с несколькими переменными) для детализации сообщения ошибки
 */
module.exports.throwErrors = (name, res, params) => {
  if (name === 'Empty credentials') {
    return res.status(400).send({
      type: 'Empty credentials',
      message: messages(res.lang).errors[name],
    });
  }

  if (name === 'Name already exists') {
    return res.status(403).send({
      type: 'nameError',
      msgType: 'nameErrorMessage',
      message: messages(res.lang).errors[name](params),
    });
  }

  if (name === 'Slug already exists') {
    return res.status(403).send({
      type: 'slugError',
      msgType: 'slugErrorMessage',
      message: messages(res.lang).errors[name],
    });
  }
};

/**
 * Обрабатываем ошибки, возникшие в результате запросов к GraphQL движку
 *
 * @param {Error} e           Экземпляр ошибки
 * @param res                 Объект ответа сервера
 * @param params              Переменная (или объект с несколькими переменными) для детализации сообщения ошибки
 */
module.exports.handleErrors = (e, res, params) => {
  // Ошибка подключения к hasura
  if (e.name === 'FetchError') {
    return res.status(503).send({
      type: 'Connection Error',
      message: messages(res.lang).errors[e.name],
    });
  } else {
    res.status(500).send(e);
  }
};

/**
 * Валидируем данные формы создания пати
 *
 *  @param {Object} party         Данные создаваемой пати
 *  @param res                    Экземпляр ответа сервера
 *
 */
module.exports.signupValidation = async (party, res) => {
  if (!party.name || !party.slug || !party.leader_id) {
    // Форма заполнена неполностью - выбрасываем ошибку
    this.throwErrors('Empty fields', res);
    return false;
  }

  let valid;

  valid = await this.validatePartyName(party.name, res);
  if (!valid) return false;

  valid = await this.validatePartySlug(party.slug, res);
  if (!valid) return false;

  return true;
};
