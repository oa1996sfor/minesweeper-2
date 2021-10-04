'use strict'
const MINE = '💣';
const FLAG = '🚩';
const HAPPY = '😄';
const INJURED = '🤕';
const DEAD = '💀';
const WON = '😎';
var LIFE = '❤️';
var EASY = 4;
var HARD = 8;
var EXTREME = 12;
var isFirstTime = true;
var OCCUPIED = 'lightcyan';
var steppedOnMine = false;
var LIFES = 3;
var lifeCounter = 0;

var startTime;
var gCounterInterval;
var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};





function initGame() {

    updateLifes(LIFES);
    buildBoard();
    renderBoard();


}

function updateLifes(lifeNum) {
    var elLives = document.querySelector('.lives');
    var lifesStr = '';
    for (var i = 0; i < lifeNum; i++) {
        lifesStr += LIFE;
    }
    elLives.innerHTML = lifesStr;
}


function buildBoard() {
    gBoard = createMat(gLevel.SIZE, gLevel.SIZE);
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            gBoard[i][j] = cell;
        }
    }
}

function setMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = countNegsMines(board, i, j);
        }
    }
}

function countNegsMines(mat, cellI, cellJ) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].isMine) neighborsCount++;
            // if (mat[i][j]) neighborsCount++;
        }
    }
    return neighborsCount;
}

function renderBoard() {
    var strHtml = '';
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHtml += '<tr>'
        for (var j = 0; j < gLevel.SIZE; j++) {
            //   var className = (cell) ? 'occupied' : '';
            // var cell = gBoard[i][j];
            var className = 'cell cell' + i + '-' + j;
            strHtml += `<td class="${className}"  onclick="cellClicked(this,${i},${j})" onmouseover="cellMarked(this,${i},${j})"></td>`
        }
        strHtml += '</tr>'
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml;

}

function renderCellsFromCurr(elCurr, rowIdx, colIdx) {
    // var currCell = '.cell' + rowIdx + '-' + colIdx;
    // var elCurrCell = document.querySelector(currCell);
    // console.log(elCurrCell);
    var cellContent = '';
    var currCell = gBoard[rowIdx][colIdx];
    if (!currCell.isMine && currCell.minesAroundCount !== 0) {
        cellContent = currCell.minesAroundCount;

    } else if (currCell.isMine) { //game over
        cellContent = MINE;
    }
    elCurr.innerHTML = cellContent;
    elCurr.style.backgroundColor = OCCUPIED;
}

function expandShown(board, elCell, i, j) {
    if (i < 0 || i >= board.length || j < 0 || j >= board.length)
        return;
    var currCell = board[i][j];
    if (currCell.isMine) return;
    if (currCell.minesAroundCount) {
        elCell.innerHTML = currCell.minesAroundCount;
        elCell.style.backgroundColor = OCCUPIED;
        return;
    }
    elCell.style.backgroundColor = OCCUPIED;
    if (isValidNegs(i, j)) {
        var negCell = '.cell' + (i - 1) + '-' + (j - 1);
        var elNegCell = document.querySelector(negCell);
        if (elNegCell && elNegCell.style.backgroundColor !== OCCUPIED)
            expandShown(board, elNegCell, i - 1, j - 1);

        negCell = '.cell' + (i - 1) + '-' + j;
        elNegCell = document.querySelector(negCell);
        if (elNegCell && elNegCell.style.backgroundColor !== OCCUPIED)
            expandShown(board, elNegCell, i - 1, j);

        negCell = '.cell' + i + '-' + (j - 1);
        elNegCell = document.querySelector(negCell);
        if (elNegCell && elNegCell.style.backgroundColor !== OCCUPIED)
            expandShown(board, elNegCell, i, j - 1);

        negCell = '.cell' + (i + 1) + '-' + j;
        elNegCell = document.querySelector(negCell);
        if (elNegCell && elNegCell.style.backgroundColor !== OCCUPIED)
            expandShown(board, elNegCell, i + 1, j);

        negCell = '.cell' + i + '-' + (j + 1);
        elNegCell = document.querySelector(negCell);
        if (elNegCell && elNegCell.style.backgroundColor !== OCCUPIED)
            expandShown(board, elNegCell, i, j + 1);

        negCell = '.cell' + (i + 1) + '-' + (j + 1);
        elNegCell = document.querySelector(negCell);
        if (elNegCell && elNegCell.style.backgroundColor !== OCCUPIED)
            expandShown(board, elNegCell, i + 1, j + 1);

        negCell = '.cell' + (i - 1) + '-' + (j + 1);
        elNegCell = document.querySelector(negCell);
        if (elNegCell && elNegCell.style.backgroundColor !== OCCUPIED)
            expandShown(board, elNegCell, i - 1, j + 1);

        negCell = '.cell' + (i + 1) + '-' + (j - 1);
        elNegCell = document.querySelector(negCell);
        if (elNegCell && elNegCell.style.backgroundColor !== OCCUPIED)
            expandShown(board, elNegCell, i + 1, j - 1);



    }





}

function isValidNegs(i, j) {
    if (i < 0 || i >= gBoard.length || j < 0 || j >= gBoard.length)
        return false;
    return true;
}


function cellClicked(elCell, i, j) {
    if (gGame.isOn) {
        if (!isFirstTime) {
            if (gBoard[i][j].isMine && elCell.style.backgroundColor !== OCCUPIED) {
                steppedOnMine = true;
                checkGameOver();
            }


        } else {
            firstCellClicked(i, j);
            isFirstTime = false;
            setMinesNegsCount(gBoard);

        }

        renderCellsFromCurr(elCell, i, j);
        expandShown(gBoard, elCell, i, j);

    }
}


function firstCellClicked(clickedI, clickedJ) {

    var randI = getRandomIntInclusive(0, gBoard.length - 1);
    var randJ = getRandomIntInclusive(0, gBoard[0].length - 1);
    for (var i = 0; i < gLevel.MINES; i++) {
        while (randI === clickedI && randJ === clickedJ && (gBoard[randI][randJ].isMine)) {
            randI = getRandomIntInclusive(0, gBoard.length - 1);
            randJ = getRandomIntInclusive(0, gBoard[0].length - 1);
        }
        gBoard[randI][randJ].isMine = true;
        randI = getRandomIntInclusive(0, gBoard.length - 1);
        randJ = getRandomIntInclusive(0, gBoard[0].length - 1);
    }


}


function cellMarked(elCell, rowIdx, colIdx) {
    elCell.addEventListener("contextmenu", e => e.preventDefault());
    window.oncontextmenu = function () {
        if (elCell.style.backgroundColor !== OCCUPIED) {
            if (elCell.innerHTML === '') {
                elCell.innerHTML = FLAG;
                if (gBoard[rowIdx][colIdx].isMine && (!gBoard[rowIdx][colIdx].isMarked)) {
                    gGame.markedCount++;
                    gBoard[rowIdx][colIdx].isMarked = true;
                    checkGameOver();
                }
            }
            else if (elCell.innerHTML === FLAG) {
                elCell.innerHTML = '';
            }
        }
    }

}

function checkGameOver() {

    if (steppedOnMine) {
        lose();
    }
    else checkWin();




}

function checkWin() {
    if (gGame.markedCount === (gLevel.MINES - lifeCounter)) {
        var elGameButton = document.querySelector('.gameButton');
        elGameButton.innerHTML = WON;
        //To.DO WINING!

        //  clearSecs();
    }
}

function lose() {
    var elGameButton = document.querySelector('.gameButton');
    if (lifeCounter !== LIFES) {
        lifeCounter++;
        steppedOnMine = false;
        updateLifes(LIFES - lifeCounter);
        elGameButton.innerHTML = INJURED;
    }
    if (lifeCounter === LIFES) { // or you lost!
        gGame.isOn = false;
        updateLifes(LIFES - lifeCounter);
        elGameButton.innerHTML = DEAD;
        clearInterval(gCounterInterval);
        //game over!
    }


}



function easyGame(elBtn) {
    clearDifficultiesHoover();
    gLevel.SIZE = EASY;
    gLevel.MINES = 2;
    elBtn.style.backgroundColor = "yellow";
    // clearInterval(gInterval);
    restartSettings();
}

function hardGame(elBtn) {
    clearDifficultiesHoover();
    gLevel.SIZE = HARD;
    gLevel.MINES = 12;
    elBtn.style.backgroundColor = "yellow";
    // clearInterval(gInterval);
    restartSettings();
}

function extremeGame(elBtn) {
    clearDifficultiesHoover();
    gLevel.SIZE = EXTREME;
    gLevel.MINES = 30;
    elBtn.style.backgroundColor = "yellow";
    // clearInterval(gInterval);
    restartSettings();
}

function restartSettings() {
    // gGame.isOn = true;
    isFirstTime = true;
    steppedOnMine = false;
    lifeCounter = 0;
    gGame.markedCount = 0;
    var elGameButton = document.querySelector('.gameButton');
    elGameButton.innerHTML = HAPPY;
    clearSecs();
    initGame();
}

function clearDifficultiesHoover() {
    var elDifficulties = document.querySelectorAll('.difficulty');
    for (var i = 0; i < elDifficulties.length; i++) {
        elDifficulties[i].style.backgroundColor = "white";
    }
}

function restartGame() {
    gGame.isOn = true;
    isFirstTime = true;
    steppedOnMine = false;
    lifeCounter = 0;
    gGame.markedCount = 0;
    var elGameButton = document.querySelector('.gameButton');
    elGameButton.innerHTML = HAPPY;
    clearDifficultiesHoover();
    startTime = new Date();
    clearSecs();
    initGame();
    gCounterInterval = setInterval(countSeconds, 1000);
}

function countSeconds() {
    var elTime = document.querySelector('.timer');
    var time = new Date();
    time = time - startTime;
    var seconds = Math.floor(time / 1000);
    gGame.secsPassed = seconds;
    var milliSecs = (time % 1000);
    elTime.innerHTML = `Time: ${seconds} : ${milliSecs} secs`;
}

function clearSecs() {
    clearInterval(gCounterInterval);
    var elTime = document.querySelector('.timer');
    elTime.innerHTML = 'Time:  0:0 secs';

}