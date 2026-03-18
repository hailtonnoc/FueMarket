document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const numItems = carouselItems.length;
    const angleStep = (2 * Math.PI) / numItems;
    function getRadius() {
        return window.innerWidth < 768 ? window.innerWidth * 0.4 : 400;
    }

    function getParabola() {
        return window.innerWidth < 768 ? 0.001 : 0.0003;
    }

    let radiusX = getRadius();
    let parabolaStrength = getParabola();
    let currentAngle = 0;

    window.addEventListener('resize', () => {
        radiusX = getRadius();
        parabolaStrength = getParabola();
    });

    function updateCarousel() {
        carouselItems.forEach((item, index) => {
            const angle = currentAngle + index * angleStep;
            const x = Math.sin(angle) * radiusX;
            // Parábola invertida: centro desce, extremidades sobem
            const y = -(parabolaStrength * (x * x)) + 30;
            const z = Math.cos(angle); // -1 (fundo) a 1 (frente)

            // Escala e opacidade baseadas na profundidade
            const scale = 0.6 + 0.4 * ((z + 1) / 2);   // 0.6 a 1.0
            const opacity = 0.3 + 0.7 * ((z + 1) / 2);  // 0.3 a 1.0
            const zIndex = Math.round((z + 1) * 10);

            item.style.transform = `translateX(${x}px) translateY(${y}px) scale(${scale.toFixed(3)})`;
            item.style.opacity = opacity.toFixed(2);
            item.style.zIndex = zIndex;
        });
    }

    // Rotação automática suave
    let autoRotateActive = true;
    const rotationSpeed = 0.004; // Radianos por frame

    function autoRotateLoop() {
        if (autoRotateActive) {
            currentAngle += rotationSpeed;
        }
        updateCarousel();
        requestAnimationFrame(autoRotateLoop);
    }

    updateCarousel();
    requestAnimationFrame(autoRotateLoop);

    // --- Interação com o mouse e touch para controle manual ---
    let isDragging = false;
    let startX = 0;
    let startAngle = 0;

    function handleStart(clientX) {
        isDragging = true;
        startX = clientX;
        startAngle = currentAngle;
        autoRotateActive = false;
        carouselContainer.style.cursor = 'grabbing';
    }

    function handleMove(clientX) {
        if (!isDragging) return;
        const deltaX = clientX - startX;
        currentAngle = startAngle + deltaX * 0.005;
    }

    function handleEnd() {
        if (isDragging) {
            isDragging = false;
            autoRotateActive = true;
            carouselContainer.style.cursor = '';
        }
    }

    // Eventos de Mouse
    carouselContainer.addEventListener('mousedown', (e) => {
        handleStart(e.clientX);
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        handleMove(e.clientX);
    });

    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('mouseleave', handleEnd);

    // Eventos de Touch (Mobile)
    carouselContainer.addEventListener('touchstart', (e) => {
        handleStart(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        handleMove(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);


    // --- Scroll suave para links de navegação ---
    document.querySelectorAll('.menu-list a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            // Só intercepta links âncora (começam com #)
            if (!targetId.startsWith('#')) return;

            e.preventDefault();
            // Se for o link para '#cases', rolar para '#carousel-section'
            const targetElement = (targetId === '#cases') ? document.querySelector('#carousel-section') : document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Animação da section issoNaoEObvio ---
    const sectionObvio = document.querySelector('#issoNaoEObvio');
    if (sectionObvio) {
        const observerObvio = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observerObvio.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observerObvio.observe(sectionObvio);
    }

    // --- Animação Floating Shapes ---
    const servicosSection = document.getElementById('servicos');
    const shapesContainer = document.getElementById('floating-shapes-container');
    const shapesElements = document.querySelectorAll('.floating-shape');

    if (servicosSection && shapesContainer && shapesElements.length > 0) {
        // Ajusta a altura do container para cobrir desde o topo até a section serviços
        function resizeContainer() {
            const rect = servicosSection.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            shapesContainer.style.height = (rect.top + scrollTop) + 'px';
        }

        window.addEventListener('resize', resizeContainer);
        setTimeout(resizeContainer, 100);

        const shapesData = [];
        
        shapesElements.forEach(el => {
            const speedMultiplier = 0.5 + Math.random() * 0.6; // Entre 0.5 e 1.1 (velocidade agradável)
            shapesData.push({
                el: el,
                x: Math.random() * (window.innerWidth - 100),
                y: Math.random() * 500, // Inicia mais pra cima
                vx: (Math.random() > 0.5 ? 1 : -1) * speedMultiplier,
                vy: (Math.random() > 0.5 ? 1 : -1) * speedMultiplier,
                rot: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 0.8, // leve rotação
                width: 80,
                height: 80
            });
        });

        function animateShapes() {
            const containerW = shapesContainer.clientWidth;
            const containerH = shapesContainer.clientHeight;

            shapesData.forEach(shape => {
                shape.x += shape.vx;
                shape.y += shape.vy;
                shape.rot += shape.vRot;

                // Colisões nas extremidades mudam o curso (inverte a velocidade)
                if (shape.x <= 0) {
                    shape.x = 0;
                    shape.vx *= -1;
                } else if (shape.x + shape.width >= containerW) {
                    shape.x = containerW - shape.width;
                    shape.vx *= -1;
                }

                if (shape.y <= 0) {
                    shape.y = 0;
                    shape.vy *= -1;
                } else if (shape.y + shape.height >= containerH) {
                    shape.y = containerH - shape.height;
                    shape.vy *= -1;
                }

                shape.el.style.transform = `translate(${shape.x}px, ${shape.y}px) rotate(${shape.rot}deg)`;
            });

            requestAnimationFrame(animateShapes);
        }

        setTimeout(() => {
            shapesData.forEach(shape => {
                shape.width = shape.el.offsetWidth || 80;
                shape.height = shape.el.offsetHeight || 80;
            });
            resizeContainer();
            animateShapes();
        }, 150);
    }

});