const firebaseConfig = {
  apiKey: "AIzaSyCQRAEbsVC4_osIpjon_DSAMOU6cMoFVnA",
  authDomain: "memory-game-workua.firebaseapp.com",
  projectId: "memory-game-workua",
  storageBucket: "memory-game-workua.appspot.com",
  messagingSenderId: "142164757693",
  appId: "1:142164757693:web:17c7407618c620c4b9fbd4",
  measurementId: "G-4LRR8VW18W",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const phoneNumberField = document.getElementById("user-phone");
const codeField = document.getElementById("user-code");
const getCodeButton = document.getElementById("get-code");
const signInWithPhoneButton = document.getElementById("submit");
// const whenSignedIn = document.getElementById("whenSignedIn");
// const signedInText = document.getElementById("signed-in-text");

// Creates and render the captcha
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
  "recaptcha-container",
  {
    size: "invisible",
    callback: (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      onSignInSubmit();
    },
  }
);

recaptchaVerifier.render().then((widgetId) => {
  window.recaptchaWidgetId = widgetId;
});

const sendVerificationCode = () => {
  const phoneNumber = phoneNumberField.value;
  const appVerifier = window.recaptchaVerifier;

  db.collection("users-login-list")
    .where("phone", "==", phoneNumberField.value)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());

        if (doc.exists) {
          console.log("Such user already exists !");
          let doubleLoginCheck = document.getElementById("overlay-start-form");
          doubleLoginCheck.innerHTML = `Зіграти можна один раз!`;
        }
      });
    })
    .catch((error) => {
      console.log("Error: ", error);
    });

  // Sends the 6 digit code to the user's phone
  firebase
    .auth()
    .signInWithPhoneNumber(phoneNumber, appVerifier)
    .then((confirmationResult) => {
      const sentCodeId = confirmationResult.verificationId;

      // Sign in if the verification code is set correctly
      signInWithPhoneButton.addEventListener("click", () =>
        signInWithPhone(sentCodeId)
      );
    })
    .catch((error) => {
      console.error(error);
    });
};

const signInWithPhone = (sentCodeId) => {
  const code = codeField.value;
  // A credential object (contains user's data) is created after a comparison between the 6 digit code sent to the user's phone
  // and the code typed by the user in the code field on the html form.
  const credential = firebase.auth.PhoneAuthProvider.credential(
    sentCodeId,
    code
  );
  auth
    .signInWithCredential(credential)
    .then(() => {
      let hello = document.getElementById("overlay-start-form");
      hello.innerHTML = `Дякуємо, удачі в грі!`;
      setTimeout(startGame, 2000);
      console.log("Signed in successfully !");

      const { serverTimestamp } = firebase.firestore.FieldValue;

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
    })
    .catch((error) => {
      console.error(error);
    });
};

getCodeButton.addEventListener("click", sendVerificationCode);

// auth.onAuthStateChanged((user) => {
//   if (user) {
//     whenSignedIn.hidden = true;
//     signedInText.innerHTML = `Нажаль, зіграти можна тільки один раз!`;
//   } else {
//     whenSignedIn.hidden = false;
//   }
// });

const cards = document.querySelectorAll(".card");
const resultTime = document.getElementById("time-result");
const gameStart = document.getElementById("overlay-start");

let disabledCardsPairsCount = 0;

let flippedCard = false;
let lockedCards = false;
let firstCard, secondCard;

let totalTimeOfGame;
let time = 0;
const timeRoll = document.getElementById("time-main");
let timerStart = false;
let startedTimerOnlyOnce = false;
let startTime, endTime;

let usersReference;
let realtimeStreamUnsubscribe;

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
  let date = new Date(0);
  date.setSeconds(seconds);
  let timeString = date.toISOString().substr(11, 8);
  resultTime.innerHTML = timeString;

  endGame();
  stopCounter();
}

function stopCounter() {
  clearInterval(totalTimeOfGame);
}
//creates timer and counts during the game showing in secs and mins
function startCounter() {
  totalTimeOfGame = setInterval(() => {
    time++;
    let date = new Date(0);
    date.setSeconds(time);
    let timeString = date.toISOString().substr(11, 8);
    timeRoll.innerHTML = timeString;
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
  if (disabledCardsPairsCount === 10) endTimeOfGame();
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
