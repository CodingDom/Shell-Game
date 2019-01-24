window.onload = function() {
const startScreen = {
    menu : document.getElementById("menu-container"),
    content : document.getElementById("menu-content"),
    playBtn : document.getElementById("play"),
}    

const gameScreen = {
    container : document.getElementById("game-container"),
    loseContainer : document.getElementById("lose-container"),
    restartBtn : document.getElementById("restart"),
    levelText : document.getElementById("level-text"),
    bankText : document.getElementById("bank-text"),
    betContainer : document.getElementById("betting-container"),
    betAmount : document.getElementById("betting-amount"),
    increments : document.getElementById("increments"),
    startBtn : document.getElementById("start"),
    shellContainer : document.getElementById("shell-container"),
    shells : [
        document.getElementById("shell1"),
        document.getElementById("shell2"),
        document.getElementById("shell3")
    ],
}
const warning = document.getElementById("warning-message");
const posArray = [
    "left",
    "center",
    "right"
];

let level = 1;
let speedMultiplier = 0.5;
let cash = 100;
let bet = 0;
let betMultiplier = 0;

let currShell = gameScreen.shells[1];

let ready = false;

function resetPosition() {
    const size = gameScreen.shellContainer.offsetWidth;
    const half = gameScreen.shells[0].offsetWidth/2;
    gameScreen.shells.forEach(function(elem) {
        switch (elem.getAttribute("data-pos")) {
            case "left":
                elem.style.left = "0";
            break;
            case "center":
                elem.style.left = (((size/2) - half)/size)*100 + "%";
            break;
            case "right":
                elem.style.left = ((size - (half*2))/size)*100 + "%";
            break;
        };
    });
};

function swap(shells, frames, level, looped=0, _callBack, originShells, originLevel) {
    const randShells = randomizeShells(shells);
    const elem1 = randShells[0];
    const elem2 = randShells[1];
    const elem3 = randShells[2];
    const pos1 = elem1.style.left.match(/\d+/g).map(Number)[0];
    const pos2 = elem2.style.left.match(/\d+/g).map(Number)[0];
    const mid = Math.abs(pos2-pos1)/2;

    const elem1Align = elem1.getAttribute("data-pos");
    const elem2Align = elem2.getAttribute("data-pos");

    elem1.setAttribute("data-pos",elem2Align);
    elem1.setAttribute("data-dir","top");
    elem2.setAttribute("data-pos",elem1Align);
    elem2.setAttribute("data-dir","bottom");
    let dir = 1;
    if (pos1 > pos2) {
        dir = -1;
    };
    let target = 0;
    let id = setInterval(frame, 5);

    function frame() {
        target += mid/frames;
        yTarget = (target/mid)*100;
        if (yTarget >= 200) {
            // Setting to exact positions
            elem1.style.left = pos2 + "%";
            elem2.style.left = pos1 + "%";
            elem1.style.bottom = "0";
            elem2.style.bottom = "0";
            clearInterval(id);
            if (elem3) {
                let lastSwap = randomizeShells([elem1,elem2]);
                lastSwap = [lastSwap[0],elem3];
                if (level > 0 && looped < level) {
                    looped++;
                    swap(lastSwap, frames, 0, looped, swap, shells, level);
                };
            } else {
                if (looped >= originLevel) {
                    gameScreen.shellContainer.classList.add("active");
                } else {
                    _callBack(originShells, frames, originLevel, looped)
                };
            };
            return;
        };
        if (target <= mid) {
            elem1.style.bottom = yTarget + "%";
            elem2.style.bottom = -yTarget + "%";
        } else {
            elem1.style.bottom = 200 - yTarget + "%";
            elem2.style.bottom = -200 + yTarget + "%";
        };
        elem1.style.left = pos1 + (dir*target) + '%'; 
        elem2.style.left = pos2 - (dir*target) + '%'; 
    }
};

function raise(elem, currShell, _callBack, correct) {
    let pearl = null;
    if (currShell == elem) {
        pearl = document.createElement("div");
        pearl.id = "pearl";
        gameScreen.shellContainer.append(pearl);
        pearl.style.bottom = 0;
        const calcLeft = ((pearl.offsetWidth+(pearl.offsetWidth/1.5))/gameScreen.shellContainer.offsetWidth) + (elem.offsetLeft/gameScreen.shellContainer.offsetWidth);
        pearl.style.left = calcLeft*100 + "%";
        pearl.style.visibility = "visible";
        pearl.style.zIndex = 0;
    };
    let id = setInterval(frame, 5);
    let yTarget = 1;
    let dir = 2.5;
    function frame() {
        elem.style.bottom = yTarget + "%";
        if (yTarget <= 30) {
        elem.style.transform = `rotate(${-yTarget}deg)`;
        };
        yTarget += dir;
        if (yTarget >= 200) {
            dir = -2.5;
            clearInterval(id);
            setTimeout(function() {
                id = setInterval(frame, 5);
            }, 500);
        } else if (yTarget <= 0) {
            clearInterval(id);
            if (pearl) {
                pearl.remove();
                if (_callBack) {
                    if (correct) {
                        _callBack("correct");
                    } else {
                        _callBack("show correct");
                    };
                };
                return true;
            }; // End of pearl check
            if (_callBack) {
                _callBack(false);
            };
            return false;
        }; 
    }
};

function randomizeShells(shells) {
    const reps = shells.length;
    let tempShells = shells.slice(0);
    let newShells = [];
    for (let i = 0; i < reps; i++) {
        let randNum = Math.floor(Math.random()*tempShells.length);
        newShells[i] = tempShells[randNum];
        tempShells.splice(randNum,1);
    };
    return newShells;
};

function addCommas (num) {
    let newText = num.toString();
    if (newText.length > 3) {
        const numLength = newText.length;
        let tempText = "";
        let num = 0;
        for (let i = numLength; i >= 0; i--) {
            num++;
            if (num%3 == 0 && i-1 > 0) {
                tempText = "," + newText.substr(i-1, 3) + tempText;
                num = 0;
            } else if (i == 0) {
                tempText = newText.substr(0, num-1) + tempText;
            };
        };
        newText = tempText;
    };
    return newText;
};

function setText() {
    gameScreen.levelText.textContent = level;
    gameScreen.betAmount.textContent = addCommas(bet);
    gameScreen.bankText.textContent = addCommas(cash);
}

function start() {
    setTimeout(function() {
        raise(currShell,currShell, function() {
            swap(gameScreen.shells, 100, level);
        });
    },300);
};

let playing = false;
function play() {
    if (playing) {return;};
    playing = true;
    startScreen.menu.style.display = "none";
    gameScreen.container.style.opacity = 0;
    gameScreen.container.style.visibility = "visible";
    resetPosition();
    level = 1;
    cash = 100;
    bet = 0;
    setText();
    let screenAnim = setInterval(function() {
        currSize += 1;
        gameScreen.container.style.opacity = Math.min(currSize, 100)/100;
        if (currSize >= 100) {
            clearInterval(screenAnim);
        };
    },5);
};

function restart() {
    gameScreen.loseContainer.style.display = "none";
    resetPosition();
    level = 1;
    cash = 100;
    bet = 0;
    setText();
    gameScreen.startBtn.style.display = "none";
    gameScreen.betContainer.style.display = "block";
};

function startRound() {
    if (bet <= 0 || bet > cash) {bet=0; return;};
    if (!ready) {
        start();
        ready = true;
    } else {
        raise(currShell, currShell, function() {
            swap(gameScreen.shells, Math.max(100-(level*speedMultiplier*10),30), level);
        });
    };
    gameScreen.betContainer.style.display = "none";
}

const btnArray = Array.from(gameScreen.increments.children);
let btnIncrement = 0;
btnArray.forEach(function(elem) {
    btnIncrement++;
    const increment = btnIncrement;
    let debounce = false;
    function addBet() {
        if (debounce) {return;};
        debounce = true;
        const calcIncrement = increment+betMultiplier;
        let pendingBet = 0;
        if (calcIncrement%2 == 1) {
            pendingBet += 5*(Math.pow(10,Math.max(Math.floor(calcIncrement/2)+1,1)));
        } else {
            pendingBet += Math.pow(10,Math.floor(calcIncrement/2)+1);
        };

        if (bet + pendingBet <= cash) {
            bet += pendingBet;
            gameScreen.betAmount.textContent = addCommas(bet);
            gameScreen.startBtn.style.display = "inline-block";
        }
        setTimeout(function() {
            debounce = false;
        },100);
    };
    elem.onmouseup = addBet;
    elem.ontouchend = addBet;
});

gameScreen.shells.forEach(function(elem){
    function onClick() {
        if (gameScreen.shellContainer.classList.contains("active")) {
            gameScreen.shellContainer.classList.remove("active");
            function grabResult(result) {
                if (result == "correct") {
                    level++;
                    speedMultiplier = Math.floor(level/5);
                    cash += bet;
                    bet = 0;
                } else if (!result) {
                    raise(currShell,currShell, grabResult);
                    cash -= bet;
                    bet = 0;
                    return;
                };
                if (result) {
                    setText();
                    if (cash <= 0) {
                        gameScreen.loseContainer.style.display = "block";
                        return;
                    };
                    gameScreen.startBtn.style.display = "none";
                    gameScreen.betContainer.style.display = "block";
                };
            };
            raise(elem,currShell,grabResult,true);
        };
    }
    elem.onmouseup = onClick;
    elem.ontouchend = onClick;
    elem.setAttribute("data-pos",posArray[gameScreen.shells.indexOf(elem)]);
});

let currSize = 0;
startScreen.content.style.opacity = 0;
let menuAnim = setInterval(function(){
    if (startScreen.menu.style.height != "60%") {
        currSize += 0.5;
        if (currSize < 5) {currSize = 5};
        startScreen.menu.style.height = Math.min(currSize, 60) + "%";
        if (currSize >= 60) {
            startScreen.content.style.opacity = "1";
            startScreen.content.style.zIndex = 5;
            currSize = 0;
        };
    } else {
        currSize += 0.5;
        startScreen.content.style.opacity = currSize/100;
        if (currSize >= 100) {
            clearInterval(menuAnim);
            currSize = 0;
        };
    };    
},5);


startScreen.playBtn.onmouseup = play;
startScreen.playBtn.ontouchend = play;

gameScreen.startBtn.onmouseup = startRound;
gameScreen.startBtn.ontouchend = startRound;

gameScreen.restartBtn.onmouseup = restart;
gameScreen.restartBtn.ontouchend = restart;

};  