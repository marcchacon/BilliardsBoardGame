/**
 * The directions a piece can move
 * @type {Array}
 */
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

/**
 * Turn rotation
 * @type {Array}
 */
var turn = ["P1", "P2"];

/**
 * Array of the locations a piece can move to
 * 
 * This is set when the player clicks on a piece. Works with {@link bindMovePiece} as its the locations the piece can move to
 * @type {Array}
 */
var bindMoveLocs;

/**
 * The piece that is being moved, as an HTML element
 * 
 * This normally is set when the player clicks on a piece. Works with {@link bindMoveLocs} as its the pice that is selected
 * @type {HTMLElement}
 */
var bindMovePiece;

/**
 * If the game has started
 * @type {boolean}
 */
var started;

/**
 * If someone has won
 * @type {boolean}
 */
var win;

/**
 * If the game is against the CPU
 */
let CPU = false;

/**
 * If it's CPU vs CPU
 * @type {boolean}
 */
let CPUvsCPU = false;

/**
 * The P1 pieces, as a list of [piece, location]
 * @type {Array}
 * @example [[piece1, [0, 0]], [piece2, [0, 1]], ...]
 */
var P1 = [];

/**
 * The P2 pieces, as a list of [piece, location]
 * @type {Array}
 * @example [[piece1, [0, 0]], [piece2, [0, 1]], ...]
 */
var P2 = [];


/**
 * The depth of the minimax tree
 * @type {number}
 */
let tree_depth;

/**
 * The points for losing
 * @type {number}
 */
let lose_points;

/**
 * The points for winning
 * @type {number}
 */
let win_points;

/**
 * If the CPU has some pieces blocking the player winning, add points
 * @type {number}
 */
let CPU_blocking_points;

/**
 * If the player has some pieces on the winning place and the CPU is not blocking,
 * remove points: P1_winning_points_multiplier * number of pieces
 * @type {number}
 */
let P1_winning_points_multiplier;

/**
 * If the player has no pieces blocking the CPU winning, add points
 * @type {number}
 */
let P1_no_blocking_points;
