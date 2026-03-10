function openEnvelope() {

    const envelope = document.getElementById("envelope");
    const letter = document.getElementById("letter");
    const button = document.querySelector(".openButton");

    // hide envelope
    envelope.style.display = "none";

    // hide open button
    button.style.display = "none";

    // show letter
    letter.style.display = "block";

}

function showFlowers() {

    const garden = document.getElementById("garden");

    garden.style.display = "block";

}
