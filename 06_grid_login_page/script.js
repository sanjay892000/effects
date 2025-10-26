let allBox = document.querySelectorAll(".box");
allBox.forEach((box) => {
  box.addEventListener("mouseenter", (e) => {
    box.classList.add('bgred')

    setTimeout(()=>{
        box.classList.remove('bgred')
    },1000)
  });
});
