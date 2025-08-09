const validationSettings = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-button",
  inactiveButtonClass: "modal__submit-button_disabled",
  inputErrorClass: "modal__input_type_error",
  errorClass: "modal__input-error_visible",
};

function updateErrorForInput(formElement, inputElement, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);

  if (!inputElement.validity.valid) {
    inputElement.classList.add(settings.inputErrorClass);
    if (errorElement) {
      errorElement.textContent = inputElement.validationMessage;
      errorElement.classList.add(settings.errorClass);
    }
  } else {
    inputElement.classList.remove(settings.inputErrorClass);
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove(settings.errorClass);
    }
  }
}

function setFormValidation(formElement, settings) {
  const inputList = Array.from(
    formElement.querySelectorAll(settings.inputSelector)
  );
  const buttonElement = formElement.querySelector(
    settings.submitButtonSelector
  );

  function updateButtonState() {
    const hasInvalid = inputList.some((input) => !input.validity.valid);
    buttonElement.disabled = hasInvalid;
    buttonElement.classList.toggle(settings.inactiveButtonClass, hasInvalid);
  }

  updateButtonState();

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      updateErrorForInput(formElement, inputElement, settings);
      updateButtonState();
    });
  });
}

function enableValidation(settings) {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach((formElement) => {
    formElement.setAttribute("novalidate", "true");
    setFormValidation(formElement, settings);
  });
}

function clearValidation(formElement, settings) {
  const inputs = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const button = formElement.querySelector(settings.submitButtonSelector);

  inputs.forEach((input) => {
    input.classList.remove(settings.inputErrorClass);

    const errorEl = formElement.querySelector(`#${input.id}-error`);
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove(settings.errorClass);
    }
  });

  if (button) {
    button.disabled = true;
    button.classList.add(settings.inactiveButtonClass);
  }
}

newPostForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  closeModal(newPostModal);
  newPostForm.reset();
  clearValidation(newPostForm, validationSettings);
});

editProfileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  closeModal(editProfileModal);
  editProfileForm.reset();
  clearValidation(editProfileForm, validationSettings);
});


enableValidation(validationSettings);
