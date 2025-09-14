document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const items = document.querySelectorAll('.carousel-item');
    const totalItems = items.length;

    // Clone items for seamless looping
    for (let i = 0; i < totalItems; i++) {
        const clone = items[i].cloneNode(true);
        carouselContainer.appendChild(clone);
    }

    let currentDirection = 'left';
    let hoveredSide = 'none';

    // Start with default left movement
    carouselContainer.classList.add('moving-left');

    function changeDirection(side) {
        if (side === hoveredSide) return;
        hoveredSide = side;

        // Get current transform state
        const style = window.getComputedStyle(carouselContainer);
        const currentTransform = style.transform;

        // Pause current animation
        carouselContainer.style.animation = 'none';
        carouselContainer.style.transform = currentTransform;

        // Force reflow
        void carouselContainer.offsetWidth;

        // Remove previous animation class
        carouselContainer.classList.remove('moving-left', 'moving-right');

        // Add new animation class based on hover side
        const newDirection = side === 'left' ? 'left' : 'right';
        carouselContainer.classList.add(`moving-${newDirection}`);
        currentDirection = newDirection;

        // Clear animation override
        carouselContainer.style.animation = '';
    }

    // Add hover detection zones
    const leftZone = document.createElement('div');
    const rightZone = document.createElement('div');

    Object.assign(leftZone.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        width: '50%',
        height: '100%',
        zIndex: '1'
    });

    Object.assign(rightZone.style, {
        position: 'absolute',
        right: '0',
        top: '0',
        width: '50%',
        height: '100%',
        zIndex: '1'
    });

    carouselWrapper.appendChild(leftZone);
    carouselWrapper.appendChild(rightZone);

    // Event listeners for zones
    leftZone.addEventListener('mouseenter', () => changeDirection('right'));
    rightZone.addEventListener('mouseenter', () => changeDirection('left'));

    // Reset on mouse leave
    carouselWrapper.addEventListener('mouseleave', () => {
        hoveredSide = 'none';
        changeDirection(currentDirection);
    });

    // Pause/Resume on hover
    carouselWrapper.addEventListener('mouseenter', () => {
        carouselContainer.style.animationPlayState = 'paused';
    });

    carouselWrapper.addEventListener('mouseleave', () => {
        carouselContainer.style.animationPlayState = 'running';
    });
});
