// Configuration for your app
const path = require('path');
const fs = require('fs');

module.exports = function(ctx) {
  return {
    preFetch: true,
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    boot: ['axios', 'i18n'],

    css: ['app.styl'],

    extras: [
      // 'material-icons', // optional, you are not bound to it
      // 'ionicons-v4',
      // 'mdi-v3',
      'fontawesome-v5',
      // 'eva-icons'
    ],

    framework: {
      // all: true, // --- includes everything; for dev only!

      components: [
        'QNoSsr',
        'QLayout',
        'QHeader',
        'QPageContainer',
        'QPage',
        'QRouteTab',
        'QTabs',
        'QTab',
        'QMenu',
        'QToolbar',
        'QBtn',
        'QIcon',
        'QCard',
        'QCardSection',
        'QCardActions',
        'QSpace',
        'QList',
        'QItem',
        'QItemSection',
        'QItemLabel',
        'QForm',
        'QInput',
        'QSelect',
        'QChip',
        'QAvatar',
        'QSeparator',
        'QStepper',
        'QStep',
        'QStepperNavigation',
        'QDialog',
        'QSpinnerPuff',
        'QSpinnerDots',
      ],

      directives: ['Ripple', 'ClosePopup'],

      // Quasar plugins
      plugins: ['Notify', 'Cookies', 'Dialog', 'Meta'],

      iconSet: 'fontawesome-v5',
      lang: 'ru', // Quasar language
    },

    supportIE: false,

    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      // vueCompiler: true,
      gzip: true,
      // analyze: true,
      // extractCSS: false,
      extendWebpack(cfg) {
        cfg.resolve.alias = {
          ...cfg.resolve.alias, // This adds the existing alias

          // Add your own alias like this
          component: path.resolve(__dirname, './src/components'),
          store: path.resolve(__dirname, './src/store'),
          boot: path.resolve(__dirname, './src/boot'),
          mixin: path.resolve(__dirname, './src/mixins'),
          lang: path.resolve(__dirname, './src/lang'),
          handlers: path.resolve(__dirname, './src/handlers'),
        };
      },
    },

    devServer: {
      https: {
        key: fs.readFileSync('./ssl/example.com+5-key.pem'),
        cert: fs.readFileSync('./ssl/example.com+5.pem'),
      },
      port: 8000,
      open: false, // opens browser window automatically
    },

    // animations: 'all', // --- includes all animations
    animations: [],

    ssr: {
      pwa: true,
      componentCache: {},
    },

    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {}, // only for NON InjectManifest
      manifest: {
        name: 'l2Schedule',
        short_name: 'Quasar-PWA',
        description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'statics/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'statics/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },

    cordova: {
      // id: 'org.cordova.quasar.app'
      // noIosLegacyBuildFlag: true // uncomment only if you know what you are doing
    },

    electron: {
      // bundler: 'builder', // or 'packager'

      extendWebpack(cfg) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      },

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Window only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration
        // appId: 'quasar-app'
      },
    },
  };
};
