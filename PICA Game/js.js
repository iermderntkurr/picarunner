document.addEventListener("DOMContentLoaded", function () {
  animateTitle();
});

function animateTitle() {
  const title = document.querySelector(".dashboard-title");
  const text = title.innerText;
  title.innerHTML = ""; // Clear the existing text

  // Iterate through each character and create a span for it
  for (const char of text) {
    const span = document.createElement("span");
    span.innerText = char;
    title.appendChild(span);
  }

  const spans = title.querySelectorAll("span");
  let delay = 0;

  spans.forEach((span) => {
    setTimeout(() => {
      span.style.opacity = 1;
    }, delay);
    delay += 100; // Adjust the delay as needed for the typing effect
  });
}
