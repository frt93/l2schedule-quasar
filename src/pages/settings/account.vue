<script>
import userAPI from "handlers/user/api";
import controllers from "handlers/user/controllers";
import date from "handlers/date";

import usernameInput from "components/ui/settings/changeUsernameInput";
import emailInput from "components/ui/settings/changeEmailInput";

import { axiosInstance } from "boot/axios";

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
    // Загружаем список временных зон
    const lang = store.state.user.language;
    await import(`lang/${lang}/timezones-countries-languages-list`).then(
      data => {
        store.commit(
          "user/setTimezones_Countries_LanguagesLists",
          data.default
        );
      }
    );
  },

  async beforeMount() {
    if (process.env.CLIENT) {
      // Запускаем таймер для отображения часов в реальном времени под селектом с часовыми поясами
      this.clock();
    }
  },

  destroyed() {
    // Удаляем таймер
    clearInterval(this.clockID);
  },

  props: [
    "userInstance",
    "lang",
    "languagesList",
    "timezoneList",
    "timezone",
    "countriesList",
    "formatDate"
  ],
  data() {
    return {
      language: this.lang,
      tz: this.timezone,
      dateFormat: this.formatDate,
      country: this.userInstance.metadata.country,

      timezoneOptions: this.timezoneList,
      languageOptions: this.languagesList,
      countriesOptions: this.countriesList,

      time: date.now(this.timezone),
      clockID: null, // Сюда записывается идентификатор setInterval-функции в методе clock()
      sending: false
    };
  },

  computed: {
    payload() {
      return {
        language: this.language,
        timezone: this.tz,
        country: this.country || this.userInstance.metadata.country,
        dateFormat: this.dateFormat
      };
    },

    // Проверяем отсутствие ошибок и разблокируем кнопку отправки
    canSubmit() {
      for (let field in this.payload) {
        if (this.payload[field] !== this.userInstance.metadata[field]) {
          return true;
          break;
        }
      }

      return false;
    },

    dateFormatOptions() {
      const formats = [
        "dd.LL.yyyy HH:mm",
        "dd.LL.yyyy HH:mm:ss",
        "dd.LL.yyyy h:mm a",
        "dd.LL.yyyy h:mm:ss a",
        "ccc, dd.LL.yyyy HH:mm",
        "ccc, dd.LL.yyyy HH:mm:ss",
        "ccc, dd.LL.yyyy h:mm a",
        "ccc, dd.LL.yyyy h:mm:ss a",
        "dd MMMM yyyy HH:mm",
        "dd MMMM yyyy HH:mm:ss",
        "dd MMMM yyyy h:mm a",
        "dd MMMM yyyy h:mm:ss a",
        "ccc, dd MMMM yyyy HH:mm",
        "ccc, dd MMMM yyyy HH:mm:ss",
        "ccc, dd MMMM yyyy h:mm a",
        "ccc, dd MMMM yyyy h:mm:ss a"
      ];
      let options = [];
      formats.forEach(format => {
        options.push({
          label: date.setFormat(this.time, format),
          value: format
        });
      });

      return options;
    }
  },

  methods: {
    async submit() {
      if (this.canSubmit) {
        const payload = {
          data: this.payload,
          id: this.userInstance.id
        };
        this.sending = true;

        const { user, success, error } = await userAPI.settings(
          "account",
          payload,
          this.language
        );
        this.sending = false;

        if (error) {
          const { errorType, message } = controllers.handleErrors(error);
          this[errorType] = true;
          this[`${errorType}Message`] = message;

          return;
        }

        if (this.tz !== this.timezone) {
          //Меняем локализацию luxon только если пользователь сменил часовой пояс
          date.setDefaultZone(this.tz);
          date.setTimezoneCookie(this.tz);
        }

        if (this.language !== this.lang) {
          //Меняем локализацию только если пользователь сменил язык
          this.$store
            .dispatch("user/changeLanguage", this.language)
            .then(() => {
              this.timezoneOptions = this.timezoneList; // Обновляем список часовых поясов, который используется селектом, для перевода текущего выбранного пояса
              this.countriesOptions = this.countriesList; // Обновляем список стран, который используется селектом, для перевода текущей выбранной страны
              this.languageOptions = this.languagesList; // Обновляем список языков, который используется селектом, для перевода текущего выбранного языка
            });
        }

        this.$store.commit("user/changeDateFormat", this.dateFormat);

        // Устанавливаем новый инстанс пользователя
        this.$store.commit("user/setUser", user);

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
     * Хинт для блока выбора часового пояса. В нем указывается текущее время в выбранном часовом поясе и наличие перехода на зимнее/летнее время
     */
    __timezoneHint(h) {
      const timezone = this.tz;

      let message = `${this.$t("hints.settings.now")} - ${date.setFormat(
        this.time,
        this.dateFormat
      )}`;
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
        this.time = date.now(this.tz);
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
            loading: this.sending
          },
          attrs: {
            label: this.$t("labels.save"),
            loading: this.sending,
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

  render(h) {
    return h("div", { staticClass: "form" }, [
      h(usernameInput, { props: { user: this.userInstance } }),
      h(emailInput, { props: { user: this.userInstance } }),

      h(
        "q-select",
        {
          staticClass: "col",
          style: {
            "max-width": "500px"
          },
          props: {
            value: this.tz,
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
              this.tz = value;
            },
            filter: (value, update, abort) => {
              this.timezonesFilterFn(value, update, abort);
            },
            blur: () => {
              this.timezoneOptions = this.timezoneList; // При потери фокуса на селекте записываем в свойство с опциями изначальный (не отфильтрованный) список
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
              name: this.tz ? "mdi-close" : ""
            },
            on: {
              click: () => {
                this.tz = null;
              }
            }
          })
        ]
      ),

      h("q-select", {
        staticClass: "col",
        style: {
          "max-width": "300px"
        },
        props: {
          value: this.dateFormat,
          label: this.$t("labels.dateFormat"),
          options: this.dateFormatOptions,
          optionsSelectedClass: "selected",
          emitValue: true,
          mapOptions: true
        },
        on: {
          input: value => {
            this.dateFormat = value;
          }
        }
      }),

      h(
        "q-select",
        {
          style: {
            "max-width": "500px"
          },
          props: {
            value: this.country,
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
              this.country = value;
            },
            filter: (value, update, abort) => {
              this.countriesFilterFn(value, update, abort);
            },
            blur: () => {
              this.countriesOptions = this.countriesList; // При потери фокуса на селекте записываем в свойство с опциями изначальный (не отфильтрованный) список
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
              name: this.country ? "mdi-close" : ""
            },
            on: {
              click: () => {
                this.country = null;
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
          value: this.language,
          label: this.$t("labels.language"),
          options: this.languageOptions,
          optionsSelectedClass: "selected",
          emitValue: true,
          mapOptions: true
        },
        on: {
          input: value => {
            this.language = value;
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