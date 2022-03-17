"use strict";

const body = document.querySelector("body");
const title1 = document.createElement("h3");
title1.innerText = "One player, moving disc (hover over player for name and jersey number)";
body.appendChild(title1);

const ulti1 = new UltiBoard(400, undefined, "h", true);
ulti1.addPlayer(0, 0);
ulti1.addPlayer("50%", "50%");  // middle of the field
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
title2.innerText = "Vertical Field with custom dimensions, \"Vert Stack\" preset";
body.appendChild(title2);

// Vertical field
const ulti2 = new UltiBoard(400, 600, "v", true)
ulti2.vertStack(true);

const title3 = document.createElement("h3");
title3.innerText = "Same as above, but horizontal";
body.appendChild(title3);

// Vertical field
const ulti3 = new UltiBoard(400, 600, "h", true)
ulti3.vertStack(true);