// Play button
const playButton = document.getElementById("playButton");
playButton.addEventListener("click", startGame);

// Game variables and constants
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const player = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: 50,
  height: 50,
};
let rocks = [];
let score = 0;
let gameInterval;

// Flags for arrow key state
let leftPressed = false;
let rightPressed = false;

// Create a new Image object for the background
const backgroundImage = new Image();
backgroundImage.src = "background2.jpg"; // Replace with the correct path to your image

// Explosion image
const explosionImage = new Image();
explosionImage.src = "explosion.png"; // Replace with the path to your explosion image

// Event listeners for arrow keys
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

const movementSpeed = 7.5;
let rockSpeed = 1;
let initialRockSpawnInterval = 1000;
let rockSpawnInterval = initialRockSpawnInterval;

// Maximum rock speed
const maxRockSpeed = 11; // Set the maximum rock speed as desired

// Maximum probability of rock spawning
const maxSpawnProbability = 0.95;

// Retry button
const retryButton = document.getElementById("retryButton");
retryButton.addEventListener("click", retryGame);

// Get the audio element for the game sound
var gameSound = document.getElementById("gameSound");

// Set the loop attribute to true
gameSound.loop = true;

// Get the explosion sound element
var explosionSound = new Audio("explosion_sound.mp3"); // Replace with the correct path to your explosion sound

// Function to play the sound
function playExplosionSound() {
  explosionSound.play();
}

// Ensure sound is loaded and muted until user interaction
explosionSound.autoplay = false;
explosionSound.muted = true;

// Wait for user interaction to enable sound
document.addEventListener("click", enableSound);

function enableSound() {
  document.removeEventListener("click", enableSound);
  explosionSound.muted = false;
}

// Function to play the sound
function playGameSound() {
  gameSound.play();
}

// Variable to store initial touch position
let touchStartX = 0;

// Variable to track if the player is exploding
let isExploding = false;

// Call the function when the window finishes loading
window.addEventListener("load", playGameSound);

// Add touch event listeners
canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);

// Update the functions
function handleTouchStart(e) {
  e.preventDefault();
  touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
  e.preventDefault();

  const touchX = e.touches[0].clientX;

  // Calculate the distance moved
  const deltaX = touchX - touchStartX;

  // Adjust the player position based on the distance moved
  player.x += deltaX;

  // Limit the player position within the canvas boundaries
  if (player.x < 0) {
    player.x = 0;
  } else if (player.x > canvas.width - player.width) {
    player.x = canvas.width - player.width;
  }

  // Update the initial touch position
  touchStartX = touchX;
}

function handleTouchEnd(e) {
  // Reset the flags when the touch ends
  leftPressed = false;
  rightPressed = false;
}

function handleKeyDown(e) {
  e.preventDefault();

  if (e.key === "ArrowLeft") {
    leftPressed = true;
  } else if (e.key === "ArrowRight") {
    rightPressed = true;
  }
}

function handleKeyUp(e) {
  if (e.key === "ArrowLeft") {
    leftPressed = false;
  } else if (e.key === "ArrowRight") {
    rightPressed = false;
  }
}

// Update the toggleGame function
function toggleGame() {
  if (isGameRunning) {
    // If the game is running, stop it
    stopGame();
  } else {
    // If the game is not running, start it
    startGame();
  }
}

// Update the startGame function
function startGame() {
  // Hide the play button
  playButton.style.display = "none";

  // Reset game variables
  player.x = canvas.width / 2;
  player.y = canvas.height - 50;
  rocks = [];
  score = 0;
  rockSpeed = 1;
  rockSpawnInterval = initialRockSpawnInterval;
  isExploding = false;

  // Start the game
  gameInterval = setInterval(updateGame, 20);

  // Play the game sound
  playGameSound();
}

function updateGame() {
  // Draw the background image first
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  // Move and draw player
  updatePlayer();

  // Create and move rocks
  createRocks();
  moveRocks();

  // Check for collisions
  if (checkCollision()) {
    explodePlayer();
    return;
  }

  // Update score
  updateScore();

  // Increase rock speed up to the maximum limit
  if (rockSpeed < maxRockSpeed) {
    rockSpeed += 0.01; // Adjust the speed increase rate
  }

  // Calculate adjusted probability based on falling speed
  const adjustedProbability = Math.min(
    0.2 + rockSpeed * 0.01,
    maxSpawnProbability
  );

  // Spawn more rocks over time
  if (Math.random() < adjustedProbability) {
    // Increase the number of rocks spawned
    const rocksToSpawn = 8; // Adjust the number of rocks to spawn
    for (let i = 0; i < rocksToSpawn; i++) {
      createRocks();
    }
  } else {
    rockSpawnInterval -= deltaTime * 0.1; // Adjust the multiplier as needed
  }
}

function updatePlayer() {
  if (!isExploding) {
    if (leftPressed && player.x > 0) {
      player.x -= movementSpeed;
    }

    if (rightPressed && player.x < canvas.width - player.width) {
      player.x += movementSpeed;
    }

    // Draw the player
    drawPlayer();
  } else {
    // Draw explosion
    ctx.drawImage(
      explosionImage,
      player.x,
      player.y,
      player.width,
      player.height
    );
  }
}

function drawPlayer() {
  const logoImage = new Image();
  logoImage.src = "logo1.png"; // Replace 'logo.png' with the actual filename of your logo image

  // Draw the image at the player's position
  ctx.drawImage(logoImage, player.x, player.y, player.width, player.height);
}

function createRocks() {
  const baseSpawnProbability = 0.01; // Adjust the base probability as needed
  const adjustedSpawnProbability = baseSpawnProbability + rockSpeed * 0.005; // Adjust the multiplier as needed
  const rocksToSpawn = Math.floor(Math.random() * 1) + 1; // Adjust the range of rocks to spawn

  if (Math.random() < adjustedSpawnProbability) {
    for (let i = 0; i < rocksToSpawn; i++) {
      const rock = {
        x: Math.random() * (canvas.width - 20),
        y: 0,
        width: 20,
        height: 20,
      };
      rocks.push(rock);
    }
  }
}

function moveRocks() {
  rocks.forEach((rock) => {
    rock.y += rockSpeed;

    // Draw a blue circle for each rock
    ctx.fillStyle = "#00f"; // Blue color for rocks
    ctx.beginPath();
    ctx.arc(rock.x + rock.width / 2, rock.y + rock.height / 2, rock.width / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  });

  // Remove rocks that are off-screen
  rocks = rocks.filter((rock) => rock.y < canvas.height);
}


function checkCollision() {
  return rocks.some((rock) => {
    const collisionThreshold = player.y + player.height * 0.5;

    if (
      player.x < rock.x + rock.width &&
      player.x + player.width > rock.x &&
      player.y < rock.y + rock.height &&
      collisionThreshold > rock.y
    ) {
      return true; // Collision occurred
    }

    return false;
  });
}

function explodePlayer() {
  isExploding = true;

  // Stop the game sound
  gameSound.pause();
  gameSound.currentTime = 0;

  // Play explosion sound
  explosionSound.play();

  // Add any additional explosion effects or sound here

  // Ensure that the explosion sound is played on mobile devices
  // by checking for user interaction (click) before unmuting
  document.addEventListener("click", handleMobileExplosion);

  // Wait for a certain duration (adjust as needed)
  setTimeout(() => {
    endGame(); // End the game after the explosion
  }, 1000); // 1000 milliseconds (adjust as needed)
}

// Function to handle mobile explosion sound
function handleMobileExplosion() {
  // Remove the event listener to prevent multiple calls
  document.removeEventListener("click", handleMobileExplosion);

  // Unmute the explosion sound for mobile devices
  explosionSound.muted = false;
}

function updateScore() {
  score++;
  document.getElementById("score").innerText = "Score: " + score;
}

function endGame() {
  clearInterval(gameInterval);

  // Show retry button
  retryButton.style.display = "block";
}

function retryGame(e) {
  // Prevent the default behavior of the button click (page refresh)
  e.preventDefault();

  // Hide the retry button
  retryButton.style.display = "none";

  // Restart the game directly
  startGame();
}
