function updateErrorForInput(formElement, inputElement, settings) {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);

  if (!inputElement.validity.valid) {
    inputElement.classList.add(settings.inputErrorClass);
    errorElement.textContent = inputElement.validationMessage;
    errorElement.classList.add(settings.errorClass);
  } else {
    inputElement.classList.remove(settings.inputErrorClass);
    errorElement.textContent = "";
    errorElement.classList.remove(settings.errorClass);
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
  const inputList = Array.from(
    formElement.querySelectorAll(settings.inputSelector)
  );
  const buttonElement = formElement.querySelector(
    settings.submitButtonSelector
  );

  inputList.forEach((inputElement) =>
    updateErrorForInput(formElement, inputElement, settings)
  );

  const hasInvalid = inputList.some((input) => !input.validity.valid);
  buttonElement.disabled = hasInvalid;
  buttonElement.classList.toggle(settings.inactiveButtonClass, hasInvalid);
}

window.enableValidation = enableValidation;
window.clearValidation = clearValidation;
