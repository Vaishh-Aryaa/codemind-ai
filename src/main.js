import "./style.css";
import { marked } from "marked";

document.querySelector("#app").innerHTML = `

<div class="app">

  <header class="header">
    <h1>CodeMind AI</h1>
    <button id="themeToggle">
      <i class="fa-solid fa-moon"></i>
    </button>
  </header>

  <main class="chat-area">

    <div class="welcome" id="welcomeScreen">

      <h2>
        Understand any code instantly with AI
      </h2>

      <p>
        Paste your code below to begin
      </p>

    </div>

    <div id="chatContainer"></div>

  </main>

  <div class="input-area">

    <textarea
      id="codeInput"
      placeholder="Paste your code here..."
      rows="2"
    ></textarea>

    <button id="sendBtn">
      <i class="fa-solid fa-arrow-up"></i>
    </button>

  </div>

</div>
`;

const textarea = document.getElementById("codeInput");

const sendBtn = document.getElementById("sendBtn");

const chatContainer = document.getElementById("chatContainer");

const welcomeScreen = document.getElementById("welcomeScreen");

const themeToggle = document.getElementById("themeToggle");

textarea.addEventListener("input", () => {

  textarea.style.height = "auto";

  textarea.style.height = `${textarea.scrollHeight}px`;

});

textarea.addEventListener("keydown", (e) => {

  if(e.key === "Enter" && !e.shiftKey){

    e.preventDefault();

    sendMessage();

  }

});

sendBtn.addEventListener("click", sendMessage);

async function sendMessage(){

  const code = textarea.value.trim();

  if(code === "") return;

  welcomeScreen.style.display = "none";

  const userMessage = `
  <div class="message user-message">
    <div class="message-content">${code}</div>
  </div>
  `;

  chatContainer.innerHTML += userMessage;

  textarea.value = "";

  textarea.style.height = "auto";

  chatContainer.scrollTop =
  chatContainer.scrollHeight;

  const loadingMessage = `
  <div class="loading-wrapper loading">
    <div class="typing"></div>
    <span>Analyzing...</span>
  </div>
  `;

  chatContainer.innerHTML += loadingMessage;

  chatContainer.scrollTop =
  chatContainer.scrollHeight;

  try{

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method:"POST",

        headers:{
          "Authorization":
          `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,

          "Content-Type":"application/json",
        },

        body:JSON.stringify({

          model:"openai/gpt-3.5-turbo",

          messages:[
            {
              role:"user",

              content:`

You are an expert AI code analyzer.

First detect the programming language.

Then explain the code beautifully using markdown format.

Use this structure:

## Detected Language

## Overview

## Logic

## Output

## Important Concepts

## Beginner Explanation

Code:
${code}

`
            }
          ]

        })

      }
    );

    const data = await response.json();

    document.querySelector(".loading").remove();


    if(data.error){

      let errorText = "Something went wrong while analyzing code. Please try again.";

      if(
        data.error.message
        .toLowerCase()
        .includes("quota")
      ){

      errorText = "Daily AI quota reached. Please try again later or switch API key.";

    }

    const errorMessage = `
    <div class="message ai-message">
      <div class="message-content">
        ${errorText}
      </div>
    </div>
    `;

    chatContainer.innerHTML += errorMessage;

    return;
  }

    const aiResponse =
    data.choices[0].message.content;

    const formattedResponse =
    marked.parse(aiResponse);

    const aiMessage = `
    <div class="message ai-message">
      <div class="message-content">
        <button class="copy-response-btn">
          <i class="fa-solid fa-copy"></i>
        </button>
        ${formattedResponse}
      </div>
    </div>
    `;

    chatContainer.innerHTML += aiMessage;

    const copyButtons =
    document.querySelectorAll(".copy-response-btn");

    const latestCopyBtn =
    copyButtons[copyButtons.length - 1];

    latestCopyBtn.addEventListener("click", () => {

      navigator.clipboard.writeText(aiResponse);

      latestCopyBtn.innerHTML =
      `<i class="fa-solid fa-check"></i>`;

      setTimeout(() => {

        latestCopyBtn.innerHTML =
        `<i class="fa-solid fa-copy"></i>`;

      }, 2000);

    });

    chatContainer.scrollTop =
    chatContainer.scrollHeight;

  }catch(error){

    console.log(error);

    document.querySelector(".loading")?.remove();

    const errorMessage = `
    <div class="message ai-message">
      <div class="message-content">
        Unable to connect to AI service. Please check your internet connection.
      </div>
    </div>
    `;

    chatContainer.innerHTML += errorMessage;

  }

}

themeToggle.addEventListener("click", () => {

  document.body.classList.toggle("light-theme");

  if(document.body.classList.contains("light-theme")){

    themeToggle.innerHTML =
    `<i class="fa-solid fa-sun"></i>`;

  }else{

    themeToggle.innerHTML =
    `<i class="fa-solid fa-moon"></i>`;

  }

});