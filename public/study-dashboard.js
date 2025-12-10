const sessionCards = document.querySelectorAll('.session-card');

sessionCards.forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('collapsed');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const adminBtn = document.getElementById('adminUpgradeBtn');
  const adminModal = document.getElementById('adminModal');
  const adminModalClose = document.getElementById('adminModalClose');

  if (adminBtn && adminModal && adminModalClose) {
    adminBtn.addEventListener('click', () => {
      adminModal.classList.remove('hidden');
    });

    adminModalClose.addEventListener('click', () => {
      adminModal.classList.add('hidden');
    });

    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        adminModal.classList.add('hidden');
      }
    });
  }
});