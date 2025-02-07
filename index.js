/**
 * @file index.js
 * This file contains the main logic of the game.
 */


/**
 * Show the possible moves of a piece
 * 
 * This funcion is called when a piece is clicked
 * @param {HTMLElement} piece the piece clicked.
 */
function showMoves(piece) {
    //console.log(b.cell(piece.parentNode).get())

    if (win) return

    // check if it's the turn of the piece
    if (b.cell(piece.parentNode).get() != turn[0]) {
        alert(`Not your turn! It's ${turn[0]}'s turn!`)
        return
    }

    resetBoard()

    // the piece itself doesn't have the location, so we need to get it from the cell (parentNode)
    var loc = getPieceLocation(piece);
    console.log(piece);   
    var newLocs = getMoves(loc);

    // remove illegal moves by checking 
    // content of b.cell().get()
    var fixedLocs = [];
    for (var i = 0; i < newLocs.length; i++){
        if (b.cell(newLocs[i]).get() == null) {
            fixedLocs.push(newLocs[i]);
        }
    }

    // bind spaces to movement of piece
    bindMoveLocs = fixedLocs.slice();
    bindMovePiece = piece;
    bindMoveEvents(bindMoveLocs);


}

/**
 * Creates the listeners and shows the possible moves
 * 
 * @param {Array} locs an array of locations to bind the events to
 * @example bindMoveEvents([[0, 1], [0, 2], [0, 3]])
 */
function bindMoveEvents(locs) {
    for (var i = 0; i < locs.length; i++) {
        switch (turn[0]) {
            case "P1":
                b.cell(locs[i]).DOM().classList.add("red");
                break;
            case "P2":
                b.cell(locs[i]).DOM().classList.add("blue");
                break;
        }
        b.cell(locs[i]).on("click", movePiece);
    }
}

/**
 * Move the piece to the clicked location. The piece moved is the one in {@link bindMovePiece}
 * 
 * This function is called when a possible move cell is clicked. If want to move any piece to any cell, refer to {@link movePieceCPU()}
 * @return {void}
 */
function movePiece() {
    started = true;
    
    var userClick = b.cell(this).where();
    if (bindMoveLocs.indexOf(userClick)) {
        b.cell(userClick).place(bindMovePiece);

        resetBoard();
        updateTurn();

        var otherPieces = turn[0] === "P1" ? P1 : P2;
        var hasMoves = otherPieces.some(piece => {
            var loc = getPieceLocation(piece);
            var moves = getMoves(loc);
            return moves.length > 0;
        });

        if (!hasMoves) {
            alert(`No moves available for any piece! ${turn[0]} skips turn!`);
            updateTurn();
        }

        winCheck();

        if (!win && CPU && turn[0] == "P2") {
            setTimeout(() => {
                CPUturn();
            }, 200);
        }
    }
}

/**
 * Reset the board by removing all green cells and
 * removing all click events.
 * If hard is true, also resets the game
 * 
 * @param {boolean} hard If true, also resets the game
 * @return {void}
 */
function resetBoard(hard = false) {

    if (started && !win && hard) {
        var text = "Do you really want to restart the game?";
        if (!confirm(text)) return
    }

    // remove all coloring from cells and click events
    for (var r = 0; r < b.rows(); r++) {
        for (var c = 0; c < b.cols(); c++) {
            b.cell([r, c]).DOM().classList.remove("green");
            b.cell([r, c]).DOM().classList.remove("blue");
            b.cell([r, c]).DOM().classList.remove("red");
            b.cell([r, c]).removeOn("click", movePiece);

            // remove pieces if hard reset
            if (hard) b.cell([r, c]).rid();

            b.cell([0, c]).style({ background: "pink" });
            b.cell([b.rows() - 1, c]).style({ background: "lightblue" });
        }
    }

    if (hard) {

        // reset game state
        started = false;
        win = false;

        //put pieces in place
        P1 = [];
        P2 = [];

        for (let i = 0; i < b.cols(); i++) {

            P1.push(player1.clone());
            P2.push(player2.clone());

            b.cell([b.rows() - 1, i]).place(P1[i]);
            b.cell([0, i]).place(P2[i]);

            P1[i].addEventListener("click", function () { showMoves(this); });
            P2[i].addEventListener("click", function () { showMoves(this); });
        }

        // variables for turns, piece to move and its locs
        turn = ["P1", "P2"];
    }
}

/**
 * Aux function to get the gameboard. Parses the board matrix to remove nulls
 * 
 * 
 * @returns {Array} Gameboard, 0 = empty, 1 = P1, 2 = P2
 */
function getGameboard() {

    b.matrix().forEach((row, index) => {
        row.forEach((col, index2) => {
            switch (col) {
                case null:
                    game[index][index2] = "0";
                    break;
                case "P1":
                    game[index][index2] = "1";
                    break;
                case "P2":
                    game[index][index2] = "2";
                    break;
            }
        });
    });

    //console.log("GAMEBOARD DONE: " + game)

    return game
}
/**
 *  Get pieces possible moves
 * 
 * @param {Array} piece Piece position
 * @param {Array} game Gameboard, default current gameboard
 * @returns {Array} Possible moves, empty if no moves
 */
function getMoves(piece, game = getGameboard()) {

    var moves = []

    directions.forEach((dir) => {
        var newpos = piece

        // First part of the move
        while (Array.isArray(game[newpos[0] + dir[0]])) {

            //console.log("1a: seguent casella: " + (game[newpos[0] + dir[0]][newpos[1] + dir[1]]) + "  pot avançar?  " + (game[newpos[0] + dir[0]][newpos[1] + dir[1]] === "0"))

            if (game[newpos[0] + dir[0]][newpos[1] + dir[1]] === "0") {
                newpos = [newpos[0] + dir[0], newpos[1] + dir[1]];
            } else break

        }
        if (newpos == piece) return;

        let newpostemp = newpos;

        // Second part of the move: Turn 90 degrees right
        // To calculate this I do: [x, y] => [y, -x]
        while (Array.isArray(game[newpos[0] + dir[1]])) {

            //console.log("2a: seguent casella: " + (game[newpos[0] + dir[1]][newpos[1] - dir[0]]) + "  pot avançar?  " + (game[newpos[0] + dir[1]][newpos[1] - dir[0]] === "0"))

            if (game[newpos[0] + dir[1]][newpos[1] - dir[0]] === "0") {
                newpos = [newpos[0] + dir[1], newpos[1] - dir[0]];
            } else break

        }
        // The piece must move at least one square after the turn
        if (newpos != newpostemp) moves.push(newpos);
        
        
        //Last part of the move: Turn 90 degrees left
        // To calculate this I do: [x, y] => [-y, x]

        //Goes back to the turning position to turn left
        newpos = newpostemp;
        
        while (Array.isArray(game[newpos[0] - dir[1]])) {

            //console.log("3a: seguent casella: " + (game[newpos[0] - dir[1]][newpos[1] + dir[0]]) + "  pot avançar?  " + (game[newpos[0] - dir[1]][newpos[1] + dir[0]] === "0"))

            if (game[newpos[0] - dir[1]][newpos[1] + dir[0]] === "0") {
                newpos = [newpos[0] - dir[1], newpos[1] + dir[0]];
            } else break

        }
        // The piece must move at least one square after the turn
        if (newpos != newpostemp) moves.push(newpos);    

    });

    return moves
}

/**
 * Check if someone has won
 */
function winCheck() {
    var game = getGameboard()
    // /^(.)\1{1,}$/g means that it will match any string that has only one character (no matter if its repeated)
    // we use it instead of checking if its 111 or 222 because maybe in the future there can be bigger boards
    if (game[0].join("").match(/^(1)\1{1,}$/g)) {
        win = true
        alert(`P1 WINS!`);
        document.getElementById("turn").innerHTML = `P1 WINS`;
    } else if (game[b.rows() - 1].join("").match(/^(2)\1{1,}$/g)) {
        win = true
        alert("P2 WINS!");
        document.getElementById("turn").innerHTML = "P2 WINS";
    }
}
/**
 * Init table to an Empty table
 * @param {number} sizex Number of columns
 * @param {number} sizey Number of rows
 */
function initTable(sizex = 4, sizey = 3) {
    var table = document.getElementById("game");
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }

    b = jsboard.board({ attach: "game", size: `${sizex}x${sizey}` });
    b.cell("each").style({ width: "65px", height: "65px" });
    started = false;
    resetBoard(true);
}

/**
 * Function to update the turn
 * It will update the turn array and the turn text
 */
function updateTurn(){
    var temp = turn.shift();
    turn.push(temp);

    //Update turn text
    switch (turn[0]) {
        case "P1":
            document.getElementById("turn").innerHTML = `It's P1 turn to move`
            break;
        case "P2":
            document.getElementById("turn").innerHTML = `It's P2 turn to move`;
            break;
    }
}

/**
 * Returns the piece location
 * @param {HTMLElement} piece Piece to get location
 * @returns {Array} Location of the piece
 */
function getPieceLocation(piece){
    return b.cell(piece.parentNode).where()
}

//Start of the game
initialiseCpuParameters();
initTable(); 