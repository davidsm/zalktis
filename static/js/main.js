function main() {
    var zalktis = new Zalktis();
    document.querySelector("#shutdown-button").addEventListener("click", function () {
	zalktis.system.shutdown();
    });
}

document.addEventListener("DOMContentLoaded", main);
