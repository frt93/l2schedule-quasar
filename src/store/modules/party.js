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
  },

  actions: {
    async prefetch({ commit }, partyID) {
      const { party, error } = await partyAPI.getParty('id', partyID);
      if (!error) {
        commit('setCurrentParty', party);
      }
    },
  },

  getters: {},
};
