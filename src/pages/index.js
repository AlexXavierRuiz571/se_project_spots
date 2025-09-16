import "./index.css";
import {
  enableValidation,
  clearValidation,
  validationSettings,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

//------------ Modal Functions ------------

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscClose);
}

function handleEscClose(event) {
  if (event.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

//------------ Initial Cards Data ------------

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "8ed5d8d5-a092-4bf5-8436-67def8891fb7",
    "Content-Type": "application/json",
  },
});

//------------ Card Creation and Display ------------

const cardTemplate = document.querySelector("#card-template").content;
const cardsContainer = document.querySelector(".cards__list");

function getCardElement(cardData) {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
  const cardTitle = cardElement.querySelector(".card__title");
  const cardImage = cardElement.querySelector(".card__image");
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__delete-button");

  cardTitle.textContent = cardData.name;
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;

  likeButton.addEventListener("click", function () {
    likeButton.classList.toggle("card__like-button_active");
  });

  deleteButton.addEventListener("click", () =>
    handleDeleteCard(cardElement, cardData)
  );

  cardImage.addEventListener("click", (evt) => {
    if (evt.target.classList.contains("card__image")) {
      evt.preventDefault();
      imagePreviewCaption.textContent = cardData.name;
      imagePreviewImage.src = cardData.link;
      imagePreviewImage.alt = cardData.name;
      openModal(imagePreviewModal);
    }
  });

  return cardElement;
}

//------------ Profile Elements ------------

const profileName = document.querySelector(".profile__name");
const profileAbout = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

api
  .getInitialData()
  .then(([user, cards]) => {
    profileName.textContent = user.name;
    profileAbout.textContent = user.about;
    profileAvatar.src = user.avatar;

    cards.forEach((cardData) => {
      const card = getCardElement(cardData);
      cardsContainer.append(card);
    });
  })
  .catch((error) => {
    console.error("Initial load failed:", error);
  });

//------------ Edit Profile Modal ------------

const editProfileButton = document.querySelector(".profile__edit-button");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseButton = editProfileModal.querySelector(
  ".modal__close-button"
);
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);

const profileNameElement = document.querySelector(".profile__name");
const profileDescriptionElement = document.querySelector(
  ".profile__description"
);

const editSaveBtn = editProfileModal.querySelector(".modal__submit-button");
function setProfileSaveState() {
  const isValid =
    editProfileNameInput.validity.valid &&
    editProfileDescriptionInput.validity.valid;

  editSaveBtn.disabled = !isValid;
  if (isValid) {
    editSaveBtn.classList.remove("modal__submit-button_disabled");
  } else {
    editSaveBtn.classList.add("modal__submit-button_disabled");
  }
}

editProfileButton.addEventListener("click", function () {
  editProfileNameInput.value = profileNameElement.textContent;
  editProfileDescriptionInput.value = profileDescriptionElement.textContent;

  if (typeof clearValidation === "function") {
    clearValidation(editProfileForm, validationSettings);
  }
  setProfileSaveState();

  openModal(editProfileModal);
});

editProfileForm.addEventListener("input", function () {
  setProfileSaveState();
});

editProfileCloseButton.addEventListener("click", function () {
  closeModal(editProfileModal);
});

function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((updatedUser) => {
      profileName.textContent = updatedUser.name;
      profileAbout.textContent = updatedUser.about;

      closeModal(editProfileModal);
      editProfileForm.reset();
      clearValidation(editProfileForm, validationSettings);
    })
    .catch((error) => {
      console.error("Failed to update profile:", error);
    });
}
editProfileForm.addEventListener("submit", handleEditProfileSubmit);

//------------ New Post Modal ------------

const newPostButton = document.querySelector(".profile__post-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseButton = newPostModal.querySelector(".modal__close-button");
const newPostForm = newPostModal.querySelector(".modal__form");
const imageLinkInput = newPostModal.querySelector("#image-input");
const captionInput = newPostModal.querySelector("#caption-input");

newPostButton.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseButton.addEventListener("click", function () {
  closeModal(newPostModal);
});

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  api
    .addCard({
      name: captionInput.value,
      link: imageLinkInput.value,
    })
    .then((newCard) => {
      const card = getCardElement(newCard);
      cardsContainer.prepend(card);
      closeModal(newPostModal);
      newPostForm.reset();
      clearValidation(newPostForm, validationSettings);
    })
    .catch((error) => {
      console.error("Failed to add new card:", error);
    });
}

newPostForm.addEventListener("submit", handleAddCardSubmit);

//------------ Image Preview Modal ------------

const imagePreviewModal = document.querySelector("#image-preview-modal");
const imagePreviewImage = imagePreviewModal.querySelector(".modal__image");
const imagePreviewCaption = imagePreviewModal.querySelector(".modal__caption");
const imagePreviewCloseButton = imagePreviewModal.querySelector(
  ".modal__close-button"
);

imagePreviewCloseButton.addEventListener("click", function () {
  closeModal(imagePreviewModal);
});

//------------ Delete Card Modal ------------

const deleteCardModal = document.querySelector("#delete-card-modal");
const deleteCardForm = deleteCardModal.querySelector(".modal__form");
const deleteCardCancelButton = deleteCardModal.querySelector(
  "#delete-card-cancel"
);
const deleteCardCloseButton = deleteCardModal.querySelector(
  ".modal__close-button"
);

let selectedCard = null;
let selectedCardId = null;

function handleDeleteCard(cardElement, cardData) {
  selectedCard = cardElement;
  selectedCardId = cardData._id;
  openModal(deleteCardModal);
}

deleteCardCancelButton.addEventListener("click", () => {
  selectedCard = null;
  selectedCardId = null;
  closeModal(deleteCardModal);
});

deleteCardCloseButton.addEventListener("click", () => {
  selectedCard = null;
  selectedCardId = null;
  closeModal(deleteCardModal);
});

deleteCardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  if (!selectedCard || !selectedCardId) return;

api.removeCard(selectedCardId)
  .then(() => {
    selectedCard.remove();
    selectedCard = null;
    selectedCardId = null;
    closeModal(deleteCardModal);
  })
  .catch((error) => console.error("Delete failed.", error));
});

//------------ Modal Close ------------

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });
});

//------------ Validation Init ------------

enableValidation(validationSettings);
