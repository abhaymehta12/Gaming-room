<template>
  <v-container v-if="lounge" class="text-center">
    <div class="text-right">
       <span class="header">Welcome to our Lounge !!</span>
      <v-icon @click="leaveGroup" width: size="x-large">mdi-close</v-icon>
    </div>
    <v-avatar color="secondary" class="mt-4">
      Members: {{ lounge.count }}
    </v-avatar>
    <v-card class="pa-2 mt-5" v-for="(ele, m) in lounge.members" :key="m">
      <v-card-title class="justify-center">{{ ele.name }}</v-card-title>
    </v-card>
    <v-btn v-if="showButton" @click="addGroup" class="mt-5">Lets Go !!</v-btn>
  </v-container>
  <Loading v-else />
</template>

<script>
import Loading from "../components/loading.vue";
import { mapState, mapActions } from "vuex";
export default {
  name: "Lounge",
  components: {
    Loading,
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
    ...mapActions("dataModule", ["startGame", "deleteMember"]),

    onUnload() {
      if (this.playerInfo && !this.continueFlag) {
        this.deleteMember(this.playerInfo.id);
      }
    },
    async addGroup() {
      this.continueFlag = true;
      await this.startGame();
      this.$router.push("/game");
    },
    leaveGroup() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.header {
  position: absolute;
  left: 43%;
  color: coral;
}
.v-avatar {
  width: 100px !important;
  height: 100px !important;
}
</style>