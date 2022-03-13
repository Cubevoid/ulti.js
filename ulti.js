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
    this.playerSize = 20;

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

    goalLine1.style = `top: 17.5%; width: 100%`;
    goalLine2.style = `top: 82%; width: 100%`;

    this.rootElement.appendChild(goalLine1);
    this.rootElement.appendChild(goalLine2);

    body.appendChild(this.rootElement);
  }

  // Returns a copy of the players array
  getPlayers = () => {
    return JSON.parse(JSON.stringify(this.players));
  };

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

  _addPlayerDOM = (newPlayer) => {
    const player = document.createElement("img");
    player.className = "ulti-player";
    player.src = "static/X_black.svg";
    player.style = `left: ${newPlayer.x - this.playerSize / 2}px; 
                    top: ${newPlayer.y - this.playerSize / 2}px;
                    width: ${this.playerSize}px;
                    height: ${this.playerSize}px;`;

    this.rootElement.appendChild(player);
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
