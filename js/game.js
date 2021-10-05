'use strict'
const MINE = '💣';
const FLAG = '🚩';
const HAPPY = '😄';
const INJURED = '🤕';
const DEAD = '💀';
const WON = '😎';
const LIFE = '❤️';
const SAFE = '🛡️';
var EASY = 4;
var HARD = 8;
var EXTREME = 12;
var isFirstTime = true;
var OCCUPIED = 'lightcyan';
var SELECTED = 'darksalmon';
var steppedOnMine = false;
var LIFES = 2;
var lifeCounter = 0;
var HINTS = 3;
var hintCount = 0;
var SAFECLICKS = 3;
var safeCounter = 0;
var isHintMode = false;
var isSafeClickMode = false;
var HINTCOLOR = 'yellowgreen';
var isManually = false;
var manualCounter = 0;
var is7Boom = false;

var startTime;
var gCounterInterval;
var gHintTimeOut;
var gSafeTimeOut;
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

localStorage.bestScoreLevel1 = Infinity;
localStorage.bestScoreLevel2 = Infinity;
localStorage.bestScoreLevel3 = Infinity;



function initGame() {

    updateLifes(LIFES);
    buildBoard();
    renderBoard();
    loadHints();


}

function manuallyPos() {

    isManually = true;
    is7Boom = false;
    // restartGame();

}

function boom7Pos() {

    is7Boom = true;
    isManually = false;
    restartGame();

}

function loadHints() {
    var elHints = document.querySelector('.hints');
    var elHintStr = `<button class="hintButton" onclick="getHint()"> 💡 <span class="tooltiptext">Hints left: ${HINTS - hintCount} </span> </button>`;
    var elSafeStr = `<button class="safeButton" onclick="getSafeClick()"> ${SAFE} <span class="tooltiptext1">safe clicks left: ${SAFECLICKS - safeCounter} </span> </button>`;
    elHints.innerHTML = elHintStr + elSafeStr;
}

function getSafeClick() {
    if (gGame.isOn && !isFirstTime) {
        if (safeCounter !== SAFECLICKS) {
            safeCounter++;
            var elHiddenText = document.querySelector('.tooltiptext1');
            elHiddenText.innerHTML = `safe clicks left: ${SAFECLICKS - safeCounter}`;
            if (safeCounter === SAFECLICKS) {
                var elSafeButton = document.querySelector('.safeButton');
                elSafeButton.innerHTML = `🕳️<span class="tooltiptext1"> No safe clicks Left! </span>`;
            }
            isSafeClickMode = true;

        }
    }
}

function getHint() {
    if (gGame.isOn && !isFirstTime) {
        if (hintCount !== HINTS) {
            hintCount++;
            var elHiddenText = document.querySelector('.tooltiptext');
            elHiddenText.innerHTML = `Hints left: ${HINTS - hintCount}`;
            if (hintCount === HINTS) {
                var elHintButton = document.querySelector('.hintButton');
                elHintButton.innerHTML = `🕳️<span class="tooltiptext"> No Hints Left! </span>`;
            }
            isHintMode = true;

        }
    }

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
            var className = 'cell cell' + i + '-' + j;
            strHtml += `<td class="${className}"  onclick="cellClicked(this,${i},${j})" onmouseover="cellMarked(this,${i},${j})"></td>`
        }
        strHtml += '</tr>'
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHtml;

}

function renderCellsFromCurr(elCurr, rowIdx, colIdx) {
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
            if (isHintMode) {
                showNegsContent(i, j);
                if (gHintTimeOut) clearTimeout(gHintTimeOut);
                gHintTimeOut = setTimeout(function () {
                    hideNegsContent(i, j);
                }, 1000);
                isHintMode = false;
                return;

            }
            else if (isSafeClickMode) {
                //safe mode
                var minePos = markRandomMine();
                if (gSafeTimeOut) clearTimeout(gSafeTimeOut);
                gSafeTimeOut = setTimeout(function () {
                    unMarkSafeClick(minePos.i, minePos.j);
                }, 2000);
                isSafeClickMode = false;
                return;
            }

            if (gBoard[i][j].isMine && elCell.style.backgroundColor !== OCCUPIED) {
                steppedOnMine = true;
                gBoard[i][j].isMarked = true;
                checkGameOver();
            }
        } else {

            if (isManually && (manualCounter !== gLevel.MINES)) {
                gBoard[i][j].isMine = true;
                manualCounter++;
                elCell.style.backgroundColor = SELECTED;
                if (manualCounter === gLevel.MINES) {
                    setTimeout(removeSelected, 500);
                }
                return;
            } else {
                firstCellClicked(i, j);
            }
            startTime = new Date();
            // if(gCounterInterval) clearInterval(gCounterInterval);
            gCounterInterval = setInterval(countSeconds, 1000);
            isFirstTime = false;
            setMinesNegsCount(gBoard);
        }

        renderCellsFromCurr(elCell, i, j);
        expandShown(gBoard, elCell, i, j);

    }
}

function removeSelected() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCellStr = '.cell' + i + '-' + j;
            var elCurrCell = document.querySelector(currCellStr);
            if (elCurrCell.style.backgroundColor === SELECTED) {
                elCurrCell.style.backgroundColor = 'gray';
            }
        }
    }
}

function markRandomMine() {
    var randI = getRandomIntInclusive(0, gBoard.length - 1);
    var randJ = getRandomIntInclusive(0, gBoard.length - 1);
    while (!gBoard[randI][randJ].isMine || gBoard[randI][randJ].isMarked) {
        randI = getRandomIntInclusive(0, gBoard.length - 1);
        randJ = getRandomIntInclusive(0, gBoard.length - 1);
    }
    var currCellStr = '.cell' + randI + '-' + randJ;
    var elCurrCell = document.querySelector(currCellStr);
    elCurrCell.style.backgroundColor = HINTCOLOR;
    return {
        i: randI,
        j: randJ
    };

}

function unMarkSafeClick(i, j) {
    var currCellStr = '.cell' + i + '-' + j;
    var elCurrCell = document.querySelector(currCellStr);
    elCurrCell.style.backgroundColor = 'gray';
}

function showNegsContent(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            var currCellStr = '.cell' + i + '-' + j;
            var elCurrCell = document.querySelector(currCellStr);
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                elCurrCell.innerHTML = MINE;
                elCurrCell.style.backgroundColor = HINTCOLOR;
            } else if (gBoard[i][j].minesAroundCount !== 0 && elCurrCell.style.backgroundColor !== OCCUPIED) {
                elCurrCell.innerHTML = gBoard[i][j].minesAroundCount;
                elCurrCell.style.backgroundColor = HINTCOLOR;
            } else if (elCurrCell.style.backgroundColor !== OCCUPIED) {
                elCurrCell.innerHTML = '';
                elCurrCell.style.backgroundColor = HINTCOLOR;
            }
        }
    }
}

function hideNegsContent(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            var currCellStr = '.cell' + i + '-' + j;
            var elCurrCell = document.querySelector(currCellStr);
            if (elCurrCell.style.backgroundColor === HINTCOLOR) {
                elCurrCell.innerHTML = '';
                elCurrCell.style.backgroundColor = 'gray';
            }
        }
    }
}


function firstCellClicked(clickedI, clickedJ) {

    if (isManually) {
        isManually = false;
        is7Boom = false;
    } else
        if (is7Boom) {
            fillCells7Boom();
            is7Boom = false;
            isManually = false;
        }
        else {
            var randI = getRandomIntInclusive(0, gBoard.length - 1);
            var randJ = getRandomIntInclusive(0, gBoard[0].length - 1);
            for (var i = 0; i < gLevel.MINES; i++) {
                while (randI === clickedI && randJ === clickedJ || (gBoard[randI][randJ].isMine)) {
                    randI = getRandomIntInclusive(0, gBoard.length - 1);
                    randJ = getRandomIntInclusive(0, gBoard[0].length - 1);
                }
                gBoard[randI][randJ].isMine = true;
                randI = getRandomIntInclusive(0, gBoard.length - 1);
                randJ = getRandomIntInclusive(0, gBoard[0].length - 1);
            }
        }

}

// function fillCellsManually() {




// }

function fillCells7Boom() {
    var mineCounter = 0;
    var cellIndex = 1;
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!(cellIndex % 7)) {
                gBoard[i][j].isMine = true;
                mineCounter++;
                if (mineCounter === gLevel.MINES) return;
            }

            cellIndex++;
        }
    }
    gLevel.MINES = mineCounter;

}

function cellMarked(elCell, rowIdx, colIdx) {
    elCell.addEventListener("contextmenu", e => e.preventDefault());
    window.oncontextmenu = function () {
        if (gGame.isOn && !isFirstTime) {
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
        gGame.isOn = false;
        //To.DO WINING!
        showAllCells();
        document.querySelector('.timer').innerHTML += ' ✨ YOU WON ✨ !'
        clearInterval(gCounterInterval);
        if (gLevel.SIZE === 4) {
            var currHighScore = localStorage.bestScoreLevel1;
            if (gGame.secsPassed < currHighScore) {
                localStorage.bestScoreLevel1 = gGame.secsPassed;
                document.querySelector('.score').innerHTML = 'Best-Score: ' + gGame.secsPassed + ' secs';
            }
        }
        if (gLevel.SIZE === 8) {
            var currHighScore = localStorage.bestScoreLevel2;
            if (gGame.secsPassed < currHighScore) {
                localStorage.bestScoreLevel2 = gGame.secsPassed;
                document.querySelector('.score').innerHTML = 'Best-Score: ' + gGame.secsPassed + ' secs';
            }
        }
        if (gLevel.SIZE === 12) {
            var currHighScore = localStorage.bestScoreLevel3;
            if (gGame.secsPassed < currHighScore) {
                localStorage.bestScoreLevel3 = gGame.secsPassed;
                document.querySelector('.score').innerHTML = 'Best-Score: ' + gGame.secsPassed + ' secs';
            }
        }
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
        revealMines();
        document.querySelector('.timer').innerHTML += ' 😞 YOU LOSE 😞 !'
        //game over!
    }


}

function showAllCells() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if ((!(gBoard[i][j].isMine)) && (!(gBoard[i][j].isMarked))) {
                var currCellStr = '.cell' + i + '-' + j;
                var elCurrCell = document.querySelector(currCellStr);
                if (gBoard[i][j].minesAroundCount) {
                    elCurrCell.innerHTML = gBoard[i][j].minesAroundCount;
                    elCurrCell.style.backgroundColor = 'lightgreen';
                }
            }
        }
    }
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                var currCellStr = '.cell' + i + '-' + j;
                var elCurrCell = document.querySelector(currCellStr);
                elCurrCell.style.backgroundColor = 'red';
                elCurrCell.innerHTML = MINE;
            }
        }
    }
}



function easyGame(elBtn) {
    clearDifficultiesHoover();
    gLevel.SIZE = EASY;
    gLevel.MINES = 2;
    LIFES = 2;
    // elBtn.style.backgroundColor = "yellow";
    // clearInterval(gInterval);
    restartSettings();
    var bestScore = (!isFinite(localStorage.bestScoreLevel1)) ? '' : (localStorage.bestScoreLevel1 + ' secs');
    document.querySelector('.score').innerHTML = 'Best-Score: ' + bestScore;
}

function hardGame(elBtn) {
    clearDifficultiesHoover();
    gLevel.SIZE = HARD;
    gLevel.MINES = 12;
    LIFES = 3;
    // elBtn.style.backgroundColor = "yellow";
    // clearInterval(gInterval);
    restartSettings();
    var bestScore = (!isFinite(localStorage.bestScoreLevel2)) ? '' : (localStorage.bestScoreLevel2 + ' secs');
    document.querySelector('.score').innerHTML = 'Best-Score: ' + bestScore;
}

function extremeGame(elBtn) {
    clearDifficultiesHoover();
    gLevel.SIZE = EXTREME;
    gLevel.MINES = 30;
    LIFES = 3;
    // elBtn.style.backgroundColor = "yellow";
    // clearInterval(gInterval);
    restartSettings();
    var bestScore = (!isFinite(localStorage.bestScoreLevel3)) ? '' : (localStorage.bestScoreLevel3 + ' secs');
    document.querySelector('.score').innerHTML = 'Best-Score: ' + bestScore;
}

function restartSettings() {
    // gGame.isOn = true;
    isFirstTime = true;
    steppedOnMine = false;
    lifeCounter = 0;
    LIFES = (gLevel.SIZE === 4) ? 2 : 3;
    gGame.markedCount = 0;
    hintCount = 0;
    safeCounter = 0;
    isHintMode = false;
    isSafeClickMode = false;
    if (gLevel.SIZE === 8) gLevel.MINES = 12;
    if (gLevel.SIZE === 12) gLevel.MINES = 30;
    var elGameButton = document.querySelector('.gameButton');
    elGameButton.innerHTML = HAPPY;
    manualCounter = 0;
    clearSecs();
    initGame();
}

function clearDifficultiesHoover() {
    var elDifficulties = document.querySelectorAll('.difficulty');
    for (var i = 0; i < elDifficulties.length; i++) {
        // elDifficulties[i].style.backgroundColor = "white";
        elDifficulties[i].classList.add('.difficulty');
    }
}

function restartGame() {
    gGame.isOn = true;
    isFirstTime = true;
    steppedOnMine = false;
    lifeCounter = 0;
    LIFES = (gLevel.SIZE === 4) ? 2 : 3;
    if (gLevel.SIZE === 8) gLevel.MINES = 12;
    if (gLevel.SIZE === 12) gLevel.MINES = 30;
    gGame.markedCount = 0;
    hintCount = 0;
    safeCounter = 0;
    isHintMode = false;
    isSafeClickMode = false;
    manualCounter = 0;
    var elGameButton = document.querySelector('.gameButton');
    elGameButton.innerHTML = HAPPY;
    clearDifficultiesHoover();
    clearSecs();
    initGame();
    // gCounterInterval = setInterval(countSeconds, 1000);
}

function countSeconds() {
    var elTime = document.querySelector('.timer');
    var time = new Date();
    time = time - startTime;
    var seconds = Math.floor(time / 1000);
    gGame.secsPassed = (time / 1000);
    // var milliSecs = (time % 1000);
    elTime.innerHTML = `Time: ${(time / 1000)} secs`;
}

function clearSecs() {
    clearInterval(gCounterInterval);
    var elTime = document.querySelector('.timer');
    elTime.innerHTML = 'Time:  0:0 secs';

}