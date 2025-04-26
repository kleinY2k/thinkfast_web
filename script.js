const confirmationModal = document.getElementById('confirmationModal');
const confirmationModalTitle = document.getElementById('confirmationModalTitle');
const confirmationModalMessage = document.getElementById('confirmationModalMessage');
const confirmModalBtn = document.getElementById('confirmModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const confirmationCloseButton = document.querySelector('.confirmation-close');

let currentConfirmListener = null;
let currentCancelListener = null;
let currentCloseListener = null;
let currentOverlayClickListener = null;

function showConfirmationModal(title, message, onConfirm, onCancel = () => {}) {
    confirmationModalTitle.textContent = title;
    confirmationModalMessage.textContent = message;
    confirmationModal.style.display = 'flex';

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

    currentConfirmListener = () => {
        onConfirm();
        confirmationModal.style.display = 'none';
         resetAFKTimer();
    };

    currentCancelListener = () => {
        onCancel();
        confirmationModal.style.display = 'none';
         resetAFKTimer();
    };

    currentCloseListener = () => {
        onCancel();
        confirmationModal.style.display = 'none';
         resetAFKTimer();
    };

     currentOverlayClickListener = (event) => {
        if (event.target === confirmationModal) {
            onCancel();
            confirmationModal.style.display = 'none';
             resetAFKTimer();
        }
    };

    confirmModalBtn.addEventListener('click', currentConfirmListener);
    cancelModalBtn.addEventListener('click', currentCancelListener);
    confirmationCloseButton.addEventListener('click', currentCloseListener);
    confirmationModal.addEventListener('click', currentOverlayClickListener);

    const modalButtons = confirmationModal ? confirmationModal.querySelector('.modal-buttons') : null;
     if (modalButtons) {
         modalButtons.style.display = 'flex';
     }
}
const questions = [
  {
    question: "What is 9 + 10?",
    options: ["17", "19", "21", "22"],
    answer: 1,
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
let difficulty = 'medium';
let shuffledQuestions = [];

let pausedTimeLeft = 0;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const scoreEl = document.getElementById("score");
const hintsEl = document.getElementById("hints");
const timerEl = document.getElementById("timer");
const explanationBox = document.getElementById("explanationBox");
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


const explanationModal = document.getElementById('explanationModal');
const closeButton = explanationModal ? explanationModal.querySelector('.close-button') : null;


let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

function updateLeaderboard() {
  leaderboardList.innerHTML = '';
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard.slice(0, 10).forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
    leaderboardList.appendChild(li);
  });
}

function saveScore() {
  console.log("Save Score button clicked. saveScore function called.");
  console.log("Value of timer:", timer);

  if (timer) {
    console.log("Timer is running, saving is blocked by 'if (timer)' check.");
    return;
  }

  const playerName = prompt("Enter your name for the leaderboard:");
  console.log("Player name entered:", playerName);
  console.log("Current score:", score);

  if (playerName && score > 0) {
    console.log("Condition 'playerName && score > 0' is true. Attempting to save.");
    leaderboard.push({ name: playerName, score: score });
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    updateLeaderboard();
    alert("Score saved!");
    console.log("Score should be saved and leaderboard updated.");
  } else if (score === 0) {
      console.log("Score is 0, not saving.");
      alert("Your score is 0, nothing to save!");
  } else {
      console.log("playerName is empty/null or score is not > 0, not saving.");
  }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startTimer() {
  clearInterval(timer);
  console.log("Timer started.");
  let timeLimit;
  if (difficulty === 'easy') {
    timeLimit = 45;
  } else if (difficulty === 'medium') {
    timeLimit = 23;
  } else if (difficulty === 'hard') {
    timeLimit = 12;
  }

  timeLeft = pausedTimeLeft > 0 ? pausedTimeLeft : timeLimit;
  console.log("Initial timeLeft:", timeLeft);

  timerEl.textContent = timeLeft + 's';
  timerEl.style.color = '#333';
  if (document.body.classList.contains('dark-mode')) {
       timerEl.style.color = '#eee';
  }

  if (saveScoreBtn) {
      saveScoreBtn.disabled = true;
  }


  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft + 's';

    if (timeLeft <= 5) {
        timerEl.style.color = 'red';
    } else {
         if (document.body.classList.contains('dark-mode')) {
            timerEl.style.color = '#eee';
         } else {
             timerEl.style.color = '#333';
         }
    }


    if (timeLeft <= 0) {
      clearInterval(timer);
      console.log("Timer reached 0.");
      alert("Time's up!");
      const selected = document.querySelector("input[name='answer']:checked");
      if (!selected) {
          const correctAnswerIndex = shuffledQuestions[currentQuestionIndex].answer;
          const options = optionsEl.querySelectorAll("label");
          let incorrectIndex = -1;
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
              console.warn("Could not simulate selecting an incorrect answer.");
          }
      }
      handleSubmit();
      setTimeout(handleNextQuestion, 2000);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  console.log("Timer stopped.");
  timer = null;
  if (saveScoreBtn) {
      saveScoreBtn.disabled = false;
  }
}

function resetTimer() {
  stopTimer();
  console.log("Timer reset.");
  let timeLimitDisplay;
  if (difficulty === 'easy') {
    timeLimitDisplay = 45;
  } else if (difficulty === 'medium') {
    timeLimitDisplay = 23;
  } else if (difficulty === 'hard') {
    timeLimitDisplay = 12;
  } else {
    timeLimitDisplay = '--';
  }
  timerEl.textContent = timeLimitDisplay + 's';

  timerEl.style.color = '#333';
  if (document.body.classList.contains('dark-mode')) {
     timerEl.style.color = '#eee';
  }
}

function loadQuestion() {
  console.log("Loading question:", currentQuestionIndex);
  if (currentQuestionIndex >= shuffledQuestions.length) {
    stopTimer();
    alert("Quiz Finished! Final Score: " + score + "/" + shuffledQuestions.length);
    currentQuestionIndex = 0;
    score = 0;
    hints = 3;
    updateScoreDisplay();
    updateLeaderboard();
    questionEl.textContent = "Quiz Finished!";
    optionsEl.innerHTML = "";
    viewExplanationBtn.style.display = "none";
    submitBtn.style.display = "none";
    hintBtn.style.display = "none";
    nextBtn.textContent = "Start New Quiz";
    resetTimer();
    if (explanationModal) {
        explanationModal.style.display = 'none';
    }
    nextBtn.disabled = true;
    return;
  }

  submitBtn.style.display = "block";
  hintBtn.style.display = "block";
  nextBtn.textContent = "Next Question?";
  nextBtn.disabled = true;


  const q = shuffledQuestions[currentQuestionIndex];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";

  q.options.forEach((option, index) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = index;
    label.appendChild(input);
    label.appendChild(document.createTextNode(option));

    optionsEl.appendChild(label);

    input.addEventListener('change', () => {
        console.log("Option selected, resetting AFK timer.");
        if (currentQuestionIndex === 0 && !timer) {
            startTimer();
        }
        resetAFKTimer();
    });


    input.disabled = false;
    label.style.display = "flex";
    label.classList.remove("correct", "incorrect");
  });

  viewExplanationBtn.style.display = "none";
     if (explanationBox) {
        explanationBox.textContent = shuffledQuestions[currentQuestionIndex].explanation;
     }


  if (currentQuestionIndex > 0) {
      startTimer();
  } else {
      resetTimer();
  }

  if (hints > 0) {
      hintBtn.disabled = false;
  }

  console.log("loadQuestion finished, resetting AFK timer.");
  resetAFKTimer();
}

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
    skillLevel = "Expert";
  }
  if (skillEl) {
      skillEl.textContent = skillLevel;
  }
}


function handleSubmit() {
    console.log("Submit button clicked.");
    stopTimer();

    const selected = document.querySelector("input[name='answer']:checked");

    if (!selected && timeLeft > 0) {
         alert("Select an answer first!");
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
      console.log("Correct answer submitted. Score:", score);
    } else {
      if (selected) options[answerIndex].classList.add("incorrect");
      options[correctAnswerIndex].classList.add("correct");
      console.log("Incorrect answer submitted. Score:", score);
    }

    updateScoreDisplay();
    viewExplanationBtn.style.display = "block";
     if (explanationBox) {
        explanationBox.textContent = shuffledQuestions[currentQuestionIndex].explanation;
     }


    submitBtn.disabled = true;
    hintBtn.disabled = true;
    nextBtn.disabled = false;
}

function handleNextQuestion() {
  console.log("Next Question button clicked.");
  stopTimer();
  currentQuestionIndex++;

  if (currentQuestionIndex < shuffledQuestions.length) {
     submitBtn.disabled = false;
     loadQuestion();
     updateScoreDisplay();
  } else {
      loadQuestion();
  }
}

if (viewExplanationBtn && explanationModal && closeButton) {
    viewExplanationBtn.addEventListener("click", () => {
      console.log("View Explanation button clicked, showing modal.");
      explanationModal.style.display = 'flex';
      resetAFKTimer();
    });

    closeButton.addEventListener('click', () => {
        console.log("Explanation modal close button clicked.");
        explanationModal.style.display = 'none';
        resetAFKTimer();
    });

    explanationModal.addEventListener('click', (event) => {
        if (event.target === explanationModal) {
            console.log("Clicked outside explanation modal.");
            explanationModal.style.display = 'none';
             resetAFKTimer();
        }
    });
}


let afkTimer;
let afkTimeout = 150000;
let afkPromptTimer;
let afkPromptTimeout = 15000;
let isAFKPromptVisible = false;

function goAFK() {
    console.log("AFK timeout reached, triggering goAFK.");
    if (currentQuestionIndex < shuffledQuestions.length && !isAFKPromptVisible && (!explanationModal || explanationModal.style.display === 'none')) {
        console.log("Conditions met to pause quiz for AFK.");
        stopTimer();
        pausedTimeLeft = timeLeft;
        console.log("Main timer paused. Remaining time:", pausedTimeLeft);

        showAFKPromptModal();
    } else {
        console.log("Conditions not met to pause quiz for AFK.");
    }
}

function showAFKPromptModal() {
    console.log("Showing AFK prompt modal.");
    const modal = document.getElementById('confirmationModal');
    const modalTitle = document.getElementById('confirmationModalTitle');
    const modalMessage = document.getElementById('confirmationModalMessage');
    const modalButtons = modal ? modal.querySelector('.modal-buttons') : null;

    if (modal && modalTitle && modalMessage) {
        modalTitle.textContent = "Quiz Paused Due to Inactivity";
        modalMessage.textContent = "Are you still there? Move your mouse or press a key to resume.";
        modal.style.display = 'flex';
        isAFKPromptVisible = true;

        if (modalButtons) {
            modalButtons.style.display = 'none';
        }

        clearTimeout(afkPromptTimer);
    }
}

function hideAFKPrompt() {
    console.log("Hiding AFK prompt modal.");
    const modal = document.getElementById('confirmationModal');
    const modalButtons = modal ? modal.querySelector('.modal-buttons') : null;

    if (modal) {
        modal.style.display = 'none';
        if (modalButtons) {
             modalButtons.style.display = 'flex';
        }
    }
    isAFKPromptVisible = false;
    clearTimeout(afkPromptTimer);
}


function resetAFKTimer() {
    console.log("resetAFKTimer called.");
    clearTimeout(afkTimer);
    console.log("Previous afkTimer cleared.");
    afkTimer = setTimeout(goAFK, afkTimeout);
    console.log("New afkTimer set for", afkTimeout, "ms.");

    if (isAFKPromptVisible) {
        console.log("AFK prompt was visible, attempting to resume quiz.");
        hideAFKPrompt();
        if (pausedTimeLeft > 0) {
             timeLeft = pausedTimeLeft;
             console.log("Resuming timer from pausedTimeLeft:", timeLeft);
             startTimer();
             pausedTimeLeft = 0;
        } else {
             console.log("pausedTimeLeft is 0 or less, starting new timer.");
             startTimer();
        }
    }
}

function resetQuizDueToAFK() {
    console.log("resetQuizDueToAFK called (extended inactivity).");
    hideAFKPrompt();
    console.log("Extended inactivity detected, but quiz was paused instead of reset.");
}


if (explanationModal) {
    explanationModal.addEventListener('click', (event) => {
        if (event.target === explanationModal) {
            console.log("Explanation modal overlay clicked.");
            resetAFKTimer();
        }
    });
     if (closeButton) {
         closeButton.addEventListener('click', () => {
             console.log("Explanation modal close button clicked.");
             resetAFKTimer();
         });
     }
}

if (confirmationModal) {
    confirmationModal.addEventListener('click', (event) => {
        if (event.target === confirmationModal) {
             console.log("Confirmation modal overlay clicked (potentially to resume from AFK).");
             resetAFKTimer();
        }
    });
}

let DOMContentLoaded_executed = false;

document.addEventListener('DOMContentLoaded', () => {
  if (DOMContentLoaded_executed) {
      console.log("DOMContentLoaded already executed, skipping setup.");
      return;
  }
  DOMContentLoaded_executed = true;
  console.log("DOMContentLoaded executed for the first time. Setting up quiz.");


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

  console.log("Initial resetAFKTimer call on DOMContentLoaded.");
  resetAFKTimer();

  if (submitBtn) {
      submitBtn.addEventListener("click", handleSubmit);
      submitBtn.addEventListener("click", resetAFKTimer);
  }
  if (nextBtn) {
      nextBtn.addEventListener("click", handleNextQuestion);
      nextBtn.addEventListener("click", resetAFKTimer);
  }
   if (restartBtn) {
       restartBtn.addEventListener("click", () => {
            console.log("Restart button clicked, showing confirmation.");
            showConfirmationModal(
                "Restart Quiz?",
                "Are you sure you want to restart the quiz? Your current score will be lost.",
                () => {
                    console.log("Restart confirmed.");
                    stopTimer();
                    currentQuestionIndex = 0;
                    score = 0;
                    hints = 3;
                    updateScoreDisplay();
                    shuffledQuestions = shuffleArray([...questions]);
                    loadQuestion();
                    submitBtn.disabled = false;
                    resetAFKTimer();
                }
            );
             resetAFKTimer();
        });
   }
    if (hintBtn) {
       hintBtn.addEventListener("click", () => {
           console.log("Hint button clicked.");
           if (hints > 0 && !submitBtn.disabled) {
               showConfirmationModal(
                   "Use a Hint?",
                   "Do you want to use a hint? You have " + hints + " hints left. This will remove two incorrect options.",
                   () => {
                       console.log("Hint use confirmed.");
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
                       resetAFKTimer();
                   }
               );
               resetAFKTimer();
           } else if (hints === 0){
               alert("No hints left!");
               hintBtn.disabled = true;
           }
       });
    }
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            console.log("Dark mode toggle changed.");
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
            resetAFKTimer();
        });
    }
    if (difficultySelect) {
        difficultySelect.addEventListener('change', (event) => {
            const newDifficulty = event.target.value;
            console.log("Difficulty select changed to:", newDifficulty);
            showConfirmationModal(
                "Change Difficulty?",
                "Changing the difficulty will restart the quiz. Are you sure?",
                () => {
                    console.log("Difficulty change confirmed.");
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
                    resetAFKTimer();
                },
                () => {
                    console.log("Difficulty change cancelled.");
                    difficultySelect.value = difficulty;
                    resetAFKTimer();
                }
            );
            resetAFKTimer();
        });
    }

    if (saveScoreBtn) {
      saveScoreBtn.addEventListener('click', () => { saveScore(); resetAFKTimer(); });
      saveScoreBtn.disabled = false;
    }


   document.addEventListener('mousemove', () => {
       console.log("Mouse moved, resetting AFK timer.");
       resetAFKTimer();
    });
   document.addEventListener('keypress', () => {
       console.log("Key pressed, resetting AFK timer.");
       resetAFKTimer();
    });


   if (explanationModal) {
       explanationModal.addEventListener('click', (event) => {
           if (event.target === explanationModal) {
               console.log("Explanation modal overlay clicked.");
               resetAFKTimer();
           }
       });
       if (closeButton) {
           closeButton.addEventListener('click', () => {
              console.log("Explanation modal close button clicked.");
              resetAFKTimer();
           });
       }
   }

    if (confirmationModal) {
        confirmationModal.addEventListener('click', (event) => {
            if (event.target === confirmationModal) {
                 console.log("Confirmation modal overlay clicked (potentially to resume from AFK).");
                 resetAFKTimer();
            }
        });
    }


});

function hideExplanationModal() {
    if (explanationModal) {
        explanationModal.style.display = 'none';
    }
}