import { axiosInstance } from 'boot/axios';

export default {
  async create(payload) {
    let user, error;
    await axiosInstance
      .post('/users/create', credentials)
      .then(res => {
        user = res.data.user;
        cookies.set('auth', res.data.token, { expires: 3650 });
      })
      .catch(e => {
        error = e;
      });
    return { user, error };
  },

  /**
   * Проверяем свободно ли указанное имя пати
   *
   * @param {String} name       Название пати
   */
  async checkName(name) {
    let error;
    await axiosInstance.post('/groups/check/name', { name }).catch(e => {
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
    await axiosInstance.post('/groups/check/slug', { slug }).catch(e => {
      error = e;
    });
    return { error };
  },
};
