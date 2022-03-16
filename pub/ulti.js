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
    this.disc = new Disc(10, -10, 20);
    this.discShown = false;

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

    this._playerId = 0;

    this.rootElement.appendChild(goalLine1);
    this.rootElement.appendChild(goalLine2);

    this._createDiscDOM(this.disc.x, this.disc.y);
    this._createTooltipsDOM();

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

    const newPlayer = new Player(this._playerId, x, y, name, jerseyNumber);
    this._playerId++;
    this.players.push(newPlayer);
    this._addPlayerDOM(newPlayer);
  };

  /**
   * Update the players in the DOM from the players array.
   */
  updatePlayers = () => {
    if (this.debug) {
      log("Updating players");
    }
    this._removeAllPlayersDOM();
    this.players.map((player) => {
      this._addPlayerDOM(player);
    });
  };

  _addPlayerDOM = (newPlayer) => {
    const player = document.createElement("img");
    player.className = "ulti-player";
    player.id = `${newPlayer.id}-ulti-player`;
    player.src = "./X_black.svg";
    player.style = `left: ${newPlayer.x - this._playerSizePx / 2}px; 
                    top: ${newPlayer.y - this._playerSizePx / 2}px;
                    width: ${this._playerSizePx}px;
                    height: ${this._playerSizePx}px;`;

    this.rootElement.appendChild(player);

    player.addEventListener("mouseenter", this._handlePlayerMouseEnter);
    player.addEventListener("mouseleave", this._handlePlayerMouseLeave);
  };

  _handlePlayerMouseEnter = (event) => {
    const id = parseInt(event.target.id);
    const player = this.players.filter((player) => player.id === id)[0];
    const tooltip = player.tooltip;
    tooltip.style.opacity = 0.7;
  };

  _handlePlayerMouseLeave = (event) => {
    const id = parseInt(event.target.id);
    const player = this.players.filter((player) => player.id === id)[0];
    const tooltip = player.tooltip;
    tooltip.style.opacity = 0;
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

  /**
   * Show the disc on the field.
   */
  showDisc = () => {
    this.discShown = true;

    const disc = this.rootElement.querySelector("#ulti-disc");
    disc.style.display = "block";

    if (this.debug) {
      log("Show disc");
    }
  };

  /**
   * Hide the disc from the field.
   */
  hideDisc = () => {
    this.discShown = false;
    const disc = this.rootElement.querySelector("#ulti-disc");
    disc.style.display = "none";

    if (this.debug) {
      log("Hide disc");
    }
  };

  /**
   * Moves the disc to the specified coordinates (from the top left,
   * or from the owner if applicable).
   */
  setDiscPosition = (x, y) => {
    if (this.debug) {
      log(`Moving disc to (${x}, ${y})`);
    }

    this.disc.x = x;
    this.disc.y = y;

    this._updateDiscDOM();
  };

  _updateDiscDOM = () => {
    const disc = this.rootElement.querySelector("#ulti-disc");

    if (this.disc.owner) {
      disc.style.left = `${
        this.disc.owner.x + this.disc.x - this.disc.size / 2
      }px`;
      disc.style.top = `${
        this.disc.owner.y + this.disc.y - this.disc.size / 2
      }px`;
    } else {
      disc.style.left = `${x - this.disc.size / 2}px`;
      disc.style.top = `${y - this.disc.size / 2}px`;
    }
  };

  /**
   * @returns the Player who is currently holding the disc.
   */
  getDiscOwner = () => {
    return this.disc.owner;
  };

  /**
   * Set the new owner of the disc.
   * @param newOwner new Player which is now holding the disc.
   */
  setDiscOwner = (newOwner) => {
    this.disc.owner = newOwner;
    this.setDiscPosition(this.disc.x, this.disc.y);
  };

  _createDiscDOM = (x, y) => {
    const disc = document.createElement("div");
    disc.id = "ulti-disc";
    disc.style = `left: ${x - this.disc.size / 2}px; 
                  top: ${y - this.disc.size / 2}px;
                  height: ${this.disc.size}px; 
                  width: ${this.disc.size}px;
                  display: none`;

    this.rootElement.appendChild(disc);
  };

  _createTooltipsDOM = () => {
    this.players.map((player) => {
      const tooltip = document.createElement("div");
      tooltip.className = "ulti-tooltip";

      const playerNum = document.createElement("span");
      playerNum.className = "ulti-player-number";
      playerNum.innerHTML = player.number ? `<b>#${player.number}</b>` : "";

      const playerName = document.createElement("span");
      playerName.className = "ulti-player-name";
      playerName.innerText = player.name ? player.name : "";

      tooltip.appendChild(playerNum);
      tooltip.appendChild(playerName);

      this.rootElement.appendChild(tooltip);

      tooltip.style.left = `${player.x - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${player.y + tooltip.offsetHeight / 2}px`;

      player.tooltip = tooltip;
    });
  };

  /**
   * Show player names and numbers in the form of a tooltip.
   */
  showNames = () => {
    if (this.debug) {
      log("Show player names");
    }
    const tooltips = this.rootElement.querySelectorAll(".ulti-tooltip");
    for (let i = 0; i < tooltips.length; i++) {
      tooltips[i].style.display = "block";
      setTimeout(() => {
        tooltips[i].style.opacity = 0.6;
      }, 10);
    }
  };

  /**
   * Hide player names and numbers tooltips.
   */
  hideNames = () => {
    if (this.debug) {
      log("Hide player names");
    }
    const tooltips = this.rootElement.querySelectorAll(".ulti-tooltip");
    for (let i = 0; i < tooltips.length; i++) {
      tooltips[i].style.opacity = 0;
      setTimeout(() => {
        tooltips[i].style.display = "none";
      }, 500);
    }
  };
}

class Player {
  constructor(id, x, y, name, jerseyNumber) {
    this.id = id;
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
  constructor(x, y, size, owner) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.owner = owner;
  }

  coords = () => {
    return this.owner
      ? [this.owner.x + this.x, this.owner.y + this.y]
      : [this.x, this.y];
  };
}
