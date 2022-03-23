document.addEventListener('DOMContentLoaded', function(event) {
    document.getElementById("submit_text").addEventListener("click", function(){
        let readstr = document.getElementById("test_read").innerText;
        console.log("got text box info");
        chrome.tts.speak('Hello, world.');
    });
  })