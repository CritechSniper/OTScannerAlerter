let doneA = false;
const link = document.querySelector(".lastA");
link.addEventListener("mouseenter", () => {
    if (!doneA) {
        link.style.animation = "goAround 0.8s ease-in-out forwards";
    }
    setTimeout(() => {
        link.style.animation = "";
        let doneA = true;
    }, 800);
});