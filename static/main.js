"use strict";

window.onload = function () {

    var endpoint = "https://api.twitch.tv/kraken/streams/lapixx";

    fetchData(endpoint)
    .then(function (data) {
        
        var game = data.stream && data.stream.game;
        if (game) document.title = game + " / Lapixx";
    });
};
