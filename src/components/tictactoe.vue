<template>
  <div class="d-flex justify-space-around mt-10">
    <div class="board">
      <div
        class="square"
        @click="playMove(m)"
        v-for="(val, m) in squares"
        :key="m"
      >
        {{ val }}
      </div>
    </div>
    <div>
      <h1>Let's Play !!</h1>
      <h2>{{ endMessage }}</h2>
      <v-btn class="restartButton pa-5 mt-5" @click="restartButton"
        >Restart</v-btn
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "Tictactoe",

  data: () => ({
    players: ["X", "O"],
    currentPlayer: "X",
    endMessage: `X's turn!`,
    squares: ["", "", "", "", "", "", "", "", ""],
    winning_combinations: [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ],
    isProcessing: false
  }),

  methods: {
    makeAIMove() {
      let blockFlag = false;
      let winFlag = false;
      let blockIndex;

      for (let i = 0; i < this.winning_combinations.length; i++) {
        const [a, b, c] = this.winning_combinations[i];
        if (
          this.squares[a] === "O" &&
          this.squares[b] === "O" &&
          !this.squares[c]
        ) {
          this.squares[c] = this.currentPlayer;
          winFlag = true;
        } else if (
          this.squares[a] === "O" &&
          !this.squares[b] &&
          this.squares[c] === "O"
        ) {
          this.squares[b] = this.currentPlayer;
          winFlag = true;
        } else if (
          !this.squares[a] &&
          this.squares[b] === "O" &&
          this.squares[c] === "O"
        ) {
          this.squares[a] = this.currentPlayer;
          winFlag = true;
        } else if (
          this.squares[a] === "X" &&
          this.squares[b] === "X" &&
          !this.squares[c] &&
          !blockFlag
        ) {
          blockIndex = c;
          blockFlag = true;
        } else if (
          this.squares[a] === "X" &&
          !this.squares[b] &&
          this.squares[c] === "X" &&
          !blockFlag
        ) {
          blockIndex = b;
          blockFlag = true;
        } else if (
          !this.squares[a] &&
          this.squares[b] === "X" &&
          this.squares[c] === "X" &&
          !blockFlag
        ) {
          blockIndex = a;
          blockFlag = true;
        }

        if (winFlag) {
          blockFlag = true;
          break;
        }
      }

      if (winFlag) {
        this.checkMove();
        return;
      }

      if (blockIndex > -1 && !winFlag) {
        this.squares[blockIndex] = this.currentPlayer;
        this.checkMove();
        this.isProcessing = false;
        return;
      }
      const tryRandom = () => {
        const index = Math.floor(Math.random() * 9);
        if (this.squares[index]) {
          setTimeout(tryRandom, 50);
          return;
        }
        this.squares[index] = this.currentPlayer;
        this.checkMove();
        this.isProcessing = false;
      };

      tryRandom();
    },

    playMove(inx) {
      if (this.squares[inx]) {
        return;
      }
      if (!this.isProcessing) {
        this.isProcessing = true;
      } else {
        return;
      }
      if (this.currentPlayer) {
        this.squares[inx] = this.currentPlayer;
      } else {
        this.isProcessing = false;
        return;
      }
      let resp = this.checkMove();
      if (!resp) {
        this.isProcessing = false;
        return;
      }
      if (this.currentPlayer === "O") {
        setTimeout(() => {
          this.makeAIMove();
        }, 1000);
      }
    },
    checkMove() {
      if (this.checkWin(this.currentPlayer)) {
        this.endMessage = `Game over! ${this.currentPlayer} wins!`;
        this.currentPlayer = null;
        return false;
      }
      if (this.checkTie()) {
        this.endMessage = `Game is tied!`;
        return false;
      }
      this.currentPlayer =
        this.currentPlayer === this.players[0]
          ? this.players[1]
          : this.players[0];
      if (this.currentPlayer == this.players[0]) {
        this.endMessage = `X's turn!`;
      } else {
        this.endMessage = `O's turn!`;
      }
      return true;
    },

    checkWin(currentPlayer) {
      for (let i = 0; i < this.winning_combinations.length; i++) {
        const [a, b, c] = this.winning_combinations[i];
        if (
          this.squares[a] === currentPlayer &&
          this.squares[b] === currentPlayer &&
          this.squares[c] === currentPlayer
        ) {
          return true;
        }
      }
      return false;
    },

    checkTie() {
      for (let i = 0; i < this.squares.length; i++) {
        if (this.squares[i] === "") {
          return false;
        }
      }
      return true;
    },

    restartButton() {
      this.squares = ["", "", "", "", "", "", "", "", ""];
      this.endMessage = `X's turn!`;
      this.currentPlayer = this.players[0];
      this.isProcessing = false;
    },
  },
};
</script>

<style scoped>
h1 {
  text-align: center;
}
h2 {
  margin-top: 120px;
  text-align: center;
}

.board {
  width: 300px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 3px;
}

.square {
  max-width: 100px;
  height: 100px;
  border: 1px solid #d3d3d3;
  background-color: #f5f5f5;
  font-size: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
}
.square:hover {
  background-color: #ffffe0;
}
.restartButton {
  margin: auto;
  background-color: #000000;
  color: #ffffff;
  border: 1px solid #000000;
  border-radius: 40px;
  font-size: 18px;
}
</style>