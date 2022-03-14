"use strict";

const log = console.log;
log("===== Loaded ulti.js =====");

// Main library class.
// Returns an "Ulti" object with different methods
class UltiBoard {
  // Creates and appends the DOM element for this Ulti visualization.
  constructor(width, length, orientation = "vertical", debug = false) {
    this.debug = debug;

    if (this.debug) {
      log("New UltiBoard created");
    }

    const body = document.querySelector("body");
    this.rootElement = document.createElement("div");
    this.rootElement.id = "ulti-root";

    this.players = [];
    this._playerSizePx = 20;
    this._disc = new Disc(15, -15);
    this._discDiameterPx = 20;
    this._discShown = false;

    // Make the field have standard dimensions unless specified otherwise
    if (width && length) {
    } else if (width) {
      length = (width * 110) / 40;
    } else if (length) {
      width = (length * 40) / 110;
    } else {
      width = 200;
      length = 550;
    }

    this.fieldWidth = width;
    this.fieldLength = length;

    if (this.debug) {
      log(`Field dimensions: ${this.fieldWidth} x ${this.fieldLength}`);
    }

    if (orientation[0] === "v") {
      this.vert = true;
    } else if (orientation[0] === "h") {
      this.vert = false;
    } else {
      throw new Error("invalid orientation");
    }

    if (this.debug) {
      log(`Orientation: ${this.vert ? "vertical" : "horizontal"}`);
    }

    this.rootElement.style = this.vert
      ? `width: ${width}px; height: ${length}px`
      : `width: ${length}px; height: ${width}px`;

    const goalLine1 = document.createElement("div");
    const goalLine2 = document.createElement("div");
    goalLine1.className = "ulti-goal-line";
    goalLine2.className = "ulti-goal-line";

    if (this.vert) {
      goalLine1.style = `top: 17.5%; width: 100%`;
      goalLine2.style = `top: 82%; width: 100%`;
    } else {
      goalLine1.style = `left: 17.5%; height: 100%`;
      goalLine2.style = `left: 82%; height: 100%`;
    }

    this.rootElement.appendChild(goalLine1);
    this.rootElement.appendChild(goalLine2);

    body.appendChild(this.rootElement);
  }

  /** Adds a player to the field. x and y denote the CENTER of the player's positon.
   *
   * x and y denote pixels from the top-left, but can also be set to percentages.*/
  addPlayer = (x, y, name, jerseyNumber) => {
    if (typeof x === "string") {
      if (x.slice(-1) !== "%") {
        throw new Error(`Invalid x coordinate: ${x}`);
      } else {
        x = parseInt(x) / 100;
        x = this.vert ? x * this.fieldWidth : x * this.fieldLength;
      }
    }
    if (typeof y === "string") {
      if (y.slice(-1) !== "%") {
        throw new Error(`Invalid y coordinate: ${y}`);
      } else {
        y = parseInt(y) / 100;
        y = this.vert ? y * this.fieldLength : y * this.fieldWidth;
      }
    }

    if (this.debug) {
      log(`Adding new player at (${x}, ${y})`);
    }

    const newPlayer = new Player(x, y, name, jerseyNumber);
    this.players.push(newPlayer);
    this._addPlayerDOM(newPlayer);
  };

  /**
   * Keep only a set of players from the array.
   * @param filter function to filter the players array on
   */
  filterPlayers = (filter) => {
    if (this.debug) {
      log('Filtering players');
    }
    this.players = this.players.filter(filter);
    this._removeAllPlayersDOM();
    this.players.map((player) => {
      this._addPlayerDOM(player);
    });
  };

  _addPlayerDOM = (newPlayer) => {
    const player = document.createElement("img");
    player.className = "ulti-player";
    player.src = "./X_black.svg";
    player.style = `left: ${newPlayer.x - this._playerSizePx / 2}px; 
                    top: ${newPlayer.y - this._playerSizePx / 2}px;
                    width: ${this._playerSizePx}px;
                    height: ${this._playerSizePx}px;`;

    this.rootElement.appendChild(player);
  };

  _removeAllPlayersDOM = () => {
    if (this.debug) {
      log("Removed all players from DOM");
    }
    const players = this.rootElement.querySelectorAll(".ulti-player");
    for (let i = 0; i < players.length; i++) {
      this.rootElement.removeChild(players[i]);
    }
  };

  showDisc = () => {
    this._discShown = true;

    this._addDiscDOM(...this._disc.coords());

    if (this.debug) {
      log("Show disc");
    }
  };

  hideDisc = () => {
    this._discShown = false;
    this._removeDiscDOM();

    if (this.debug) {
      log("Hide disc");
    }
  };

  getDiscPosition = () => {
    return this._disc.x, this._disc.y;
  };

  setDiscPosition = (x, y) => {
    if (this.debug) {
      log(`Moving disc to (${x}, ${y})`);
    }

    this._disc.x = x;
    this._disc.y = y;

    if (this.showDisc) {
      this._moveDiscDOM(...this._disc.coords());
    }
  };

  getDiscOwner = () => {
    return this._disc.owner;
  };

  setDiscOwner = (newOwner) => {
    this._disc.owner = newOwner;
    this.setDiscPosition(this._disc.x, this._disc.y);
  };

  _addDiscDOM = (x, y) => {
    const disc = document.createElement("div");
    disc.id = "ulti-disc";
    disc.style = `left: ${x - this._discDiameterPx / 2}px; 
                  top: ${y - this._discDiameterPx / 2}px;
                  height: ${this._discDiameterPx}px; 
                  width: ${this._discDiameterPx}px`;

    this.rootElement.appendChild(disc);
  };

  /** Moves the disc to the specified coordinates. */
  _moveDiscDOM(x, y) {
    const disc = this.rootElement.querySelector("#ulti-disc");
    disc.style = `left: ${x - this._discDiameterPx / 2}px; 
                  top: ${y - this._discDiameterPx / 2}px;
                  height: ${this._discDiameterPx}px; 
                  width: ${this._discDiameterPx}px`;
  }

  _removeDiscDOM = () => {
    const disc = this.rootElement.querySelector("#ulti-disc");
    this.rootElement.removeChild(disc);
  };
}

class Player {
  constructor(x, y, name, jerseyNumber) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.number = jerseyNumber;
  }
}

class Disc {
  /** Defines a new Disc object.
   * @param x     x-coordinate of the disc
   * @param y     y-coordinate of the disc
   * @param owner Player which is holding the disc
   *
   * If owner is defined, then x and y define the position of the disc relative
   * to the position of the owner. Otherwise, they describe the position on the
   * field (from the top left corner).
   */
  constructor(x, y, owner) {
    this.x = x;
    this.y = y;
    this.owner = owner;
  }

  coords = () => {
    return this.owner
      ? [this.owner.x + this.x, this.owner.y + this.y]
      : [this.x, this.y];
  };
}
