import partyAPI from 'handlers/party/api';

export default {
  namespaced: true,
  state: {
    browseParty: null, // Просматриваемая пользователем пати
    userParty: null, // Пати, в которой пользователь непосредственно состоит
  },

  mutations: {
    setBrowseParty(state, party) {
      state.browseParty = party;
    },

    setUserParty(state, party) {
      state.userParty = party;
    },

    resetParty(state) {
      state.browseParty = null;
    },
  },

  actions: {
    async prefetch({ commit }, query) {
      const { party, error } = await partyAPI.getParty(query);
      if (error) {
        return commit('resetParty');
      }
      commit('setBrowseParty', party);
    },
  },

  getters: {},
};
