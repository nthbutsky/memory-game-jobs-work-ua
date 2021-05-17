let userInfo = {};

let userInfoSubmitBtn = document.getElementById("submit");

const cards = document.querySelectorAll(".card");
let resultTime = document.getElementById("time");
let disabledCardsPairsCount = 0;

let flippedCard = false;
let lockedCards = false;
let firstCard, secondCard;

let totalTimeOfGame;
let sec = 0;
let min = 0;
let appendSec = document.getElementById("sec");
let appendMin = document.getElementById("min");
let timerStart = false;

//trick to fire function only once during consecutive iterations
let startedTimerOnlyOnce = false;

let startTime, endTime;

userInfoSubmitBtn.addEventListener("click", () => {
  userInfo = Array.from(document.querySelectorAll("input")).reduce(
    (acc, input) => ({ ...acc, [input.id]: input.value }),
    {}
  );
  console.log(userInfo);
});

//fires final function to block the game and shows final time result
function endGame() {
  let element = document.getElementsByClassName("overlay-end-game-container");
  for (let i = 0; i < element.length; i++) {
    element[i].classList.add("visible");
  }
}
//stamp time of the game starting
function startTimeOfGame() {
  startTime = new Date();
  console.log(startTime);
}
//stamps time of the game ending, shows final time result in seconds
function endTimeOfGame() {
  endTime = new Date();
  let timeDiff = endTime - startTime;
  timeDiff /= 1000;
  let seconds = Math.round(timeDiff);
  resultTime.innerHTML = seconds;

  endGame();
  stopCounter();
}

function stopCounter() {
  clearInterval(totalTimeOfGame);
}
//creates timer and counts during the game showing in secs and mins
function startCounter() {
  totalTimeOfGame = setInterval(() => {
    sec++;
    if (sec < 10) {
      appendSec.innerHTML = "0" + sec;
    }
    if (sec > 9) {
      appendSec.innerHTML = sec;
    }
    if (sec === 60) {
      appendSec.innerHTML = "00";
      min++;
      sec = 0;
    }
    if (min < 10) {
      appendMin.innerHTML = "0" + min;
    }
  }, 1000);
  startedTimerOnlyOnce = true;
}

function startTimer() {
  if (!startedTimerOnlyOnce) startCounter(), startTimeOfGame();
}

function flipCard() {
  if (lockedCards) return;
  if (this === firstCard) return;
  this.classList.add("card-flip");

  startTimer();

  //first click
  if (!flippedCard) {
    flippedCard = true;
    firstCard = this;

    return;
  }
  //second click
  flippedCard = false;
  secondCard = this;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.jobs === secondCard.dataset.jobs;

  isMatch ? disableCards : unflipCards();

  if (isMatch) disabledCardsPairsCount++;
  if (disabledCardsPairsCount === 1) endTimeOfGame();
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  resetCards();
}

function unflipCards() {
  lockedCards = true;

  setTimeout(() => {
    firstCard.classList.remove("card-flip");
    secondCard.classList.remove("card-flip");

    resetCards();
  }, 1500);
}

function resetCards() {
  [flippedCard, lockedCards] = [false, false];
  [firstCard, secondCard] = [null, null];
}

(function shuffleCards() {
  cards.forEach((card) => {
    let randomPosition = Math.floor(Math.random() * 20);
    card.style.order = randomPosition;
  });
})();

cards.forEach((card) => card.addEventListener("click", flipCard));
