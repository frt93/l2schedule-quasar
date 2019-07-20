import cookies from 'js-cookie';

import userAPI from 'handlers/user/api';
import dateAPI from 'handlers/date';
import langAPI from 'handlers/lang';

import partyAPI from 'handlers/party/api';

export default {
  namespaced: true,
  state: { current: null },

  mutations: {
    setCurrentParty(state, party) {
      state.current = party;
    },

    resetParty(state) {
      state.current = null;
    },
  },

  actions: {
    async prefetch({ commit }, query) {
      const { party, error } = await partyAPI.getParty(query);
      if (error) {
        return commit('resetParty');
      }
      commit('setCurrentParty', party);
    },
  },

  getters: {},
};
