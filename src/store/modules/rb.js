export default {
  state: {
    allRaidBosses: [],
    inWindow: [],
    inResp: [],
    lostResp: [],
  },

  mutations: {
    SET_RAIDBOSS_LIST(state, data) {
      state.allRaidBosses = data.all;
      state.inWindow = data.inWindow;
      state.inResp = data.inResp;
      state.lostResp = data.lostResp;
    },
    SET_RB(state, data) {
      state.allRaidBosses = data;
    },
    update(state, payload) {
      state.allRaidBosses = payload;
    },

    add(state, boss) {
      state.allRaidBosses.push(boss);
    },

    remove(state, boss) {
      const raidBossesToKeep = state.allRaidBosses.filter(rb => {
        return rb.id !== boss.id;
      });
      state.allRaidBosses = raidBossesToKeep;
    },
  },

  actions: {
    async fetch({ commit }) {
      const { data } = await this._vm.$axios.get('/rb/all');
      commit('SET_RB', data);
      // dispatch('sortByResp', data);
    },

    sortByResp({ commit }, data) {
      const sort = this.$sortByMaxResp(data);
      commit('SET_RAIDBOSS_LIST', data);
    },

    create({ commit }, { boss, user }) {
      return new Promise((resolve, reject) => {
        this.$axios
          .post('/rb/create', { boss, user })
          .then(res => {
            this._vm.$socket().emit('create-boss', boss, user);
            commit('add', res.data.boss);
            resolve(res);
          })
          .catch(e => {
            reject(e);
          });
      });
    },

    update({ dispatch }, { boss, user }) {
      return new Promise((resolve, reject) => {
        this.$axios
          .post('/rb/update', { boss, user })
          .then(res => {
            this._vm.$socket().emit('update-boss', boss, user);
            dispatch('rebuild', res.data.boss);
            resolve(res);
          })
          .catch(e => {
            reject(e);
          });
      });
    },

    rebuild({ dispatch, state }, boss) {
      // Перебираем массив со всеми рб и обновляем в нем экземпляр обновленного рб
      const allRaidBosses = state.allRaidBosses;

      let newRaidBossesList = allRaidBosses.filter(rb => {
        return rb.id !== boss.id;
      });
      newRaidBossesList.push(boss);
      dispatch('sortByResp', newRaidBossesList);
    },

    remove({ commit }, { boss, user }) {
      return new Promise((resolve, reject) => {
        this.$axios
          .post('/rb/remove', { boss, user })
          .then(res => {
            this._vm.$socket().emit('remove-boss', boss, user);
            commit('remove', boss);
            resolve(res);
          })
          .catch(e => {
            reject(e);
          });
      });
    },
  },

  getters: {
    getAll(state) {
      return state.allRaidBosses;
    },
    getinWindow(state) {
      return state.inWindow;
    },
    getinResp(state) {
      return state.inResp;
    },
    getlostResp(state) {
      return state.lostResp;
    },
  },
};
