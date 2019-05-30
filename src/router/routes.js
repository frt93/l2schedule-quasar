const routes = [
  {
    path: '/',
    component: () => import('layouts/mainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'rb', component: () => import('pages/rb.vue') },
      { path: 'auth/signup', component: () => import('pages/auth/signup') },
      { path: 'auth/signin', component: () => import('pages/auth/signin') },
      { path: 'auth/repair', component: () => import('pages/auth/repair') },
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
