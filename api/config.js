/**
 * Корневой адрес приложения
 */
const url = 'http://l2schedule.fun';

/**
 * Секретный ключ для хэширования токена
 */
const jwtSignature = 'l2schedule token';

/**
 * Текст сообщения, которое отправляется на указанный email только что зарегистрировавшегося пользователя
 * @param user              Экземпляр пользователя
 * @param token             Токе для подтверждения email
 * @param code              Секретный код для подтверждения email в личном кабинете
 * @param password          Нехэшированный пароль пользователя
 * @return Message
 */
const registrationConfirmMessage = (user, token, code, password) => {
  const message = `Здравствуйте, ${
    user.username
  }. Вы использовали данный адрес электронной почты при регистрации в приложении <a href="${url}">L2Schedule</a>. <br>
    Для подтверждения регистрации перейдите по <a href="${url}/auth/confirm/?credential=email&token=${token}">ссылке</a> или воспользуйтесь кодом ${code} для подтверждения в личном кабинете. <br><br>
    Ваш пароль для авторизации: ${password}<br>
    Добро пожаловать в банду 👊 <br><br>
    Если вы не осуществляли подобной регистрации - проигнорируйте данное письмо.<br><br>Всего хорошего!
    `;
  return {
    text: '',
    from: 'L2Schedule ✔',
    to: user.email,
    subject: 'Подтвердите регистрацию 🤝',
    attachment: [{ data: `<html>${message}</html>`, alternative: true }],
  };
};

/**
 * Текст сообщения, которое отправляется на новый email адрес в результате процедуры его изменения
 * @param user              Экземпляр пользователя
 * @param token             Токе для подтверждения нового email
 * @param code              Секретный код для подтверждения нового email в личном кабинете
 * @return Message
 */
const emailChangeConfirmMessage = (user, token, code) => {
  const message = `Здравствуйте, ${
    user.username
  }. Вы использовали данный адрес электронной почты для привязки к аккаунту на <a href="${url}">L2Schedule</a>. <br>
    Для подтверждения перейдите по <a href="${url}/auth/confirm/?credential=email&token=${token}">ссылке</a> или воспользуйтесь кодом ${code} для подтверждения в личном кабинете. <br><br>
    Если вы не осуществляли подобной процедуры - проигнорируйте данное письмо.<br><br>Всего хорошего!
    `;
  return {
    text: '',
    from: 'L2Schedule',
    to: user.email,
    subject: 'Подтвердите смену email адреса 📪',
    attachment: [{ data: `<html>${message}</html>`, alternative: true }],
  };
};

/**
 * Текст сообщения, которое отправляется на указанный email для подтверждения процесса смены пароля
 * @param user              Экземпляр пользователя
 * @param token             Токе для подтверждения смены пароля
 * @param code              Секретный код для подтверждения смены пароля в личном кабинете
 * @param newPassword       Нехэшированный новый пароль пользователя
 * @return Message
 */
const passwordChangeConfirmMessage = (user, token, code, newPassword) => {
  const message = `Здравствуйте, ${
    user.username
  }. Вы получили это письмо так как решили сменить пароль от аккаунта <a href="${url}">L2Schedule</a>. <br>
    Для подтверждения перейдите по <a href="${url}/auth/confirm/?credential=password&token=${token}">ссылке</a> или воспользуйтесь кодом ${code} для подтверждения в личном кабинете. <br>
    После подтверждения ваш пароль станет следующим: ${newPassword}<br><br>
    Если вы не осуществляли подобной процедуры - проигнорируйте данное письмо.<br><br>Всего хорошего!
    `;
  return {
    text: '',
    from: 'L2Schedule',
    to: user.email,
    subject: 'Подтвердите смену пароля 🔑',
    attachment: [{ data: `<html>${message}</html>`, alternative: true }],
  };
};

/**
 * Текст сообщения, которое отправляется на указанный email при процедуре восстановления пароля.
 * В качестве "кода восстановления" используется id пользователя
 * @param user              Экземпляр пользователя, который забыл пароль
 * @return Message
 */
const restoreAccessMessage = user => {
  const message = `Здравствуйте, ${
    user.username
  }. Вы получили это письмо так как забыли пароль от своего аккаунта <a href="${url}">L2Schedule</a>. <br>
    Для продолжения процедуры восстановления доступа к аккаунту воспользуйтесь кодом восстановления: ${
      user.id
    } <br>
    <br><br>
    Если вы не осуществляли подобной процедуры - проигнорируйте данное письмо.<br><br>
    Всего хорошего!
    `;
  return {
    text: '',
    from: 'L2Schedule',
    to: user.email,
    subject: 'Восстановления пароля 😱',
    attachment: [{ data: `<html>${message}</html>`, alternative: true }],
  };
};

/**
 * Текст сообщения, которое отправляется на указанный email по завершении процедуры восстановления доступа к аккаунту.
 * @param user              Экземпляр пользователя, который забыл пароль
 * @param password          Новый пароль пользователя
 * @return Message
 */
const resetedPasswordMessage = (user, password) => {
  const message = `Здравствуйте, ${
    user.username
  }. Вы успешно завершили процедуру восстановления доступа к своему аккаунту <a href="${url}">L2Schedule</a>. <br>
    Ваш новый пароль для авторизации: ${password} <br>
    <br><br>
    Если вы не осуществляли подобной процедуры - обратитесь к администрации.<br><br>
    Всего хорошего!
    `;
  return {
    text: '',
    from: 'L2Schedule',
    to: user.email,
    subject: 'Пароль изменен 🔑',
    attachment: [{ data: `<html>${message}</html>`, alternative: true }],
  };
};
module.exports = {
  url,
  jwtSignature,
  registrationConfirmMessage,
  emailChangeConfirmMessage,
  passwordChangeConfirmMessage,
  restoreAccessMessage,
  resetedPasswordMessage,
};
