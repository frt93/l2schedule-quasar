<script>
import auth from "mixin/auth";
import api from "handlers/user/api";
import date from "handlers/date";

export default {
  name: "accountSettingsPage",
  mixins: [auth],
  props: ["userInstance", "lang", "timezoneList", "timezone"],
  async preFetch({ store }) {
    /**
     * Загружаем список временных зон
     */
    await import(`lang/timezones`).then(data => {
      store.commit("user/setTimezonesList", data.default.timezones);
    });
  },

  mounted() {
    console.log(date.isInDST(this.metadata.timezone));
  },

  data() {
    return {
      user: {
        username: this.userInstance.username,
        email: this.userInstance.email
      },
      metadata: {
        language: this.lang,
        timezone: this.timezone
      },
      languageOptions: [
        { label: "Русский", value: "ru" },
        { label: "Українська", value: "uk" },
        { label: "English", value: "en-us" }
      ],
      timezoneOptions: []
    };
  },

  computed: {
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

      if (this.metadata.timezone !== this.timezone) {
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
        this.user.username !== this.userInstance.username ||
        this.user.email !== this.userInstance.email
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
        const lang = this.metadata.language;

        if (this.needPasswordConfirm) {
          payload = { ...payload, password: this.password };
        }

        const { user, success, error } = await api.submitAccountSettings(
          payload,
          lang
        );
        this.loading.submit = false;

        if (error) {
          return this.handleErrors(error);
        }
        // Устанавливаем новый инстанс пользователя
        this.$store.commit("user/setUser", user);
        //Меняем локализацию luxon
        date.setDefaultLocale(lang);
        date.setDefaultZone(this.metadata.timezone); //@todo только если изменилось
        date.setTimezoneCookie(this.metadata.timezone); //@todo только если изменилось

        //Меняем локализацию i18n
        this.$store.commit("user/changeLanguage", lang);
        this.$i18n.locale = lang;
        await import(`quasar/lang/${lang}`).then(lang => {
          this.$q.lang.set(lang.default);
        });

        this.successNotify(success);
      }
    },

    /**
     * Фильтруем опции выпадающего списка с временными зонами
     */
    filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        this.timezoneOptions = this.timezoneList.filter(v => {
          if (v.label.toLowerCase().indexOf(needle) > -1) return v;
        });
      });
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
                this.password = value;
                this.validatePassword(value);
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

    __timezoneHint(h) {
      return [h("div", `Текущее время - ${date.now()}`)];
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

  meta() {
    return {
      title: this.$t("titles.settings.account"),
      titleTemplate: title =>
        `${title} - ${this.$t("titles.settings.main")} - L2Schedule`
    };
  },

  render(h) {
    return h("div", { staticClass: "form" }, [
      this._v(date.now()),
      h(
        "q-input",
        {
          attrs: {
            autocomplete: false,
            value: this.user.username,
            label: this.$t("labels.username"),
            hint: this.$t("hints.settings.username"),
            error: this.usernameError,
            errorMessage: this.usernameErrorMessage,
            loading: this.loading.username
          },
          on: {
            input: value => {
              this.user.username = value;
              this.loading.username = true;
              if (value !== this.userInstance.username) {
                this.validateUsername(value);
              } else {
                this.validateUsername(value, false); // Никнейм в первоначальном виде. Запрос на проверку уникальности не нужен
              }
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

      h(
        "q-input",
        {
          attrs: {
            autocomplete: false,
            value: this.user.email,
            label: this.$t("labels.email"),
            hint: this.$t("hints.settings.email"),
            error: this.emailError,
            errorMessage: this.emailErrorMessage,
            loading: this.loading.email
          },
          on: {
            input: value => {
              this.user.email = value;
              this.loading.email = true;
              if (value !== this.userInstance.email) {
                this.validateEmail(value);
              } else {
                this.validateEmail(value, false); // Email в первоначальном виде. Запрос на проверку уникальности не нужен
              }
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
      ),

      this.__passwordInput(h),

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

      h(
        "q-select",
        {
          style: {
            "max-width": "300px"
          },
          props: {
            value: this.metadata.timezone,
            label: this.$t("labels.timezone"),
            bottomSlots: true,
            useInput: true,
            options: this.timezoneOptions.length
              ? this.timezoneOptions
              : this.timezoneList,
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
              this.filterFn(value, update, abort);
            }
          }
        },
        [h("div", { slot: "hint" }, this.__timezoneHint(h))]
      ),

      this.__submitButton(h)
    ]);
  }
};
</script>

<style>
/* .flags {
  width: 32px;
  height: 32px;
  float: left;
} */
</style>



