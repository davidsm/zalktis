function main() {
    var zalktis = new Zalktis();
    document.querySelector("#shutdown-button").addEventListener("click", function () {
	zalktis.system.shutdown();
    });
    document.querySelector("#svtplay-button").addEventListener("click", function () {
	var actionArea = document.querySelector("#action-area");
        actionArea.style.left = "0";
        var showSelect = document.createElement("select");
        showSelect.className = "action-select";
        actionArea.appendChild(showSelect);
        zalktis.svtplay.get_all_shows().then(function (shows) {
            for (var i=0; i < shows.length; i++) {
                var o = document.createElement("option");
                o.value = i;
                o.innerHTML = shows[i].title;
                showSelect.appendChild(o);
            }
            showSelect.addEventListener("change", function (e) {
                zalktis.svtplay.get_episodes_for_show({
                    show_url: shows[e.target.value].url
                }).then(function (episodes) {
                    for (var i=0; i < episodes.length; i++) {
                        var a = document.createElement("a");
                        a.className = "video-thumb";
                        a.dataset.url = episodes[i].url;

                        var thumb = document.createElement("img");
                        thumb.src = episodes[i].thumbnail;
                        a.appendChild(thumb);

                        var text = document.createElement("span");
                        text.innerHTML = episodes[i].title;
                        a.appendChild(text);
                        
                        actionArea.appendChild(a);
                        a.addEventListener("click", function (e) {

                            zalktis.svtplay.get_video_url_for_episode({
                                episode_url: e.currentTarget.dataset.url
                            }).then(function (url) {
                                zalktis.player.play({
                                    "protocol": "http",
                                    "uri": url.replace("http://", "")
                                });
                            });
                        });
                    }
                });
            });
        });
    });
}

document.addEventListener("DOMContentLoaded", main);
