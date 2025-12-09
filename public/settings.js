document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("settingsForm"); // wrap your inputs in a <form id="settingsForm">
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="newPassword"]'); // match HTML name
  const confirmInput = document.querySelector('input[name="confirm"]'); // match HTML name
  const checkboxes = document.querySelectorAll('.switch input[type="checkbox"]');

  // --- Load saved values from localStorage ---
  if (localStorage.getItem("temp_email")) emailInput.value = localStorage.getItem("temp_email");
  if (localStorage.getItem("temp_password")) passwordInput.value = localStorage.getItem("temp_password");
  if (localStorage.getItem("temp_confirm")) confirmInput.value = localStorage.getItem("temp_confirm");

  checkboxes.forEach(cb => {
    const saved = localStorage.getItem("temp_" + cb.name);
    if (saved !== null) cb.checked = saved === "true";
  });

  // --- Save to localStorage on input/change ---
  emailInput.addEventListener("input", () => localStorage.setItem("temp_email", emailInput.value));
  passwordInput.addEventListener("input", () => localStorage.setItem("temp_password", passwordInput.value));
  confirmInput.addEventListener("input", () => localStorage.setItem("temp_confirm", confirmInput.value));

  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => localStorage.setItem("temp_" + cb.name, cb.checked));
  });

  // --- Validate and clear localStorage on form submit ---
  form.addEventListener("submit", (e) => {
    // Only validate if user typed a new password
    if (passwordInput.value || confirmInput.value) {
      if (!passwordInput.value) {
        e.preventDefault();
        alert("Please enter a new password.");
        return;
      }
      if (!confirmInput.value) {
        e.preventDefault();
        alert("Please confirm your new password.");
        return;
      }
      if (passwordInput.value !== confirmInput.value) {
        e.preventDefault();
        alert("Passwords do not match!");
        return;
      }
    }

    // Clear localStorage on successful submit
    localStorage.removeItem("temp_email");
    localStorage.removeItem("temp_password");
    localStorage.removeItem("temp_confirm");
    checkboxes.forEach(cb => localStorage.removeItem("temp_" + cb.name));
  });
});
