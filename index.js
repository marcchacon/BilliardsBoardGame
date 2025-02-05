// The directions a piece can move
const directions = [
    [-1, -1], // adalt esquerra
    [-1, 0], // adalt
    [-1, 1], // adalt dreta
    [0, -1], // esquerra
    [0, 1], // dreta
    [1, -1], // abaix esquerra
    [1, 0], // abaix
    [1, 1], // abaix dreta
];


// setup pieces
var player1 = jsboard.piece({ text: "P1", textIndent: "-9999px", background: "#E63D30", width: "60px", height: "60px", margin: "0 auto", "border-radius": "50%" });
var player2 = jsboard.piece({ text: "P2", textIndent: "-9999px", background: "#3038E6", width: "60px", height: "60px", margin: "0 auto", "border-radius": "50%" });

// variables for turns, piece to move and its locs
var turn = ["P1", "P2"];
var bindMoveLocs, bindMovePiece;
var gamemode, started, win, CPU = false;
var P1, P2 = [];
// show new locations 
function showMoves(piece) {
    //console.log(b.cell(piece.parentNode).get())

    // check if game has ended
    if (win) return

    // check if it's the turn of the piece
    if (b.cell(piece.parentNode).get() != turn[0]) {
        alert(`Not your turn! It's ${turn[0]}'s turn!`)
        return
    }

    resetBoard()

    // parentNode is needed because the piece you are clicking 
    // on doesn't have access to cell functions, therefore you 
    // need to access the parent of the piece because pieces are 
    // always contained within in cells
    var loc = b.cell(piece.parentNode).where();
    var newLocs = getMoves(loc);

    // remove illegal moves by checking 
    // content of b.cell().get()
    (function removeIllegalMoves(arr) {
        var fixedLocs = [];
        for (var i = 0; i < arr.length; i++)
            if (b.cell(arr[i]).get() == null)
                fixedLocs.push(arr[i]);
        newLocs = fixedLocs;
    })(newLocs);
    if (newLocs.length == 0 && turn[0] == "CO") {
        alert(`No moves available! ${turn.pop()} wins!`);
        win = true;
    }

    // bind green spaces to movement of piece
    bindMoveLocs = newLocs.slice();
    bindMovePiece = piece;
    bindMoveEvents(bindMoveLocs);


}

/**
 * Creates the listeners and shows the possible moves
 * 
 * @param {Array} locs Possible moves
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
 * Move the piece to the clicked location
 * 
 * @return {void}
 */
function movePiece() {
    started = true;
    var userClick = b.cell(this).where();
    if (bindMoveLocs.indexOf(userClick)) {
        b.cell(userClick).place(bindMovePiece);
        switch (turn[0]) {
            case "P1":
                P1.find(piece => piece[0] == bindMovePiece)[1] = userClick;
                break;
            case "P2":
                P2.find(piece => piece[0] == bindMovePiece)[1] = userClick;
                break;
        }

        resetBoard();

        //Update turn
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

        winCheck();

        //TODO: implement a way to do CPU vs CPU
        if (!win && CPU && turn[0] == "P2") {
            CPUturn();
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
        CO = [];

        for (let i = 0; i < b.cols(); i++) {

            P1.push([player1.clone(), [b.rows() - 1, i]]);
            P2.push([player2.clone(), [0, i]]);

            b.cell(P1[i][1]).place(P1[i][0]);
            b.cell(P2[i][1]).place(P2[i][0]);

            P1[i][0].addEventListener("click", function () { showMoves(this); });
            P2[i][0].addEventListener("click", function () { showMoves(this); });
        }

        // variables for turns, piece to move and its locs
        turn = ["P1", "P2"];
    }
}

/**
 * Aux function to get the gameboard
 * 
 * @returns {Array} Gameboard, 0 = empty, 1 = P1, 2 = P2
 */
function getGameboard() {

    game = b.matrix()

    game.forEach((row, index) => {
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
 * If gamemode is true, P1 wins if he reaches the P2 side
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


//Listeners for UI buttons
document.getElementById("reset").addEventListener("click", function () { resetBoard(true); });

document.getElementById("CPU").addEventListener("click", function () {
    CPU = true;
    this.disabled = true;
    document.getElementById("2P").disabled = false;
});
document.getElementById("2P").addEventListener("click", function () {
    CPU = false;
    this.disabled = true;
    document.getElementById("CPU").disabled = false;
});
// create board
initTable();  // 5x5 board

/**
 * Current CPU turn function
 */
function CPUturn() {
    var game = getGameboard();
    var gameTree = new MoveNode(null, game);
    gameTree.selections = CreateTree(gameTree.selections, game);
    var CPUMove;
    var bestMove = [];
    
    console.log("tree:", gameTree);
    var CPUMove = gameTree.calculateBestSelection();
    console.log("points:", gameTree.getPoints());

    if (CPUMove == undefined || CPUMove.getBestMove() == null) {
        alert(`No moves available! ${turn.pop()} wins!`);
        win = true;
        return;
    }
    bestMove[0] = CPUMove.getSelection();
    bestMove[1] = CPUMove.getBestMove().getMove();

    console.log("tree:", gameTree);
    console.log("bestMove:", bestMove);

    //Wait half a second to move the piece
    setTimeout(() => {
        movePieceCPU(bestMove[0], bestMove[1]);
    }, 200);

    // Ara gameTree conté l'arbre de joc amb les puntuacions per a cada estat del joc.
    // Pots utilitzar aquest arbre per a seleccionar el millor moviment.
}


/**
 * Creates tree using Classes
 * Minimax algorithm
 * @param {Object} tree The MoveNode.selection object
 * @param {Array} game GameBoard 
 * @param {Boolean} turnCPU If it's the CPU turn
 * @param {*} depth Depth of the tree. Default 4
 * @param {*} maxdepth Depth of the original tree. Default 4
 * @returns a tree with all possible moves. ONLY THE FINAL DEPTH HAS POINTS
 */
function CreateTree (tree, game, turnCPU = true, depth = 10, maxdepth = 10) {
    if (depth == 0) return {};

    //Get all pieces locations, depending on the turn
    var locs = getPicecesLocs(game)[turnCPU ? 1 : 0];

    //For each piece, create a SelectionNode to simulate the "what if I decide to move this piece?"
    locs.forEach((FirstLoc, index) => {
        var LocNode = new SelectionNode(FirstLoc, game, turnCPU);
        tree[`Selection-${index}`] = LocNode;

        //Get all possible moves for the piece
        var posMoves = getMoves(FirstLoc, game);

        //For each possible move, create a MoveNode to simulate the "what if I decide to move this piece to this location?"
        posMoves.forEach((FirstMove) => {

            //Create a new gameboard with the new move
            var newgameD1 = game.map(arr => [...arr]);
            newgameD1[FirstLoc[0]][FirstLoc[1]] = "0";
            newgameD1[FirstMove[0]][FirstMove[1]] = turnCPU[0];

            //Create a new MoveNode
            var MovNode = new MoveNode(FirstMove, newgameD1, LocNode);
            LocNode.addMove(MovNode);

            //Check if someone has won
            switch (winCheckCPU(newgameD1)) {
                case "P1":
                    MovNode.setPoints(-100 + (maxdepth - depth));
                    break;
                case "CPU":
                    MovNode.setPoints(200 - (maxdepth - depth));
                    break;
                default:
                    //If no one has won, create a new tree with the new gameboard
                    MovNode.selections = CreateTree(MovNode.selections, newgameD1, !turnCPU, depth - 1, maxdepth);

                    //If it's the last depth, calculate the points
                    if (Object.keys(MovNode.selections).length == 0) {
                        let finalpoints = 5;

                        //If the CPU has some pieces blocking the player winning, add points
                        if (newgameD1[0].filter((v) => (v === "2")).length > 0) {
                            finalpoints += 2;
                        } else {
                            //If the player has some pieces on the winning place and the CPU is not blocking, remove points
                            finalpoints -= newgameD1[0].filter((v) => (v === "1")).length * 1.5;
                        }

                        //If the player has no pieces blocking the CPU winning, add points
                        if (newgameD1[b.rows() - 1].filter((v) => (v === "1")).length == 0) finalpoints += 3;


                        MovNode.setPoints(finalpoints); //TODO: Analize the escenario
                    } 
                    break;
            }
            
        })
    })
    return tree;
    
}

function getPicecesLocs(board = getGameboard()) {
    var P1locs = []
    var P2locs = []

    board.forEach((row, index) => {
        row.forEach((col, index2) => {
            switch (col) {
                case "1":
                    P1locs.push([index, index2]);
                    break;
                case "2":
                    P2locs.push([index, index2]);
                    break;
            }
        });
    });

    return [P1locs, P2locs]
}

/**
 * Aux function for CPU to check if someone has won
 * 
*/
function winCheckCPU(game) {
    if (game[0].join("").match(/^(1)\1{1,}$/g)) {
        return "P1"
    } else if (game[b.rows() - 1].join("").match(/^(2)\1{1,}$/g)) {
        return "CPU"
    }
    return false
}

/**
 * Aux function for CPU to move the pieces
 * 
 * @param {Array} pieceOrigin Piece position
 * @param {Array} loc New location
 * @return {void}
 */
function movePieceCPU(pieceOrigin, loc) {
    started = true;
    var pieceValue = b.cell(pieceOrigin).get();
    switch (pieceValue) {
        case "P1":
            var piece = P1.find(temp => temp[1].toString() == pieceOrigin.toString())
            break;
        case "P2":
            var piece = P2.find(temp => temp[1].toString() == pieceOrigin.toString())
            break;
        case "CO":
            var piece = CO.find(temp => temp[1].toString() == pieceOrigin.toString())
            break;
        default:
            return;
    }
    piece[1] = loc;
    b.cell(loc).place(piece[0]);
    resetBoard();

    //Update turn
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
        case "CO":
            document.getElementById("turn").innerHTML = `It's common piece turn (${turn[1]})`;
            break;
    }

    winCheck();

}