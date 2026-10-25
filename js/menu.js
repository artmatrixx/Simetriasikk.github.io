// Menu navbar versi mobile: buka/tutup panel yang bergeser dari kanan
const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');
const menuIcon = document.getElementById('menuIcon');
const exitIcon = document.getElementById('exitIcon');

let isMenuOpen = false;

function setMenuOpen(open) {
    isMenuOpen = open;

    mobileMenu.classList.toggle('translate-x-full', !open);
    mobileMenu.classList.toggle('translate-x-0', open);
    menuIcon.classList.toggle('hidden', open);
    exitIcon.classList.toggle('hidden', !open);

    menuButton.setAttribute('aria-expanded', open);
    menuButton.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    document.body.style.overflow = open ? 'hidden' : '';
}

menuButton.addEventListener('click', () => setMenuOpen(!isMenuOpen));

// Tutup menu saat salah satu link diklik
mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
});
