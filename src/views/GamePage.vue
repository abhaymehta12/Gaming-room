<template>
  <v-container class="pa-4" fluid>
    <div class="text-right">
      <span class="message" v-if="message">{{ message }}</span>
      <span class="shuffleTimer" v-if="shuffleTime"
        >Game Starts in {{ shuffleTime }}</span
      >
      <span class="timer" v-if="gameTime && group.gameStatus !== 'round2'">{{
        gameTime
      }}</span>
      <span class="timerRound2" v-if="gameTime && group.gameStatus === 'round2'"
        >Round 2: {{ gameTime }}</span
      >
      <v-icon @click="leaveGroup" size="x-large">mdi-close</v-icon>
    </div>
    <v-row v-if="playerInfo && group" justify="center" class="mt-1">
      <v-col cols="6" v-for="(ele, n) in group.members" :key="n">
        <v-card class="pa-3">
          <div class="d-flex justify-center">
            <v-avatar size="110" color="blue-grey">
              <v-icon size="80">mdi-account-circle</v-icon>
            </v-avatar>
          </div>
          <div class="d-flex justify-center">
            <v-card-title class="pa-2">{{ ele.name }}</v-card-title>
          </div>
          <div class="text-center">
            <v-card-subtitle
              class="pa-1"
              v-if="
                (ele.id === playerInfo.id || playerInfo.role === 'over') &&
                !shuffleTime
              "
              >{{ ele.role }}</v-card-subtitle
            >
            <v-card-subtitle
              class="pa-1 rollin"
              v-else-if="ele.id !== playerInfo.id && !shuffleTime"
              @click="submitVote(ele)"
              >Rollin</v-card-subtitle
            >
            <v-skeleton-loader
              v-else
              :elevation="24"
              light
              type="text"
            ></v-skeleton-loader>
          </div>
          <v-text-field
            class="pa-0"
            v-model="chat"
            @keydown.enter.prevent="submit"
            v-if="ele.id === playerInfo.id"
          ></v-text-field>
          <v-divider
            v-else
            :thickness="6"
            class="divider border-opacity-25"
          ></v-divider>
        </v-card>
      </v-col>
    </v-row>
    <Loading v-else />
  </v-container>
</template>

<script>
import Loading from "../components/loading.vue";
import { mapState, mapActions } from "vuex";
export default {
  name: "Game",
  components: {
    Loading,
  },
  data: () => ({
    chat: "",
    shuffleTime: 0,
    gameTime: 0,
    message: null,
    votedFor: null,
  }),

  async mounted() {
    window.addEventListener("beforeunload", this.onUnload);
  },

  beforeDestroy() {
    if (this.playerInfo) {
      this.deleteMember(this.playerInfo.id);
    }
  },
  computed: {
    ...mapState("dataModule", {
      playerInfo: (state) => state.playerInfo,
      group: (state) => state.group,
      gameStarted: (state) => state.gameStarted,
    }),
  },
  watch: {
    "group.gameStatus"(val) {
      if (val === "ready" || val === "round2") {
        this.message = null;
        this.shuffleTime = 10;
        let countdown = setInterval(() => {
          this.shuffleTime--;
          if (this.shuffleTime < 3) {
            clearInterval(countdown);
            this.startGame();
          }
        }, 1000);
        if (this.playerInfo && this.playerInfo.id === this.group.shuffler) {
          this.setRoles();
        }
      }
    },
    async gameStarted(val) {
      if (val) {
        this.gameTime = 20;
        let countdown = setInterval(() => {
          this.gameTime--;
          if (this.gameTime < 1) {
            clearInterval(countdown);
            this.gameOver();
          }
        }, 1000);
      }
    },
  },
  methods: {
    ...mapActions("dataModule", [
      "deleteMember",
      "setRoles",
      "getGroupInfo",
      "restartGame",
      "setResults",
      "getResults",
      "gameRoundsOver",
    ]),
    submit() {
      if (this.chat) {
        console.log(this.chat);
      }
    },
    onUnload() {
      if (this.playerInfo) {
        this.deleteMember(this.playerInfo.id);
      }
    },
    leaveGroup() {
      this.$router.push("/");
    },
    submitVote(param) {
      this.votedFor = param;
    },
    async startGame() {
      await this.getGroupInfo();
      this.shuffleTime = 0;
    },
    async gameOver() {
      this.message = "Time's Up !!";
      if (!this.playerInfo) {
        this.leaveGroup;
        return;
      }
      if (this.playerInfo.role === "Chor") {
        if (this.votedFor.role === "Raja") {
          this.message = "On target, Sharp Killer !";
          await this.gameRoundsOver(this.votedFor);
        } else {
          this.message = "Just Missed, One More Try !";
          await this.setResults(this.votedFor);
        }
      } else if (
        this.playerInfo.role === "Raja" &&
        this.votedFor.role === "Chor"
      ) {
        this.message = "Thief killed, True Emporer !";
        await this.gameRoundsOver(this.votedFor);
      } else if (
        this.playerInfo.role === "Mantri" &&
        this.votedFor.role === "Chor"
      ) {
        this.message = "Thief found, Loyal Guard !";
        await this.gameRoundsOver(this.votedFor);
      } else if (
        this.playerInfo.role === "Sipahi" &&
        this.votedFor.role === "Chor"
      ) {
        this.message = "Thief found, Loyal Guard !";
        await this.gameRoundsOver(this.votedFor);
      }
      setTimeout(async () => {
        const result = await this.getResults();
        this.message = result;
      }, 3000);

      setTimeout(() => {
        this.restartGame();
      }, 12000);
    },
  },
};
</script>

<style scoped>
.timer {
  position: absolute;
  left: 50%;
}
.shuffleTimer,
.message,
.timerRound2 {
  position: absolute;
  left: 45%;
  color: coral;
}
.rollin {
  cursor: pointer;
}
.divider {
  margin-top: 53px;
}
</style>