document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const numItems = carouselItems.length;
    const angleStep = (2 * Math.PI) / numItems;

    function getRadius() {
        if (window.innerWidth >= 768) return 400;
        const itemHalfWidth = 75; // 150/2
        return Math.max(50, (window.innerWidth / 2) - itemHalfWidth - 5);
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

    // Eventos de Mouse e Touch — só registra se o carrossel existir na página
    if (carouselContainer) {
        carouselContainer.addEventListener('mousedown', (e) => {
            handleStart(e.clientX);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            handleMove(e.clientX);
        });

        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('mouseleave', handleEnd);

        carouselContainer.addEventListener('touchstart', (e) => {
            handleStart(e.touches[0].clientX);
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            handleMove(e.touches[0].clientX);
        }, { passive: true });

        document.addEventListener('touchend', handleEnd);
        document.addEventListener('touchcancel', handleEnd);
    }


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

    // --- Serviços Avulsos — auto-collapse on scroll ---
    const avulsosAccordion = document.getElementById('avulsosAccordion');
    if (avulsosAccordion) {
        const avulsoGroups = Array.from(avulsosAccordion.querySelectorAll('.avulso-group'));
        let avulsosAutoPlayed = false;

        const avulsosObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !avulsosAutoPlayed) {
                    avulsosAutoPlayed = true;
                    avulsoGroups.forEach((group, i) => {
                        setTimeout(() => {
                            group.classList.add('collapsed');
                            const btn = group.querySelector('.avulso-group-row');
                            if (btn) btn.setAttribute('aria-expanded', 'false');
                            const icon = group.querySelector('.avulso-toggle-icon');
                            if (icon) icon.textContent = '−';
                        }, 1400 + i * 550);
                    });
                }
            });
        }, { threshold: 0.15 });

        avulsosObserver.observe(avulsosAccordion);

        // Manual toggle
        avulsoGroups.forEach(group => {
            const btn = group.querySelector('.avulso-group-row');
            if (!btn) return;
            btn.addEventListener('click', () => {
                const isNowCollapsed = group.classList.toggle('collapsed');
                btn.setAttribute('aria-expanded', String(!isNowCollapsed));
                const icon = group.querySelector('.avulso-toggle-icon');
                if (icon) icon.textContent = isNowCollapsed ? '−' : '×';
            });
        });
    }

    // --- Cases Slider — dados lidos do HTML (#cases-data) ---
    const casesData = Array.from(document.querySelectorAll('#cases-data .case-data')).map(el => ({
        phoneBack:  el.dataset.phoneBack,
        phoneFront: el.dataset.phoneFront,
        backType:   el.dataset.backType || 'phone',
        stat1Val:   el.dataset.stat1Val,
        stat1Lbl:   el.dataset.stat1Lbl,
        stat2Val:   el.dataset.stat2Val,
        stat2Lbl:   el.dataset.stat2Lbl,
        name:       el.dataset.name,
        subtitle:   el.dataset.subtitle,
        trabalho:   Array.from(el.querySelectorAll('.case-data-trabalho li')).map(li => li.textContent),
        resultado:  el.dataset.resultado,
        aumentos:   Array.from(el.querySelectorAll('.case-data-aumentos li')).map(li => li.textContent),
        descricao:  el.dataset.descricao,
        link:       el.dataset.link
    }));

    let currentCaseIndex = 0;
    let isCaseAnimating = false;

    const caseSlide      = document.querySelector('.case-slide');
    const casePhones     = document.querySelector('.case-phones');
    const phoneBack      = document.querySelector('.phone-back');
    const phoneFront     = document.querySelector('.phone-front');
    const statVal1       = document.querySelector('.stat-val-1');
    const statLbl1       = document.querySelector('.stat-lbl-1');
    const statVal2       = document.querySelector('.stat-val-2');
    const statLbl2       = document.querySelector('.stat-lbl-2');
    const clientName     = document.querySelector('.case-client-name');
    const caseSubtitle   = document.querySelector('.case-subtitle');
    const trabalhoList   = document.querySelector('.case-trabalho-list');
    const caseResultado  = document.querySelector('.case-resultado');
    const aumentoList    = document.querySelector('.case-aumento-list');
    const caseDescricao  = document.querySelector('.case-descricao');
    const caseLink       = document.querySelector('.case-link');
    const statsCard      = document.querySelector('.case-stats-card');
    const centerCol      = document.querySelector('.case-center-col');
    const rightCol       = document.querySelector('.case-right-col');
    const arrowPrev      = document.querySelector('.case-arrow-prev');
    const arrowNext      = document.querySelector('.case-arrow-next');

    function populateCase(data) {
        phoneBack.src        = data.phoneBack;
        phoneFront.src       = data.phoneFront;
        casePhones.classList.toggle('notebook-case', data.backType === 'notebook');
        statVal1.textContent = data.stat1Val;
        statLbl1.textContent = data.stat1Lbl;
        statVal2.textContent = data.stat2Val;
        statLbl2.textContent = data.stat2Lbl;
        clientName.textContent  = data.name;
        caseSubtitle.textContent = data.subtitle;
        trabalhoList.innerHTML  = data.trabalho.map(t => `<li>${t}</li>`).join('');
        caseResultado.textContent = data.resultado;
        aumentoList.innerHTML   = data.aumentos.map(a => `<li>${a}</li>`).join('');
        caseDescricao.textContent = data.descricao;
        caseLink.href = data.link;
    }

    function playCaseAnim() {
        // Remove animation classes e força reflow para reiniciar
        phoneBack.classList.remove('entering');
        phoneFront.classList.remove('entering');
        statsCard.classList.remove('rising');
        centerCol.classList.remove('rising');
        rightCol.classList.remove('rising');

        void phoneBack.offsetWidth; // força reflow

        phoneBack.classList.add('entering');
        phoneFront.classList.add('entering');
        statsCard.classList.add('rising');
        centerCol.classList.add('rising');
        rightCol.classList.add('rising');
    }

    function showCase(index) {
        if (isCaseAnimating) return;
        isCaseAnimating = true;
        currentCaseIndex = ((index % casesData.length) + casesData.length) % casesData.length;
        populateCase(casesData[currentCaseIndex]);
        playCaseAnim();
        setTimeout(() => { isCaseAnimating = false; }, 1500);
    }

    const casesSection = document.getElementById('cases');
    if (casesSection && caseSlide) {
        populateCase(casesData[0]);

        let casesEnteredOnce = false;
        const casesObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    arrowPrev.classList.add('visible');
                    arrowNext.classList.add('visible');
                    if (!casesEnteredOnce) {
                        casesEnteredOnce = true;
                        playCaseAnim();
                    }
                } else {
                    arrowPrev.classList.remove('visible');
                    arrowNext.classList.remove('visible');
                }
            });
        }, { threshold: 0.2 });

        casesObserver.observe(casesSection);

        arrowPrev.addEventListener('click', () => showCase(currentCaseIndex - 1));
        arrowNext.addEventListener('click', () => showCase(currentCaseIndex + 1));
    }

    // --- Menu Mobile Toggle ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.menu');

    if (mobileMenuToggle && menu) {
        mobileMenuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            if (menu.classList.contains('active')) {
                mobileMenuToggle.innerHTML = '&#10005;'; // X
            } else {
                mobileMenuToggle.innerHTML = '&#9776;'; // Hamburger
            }
        });

        const menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                mobileMenuToggle.innerHTML = '&#9776;';
            });
        });
    }

    document.querySelectorAll('.fb-audio-btn').forEach(btn => {
        const audioId = btn.dataset.audio;
        const audio = document.getElementById(audioId);
        if (!audio) return;
        const progressEl = document.getElementById('progress-' + audioId.split('-')[1]);
        const timeEl = document.getElementById('time-' + audioId.split('-')[1]);
        const iconPlay = btn.querySelector('.icon-play');
        const iconPause = btn.querySelector('.icon-pause');

        btn.addEventListener('click', () => {
            if (audio.paused) {
                document.querySelectorAll('audio').forEach(a => { if (a !== audio) a.pause(); });
                audio.play();
                iconPlay.style.display = 'none';
                iconPause.style.display = '';
            } else {
                audio.pause();
                iconPlay.style.display = '';
                iconPause.style.display = 'none';
            }
        });

        audio.addEventListener('timeupdate', () => {
            if (!audio.duration) return;
            const pct = (audio.currentTime / audio.duration) * 100;
            if (progressEl) progressEl.style.width = pct + '%';
            if (timeEl) {
                const m = Math.floor(audio.currentTime / 60);
                const s = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
                timeEl.textContent = m + ':' + s;
            }
        });

        audio.addEventListener('ended', () => {
            iconPlay.style.display = '';
            iconPause.style.display = 'none';
            if (progressEl) progressEl.style.width = '0%';
            if (timeEl) timeEl.textContent = '0:00';
        });
    });

});