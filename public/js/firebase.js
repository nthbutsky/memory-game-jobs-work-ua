"use strict";

//The app uses firebase
var apiKey = config.apiKey;
var firebaseConfig = {
  apiKey: apiKey,
  authDomain: "memory-game-workua.firebaseapp.com",
  projectId: "memory-game-workua",
  storageBucket: "memory-game-workua.appspot.com",
  messagingSenderId: "142164757693",
  appId: "1:142164757693:web:17c7407618c620c4b9fbd4",
  measurementId: "G-4LRR8VW18W"
}; // Initialize Firebase

firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();
var phoneNumberField = document.getElementById("user-phone");
var codeField = document.getElementById("user-code");
var getCodeButton = document.getElementById("get-code");
var signInWithPhoneButton = document.getElementById("submit");
var smsSentInfo = document.getElementById("sms-sent-info"); // Creates and render the captcha

window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
  size: "invisible",
  callback: function callback(response) {
    // reCAPTCHA solved, allow signInWithPhoneNumber.
    onSignInSubmit();
  }
});
recaptchaVerifier.render().then(function (widgetId) {
  window.recaptchaWidgetId = widgetId;
});

var sendVerificationCode = function sendVerificationCode() {
  var phoneNumber = phoneNumberField.value;
  var appVerifier = window.recaptchaVerifier;
  db.collection("users-login-list").where("phone", "==", phoneNumberField.value).get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());

      if (doc.exists) {
        console.log("Such user already exists !");
        var doubleLoginCheck = document.getElementById("overlay-start-form");
        doubleLoginCheck.innerHTML = "\u0417\u0456\u0433\u0440\u0430\u0442\u0438 \u043C\u043E\u0436\u043D\u0430 \u043E\u0434\u0438\u043D \u0440\u0430\u0437!";
      }
    });
  })["catch"](function (error) {
    console.log("Error: ", error);
  }); // Sends the 6 digit code to the user's phone

  firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier).then(function (confirmationResult) {
    var sentCodeId = confirmationResult.verificationId;
    smsSentInfo.innerHTML = "\u0421\u041C\u0421 \u0437 \u043A\u043E\u0434\u043E\u043C \u0432\u0456\u0434\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E"; // Sign in if the verification code is set correctly

    signInWithPhoneButton.addEventListener("click", function () {
      return signInWithPhone(sentCodeId);
    });
  })["catch"](function (error) {
    console.error(error);
  });
};

function pressEnterKeyForLogin(event) {
  var x = event.keyCode;

  if (x == 13) {
    signInWithPhone();
  }
}

var signInWithPhone = function signInWithPhone(sentCodeId) {
  var code = codeField.value; // A credential object (contains user's data) is created after a comparison between the 6 digit code sent to the user's phone
  // and the code typed by the user in the code field on the html form.

  var credential = firebase.auth.PhoneAuthProvider.credential(sentCodeId, code);
  auth.signInWithCredential(credential).then(function () {
    var hello = document.getElementById("overlay-start-form");
    hello.innerHTML = "\u0414\u044F\u043A\u0443\u0454\u043C\u043E, \u0443\u0434\u0430\u0447\u0456 \u0432 \u0433\u0440\u0456!";
    setTimeout(startGame, 3000);
    console.log("Signed in successfully !");
  })["catch"](function (error) {
    console.error(error);
  });
};

getCodeButton.addEventListener("click", sendVerificationCode);

function pressEnterKeyForCode(event) {
  var x = event.keyCode;

  if (x == 13) {
    sendVerificationCode();
  }
}