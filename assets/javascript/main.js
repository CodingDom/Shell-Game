window.onload = function() {
var startScreen = {
    menu : document.getElementById("menu-container"),
    content : document.getElementById("menu-content"),
    playBtn : document.getElementById("play"),
};    

var gameScreen = {
    container : document.getElementById("game-container"),
    loseContainer : document.getElementById("lose-container"),
    restartBtn : document.getElementById("restart"),
    levelText : document.getElementById("level-text"),
    tokenText : document.getElementById("token-text"),
    betContainer : document.getElementById("betting-container"),
    betAmount : document.getElementById("betting-amount"),
    increments : document.getElementById("increments"),
    shellContainer : document.getElementById("shell-container"),
    shells : [
        document.getElementById("shell1"),
        document.getElementById("shell2"),
        document.getElementById("shell3")
    ],
};

var defaultStats = {
    level : 1,
    speedMultiplier : 7,
    cash : 500,
    bet : 0,
    betMultiplier : 0
};

var posArray = [
    "left",
    "center",
    "right"
];
    
var level = defaultStats.level;
var speedMultiplier = defaultStats.speedMultiplier;
var cash = defaultStats.cash;
var bet = defaultStats.bet;
var betMultiplier = defaultStats.betMultiplier;

var currShell = gameScreen.shells[1];

function resetPosition() {
    var size = gameScreen.shellContainer.offsetWidth;
    var half = gameScreen.shells[0].offsetWidth/2;
    for (var i = 0; i < gameScreen.shells.length; i++) {
        var elem = gameScreen.shells[i];
        var pos = elem.getAttribute("data-pos");
        if (pos == "left") {
            elem.style.left = "0";
        } else if (pos == "center") {
            elem.style.left = (((size/2) - half)/size)*100 + "%";
        } else if (pos == "right") {
            elem.style.left = ((size - (half*2))/size)*100 + "%";
        };    
    };
};

function swap(shells, frames, level, looped, _callBack, originShells, originLevel) {
    var randShells = randomizeShells(shells);
    var elem1 = randShells[0];
    var elem2 = randShells[1];
    var elem3 = randShells[2];
    var pos1 = elem1.style.left.match(/\d+/g).map(Number)[0];
    var pos2 = elem2.style.left.match(/\d+/g).map(Number)[0];
    var mid = Math.abs(pos2-pos1)/2;

    var elem1Align = elem1.getAttribute("data-pos");
    var elem2Align = elem2.getAttribute("data-pos");

    elem1.setAttribute("data-pos",elem2Align);
    elem1.setAttribute("data-dir","top");
    elem2.setAttribute("data-pos",elem1Align);
    elem2.setAttribute("data-dir","bottom");
    var dir = 1;
    if (pos1 > pos2) {
        dir = -1;
    };
    var target = 0;
    var id = setInterval(frame, 5);

    function frame() {
        target += mid/frames;
        var yTarget = (target/mid)*100;
        if (yTarget >= 200) {
            // Setting to exact positions
            elem1.style.left = pos2 + "%";
            elem2.style.left = pos1 + "%";
            elem1.style.bottom = "0";
            elem2.style.bottom = "0";
            clearInterval(id);
            if (elem3) {
                var lastSwap = randomizeShells([elem1,elem2]);
                lastSwap = [lastSwap[0],elem3];
                if (level > 0 && looped < level) {
                    looped += 0.5;
                    swap(lastSwap, frames, 0, looped, swap, shells, level);
                };
            } else {
                if (looped >= originLevel) {
                    gameScreen.shellContainer.classList.add("active");
                } else {
                    _callBack(originShells, frames, originLevel, looped);
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
    };
};

function raise(elem, currShell, _callBack, correct) {
    var pearl = null;
    if (currShell == elem) {
        pearl = document.createElement("div");
        pearl.id = "pearl";
        gameScreen.shellContainer.append(pearl);
        pearl.style.bottom = 0;
        var calcLeft = ((pearl.offsetWidth+(pearl.offsetWidth/1.5))/gameScreen.shellContainer.offsetWidth) + (elem.offsetLeft/gameScreen.shellContainer.offsetWidth);
        pearl.style.left = calcLeft*100 + "%";
        pearl.style.visibility = "visible";
        pearl.style.zIndex = 0;
    };
    var id = setInterval(frame, 5);
    var yTarget = 1;
    var dir = 2.5;
    function frame() {
        elem.style.bottom = yTarget + "%";
        if (yTarget <= 30) {
        elem.style.transform = "rotate(" + (-yTarget) + "deg)";
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
    var reps = shells.length;
    var tempShells = shells.slice(0);
    var newShells = [];
    for (var i = 0; i < reps; i++) {
        var randNum = Math.floor(Math.random()*tempShells.length);
        newShells[i] = tempShells[randNum];
        tempShells.splice(randNum,1);
    };
    return newShells;
};

function addCommas(num) {
    var newText = num.toString();
    if (newText.length > 3) {
        var numLength = newText.length;
        var tempText = "";
        var num2 = 0;
        for (var i = numLength; i >= 0; i--) {
            num2++;
            if (num2%3 == 0 && i-1 > 0) {
                tempText = "," + newText.substr(i-1, 3) + tempText;
                num2 = 0;
            } else if (i == 0) {
                tempText = newText.substr(0, num2-1) + tempText;
            };
        };
        newText = tempText;
    };
    return newText;
};

function setText() {
    gameScreen.levelText.textContent = level;
    gameScreen.tokenText.textContent = addCommas(cash);
};

var playing = false;
function play() {
    if (playing) {return;};
    playing = true;
    startScreen.menu.style.display = "none";
    gameScreen.container.style.opacity = 0;
    gameScreen.container.style.visibility = "visible";
    resetPosition();
    level = defaultStats.level;
    speedMultiplier = defaultStats.speedMultiplier;
    cash = defaultStats.cash;
    bet = defaultStats.bet;
    betMultiplier = defaultStats.betMultiplier;
    setText();
    var currTrans = 0;
    var screenAnim = setInterval(function() {
        currTrans += 1;
        gameScreen.container.style.opacity = Math.min(currTrans, 100)/100;
        if (currTrans >= 100) {
            clearInterval(screenAnim);
        };
    },5);
};
startScreen.playBtn.onmouseup = play;
startScreen.playBtn.ontouchstart = play;

function restart(e) {
    e.preventDefault();
    gameScreen.loseContainer.style.display = "none";
    resetPosition();
    level = defaultStats.level;
    speedMultiplier = defaultStats.speedMultiplier;
    cash = defaultStats.cash;
    bet = defaultStats.bet;
    betMultiplier = defaultStats.betMultiplier;
    setText();
    gameScreen.betContainer.style.display = "block";
};
gameScreen.restartBtn.onmouseup = restart;
gameScreen.restartBtn.ontouchstart = restart;

function startRound(e) {
    e.preventDefault();
    if (bet <= 0 || bet > cash) {bet=0; return;};
    raise(currShell, currShell, function() {
        swap(gameScreen.shells, Math.max(100-(speedMultiplier*10),22), level, 0);
    });
    gameScreen.betContainer.style.display = "none";
};

function betButtons() {
    var btnArray = gameScreen.increments.children;
    var btnIncrement = 0;
    var setUpButton = function(elem) {
        btnIncrement++;
        var increment = btnIncrement;
        var debounce = false;
        var addBet = function(e) {
            e.preventDefault();
            if (debounce) {return;};
            debounce = true;
            var calcIncrement = increment+betMultiplier;
            var pendingBet = 0;
            if (calcIncrement%2 == 1) {
                pendingBet += 5*(Math.pow(10,Math.max(Math.floor(calcIncrement/2)+1,1)));
            } else {
                pendingBet += Math.pow(10,Math.floor(calcIncrement/2)+1);
            };
            
            if (bet + pendingBet <= cash) {
                bet += pendingBet;
                startRound(e);
            };

            setTimeout(function() {
                debounce = false;
            },100);
        };
        elem.onmouseup = addBet;
        elem.ontouchstart = addBet;
    };
    for (var i = 0; i < btnArray.length; i++) {
        setUpButton(btnArray[i]);
    };
};
betButtons();

function shellButtons() {
    var onClick = function(e) {
        e.preventDefault();
        if (gameScreen.shellContainer.classList.contains("active")) {
            gameScreen.shellContainer.classList.remove("active");
            var grabResult = function(result) {
                if (result == "correct") {
                    level++;
                    speedMultiplier = defaultStats.speedMultiplier + (Math.floor(level/3)/10);
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
                    gameScreen.betContainer.style.display = "block";
                };
            };
            raise(e.target,currShell,grabResult,true);
        };
    };
    for (var i = 0; i < gameScreen.shells.length; i++) {
        var elem = gameScreen.shells[i];
        elem.onmouseup = onClick;
        elem.ontouchstart = onClick;
        elem.setAttribute("data-pos",posArray[i]);
    };
};
shellButtons();

};  