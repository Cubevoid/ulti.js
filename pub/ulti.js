"use strict";

const log = console.log;
log("===== Loaded ulti.js =====");

(function (global, document) {
  let playerId = 0;
  let borderWidth;

  class UltiBoard {
    // Private variables
    #playerSizePx = 20;
    #rootElement;
    #borderWidth;
    #canvas;
    #discShown = false;
    #disc;
    #enableDragging;
    #fieldWidth;
    #fieldLength;
    #isVerticalField;
    #inDrawingMode = false;

    // Creates and appends the DOM element for this Ulti visualization.
    constructor(
      width,
      length,
      orientation = "vertical",
      enableDragging = true,
      debug = false
    ) {
      this.debug = debug;

      if (this.debug) {
        log("New UltiBoard created");
      }

      this.#enableDragging = enableDragging;

      const body = document.querySelector("body");
      this.#rootElement = document.createElement("div");
      this.#rootElement.id = "ulti-root";

      this.players = [];
      this.#disc = new Disc(10, -10, 20);

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

      this.#fieldWidth = width;
      this.#fieldLength = length;

      if (this.debug) {
        log(`Field dimensions: ${this.#fieldWidth} x ${this.#fieldLength}`);
      }

      if (orientation[0] === "v") {
        this.#isVerticalField = true;
      } else if (orientation[0] === "h") {
        this.#isVerticalField = false;
      } else {
        throw new Error("invalid orientation");
      }

      if (this.debug) {
        log(
          `Orientation: ${this.#isVerticalField ? "vertical" : "horizontal"}`
        );
      }

      body.appendChild(this.#rootElement);
      borderWidth = parseInt(
        getComputedStyle(this.#rootElement).getPropertyValue("border-width")
      );

      this.#rootElement.style = this.#isVerticalField
        ? `width: ${width}px; height: ${length}px`
        : `width: ${length}px; height: ${width}px`;

      const goalLine1 = document.createElement("div");
      const goalLine2 = document.createElement("div");
      goalLine1.className = "ulti-goal-line";
      goalLine2.className = "ulti-goal-line";

      if (this.#isVerticalField) {
        goalLine1.style = `top: 17.5%; width: 100%`;
        goalLine2.style = `top: 82%; width: 100%`;
      } else {
        goalLine1.style = `left: 17.5%; height: 100%`;
        goalLine2.style = `left: 82%; height: 100%`;
      }

      this.#rootElement.appendChild(goalLine1);
      this.#rootElement.appendChild(goalLine2);

      const div = this.#createDiscDOM(this.#disc.x, this.#disc.y);
      if (this.#enableDragging) {
        div.addEventListener("mousedown", this.#disc.onmousedown);
      }
      this.#createTooltipsDOM();

      const drawButton = document.createElement("button");
      drawButton.onclick = this.#toggleDrawMode;
      drawButton.id = "ulti-toggle-draw";
      const drawButtonIcon = document.createElement("img");
      drawButtonIcon.src = "./img/edit_white_24dp.svg";
      drawButton.title = "Toggle drawing mode";
      drawButton.appendChild(drawButtonIcon);
      this.#rootElement.appendChild(drawButton);

      const clearButton = document.createElement("button");
      clearButton.onclick = this.#clearDrawings;
      clearButton.id = "ulti-clear-drawings";
      const clearButtonIcon = document.createElement("img");
      clearButtonIcon.src = "./img/delete_white_24dp.svg";
      clearButton.title = "Clear drawings";
      clearButton.appendChild(clearButtonIcon);
      this.#rootElement.appendChild(clearButton);

      this.#canvas = document.createElement("canvas");
      this.#canvas.id = "ulti-canvas";
      this.#canvas.width = this.#rootElement.offsetWidth - 2 * borderWidth;
      this.#canvas.height = this.#rootElement.offsetHeight - 2 * borderWidth;
      this.#rootElement.appendChild(this.#canvas);
    }

    /**
     * Toggles Drawing Mode on/off
     */
    #toggleDrawMode = () => {
      if (this.debug) {
        log("Toggled drawing mode");
      }
      const drawButton = this.#rootElement.querySelector("#ulti-toggle-draw");
      if (this.#inDrawingMode) {
        this.#inDrawingMode = false;
        drawButton.style.backgroundColor = "rgb(182, 141, 221)";
        this.#canvas.style.cursor = "default";
        this.#canvas.removeEventListener("mousedown", this.startDrawing);
      } else {
        this.#inDrawingMode = true;
        drawButton.style.backgroundColor = "blueviolet";
        this.#canvas.style.cursor = "crosshair";
        this.#canvas.addEventListener("mousedown", this.startDrawing);
      }
    };

    startDrawing = (event) => {
      const fieldBox = this.#canvas.getBoundingClientRect();

      let fromx = event.clientX - fieldBox.left;
      let fromy = event.clientY - fieldBox.top;
      let tox;
      let toy;

      const setTarget = (pageX, pageY) => {
        tox = pageX - this.#rootElement.offsetLeft - borderWidth;
        toy = pageY - this.#rootElement.offsetTop - borderWidth;
      };

      setTarget(event.pageX, event.pageY);

      const onmousemove = (event) => {
        setTarget(event.pageX, event.pageY);
        // https://stackoverflow.com/questions/29908261/prevent-text-selection-on-mouse-drag#29908832
        if (document.selection) {
          document.selection.empty();
        } else {
          window.getSelection().removeAllRanges();
        }
      };

      const onmouseup = () => {
        document.removeEventListener("mousemove", onmousemove);
        document.removeEventListener("mouseup", onmouseup);
        this.#drawArrow(fromx, fromy, tox, toy);
      };

      document.addEventListener("mousemove", onmousemove);
      document.addEventListener("mouseup", onmouseup);
    };

    // https://stackoverflow.com/a/6333775
    #drawArrow(fromx, fromy, tox, toy) {
      const context = this.#canvas.getContext("2d");

      context.strokeStyle = "red";
      context.lineWidth = 3;
      context.lineCap = "round";
      context.beginPath();
      const headlen = 15; // length of head in pixels
      const dx = tox - fromx;
      const dy = toy - fromy;
      const angle = Math.atan2(dy, dx);
      context.moveTo(fromx, fromy);
      context.lineTo(tox, toy);
      context.moveTo(tox, toy);
      context.lineTo(
        tox - headlen * Math.cos(angle - Math.PI / 6),
        toy - headlen * Math.sin(angle - Math.PI / 6)
      );
      context.moveTo(tox, toy);
      context.lineTo(
        tox - headlen * Math.cos(angle + Math.PI / 6),
        toy - headlen * Math.sin(angle + Math.PI / 6)
      );
      context.stroke();
    }

    /**
     * Clears drawings
     */
    #clearDrawings = () => {
      if (this.debug) {
        log("Clearing drawings");
      }
      const context = this.#canvas.getContext("2d");
      context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    };

    /**
     * Clears everything off the field, including players and the disc.
     */
    clear = () => {
      this.players = [];
      this.updatePlayers();
      this.hideDisc();
      this.hideNames();
      this.setDiscOwner(undefined);
    };

    /** Adds a player to the field. x and y denote the CENTER of the player's positon.
     *  @param x            x-coordinate in pixels or percent
     *  @param y            y-coordinate in pixels or percent
     *  @param name         player name
     *  @param jerseyNumber player jersey number
     *  @param type         one of 'offense', 'defense', 'handler'
     *  @param rotation     degrees to rotate the player by (default is vertical)
     *  @returns            the new player
     */
    addPlayer = (x, y, name, jerseyNumber, type = "offense", rotation = 0) => {
      if (typeof x === "string") {
        if (x.slice(-1) !== "%") {
          throw new Error(`Invalid x coordinate: ${x}`);
        } else {
          x = parseInt(x) / 100;
          x *= this.#isVerticalField ? this.#fieldWidth : this.#fieldLength;
        }
      }
      if (typeof y === "string") {
        if (y.slice(-1) !== "%") {
          throw new Error(`Invalid y coordinate: ${y}`);
        } else {
          y = parseInt(y) / 100;
          y *= this.#isVerticalField ? this.#fieldLength : this.#fieldWidth;
        }
      }

      if (this.debug) {
        log(`Adding new player at (${x}, ${y})`);
      }

      const newPlayer = new Player(
        playerId,
        x,
        y,
        name,
        jerseyNumber,
        type,
        rotation
      );
      playerId++;
      this.players.push(newPlayer);
      const div = this.#addPlayerDOM(newPlayer);
      if (this.#enableDragging) {
        div.addEventListener("mousedown", newPlayer.onmousedown);
        newPlayer.setUpdateCallbacks(
          this.#updateDiscDOM,
          this.#createTooltipsDOM
        );
      }
      this.#createTooltipsDOM();

      return newPlayer;
    };

    /**
     * Set a new array of Players based on the given filter
     * @param filter arrow function filtering players
     */
    filterPlayers = (filter) => {
      this.players = this.players.filter(filter);
      this.updatePlayers();
    };

    /**
     * Update the players in the DOM from the players array.
     */
    updatePlayers = () => {
      if (this.debug) {
        log("Updating players");
      }
      this.#removeAllPlayersDOM();
      this.players.map((player) => {
        const div = this.#addPlayerDOM(player);
        if (this.#enableDragging) {
          div.addEventListener("mousedown", player.onmousedown);
        }
      });
      this.#createTooltipsDOM();
    };

    #addPlayerDOM = (newPlayer) => {
      const player = document.createElement("img");
      player.classList.add("ulti-player");

      if (newPlayer.type === "offense" || newPlayer.type === "handler") {
        player.src = "./img/X_black.svg";
      } else if (newPlayer.type === "defense") {
        player.src = "./img/line_black.svg";
      } else {
        throw new Error(`Invalid player type: ${type}`);
      }

      player.id = `${newPlayer.id}-ulti-player`;
      player.style = `left: ${newPlayer.x - this.#playerSizePx / 2}px; 
                      top: ${newPlayer.y - this.#playerSizePx / 2}px;
                      width: ${this.#playerSizePx}px;
                      height: ${this.#playerSizePx}px;`;

      if (newPlayer.rotation) {
        player.style.transform = `rotate(${newPlayer.rotation}deg)`;
      }

      this.#rootElement.appendChild(player);

      player.addEventListener("mouseenter", this.#handlePlayerMouseEnter);
      player.addEventListener("mouseleave", this.#handlePlayerMouseLeave);
      return player;
    };

    #handlePlayerMouseEnter = (event) => {
      event.preventDefault();
      const id = parseInt(event.target.id);
      const player = this.players.filter((player) => player.id === id)[0];
      if (player.number || player.name) {
        // if (this.debug) {
        //   log("Show tooltip");
        // }
        player.tooltip.style.display = "block";
        setTimeout(() => {
          player.tooltip.style.opacity = 0.7;
        }, 0);
      }
    };

    #handlePlayerMouseLeave = (event) => {
      event.preventDefault();
      const id = parseInt(event.target.id);
      const player = this.players.filter((player) => player.id === id)[0];
      // if ((player.number || player.name) && this.debug) {
      //   log("Hide tooltip");
      // }
      player.tooltip.style.opacity = 0;
      setTimeout(() => {
        player.tooltip.style.display = "none";
      }, 150);
    };

    #removeAllPlayersDOM = () => {
      if (this.debug) {
        log("Removed all players from DOM");
      }
      const players = this.#rootElement.querySelectorAll(".ulti-player");
      for (let i = 0; i < players.length; i++) {
        this.#rootElement.removeChild(players[i]);
      }
    };

    /**
     * Show the disc on the field.
     */
    showDisc = () => {
      this.#discShown = true;

      const disc = this.#rootElement.querySelector("#ulti-disc");
      disc.style.display = "block";

      if (this.debug) {
        log("Show disc");
      }
    };

    /**
     * Hide the disc from the field.
     */
    hideDisc = () => {
      this.#discShown = false;
      const disc = this.#rootElement.querySelector("#ulti-disc");
      disc.style.display = "none";

      if (this.debug) {
        log("Hide disc");
      }
    };

    /**
     * Moves the disc to the specified coordinates (from the top left,
     * or from the owner if applicable).
     */
    setDiscOffset = (x, y) => {
      if (this.debug) {
        log(`Setting disc offset (${x}, ${y})`);
      }

      this.#disc.x = x;
      this.#disc.y = y;

      this.#updateDiscDOM();
    };

    #updateDiscDOM = () => {
      const disc = this.#rootElement.querySelector("#ulti-disc");

      let left = this.#disc.x - this.#disc.size / 2;
      let top = this.#disc.y - this.#disc.size / 2;

      if (this.#disc.owner) {
        left += this.#disc.owner.x;
        top += this.#disc.owner.y;
      }

      left = clip(
        left,
        0,
        this.#rootElement.offsetWidth - this.#disc.size - 2 * borderWidth
      );
      top = clip(
        top,
        0,
        this.#rootElement.offsetHeight - this.#disc.size - 2 * borderWidth
      );

      disc.style.left = left + "px";
      disc.style.top = top + "px";
    };

    /**
     * Set the new owner of the disc.
     * @param newOwner new Player which is now holding the disc.
     */
    setDiscOwner = (newOwner) => {
      if (this.debug) {
        log("Setting new disc owner");
      }
      this.#disc.owner = newOwner;
      this.setDiscOffset(this.#disc.x, this.#disc.y);
    };

    #createDiscDOM = (x, y) => {
      const disc = document.createElement("div");
      disc.id = "ulti-disc";
      disc.style = `left: ${x - this.#disc.size / 2}px; 
                    top: ${y - this.#disc.size / 2}px;
                    height: ${this.#disc.size}px; 
                    width: ${this.#disc.size}px;
                    display: none`;

      this.#rootElement.appendChild(disc);
      return disc;
    };

    #createTooltipsDOM = () => {
      if (this.debug) {
        log("Recreating tooltips");
      }
      // First remove all existing tooltips
      const tooltips = this.#rootElement.querySelectorAll(".ulti-tooltip");
      for (let i = 0; i < tooltips.length; i++) {
        this.#rootElement.removeChild(tooltips[i]);
      }

      // Make a tooltip for each player
      this.players.map((player) => {
        const tooltip = document.createElement("div");
        tooltip.className = "ulti-tooltip";

        if (player.number) {
          const playerNum = document.createElement("span");
          playerNum.className = "ulti-player-number";
          playerNum.innerHTML = player.number ? `<b>#${player.number}</b>` : "";
          playerNum.innerHTML += player.name ? " " : "";
          tooltip.appendChild(playerNum);
        }

        if (player.name) {
          const playerName = document.createElement("span");
          playerName.className = "ulti-player-name";
          playerName.innerText = player.name;
          tooltip.appendChild(playerName);
        }

        this.#rootElement.appendChild(tooltip);

        tooltip.style.left = `${player.x - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${player.y + tooltip.offsetHeight / 2}px`;
        tooltip.style.display = "none";

        player.tooltip = tooltip;
      });
    };

    /**
     * Show all player names and numbers in the form of a tooltip.
     */
    showNames = () => {
      if (this.debug) {
        log("Show player names");
      }
      const tooltips = this.#rootElement.querySelectorAll(".ulti-tooltip");
      for (let i = 0; i < tooltips.length; i++) {
        tooltips[i].style.display = "block";
        setTimeout(() => {
          tooltips[i].style.opacity = 0.7;
        }, 10);
      }

      // Stop hover actions
      const players = this.#rootElement.querySelectorAll(".ulti-player");
      for (let i = 0; i < players.length; i++) {
        players[i].removeEventListener(
          "mouseenter",
          this.#handlePlayerMouseEnter
        );
        players[i].removeEventListener(
          "mouseleave",
          this.#handlePlayerMouseLeave
        );
      }
    };

    /**
     * Hide all player names and numbers tooltips.
     */
    hideNames = () => {
      if (this.debug) {
        log("Hide player names");
      }
      const tooltips = this.#rootElement.querySelectorAll(".ulti-tooltip");
      for (let i = 0; i < tooltips.length; i++) {
        tooltips[i].style.opacity = 0;
        setTimeout(() => {
          tooltips[i].style.display = "none";
        }, 500);
      }

      // Restore hover actions
      const players = this.#rootElement.querySelectorAll(".ulti-player");
      for (let i = 0; i < players.length; i++) {
        players[i].addEventListener("mouseenter", this.#handlePlayerMouseEnter);
        players[i].addEventListener("mouseleave", this.#handlePlayerMouseLeave);
      }
    };

    /**
     * Arrange players and disc into a Vertical Stack.
     * @param defenders whether or not to add the opposite team playing defense.
     */
    vertStack = (defenders = false) => {
      if (this.debug) {
        log("Resetting field to Vertical Stack");
      }

      let handler;

      if (this.#isVerticalField) {
        handler = this.addPlayer("50%", "70%", "Handler");
        const dump = this.addPlayer("75%", "75%", "Dump");
        if (defenders) {
          this.addPlayer(
            handler.x - this.#playerSizePx / 2 - 5,
            handler.y - this.#playerSizePx / 2 - 5,
            "Mark",
            undefined,
            "defense",
            45
          );
          this.addPlayer(
            dump.x - this.#playerSizePx,
            dump.y - this.#playerSizePx / 2 - 5,
            "Defense",
            undefined,
            "defense",
            60
          );
        }

        // Stack
        for (let i = 0; i < 5; i++) {
          this.addPlayer("50%", `${56 - 5 * i}%`, "Stack");
          if (defenders) {
            this.addPlayer(
              "57%",
              `${58 - 6 * i}%`,
              "Defense",
              undefined,
              "defense"
            );
          }
        }
      } else {
        // Horizontal field
        handler = this.addPlayer("70%", "50%", "Handler");
        const dump = this.addPlayer("75%", "75%", "Dump");
        if (defenders) {
          this.addPlayer(
            handler.x - this.#playerSizePx / 2 - 5,
            handler.y - this.#playerSizePx / 2 - 5,
            "Mark",
            undefined,
            "defense",
            45
          );
          this.addPlayer(
            dump.x - this.#playerSizePx,
            dump.y - this.#playerSizePx / 2 - 5,
            "Defense",
            undefined,
            "defense",
            30
          );
        }

        // Stack
        for (let i = 0; i < 5; i++) {
          this.addPlayer(`${56 - 5 * i}%`, "50%", "Stack");
          if (defenders) {
            this.addPlayer(
              `${58 - 6 * i}%`,
              "57%",
              "Defense",
              undefined,
              "defense",
              90
            );
          }
        }
        this.setDiscOffset(-10, 10);
      }

      this.setDiscOwner(handler);
      this.showDisc();
    };

    /**
     * Arrange players and disc into a Horizontal Stack.
     * @param defenders whether or not to add the opposite team playing defense.
     */
    hoStack = (defenders = false) => {
      if (this.debug) {
        log("Resetting field to Horizontal Stack");
      }

      let handler;

      if (this.#isVerticalField) {
        handler = this.addPlayer("50%", "75%", "Main Handler");
        this.addPlayer("75%", "70%", "Handler");
        this.addPlayer("25%", "70%", "Handler");

        // Ho Stack
        const stackDistance = "45%";
        const wing1 = this.addPlayer("10%", stackDistance, "Wing");
        this.addPlayer("30%", stackDistance, "Popper");
        this.addPlayer("70%", stackDistance, "Popper");
        const wing2 = this.addPlayer("90%", stackDistance, "Wing");

        if (defenders) {
          this.addPlayer(
            handler.x + 20,
            handler.y,
            "Cup (Mark)",
            null,
            "defense",
            0
          );
          this.addPlayer(
            handler.x + 25,
            handler.y - 35,
            "Cup",
            null,
            "defense",
            120
          );
          this.addPlayer(
            handler.x - 30,
            handler.y - 35,
            "Cup",
            null,
            "defense",
            60
          );
          this.addPlayer(
            handler.x,
            handler.y - 75,
            "Mid-mid",
            null,
            "defense",
            90
          );
          this.addPlayer(wing1.x, wing1.y - 20, "Wing", null, "defense", 90);
          this.addPlayer(wing2.x, wing2.y - 20, "Wing", null, "defense", 90);
        }
      } else {
        // Horizontal field
        handler = this.addPlayer("75%", "50%", "Main Handler");
        this.addPlayer("70%", "75%", "Handler");
        this.addPlayer("70%", "25%", "Handler");

        // Ho Stack
        const stackDistance = "45%";
        const wing1 = this.addPlayer(stackDistance, "10%", "Wing");
        this.addPlayer(stackDistance, "30%", "Popper");
        this.addPlayer(stackDistance, "70%", "Popper");
        const wing2 = this.addPlayer(stackDistance, "90%", "Wing");

        if (defenders) {
          this.addPlayer(
            handler.x,
            handler.y + 20,
            "Cup (Mark)",
            null,
            "defense",
            90
          );
          this.addPlayer(
            handler.x - 35,
            handler.y + 25,
            "Cup",
            null,
            "defense",
            -30
          );
          this.addPlayer(
            handler.x - 35,
            handler.y - 30,
            "Cup",
            null,
            "defense",
            30
          );
          this.addPlayer(
            handler.x - 75,
            handler.y,
            "Mid-mid",
            null,
            "defense",
            0
          );
          this.addPlayer(wing1.x - 20, wing1.y, "Wing", null, "defense", 0);
          this.addPlayer(wing2.x - 20, wing2.y, "Wing", null, "defense", 0);
        }
        this.setDiscOffset(-10, 10);
      }

      this.setDiscOwner(handler);
      this.showDisc();
    };
  }

  class Player {
    constructor(id, x, y, name, jerseyNumber, type, rotation) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.name = name;
      this.number = jerseyNumber;
      this.type = type;
      this.rotation = rotation;
    }

    setUpdateCallbacks = (updateDisc, updateTooltips) => {
      this.updateDisc = updateDisc;
      this.updateTooltips = updateTooltips;
    };

    // Adapted from https://javascript.info/mouse-drag-and-drop
    onmousedown = (event) => {
      const div = event.target;
      const divBox = div.getBoundingClientRect();
      const oldTransition = div.style.transition;
      div.style.transition = "none";
      const field = div.parentNode;

      div.ondragstart = () => {
        return false;
      };

      let shiftX = event.clientX - divBox.left;
      let shiftY = event.clientY - divBox.top;

      const moveAt = (pageX, pageY) => {
        let left = pageX - shiftX - field.offsetLeft;
        let top = pageY - shiftY - field.offsetTop;
        left = clip(
          left,
          0,
          field.offsetWidth - div.offsetWidth - 2 * borderWidth
        );
        top = clip(
          top,
          0,
          field.offsetHeight - div.offsetHeight - 2 * borderWidth
        );

        div.style.left = left + "px";
        div.style.top = top + "px";

        this.x = left + div.offsetWidth / 2;
        this.y = top + div.offsetHeight / 2;
      };

      moveAt(event.pageX, event.pageY);

      const onmousemove = (event) => {
        moveAt(event.pageX, event.pageY);
        // https://stackoverflow.com/questions/29908261/prevent-text-selection-on-mouse-drag#29908832
        if (document.selection) {
          document.selection.empty();
        } else {
          window.getSelection().removeAllRanges();
        }
        this.updateDisc();
      };

      const onmouseup = () => {
        document.removeEventListener("mousemove", onmousemove);
        document.removeEventListener("mouseup", onmouseup);
        div.style.transition = oldTransition;
        this.updateTooltips();
      };

      document.addEventListener("mousemove", onmousemove);
      document.addEventListener("mouseup", onmouseup);
    };
  }

  const clip = (num, min, max) => Math.max(Math.min(num, max), min);

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

    // Adapted from https://javascript.info/mouse-drag-and-drop
    onmousedown = (event) => {
      const div = event.target;
      const divBox = div.getBoundingClientRect();
      const oldTransition = div.style.transition;
      div.style.transition = "none";
      const field = div.parentNode;

      div.ondragstart = () => {
        return false;
      };

      let shiftX = event.clientX - divBox.left;
      let shiftY = event.clientY - divBox.top;

      const moveAt = (pageX, pageY) => {
        let left = pageX - shiftX - field.offsetLeft;
        let top = pageY - shiftY - field.offsetTop;
        left = clip(left, 0, field.offsetWidth - this.size - 2 * borderWidth);
        top = clip(top, 0, field.offsetHeight - this.size - 2 * borderWidth);

        div.style.left = left + "px";
        div.style.top = top + "px";

        this.x = left + this.size / 2;
        this.y = top + this.size / 2;
        if (this.owner) {
          this.x -= this.owner.x;
          this.y -= this.owner.y;
        }
      };

      moveAt(event.pageX, event.pageY);

      const onmousemove = (event) => {
        moveAt(event.pageX, event.pageY);
        // https://stackoverflow.com/questions/29908261/prevent-text-selection-on-mouse-drag#29908832
        if (document.selection) {
          document.selection.empty();
        } else {
          window.getSelection().removeAllRanges();
        }
      };

      const onmouseup = () => {
        document.removeEventListener("mousemove", onmousemove);
        document.removeEventListener("mouseup", onmouseup);
        div.style.transition = oldTransition;
      };

      document.addEventListener("mousemove", onmousemove);
      document.addEventListener("mouseup", onmouseup);
    };

    coords = () => {
      return this.owner
        ? [this.owner.x + this.x, this.owner.y + this.y]
        : [this.x, this.y];
    };
  }

  global.UltiBoard = global.UltiBoard || UltiBoard;
})(window, window.document);
