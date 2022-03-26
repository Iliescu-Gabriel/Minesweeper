const squareSize = 50;
let gameOver = false;
let bombs = 0;
let flags = 0;
let squaresArray = [];
let squareCount = 0;

window.onload = function () {
  getElement("#startButton").onclick = function () {
    startGame();
  };
};

function startGame() {
  const difficulty =
    getElement("#dificulty").options[getElement("#dificulty").selectedIndex]
      .text;
  getElement("#start").style.visibility = "hidden";
  if (difficulty == "Easy") squareCount = 10;
  if (difficulty == "Medium") squareCount = 14;
  if (difficulty == "Hard") squareCount = 18;
  createBoard();
}

function createBoard() {
  //Create a canvas to be able to put the squares into it in a grid fashion
  let canvas = getElement("#canvas");
  // Set up the style of the canvas
  canvas.style.height = "" + squareSize * squareCount + "px";
  canvas.style.width = "" + squareSize * squareCount + "px";
  canvas.style.display = "flex";
  canvas.style.flexWrap = "wrap";
  canvas.style.backgroundColor = "grey";
  //Make the square array into a 2D array (JavaScript workaround to create 2D arrays)
  for (let i = 0; i < squareCount; i++) {
    squaresArray[i] = [];
  }
  //Create the squares and add them to the canvas and 2D array
  for (let y = 0; y < squareCount; y++) {
    for (let x = 0; x < squareCount; x++) {
      let square = document.createElement("button");
      //Css style
      square.style.height = "" + squareSize + "px";
      square.style.width = "" + squareSize + "px";
      square.setAttribute("value", 0);
      square.setAttribute("revealed", 0);
      square.onclick = function () {
        revealSquare(y, x);
      };
      //Modify the right click event listener for the squares
      square.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        return addFlag(y, x);
      });
      canvas.append(square);
      squaresArray[y].push(square);
    }
  }
  placeBombs();
}

//Place bombs on random squares
function placeBombs() {
  //Get a random number of bombs betwen 10% and 20% of the square count
  let min = Math.floor(((squareCount * squareCount) / 100) * 10);
  let max = Math.floor(((squareCount * squareCount) / 100) * 20);
  bombs = Math.floor(Math.random() * (max - min + 1)) + min;
  let bombsPlaced = 0;
  //Place the bombs on random squares
  while (bombsPlaced < bombs) {
    for (let y = 0; y < squareCount; y++) {
      for (let x = 0; x < squareCount; x++) {
        let currentSquare = squaresArray[y][x];
        //There is a 5% chance to place a bomb on the current square
        let chance = Math.floor(Math.random() * 100 + 1) >= 95;
        if (
          chance &&
          currentSquare.getAttribute("value") == 0 &&
          bombsPlaced < bombs
        ) {
          currentSquare.setAttribute("value", "bomb");
          //Show the bombs for debbuging purposes
          currentSquare.innerHTML = "💣";
          bombsPlaced++;
        }
      }
    }
  }
  calculateNeighbourBombs();
}

function calculateNeighbourBombs() {
  let nrOfBomb = 0;
  //For each square in the square array
  for (let y = 0; y < squareCount; y++) {
    for (let x = 0; x < squareCount; x++) {
      nrOfBomb = 0;
      if (squaresArray[y][x].getAttribute("value") != "bomb") {
        //search it's neighbouring
        for (let diffY = -1; diffY <= 1; diffY++) {
          for (let diffX = -1; diffX <= 1; diffX++) {
            if (
              y + diffY >= 0 &&
              x + diffX >= 0 &&
              y + diffY < squareCount &&
              x + diffX < squareCount
            ) {
              //if the current neighbour has a bomb increment the current square's value
              let currentNeighbour = squaresArray[y + diffY][x + diffX];
              if (currentNeighbour.getAttribute("value") == "bomb") {
                nrOfBomb++;
              }
            }
          }
        }
        squaresArray[y][x].setAttribute("value", nrOfBomb);
      }
    }
  }
}

//When the right click is pressed add or remove flags
function addFlag(y, x) {
  let currentSquare = squaresArray[y][x];
  const squareValue = currentSquare.innerHTML;
  const squareAttribute = currentSquare.getAttribute("revealed");
  if (squareValue != "🚩" && squareAttribute != 1) {
    currentSquare.innerHTML = "🚩";
    flags++;
  } else if (squareValue == "🚩" && squareAttribute != 1) {
    currentSquare.innerHTML = "";
    flags--;
  }
  checkStatus();
}

//This function activates when you click on the squares
function revealSquare(y, x) {
  if (gameOver) return;
  let currentSquare = squaresArray[y][x];
  if (currentSquare.getAttribute("revealed") == 1) return;
  if (currentSquare.getAttribute("value") == "bomb") {
    gameOver = true;
    endGame(false);
    return;
  }
  currentSquare.innerHTML = currentSquare.getAttribute("value");
  currentSquare.style.backgroundColor = "grey";
  currentSquare.setAttribute("revealed", 1);
  //Recursive part
  checkStatus();
  if (currentSquare.getAttribute("value") != 0) return;
  for (let yDiff = -1; yDiff <= 1; yDiff++) {
    for (let xDiff = -1; xDiff <= 1; xDiff++) {
      if (
        y + yDiff >= 0 &&
        x + xDiff >= 0 &&
        y + yDiff < squareCount &&
        x + xDiff < squareCount
      ) {
        revealSquare(y + yDiff, x + xDiff);
      }
    }
  }
}

//Check the status of the game each time a squares is clicked or a flag is placed
function checkStatus() {
  let matches = 0;
  let safeSquaresLeft = 0;
  for (let y = 0; y < squareCount; y++) {
    for (let x = 0; x < squareCount; x++) {
      let currentSquare = squaresArray[y][x];
      if (
        currentSquare.innerHTML == "🚩" &&
        currentSquare.getAttribute("value") == "bomb"
      ) {
        matches++;
      }
      if (
        currentSquare.getAttribute("revealed") == 0 &&
        currentSquare.getAttribute("value") != "bomb"
      ) {
        safeSquaresLeft++;
      }
    }
  }
  //If all of the safe squares are revealed or
  //all of the bombs are flagged and the number of flags placed are equal to the number of bombs
  //you won and the game is over
  if ((flags == bombs && matches == bombs) || safeSquaresLeft == 0)
    endGame(true);
}

function endGame(won) {
  if (won == true) {
    getElement("#message").innerHTML = "YOU WON!";
    gameOver = true;
    for (let y = 0; y < squareCount; y++) {
      for (let x = 0; x < squareCount; x++) {
        let currentSquare = squaresArray[x][y];
        if (currentSquare.getAttribute("value") == "bomb") {
          currentSquare.style.backgroundColor = "green";
          currentSquare.innerHTML = "💣";
        }
      }
    }
  } else {
    getElement("#message").innerHTML = "YOU LOST!";
    for (let y = 0; y < squareCount; y++) {
      for (let x = 0; x < squareCount; x++) {
        let currentSquare = squaresArray[x][y];
        if (currentSquare.getAttribute("value") == "bomb") {
          currentSquare.innerHTML = "💣";
          currentSquare.style.backgroundColor = "red";
        }
      }
    }
  }
}

// Helper function
function getElement(element) {
  const el = document.querySelector(element);
  if (el) return el;
  throw new Error(`Element with selector ${element} not found`);
}
