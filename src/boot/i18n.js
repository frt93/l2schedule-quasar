import VueI18n from 'vue-i18n';
import vuex from 'vuex';

import messages from 'root/lang';
export default ({ app, Vue }) => {
  Vue.use(VueI18n);

  app.i18n = new VueI18n({
    locale: 'ru',
    fallbackLocale: 'ru',
    messages,
  });
};
