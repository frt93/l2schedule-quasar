import cookies from 'js-cookie';
import { setAuthToken, resetAuthToken } from '~/plugins/auth';
export const state = () => ({
  user: null,
  allUsers: [],
  notifications: [],
  raidbossesDisplayType: 'grid',
  isSetTimeToMoscow: false,
});

export const mutations = {
  set_user(state, user) {
    state.user = user;
    this._vm.$socket().emit('authorized', user.id);
    if (user.group) {
      this._vm.$socket().emit('group-connect', user.group.name);
    }
  },
  reset_user(state) {
    state.user = null;
  },
  all_users(state, users) {
    state.allUsers = users;
  },

  addNotification(state, message) {
    state.notifications.unshift(message);
  },

  resetNotifications(state) {
    state.notifications = [];
  },

  setRaidbossesDisplayType(state, type) {
    cookies.set('rb-display-type', type, { expires: 365 });
    state.raidbossesDisplayType = type;
  },

  isSetTimeToMoscow(state, boolean) {
    cookies.set('is-moscow-time', boolean, { expires: 365 });
    state.isSetTimeToMoscow = boolean;
  },
};

export const actions = {
  fetch({ commit }) {
    return this.$axios
      .get('/me')
      .then(response => {
        commit('set_user', response.data);
        return response;
      })
      .catch(error => {
        commit('reset_user');
        return error;
      });
  },
  fetchAllUsers({ commit }) {
    return this.$axios
      .get('/users/all')
      .then(response => {
        commit('all_users', response.data);
        return response;
      })
      .catch(error => {
        return error;
      });
  },
  signIn({ dispatch, commit }, user) {
    return new Promise((resolve, reject) => {
      this.$axios
        .post('/users/signin', user)
        .then(res => {
          commit('set_user', res.data.user);
          setAuthToken(res.data.token);
          cookies.set('x-access-token', res.data.token, { expires: 365 });
          this.$router.go();
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  signUp({ dispatch, commit }, user) {
    return new Promise((resolve, reject) => {
      this.$axios
        .post('/users/signup', user)
        .then(res => {
          commit('set_user', res.data.user);
          setAuthToken(res.data.token);
          cookies.set('x-access-token', res.data.token, { expires: 365 });
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  signOut({ commit }, user) {
    resetAuthToken();
    cookies.remove('x-access-token');
    this.$router.go();
  },

  restore({ commit }, key) {
    return new Promise((resolve, reject) => {
      this.$axios
        .post('/users/restore', key)
        .then(res => {
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  reset({ commit }, user) {
    return new Promise((resolve, reject) => {
      this.$axios
        .post(`/user/reset`, user)
        .then(res => {
          commit('set_user', res.data.user);
          setAuthToken(res.data.token);
          cookies.set('x-access-token', res.data.token, { expires: 365 });
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  createGroup({ commit }, group) {
    return new Promise((resolve, reject) => {
      this.$axios
        .post(`/group/create`, group)
        .then(res => {
          commit('set_user', res.data.invitee);
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  inviteToGroup({ commit }, payload) {
    return new Promise((resolve, reject) => {
      this.$axios
        .post(`/group/invite`, payload)
        .then(res => {
          this._vm.$socket().emit('invite-user', payload.group, payload.inviter, res.data.invitee);
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    });
  },

  acceptInvitation({ commit }, payload) {
    return new Promise((resolve, reject) => {
      this.$axios
        .post(`/group/accept`, payload)
        .then(res => {
          this._vm
            .$socket()
            .emit('joined-to-group', payload.group, res.data.inviter, res.data.invitee);

          commit('set_user', res.data.invitee);
          resolve(res);
        })
        .catch(e => {
          reject(e);
        });
    });
  },
};

export const getters = {
  getUser(state) {
    return state.user;
  },
  getAll(state) {
    return state.allUsers;
  },
  getNotifications(state) {
    return state.notifications;
  },
  getRaidbossesDisplayType(state) {
    return state.raidbossesDisplayType;
  },
  isSetTimeToMoscow(state) {
    return state.isSetTimeToMoscow;
  },
};
