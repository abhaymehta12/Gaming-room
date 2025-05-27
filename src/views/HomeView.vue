<template>
  <v-container class="pa-9" fluid>
    <v-row justify="center">
      <v-col cols="auto">
        <v-img max-width="535" src="../assets/R_M_C_S.png"></v-img>
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
          <v-btn
            :disabled="validate"
            @click="joinGroup('lounge')"
            class="ml-3"
            slot="append"
            >Lounge</v-btn
          >
        </v-text-field>
      </v-col>
    </v-row>
    <v-row class="mt-0" justify="center">
      <v-col class="pa-0" cols="auto">
        <v-text-field
          :rules="inputRules"
          v-model="lounge"
          placeholder="Enter lounge id"
          class="loungeField"
        >
          <v-btn :disabled="validateid" @click="openNameDialog" slot="append"
            >Join</v-btn
          >
        </v-text-field>
      </v-col>
    </v-row>
    <v-carousel :show-arrows="false" cycle hide-delimiters height="70">
      <v-carousel-item v-for="(rule, i) in gameRules" :key="i">
        <div class="text-sm-h4 text-h5 text-center">
          {{ rule }}
        </div>
      </v-carousel-item>
    </v-carousel>

    <v-dialog v-model="dialog" max-width="400" persistent light>
      <v-card class="pa-8" color="white">
        <v-card-title class="pl-0">Provide a name to join</v-card-title>
        <v-text-field
          :rules="inputRules"
          required
          v-model="name"
          outlined
        ></v-text-field>
        <div class="d-flex justify-center">
          <v-btn
            color="success"
            variant="tonal"
            :disabled="validate"
            @click="joinExistingLounge"
            class="ma-5"
            >Done</v-btn
          >
          <v-btn
            class="ma-5"
            color="primary"
            variant="tonal"
            @click="closeDialog"
            >Cancel</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
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
    lounge: "",
    dialog: false,
  }),

  computed: {
    ...mapState("dataModule", { groups: (state) => state.groups }),

    validate() {
      return !(this.name && this.name.length >= 3);
    },
    validateid() {
      return !(this.lounge && this.lounge.length >= 18);
    },
  },

  methods: {
    ...mapActions("dataModule", ["addMember", "joinLounge"]),
    async joinGroup(param) {
      let obj = {
        name: this.name,
        type: param,
      };
      const resp = await this.addMember(obj);
      if (resp) {
        alert(resp);
      } else {
        this.name = "";
        param === "lounge"
          ? this.$router.push("/lounge")
          : this.$router.push("/game");
      }
    },
    async joinExistingLounge() {
      let obj = {
        name: this.name,
        id: this.lounge,
      };
      const resp = await this.joinLounge(obj);
      if (resp) {
        alert(resp);
      } else {
        this.$router.push("/lounge");
      }
    },
    openNameDialog() {
      this.dialog = true;
    },
    closeDialog() {
      this.name = "";
      this.dialog = false;
    },
  },
};
</script>

<style scoped>
::v-deep .v-carousel {
  top: 20px;
}
.loungeField {
  width: 354px;
}
</style>