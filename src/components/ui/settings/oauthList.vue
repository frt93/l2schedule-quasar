<script>
import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
import date from "handlers/date";

import askPassword from "components/auth/askPassword";

export default {
  name: "oauthProvidersList",
  beforeMount() {
    if (process.env.CLIENT) {
      import("boot/oAuth").then(data => {
        this.oauth = data.default;
        // Загружаем и инициализируем SDK
        this.oauth.install();
        // Инициализируем telegram виджет
        // const { script } = this.oauth.telegram();
        // this.$refs.providers.appendChild(script);
        // window.onTelegramAuth = this.telegram;
      });
    }
  },

  props: ["user"],
  data() {
    return {
      oauth: {}
    };
  },

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

      if (this.user.metadata.facebookData !== undefined) {
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

      if (this.user.metadata.vkData !== undefined) {
        data.detail = this.user.metadata.vkData.name;
      }

      return data;
    },
    telegram() {
      return {
        id: this.user.metadata.telegramID,
        data: this.user.metadata.telegramData
      };
    },
    isFacebookLinked() {
      let message;
      if (this.facebookID) {
        message = this.$t("oauth.facebookLinked");
      } else {
        message = this.$t("oauth.linkFacebook");
      }

      return message;
    }
  },

  methods: {
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
          this.oauth[provider].login().then(async res => {
            const providerData = await controllers[`${provider}Instance`](res); // Обработаем данные от oauth провайдера
            resolve(providerData);
          });
        });
      };

      return new Promise(resolve => {
        if (!window[propertyName]) {
          // Если SDK выбранного провайдера не инициализировано - загружаем и инициализируем
          this.oauth[provider].load().then(() => {
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
     * Отправим запрос на обновление данных об oauth провайдере
     *
     * @param provider               Наименование oauth провайдера
     * @param propertyName           Наименование window.свойства oauth провайдера, в котором вызывается его api
     *
     */
    async updateProviderData(provider, propertyName) {
      this.getProviderData(provider, propertyName).then(async providerData => {
        const providerID = this[`${provider}ID`],
          payload = { id: this.user.id, providerID, providerData }; // Скомпонуем данные для отправки api запроса

        this.handleApiResponse("updateProviderData", payload, provider);
      });
    },

    /**
     * Подключим профиль oauth провайдера к аккаунту пользователя
     *
     * @param provider               Наименование oauth провайдера
     * @param propertyName           Наименование window.свойства oauth провайдера, в котором вызывается его api
     * @param isError                Если пользователь подтвердил операцию неправильным паролем - данный метод перезапускается и в этом параметре передается текст ошибки
     */
    connectProvider(provider, propertyName, isError) {
      if (this.user.password === null) {
        // Если у пользователя не установлен пароль от аккаунта - уведомим, что его необходимо установить для осуществления операции
        return this.setPassword();
      }
      this.getProviderData(provider, propertyName).then(async providerData => {
        this.askPassword(isError).then(async password => {
          const payload = { id: this.user.id, providerData, password }; // Скомпонуем данные для запроса
          this.handleApiResponse("connect", payload, provider, propertyName);
        });

        //@todo Переделать, чтобы в случа неверного пароля заново не логиниться у провайдера
      });
    },

    /**
     * Отсоединим профиль oauth провайдера от аккаунта пользователя
     *
     * @param provider               Наименование oauth провайдера
     * @param isError                Если пользователь подтвердил операцию неправильным паролем - данный метод перезапускается и в этом параметре передается текст ошибки
     */
    disconnectProvider(provider, propertyName = null, isError) {
      if (this.user.password === null) {
        // Если у пользователя не установлен пароль от аккаунта - уведомим, что его необходимо установить для осуществления операции
        return this.setPassword();
      }

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
          // Если указан неправильный пароль - стриггерим функцию заново
          this[`${action}Provider`](provider, propertyName, message);
        }

        return;
      }
      // Обновим инстанс пользователя
      this.$store.commit("user/setUser", user);

      controllers.successNotify(success);
    },

    /**
     * Уведомим пользователя о необходимости установить пароль от аккаунта для осуществуления операции
     */
    setPassword() {
      return controllers.openDialog(
        this.$t("labels.password"),
        this.$t("hints.settings.needPasswordToChange")
      );
    },

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
     * Метод рендера блока управления привязанным профилем oauth провайдера
     *
     * @param provider               Наименование oauth провайдера
     * @param propertyName           Наименование window.свойства oauth провайдера, в котором вызывается его api
     *
     */
    controlSide(h, provider, propertyName) {
      const providerID = this[provider].id;
      let nodes = [];

      if (providerID) {
        nodes.push(
          h("div", { ref: provider }, [
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
              [
                h("q-no-ssr", [
                  h(
                    "q-tooltip",
                    {
                      attrs: {
                        transitionShow: "scale",
                        transitionHide: "scale"
                      }
                    },
                    this.$t("oauth.updateProvider")
                  )
                ])
              ]
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
                  this.disconnectProvider(provider);
                }
              }
            },
            [
              h("q-no-ssr", [
                h(
                  "q-tooltip",
                  {
                    attrs: {
                      transitionShow: "scale",
                      transitionHide: "scale"
                    }
                  },
                  this.$t("oauth.disconnectProvider")
                )
              ])
            ]
          )
        );
      } else {
        nodes.push(
          h("div", { ref: provider }, [
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
                    this.connectProvider(provider, propertyName);
                  }
                }
              },
              [
                h("q-no-ssr", [
                  h(
                    "q-tooltip",
                    {
                      attrs: {
                        transitionShow: "scale",
                        transitionHide: "scale"
                      }
                    },
                    this.$t("oauth.connectProvider")
                  )
                ])
              ]
            )
          ])
        );
      }

      return nodes;
    },

    providerDetails(h, provider) {
      const providerID = this[provider].id;

      if (providerID !== undefined) {
        return [
          h("q-item-label", { attrs: { caption: true } }, [
            h(
              "span",
              { staticClass: "cursor-pointer dashed" },
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
    }
  },

  render(h) {
    return h("div", { staticClass: "form column" }, [
      h("q-list", { attrs: { padding: true } }, [
        h(
          "q-item-label",
          { attrs: { header: true } },
          "Third-party authorization apps"
        ),
        this.providersList(h)
        // h("q-item", [
        //   h("q-item-section", { attrs: { avatar: true } }, [
        //     h("q-icon", {
        //       staticClass: "facebook-color",
        //       attrs: { name: "mdi-facebook" }
        //     })
        //   ]),
        //   h("q-item-section", [
        //     h("q-item-label", "Facebook"),
        //     this.getProviderData(h).data
        //   ]),
        //   h("q-item-section", { attrs: { side: true, noWrap: true } }, [
        //     this.controlSide(h, "facebook", "FB")
        //   ])
        // ])
      ])
    ]);
  }
};
</script>
