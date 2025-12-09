function uploadPhoto() {
  const fileInput = document.getElementById("photoUpload");
  const imageDisplay = document.getElementById("profileImage");

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      imageDisplay.src = e.target.result;
    };

    reader.readAsDataURL(fileInput.files[0]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const profileImage = document.getElementById("profileImage");
  const photoUpload = document.getElementById("photoUpload");
  const uploadBtn = document.querySelector(".upload-btn");
  const saveBtn = document.querySelector(".save-btn");
  const formFields = document.querySelectorAll(".profile-details input[name], .profile-details textarea[name]");

  // --- Load temporary data from localStorage ---
  formFields.forEach(field => {
    const saved = localStorage.getItem("temp_" + field.name);
    if (saved) field.value = saved;
  });

  const savedImage = localStorage.getItem("temp_profileImage");
  if (savedImage) profileImage.src = savedImage;

  // --- Save changes temporarily while editing ---
  formFields.forEach(field => {
    field.addEventListener("input", () => {
      localStorage.setItem("temp_" + field.name, field.value);
    });
  });

  uploadBtn.addEventListener("click", () => {
    if (photoUpload.files && photoUpload.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        profileImage.src = e.target.result;
        localStorage.setItem("temp_profileImage", e.target.result);
      };
      reader.readAsDataURL(photoUpload.files[0]);
    }
  });

  saveBtn.addEventListener("click", () => {
  const emailField = document.querySelector('input[name="email"]');
  const emailValue = emailField.value.trim();

  // --- Email validation ---
  if (!emailValue.includes("@")) {
    alert("Please enter a valid email address with an '@'.");
    emailField.focus();
    return; // Stop the save process
  }

  // Clear temporary localStorage
  formFields.forEach(field => localStorage.removeItem("temp_" + field.name));
  localStorage.removeItem("temp_profileImage");
});
})
