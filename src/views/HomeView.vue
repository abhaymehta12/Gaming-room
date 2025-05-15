<template>
  <v-container class="pa-9" fluid>
    <v-row justify="center">
      <v-col cols="auto">
        <v-img max-width="642" src="../assets/R_M_C_S.png"></v-img>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="auto">
        <v-text-field
          :rules="inputRules"
          v-model="name"
          placeholder="Enter name"
        >
          <v-btn :disabled="validate" @click="joinGroup" slot="append"
            >Go !!</v-btn
          >
        </v-text-field>
      </v-col>
    </v-row>
    <v-carousel :show-arrows="false" cycle hide-delimiters height="70">
      <v-carousel-item v-for="(rule, i) in gameRules" :key="i">
        <div class="text-h4 text-center">
          {{ rule }}
        </div>
      </v-carousel-item>
    </v-carousel>
  </v-container>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "Home",

  data: () => ({
    gameRules: [
      "All are chasing the thief, no points.",
      "2 life's for chor, find the king.",
      "Luck is the key to success.",
    ],
    inputRules: [
      (value) => !!value || "Required.",
      (value) => (value && value.length >= 3) || "Min 3 characters",
    ],
    name: "",
  }),

  computed: {
    ...mapState("dataModule", { groups: (state) => state.groups }),

    validate() {
      return !(this.name && this.name.length >= 3);
    },
  },

  methods: {
    ...mapActions("dataModule", ["addMember"]),
    async joinGroup() {
      const resp = await this.addMember(this.name);
      if (resp) {
        alert(resp);
      } else {
        this.name = "";
        this.$router.push("/game");
      }
    },
  },
};
</script>

<style scoped>
::v-deep .v-carousel {
  top: 20px;
}
</style>