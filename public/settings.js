// settings.js
document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector(".save-btn");
  const emailInput = document.querySelector('input[name="email"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const confirmInput = document.querySelector('input[name="confimPass"]'); // note typo matches HTML
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

  // --- Clear localStorage when Save Changes is clicked ---
  saveBtn.addEventListener("click", () => {
    // Optional: Validate passwords match
    if (passwordInput.value && passwordInput.value !== confirmInput.value) {
      alert("Passwords do not match!");
      return;
    }

    alert("Settings saved!");
    localStorage.removeItem("temp_email");
    localStorage.removeItem("temp_password");
    localStorage.removeItem("temp_confirm");
    checkboxes.forEach(cb => localStorage.removeItem("temp_" + cb.name));

    location.reload();
  });
});
