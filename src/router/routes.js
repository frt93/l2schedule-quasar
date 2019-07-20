import { guest, user, admin } from './middleware/auth';

const routes = [
  {
    path: '/',
    component: () => import('layouts/mainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/Index.vue'),
      },
      {
        path: 'rb',
        name: 'rb',
        component: () => import('pages/rb.vue'),
        meta: { middleware: [user] },
      },
      {
        path: 'forum',
        name: 'forum',
        component: () => import('pages/forum.vue'),
      },
    ],
  },
  {
    path: '/auth/',
    component: () => import('layouts/mainLayout.vue'),
    children: [
      {
        path: 'signup',
        name: 'signup',
        component: () => import('pages/auth/signup.vue'),
        meta: { middleware: [guest] },
      },
      {
        path: 'signin',
        name: 'signin',
        component: () => import('pages/auth/signin.vue'),
        meta: { middleware: [guest] },
      },
      {
        path: 'repair',
        name: 'repair',
        component: () => import('pages/auth/repair.vue'),
      },
      {
        path: 'confirm',
        name: 'auth/confirm',
        component: () => import('pages/auth/confirm.vue'),
      },
    ],
  },
  {
    path: '/settings',
    component: () => import('layouts/settingsLayout.vue'),
    children: [
      {
        path: '',
        redirect: { name: 'settings/account' },
        name: 'settings',
      },
      {
        path: 'account',
        name: 'settings/account',
        component: () => import('pages/settings/account.vue'),
        meta: { middleware: [user], needAuth: true },
      },
      {
        path: 'password',
        name: 'settings/password',
        component: () => import('pages/settings/password.vue'),
        meta: { middleware: [user], needAuth: true },
      },
      {
        path: 'safety',
        name: 'settings/safety',
        component: () => import('pages/settings/safety.vue'),
        meta: { middleware: [user], needAuth: true },
      },
    ],
  },

  {
    path: '/@:username',
    component: () => import('layouts/mainLayout.vue'),
    children: [
      {
        path: '',
        name: 'user',
        component: () => import('pages/user.vue'),
      },
    ],
  },

  {
    path: '/party',
    component: () => import('layouts/party.vue'),
    children: [
      {
        path: ':name',
        name: 'party',
        component: () => import('pages/party/main.vue'),
      },
      {
        path: 'members',
        name: 'party/members',
        component: () => import('pages/party/members.vue'),
      },
    ],
  },

  {
    path: '/parties',
    component: () => import('layouts/mainLayout.vue'),
    children: [
      {
        path: '',
        name: 'parties',
        component: () => import('pages/party/all.vue'),
      },
    ],
  },
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue'),
  });
}

export default routes;
