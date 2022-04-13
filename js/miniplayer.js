window.onload = function() {

    let volumePlus = document.getElementById("volumePlus");
    let volumeMinus = document.getElementById("volumeMinus");
    let speedPlus = document.getElementById("speedPlus");
    let speedMinus = document.getElementById("speedMinus");

    volumePlus.addEventListener("click", function(){
        let volume = document.getElementById("volValue");
        volume.innerHTML = parseInt(volume.innerHTML) + 1;
    });
    volumeMinus.addEventListener("click", function(){
        let volume = document.getElementById("volValue");
        volume.innerHTML = parseInt(volume.innerHTML) - 1;
    });

    speedPlus.addEventListener("click", function(){
        let speed = document.getElementById("speedValue");
        speed.innerHTML = parseInt(speed.innerHTML) + 1;
    });
    speedMinus.addEventListener("click", function(){
        let speed = document.getElementById("speedValue");
        speed.innerHTML = parseInt(speed.innerHTML) - 1;
    });
}