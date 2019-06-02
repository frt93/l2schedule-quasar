import { isGuest, isUser, autologin } from './middleware/auth';

const routes = [
  {
    path: '/',
    component: () => import('layouts/mainLayout.vue'),
    children: [
      {
        path: '',
        name: 'main',
        component: () => import('pages/Index.vue'),
        meta: { middleware: autologin },
      },
      {
        path: 'rb',
        name: 'rb',
        component: () => import('pages/rb.vue'),
        meta: { middleware: isUser },
      },
      {
        path: 'auth/signup',
        name: 'signup',
        component: () => import('pages/auth/signup'),
        meta: { middleware: isGuest },
      },
      {
        path: 'auth/signin',
        name: 'signin',
        component: () => import('pages/auth/signin'),
        meta: { middleware: isGuest },
      },
      {
        path: 'auth/repair',
        name: 'repair',
        component: () => import('pages/auth/repair'),
        meta: { middleware: isGuest },
      },
      {
        path: 'forum',
        name: 'forum',
        component: () => import('pages/forum'),
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
