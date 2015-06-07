var zalktis = new Zalktis();

var VideoSelector = React.createClass({
    displayName: "VideoSelector",

    getInitialState: function () {
        return {
            shows: [],
            videos: []
        };
    },

    componentDidMount: function () {
        zalktis.svtplay.get_all_shows().then(function (shows) {
            this.setState({
                shows: shows
            });
        }.bind(this));
    },

    _onChange: function (e) {
        zalktis.svtplay.get_episodes_for_show({
            show_url: this.state.shows[e.target.value].url
        }).then(function (episodes) {
            this.setState({
                videos: episodes
            });
        }.bind(this));
    },
    
    render: function () {
        var children = [
            React.DOM.select({
                onChange: this._onChange,
                className: "action-select"
            }, this.state.shows.map(function (show, i) {
                return React.DOM.option({value: i}, show.title)
            }))
        ].concat(this.state.videos.map(function (video) {
            return React.createElement(VideoItem, {
                data: video
            })
        }));
        return (
            React.DOM.div(
                null,               
                children              
            )  
        );
    }
});


var VideoItem = React.createClass({
    displayName: "VideoItem",
    _onClick: function (e) {
        zalktis.svtplay.get_video_url_for_episode({
            episode_url: this.props.data.url
        }).then(function (url) {
            zalktis.player.play({
                "protocol": "http",
                "uri": url.replace("http://", "")
            });
        }.bind(this));
    },
    render: function () {
        return (
            React.DOM.a({
                onClick: this._onClick,
                className: "video-thumb"
            }, React.DOM.img({
                src: this.props.data.thumbnail
            }), React.DOM.span(
                null,
                this.props.data.title
            ))
        );
    }
});

function main() {
    document.querySelector("#shutdown-button").addEventListener("click", function () {
	zalktis.system.shutdown();
    });
    document.querySelector("#svtplay-button").addEventListener("click", function () {
	var actionArea = document.querySelector("#action-area");
        actionArea.style.left = "0";
        React.render(React.createElement(VideoSelector, null),
                     actionArea);
    });
}

document.addEventListener("DOMContentLoaded", main);
