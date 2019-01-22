window.onload = function() {
const container = document.getElementById("shell-container");
const shells = [
    document.getElementById("shell1"),
    document.getElementById("shell2"),
    document.getElementById("shell3")
];
const pearl = document.getElementById("pearl");
const levelText = document.getElementById("level-text");

let level = 1;
let speedMultiplier = 0.5;
let currShell = shells[1];

function resetPosition() {
    const size = container.offsetWidth;
    const half = shells[0].offsetWidth/2;
    shells[0].style.left = "0";
    shells[1].style.left = (size/2) - half + "px";
    shells[2].style.left = size - (half*2) + "px";
};

function swap(shells, frames, level, looped=0, _callBack, originShells, originLevel) {
    const randShells = randomizeShells(shells);
    const elem1 = randShells[0];
    const elem2 = randShells[1];
    const elem3 = randShells[2];
    const pos1 = elem1.style.left.match(/\d+/g).map(Number)[0];
    const pos2 = elem2.style.left.match(/\d+/g).map(Number)[0];
    const mid = Math.abs(pos2-pos1)/2;
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
            elem1.style.left = pos2 + "px";
            elem2.style.left = pos1 + "px";
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
                    document.getElementById("shell-container").classList.add("active");
                } else {
                    _callBack(originShells, frames, originLevel, looped)
                };
            };
            return;
        };
        if (target <= mid) {
            elem1.style.bottom = yTarget + "px";
            elem2.style.bottom = -yTarget + "px";
        } else {
            elem1.style.bottom = 200 - yTarget + "px";
            elem2.style.bottom = -200 + yTarget + "px";
        };
        elem1.style.left = pos1 + (dir*target) + 'px'; 
        elem2.style.left = pos2 - (dir*target) + 'px'; 
    }
};

function raise(elem, currShell, _callBack, correct) {
    let pearl = null;
    if (currShell == elem) {
        pearl = document.createElement("div");
        pearl.id = "pearl";
        document.getElementById("shell-container").append(pearl);
        pearl.style.bottom = 0;
        pearl.style.left = parseInt(elem.style.left.replace("px", "")) + ((elem.offsetWidth/2) - (pearl.offsetWidth/2)) + "px";
        pearl.style.display = "block";
        pearl.style.zIndex = 0;
    };
    let id = setInterval(frame, 5);
    let yTarget = 1;
    let dir = 0.5;
    function frame() {
        elem.style.bottom = yTarget + "%";
        if (yTarget <= 30) {
        elem.style.transform = `rotate(${-yTarget}deg)`;
        };
        yTarget += dir;
        if (yTarget >= 100) {
            dir = -0.5;
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



shells.forEach(function(elem){
    elem.onmouseup = function() {
        if (container.classList.contains("active")) {
            container.classList.remove("active");
            function grabResult(result) {
                if (result == "correct") {
                    level++;
                    levelText.textContent = level;
                    speedMultiplier = Math.floor(level/5);
                } else if (!result) {
                    raise(currShell,currShell, grabResult);
                    return;
                };
                swap(shells, Math.max(100-(level*speedMultiplier*10),30), level);
            };
            raise(elem,currShell,grabResult,true);
        };
    };
});

function start() {
    setTimeout(function() {
        resetPosition();
        raise(currShell,currShell);
        setTimeout(function() {swap(shells, 100, level)},3000);
    },300);
};

// screen.orientation.lock("landscape").catch(function(e) {
//     levelText.textContent = e.message;
// });

resetPosition();

// window.onresize = function() {
//     resetPosition();
// };

function doOnOrientationChange(e) {
    switch(Math.abs(window.orientation)) {  
      case 90:
        break; 
      default:
        start();
        break; 
    }
}
  
window.addEventListener('orientationchange', doOnOrientationChange);
  
// Initial execution if needed
doOnOrientationChange();
};  