"use strict";

var cards = document.querySelectorAll(".card");
var resultTime = document.getElementById("time-result");
var gameStart = document.getElementById("overlay-start");
var timeIndicator = document.getElementById("time-main");
var disabledCardsPairsCount = 0;
var flippedCard = false;
var lockedCards = false;
var firstCard;
var secondCard;
var totalTimeOfGame;
var timeCurrent = 0;
var timerStart = false;
var timerStartOnlyWhenFirstCardClicked = false;
var startTime;
var endTime;

function startGame() {
  var element = document.getElementsByClassName("overlay-start-form-container");

  for (var i = 0; i < element.length; i++) {
    element[i].classList.remove("visible");
  }
} //fires final function to block the game and shows final time result


function endGame() {
  var element = document.getElementsByClassName("overlay-end-game-container");

  for (var i = 0; i < element.length; i++) {
    element[i].classList.add("visible");
    var serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
    db.collection("users-game-result").add({
      phone: phoneNumberField.value,
      userTimeResult: resultTime.innerText,
      gameTimeEnd: serverTimestamp()
    }).then(function (docRef) {
      console.log("user-game-result written with ID: ", docRef.id);
    })["catch"](function (error) {
      console.error("Error adding document: ", error);
    });
    db.collection("users-login-list").add({
      phone: phoneNumberField.value,
      loginDone: serverTimestamp()
    }).then(function (docRef) {
      console.log("users-login-list written with ID: ", docRef.id);
    })["catch"](function (error) {
      console.error("Error adding user: ", error);
    });
    setTimeout(function () {
      firebase.auth().signOut().then(function () {
        console.log("Signed out successfully !");
      })["catch"](function (error) {
        console.log("Error, not signed out !");
      });
    }, 2000);
  }
} //stamp time of the game starting


function logTimeWhenGameStarts() {
  startTime = new Date();
  console.log(startTime);
} //stamps time of the game ending, shows final time result in seconds


function logTimeWhenGameEnds() {
  endTime = new Date();
  var timeDiff = endTime - startTime;
  timeDiff /= 1000;
  var seconds = Math.round(timeDiff);
  var date = new Date(0);
  date.setSeconds(seconds);
  var timeString = date.toISOString().substr(11, 8);
  resultTime.innerHTML = timeString;
  console.log(endTime);
  endGame();
  stopTimeCounter();
}

function stopTimeCounter() {
  clearInterval(totalTimeOfGame);
} //creates timer and counts during the game showing in secs and mins


function startTimeCounter() {
  totalTimeOfGame = setInterval(function () {
    timeCurrent++;
    var date = new Date(0);
    date.setSeconds(timeCurrent);
    var timeString = date.toISOString().substr(11, 8);
    timeIndicator.innerHTML = timeString;
  }, 1000);
  timerStartOnlyWhenFirstCardClicked = true;
}

function startTimer() {
  if (!timerStartOnlyWhenFirstCardClicked) startTimeCounter(), logTimeWhenGameStarts();
}

function flipCard() {
  if (lockedCards) return;
  if (this === firstCard) return;
  this.classList.add("card-flip");
  startTimer(); //first click

  if (!flippedCard) {
    flippedCard = true;
    firstCard = this;
    return;
  } //second click


  flippedCard = false;
  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  var isMatch = firstCard.dataset.jobs === secondCard.dataset.jobs;
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
  setTimeout(function () {
    firstCard.classList.remove("card-flip");
    secondCard.classList.remove("card-flip");
    resetCards();
  }, 500);
}

function resetCards() {
  flippedCard = false;
  lockedCards = false;
  firstCard = null;
  secondCard = null;
}

(function shuffleCards() {
  cards.forEach(function (card) {
    var randomPosition = Math.floor(Math.random() * 20);
    card.style.order = randomPosition;
  });
})();

cards.forEach(function (card) {
  return card.addEventListener("click", flipCard);
});