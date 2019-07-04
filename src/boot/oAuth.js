const google = (() => {
  const install = () => {
    const apiUrl = 'https://apis.google.com/js/api.js';
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = apiUrl;
      script.onreadystatechange = script.onload = () => {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
          resolve();
        }
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  };

  const init = config => {
    return new Promise(resolve => {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init(config).then(() => {
          resolve(window.gapi);
        });
      });
    });
  };

  const Auth = function() {
    this.GoogleAuth = null; /* window.gapi.auth2.getAuthInstance() */
    // this.isAuthorized = false;
    this.isInit = false;
    this.prompt = null;
    this.isLoaded = () => {
      return !!this.GoogleAuth;
    };

    this.load = () => {
      const config = {
        clientId: '577711782769-in3gqdrl5fsmt2v6jctffeqpvadps7pc.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/userinfo.profile',
        prompt: 'select_account',
        fetch_basic_profile: true,
      };

      install()
        .then(() => {
          return init(config);
        })
        .then(gapi => {
          this.GoogleAuth = gapi.auth2.getAuthInstance();
          this.isInit = true;
          // this.prompt = config.prompt;
          // this.isAuthorized = this.GoogleAuth.isSignedIn.get();
        });
    };

    this.signIn = (successCallback, errorCallback) => {
      return new Promise((resolve, reject) => {
        if (!this.GoogleAuth) {
          // if (typeof errorCallback === 'function') {
          //   errorCallback(false);
          // }
          reject(false);
          return;
        }
        this.GoogleAuth.signIn()
          .then(googleUser => {
            // if (typeof successCallback === 'function') {
            //   successCallback(googleUser);
            // }
            // this.isAuthorized = this.GoogleAuth.isSignedIn.get();
            resolve(googleUser);
          })
          .catch(error => {
            // if (typeof errorCallback === 'function') {
            //   errorCallback(error);
            // }
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
        window.fbAsyncInit = function() {
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
      install().then(() => {
        return init();
      });
    };
    this.login = () => {
      return new Promise(resolve => {
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
  google.load();
  facebook.load();
}

export default { google, facebook, telegram };
