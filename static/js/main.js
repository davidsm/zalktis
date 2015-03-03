function main() {
    var zalktis = new Zalktis();
    document.querySelector("#shutdown-button").addEventListener("click", function () {
	zalktis.shutdown();
    });
}

document.addEventListener("DOMContentLoaded", main);
