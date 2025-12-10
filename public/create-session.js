const rooms = {
  "Hillman Library": [
    "Ground Floor – Room G08",
    "1st Floor – Room 130",
    "2nd Floor – Room 220",
    "3rd Floor – Room 320A",
    "4th Floor – Room 410B",
    "Basement – Room B12"
  ],
  "Posvar Hall": [
    "Room 1500", "Room 2600", "Room 4130", "Room 5600"
  ],
  "Cathedral of Learning": [
    "Floor 1 – Room 121", "Floor 3 – Room 304", "Floor 8 – Room 807",
    "Floor 19 – Room 1902", "Nationality Room"
  ],
  "Information Science Building": [
    "IS Lab 101", "Room 203", "Room 305"
  ],
  "Sennot Square": [
    "Room 5313", "Room 5400", "Room 5505"
  ],
  "William Pitt Union": [
    "Dining Room", "Nordy’s Place", "Room 548"
  ],
  "Clapp Hall": [
    "Room 101", "Room 212", "Room 315"
  ]
};

document.getElementById("buildingSelect").addEventListener("change", function () {
  const selected = this.value;
  const roomSelect = document.getElementById("roomSelect");
  roomSelect.innerHTML = "";

  if (!selected) {
    roomSelect.innerHTML = "<option>Select a building first</option>";
    return;
  }

  rooms[selected].forEach(room => {
    const option = document.createElement("option");
    option.textContent = room;
    roomSelect.appendChild(option);
  });
});

function toggleOptional() {
  const section = document.getElementById("optionalSection");
  section.style.display = section.style.display === "block" ? "none" : "block";
};
const form = document.querySelector(".session-form");
const formFields = form.querySelectorAll('input[name], select[name], textarea[name]');

// Load saved data on page load
formFields.forEach(field => {
  const saved = localStorage.getItem(field.name);
  if (saved) field.value = saved;
});

// Save input changes to localStorage and update summary
formFields.forEach(field => {
  field.addEventListener("input", () => {
    localStorage.setItem(field.name, field.value);
    updateSummary();
  });
  field.addEventListener("change", () => {
    localStorage.setItem(field.name, field.value);
    updateSummary();
  });
});

form.addEventListener("submit", e => {
  const startTime = form.querySelector('input[name="startTime"]').value;
  const endTime = form.querySelector('input[name="endTime"]').value;

  // --- Time validation ---
  if (startTime && endTime && startTime >= endTime) {
    e.preventDefault(); // stop submission only when invalid
    alert("End time must be later than start time.");
    return;
  }

  // Clear saved data on successful submit and let the browser POST the form
  localStorage.clear();
});