// Dropdown toggle
const avatarButton = document.getElementById('avatarButton');
const profileDropdown = document.getElementById('profileDropdown');

if (avatarButton) {
  avatarButton.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('hidden');
  });

  window.addEventListener('click', (e) => {
    if (!avatarButton.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.add('hidden');
    }
  });
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle?.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
});