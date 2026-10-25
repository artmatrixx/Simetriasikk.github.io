// Animasi & interaksi umum halaman.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== 0. Layar loading: bar terisi sesuai gambar yang sudah dimuat =====
const preloader = document.getElementById('preloader');
const loadingFill = document.getElementById('loading-fill');
const loadingText = document.getElementById('loading-text');
let pageReady = false;

function setLoading(percent) {
    loadingFill.style.width = percent + '%';
    loadingText.textContent = 'Loading ' + percent + '%';
}

const pageImages = [...document.images];
let imagesLoaded = 0;

function onImageDone() {
    imagesLoaded++;
    // Sisakan 10% terakhir untuk event "load" halaman
    setLoading(Math.round((imagesLoaded / pageImages.length) * 90));
}

pageImages.forEach((img) => {
    if (img.complete) onImageDone();
    else {
        img.addEventListener('load', onImageDone, { once: true });
        img.addEventListener('error', onImageDone, { once: true });
    }
});

function hidePreloader() {
    if (pageReady) return;
    pageReady = true;

    setLoading(100);
    loadingText.textContent = 'Ready!';

    setTimeout(() => {
        preloader.classList.add('is-hidden');
        document.documentElement.classList.add('page-loaded');
        document.dispatchEvent(new Event('page-ready'));
        startTyping();
    }, 400);
}

window.addEventListener('load', () => setTimeout(hidePreloader, 300));
setTimeout(hidePreloader, 5000); // cadangan kalau ada gambar yang lambat dimuat

// Pecah judul hero menjadi huruf-huruf agar bisa dianimasikan satu per satu
const heroTitle = document.getElementById('hero-title');

if (heroTitle && !prefersReducedMotion) {
    const titleText = heroTitle.textContent.trim();

    heroTitle.setAttribute('aria-label', titleText);
    heroTitle.innerHTML = '';

    [...titleText].forEach((char, i) => {
        const letter = document.createElement('span');
        letter.className = 'hero-letter';
        letter.style.setProperty('--i', i);
        letter.setAttribute('aria-hidden', 'true');
        letter.textContent = char === ' ' ? ' ' : char;
        heroTitle.appendChild(letter);
    });
}

// ===== 1. Progress bar, navbar, dan tombol kembali ke atas =====
const progressBar = document.getElementById('scroll-progress');
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

function onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

    progressBar.style.width = progress * 100 + '%';
    navbar.classList.toggle('nav-scrolled', window.scrollY > 50);
    backToTop.classList.toggle('is-shown', window.scrollY > window.innerHeight);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

// ===== 2. Elemen muncul saat di-scroll =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ===== 3. Menu navbar menyala sesuai section yang sedang dilihat =====
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
    });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));

// ===== 4. Efek mengetik pada nama di hero =====
const typedName = document.getElementById('typed-name');

// Dipanggil setelah layar loading hilang (lihat bagian 0)
function startTyping() {
    if (!typedName || prefersReducedMotion) return;

    const fullText = typedName.textContent.trim();
    let index = 0;

    typedName.textContent = '';
    typedName.classList.add('typing');

    const typingTimer = setInterval(() => {
        index++;
        typedName.textContent = fullText.slice(0, index);

        if (index === fullText.length) {
            clearInterval(typingTimer);
            setTimeout(() => typedName.classList.remove('typing'), 1500);
        }
    }, 90);
}

// ===== 5. Kartu profil miring mengikuti mouse + kilau hologram =====
const profileCard = document.getElementById('profile-card');

if (profileCard && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    profileCard.addEventListener('mousemove', (event) => {
        const rect = profileCard.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        profileCard.style.transform = `perspective(800px) rotateX(${(0.5 - y) * 14}deg) rotateY(${(x - 0.5) * 14}deg) scale(1.03)`;
        profileCard.style.setProperty('--mx', x * 100 + '%');
        profileCard.style.setProperty('--my', y * 100 + '%');
    });

    profileCard.addEventListener('mouseleave', () => {
        profileCard.style.transform = '';
    });
}

// ===== 6. Lightbox: foto experience diperbesar =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(photo) {
    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt;
    lightboxCaption.textContent = photo.alt;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
    document.dispatchEvent(new Event('photo-opened'));
}

function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

document.querySelectorAll('.exp-photo').forEach((photo) => {
    photo.addEventListener('click', () => openLightbox(photo));
    photo.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLightbox(photo);
        }
    });
});

// Klik di luar foto (atau tombol X) untuk menutup
lightbox.addEventListener('click', (event) => {
    if (event.target !== lightboxImg) closeLightbox();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
});

// ===== 7. Suasana gua: debu emas melayang naik & kilau kristal =====
const caveFx = document.getElementById('cave-fx');

if (caveFx && !prefersReducedMotion) {
    const isSmallScreen = window.innerWidth < 768;
    const random = (min, max) => min + Math.random() * (max - min);

    // Debu emas: mulai dari bawah layar lalu naik sambil bergoyang
    for (let i = 0; i < (isSmallScreen ? 14 : 30); i++) {
        const dust = document.createElement('span');
        dust.className = 'gold-dust';
        dust.style.left = random(0, 100) + '%';
        dust.style.setProperty('--size', random(2, 6) + 'px');
        dust.style.setProperty('--sway', random(-60, 60) + 'px');
        dust.style.setProperty('--dur', random(10, 22) + 's');
        dust.style.setProperty('--delay', -random(0, 22) + 's'); // negatif = langsung tersebar
        caveFx.appendChild(dust);
    }

    // Kilau kristal: lebih banyak di bagian atas, tempat kristal di gambar latar
    const glintColors = ['#F3B641', '#F9DCB4', '#5AB3AD'];

    for (let i = 0; i < (isSmallScreen ? 8 : 16); i++) {
        const glint = document.createElement('span');
        glint.className = 'glint';
        glint.style.left = random(0, 100) + '%';
        glint.style.top = random(0, 70) + '%';
        glint.style.setProperty('--size', random(8, 18) + 'px');
        glint.style.setProperty('--color', glintColors[i % glintColors.length]);
        glint.style.setProperty('--dur', random(3, 7) + 's');
        glint.style.setProperty('--delay', -random(0, 7) + 's');
        caveFx.appendChild(glint);
    }
}

// ===== 8. Jejak bintang mengikuti kursor (hanya di laptop/PC) =====
if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let lastSparkle = 0;

    document.addEventListener('mousemove', (event) => {
        const now = Date.now();
        if (now - lastSparkle < 50) return; // batasi jumlah bintang agar tidak berat
        lastSparkle = now;

        const sparkle = document.createElement('span');
        sparkle.className = 'sparkle';
        sparkle.style.left = event.clientX + (Math.random() * 16 - 8) + 'px';
        sparkle.style.top = event.clientY + (Math.random() * 16 - 8) + 'px';
        document.body.appendChild(sparkle);

        sparkle.addEventListener('animationend', () => sparkle.remove());
    });
}

// ===== 9. Kotak dialog About Me: klik untuk lanjut ke kalimat berikutnya =====
const dialog = document.getElementById('dialog');
const dialogText = document.getElementById('dialog-text');
const dialogLines = [
    dialogText.textContent.trim(),
    'Di sini kamu bisa lihat skill dan pengalamanku selama ini.',
    'Psst... coba ketik kode rahasia: ↑ ↑ ↓ ↓ ← → ← → B A',
];
let dialogIndex = 0;
let dialogTimer = null;

function typeDialogLine(line) {
    if (prefersReducedMotion) {
        dialogText.textContent = line;
        return;
    }

    let index = 0;
    dialogText.textContent = '';
    dialog.classList.add('is-typing');

    dialogTimer = setInterval(() => {
        index++;
        dialogText.textContent = line.slice(0, index);
        if (index >= line.length) finishDialogLine();
    }, 30);
}

function finishDialogLine() {
    clearInterval(dialogTimer);
    dialogTimer = null;
    dialogText.textContent = dialogLines[dialogIndex];
    dialog.classList.remove('is-typing');
}

function advanceDialog() {
    // Kalau masih mengetik, tampilkan kalimat penuh dulu
    if (dialogTimer) {
        finishDialogLine();
        return;
    }

    dialogIndex = (dialogIndex + 1) % dialogLines.length;

    typeDialogLine(dialogLines[dialogIndex]);
}

dialog.addEventListener('click', advanceDialog);
dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        advanceDialog();
    }
});

// ===== 10. Kode rahasia (Konami code) untuk mode pelangi =====
const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let secretProgress = 0;

document.addEventListener('keydown', (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

    if (key === secretCode[secretProgress]) secretProgress++;
    else secretProgress = key === secretCode[0] ? 1 : 0;

    if (secretProgress === secretCode.length) {
        secretProgress = 0;
        document.body.classList.toggle('rainbow');
    }
});

// ===== 11. Partikel pixel meletup saat klik =====
if (!prefersReducedMotion) {
    const pixelColors = ['#F3B641', '#F9DCB4', '#C07E4E', '#4AA294', '#5AB3AD'];

    document.addEventListener('click', (event) => {
        for (let i = 0; i < 10; i++) {
            const pixel = document.createElement('span');
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 50;

            pixel.className = 'pixel';
            pixel.style.left = event.clientX + 'px';
            pixel.style.top = event.clientY + 'px';
            pixel.style.setProperty('--size', 4 + Math.round(Math.random() * 4) + 'px');
            pixel.style.setProperty('--color', pixelColors[i % pixelColors.length]);
            pixel.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            pixel.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            pixel.style.setProperty('--rot', Math.random() * 360 + 'deg');
            pixel.style.setProperty('--dur', 0.5 + Math.random() * 0.3 + 's');
            document.body.appendChild(pixel);

            pixel.addEventListener('animationend', () => pixel.remove());
        }
    });
}
