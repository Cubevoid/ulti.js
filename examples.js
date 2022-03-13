"use strict";

const ulti1 = new UltiBoard(400, undefined, 'h', true);
ulti1.addPlayer(0, 0)
ulti1.addPlayer('50%', '50%')
ulti1.showDisc()
setTimeout(() => {
    ulti1.setDiscPosition(100, 100)
}, 1000);

ulti1.filterPlayers((player) => {
    return player.x !== 0
})

ulti1.setDiscOwner(ulti1.players[0])