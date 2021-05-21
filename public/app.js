const cards = document.querySelectorAll(".card");
const resultTime = document.getElementById("time-result");
const gameStart = document.getElementById("overlay-start");
const timeIndicator = document.getElementById("time-main");

let disabledCardsPairsCount = 0;
let flippedCard = false;
let lockedCards = false;
let firstCard;
let secondCard;
let totalTimeOfGame;
let timeCurrent = 0;
let timerStart = false;
let timerStartOnlyWhenFirstCardClicked = false;
let startTime;
let endTime;

function startGame() {
  let element = document.getElementsByClassName("overlay-start-form-container");
  for (let i = 0; i < element.length; i++) {
    element[i].classList.remove("visible");
  }
}

//fires final function to block the game and shows final time result
function endGame() {
  let element = document.getElementsByClassName("overlay-end-game-container");
  for (let i = 0; i < element.length; i++) {
    element[i].classList.add("visible");

    const { serverTimestamp } = firebase.firestore.FieldValue;

    db.collection("users-game-result")
      .add({
        phone: phoneNumberField.value,
        userTimeResult: resultTime.innerText,
        gameTimeEnd: serverTimestamp(),
      })
      .then((docRef) => {
        console.log("user-game-result written with ID: ", docRef.id);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });

    db.collection("users-login-list")
      .add({
        phone: phoneNumberField.value,
        loginDone: serverTimestamp(),
      })
      .then((docRef) => {
        console.log("users-login-list written with ID: ", docRef.id);
      })
      .catch((error) => {
        console.error("Error adding user: ", error);
      });

    setTimeout(() => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          console.log("Signed out successfully !");
        })
        .catch((error) => {
          console.log("Error, not signed out !");
        });
    }, 2000);
  }
}

//stamp time of the game starting
function logTimeWhenGameStarts() {
  startTime = new Date();
  console.log(startTime);
}

//stamps time of the game ending, shows final time result in seconds
function logTimeWhenGameEnds() {
  endTime = new Date();
  let timeDiff = endTime - startTime;
  timeDiff /= 1000;
  let seconds = Math.round(timeDiff);
  let date = new Date(0);
  date.setSeconds(seconds);
  let timeString = date.toISOString().substr(11, 8);
  resultTime.innerHTML = timeString;
  console.log(endTime);

  endGame();
  stopTimeCounter();
}

function stopTimeCounter() {
  clearInterval(totalTimeOfGame);
}
//creates timer and counts during the game showing in secs and mins
function startTimeCounter() {
  totalTimeOfGame = setInterval(() => {
    timeCurrent++;
    let date = new Date(0);
    date.setSeconds(timeCurrent);
    let timeString = date.toISOString().substr(11, 8);
    timeIndicator.innerHTML = timeString;
  }, 1000);
  timerStartOnlyWhenFirstCardClicked = true;
}

function startTimer() {
  if (!timerStartOnlyWhenFirstCardClicked)
    startTimeCounter(), logTimeWhenGameStarts();
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
  if (disabledCardsPairsCount === 10) logTimeWhenGameEnds();
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
  }, 1000);
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
