<template>
  <div class="row justify-start">
    <q-card
      class="my-card bg-light col-xs-12 col-sm-6 col-md-4 col-lg-3"
      v-for="boss in rb"
      :key="boss.id"
    >
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 boss-shortname">{{boss.shortname}}</div>
            <div class="subtitle text-subtitle2 text-weight-regular">
              <span class="subtitle-child">{{boss.lvl}} lvl</span>
              <span class="subtitle-child">Palilka2</span>
            </div>
          </div>

          <div class="col-auto">
            <q-btn color="grey-7 card-menu" round flat icon="more_vert">
              <q-menu auto-close @before-show="openMenu" @before-hide="closeMenu">
                <q-list>
                  <q-item clickable>
                    <q-item-section>Редактировать</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Удалить</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="text-body2">
        <div class="drop-list">
          <a class="drop" v-for="item in getFullDrop(boss.drop)" :key="item.id">
            <span class="item-name">{{item.shortname}}</span>
          </a>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import rbMixins from "mixin/rb";
export default {
  mixins: [rbMixins],
  data() {
    return {
      menuNode: null
    };
  },
  computed: {
    rb() {
      return [];
    }
  },
  methods: {
    openMenu(e) {
      this.menuNode = e.target.offsetParent;
      this.menuNode.classList.add("opened");
    },
    closeMenu() {
      this.menuNode.classList.remove("opened");
      this.menuNode = null;
    }
  }
};
</script>

<style lang="stylus" scoped>
@media (max-width: 600px) {
  .my-card {
    margin: 15px 0;
  }
}

@media (min-width: 600px) {
  .my-card {
    margin: 15px;
  }

  .my-card.col-sm-6 {
    width: calc(50% - 30px);
  }
}

@media (min-width: 1024px) {
  .my-card.col-md-4 {
    width: calc(33.3333% - 30px);
  }
}

@media (min-width: 1440px) {
  .my-card.col-lg-3 {
    width: calc(25% - 30px);
  }
}

.subtitle {
  font-size: 0.75rem;
  line-height: 1.25rem;
}

.subtitle-child {
  margin-right: 3px;
}

.drop:not(:last-child):after {
  content: '•';
  border-bottom: none;
  color: #ccc;
  margin: 0 3px;
}

.drop {
  display: inline-flex;
  margin: 0;
}

.my-card .card-menu {
  opacity: 0;
}

.my-card:hover .card-menu, .my-card:focus .card-menu, .my-card .opened.card-menu {
  opacity: 1;
}
</style>