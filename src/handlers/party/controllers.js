import { i18n } from 'boot/i18n.js';
import { Notify, Dialog } from 'quasar';

import api from './api';

export default {
  /**
   * Делаем запрос для валидации никнейма
   *
   * @param {String} name       Название создаваемой пати
   */
  async checkName(name) {
    const { error } = await api.checkName(name);
    if (error) return this.handleErrors(error);

    return '';
  },

  /**
   * Делаем запрос для валидации никнейма
   *
   * @param {String} slug       Слаг, формирующий ссылку на страницу пати
   */
  async checkSlug(slug) {
    const { error } = await api.checkSlug(slug);
    if (error) return this.handleErrors(error);

    return '';
  },

  /**
   * Обрабатываем ошибки, полученные в результате отправки формы
   *
   * @param {Object} e        Экземпляр ошибки
   */
  handleErrors(e) {
    /**
     * Описанные на стороне сервера кастомные ошибки.
     * У них задано свойство type, совпадающее с наименованием свойств data, отвечающих за выброс ошибок.
     * Свойство msgType совпадает с наименованием свойст data, хранящих в себе текст ошибок
     */

    if (e.response) {
      const err = e.response.data;
      const status = e.response.status;

      if (status >= 500 || err.alert) {
        this.errorNotify(err.message);
        return false;
      } else {
        return { errorType: err.type, message: err.message };
      }
    }

    // Сгенерированные сервером/браузером ошибки
    if (e.message === 'Network Error') {
      this.errorNotify(i18n.t('errors.network'));
      return false;
    }
  },

  /**
   * Вызов оповещения об ошибке
   *
   * @param {String} message   Текст ошибки
   */
  errorNotify(message) {
    let text = message,
      icon = 'mdi-emoticon-sad-outline';

    if (typeof message === 'object') {
      text = message.message;
      icon = message.icon;
    }

    Notify.create({
      color: 'negative',
      position: 'bottom',
      icon,
      message: text,
    });
  },

  /**
   * Вызов оповещения об успешном завершении операции
   *
   * @param {String} message   Текст оповещения
   */
  successNotify(message) {
    let text = message,
      icon = 'mdi-emoticon-wink-outline';

    if (typeof message === 'object') {
      text = message.message;
      icon = message.icon;
    }

    Notify.create({
      color: 'green-6',
      position: 'bottom-right',
      icon,
      message: text,
    });
  },
};
