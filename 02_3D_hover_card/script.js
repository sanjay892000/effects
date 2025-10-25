const druide = document.querySelector('.druide');
const druidetext = document.querySelector('#druide');

druide.addEventListener('mouseenter', () => {
    druidetext.style.transform = 'rotateX(30deg)';
});

druide.addEventListener('mouseleave', () => {
    druidetext.style.transform = 'rotateX(90deg)';
}); 


const necro = document.querySelector('.necro');
const necrotext = document.querySelector('#necro');

necro.addEventListener('mouseenter', () => {
    necrotext.style.transform = 'rotateX(30deg)';
});

necro.addEventListener('mouseleave', () => {
    necrotext.style.transform = 'rotateX(90deg)';
});