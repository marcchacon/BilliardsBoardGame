/**
 * @file uiListeners.js
 * This file contains event listeners for the UI elements in the game.
 */

var settingsDiv = document.getElementById('custom_vsCPU_settings');

document.getElementById("reset").addEventListener("click", function () { resetBoard(true); });

document.getElementById("CPU").addEventListener("click", function () {
    this.disabled = true;
    document.getElementById("2P").disabled = false;
    document.getElementById("custom_vsCPU").disabled = false
    settingsDiv.style.display = 'none';

    //return AI parameters to default
    initialiseCpuParameters();

    CPU = true;
    if (turn[0] == "P2") {
        CPUturn();
    }
});
document.getElementById("2P").addEventListener("click", function () {
    CPU = false;
    this.disabled = true;
    document.getElementById("CPU").disabled = false;
    document.getElementById("custom_vsCPU").disabled = false;
    settingsDiv.style.display = 'none';
});

document.getElementById('custom_vsCPU').addEventListener('click', function () {
    this.disabled = true;
    settingsDiv.style.display = 'block';
    document.getElementById("2P").disabled = false;
    document.getElementById("CPU").disabled = false;

    CPU = true;
    if (turn[0] == "P2") {
        CPUturn();
    }
});

// Add event listeners to update AI parameters when inputs change
document.getElementById("tree_depth").addEventListener("change", function () {
    tree_depth = parseInt(document.getElementById("tree_depth").value);
    var cautionMessage = document.getElementById('caution_message');
    if (tree_depth > 5) {
        cautionMessage.style.display = 'inline';
    } else {
        cautionMessage.style.display = 'none';
    }
});
document.getElementById("lose_points").addEventListener("change", function () { lose_points = parseInt(document.getElementById("lose_points").value); });
document.getElementById("win_points").addEventListener("change", function () { win_points = parseInt(document.getElementById("win_points").value); });
document.getElementById("CPU_blocking_points").addEventListener("change", function () { CPU_blocking_points = parseInt(document.getElementById("CPU_blocking_points").value); });
document.getElementById("P1_winning_points_multiplier").addEventListener("change", function () { P1_winning_points_multiplier = parseInt(document.getElementById("P1_winning_points_multiplier").value); });
document.getElementById("P1_no_blocking_points").addEventListener("change", function () { P1_no_blocking_points = parseInt(document.getElementById("P1_no_blocking_points").value); });