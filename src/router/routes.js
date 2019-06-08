import { guest, user, autologin, admin } from './middleware/auth';

const routes = [
  {
    path: '/',
    component: () => import('layouts/mainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/Index.vue'),
        meta: { middleware: [autologin] },
      },
      {
        path: 'rb',
        name: 'rb',
        component: () => import('pages/rb.vue'),
        meta: { middleware: [autologin, user] },
      },
      {
        path: 'forum',
        name: 'forum',
        component: () => import('pages/forum.vue'),
        meta: { middleware: [autologin] },
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
        meta: { middleware: [guest] },
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
        meta: { middleware: [autologin, user] },
      },
      {
        path: 'password',
        name: 'settings/password',
        component: () => import('pages/settings/password.vue'),
        meta: { middleware: [autologin, user] },
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
