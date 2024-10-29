<template>
  <div>{{ groups }}</div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "Home",

  async mounted() {
    await this.getGroups();
  },

  computed: {
    ...mapState("dataModule", { groups: (state) => state.groups }),
  },

  methods: {
    ...mapActions("dataModule", ["getGroups"]),
  },
};
</script>
