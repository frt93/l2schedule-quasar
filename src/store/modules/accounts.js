export const state = () => ({
  accounts: [],
});
export const mutations = {
  set_accounts(state, accounts) {
    state.accounts = accounts;
  },

  add(state, account) {
    state.accounts.push(account);
  },

  update(state, updated) {
    state.accounts.forEach(function(part, index, theArray) {
      if (theArray[index].id === updated.id) {
        theArray[index] = updated;
      }
    });
  },

  remove(state, account) {
    const accountsToKeep = state.accounts.filter(acc => {
      return acc.id !== account.id;
    });
    state.accounts = accountsToKeep;
  },
};
export const actions = {
  async fetch({ commit }) {
    const { data } = await this.$axios.get('/accounts/all');
    commit('set_accounts', data);
  },

  create({ commit }, { account, user }) {
    return new Promise((resolve, reject) => {
      this.$axios
        .post('/accounts/create', { account, user })
        .then(res => {
          commit('add', res.data.account);
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  update({ commit }, { account, user }) {
    return new Promise((resolve, reject) => {
      this.$axios
        .post('/accounts/update', { account, user })
        .then(res => {
          commit('update', res.data.account);
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  remove({ commit }, { account, user }) {
    return new Promise((resolve, reject) => {
      this.$axios
        .post('/accounts/remove', { account, user })
        .then(res => {
          commit('remove', account);
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    });
  },
};
export const getters = {
  getAll(state) {
    return state.accounts;
  },
};
