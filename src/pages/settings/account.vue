<script>
import { debounce } from "quasar";

import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
import date from "handlers/date";

export default {
  name: "accountSettingsPage",
  meta() {
    return {
      title: this.$t("titles.settings.account"),
      titleTemplate: title =>
        `${title} - ${this.$t("titles.settings.main")} - L2Schedule`
    };
  },

  async preFetch({ store }) {
    /**
     * Загружаем список временных зон
     */
    const lang = store.state.user.language;
    await import(`lang/${lang}/timezones-countries`).then(data => {
      store.commit("user/setTimezonesAndCountriesLists", data.default);
    });
  },

  async beforeMount() {
    if (process.env.CLIENT) {
      // Запускаем таймер для отображения часов в реальном времени под селектом с часовыми поясами
      this.clock();
    }
  },

  destroyed() {
    // Удаляем таймер
    clearInterval(this.clockID._id);
  },

  props: ["userInstance", "lang", "timezoneList", "timezone", "countriesList"],
  data() {
    return {
      username: this.userInstance.username,
      email: this.userInstance.email,
      password: "",

      metadata: {
        language: this.lang,
        timezone: this.timezone,
        country: this.userInstance.metadata.country
      },

      usernameError: false,
      emailError: false,
      passwordError: false,

      usernameErrorMessage: "",
      emailErrorMessage: "",
      passwordErrorMessage: "",

      loading: {
        username: false,
        email: false,
        submit: false
      },

      timezoneOptions: this.timezoneList,
      languageOptions: [
        { label: "Русский", value: "ru" },
        { label: "Українська", value: "uk" },
        { label: "English", value: "en-us" }
      ],
      countriesOptions: this.countriesList,

      time: date.now(this.timezone),
      clockID: null // Сюда записывается идентификатор setInterval-функции в методе clock()
    };
  },

  computed: {
    user() {
      return {
        username: this.username,
        email: this.email
      };
    },
    /**
     * Проверяем отсутствие ошибок и разблокируем кнопку отправки
     */
    canSubmit() {
      let anyChanges = false;
      for (let field in this.user) {
        if (this.user[field] !== this.userInstance[field]) {
          anyChanges = true;
          break;
        }
      }

      if (this.metadata.language !== this.lang) {
        anyChanges = true;
      }

      if (this.metadata.timezone && this.metadata.timezone !== this.timezone) {
        anyChanges = true;
      }

      if (
        this.metadata.country &&
        this.metadata.country !== this.userInstance.metadata.country
      ) {
        anyChanges = true;
      }

      return !anyChanges ||
        this.usernameError ||
        this.emailError ||
        (this.needPasswordConfirm &&
          (this.passwordError ||
            this.password.length < 7 ||
            this.password.length > 30))
        ? false
        : true;
    },

    /**
     * Если пользователь внес изменения в email адрес или никнейм - запрашиваем у него пароль для подтверждения
     */
    needPasswordConfirm() {
      if (
        (typeof this.userInstance === "object" &&
          this.username !== this.userInstance.username) ||
        this.email !== this.userInstance.email
      ) {
        return true;
      } else {
        this.password = "";
        return false;
      }
    }
  },

  methods: {
    async submit() {
      if (this.canSubmit) {
        this.loading.submit = true;
        let payload = {
          user: this.user,
          metadata: this.metadata,
          id: this.userInstance.id
        };
        const lang = this.metadata.language; //@todo payload в computed. lang вытаскивать в api из свойства metadata

        if (this.needPasswordConfirm) {
          payload = { ...payload, password: this.password };
        }

        const { user, success, error } = await userAPI.submitAccountSettings(
          payload,
          lang
        );
        this.loading.submit = false;

        if (error) {
          const { errorType, message } = controllers.handleErrors(error);
          this[errorType] = true;
          this[`${errorType}Message`] = message;

          return;
        }

        // Устанавливаем новый инстанс пользователя
        this.$store.commit("user/setUser", user);

        if (this.metadata.timezone !== this.timezone) {
          //Меняем локализацию luxon только если пользователь сменил часовой пояс
          date.setDefaultZone(this.metadata.timezone);
          date.setTimezoneCookie(this.metadata.timezone);
        }

        if (this.metadata.language !== this.lang) {
          //Меняем локализацию только если пользователь сменил язык
          this.$store.dispatch("user/changeLanguage", lang).then(() => {
            this.timezoneOptions = this.timezoneList; // Обновляем список часовых поясов, который используется селектом, для перевода текущего выбранного пояса
            this.countriesOptions = this.countriesList; // Обновляем список стран, который используется селектом, для перевода текущей выбранной страны
          });
        }

        controllers.successNotify(success);
      }
    },

    /**
     * Фильтруем опции выпадающего списка с перечнем временных зон
     */
    timezonesFilterFn(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        this.timezoneOptions = this.timezoneList.filter(v => {
          if (v.label.toLowerCase().indexOf(needle) > -1) return v;
        });
      });
    },

    /**
     * Фильтруем опции выпадающего списка с перечнем стран
     */
    countriesFilterFn(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        this.countriesOptions = this.countriesList.filter(v => {
          if (v.label.toLowerCase().indexOf(needle) > -1) return v;
        });
      });
    },

    /**
     * Рендер инпута для email адреса по условию
     */
    __emailInput(h) {
      if (this.userInstance.email) {
        return h(
          "q-input",
          {
            attrs: {
              autocomplete: false,
              value: this.email,
              label: this.$t("labels.email"),
              hint: this.$t("hints.settings.email"),
              error: this.emailError,
              errorMessage: this.emailErrorMessage,
              loading: this.loading.email
            },
            on: {
              input: value => {
                this.email = value;
                this.loading.email = true;
              }
            }
          },
          [
            h("q-spinner-puff", {
              attrs: {
                color: this.emailError ? "negative" : "primary"
              },
              slot: "loading"
            })
          ]
        );
      }
    },

    /**
     * Рендер инпута для пароля по условию
     */
    __passwordInput(h) {
      if (this.needPasswordConfirm)
        return h(
          "q-input",
          {
            attrs: {
              autocomplete: false,
              type: this.hidePwd ? "password" : "text",
              maxlength: 30,
              counter: true,
              value: this.password,
              label: this.$t("labels.password"),
              hint: this.$t("hints.settings.password"),
              error:
                this.passwordError ||
                this.password.length < 7 ||
                this.password.length > 30,
              errorMessage:
                this.passwordErrorMessage || this.$t("hints.settings.password")
            },
            on: {
              input: value => {
                this.passwordError = false;
                this.passwordErrorMessage = "";

                this.password = value;
                this.passwordErrorMessage = controllers.validatePassword(value);

                if (this.passwordErrorMessage) {
                  this.passwordError = true;
                }
              }
            }
          },
          [
            h("q-icon", {
              staticClass: "cursor-pointer q-ml-sm",
              attrs: {
                name: this.hidePwd ? "fas fa-eye" : "fas fa-eye-slash"
              },
              on: {
                click: () => {
                  this.hidePwd = !this.hidePwd;
                }
              },
              slot: "append"
            })
          ]
        );
    },

    /**
     * Хинт для блока выбора часового пояса. В нем указывается текущее время в выбранном часовом поясе и наличие перехода на зимнее/летнее время
     */
    __timezoneHint(h) {
      const timezone = this.metadata.timezone;

      let message = `${this.$t("hints.settings.now")} - ${this.time}`;
      if (date.isTimezoneInDST(timezone)) {
        message += `. ${this.$t("hints.settings.DST")}`;
      }

      if (timezone == null) {
        message = "";
      }

      return [h("span", message)];
    },

    clock() {
      this.clockID = setInterval(() => {
        this.time = date.now(this.metadata.timezone);
      }, 1000);
    },

    /**
     * Рендер кнопки отправки формы по условию
     */
    __submitButton(h) {
      return h(
        "q-btn",
        {
          staticClass: "float-right q-my-lg",
          class: {
            loading: this.loading.submit
          },
          attrs: {
            label: this.$t("labels.save"),
            loading: this.loading.submit,
            color: this.canSubmit ? "green-6" : "red-6",
            disable: !this.canSubmit
          },
          on: {
            click: () => {
              this.submit();
            }
          }
        },
        [
          h(
            "div",
            {
              slot: "loading"
            },
            [this._v(this.$t("labels.sending")), h("q-spinner-dots")]
          )
        ]
      );
    }
  },

  watch: {
    username: debounce(async function(username) {
      this.usernameError = false;
      this.usernameErrorMessage = "";

      if (username.length && username !== this.userInstance.username) {
        const { message } = await controllers.checkUsername(username);

        if (message) {
          this.usernameError = true;
          this.usernameErrorMessage = message;
        }
      }

      this.loading.username = false;
    }, 1500),

    email: debounce(async function(email) {
      this.emailError = false;
      this.emailErrorMessage = "";

      if (email.length && email !== this.userInstance.email) {
        const { message } = await controllers.checkEmail(email);

        if (message) {
          this.emailError = true;
          this.emailErrorMessage = message;
        }
      }

      this.loading.email = false;
    }, 1500)
  },

  render(h) {
    return h("div", { staticClass: "form" }, [
      h(
        "q-input",
        {
          attrs: {
            autocomplete: false,
            value: this.username,
            label: this.$t("labels.username"),
            hint: this.$t("hints.settings.username"),
            error: this.usernameError,
            errorMessage: this.usernameErrorMessage,
            loading: this.loading.username
          },
          on: {
            input: value => {
              this.username = value;
              this.loading.username = true;
            }
          }
        },
        [
          h("q-spinner-puff", {
            attrs: {
              color: this.usernameError ? "negative" : "primary"
            },
            slot: "loading"
          })
        ]
      ),

      this.__emailInput(h),
      this.__passwordInput(h),

      h(
        "q-select",
        {
          style: {
            "max-width": "500px"
          },
          props: {
            value: this.metadata.timezone,
            label: this.$t("labels.timezone"),
            bottomSlots: true,
            useInput: true,
            hideSelected: true,
            fillInput: true,
            options: this.timezoneOptions,
            optionsDense: true,
            optionsSelectedClass: "selected",
            emitValue: true,
            mapOptions: true
          },
          on: {
            input: value => {
              this.metadata.timezone = value;
            },
            filter: (value, update, abort) => {
              this.timezonesFilterFn(value, update, abort);
            },
            blur: () => {
              this.timezoneOptions = this.timezoneList; // При потери фокуса на селекте записываем в свойство с опциями стандартный список
            }
          },
          scopedSlots: {
            option: scope =>
              h("q-item", { props: scope.itemProps, on: scope.itemEvents }, [
                h("q-item-section", `(${scope.opt.utc}) ${scope.opt.label}`)
              ]),
            "no-option": () =>
              h("q-item", { slot: "no-option" }, [
                h("q-item-section", { staticClass: "text-grey" }, [
                  this._v(`${this.$t("labels.noTimezone")}`)
                ])
              ])
          }
        },
        [
          h(
            "div",
            { staticClass: "multiline-hint", slot: "hint" },
            this.__timezoneHint(h)
          ),
          h("q-icon", {
            staticClass: "cursor-pointer q-ml-sm",
            slot: "append",
            attrs: {
              name: "fas fa-times"
            },
            on: {
              click: () => {
                this.metadata.timezone = null;
              }
            }
          })
        ]
      ),

      h(
        "q-select",
        {
          style: {
            "max-width": "500px"
          },
          props: {
            value: this.metadata.country,
            label: this.$t("labels.country"),
            hint: this.$t("hints.settings.country"),
            bottomSlots: true,
            useInput: true,
            hideSelected: true,
            fillInput: true,
            options: this.countriesOptions,
            optionsDense: true,
            optionsSelectedClass: "selected",
            emitValue: true,
            mapOptions: true
          },
          on: {
            input: value => {
              this.metadata.country = value;
            },
            filter: (value, update, abort) => {
              this.countriesFilterFn(value, update, abort);
            },
            blur: () => {
              this.countriesOptions = this.countriesList; // При потери фокуса на селекте записываем в свойство с опциями стандартный список
            }
          },
          scopedSlots: {
            "no-option": () =>
              h("q-item", { slot: "no-option" }, [
                h("q-item-section", { staticClass: "text-grey" }, [
                  this._v(`${this.$t("labels.noCountry")}`)
                ])
              ])
          }
        },
        [
          h("q-icon", {
            staticClass: "cursor-pointer q-ml-sm",
            slot: "append",
            attrs: {
              name: "fas fa-times"
            },
            on: {
              click: () => {
                this.metadata.country = null;
              }
            }
          })
        ]
      ),

      h("q-select", {
        style: {
          "max-width": "300px"
        },
        props: {
          value: this.metadata.language,
          label: this.$t("labels.language"),
          options: this.languageOptions,
          optionsSelectedClass: "selected",
          emitValue: true,
          mapOptions: true
        },
        on: {
          input: value => {
            this.metadata.language = value;
          }
        },
        scopedSlots: {
          option: scope =>
            h("q-item", { props: scope.itemProps, on: scope.itemEvents }, [
              h("q-item-section", { props: { avatar: true } }, [
                h("q-avatar", { props: { size: "30px" } }, [
                  h("img", {
                    attrs: { src: `statics/flags/${scope.opt.value}.svg` }
                  })
                ])
              ]),
              h("q-item-section", scope.opt.label)
            ]),
          "selected-item": scope => [
            h("q-avatar", { staticClass: "q-mr-sm", props: { size: "16px" } }, [
              h("img", {
                attrs: { src: `statics/flags/${scope.opt.value}.svg` }
              })
            ]),

            h("span", scope.opt.label)
          ]
        }
      }),

      this.__submitButton(h)
    ]);
  }
};
</script>