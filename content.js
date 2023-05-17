// Create button
const button = document.createElement("button");
button.textContent = "Submit File";
button.style.backgroundColor = "green";
button.style.color = "white";
button.style.padding = "5px";
button.style.border = "none";
button.style.borderRadius = "5px";
button.style.margin = "5px";

// Create progress element
const progress = document.createElement("div");
progress.style.width = "99%";
progress.style.height = "5px";
progress.style.backgroundColor = "grey";

const progressBar = document.createElement("div");
progressBar.style.width = "0%";
progressBar.style.height = "100%";
progressBar.style.backgroundColor = "blue";
progress.appendChild(progressBar);

// Find the element to insert before
const targetElement = document.querySelector(".flex.flex-col.w-full.py-2.flex-grow.md\\:py-3.md\\:pl-4");

// Insert the button and progress element
targetElement.parentNode.insertBefore(button, targetElement);
targetElement.parentNode.insertBefore(progress, targetElement);

// Button click event handler
button.addEventListener("click", async function() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt,.js,.py,.html,.css,.json,.csv";
  
  // File selection event handler
  input.addEventListener("change", async function(event) {
    const file = event.target.files[0];
    const filename = file.name;
    const reader = new FileReader();
    const chunkSize = 15000;
    const text = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
    
    const numChunks = Math.ceil(text.length / chunkSize);
    progressBar.style.width = "0%";
    
    for (let i = 0; i < numChunks; i++) {
      const chunk = text.slice(i * chunkSize, (i + 1) * chunkSize);
      await submitConversation(chunk, i + 1, filename);
      progressBar.style.width = `${((i + 1) / numChunks) * 100}%`;
    }
    
    progressBar.style.backgroundColor = "blue";
    button.disabled = true;
    
    // Check if chatgpt is ready
    let chatgptReady = false;
    while (!chatgptReady) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      chatgptReady = !document.querySelector(".text-2xl > span:not(.invisible)");
    }
    
    button.disabled = false;
  });
  
  input.click();
});

// Submit conversation function
async function submitConversation(text, part, filename) {
  const textarea = document.querySelector("textarea[tabindex='0']");
  const enterKeyEvent = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
  });
  textarea.value = `Part ${part} of ${filename}:\n\n${text}`;
  textarea.dispatchEvent(enterKeyEvent);
}
