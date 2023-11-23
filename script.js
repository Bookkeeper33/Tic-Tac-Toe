"use strict";

function GameBoard() {
    const board = [];

    const getBoard = () => board;

    const markCell = (row, col, mark) => {
        board[row][col] = mark;
    };

    const setFields = () => {
        const rows = 3;
        const cols = 3;

        for (let i = 0; i < rows; i++) {
            board[i] = Array(cols).fill("");
        }
    };

    setFields();

    return { getBoard, markCell, setFields };
}

function Player(name, mark) {
    const player = {
        name,
        mark,
        score: 0,
    };

    return player;
}

function gameController() {
    const gameBoard = GameBoard();
    let players = [];
    let activePlayer;

    const setPlayers = (firstName, secondName) => {
        players = [Player(firstName, "❌"), Player(secondName, "⭕")];
        activePlayer = players[0];
    };

    const getActivePlayer = () => activePlayer;

    const getScores = () => players.map((player) => player.score);

    const switchPlayer = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const playRound = (row, col) => {
        const board = gameBoard.getBoard();
        let winner;
        let tie;

        if (board[row][col] === "❌" || board[row][col] === "⭕") {
            return;
        }

        gameBoard.markCell(row, col, getActivePlayer().mark);
        winner = checkWinner(getActivePlayer().mark, board);
        tie = checkTie(board);

        if (winner) {
            activePlayer.score += 1;
            return activePlayer;
        }

        if (tie) {
            return "tie";
        }

        switchPlayer();
    };

    const checkWinner = (mark, board) => {
        if (
            board.some((row) => row.every((cell) => cell === mark)) ||
            board.some((_, col) => board.every((row) => row[col] === mark))
        ) {
            return true;
        }

        if (
            board.every((row, index) => row[index] === mark) ||
            board.every((row, index) => row[2 - index] === mark)
        ) {
            return true;
        }

        return false;
    };

    const checkTie = (board) => {
        return board.every((row) => row.every((cell) => cell !== ""));
    };

    const resetGame = (fullReset) => {
        if (fullReset) {
            players.forEach((player) => (player.score = 0));
        }

        gameBoard.setFields();
        activePlayer = players[0];
    };

    return {
        playRound,
        setPlayers,
        getScores,
        resetGame,
        getActivePlayer,
        getBoard: gameBoard.getBoard,
    };
}

function UiController() {
    const game = gameController();
    const elements = cacheDOM();

    function cacheDOM() {
        const main = document.querySelector("main");
        const formContainer = document.querySelector(".form-container");
        const form = document.getElementById("form");
        const boardDiv = document.querySelector(".gameboard");
        const status = document.querySelector(".status");
        const restartBtn = document.querySelector(".restart");
        const twoPlayersBtn = document.getElementById("play");
        const player1Name = document.querySelector(".player-1", "player-name");
        const player2Name = document.querySelector(".player-2", "player-name");
        const player1Score = document.querySelector(".score-1");
        const player2Score = document.querySelector(".score-2");
        const player1Input = document.getElementById("player1");
        const player2Input = document.getElementById("player2");

        return {
            boardDiv,
            restartBtn,
            status,
            player1Name,
            player2Name,
            player1Score,
            player2Score,
            form,
            main,
            formContainer,
            twoPlayersBtn,
            player1Input,
            player2Input,
        };
    }

    const addActive = (...elements) => {
        elements.forEach((element) => element.classList.add("active"));
    };

    const removeActive = (...elements) => {
        elements.forEach((element) => element.classList.remove("active"));
    };

    const disableBtns = () => {
        const cellBtns = document.querySelectorAll(".cell");
        cellBtns.forEach((btn) => (btn.disabled = true));
    };

    const updateStatus = (result) => {
        const player = game.getActivePlayer();

        switch (result) {
            case player:
                elements.status.textContent = `${result.name} wins!`;
                updateScore();
                disableBtns();
                setTimeout(reset, 2000);
                break;
            case "tie":
                elements.status.textContent = "It's a tie!";
                disableBtns();
                setTimeout(reset, 2000);
                break;
            default:
                elements.status.textContent = `${player.name}'s turn!`;
        }
    };

    const updateScore = () => {
        const scores = game.getScores();

        elements.player1Score.textContent = `Score: ${scores[0]}`;
        elements.player2Score.textContent = `Score: ${scores[1]}`;
    };

    const updateBoard = () => {
        elements.boardDiv.textContent = "";
        const board = game.getBoard();

        board.forEach((row, rowIndex) => {
            row.forEach((_, colIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");

                cellButton.dataset.column = colIndex;
                cellButton.dataset.row = rowIndex;
                cellButton.textContent = board[rowIndex][colIndex];

                elements.boardDiv.appendChild(cellButton);
            });
        });
        updateStatus();
    };

    const reset = (fullReset = false) => {
        game.resetGame(fullReset);
        updateBoard();
        updateScore();
    };

    const clickHandleForm = (e) => {
        e.preventDefault();

        if (
            elements.player1Input.value === "" ||
            elements.player2Input.value === ""
        ) {
            return;
        }

        game.resetGame();
        game.setPlayers(
            elements.player1Input.value,
            elements.player2Input.value
        );

        elements.player1Name.textContent = elements.player1Input.value;
        elements.player2Name.textContent = elements.player2Input.value;

        updateScore();

        elements.form.reset();

        addActive(
            elements.player1Name,
            elements.player2Name,
            elements.player1Score,
            elements.player2Score,
            elements.main
        );
        removeActive(elements.formContainer);
        updateBoard();
    };

    const clickHandlerBoard = (e) => {
        const selectedRow = e.target.dataset.row;
        const selectedCol = e.target.dataset.column;
        let result;

        if (!selectedCol || !selectedRow) return;

        result = game.playRound(selectedRow, selectedCol);
        updateBoard();
        updateStatus(result);
    };

    elements.boardDiv.addEventListener("click", clickHandlerBoard);
    elements.restartBtn.addEventListener("click", () => reset(true));
    elements.form.addEventListener("submit", clickHandleForm);
    elements.twoPlayersBtn.addEventListener("click", () =>
        elements.formContainer.classList.toggle("active")
    );
}

UiController();
