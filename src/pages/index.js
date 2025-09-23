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
    authorization: "843f40a5-12a3-4369-bf8e-4a4f6e53cc51",
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

  if (cardData.isLiked) {
    likeButton.classList.add("card__like-button_active");
  }

  likeButton.addEventListener("click", () => {
    const isActive = likeButton.classList.contains("card__like-button_active");

    let request;
    if (isActive) {
      request = api.removeLike(cardData._id);
    } else {
      request = api.addLike(cardData._id);
    }

    request
      .then((updatedCard) => {
        if (updatedCard.isLiked) {
          likeButton.classList.add("card__like-button_active");
        } else {
          likeButton.classList.remove("card__like-button_active");
        }
      })
      .catch((error) => {
        console.error("Like toggle failed:", error);
      });
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

const editSaveButton = editProfileModal.querySelector(".modal__submit-button");
function setProfileSaveState() {
  const isValid =
    editProfileNameInput.validity.valid &&
    editProfileDescriptionInput.validity.valid;

  editSaveButton.disabled = !isValid;
  if (isValid) {
    editSaveButton.classList.remove("modal__submit-button_disabled");
  } else {
    editSaveButton.classList.add("modal__submit-button_disabled");
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

  const previousButtonText = editSaveButton.textContent;
  editSaveButton.textContent = "Saving...";
  editSaveButton.disabled = true;

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
    })
    .finally(() => {
      editSaveButton.textContent = previousButtonText;
      setProfileSaveState();
    });
}

editProfileForm.addEventListener("submit", handleEditProfileSubmit);

//------------ Edit Avatar Modal ------------

const editAvatarButton = document.querySelector(".profile__avatar-edit");
const editAvatarModal = document.querySelector("#edit-avatar-modal");
const editAvatarCloseButton = editAvatarModal.querySelector(
  ".modal__close-button"
);
const editAvatarForm = editAvatarModal.querySelector(".modal__form");
const avatarLinkInput = editAvatarModal.querySelector("#avatar-link-input");
const avatarSaveButton = editAvatarModal.querySelector(".modal__submit-button");

function setAvatarSaveState() {
  const isValid = avatarLinkInput.validity.valid;
  avatarSaveButton.disabled = !isValid;
  if (isValid) {
    avatarSaveButton.classList.remove("modal__submit-button_disabled");
  } else {
    avatarSaveButton.classList.add("modal__submit-button_disabled");
  }
}

editAvatarButton.addEventListener("click", function () {
  if (typeof clearValidation === "function") {
    clearValidation(editAvatarForm, validationSettings);
  }
  setAvatarSaveState();
  openModal(editAvatarModal);
});

editAvatarForm.addEventListener("input", function () {
  setAvatarSaveState();
});

editAvatarCloseButton.addEventListener("click", function () {
  closeModal(editAvatarModal);
});

function handleEditAvatarSubmit(evt) {
  evt.preventDefault();

  avatarSaveButton.disabled = true;
  const previousText = avatarSaveButton.textContent;
  avatarSaveButton.textContent = "Saving...";

  api
    .updateAvatar({ avatar: avatarLinkInput.value })
    .then((user) => {
      profileAvatar.src = user.avatar;
      closeModal(editAvatarModal);
      editAvatarForm.reset();
      if (typeof clearValidation === "function") {
        clearValidation(editAvatarForm, validationSettings);
      }
    })
    .catch((error) => {
      console.error("Failed to update avatar:", error);
    })
    .finally(() => {
      avatarSaveButton.textContent = previousText;
      setAvatarSaveState();
    });
}

editAvatarForm.addEventListener("submit", handleEditAvatarSubmit);

//------------ New Post Modal ------------

const newPostButton = document.querySelector(".profile__post-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseButton = newPostModal.querySelector(".modal__close-button");
const newPostForm = newPostModal.querySelector(".modal__form");
const imageLinkInput = newPostModal.querySelector("#image-input");
const captionInput = newPostModal.querySelector("#caption-input");
const newPostSaveButton = newPostModal.querySelector(".modal__submit-button");

newPostButton.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseButton.addEventListener("click", function () {
  closeModal(newPostModal);
});

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const previousButtonText = newPostSaveButton.textContent;
  newPostSaveButton.textContent = "Saving...";
  newPostSaveButton.disabled = true;

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
    })
    .finally(() => {
      newPostSaveButton.textContent = previousButtonText;
      newPostSaveButton.disabled = false;
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

  const deleteConfirmButton = deleteCardForm.querySelector(
    ".modal__submit-button"
  );
  const previousButtonText = deleteConfirmButton.textContent;

  deleteConfirmButton.textContent = "Deleting...";
  deleteConfirmButton.disabled = true;
  deleteCardCancelButton.disabled = true;

  api
    .removeCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      selectedCard = null;
      selectedCardId = null;
      closeModal(deleteCardModal);
    })
    .catch((error) => console.error("Delete failed.", error))
    .finally(() => {
      deleteConfirmButton.textContent = previousButtonText;
      deleteConfirmButton.disabled = false;
      deleteCardCancelButton.disabled = false;
    });
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
