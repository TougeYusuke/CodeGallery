// 現在のプレイヤーを表す変数（'○' または '×'）
let currentPlayer = '○';

// ゲームの状態を示す変数
let gameActive = true;

// 終了フラグ
let gameEnd = false;

// ゲームボードの状態を保存する配列
let gameState = ['', '', '', '', '', '', '', '', ''];

// CPUとの対戦を示すフラグ
let vsCPU = true;

// 勝者のメッセージを返す関数
const winningMessage = () => `${currentPlayer} の勝ち！`;

// 引き分けのメッセージを返す関数
const drawMessage = () => `引き分け！`;

// セルがクリックされたときの処理
function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    
    if (vsCPU && currentPlayer === '○' && gameActive) {
        handleResultValidation();
        if(!gameEnd){
            cpuPlay();
        }
    } else {
        handleResultValidation();
    }
}

// ゲームの結果を確認する関数
function handleResultValidation() {
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
        [0, 4, 8], [2, 4, 6]              // Diagonals
    ];

    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        gameEnd = true;
        setTimeout(() => {
            alert(winningMessage());
            resetGame();
        }, 100);
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        gameEnd = true;
        setTimeout(() => {
            alert(drawMessage());
            resetGame();
        }, 100);
        return;
    }

    currentPlayer = currentPlayer === '○' ? '×' : '○';
}

// CPUのプレイを制御する関数
function cpuPlay() {
    const availableCells = gameState.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);
    const randomCellIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    const clickedCell = document.querySelectorAll('.cell')[randomCellIndex];

    gameState[randomCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;

    handleResultValidation();
}

// ゲームをリセットする関数
function resetGame() {
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    gameEnd = false;
    currentPlayer = '○';
    document.querySelectorAll('.cell').forEach(cell => cell.innerHTML = '');
}

// 各セルのクリックイベントリスナーを追加
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));

// リセットボタンのクリックイベントリスナーを追加
document.querySelector('button').addEventListener('click', resetGame);
