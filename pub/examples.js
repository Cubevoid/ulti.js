"use strict";

const body = document.querySelector("body");

function createCodeBlock(text) {
  const codeWrapper = document.createElement("details");
  codeWrapper.className = "code-wrapper";
  codeWrapper.innerHTML = "<summary>Code</summary>";
  const code = document.createElement("pre");
  code.innerText = text;
  codeWrapper.appendChild(code);
  body.appendChild(codeWrapper);
}

function example1() {
  const title1 = document.createElement("h3");
  title1.innerText =
    "Hover over player (X) to see name and jersey number. Player and disc are draggable";
  body.appendChild(title1);
  title1.className = "example-title";

  const ulti1 = new UltiBoard(400, undefined, "h", true, true);
  ulti1.addPlayer(0, 0);
  ulti1.addPlayer("50%", "50%"); // middle of the field
  ulti1.filterPlayers((player) => {
    return player.x !== 0;
  });

  ulti1.players[0].name = "Colin De Vlieghere";
  ulti1.players[0].number = 23;
  ulti1.updatePlayers();
  ulti1.setDiscOwner(ulti1.players[0]);

  ulti1.showDisc();
  setTimeout(() => {
    ulti1.setDiscOffset(50, 50);
  }, 1000);

  createCodeBlock(`const ulti1 = new UltiBoard(400, undefined, "h", true, true);
ulti1.addPlayer(0, 0);
ulti1.addPlayer("50%", "50%"); // middle of the field
ulti1.filterPlayers((player) => {
  return player.x !== 0;
});

ulti1.players[0].name = "Colin De Vlieghere";
ulti1.players[0].number = 23;
ulti1.updatePlayers();
ulti1.setDiscOwner(ulti1.players[0]);

ulti1.showDisc();
setTimeout(() => {
  ulti1.setDiscOffset(50, 50);
}, 1000);`);
}

function example2() {
  const title2 = document.createElement("h3");
  title2.innerText =
    "Vertical Field with custom dimensions, dragging disabled. Try drawing arrows on the field!";
  body.appendChild(title2);
  title2.className = "example-title";

  const showDiscButton = document.createElement("button");
  const hideDiscButton = document.createElement("button");
  const passDiscButton = document.createElement("button");
  const passDiscBackButton = document.createElement("button");
  showDiscButton.innerText = "Show Disc";
  hideDiscButton.innerText = "Hide Disc";
  passDiscButton.innerText = "Pass disc to dump";
  passDiscBackButton.innerText = "Pass disc back to handler";
  body.appendChild(showDiscButton);
  body.appendChild(hideDiscButton);
  body.appendChild(passDiscButton);
  body.appendChild(passDiscBackButton);

  // Vertical field
  const ulti2 = new UltiBoard(400, 600, "v", false, true);
  ulti2.hoStack(true);

  const handler = ulti2.players.filter(
    (player) => player.name === "Main Handler"
  )[0];
  const dump = ulti2.players.filter((player) => player.name === "Handler")[1];

  showDiscButton.addEventListener("click", (e) => ulti2.showDisc());
  hideDiscButton.addEventListener("click", (e) => ulti2.hideDisc());
  passDiscButton.addEventListener("click", (e) => ulti2.setDiscOwner(dump));
  passDiscBackButton.addEventListener("click", (e) =>
    ulti2.setDiscOwner(handler)
  );

  createCodeBlock(`// Vertical field
const ulti2 = new UltiBoard(400, 600, "v", false, true);
ulti2.hoStack(true);

// Get handler and dump players for disc passing
const handler = ulti2.players.filter(
  (player) => player.name === "Main Handler"
)[0];
const dump = ulti2.players.filter((player) => player.name === "Handler")[1];

// Button listeners
showDiscButton.addEventListener("click", (e) => ulti2.showDisc());
hideDiscButton.addEventListener("click", (e) => ulti2.hideDisc());
passDiscButton.addEventListener("click", (e) => ulti2.setDiscOwner(dump));
passDiscBackButton.addEventListener("click", (e) =>
  ulti2.setDiscOwner(handler)
);`);
}

function example3() {
  const title3 = document.createElement("h3");
  title3.innerText = "Horizontal field, Vert/Ho Stack (defenders disabled)";
  body.appendChild(title3);
  title3.className = "example-title";

  const vertButton = document.createElement("button");
  body.appendChild(vertButton);
  const hoButton = document.createElement("button");
  body.appendChild(hoButton);
  const clearButton = document.createElement("button");
  body.appendChild(clearButton);
  const showNamesButton = document.createElement("button");
  body.appendChild(showNamesButton);
  const hideNamesButton = document.createElement("button");
  body.appendChild(hideNamesButton);

  const ulti3 = new UltiBoard(400, undefined, "h", true, true);

  vertButton.innerText = "Vert Stack preset";
  hoButton.innerText = "Ho Stack preset";
  clearButton.innerText = "Clear field";
  showNamesButton.innerText = "Show names";
  hideNamesButton.innerText = "Hide names";

  vertButton.addEventListener("click", (e) => ulti3.vertStack(false));
  hoButton.addEventListener("click", (e) => ulti3.hoStack(false));
  clearButton.addEventListener("click", (e) => ulti3.clear());
  showNamesButton.addEventListener("click", (e) => ulti3.showNames());
  hideNamesButton.addEventListener("click", (e) => ulti3.hideNames());

  createCodeBlock(`const ulti3 = new UltiBoard(400, undefined, "h", true, true);

// Button listeners
vertButton.addEventListener("click", (e) => ulti3.vertStack(false));
hoButton.addEventListener("click", (e) => ulti3.hoStack(false));
clearButton.addEventListener("click", (e) => ulti3.clear());
showNamesButton.addEventListener("click", (e) => ulti3.showNames());
hideNamesButton.addEventListener("click", (e) => ulti3.hideNames());`)
}

example1();
example2();
example3();
