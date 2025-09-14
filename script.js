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
    carouselContainer.classList.add('moving-left');

    const changeDirection = (newDirection) => {
        if (newDirection !== currentDirection) {
            carouselContainer.classList.remove(`moving-${currentDirection}`);
            carouselContainer.classList.add(`moving-${newDirection}`);
            currentDirection = newDirection;
        }
    };

    carouselWrapper.addEventListener('mousemove', (e) => {
        const hoverArea = carouselWrapper.offsetWidth / 2;
        if (e.offsetX < hoverArea) {
            changeDirection('right');
        } else {
            changeDirection('left');
        }
    });

    carouselWrapper.addEventListener('click', (e) => {
        const clickArea = carouselWrapper.offsetWidth / 2;
        if (e.offsetX < clickArea) {
            changeDirection('right');
        } else {
            changeDirection('left');
        }
    });

    // Pause animation on hover
    carouselWrapper.addEventListener('mouseenter', () => {
        carouselContainer.style.animationPlayState = 'paused';
    });

    // Resume animation on mouse leave
    carouselWrapper.addEventListener('mouseleave', () => {
        carouselContainer.style.animationPlayState = 'running';
    });
});
