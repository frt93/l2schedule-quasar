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
    component: () => import('layouts/mainLayout.vue'),
    children: [
      {
        path: '',
        name: 'settings',
        component: () => import('pages/settings/index.vue'),
        meta: { middleware: [user] },
      },
      {
        path: 'email',
        name: 'settings/email',
        component: () => import('pages/settings/email.vue'),
        meta: { middleware: [user] },
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
