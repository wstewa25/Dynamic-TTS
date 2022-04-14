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
        switch (readSpeed.current) {
            case 0.25:
                editReadSpeed(0.25);
            case 0.5:
                editReadSpeed(0.5);
            case 1.0:
                    editReadSpeed(1);
            case 2.0:
                editReadSpeed(1);
            case 3.0:
                editReadSpeed(1);
            case 4.0:
                console.log("Max speed already reached");
            default:
                console.log("error in speedPlus");
        }
        speed.InnerHTML = readSpeed.current;
    });
    speedMinus.addEventListener("click", function(){
        let speed = document.getElementById("speedValue");
        switch (readSpeed.current) {
            case 0.25:
                console.log("Min speed already reached");
            case 0.5:
                editReadSpeed(-0.25);
            case 1.0:
                editReadSpeed(-0.5);
            case 2.0:
                editReadSpeed(-1);
            case 3.0:
                editReadSpeed(-1);
            case 4.0:
                editReadSpeed(-1);
            default:
                console.log("error in speedMinus");
        }
        speed.InnerHTML = readSpeed.current;
    });
}