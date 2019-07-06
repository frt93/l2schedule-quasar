const google = (() => {
  const install = () => {
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.onreadystatechange = script.onload = () => {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
          resolve();
        }
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  };

  const init = () => {
    return new Promise(resolve => {
      window.gapi.load('auth2', () => {
        const config = {
          clientId: '577711782769-d4ouf4e9u77ligpgkuf2asusocvoekt4.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/userinfo.profile',
          prompt: 'select_account',
          fetch_basic_profile: true,
        };

        window.gapi.auth2.init(config).then(() => {
          resolve();
        });
      });
    });
  };

  const Auth = function() {
    this.GoogleAuth = null;
    this.isLoaded = () => {
      return !!this.GoogleAuth;
    };

    // Загрузим SDK и нициализируем его
    this.load = () => {
      if (!window.gapi) {
        install().then(() => {
          return init();
        });
      }
    };

    this.login = () => {
      return new Promise((resolve, reject) => {
        this.GoogleAuth = gapi.auth2.getAuthInstance();

        if (!this.GoogleAuth) {
          reject(false);
          return;
        }
        this.GoogleAuth.signIn()
          .then(user => {
            resolve(user.getBasicProfile());
          })
          .catch(error => {
            reject(error);
          });
      });
    };
  };

  return new Auth();
})();

const facebook = (() => {
  const install = () => {
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = '//connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.onreadystatechange = script.onload = () => {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
          resolve();
        }
      };

      document.getElementsByTagName('head')[0].appendChild(script);
    });
  };

  const init = () => {
    return new Promise(async resolve => {
      if (window.FB) {
        window.fbAsyncInit = () => {
          const config = {
            cookie: true,
            xfbml: true,
            appId: '477463253007302',
            version: 'v3.3',
          };
          window.FB.init(config);
        };
      } else {
        await install();
      }
      resolve(window.FB);
    });
  };

  const Auth = function() {
    this.load = () => {
      // Загрузим SDK и нициализируем его
      if (!window.FB) {
        install().then(() => {
          init();
        });
      }
    };

    this.login = () => {
      return new Promise(async resolve => {
        window.FB.login(() => {
          window.FB.api(
            '/me',
            {
              fields: 'id,first_name,last_name,email',
            },
            res => {
              resolve(res);
            }
          );
        });
      });
    };
  };

  return new Auth();
})();

const vk = (() => {
  const install = () => {
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://vk.com/js/api/openapi.js?161';
      script.async = true;
      script.onreadystatechange = script.onload = () => {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
          resolve();
        }
      };

      document.getElementsByTagName('head')[0].appendChild(script);
    });
  };

  const init = () => {
    return new Promise(async resolve => {
      if (window.VK) {
        VK.init({
          apiId: '7044244',
        });
      } else {
        await install();
      }

      resolve(window.VK);
    });
  };

  const Auth = function() {
    this.load = () => {
      // Загрузим SDK и нициализируем его
      install().then(() => {
        return init();
      });
    };
    this.login = () => {
      return new Promise(resolve => {
        // Т.к. VK заблокирован на территории Украины - загружаем и инициализируем SDK только при попытке входа с помощью VK,
        // чтобы не грузить его при инициализации страницы авторизации как остальные.
        install()
          .then(() => {
            init();
          })
          .then(() => {
            VK.Auth.login(res => {
              resolve(res);
            });
          });
      });
    };
  };

  return new Auth();
})();

const telegram = () => {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://telegram.org/js/telegram-widget.js?3';
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-userpic', false);
  script.setAttribute('data-radius', 3);
  script.setAttribute('data-telegram-login', 'l2funBot');
  script.setAttribute('data-request-access', 'write');
  script.setAttribute('data-onauth', 'window.onTelegramAuth(user)');

  return { script };
};

if (process.env.CLIENT) {
  // google.load();
  // facebook.load();
  // vk.load();
}

const install = () => {
  google.load();
  facebook.load();
};

export default { google, facebook, telegram, vk, install };
