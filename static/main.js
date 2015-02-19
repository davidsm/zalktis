function main() {
    document.querySelector("#shutdown_button").addEventListener("click", function () {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/system");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(JSON.stringify({command: "shutdown"}));
    });
}

document.addEventListener("DOMContentLoaded", main);