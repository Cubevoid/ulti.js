"use strict";

const ulti1 = new UltiBoard(400, undefined, "h", true);
ulti1.addPlayer(0, 0);
ulti1.addPlayer("50%", "50%");  // middle of the field
ulti1.showDisc();
setTimeout(() => {
  ulti1.setDiscPosition(50, 50);
}, 1000);
// setTimeout(() => {
//     ulti1.hideDisc();
// }, 2000)

ulti1.players = ulti1.players.filter((player) => {
  return player.x !== 0;
});
ulti1.players[0].name = "Colin De Vlieghere";
ulti1.players[0].number = 23;
ulti1.updatePlayers();

ulti1.setDiscOwner(ulti1.players[0]);
