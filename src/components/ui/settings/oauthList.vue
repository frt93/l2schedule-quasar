<script>
import { openURL } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
import date from "handlers/date";
import oauth from "boot/oauth";

import askPassword from "components/auth/askPassword";

export default {
  name: "oauthProvidersList",
  beforeMount() {
    if (process.env.CLIENT) {
      // Загружаем и инициализируем SDK
      oauth.install();
    }
  },

  mounted() {
    // Инициализируем telegram виджет
    const { script } = oauth.telegram();
    this.$refs.telegram.appendChild(script);
    window.onTelegramAuth = this.telegram;
  },

  props: ["user"],

  computed: {
    google() {
      let data = {
        windowProp: "gapi",
        id: this.user.metadata.googleID,
        data: this.user.metadata.googleData
      };

      if (this.user.metadata.googleData !== undefined) {
        data.detail = this.user.metadata.googleData.email;
      }

      return data;
    },
    facebook() {
      let data = {
        windowProp: "FB",
        id: this.user.metadata.facebookID,
        data: this.user.metadata.facebookData
      };

      if (this.user.metadata.facebookData) {
        data.detail = this.user.metadata.facebookData.name;
      }

      return data;
    },
    vk() {
      let data = {
        windowProp: "VK",
        id: this.user.metadata.vkID,
        data: this.user.metadata.vkData
      };

      if (this.user.metadata.vkData) {
        data.detail = this.user.metadata.vkData.name;
      }

      return data;
    },
    telegram() {
      return {
        id: this.user.metadata.telegramID,
        data: this.user.metadata.telegramData
      };
    }
  },

  methods: {
    /**
     * Сообщение пользователю о статусе подключения к его аккаунту oauth-провайдера
     *
     *  @param provider               Наименование oauth-провайдера
     */
    isAppConnected(provider) {
      let message;
      const providerID = this[provider].id;

      if (providerID !== undefined) {
        message = this.$t(`oauth.${provider}Linked`);
      } else {
        message = this.$t(`oauth.link_${provider}`);
      }

      return message;
    },
    /**
     * Получим данные о пользователе от ouath провайдера
     *
     * @param provider               Наименование oauth провайдера
     * @param propertyName           Наименование window.свойства oauth провайдера, из которого вызывается его api
     *
     */
    getProviderData(provider, propertyName) {
      const login = () => {
        return new Promise(resolve => {
          oauth[provider].login().then(async res => {
            const providerData = await controllers[`${provider}Instance`](res); // Обработаем данные от oauth провайдера
            resolve(providerData);
          });
        });
      };

      return new Promise(resolve => {
        if (!window[propertyName]) {
          // Если SDK выбранного провайдера не инициализировано - загружаем и инициализируем
          oauth[provider].load().then(() => {
            login().then(res => {
              resolve(res);
            });
          });
        } else {
          // SDK инициализировано - вызываем метод авторизации
          login().then(res => {
            resolve(res);
          });
        }
      });
    },

    /**
     * Подключим профиль oauth провайдера к аккаунту пользователя
     *
     * @param provider               Наименование oauth провайдера
     * @param propertyName           Наименование window.свойства oauth провайдера, в котором вызывается его api
     * @param isError                Если пользователь подтвердил операцию неправильным паролем - данный метод перезапускается и в этом параметре передается текст ошибки.
     * @param data                   Данные, полученные от oauth провайдера. Если этот параметр передается - значит пользователь уже получил данные, но подтвердил операцию
     *                               неверным паролем и метод вызвался рекурсивно для повторного запроса пароля.
     */
    async connectProvider(provider, propertyName, isError, data) {
      console.log(provider);
      if (provider === "telegram") {
        return; //Вызов api телеграма происходим из iframe. Поэтому прерываем функцию
      }

      let payload = data; // Если операция была провалена из-за неправильного пароля - запишем переданные при перевызове функции данные, чтобы не запрашивать их снова

      if (!data) {
        await this.getProviderData(provider, propertyName).then(
          providerData => {
            payload = { id: this.user.id, providerData }; // Скомпонуем данные для запроса
          }
        );
      }

      this.askPassword(isError).then(async password => {
        payload = { ...payload, password }; // добавим в данные указанный пароль
        this.handleApiResponse("connect", payload, provider, propertyName);
      });
    },

    /**
     * Отправим запрос на обновление данных об oauth провайдере
     *
     * @param provider               Наименование oauth провайдера
     * @param propertyName           Наименование window.свойства oauth провайдера, в котором вызывается его api
     *
     */
    async updateProviderData(provider, propertyName) {
      if (provider === "telegram") {
        return; //Вызов api телеграма происходим из iframe. Поэтому прерываем функцию
      }

      this.getProviderData(provider, propertyName).then(async providerData => {
        const providerID = this[provider].id,
          payload = { id: this.user.id, providerID, providerData }; // Скомпонуем данные для отправки api запроса

        this.handleApiResponse("updateProviderData", payload, provider);
      });
    },

    /**
     * Отсоединим профиль oauth провайдера от аккаунта пользователя
     *
     * @param provider               Наименование oauth провайдера
     * @param isError                Если пользователь подтвердил операцию неправильным паролем - данный метод перезапускается и в этом параметре передается текст ошибки
     */
    disconnectProvider(provider, propertyName = null, isError) {
      this.askPassword(isError).then(async password => {
        const payload = { id: this.user.id, provider, password }; // Скомпонуем данные для запроса
        this.handleApiResponse("disconnect", payload, provider);
      });
    },

    /**
     * Отправляем api-запрос и обрабатываем присланный ответ
     *
     * @param action                 Выполняемое действие (connect/disconnect/updateProviderData). Необходимо для формирования url запроса и/или(в первых двух случаях)
     *                               повторного вызова функции при неправильно введенном пароле
     * @param payload                Отправляемые запросом данные
     * @param provider               Наименование oauth провайдера, в отношении которого производятся действия
     * @param propertyName           Название window.свойства, в котором хранятся методы взаимодействия с api провайдера. Необходим при "connect" операции,
     *                               поэтому по умолчанию равен null
     */
    async handleApiResponse(action, payload, provider, propertyName = null) {
      const { user, success, error } = await userAPI.settings(
        `oauth/${action}`,
        payload
      );

      if (error) {
        const { errorType, message } = controllers.handleErrors(error);
        if (errorType === "passwordError") {
          // Если указан неправильный пароль - вызовем рекурсивно метод, результат вызова которого обрабатывается
          this[`${action}Provider`](provider, propertyName, message, payload);
        }
        return;
      }

      // Обновим инстанс пользователя
      this.$store.commit("user/setUser", user);

      controllers.successNotify(success);
    },

    /**
     * Спросим у пользователя пароль для подтверждения операции
     *
     * @param isError                Текст ошибки. Если параметр передается - пользователь указал неверный пароль и ему предложено указать его заново
     */
    askPassword(isError) {
      return new Promise(resolve => {
        this.$q
          .dialog({
            component: askPassword,
            root: this.$root,
            isError
          })
          .onOk(password => {
            resolve(password);
          });
      });
    },

    /**
     * Метод рендера списка сторонних приложений авторизации
     */
    providersList(h) {
      const providers = ["google", "facebook", "vk", "telegram"];
      let nodes = [];

      providers.forEach(provider => {
        nodes.push(
          h("q-item", { attrs: { clickable: true } }, [
            h("q-item-section", { attrs: { avatar: true } }, [
              h("q-icon", {
                staticClass: `${provider}-color`,
                attrs: { name: `mdi-${provider}` }
              })
            ]),
            h("q-item-section", [
              h("q-item-label", { staticClass: "text-uppercase" }, provider),
              h(
                "q-item-label",
                { attrs: { caption: true } },
                this.isAppConnected(provider)
              ),
              this.providerDetails(h, provider)
            ]),
            h("q-item-section", { attrs: { side: true } }, [
              this.controlSide(h, provider, this[provider].windowProp)
            ])
          ])
        );
      });

      return nodes;
    },

    providerDetails(h, provider) {
      const providerID = this[provider].id;

      if (providerID) {
        return [
          h("q-item-label", { attrs: { caption: true } }, [
            h(
              "span",
              {
                staticClass: "cursor-pointer dashed",
                on: {
                  click: () => {
                    if (this[provider].data.link !== undefined) {
                      openURL(this[provider].data.link);
                    }
                  }
                }
              },
              this[provider].detail
            ),
            h("span", { staticClass: "dot-separate" }),
            h("span", [
              h(
                "span",
                `${this.$t("oauth.lastUpdate")}: ${date.dateFromIso(
                  this[provider].data.updated
                )}`
              )
            ])
          ])
        ];
      }
    },

    /**
     * Метод рендера блока управления привязанным профилем oauth провайдера
     *
     * @param provider               Наименование oauth провайдера
     * @param propertyName           Наименование window.свойства oauth провайдера, в котором вызывается его api
     *
     */
    controlSide(h, provider, propertyName) {
      const providerID = this[provider].id;

      if (providerID) {
        return [
          h("div", { ref: provider, attrs: { id: provider } }, [
            h(
              "q-btn",
              {
                attrs: {
                  round: true,
                  flat: true,
                  icon: "mdi-cached",
                  color: "green-6"
                },
                on: {
                  click: () => {
                    this.updateProviderData(provider, propertyName);
                  }
                }
              },
              [this.tooltip(h, this.$t("oauth.updateProvider"))]
            )
          ]),
          h(
            "q-btn",
            {
              attrs: {
                round: true,
                flat: true,
                icon: "mdi-link-off",
                color: "red-6"
              },
              on: {
                click: () => {
                  if (this.user.password === null) {
                    // Если у пользователя не установлен пароль от аккаунта - уведомим, что его необходимо установить для осуществления операции
                    return controllers.setPasswordDialog();
                  }

                  this.disconnectProvider(provider);
                }
              }
            },
            [this.tooltip(h, this.$t("oauth.disconnectProvider"))]
          )
        ];
      } else {
        return h("div", { ref: provider, attrs: { id: provider } }, [
          h(
            "q-btn",
            {
              attrs: {
                round: true,
                flat: true,
                icon: "mdi-link-plus",
                color: "green-6"
              },
              on: {
                click: () => {
                  if (this.user.password === null) {
                    // Если у пользователя не установлен пароль от аккаунта - уведомим, что его необходимо установить для осуществления операции
                    return controllers.setPasswordDialog();
                  }

                  this.connectProvider(provider, propertyName);
                }
              }
            },
            [this.tooltip(h, this.$t("oauth.connectProvider"))]
          )
        ]);
      }
    },

    /**
     * Метод рендера тултипов
     *
     * @param message                Текст тултипа
     */
    tooltip(h, message) {
      return h("q-no-ssr", [
        h(
          "q-tooltip",
          {
            attrs: {
              transitionShow: "scale",
              transitionHide: "scale"
            }
          },
          message
        )
      ]);
    }
  },

  render(h) {
    return h("div", [
      h("q-list", [
        h("q-item-label", { attrs: { header: true } }, this.$t("oauth.title")),
        this.providersList(h)
      ])
    ]);
  }
};
</script>

<style scope>
#telegram {
  position: relative;
}
#telegram button {
  pointer-events: none; /*Чтобы событие клика проходило сквозь кнопку и достигала iframe, вызывая срабатывание api telegram. Проверить работу на продакшене*/
}

#telegram iframe {
  position: absolute;
  right: 0;
  height: 3em;
  width: 3em;
  opacity: 1;
  z-index: -1; /* @todo разобраться с всплывание и погружением события клик. Чтобы был эффект hover на кнопке и прокликивался iframe */
}
</style>
