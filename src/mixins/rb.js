export default {
  data() {
    return {};
  },
  methods: {
    getFullDrop(drop) {
      return drop.filter(item => {
        return item.type === 'weapon' || item.type === 'armor' || item.type === 'jewelry';
      });
    },
  },
};
