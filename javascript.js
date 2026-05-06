const TILE_STATUSES = {
  HIDDEN: "hidden",
  MINE: "mine",
  NUMBER: "number",
  MARKED: "marked",
};

function startGame() {
  const messageContainer1 = document.getElementById("warnungF");
  const messageContainer2 = document.getElementById("warnungM");
  const feld = document.getElementById("feld");
  const mienenAnzahl = document.getElementById("mienenAnzahl");

  if (
    feld.value == "" ||
    feld.value < 0 ||
    feld.value > 10 ||
    mienenAnzahl.value == "" ||
    mienenAnzahl.value < 0 ||
    mienenAnzahl.value > feld.value * feld.value * 0.6
  ) {
    feld.setAttribute("class", "error");
    mienenAnzahl.setAttribute("class", "error");
    messageContainer1.innerHTML = "Bitte einen Wert von 1-10 eingeben";
    messageContainer2.innerHTML =
      "Bitte höchstens 60% von der Größe des Felds eingeben";
  } else {
    if (mienenAnzahl.length > 0) {
      e.preventDefault();

      messageContainer2.innerText = mienenAnzahl.join(", ");
    }

    document.getElementById("infomation").style.visibility = "visible";
    document.getElementById("setDialog").open = false;
    document.getElementById("button3").style.visibility = "visible";
    var BOARD_SIZE = feld.value;
    var NUMBER_OF_MINES = mienenAnzahl.value;

    const board = createBoard(BOARD_SIZE, NUMBER_OF_MINES);
    const boardElement = document.querySelector(".board");
    const minesLeftText = document.querySelector("[data-mine-count]");
    const messageText = document.querySelector(".subtext");

    board.forEach((row) => {
      row.forEach((tile) => {
        boardElement.append(tile.element);
        tile.element.addEventListener("click", () => {
          revealTile(board, tile);
          checkGameEnd();
        });
        tile.element.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          markTile(tile);
          listMinesLeft();
        });
      });
    });
    boardElement.style.setProperty("--size", BOARD_SIZE);
    minesLeftText.textContent = NUMBER_OF_MINES;

    var timerId = setTimeout(function tick() {
      var counter = parseInt(
        document.getElementById("timeRemaning").textContent
      );
      document.getElementById("timeRemaning").textContent = counter + 1;
      if ((counter < 1000000) & finished) timerId = setTimeout(tick, 1000);
    }, 1000);

    function listMinesLeft() {
      const markedTilesCount = board.reduce((count, row) => {
        return (
          count +
          row.filter((tile) => tile.status === TILE_STATUSES.MARKED).length
        );
      }, 0);

      minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount;
    }

    function checkGameEnd() {
      const win = checkWin(board);
      const lose = checkLose(board);

      if (win || lose) {
        boardElement.addEventListener("click", stopProp, { capture: true });
        boardElement.addEventListener("contextmenu", stopProp, {
          capture: true,
        });
      }

      if (win) {
        myFunction();
      }
      if (lose) {
        clearTimeout(timerId);
        loseGame();
        board.forEach((row) => {
          row.forEach((tile) => {
            if (tile.status === TILE_STATUSES.MARKED) markTile(tile);
            if (tile.mine) {
              revealTile(board, tile);
            }
          });
        });
      }
    }

    function stopProp(e) {
      e.stopImmediatePropagation();
    }
    function createBoard(boardSize, numberOfMines) {
      const board = [];
      const minePositions = getMinePositions(boardSize, numberOfMines);

      for (let x = 0; x < boardSize; x++) {
        const row = [];
        for (let y = 0; y < boardSize; y++) {
          const element = document.createElement("div");
          element.dataset.status = TILE_STATUSES.HIDDEN;

          const tile = {
            element,
            x,
            y,
            mine: minePositions.some(positionMatch.bind(null, { x, y })),
            get status() {
              return this.element.dataset.status;
            },
            set status(value) {
              this.element.dataset.status = value;
            },
          };

          row.push(tile);
        }
        board.push(row);
      }
      return board;
    }

    function getMinePositions(boardSize, numberOfMines) {
      const positions = [];

      while (positions.length < numberOfMines) {
        const position = {
          x: randomNumber(boardSize),
          y: randomNumber(boardSize),
        };

        if (!positions.some(positionMatch.bind(null, position))) {
          positions.push(position);
        }
      }

      return positions;
    }
    function positionMatch(a, b) {
      return a.x === b.x && a.y === b.y;
    }

    function randomNumber(size) {
      return Math.floor(Math.random() * size);
    }

    function nearbyTiles(board, { x, y }) {
      const tiles = [];

      for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
          const tile = board[x + xOffset]?.[y + yOffset];
          if (tile) tiles.push(tile);
        }
      }

      return tiles;
    }
    function checkWin(board) {
      return board.every((row) => {
        return row.every((tile) => {
          return (
            tile.status === TILE_STATUSES.NUMBER ||
            (tile.mine &&
              (tile.status === TILE_STATUSES.HIDDEN ||
                tile.status === TILE_STATUSES.MARKED))
          );
        });
      });
    }

    function checkLose(board) {
      return board.some((row) => {
        return row.some((tile) => {
          return tile.status === TILE_STATUSES.MINE;
        });
      });
    }
    function markTile(tile) {
      if (
        tile.status !== TILE_STATUSES.HIDDEN &&
        tile.status !== TILE_STATUSES.MARKED
      ) {
        return;
      }

      if (tile.status === TILE_STATUSES.MARKED) {
        tile.status = TILE_STATUSES.HIDDEN;
      } else {
        tile.status = TILE_STATUSES.MARKED;
      }
    }
    function revealTile(board, tile) {
      if (tile.status !== TILE_STATUSES.HIDDEN) {
        return;
      }

      if (tile.mine) {
        tile.status = TILE_STATUSES.MINE;
        return;
      }
      tile.status = TILE_STATUSES.NUMBER;
      const adjacentTiles = nearbyTiles(board, tile);
      const mines = adjacentTiles.filter((t) => t.mine);
      if (mines.length === 0) {
        adjacentTiles.forEach(revealTile.bind(null, board));
      } else {
        tile.element.textContent = mines.length;
      }
    }
    function myFunction() {
      finished = false;
      document.getElementById("winDialog").open = true;
      document.getElementById("timeofthegame").innerHTML =
        document.getElementById("timeRemaning").textContent;
    }
    function loseGame() {
      finished = false;
      document.getElementById("loseDialog").open = true;
      document.getElementById("timeofthegame2").innerHTML =
        document.getElementById("timeRemaning").textContent;
    }
  }
}

/* function gameInfo() {
  document.getElementById("beschreibung").open = true;
} */

var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
