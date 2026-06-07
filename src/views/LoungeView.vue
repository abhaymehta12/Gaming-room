<template>
  <v-container v-if="lounge" class="text-center">
    <div class="d-flex justify-space-between">
       <span class="header">Welcome to our Lounge !!</span>
      <v-icon @click="leaveGroup" width: size="x-large">mdi-close</v-icon>
    </div>
    <v-avatar color="secondary" class="mt-4 mr-16">
      Members: {{ lounge.count }}
    </v-avatar>
    <v-btn v-if="showButton" @click="addGroup" class="mt-5 ml-16">Lets Go !!</v-btn>
    <v-card class="pa-2 mt-5 d-flex justify-space-around flex-wrap">
      <v-card-title v-for="(ele, m) in lounge.members" :key="m" class="justify-center">{{ ele.name }}</v-card-title>
    </v-card>
    <Tictactoe />
  </v-container>
  <Loading v-else />
</template>

<script>
import Tictactoe from "../components/tictactoe.vue";
import Loading from "../components/loading.vue";
import { mapState, mapActions } from "vuex";
export default {
  name: "Lounge",
  components: {
    Loading,
    Tictactoe,
  },

  data: () => ({
    continueFlag: false,
  }),

  async mounted() {
    window.addEventListener("beforeunload", this.onUnload);
  },

  beforeDestroy() {
    if (this.playerInfo && !this.continueFlag) {
      this.deleteMember(this.playerInfo.id);
    }
  },

  computed: {
    ...mapState("dataModule", {
      playerInfo: (state) => state.playerInfo,
      lounge: (state) => state.lounge,
    }),

    showButton() {
      if (this.lounge && this.lounge.shuffler === this.playerInfo.id) {
        return true;
      } else {
        return false;
      }
    },
  },

  methods: {
    ...mapActions("dataModule", [
      "startGame",
      "deleteMember",
      "listenToGroupCollection",
    ]),

    onUnload() {
      if (this.playerInfo && !this.continueFlag) {
        this.deleteMember(this.playerInfo.id);
      }
    },
    async addGroup() {
      this.continueFlag = true;
      await this.startGame();
      this.$router.push("/game");
      if (this.lounge.count > 1) {
        this.listenToGroupCollection();
      }
    },
    leaveGroup() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.header {
  color: coral;
}
.v-avatar {
  width: 100px !important;
  height: 100px !important;
}
.v-card__title {
  padding: 5px;
}
</style>