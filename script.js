document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const numItems = carouselItems.length;
    const angleStep = 360 / numItems; // Ângulo entre cada item
    const radius = 220; // Raio do círculo em pixels diminuído (aproximando os itens uns dos outros)
    let currentRotationY = 0; // Rotação Y atual do carrossel principal

    let isDragging = false;
    let startX;
    let startRotationY; // Para armazenar a rotação inicial quando o arrasto começar

    // Função para posicionar os itens ao longo do círculo
    function positionItems() {
        carouselItems.forEach((item, index) => {
            const itemAngle = index * angleStep; // Ângulo para este item

            // A rotação posiciona o item no ângulo correto no círculo,
            // e a translação o empurra para fora, criando o raio.
            item.style.transform = `
                rotateY(${itemAngle}deg)
                translateZ(${radius}px)
            `;
            // Definir o transform-origin para o centro para rotações futuras
            item.style.transformOrigin = '50% 50%';
        });
    }

    // Aplica as posições iniciais dos itens
    positionItems();

    // Aplica a rotação atual ao contêiner principal do carrossel e opacidade
    function applyContainerRotation() {
        // Inclina o eixo (rotateX) para criar uma parábola anelar e levanta o fundo
        carouselContainer.style.transform = `rotateX(-15deg) rotateY(${currentRotationY}deg)`;

        // Atualiza a opacidade e z-index dos itens baseado na profundidade
        carouselItems.forEach((item, index) => {
            const itemAngle = index * angleStep;
            // Ângulo absoluto deste item na visão da câmera
            const totalAngle = itemAngle + currentRotationY;
            // Transforma o ângulo em radianos e calcula o z-depth (-1 ao fundo, 1 na frente)
            const zPosition = Math.cos(totalAngle * Math.PI / 180);

            // Opacidade varia de 0.2 (fundo) a 1.0 (frente)
            const opacity = 0.6 + (0.4 * zPosition);
            item.style.opacity = opacity.toFixed(2);

            // Calcula Z-Index: cards da frente (zPosition > 0) ganham z-index maior que o H1 (z-index: 5)
            // Cards do fundo (zPosition < 0) ficam com z-index menor
            const zIndexValue = Math.round((zPosition + 1) * 10); // Escala de 0 a 20
            item.style.zIndex = zIndexValue;
        });
    }

    // --- Comportamento de rotação automática ---
    let autoRotateInterval;
    const startAutoRotate = () => {
        stopAutoRotate(); // Garante que não haja múltiplos intervalos rodando
        autoRotateInterval = setInterval(() => {
            currentRotationY -= 0.1; // Velocidade da rotação automática (ajuste conforme desejar)
            applyContainerRotation();
        }, 10); // A cada 10ms
    };

    const stopAutoRotate = () => {
        clearInterval(autoRotateInterval);
    };

    // Inicia a rotação automática ao carregar
    startAutoRotate();

    // --- Interação com o mouse para controle manual ---
    carouselContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startRotationY = currentRotationY; // Salva a rotação atual do carrossel
        carouselContainer.classList.add('dragging');
        stopAutoRotate(); // Para a rotação automática ao arrastar
        e.preventDefault(); // Previne o comportamento padrão do arrastar de imagem/texto
    });

    // Usa 'document' para pegar o mouseup e mouseleave mesmo se o mouse sair do carrossel
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        // Calcula a nova rotação baseada no movimento do mouse
        currentRotationY = startRotationY + (deltaX * 0.5); // Ajuste a sensibilidade aqui
        applyContainerRotation();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            carouselContainer.classList.remove('dragging');
            startAutoRotate(); // Retoma a rotação automática ao soltar
        }
    });

    // Se o mouse sair do corpo da página enquanto arrasta, também parar o arrasto
    document.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            carouselContainer.classList.remove('dragging');
            startAutoRotate();
        }
    });

    // --- Scroll suave para links de navegação ---
    document.querySelectorAll('.menu-list a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
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

});