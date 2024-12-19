const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");

const BOT_IMG = "images/bot.png";
const PERSON_IMG = "images/user.png";
const BOT_NAME = "BOT";
const PERSON_NAME = "user";

let step = 0;
let userDetails = {}; 
let messages = []; 
let lastUserMessage = ""; 

msgerForm.addEventListener("submit", event => {
  event.preventDefault();

  const msgText = msgerInput.value;
  if (!msgText) return;

  appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText);
  lastUserMessage = msgText;
  msgerInput.value = "";

  handleUserInput(msgText);
});

function appendMessage(name, img, side, text) {
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>
      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
        </div>
        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;
  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
  messages.push(`${name}: ${text}`); 
}

function handleUserInput(msgText) {
  if (step === 0 && msgText.toLowerCase().includes("recommend workout")) {
    askQuestion("What is your gender ?");
    step++;
  } else if (step === 1) {
    userDetails.gender = msgText; 
    askQuestion("How old are you?");
    step++;
  } else if (step === 2) {
    userDetails.age = msgText; 
    askQuestion("What is your weight in kg?");
    step++;
  } else if (step === 3) {
    userDetails.weight = msgText; 
    askQuestion("What is your height in meters?");
    step++;
  } else if (step === 4) {
    userDetails.height = msgText; 
    getRecommendation(userDetails); 
    step++;
  }
  else {
    appendMessage(BOT_NAME, BOT_IMG, "left", "Sorry, I don't understand. Write 'recommend workout' to start.");
  }

}

function askQuestion(question) {
  appendMessage(BOT_NAME, BOT_IMG, "left", question);
  Speech(question); 
}

function getRecommendation(userDetails) {
  fetch('http://127.0.0.1:5000/get_recommendation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userDetails) 
  })
  .then(response => response.json())
  .then(result => {
    const bmi = result.BMI;
    const bmiCase = result.BMIcase;
    const planNumber = result.RecommendedExercisePlan;
    let recommendationText = `
      Your BMI is: ${bmi} <br>
      Your BMI case is: ${bmiCase} <br>
    `;

    if (planNumber) {
      const imageUrl = `images/${planNumber}.png`;

      const workoutImage = `
      <a href="${imageUrl}" target="_blank" download>
        <img src="${imageUrl}" alt="Workout Plan" style="width: 100%; max-width: 500px;"/>
      </a>
    `;
    recommendationText += `<br><br>${workoutImage}`;
    } else {
      recommendationText += "<br><br>Sorry, no workout plan found for your BMI case.";
    }

    appendMessage(BOT_NAME, BOT_IMG, "left", recommendationText);
  })
  .catch(error => {
    appendMessage(BOT_NAME, BOT_IMG, "left", "Sorry, something went wrong. Please try again.");
  });
}


// Speech synthesis functionality
function Speech(say) {
  if ('speechSynthesis' in window) {
    console.log("Speech synthesis is supported");
    var utterance = new SpeechSynthesisUtterance(say);
    speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech synthesis not supported in this browser.");
  }
}

// Utils
function get(selector, root = document) {
  return root.querySelector(selector);
}
