//The app uses firebase
const apiKey = config.apiKey;

const firebaseConfig = {
  apiKey: apiKey,
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
const smsSentInfo = document.getElementById("sms-sent-info");

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
      smsSentInfo.innerHTML = `СМС з кодом відправлено`;
      // Sign in if the verification code is set correctly
      signInWithPhoneButton.addEventListener("click", () =>
        signInWithPhone(sentCodeId)
      );
    })
    .catch((error) => {
      console.error(error);
    });
};

function pressEnterKeyForLogin(event) {
  let x = event.keyCode;
  if (x == 13) {
    signInWithPhone();
  }
}

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
      setTimeout(startGame, 3000);
      console.log("Signed in successfully !");
    })
    .catch((error) => {
      console.error(error);
    });
};

getCodeButton.addEventListener("click", sendVerificationCode);

function pressEnterKeyForCode(event) {
  let x = event.keyCode;
  if (x == 13) {
    sendVerificationCode();
  }
}
