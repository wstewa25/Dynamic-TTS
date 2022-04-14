window.onload = function() {

    let volumePlus = document.getElementById("volumePlus");
    let volumeMinus = document.getElementById("volumeMinus");
    let speedPlus = document.getElementById("speedPlus");
    let speedMinus = document.getElementById("speedMinus");

    volumePlus.addEventListener("click", function(){
        let volume = document.getElementById("volValue");
        volume.innerHTML = parseInt(volume.innerHTML) + 1;
        editVolume(0.01);
    });
    volumeMinus.addEventListener("click", function(){
        let volume = document.getElementById("volValue");
        volume.innerHTML = parseInt(volume.innerHTML) - 1;
        editVolume(-0.01);
    });

    speedPlus.addEventListener("click", function(){
        let speed = document.getElementById("speedValue");
        if (!processingReadSpeedRequest){
        console.log("edit read speed");
        editReadSpeed(0.25);
        console.log("changed read speed to " + readSpeed.current);
        }
        speed.InnerHTML = readSpeed.current;
    });
    speedMinus.addEventListener("click", function(){
        let speed = document.getElementById("speedValue");
        editReadSpeed(-0.25);
        speed.InnerHTML = readSpeed.current;
    });
}