//================
//#region 変数

// ゲームの現在のステートを保持する変数
let currentState;

// 現在のプレイヤーを示す変数
let currentPlayer = '○'; 

// 現在のAIの難易度を示す変数
let currentDifficulty = 'medium'; 

// ゲームボードの状態を保持する配列
let boardState = ["", "", "", "", "", "", "", "", ""];

// 勝者
let resultWinner;

// 勝利条件の組み合わせ
const winningCombinations = [
    [0, 1, 2], // 上の行
    [3, 4, 5], // 中央の行
    [6, 7, 8], // 下の行
    [0, 3, 6], // 左の列
    [1, 4, 7], // 中央の列
    [2, 5, 8], // 右の列
    [0, 4, 8], // 左上から右下の対角線
    [2, 4, 6]  // 右上から左下の対角線
];

//#endregion

//================
//#region メソッド

// マスをクリックしたときの処理
function onCellClicked(event) {

    // ゲームが終了している場合は反応させない.
    if (!isCurrentState(gameState)) {
       return;
    }
    
    const cellIndex = event.target.getAttribute('data-cell-index');
    if (boardState[cellIndex] === "" && currentPlayer === '○') {
        boardState[cellIndex] = currentPlayer;
        event.target.innerHTML = currentPlayer;

        gameState.isTurnEnd = true;  // ターン終了フラグを設定
    }
}

// 引き分けをチェックする関数
function isDraw(board) {
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === "") {
            return false;  // まだ空きセルがある場合
        }
    }
    return true;  // 全てのセルが埋まっている場合
}

// 各マスにクリックイベントリスナを追加
const cells = document.querySelectorAll("[data-cell-index]");
cells.forEach(cell => {
    cell.addEventListener('click', onCellClicked);
});

//#endregion

//================
//#region CPUのAI

// CPUがランダムにマスを選ぶ関数
function easyAI(board) {
    const availableCells = board.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}

// CPUが勝利できるマスを選ぶ、またはランダムに選ぶ関数
function normalAI(board) {
    const availableCells = board.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);

    let cellIndex = 0;

    // 自身がリーチしているセルをチェック
    const selfReachCell = getReachCell(boardState, "×");
    if (selfReachCell !== null) {
        cellIndex = selfReachCell;
        return cellIndex;
    }

    // 相手がリーチしているセルをチェック
    const opponentReachCell = getReachCell(boardState, "○");
    if (opponentReachCell !== null) {
        cellIndex = opponentReachCell;
        return cellIndex;
    }

    // それ以外の場合、ランダムなセルに配置
    cellIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    
    return cellIndex;
}

/**
 * hardAI の行動を制御する関数
 * この関数はミニマックスアルゴリズムを使用して最善の手を選択し、盤面にその手を反映させる
 */
function hardAI() {
    const bestMove = minimax(boardState, "×");
    return bestMove.index;
}

// 現在のAIの難易度に応じて適切な関数を呼び出す関数
function cpuPlay() {
    let move;
    if (currentDifficulty === "easy") {
        move = easyAI(boardState);
    } else if (currentDifficulty === "normal") {
        move = normalAI(boardState);
    } else if (currentDifficulty === "hard") {
        move = hardAI(boardState);
    }
    boardState[move] = '×';

    // マス目への反映
    const cell = document.querySelector(`[data-cell-index="${move}"]`);
    cell.innerHTML = '×';

    // ターンをプレイヤーに戻す
    gameState.isTurnEnd = true;
}

/**
 * 利用可能なセルのリストを返す関数
 * @param {Array} board - ゲームの盤面の状態を保持する2次元配列
 * @returns {Array} - 利用可能なセルのリスト
 */
function getAvailableMoves(board) {
    const availableMoves = [];

    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            availableMoves.push({ i });
        }
    }

    return availableMoves;
}

/**
 * ミニマックスアルゴリズムを使用して最善手を返す関数
 * @param {Array} board - ゲームの盤面の状態を保持する2次元配列
 * @param {string} player - 現在のプレイヤーの記号
 * @returns {Object} - 最善の手とそのスコア
 */
function minimax(board, player) {
    const availableMoves = board.reduce((acc, curr, idx) => (curr === "" ? acc.concat(idx) : acc), []);

    const winner = checkWinner(board);
    if (winner === "○") return { score: -10 };
    else if (winner === "×") return { score: 10 };
    else if (availableMoves.length === 0) return { score: 0 };  // 引き分け

    const moves = [];

    for (let move of availableMoves) {
        let newBoard = board.slice();
        newBoard[move] = player;

        let result;
        if (player === "×") {
            result = minimax(newBoard, "○");
            moves.push({
                index: move,
                score: result.score
            });
        } else {
            result = minimax(newBoard, "×");
            moves.push({
                index: move,
                score: result.score
            });
        }
    }

    let bestMove;
    if (player === "×") {
        let bestScore = -Infinity;
        for (let move of moves) {
            if (move.score > bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let move of moves) {
            if (move.score < bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    }

    return bestMove;
}

/**
 * 指定されたプレイヤーがリーチしているセルのインデックスを返す関数
 * @param {Array} board - ゲームの盤面
 * @param {string} player - プレイヤーのシンボル
 * @returns {number|null} - リーチしているセルのインデックス、またはnull
 */
function getReachCell(board, player) {
    const winningLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let line of winningLines) {
        let emptyCount = 0;
        let playerCount = 0;
        let emptyIndex = null;

        for (let index of line) {
            if (board[index] === "") {
                emptyCount++;
                emptyIndex = index;
            } else if (board[index] === player) {
                playerCount++;
            }
        }

        // 2つのセルがプレイヤーのシンボルで、残りの1つが空いている場合
        if (emptyCount === 1 && playerCount === 2) {
            return emptyIndex;
        }
    }

    return null;
}

/**
 * 勝利者を判定する関数
 * @param {Array} board - ゲームボードの状態
 * @returns {string|null} - 勝利者（'○' または '×'）または null
 */
function checkWinner(board) {
    for (let combination of winningCombinations) {
        if (board[combination[0]] &&
            board[combination[0]] === board[combination[1]] &&
            board[combination[0]] === board[combination[2]]) {
            return board[combination[0]];  // 勝利者を返す
        }
    }
    return null;  // 勝利者がいない場合はnullを返す
}

//#endregion

//================
//#region ステート

// ゲームのメインループ
function gameLoop() {
    // gameStateの更新処理
    if (currentState.update) {
        currentState.update();
    }

    requestAnimationFrame(gameLoop);  // 次のフレームでも同じ関数を呼び出す
}

// 各ステートを表すオブジェクト
const titleState = {
    init: function() {
        // タイトルステートの初期化処理
        console.log("タイトルステートが開始されました");

        // 画面の表示設定.
        document.getElementById('titleScreen').style.display = 'block';
        document.getElementById('gameBoard').style.display = 'none';
        document.getElementById('resultScreen').style.display = 'none';
    },
    update: function() {
        // タイトルステートの更新処理（必要に応じて）
    },
    exit: function() {
        // タイトルステートの終了処理
        console.log("タイトルステートが終了しました");
        document.getElementById('titleScreen').style.display = 'none';
    }
};

// ゲームの状態を管理するオブジェクト
const gameState = {
    currentSubState: null,
    isTurnEnd: false,  // ターン終了フラグ

    // 初期化.
    init: function() {
        this.currentSubState = playerTurnState;

        // 画面の表示設定.
        document.getElementById('gameBoard').style.display = 'block';
        document.getElementById('titleScreen').style.display = 'none';
        document.getElementById('resultScreen').style.display = 'none';        
    },
    // 更新処理
    update: function() {
        // currentSubStateのupdateメソッドを呼び出す
        if (this.currentSubState && this.currentSubState.update) {
            this.currentSubState.update();
        }
    },
    changeSubState: function(newSubState) {
        if (this.currentSubState && this.currentSubState.exit) {
            this.currentSubState.exit();  // 現在のサブステートの終了処理を実行
        }
        this.currentSubState = newSubState;  // 新しいサブステートに更新
        if (this.currentSubState && this.currentSubState.init) {
            this.currentSubState.init();  // 新しいサブステートの初期化処理を実行
        }
    },    
    exit: function() {
        // ゲームステートの終了処理
        console.log("ゲームステートが終了しました");
        document.getElementById('gameBoard').style.display = 'none';
    }
};

const playerTurnState = {
    init: function() {
        console.log("プレイヤーターンが開始されました");
        currentPlayer = '○';
        // プレイヤーがマスをクリックするのを待ちます。
    },
    update: function() {
        // ターン終了フラグが立っていたらターンを切り替える
        if (gameState.isTurnEnd) {
            gameState.isTurnEnd = false;
            toggleTurn();
        }
    },
    exit: function() {
        console.log("プレイヤーターンが終了しました");
    }
};

const cpuTurnState = {
    init: function() {
        console.log("CPUターンが開始されました");
        currentPlayer = '×';
        cpuPlay();  // CPUのプレイ処理を実行
    },
    update: function() {
        // ターン終了フラグが立っていたらターンを切り替える
        if (gameState.isTurnEnd) {
            gameState.isTurnEnd = false;
            toggleTurn();
        }
    },
    exit: function() {
        console.log("CPUターンが終了しました");
    }
};

// ターンを切り替える関数
function toggleTurn() {
    // 勝利判定
    const result = checkWinner(boardState);
    if (result) {
        resultWinner = result;
        document.getElementById('winnerText').textContent = currentPlayer + 'の勝利！';
        changeState(resultState);

        return;  // 以降の処理は実行せずに終了
    } else if (isDraw()) {
        document.getElementById('winnerText').textContent = '引き分け！';
        changeState(resultState);

        return;  // 以降の処理は実行せずに終了
    }
        
    if (gameState.currentSubState === playerTurnState) {
        // プレイヤーのターンからCPUのターンへ切り替え
        gameState.changeSubState(cpuTurnState);
    } else if (gameState.currentSubState === cpuTurnState) {
        // CPUのターンからプレイヤーのターンへ切り替え
        gameState.changeSubState(playerTurnState);
    }
}

const resultState = {
    init: function() {
        console.log(`${resultWinner}の勝ち！`);
        // その他の結果表示処理...

        // 画面の表示設定.
        document.getElementById('resultScreen').style.display = 'block';
        document.getElementById('titleScreen').style.display = 'none';
        document.getElementById('gameBoard').style.display = 'none';
    },
    exit: function() {
        // 結果表示後の処理（例: ゲームの再開始やタイトル画面への移行など）
        document.getElementById('resultScreen').style.display = 'none';
    }
};

/**
 * ゲームのリセットを行う関数
 */
function resetGame() {
    // 全てのセルの内容を初期化
    for (let i = 0; i < cells.length; i++) {
        cells[i].textContent = "";
        boardState[i] = "";
    }

    // currentPlayerを '〇' にリセット
    currentPlayer = '○';

    // isTurnEndをfalseにリセット
    isTurnEnd = false;
}

/**
 * タイトル画面へ
 */
function toTitle() {
    resetGame();

    changeState(titleState);
}


// CPUの強さ設定.
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    // タイトルステートを終了して、ゲームステートに移行
    changeState(gameState);
}

// ステートを変更する関数
function changeState(newState) {
    if (currentState && currentState.exit) {
        currentState.exit();  // 現在のステートの終了処理を実行
    }
    currentState = newState;  // 新しいステートに更新
    if (currentState && currentState.init) {
        currentState.init();  // 新しいステートの初期化処理を実行
    }
}

/**
 * 渡されたステートが現在のステートと一致しているかを判定する関数
 * @param {Function} stateFunction - 判定したいステートの関数
 * @returns {boolean} - 現在のステートと一致している場合はtrue、そうでない場合はfalse
 */
function isCurrentState(stateFunction) {
    return currentState === stateFunction;
}

// 初期ステートを設定
changeState(titleState);

// gameLoopを初回呼び出しして、ゲームのメインループを開始
gameLoop();

//#endregion