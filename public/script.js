//makes the images in the about turn into fun info cards when clicked
const teamCards = document.querySelectorAll('.teamCard');

teamCards.forEach(card => {
  // Create a div to hold the info
  const infoDiv = document.createElement('div');
  infoDiv.classList.add('infoBox');
  infoDiv.textContent = card.dataset.info;
  card.appendChild(infoDiv);

  // Toggle active class on click
  card.addEventListener('click', () => {
    card.classList.toggle('active');
  });
});

//make the nav bar scroll instead of teleport
document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  });
});

