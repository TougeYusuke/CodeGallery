document.addEventListener("DOMContentLoaded", function() {
    const gameBoard = document.querySelector(".game-board");
    let currentPlayer = "○";
    let moves = 0;
    const cells = [];

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.addEventListener("click", cellClicked);
        gameBoard.appendChild(cell);
        cells.push(cell);
    }

    function cellClicked(e) {
        if (e.target.textContent === "") {
            e.target.textContent = currentPlayer;
            moves++;
            if (checkWin()) {
                setTimeout(() => alert(currentPlayer + "の勝ち！"), 10);
                resetGame();
            } else if (moves === 9) {
                setTimeout(() => alert("引き分け！"), 10);
                resetGame();
            } else {
                currentPlayer = currentPlayer === "○" ? "×" : "○";
            }
        }
    }

    function checkWin() {
        const winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let combo of winningCombos) {
            if (cells[combo[0]].textContent && cells[combo[0]].textContent === cells[combo[1]].textContent && cells[combo[0]].textContent === cells[combo[2]].textContent) {
                return true;
            }
        }
        return false;
    }

    window.resetGame = function() {
        currentPlayer = "○";
        moves = 0;
        cells.forEach(cell => cell.textContent = "");
    }
});
