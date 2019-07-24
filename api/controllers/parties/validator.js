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

  if (name === 'You already have party') {
    return res.status(403).send({
      message: messages(res.lang).errors[name],
    });
  }

  if (name === 'Self invite') {
    return res.status(403).send({
      alert: true,
      message: {
        message: messages(res.lang).errors[name],
        icon: 'mdi-account-remove',
      },
    });
  }

  if (name === 'User already in your party' || 'Already invited') {
    return res.status(403).send({
      alert: true,
      message: {
        message: messages(res.lang).errors[name](params),
        icon: 'mdi-account-remove',
      },
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
 * Валидируем наименование пати
 *
 *  @param {String} name          Название пати
 *  @param res                    Экземпляр ответа сервера
 *
 */
module.exports.validatePartyName = (name, res) => {
  if (name.length > 30 || name.length < 3) {
    const message = `${messages(res.lang).errors['Party name length']}`;

    res.status(400).send({
      type: 'nameError',
      msgType: 'nameErrorMessage',
      message,
    });

    return false;
  }

  return true;
};

/**
 * Валидируем слаг персональной странички пати
 *
 *  @param {String} slug          Slug пати
 *  @param res                    Экземпляр ответа сервера
 *
 */
module.exports.validatePartySlug = (slug, res) => {
  let message = '';

  if (slug.length > 20 || slug.length < 3) {
    message += `${messages(res.lang).errors['Party slug length']}. `;
  }

  // Выражение ищет пробелы в никнейме
  const spaces = /\s/g.test(slug);
  if (spaces) {
    message += `${messages(res.lang).errors['Party slug spaces']}\n`;
  }

  const pattern = /^[a-zA-Z0-9_\.]+$/.test(slug);
  if (!pattern) {
    message += `${messages(res.lang).errors['Party slug pattern']}\n`;
  }

  const specialСharactersATtheBeginning = /^[_\.]/.test(slug);
  const specialСharactersATtheEnd = /[_\.]$/.test(slug);
  if (specialСharactersATtheBeginning || specialСharactersATtheEnd) {
    message += `${messages(res.lang).errors['Special characters location']}`;
  }

  if (message.length) {
    res.status(400).send({
      type: 'slugError',
      msgType: 'slugErrorMessage',
      message,
    });

    return false;
  }

  return true;
};

/**
 * Валидируем данные формы создания пати
 *
 *  @param {Object} party         Данные создаваемой пати
 *  @param res                    Экземпляр ответа сервера
 *
 */
module.exports.createValidation = async (party, res) => {
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
