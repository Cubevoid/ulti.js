"use strict";

const body = document.querySelector("body");
const title1 = document.createElement("h3");
title1.innerText =
  "One player, moving disc (hover over player (X) for name and jersey number)";
body.appendChild(title1);

const ulti1 = new UltiBoard(400, undefined, "h", true);
ulti1.addPlayer(0, 0);
ulti1.addPlayer("50%", "50%"); // middle of the field
ulti1.players = ulti1.players.filter((player) => {
  return player.x !== 0;
});
ulti1.players[0].name = "Colin De Vlieghere";
ulti1.players[0].number = 23;
ulti1.updatePlayers();
ulti1.setDiscOwner(ulti1.players[0]);

ulti1.showDisc();
setTimeout(() => {
  ulti1.setDiscPosition(50, 50);
}, 1000);


const title2 = document.createElement("h3");
title2.innerText = 'Vertical Field with custom dimensions, "Vert Stack" preset';
body.appendChild(title2);

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
const ulti2 = new UltiBoard(400, 600, "v", true);
ulti2.vertStack(true);

const handler = ulti2.players.filter((player) => player.name === "Handler")[0]
const dump = ulti2.players.filter((player) => player.name === "Dump")[0]

showDiscButton.addEventListener("click", (e) => ulti2.showDisc())
hideDiscButton.addEventListener("click", (e) => ulti2.hideDisc())
passDiscButton.addEventListener("click", (e) => ulti2.setDiscOwner(dump))
passDiscBackButton.addEventListener("click", (e) => ulti2.setDiscOwner(handler))


const title3 = document.createElement("h3");
title3.innerText = "Horizontal field, Vert Stack (no defenders)";
body.appendChild(title3);

const vertButton = document.createElement("button");
body.appendChild(vertButton);
const clearButton = document.createElement("button");
body.appendChild(clearButton);
const showNamesButton = document.createElement("button");
body.appendChild(showNamesButton);
const hideNamesButton = document.createElement("button");
body.appendChild(hideNamesButton);

const ulti3 = new UltiBoard(400, undefined, "h", true);

vertButton.innerText = "Vert Stack preset";
clearButton.innerText = "Clear field";
showNamesButton.innerText = "Show names";
hideNamesButton.innerText = "Hide names";

vertButton.addEventListener("click", (e) => ulti3.vertStack(false));
clearButton.addEventListener("click", (e) => ulti3.clear());
showNamesButton.addEventListener("click", (e) => ulti3.showNames())
hideNamesButton.addEventListener("click", (e) => ulti3.hideNames())
