let signup = document.querySelector('#signup');
let login = document.querySelector('#login');

let isLogin = true
let rotateBox = document.querySelector('.rotate-box')

let loginContainer = document.querySelector('.login-container')
let signupContainer = document.querySelector('.signup-container')
signup.addEventListener('click', () => {

    if (isLogin) {
        signupContainer.classList.remove('hidden')
        loginContainer.classList.add('hidden')
    }
    rotateBox.style.transform = 'rotate(-60deg)'
    rotateBox.style.transformOrigin = '43% 100%'
    isLogin = false
})


login.addEventListener('click', () => {

    if (!isLogin) {
        loginContainer.classList.remove('hidden')
        signupContainer.classList.add('hidden')
    }
    rotateBox.style.transform = 'rotate(60deg)'
    rotateBox.style.transformOrigin = '57% 100%'
    isLogin = true
})