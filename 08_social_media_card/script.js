

let socialCard = document.querySelectorAll('.social-card');

socialCard.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        console.log(e.offsetX, e.offsetY);

        card.style.setProperty('--x', e.offsetX + 'px');
        card.style.setProperty('--y', e.offsetY + 'px');
    });
});