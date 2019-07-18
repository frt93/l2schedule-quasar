import { axiosInstance } from 'boot/axios';

export default {
  async create(payload) {
    let party, user, error;
    await axiosInstance
      .post('/parties/create', payload)
      .then(res => {
        party = res.data.party;
        user = res.data.user;
      })
      .catch(e => {
        error = e;
      });
    return { party, user, error };
  },

  /**
   * Проверяем свободно ли указанное имя пати
   *
   * @param {String} name       Название пати
   */
  async checkName(name) {
    let error;
    await axiosInstance.post('/parties/check/name', { name }).catch(e => {
      error = e;
    });
    return { error };
  },

  /**
   * Проверяем свободна ли указанная ссылка на страницу пати
   *
   * @param {String} slug       Слаг, формирующий ссылку на страницу пати
   */
  async checkSlug(slug) {
    let error;
    await axiosInstance.post('/parties/check/slug', { slug }).catch(e => {
      error = e;
    });
    return { error };
  },

  /**
   * Отправим запрос на получение экземпляра пати
   *
   * @param {String} key        Ключ поиска (id/name)
   * @param {String} value      Значение ключа поиска
   */
  async getParty(key, value) {
    let party, error;
    await axiosInstance
      .post('/parties/get', { key: key, value })
      .then(res => {
        party = res.data.party;
      })
      .catch(e => {
        error = e;
      });
    return { party, error };
  },
};
