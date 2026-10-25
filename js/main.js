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

// ===== 7. Kunang-kunang beterbangan di latar =====
const firefliesBox = document.getElementById('fireflies');

if (firefliesBox && !prefersReducedMotion) {
    const fireflyCount = window.innerWidth < 768 ? 12 : 25;

    for (let i = 0; i < fireflyCount; i++) {
        const firefly = document.createElement('span');
        firefly.className = 'firefly';
        firefly.style.left = Math.random() * 100 + '%';
        firefly.style.top = Math.random() * 100 + '%';
        firefly.style.setProperty('--dx', Math.random() * 80 - 40 + 'px');
        firefly.style.setProperty('--dy', Math.random() * 80 - 40 + 'px');
        firefly.style.setProperty('--dur', 8 + Math.random() * 8 + 's');
        firefly.style.setProperty('--glow', 2 + Math.random() * 3 + 's');
        firefly.style.setProperty('--delay', -Math.random() * 8 + 's');
        firefliesBox.appendChild(firefly);
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
