export default async ({ Vue }) => {
  Vue.prototype.$getFullDrop = function(drop) {
    return drop.filter(item => {
      return item.type === 'weapon' || item.type === 'armor' || item.type === 'jewelry';
    });
  };

  Vue.mixin({
    data() {
      return {};
    },
    methods: {},
  });
};
