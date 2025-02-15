/**
 * @file cpu.js
 * This file contains the CPU logic of the game.
 */

/**
 * Initialises the CPU parameters to default values
 * 
 * IF YOU WANT TO CHANGE THE CPU DEFAULT PARAMETERS, DO IT IN THIS FUNCTION
 */
function initialiseCpuParameters() {
    tree_depth = 6;
    lose_points = -100;
    win_points = 200;
    CPU_blocking_points = 2;
    P1_winning_points_multiplier = 1.5;
    P1_no_blocking_points = 3;
}

/**
 * CPU turn function
 */
function CPUturn(cpu = true) {
    var game = getGameboard();
    var gameTree = new MoveNode(null, game);
    gameTree.selections = CreateTree(gameTree.selections, game, cpu);
    var CPUMove;
    var bestMove = [];
    
    //console.log("tree:", gameTree);
    var CPUMove = gameTree.calculateBestSelection(!cpu);
    //console.log("points:", gameTree.getPoints());

    if (CPUMove == undefined || CPUMove.getBestMove() == null) {
        if (!CPUvsCPU) alert(`No moves available! I skip the turn!`);
        updateTurn()
        return;
    }
    bestMove[0] = CPUMove.getSelection();
    bestMove[1] = CPUMove.getBestMove().getMove();

    //console.log("tree:", gameTree);
    //console.log("bestMove:", bestMove);

    movePieceCPU(bestMove[0], bestMove[1]);
    updateTurn()

    game = null;
    gameTree = null;
    CPUMove = null;
    bestMove = null;
}

/**
 * Creates tree using Classes
 * Minimax algorithm
 * @param {Object} tree The MoveNode.selection object
 * @param {Array} game GameBoard 
 * @param {Boolean} turnCPU If it's the CPU turn
 * @param {*} depth Depth of the tree. Default 0
 * @param {*} maxdepth Max depth the tree may have. Default 4
 * @returns a tree with all possible moves. ONLY THE FINAL DEPTH HAS POINTS
 */
function CreateTree (tree, game, turnCPU = true, depth = 0, maxdepth = tree_depth, alpha = -Infinity, beta = Infinity) {
    if (depth >= maxdepth) return {};

    //Get all pieces locations, depending on the turn
    var locs = getPicecesLocs(game)[turnCPU ? 1 : 0];

    //For each piece, create a SelectionNode to simulate the "what if I decide to move this piece?"
    locs.forEach((FirstLoc, index) => {
        //Get all possible moves for the piece
        var posMoves = getMoves(FirstLoc, game);
        if (posMoves.length == 0) return;

        var LocNode = new SelectionNode(FirstLoc, game, turnCPU);
        tree[`Selection-${depth}.${index}`] = LocNode;

        //For each possible move, create a MoveNode to simulate the "what if I decide to move this piece to this location?"
        posMoves.forEach((FirstMove) => {

            //Create a new gameboard with the new move
            let newgameD1 = JSON.parse(JSON.stringify(game));
            newgameD1[FirstLoc[0]][FirstLoc[1]] = "0";
            newgameD1[FirstMove[0]][FirstMove[1]] = turnCPU ? "2" : "1";

            //Create a new MoveNode
            var MovNode = new MoveNode(FirstMove, newgameD1, LocNode);
            LocNode.addMove(MovNode, depth);

            //Check if someone has won
            switch (winCheckCPU(newgameD1)) {
                case "P1":
                    MovNode.setPoints(lose_points + depth);
                    //console.log(`P1 wins at depth ${depth}, setting points to ${MovNode.getPoints()} (${-100 + depth})`);
                    break;
                case "CPU":
                    MovNode.setPoints(win_points - depth);
                    //console.log(`CPU wins at depth ${depth}, setting points to ${MovNode.getPoints()} (${200 - depth})`);
                    break;
                default:
                    //If no one has won, create a new tree with the new gameboard
                    MovNode.selections = CreateTree(MovNode.selections, newgameD1, !turnCPU, depth + 1, maxdepth, alpha, beta);

                    //If it's the last depth, calculate the points
                    if (Object.keys(MovNode.selections).length == 0) {
                        let finalpoints = 5;

                        //If the CPU has some pieces blocking the player winning, add points
                        if (newgameD1[0].filter((v) => (v === "2")).length > 0) {
                            finalpoints += CPU_blocking_points;
                        } else {
                            //If the player has some pieces on the winning place and the CPU is not blocking, remove points
                            finalpoints -= newgameD1[0].filter((v) => (v === "1")).length * P1_winning_points_multiplier;
                        }

                        //If the player has no pieces blocking the CPU winning, add points
                        if (newgameD1[b.rows() - 1].filter((v) => (v === "1")).length == 0) finalpoints += P1_no_blocking_points;


                        MovNode.setPoints(finalpoints);
                        //console.log(`Setting final points at depth ${depth} to ${finalpoints}`);

                        
                    } 
                    break;
            }

            if (turnCPU) {
                alpha = Math.max(alpha, MovNode.getPoints());
                if (beta <= alpha) {
                    return;
                }
            } else {
                beta = Math.min(beta, MovNode.getPoints());
                if (beta <= alpha) {
                    return;
                }
            }
            // Nullify references to help garbage collection
            newgameD1 = null;
            MovNode = null;
        });

        // Nullify references to help garbage collection
        LocNode = null;
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
 * 
 * @example movePieceCPU([0, 0], [1, 1])
 */
function movePieceCPU(pieceOrigin, loc) {
    started = true;
    switch (b.cell(pieceOrigin).get()) {
        case "P1":
            var piece = P1.find(temp => getPieceLocation(temp).toString() == pieceOrigin.toString())
            break;
        case "P2":
            var piece = P2.find(temp => getPieceLocation(temp).toString() == pieceOrigin.toString())
            break;
        default:
            return;
    }
    b.cell(loc).place(piece);

    resetBoard();
    winCheck();
}