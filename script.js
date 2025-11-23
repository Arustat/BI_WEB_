// Gestion de la musique de fond
document.addEventListener('DOMContentLoaded', function() {
    const musicToggle = document.getElementById('musicToggle');
    const backgroundMusic = document.getElementById('backgroundMusic');
    
    if (!musicToggle || !backgroundMusic) return;
    
    // État initial : musique activée
    let isPlaying = false;
    
    // Fonction pour démarrer la musique
    function startMusic() {
        if (backgroundMusic && !isPlaying) {
            backgroundMusic.volume = 0.3; // Volume doux
            backgroundMusic.play().catch(err => {
                console.log('Auto-play bloqué, nécessite interaction utilisateur');
            });
            isPlaying = true;
            musicToggle.classList.remove('muted');
        }
    }
    
    // Fonction pour toggle la musique
    function toggleMusic() {
        if (isPlaying) {
            backgroundMusic.pause();
            musicToggle.classList.add('muted');
            isPlaying = false;
        } else {
            backgroundMusic.play();
            musicToggle.classList.remove('muted');
            isPlaying = true;
        }
    }
    
    // Démarrer la musique au clic sur le toggle (pour contourner l'auto-play)
    musicToggle.addEventListener('click', function(e) {
        e.preventDefault();
        if (!isPlaying && backgroundMusic.paused) {
            startMusic();
        } else {
            toggleMusic();
        }
    });
    
    // Démarrer automatiquement après la première interaction utilisateur
    document.addEventListener('click', function() {
        if (!isPlaying) {
            startMusic();
        }
    }, { once: true });
    
    // Gérer la continuité de la musique entre les pages
    window.addEventListener('beforeunload', function() {
        if (isPlaying) {
            sessionStorage.setItem('musicPlaying', 'true');
        }
    });
    
    // Reprendre la musique si elle était en cours
    if (sessionStorage.getItem('musicPlaying') === 'true') {
        setTimeout(() => {
            startMusic();
        }, 500);
    }
});

// Animation de scroll fluide pour la page finale
document.addEventListener('DOMContentLoaded', function() {
    if (document.body.classList.contains('page-final')) {
        const letterContent = document.querySelector('.letter-content');
        if (letterContent) {
            // Ajouter une animation subtile au scroll
            let lastScroll = 0;
            window.addEventListener('scroll', function() {
                const currentScroll = window.pageYOffset;
                if (Math.abs(currentScroll - lastScroll) > 5) {
                    letterContent.style.transition = 'opacity 0.3s ease';
                }
                lastScroll = currentScroll;
            });
        }
    }
});

// Lazy loading amélioré pour les images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Génération de confettis pour la page d'accueil !
document.addEventListener('DOMContentLoaded', function () {
    if (!document.body.classList.contains('page-home')) return;
    const container = document.querySelector('.confetti-container');
    if (!container) return;
    const confettiColors = [
        'var(--violet-pastel)', 'var(--rose-pastel)', 'var(--violet-fonce)', 'var(--rose-fonce)', 'var(--blanc-casse)'
    ];
    function randomBetween(a, b) {
        return Math.random() * (b - a) + a;
    }
    function createConfetti() {
        const el = document.createElement('div');
        el.className = 'confetti';
        const left = Math.random() * 100;
        el.style.left = left + 'vw';
        el.style.opacity = randomBetween(0.7, 1);
        el.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        el.style.animationDuration = randomBetween(3, 7) + 's';
        el.style.animationDelay = randomBetween(0, 2) + 's';
        el.style.width = randomBetween(8, 18) + 'px';
        el.style.height = el.style.width;
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '30% 70% 60% 40% / 30% 40% 60% 70%';
        container.appendChild(el);
        setTimeout(() => {
            el.remove();
        }, 7000);
    }
    setInterval(createConfetti, 200);
    // Lancer immédiatement quelques confettis
    for(let i=0; i<18; i++) createConfetti();
});

// Gestion du fond dynamique pour toutes les pages avec synchronisation inter-pages

document.addEventListener('DOMContentLoaded', function() {
    let heroImage = document.querySelector('.hero-image');
    let pageClass = document.body.classList.contains('page-home') ? '.page-home'
                   : document.body.classList.contains('page-souvenirs') ? '.page-souvenirs'
                   : document.body.classList.contains('page-final') ? '.page-final'
                   : null;
    let pageNode = pageClass ? document.querySelector(pageClass) : null;
    if (!pageNode) return;

    function applyDynamicBg(from) {
        if (!from) return false;
        try {
            const bgColor1 = from.bgColor1;
            const bgColor2 = from.bgColor2;
            pageNode.style.background = `linear-gradient(135deg, ${bgColor1} 0%, ${bgColor2} 100%)`;
            document.documentElement.style.setProperty('--violet-pastel', from.violetPastel);
            document.documentElement.style.setProperty('--rose-pastel', from.rosePastel);
            document.documentElement.style.setProperty('--violet-fonce', from.violetFonce);
            document.documentElement.style.setProperty('--rose-fonce', from.roseFonce);
            return true;
        } catch(e) { return false; }
    }

    const themeCacheKey = 'dynamic-theme';
    const themeStorage = localStorage.getItem(themeCacheKey);
    let parsedTheme = null;
    if (themeStorage) {
        try { parsedTheme = JSON.parse(themeStorage); } catch{ parsedTheme = null; }
    }

    // 1. Si fond dynamique stocké : on applique
    if (parsedTheme && applyDynamicBg(parsedTheme)) {
        // fond dynamique propagé OK
        return;
    }

    // 2. Sinon on tente d'extraire depuis l'image
    function extractAndApplyColors() {
        try {
            if (!heroImage) throw new Error('no hero-image');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = heroImage.naturalWidth || heroImage.width;
            canvas.height = heroImage.naturalHeight || heroImage.height;
            ctx.drawImage(heroImage, 0, 0, canvas.width, canvas.height);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const colorMap = {};
            for (let i = 0; i < data.length; i += 4) {
                const a = data[i+3];
                if (a < 128) continue;
                const r = Math.floor(data[i] / 10) * 10, g = Math.floor(data[i+1] / 10) * 10, b = Math.floor(data[i+2] / 10) * 10;
                const key = `${r},${g},${b}`;
                colorMap[key] = colorMap[key] || { r, g, b, count: 0 };
                colorMap[key].count++;
            }
            const colors = Object.values(colorMap).sort((a, b) => b.count - a.count).filter(color => {
                const bright = (color.r + color.g + color.b) / 3;
                return bright > 50 && bright < 240;
            });
            if (colors.length > 0) {
                const c1 = colors[0], c2 = colors[1] || colors[0];
                const pastel = c => Math.min(255, Math.floor(c * 0.7 + 255 * 0.3));
                const bgColor1 = `rgba(${pastel(c1.r)}, ${pastel(c1.g)}, ${pastel(c1.b)}, 0.95)`;
                const bgColor2 = `rgba(${pastel(c2.r)}, ${pastel(c2.g)}, ${pastel(c2.b)}, 0.95)`;
                const violetPastel = `rgb(${pastel(c1.r)}, ${pastel(c1.g)}, ${pastel(c1.b)})`;
                const rosePastel = `rgb(${pastel(c2.r)}, ${pastel(c2.g)}, ${pastel(c2.b)})`;
                const violetFonce = `rgb(${Math.max(0, Math.floor(pastel(c1.r) * 0.85))},${Math.max(0, Math.floor(pastel(c1.g) * 0.85))},${Math.max(0, Math.floor(pastel(c1.b) * 0.85))})`;
                const roseFonce = `rgb(${Math.max(0, Math.floor(pastel(c2.r) * 0.85))},${Math.max(0, Math.floor(pastel(c2.g) * 0.85))},${Math.max(0, Math.floor(pastel(c2.b) * 0.85))})`;

                // Appliquer + stocker
                applyDynamicBg({bgColor1, bgColor2, violetPastel, rosePastel, violetFonce, roseFonce});
                localStorage.setItem(themeCacheKey, JSON.stringify({bgColor1, bgColor2, violetPastel, rosePastel, violetFonce, roseFonce}));
                return true;
            }
        } catch (error) {
            // Fallback si image absente
        }
        return false;
    }
    if (heroImage) {
        if (heroImage.complete && heroImage.naturalWidth > 0) {
            extractAndApplyColors();
        } else {
            heroImage.addEventListener('load', extractAndApplyColors);
        }
    } else {
        // 3. Fallback pastel simple sur toutes les pages
        pageNode.style.background = 'linear-gradient(135deg, var(--violet-pastel) 0%, var(--rose-pastel) 100%)';
    }
});

