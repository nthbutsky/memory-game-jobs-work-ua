const cards = document.querySelectorAll(".card");

let flippedCard = false;
let lockedCards = false;
let firstCard, secondCard;

function flipCard() {
  if (lockedCards) return;
  if (this === firstCard) return;

  this.classList.add("card-flip");
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
