const confirmationModal = document.getElementById('confirmationModal');
const confirmationModalTitle = document.getElementById('confirmationModalTitle');
const confirmationModalMessage = document.getElementById('confirmationModalMessage');
const confirmModalBtn = document.getElementById('confirmModalBtn');
// --- Corrected this line ---
const cancelModalBtn = document.getElementById('cancelModalBtn');
const confirmationCloseButton = document.querySelector('.confirmation-close');

// Keep track of the current listeners to remove them later
let currentConfirmListener = null;
let currentCancelListener = null;
let currentCloseListener = null;
let currentOverlayClickListener = null;

// *** Updated showConfirmationModal to accept onCancel callback ***
function showConfirmationModal(title, message, onConfirm, onCancel = () => {}) {
    confirmationModalTitle.textContent = title;
    confirmationModalMessage.textContent = message;
    confirmationModal.style.display = 'flex';

    // Remove previous listeners if they exist
    if (currentConfirmListener) {
        confirmModalBtn.removeEventListener('click', currentConfirmListener);
    }
    if (currentCancelListener) {
        cancelModalBtn.removeEventListener('click', currentCancelListener);
    }
    if (currentCloseListener) {
        confirmationCloseButton.removeEventListener('click', currentCloseListener);
    }
     if (currentOverlayClickListener) {
        confirmationModal.removeEventListener('click', currentOverlayClickListener);
    }


    // Define the new listeners
    currentConfirmListener = () => {
        onConfirm();
        confirmationModal.style.display = 'none';
         resetAFKTimer(); // Reset AFK timer on confirmation
    };

    currentCancelListener = () => {
        onCancel(); // *** Call the cancel callback ***
        confirmationModal.style.display = 'none';
         resetAFKTimer(); // Reset AFK timer on cancellation
    };

    currentCloseListener = () => {
        onCancel(); // *** Also call cancel callback if closed directly ***
        confirmationModal.style.display = 'none';
         resetAFKTimer(); // Reset AFK timer on closing modal
    };

     currentOverlayClickListener = (event) => {
        if (event.target === confirmationModal) {
            onCancel(); // *** Also call cancel callback if clicked outside ***
            confirmationModal.style.display = 'none';
             resetAFKTimer(); // Reset AFK timer on clicking outside modal
        }
    };


    // Add the new listeners
    confirmModalBtn.addEventListener('click', currentConfirmListener);
    cancelModalBtn.addEventListener('click', currentCancelListener);
    confirmationCloseButton.addEventListener('click', currentCloseListener);
    confirmationModal.addEventListener('click', currentOverlayClickListener);

     // Ensure buttons are visible for confirmation modal
    const modalButtons = confirmationModal ? confirmationModal.querySelector('.modal-buttons') : null;
     if (modalButtons) {
         modalButtons.style.display = 'flex';
     }
}
// *** End of showConfirmationModal update ***

const questions = [
  {
    question: "What is 9 + 10?",
    options: ["17", "19", "21", "22"],
    answer: 1, // Corrected answer index for 19
    explanation: "This is a meme reference! While '21' is a funny answer, the correct math answer is 19."
  },
  {
    question: "Which planet is closest to the sun?",
    options: ["Earth", "Venus", "Mars", "Mercury"],
    answer: 3,
    explanation: "Mercury is the closest planet to the Sun in our solar system."
  },
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: 2,
    explanation: "Paris is the capital and largest city of France."
  },
  {
    question: "What is the square root of 64?",
    options: ["6", "7", "8", "9"],
    answer: 2,
    explanation: "The square root of 64 is 8, because 8 * 8 = 64."
  },
  {
    question: "What is the chemical symbol for water?",
    options: ["O2", "H2O", "CO2", "NaCl"],
    answer: 1,
    explanation: "The chemical symbol for water is H₂O, meaning two hydrogen atoms and one oxygen atom."
  },
  {
    question: "Which programming language is often used for web development?",
    options: ["Python", "Java", "JavaScript", "C++"],
    answer: 2,
    explanation: "JavaScript is a core technology for web development, alongside HTML and CSS."
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    answer: 3,
    explanation: "The Pacific Ocean is the largest and deepest of Earth's five oceanic divisions."
  }
];

let currentQuestionIndex = 0;
let score = 0;
let hints = 3;
let timer;
let timeLeft;
let difficulty = 'medium'; // Default difficulty
let shuffledQuestions = []; // Array to hold shuffled questions

// --- Added variable to store paused time ---
let pausedTimeLeft = 0;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const scoreEl = document.getElementById("score");
const hintsEl = document.getElementById("hints");
const timerEl = document.getElementById("timer");
const explanationBox = document.getElementById("explanationBox"); // Moved inside modal in HTML
const viewExplanationBtn = document.getElementById("viewExplanationBtn");
const submitBtn = document.getElementById("submitBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const hintBtn = document.getElementById("hintBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const difficultySelect = document.getElementById("difficulty");
const leaderboardList = document.getElementById("leaderboardList");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const skillEl = document.getElementById("skill");


// Modal elements
const explanationModal = document.getElementById('explanationModal');
// Check if explanationModal and closeButton exist before adding listeners
const closeButton = explanationModal ? explanationModal.querySelector('.close-button') : null;


// Load leaderboard from local storage
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

function updateLeaderboard() {
  leaderboardList.innerHTML = '';
  leaderboard.sort((a, b) => b.score - a.score); // Sort by score descending
  leaderboard.slice(0, 10).forEach((entry, index) => { // Display top 10
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
    leaderboardList.appendChild(li);
  });
}

function saveScore() {
  console.log("Save Score button clicked. saveScore function called."); // Log when function starts

  // --- Add this line to see the value of timer ---
  console.log("Value of timer:", timer);

  // Check if timer is running (button should be disabled, but good to double-check)
  if (timer) {
    console.log("Timer is running, saving is blocked by 'if (timer)' check."); // Log if timer is unexpectedly running
    return; // Exit the function if the timer is running
  }
  // The button's disabled state now controls when saving is possible

  const playerName = prompt("Enter your name for the leaderboard:");
  console.log("Player name entered:", playerName); // Log the value of playerName
  console.log("Current score:", score); // Log the current score

  if (playerName && score > 0) { // Only save if name entered and score > 0
    console.log("Condition 'playerName && score > 0' is true. Attempting to save."); // Log if save condition is met
    leaderboard.push({ name: playerName, score: score });
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    updateLeaderboard();
    alert("Score saved!");
    console.log("Score should be saved and leaderboard updated."); // Log after saving logic
  } else if (score === 0) {
      console.log("Score is 0, not saving."); // Log if score is 0
      alert("Your score is 0, nothing to save!");
  } else {
      console.log("playerName is empty/null or score is not > 0, not saving."); // Log if condition is not met for other reasons
  }
}

// Fisher-Yates (Knuth) Shuffle Algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

// *** Updated startTimer function with new time limits ***
function startTimer() {
  clearInterval(timer); // Clear any existing timer
  console.log("Timer started."); // Log when timer starts
  let timeLimit;
  // *** Updated time limits based on difficulty ***
  if (difficulty === 'easy') {
    timeLimit = 45; // Set time for Easy difficulty to 45 seconds
  } else if (difficulty === 'medium') {
    timeLimit = 23; // Set time for Medium difficulty to 23 seconds
  } else if (difficulty === 'hard') {
    timeLimit = 12; // Set time for Hard difficulty to 12 seconds
  }
  // *** End of updated section ***

  // Use pausedTimeLeft if available, otherwise use the time limit
  timeLeft = pausedTimeLeft > 0 ? pausedTimeLeft : timeLimit;
  console.log("Initial timeLeft:", timeLeft); // Log initial timeLeft

  timerEl.textContent = timeLeft + 's';
  timerEl.style.color = '#333'; // Reset timer color (or appropriate dark mode color)
  // Adjust color based on dark mode if applicable
  if (document.body.classList.contains('dark-mode')) {
       timerEl.style.color = '#eee'; // Light color for dark mode
  }

  // --- Disable Save Score button when timer starts ---
  if (saveScoreBtn) {
      saveScoreBtn.disabled = true;
  }


  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft + 's';

    if (timeLeft <= 5) {
        timerEl.style.color = 'red'; // Change color when time is low
    } else {
         // Reset color if time goes back up (e.g., timer restarted)
         if (document.body.classList.contains('dark-mode')) {
            timerEl.style.color = '#eee';
         } else {
             timerEl.style.color = '#333';
         }
    }


    if (timeLeft <= 0) {
      clearInterval(timer);
      console.log("Timer reached 0."); // Log when timer reaches 0
      // Automatically submit answer or handle time's up
      alert("Time's up!");
      // Simulate submitting a wrong answer if no answer was selected
      const selected = document.querySelector("input[name='answer']:checked");
      if (!selected) {
          // Find a random incorrect option to mark as selected for feedback
          const correctAnswerIndex = shuffledQuestions[currentQuestionIndex].answer;
          const options = optionsEl.querySelectorAll("label");
          let incorrectIndex = -1;
          // Ensure we find an index that is not the correct answer and is currently displayed/enabled
          const availableIncorrectOptions = [];
          options.forEach((label, index) => {
              if (index !== correctAnswerIndex && label.style.display !== 'none' && !label.querySelector("input").disabled) {
                  availableIncorrectOptions.push(label.querySelector("input"));
              }
          });

          if (availableIncorrectOptions.length > 0) {
             const randomIndex = Math.floor(Math.random() * availableIncorrectOptions.length);
             availableIncorrectOptions[randomIndex].checked = true;
          } else {
              // Handle rare case where only the correct option is available
              console.warn("Could not simulate selecting an incorrect answer.");
          }
      }
      handleSubmit(); // Process the submission (either user selected or simulated)
      // Optionally, move to the next question automatically after a delay
      setTimeout(handleNextQuestion, 2000); // Move to next question after 2 seconds
    }
  }, 1000);
}
// *** End of startTimer update ***

function stopTimer() {
  clearInterval(timer);
  console.log("Timer stopped."); // Log when timer stops
  // --- Add this line to set timer to null ---
  timer = null;
  // --- Enable Save Score button when timer stops ---
  if (saveScoreBtn) {
      saveScoreBtn.disabled = false;
  }
}

// *** Updated resetTimer function to display time limit ***
function resetTimer() {
  stopTimer();
  console.log("Timer reset."); // Log when timer is reset
  // Update timer display based on current difficulty
  let timeLimitDisplay;
  if (difficulty === 'easy') {
    timeLimitDisplay = 45;
  } else if (difficulty === 'medium') {
    timeLimitDisplay = 23;
  } else if (difficulty === 'hard') {
    timeLimitDisplay = 12;
  } else {
    timeLimitDisplay = '--'; // Default fallback
  }
  timerEl.textContent = timeLimitDisplay + 's';
  // End of update

  timerEl.style.color = '#333'; // Reset timer color
  if (document.body.classList.contains('dark-mode')) {
     timerEl.style.color = '#eee';
  }
}
// *** End of resetTimer update ***

function loadQuestion() {
  console.log("Loading question:", currentQuestionIndex); // Log which question is being loaded
  // Use shuffledQuestions array
  if (currentQuestionIndex >= shuffledQuestions.length) {
    // Handle quiz finish
    stopTimer();
    alert("Quiz Finished! Final Score: " + score + "/" + shuffledQuestions.length);
    // Reset for a new game or show final screen
    currentQuestionIndex = 0;
    score = 0;
    hints = 3;
    updateScoreDisplay();
    updateLeaderboard(); // Update leaderboard in case user wants to save score
    // Optionally, display a "Play Again" button and hide quiz elements
    questionEl.textContent = "Quiz Finished!";
    optionsEl.innerHTML = "";
    // explanationBox.style.display = "none"; // Handled by modal close
    viewExplanationBtn.style.display = "none";
    submitBtn.style.display = "none";
    hintBtn.style.display = "none";
    nextBtn.textContent = "Start New Quiz"; // Change next button text
    resetTimer(); // Reset timer display (will show time limit based on difficulty)
    // Hide modal if it's open
    if (explanationModal) {
        explanationModal.style.display = 'none';
    }
    // --- Disable next button at the end of quiz ---
    nextBtn.disabled = true; // Disable next button when quiz is finished
    return; // Stop execution here
  }

  // If not finished, load the next question
  submitBtn.style.display = "block"; // Ensure submit button is visible
  hintBtn.style.display = "block"; // Ensure hint button is visible
  nextBtn.textContent = "Next Question?"; // Reset next button text
  // --- Disable next button when loading a new question ---
  nextBtn.disabled = true;


  const q = shuffledQuestions[currentQuestionIndex]; // Use shuffledQuestions
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";

  q.options.forEach((option, index) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = index;
    label.appendChild(input);
    label.appendChild(document.createTextNode(option)); // Append option text

    optionsEl.appendChild(label);

    // Add event listener to start timer on first question answer selection
    // Reset AFK timer on any option selection
    input.addEventListener('change', () => {
        console.log("Option selected, resetting AFK timer."); // Log option selection
        if (currentQuestionIndex === 0 && !timer) { // Check if timer is not already running on first question
            startTimer();
        }
        resetAFKTimer(); // Reset AFK timer on option selection
    });


    // Re-enable options and remove feedback classes
    input.disabled = false;
    label.style.display = "flex"; // Ensure options are visible
    label.classList.remove("correct", "incorrect");
  });

  viewExplanationBtn.style.display = "none"; // Ensure explanation button is hidden
     if (explanationBox) {
        explanationBox.textContent = shuffledQuestions[currentQuestionIndex].explanation; // Set explanation text in the modal
     }


  // Start timer automatically for questions after the first one
  // The timer for the first question starts on the first option selection
  if (currentQuestionIndex > 0) {
      startTimer();
  } else {
      resetTimer(); // Reset timer display for the first question (shows time limit)
  }

  // Re-enable hint button if hints are available
  if (hints > 0) {
      hintBtn.disabled = false;
  }

  // --- Add this line to reset the AFK timer after loading the question ---
  console.log("loadQuestion finished, resetting AFK timer."); // Log after load
  resetAFKTimer();
}

// --- Definition of updateScoreDisplay (Around line 300) ---
function updateScoreDisplay() {
  scoreEl.textContent = score;
  hintsEl.textContent = hints;

  let skillLevel = "";
  if (score < 300) {
    skillLevel = "Beginner";
  } else if (score >= 300 && score < 600) {
    skillLevel = "Skilled";
  } else if (score >= 600 && score < 900) {
    skillLevel = "Intermediate";
  } else if (score >= 900 && score < 1050) {
    skillLevel = "Advanced";
  } else {
    skillLevel = "Expert"; // For scores 1050 and above
  }
  if (skillEl) {
      skillEl.textContent = skillLevel;
  }
}


function handleSubmit() {
    console.log("Submit button clicked."); // Log submit click
    stopTimer(); // Stop the timer when submitting

    const selected = document.querySelector("input[name='answer']:checked");

    // Check if an answer is selected OR if time ran out (timeLeft <= 0 handled by startTimer's interval)
    if (!selected && timeLeft > 0) {
         alert("Select an answer first!");
         // Restart timer only if it was running and stopped due to this submit attempt
         if (timerEl.textContent.endsWith('s') && !isNaN(parseInt(timerEl.textContent))) {
            startTimer();
         }
         return;
    }


    const answerIndex = selected ? parseInt(selected.value) : -1;
    const correctAnswerIndex = shuffledQuestions[currentQuestionIndex].answer;
    const options = optionsEl.querySelectorAll("label");

    options.forEach(label => {
      label.querySelector("input").disabled = true;
    });

    if (answerIndex === correctAnswerIndex) {
      if (selected) options[answerIndex].classList.add("correct");
      score += 150;
      console.log("Correct answer submitted. Score:", score); // Log correct answer
    } else {
      if (selected) options[answerIndex].classList.add("incorrect");
      // Always show the correct answer
      options[correctAnswerIndex].classList.add("correct");
      console.log("Incorrect answer submitted. Score:", score); // Log incorrect answer
    }

    updateScoreDisplay(); // This function should be defined now
    viewExplanationBtn.style.display = "block";
     if (explanationBox) {
        explanationBox.textContent = shuffledQuestions[currentQuestionIndex].explanation;
     }


    submitBtn.disabled = true;
    hintBtn.disabled = true;
    // --- Enable next button after submission ---
    nextBtn.disabled = false;
}

function handleNextQuestion() {
  console.log("Next Question button clicked."); // Log next question click
  // Before moving to the next question, ensure timer is stopped
  stopTimer();
  currentQuestionIndex++;

  if (currentQuestionIndex < shuffledQuestions.length) {
     submitBtn.disabled = false; // Re-enable submit button for the next question
     loadQuestion(); // loadQuestion will now re-enable the hint button if hints > 0 and reset timer display
     updateScoreDisplay(); // This function should be defined now
  } else {
      // Handle quiz finish logic if next is pressed at the end
      loadQuestion(); // This call will trigger the quiz finished logic
  }
}

// submitBtn.addEventListener("click", handleSubmit); // Removed duplicate listener in DOMContentLoaded

// Add event listeners for explanation modal only if elements exist
if (viewExplanationBtn && explanationModal && closeButton) {
    viewExplanationBtn.addEventListener("click", () => {
      console.log("View Explanation button clicked, showing modal."); // Log explanation modal open
      explanationModal.style.display = 'flex'; // Show the modal overlay
      resetAFKTimer(); // Reset AFK timer when explanation modal is opened
    });

    // Close modal when clicking the close button
    closeButton.addEventListener('click', () => {
        console.log("Explanation modal close button clicked."); // Log explanation modal close
        explanationModal.style.display = 'none'; // Hide the modal overlay
        resetAFKTimer(); // Reset AFK timer on closing modal
    });

    // Close modal when clicking outside the modal content
    explanationModal.addEventListener('click', (event) => {
        if (event.target === explanationModal) {
            console.log("Clicked outside explanation modal."); // Log click outside explanation modal
            explanationModal.style.display = 'none'; // Hide the modal overlay
             resetAFKTimer(); // Reset AFK timer on clicking outside modal
        }
    });
}


// nextBtn.addEventListener("click", handleNextQuestion); // Removed duplicate listener in DOMContentLoaded


// restartBtn.addEventListener("click", () => { // Modified listener in DOMContentLoaded
//   showConfirmationModal(
//     "Restart Quiz?",
//     "Are you sure you want to restart the quiz? Your current score will be lost.",
//     () => { // onConfirm function
//       stopTimer(); // Stop timer on restart
//       currentQuestionIndex = 0;
//       score = 0;
//       hints = 3; // Reset hints on restart
//       updateScoreDisplay(); // This function should be defined now
//       // Shuffle questions again on restart
//       shuffledQuestions = shuffleArray([...questions]); // Create a shallow copy before shuffling
//       loadQuestion(); // Load the first question - This will now re-enable the hint button and reset timer display
//       submitBtn.disabled = false; // Re-enable submit button
//       // --- Add resetAFKTimer here ---
//       resetAFKTimer();
//     }
//   );
//    resetAFKTimer();
// });


// hintBtn.addEventListener("click", () => { // Modified listener in DOMContentLoaded
//   if (hints > 0 && !submitBtn.disabled) {
//     showConfirmationModal(
//       "Use a Hint?",
//       "Do you want to use a hint? You have " + hints + " hints left. This will remove two incorrect options.",
//       () => { // onConfirm function
//         const currentQuestion = shuffledQuestions[currentQuestionIndex]; // Use shuffledQuestions
//         const correctAnswerIndex = currentQuestion.answer;
//         const options = optionsEl.querySelectorAll("label");
//         const incorrectOptions = [];

//         options.forEach((label, index) => {
//           if (index !== correctAnswerIndex) {
//             // Only include options that are currently displayed and not disabled
//             if (label.style.display !== 'none' && !label.querySelector("input").disabled) {
//                  incorrectOptions.push(label);
//             }
//           }
//         });

//         // Randomly select two incorrect options to hide
//         const optionsToHide = [];
//         // Ensure we don't try to hide more options than available incorrect ones
//         const numToHide = Math.min(2, incorrectOptions.length);
//         while (optionsToHide.length < numToHide && incorrectOptions.length > 0) {
//           const randomIndex = Math.floor(Math.random() * incorrectOptions.length);
//           optionsToHide.push(incorrectOptions.splice(randomIndex, 1)[0]);
//         }

//         // Hide the selected incorrect options and disable their radio buttons
//         optionsToHide.forEach(label => {
//           label.style.display = "none";
//            label.querySelector("input").disabled = true;
//         });

//         hints--;
//         updateScoreDisplay(); // This function should be defined now
//         hintBtn.disabled = true; // Disable hint button after use for the current question
//       }
//     );
//     resetAFKTimer(); // Reset AFK timer when hint confirmation is initiated
//   } else if (hints === 0){
//     alert("No hints left!"); // Keep alert for no hints left
//     hintBtn.disabled = true; // Ensure button is disabled if hints reach 0
//   }
// });

// darkModeToggle.addEventListener('change', () => { // Modified listener in DOMContentLoaded
//   document.body.classList.toggle('dark-mode');
//   // Optionally save dark mode preference to local storage
//   if (document.body.classList.contains('dark-mode')) {
//     localStorage.setItem('darkMode', 'enabled');
//   } else {
//     localStorage.setItem('darkMode', 'disabled');
//   }
//   // Update timer color immediately on dark mode toggle
//    // Call resetTimer to update color AND potentially the text if it was '--s' (though unlikely now)
//    resetTimer();
//    // If the timer is actively running (timeLeft has a value), restore red if needed
//    if (timer && timeLeft <= 5) {
//         timerEl.style.color = 'red';
//    }

//    resetAFKTimer(); // Reset AFK timer on dark mode toggle
// });

// // Check for dark mode preference on page load
// if (localStorage.getItem('darkMode') === 'enabled') {
//   document.body.classList.add('dark-mode');
//   darkModeToggle.checked = true;
// }

// // *** Updated difficultySelect event listener *** // Modified listener in DOMContentLoaded
// difficultySelect.addEventListener('change', (event) => {
//   const newDifficulty = event.target.value; // Get the new value first

//   // Show confirmation before restarting on difficulty change
//     showConfirmationModal(
//         "Change Difficulty?",
//         "Changing the difficulty will restart the quiz. Are you sure?",
//         () => { // onConfirm function
//             // Proceed with difficulty change and restart
//             difficulty = newDifficulty; // Apply the new difficulty *after* confirmation
//             localStorage.setItem('difficulty', difficulty); // Save confirmed difficulty

//             stopTimer(); // Stop timer on restart
//             currentQuestionIndex = 0;
//             score = 0;
//             hints = 3; // Reset hints on restart
//             updateScoreDisplay(); // This function should be defined now
//             shuffledQuestions = shuffleArray([...questions]); // Create a shallow copy
//             loadQuestion(); // This will call the updated resetTimer
//             submitBtn.disabled = false;
//             // No need for explicit resetTimer call here, loadQuestion handles it
//         },
//         () => { // onCancel function
//             difficultySelect.value = difficulty; // Revert dropdown to the old difficulty
//         }
//     );
//   resetAFKTimer(); // Reset AFK timer on difficulty change initiation
// });
// // *** End of difficultySelect update ***

// // Check for difficulty preference on page load
// if (localStorage.getItem('difficulty')) {
//     difficulty = localStorage.getItem('difficulty');
//     difficultySelect.value = difficulty; // Set the select element value
// }


// // Event listener for Save Score button // Modified listener in DOMContentLoaded
// if (saveScoreBtn) { // Check if the element exists
//   saveScoreBtn.addEventListener('click', () => { saveScore(); resetAFKTimer(); });
// }


let afkTimer;
let afkTimeout = 150000; // 10 seconds of inactivity
let afkPromptTimer;
let afkPromptTimeout = 15000; // 15 seconds after prompt to do something else (optional)
let isAFKPromptVisible = false;

// --- Modify the goAFK function to pause the timer ---
function goAFK() {
    console.log("AFK timeout reached, triggering goAFK."); // Log goAFK trigger
    // Only show the prompt if the quiz hasn't finished and prompt is not already visible
    // Also check if the explanation modal is not visible, as that is also user interaction
    if (currentQuestionIndex < shuffledQuestions.length && !isAFKPromptVisible && (!explanationModal || explanationModal.style.display === 'none')) {
        console.log("Conditions met to pause quiz for AFK."); // Log conditions met
        // --- Pause the main quiz timer ---
        stopTimer();
        pausedTimeLeft = timeLeft; // Store the remaining time
        console.log("Main timer paused. Remaining time:", pausedTimeLeft); // Log paused time

        // --- Show the AFK pause prompt ---
        showAFKPromptModal(); // Use the new function to show the modal without buttons
    } else {
        console.log("Conditions not met to pause quiz for AFK."); // Log conditions not met
    }
}

// --- Modify the showAFKPromptModal function ---
function showAFKPromptModal() {
    console.log("Showing AFK prompt modal."); // Log showing modal
    const modal = document.getElementById('confirmationModal');
    const modalTitle = document.getElementById('confirmationModalTitle');
    const modalMessage = document.getElementById('confirmationModalMessage');
    const modalButtons = modal ? modal.querySelector('.modal-buttons') : null;

    if (modal && modalTitle && modalMessage) {
        // --- Update the title and message to indicate pause ---
        modalTitle.textContent = "Quiz Paused Due to Inactivity";
        modalMessage.textContent = "Are you still there? Move your mouse or press a key to resume.";
        modal.style.display = 'flex';
        isAFKPromptVisible = true;

        // Hide the Yes/No buttons container
        if (modalButtons) {
            modalButtons.style.display = 'none';
        }

         // Clear any existing prompt timer before starting a new one
        clearTimeout(afkPromptTimer);
        // Start the prompt timer (optional: for very long inactivity after pause)
        // afkPromptTimer = setTimeout(handleExtendedInactivity, afkPromptTimeout);
    }
}

// --- Modify the hideAFKPrompt function ---
function hideAFKPrompt() {
    console.log("Hiding AFK prompt modal."); // Log hiding modal
    const modal = document.getElementById('confirmationModal');
    const modalButtons = modal ? modal.querySelector('.modal-buttons') : null;

    if (modal) {
        modal.style.display = 'none';
         // Show the Yes/No buttons container again for other uses of the modal
        if (modalButtons) {
             modalButtons.style.display = 'flex'; // Assuming default is flex based on CSS
        }
    }
    isAFKPromptVisible = false;
    clearTimeout(afkPromptTimer);
}


// --- Modify the resetAFKTimer function to resume the quiz ---
function resetAFKTimer() {
    console.log("resetAFKTimer called."); // Log reset call
    clearTimeout(afkTimer);
    console.log("Previous afkTimer cleared."); // Log clearing previous timer
    afkTimer = setTimeout(goAFK, afkTimeout);
    console.log("New afkTimer set for", afkTimeout, "ms."); // Log setting new timer

    // --- If the AFK prompt was visible, hide it and resume the timer ---
    if (isAFKPromptVisible) {
        console.log("AFK prompt was visible, attempting to resume quiz."); // Log resuming quiz
        hideAFKPrompt();
        // --- Resume the main quiz timer from where it was paused ---
        if (pausedTimeLeft > 0) {
             timeLeft = pausedTimeLeft; // Restore the time
             console.log("Resuming timer from pausedTimeLeft:", timeLeft); // Log resuming from paused time
             startTimer(); // Restart the timer
             pausedTimeLeft = 0; // Reset paused time
        } else {
             // If pausedTimeLeft is 0 or less, it means time was already up or an issue occurred, just start a new timer
             console.log("pausedTimeLeft is 0 or less, starting new timer."); // Log starting new timer
             // This case might need more robust handling depending on desired behavior if time runs out while AFK
             startTimer(); // Simply restart the timer for the current question
        }
    }
}

// --- Remove or modify the resetQuizDueToAFK function (now handles extended inactivity if needed) ---
// Since we are now pausing instead of resetting, this function might be unnecessary or could handle very long inactivity.
// For now, let's make it just hide the prompt and maybe log something.
function resetQuizDueToAFK() {
    console.log("resetQuizDueToAFK called (extended inactivity)."); // Log extended inactivity
    hideAFKPrompt(); // Ensure modal is hidden and prompt timer is cleared
    console.log("Extended inactivity detected, but quiz was paused instead of reset.");
    // You could add other actions here for very long inactivity if needed.
    // alert("Quiz paused due to extended inactivity. Click OK to resume."); // Optional alert
    // The timer is already stopped by goAFK, so it remains paused until a resetAFKTimer is called by user activity.
}


// --- Event Listeners for AFK Timer Reset ---
// Add AFK reset to option selection within loadQuestion
// (This is handled within the loadQuestion function where options are created)

// Add listeners to specific interactive elements:
// submitBtn.addEventListener("click", resetAFKTimer); // Handled in DOMContentLoaded
// nextBtn.addEventListener("click", resetAFKTimer); // Handled in DOMContentLoaded
// restartBtn.addEventListener("click", resetAFKTimer); // Handled in DOMContentLoaded
// hintBtn.addEventListener("click", resetAFKTimer); // Handled in DOMContentLoaded
// darkModeToggle.addEventListener('change', resetAFKTimer); // Handled in DOMContentLoaded
// difficultySelect.addEventListener('change', resetAFKTimer); // Handled in DOMContentLoaded
// if (saveScoreBtn) { // Check if the element exists // Handled in DOMContentLoaded
//   saveScoreBtn.addEventListener('click', () => { saveScore(); resetAFKTimer(); });
// }


// Add AFK reset listeners to the explanation modal and confirmation modal overlay/close buttons
if (explanationModal) {
    // Listener for clicks on the overlay
    explanationModal.addEventListener('click', (event) => {
        if (event.target === explanationModal) {
            console.log("Explanation modal overlay clicked."); // Log click
            resetAFKTimer();
        }
    });
     // Listener for the close button
     if (closeButton) {
         closeButton.addEventListener('click', () => {
             console.log("Explanation modal close button clicked."); // Log click
             resetAFKTimer();
         });
     }
}

if (confirmationModal) {
     // Listener for clicks on the confirmation modal overlay (useful for AFK prompt)
    confirmationModal.addEventListener('click', (event) => {
        if (event.target === confirmationModal) {
             console.log("Confirmation modal overlay clicked (potentially to resume from AFK)."); // Log click
             resetAFKTimer(); // Clicking the overlay to dismiss AFK prompt should resume
        }
    });
    // Listeners for confirmation modal buttons are handled within showConfirmationModal
}

let DOMContentLoaded_executed = false;

document.addEventListener('DOMContentLoaded', () => {
  if (DOMContentLoaded_executed) {
      // This message should ideally not appear after the first page load/hard refresh
      console.log("DOMContentLoaded already executed, skipping setup.");
      return;
  }
  DOMContentLoaded_executed = true;
  console.log("DOMContentLoaded executed for the first time. Setting up quiz."); // Log for verification


  // --- Initial Setup ---
  if (localStorage.getItem('difficulty')) {
      difficulty = localStorage.getItem('difficulty');
      difficultySelect.value = difficulty;
  }
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
  }

  shuffledQuestions = shuffleArray([...questions]);
  loadQuestion();
  updateLeaderboard();
  updateScoreDisplay();

  // --- Start the initial AFK timer ---
  console.log("Initial resetAFKTimer call on DOMContentLoaded."); // Log initial call
  resetAFKTimer();

  // --- Add primary event listeners here, guarded by the flag ---
  // Ensure these listeners are NOT added elsewhere in your script or HTML
  if (submitBtn) {
      submitBtn.addEventListener("click", handleSubmit);
      submitBtn.addEventListener("click", resetAFKTimer); // Add AFK reset
  }
  if (nextBtn) {
      nextBtn.addEventListener("click", handleNextQuestion);
      nextBtn.addEventListener("click", resetAFKTimer); // Add AFK reset
  }
   if (restartBtn) {
       restartBtn.addEventListener("click", () => {
            console.log("Restart button clicked, showing confirmation."); // Log restart click
            showConfirmationModal(
                "Restart Quiz?",
                "Are you sure you want to restart the quiz? Your current score will be lost.",
                () => { // onConfirm function
                    console.log("Restart confirmed."); // Log restart confirmation
                    stopTimer();
                    currentQuestionIndex = 0;
                    score = 0;
                    hints = 3;
                    updateScoreDisplay();
                    shuffledQuestions = shuffleArray([...questions]);
                    loadQuestion();
                    submitBtn.disabled = false;
                    resetAFKTimer(); // Reset AFK timer after confirmed restart
                }
                // No onCancel needed here, showConfirmationModal handles hiding the modal and resetting AFK on cancel/close
            );
             resetAFKTimer(); // Reset AFK timer when restart is initiated
        });
   }
    if (hintBtn) {
       hintBtn.addEventListener("click", () => {
           console.log("Hint button clicked."); // Log hint click
           if (hints > 0 && !submitBtn.disabled) {
               showConfirmationModal(
                   "Use a Hint?",
                   "Do you want to use a hint? You have " + hints + " hints left. This will remove two incorrect options.",
                   () => { // onConfirm function
                       console.log("Hint use confirmed."); // Log hint confirmation
                       const currentQuestion = shuffledQuestions[currentQuestionIndex];
                       const correctAnswerIndex = currentQuestion.answer;
                       const options = optionsEl.querySelectorAll("label");
                       const incorrectOptions = [];

                       options.forEach((label, index) => {
                           if (index !== correctAnswerIndex) {
                               if (label.style.display !== 'none' && !label.querySelector("input").disabled) {
                                   incorrectOptions.push(label);
                               }
                           }
                       });

                       const optionsToHide = [];
                       const numToHide = Math.min(2, incorrectOptions.length);
                       while (optionsToHide.length < numToHide && incorrectOptions.length > 0) {
                           const randomIndex = Math.floor(Math.random() * incorrectOptions.length);
                           optionsToHide.push(incorrectOptions.splice(randomIndex, 1)[0]);
                       }

                       optionsToHide.forEach(label => {
                           label.style.display = "none";
                           label.querySelector("input").disabled = true;
                       });

                       hints--;
                       updateScoreDisplay();
                       hintBtn.disabled = true;
                       resetAFKTimer(); // Reset AFK timer after hint confirmation
                   }
                    // No onCancel needed here
               );
               resetAFKTimer(); // Reset AFK timer when hint confirmation is initiated
           } else if (hints === 0){
               alert("No hints left!");
               hintBtn.disabled = true;
           }
       });
    }
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            console.log("Dark mode toggle changed."); // Log dark mode toggle
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.setItem('darkMode', 'disabled');
            }
            resetTimer();
            if (timer && timeLeft <= 5) {
                 timerEl.style.color = 'red';
            }
            resetAFKTimer(); // Reset AFK timer on dark mode toggle
        });
    }
    if (difficultySelect) {
        difficultySelect.addEventListener('change', (event) => {
            const newDifficulty = event.target.value;
            console.log("Difficulty select changed to:", newDifficulty); // Log difficulty change
            showConfirmationModal(
                "Change Difficulty?",
                "Changing the difficulty will restart the quiz. Are you sure?",
                () => { // onConfirm function
                    console.log("Difficulty change confirmed."); // Log difficulty confirmation
                    difficulty = newDifficulty;
                    localStorage.setItem('difficulty', difficulty);
                    stopTimer();
                    currentQuestionIndex = 0;
                    score = 0;
                    hints = 3;
                    updateScoreDisplay();
                    shuffledQuestions = shuffleArray([...questions]);
                    loadQuestion();
                    submitBtn.disabled = false;
                    resetAFKTimer(); // Reset AFK timer after confirmed difficulty change
                },
                () => { // onCancel function
                    console.log("Difficulty change cancelled."); // Log difficulty cancellation
                    difficultySelect.value = difficulty; // Revert dropdown to the old difficulty
                    resetAFKTimer(); // Reset AFK timer on cancellation
                }
            );
            resetAFKTimer(); // Reset AFK timer on difficulty change initiation
        });
    }

    if (saveScoreBtn) {
      // This listener should now be added only once within this block
      saveScoreBtn.addEventListener('click', () => { saveScore(); resetAFKTimer(); });
      saveScoreBtn.disabled = false; // Ensure it's enabled on load
    }


   // Add listeners for mouse movement and key presses to reset AFK timer
   document.addEventListener('mousemove', () => {
       console.log("Mouse moved, resetting AFK timer."); // Log mouse move
       resetAFKTimer();
    });
   document.addEventListener('keypress', () => {
       console.log("Key pressed, resetting AFK timer."); // Log key press
       resetAFKTimer();
    });


    // Add AFK reset listeners to the explanation modal and confirmation modal overlay/close buttons
   if (explanationModal) {
       explanationModal.addEventListener('click', (event) => {
           if (event.target === explanationModal) {
               console.log("Explanation modal overlay clicked."); // Log click
               resetAFKTimer();
           }
       });
       if (closeButton) {
           closeButton.addEventListener('click', () => {
              console.log("Explanation modal close button clicked."); // Log click
              resetAFKTimer();
           });
       }
   }

    if (confirmationModal) {
         // Listener for clicks on the confirmation modal overlay (useful for AFK prompt)
        confirmationModal.addEventListener('click', (event) => {
            if (event.target === confirmationModal) {
                 console.log("Confirmation modal overlay clicked (potentially to resume from AFK)."); // Log click
                 resetAFKTimer(); // Clicking the overlay to dismiss AFK prompt should resume
            }
        });
        // Listeners for confirmation modal buttons are handled within showConfirmationModal
    }


});

// Add a helper function to hide explanation modal for consistency
function hideExplanationModal() {
    if (explanationModal) {
        explanationModal.style.display = 'none';
    }
}