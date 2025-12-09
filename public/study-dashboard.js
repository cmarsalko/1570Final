const sessionCards = document.querySelectorAll('.session-card');

sessionCards.forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('collapsed');
  });
});