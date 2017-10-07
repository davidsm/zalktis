import tornado.gen
from tornado.httpclient import AsyncHTTPClient
import json
import urlparse
import logging


_URL_BASE = "https://www.svtplay.se"
_URL_API_BASE = "%s/api" % _URL_BASE
_URL_ALL_SHOWS = "%s/all_titles_and_singles" % _URL_API_BASE
_URL_SHOW_EPISODES = "%s/title_episodes_by_article_id" % _URL_API_BASE
_URL_SHOW_EPISODES_ALT = "%s/title_episodes_by_episode_article_id" % _URL_API_BASE
_URL_VIDEO_API_BASE = "https://api.svt.se/videoplayer-api/video"

logger = logging.getLogger("tornado.application")


class SVTScraper(object):

    def _format_show(self, show):
        return {
            "title": show["programTitle"],
            "id": show["contentUrl"]
        }

    def _format_episode(self, episode):
        return {
            "title": episode["title"],
            "url": self._build_episode_url(episode["versions"][0]["id"]),
            "thumbnail": self._build_thumbnail_url(episode["thumbnail"]),
            "description": episode.get("description", ""),
            "duration": episode["materialLength"],
            "season": episode["season"],
            "episode": episode["episodeNumber"]
        }

    def _extract_shows(self, json_data):
        return json_data

    def _build_episode_url(self, relative_url):
        return "%s/%s" % (_URL_VIDEO_API_BASE, relative_url)

    def _build_thumbnail_url(self, response_url):
        if response_url.startswith("//"):
            prefix = "https:"
        else:
            prefix = ""
        return "%s%s" % (prefix, response_url.replace("{format}", "large"))

    def _strip_query_string(self, url):
        split_url = urlparse.urlsplit(url)
        return urlparse.urlunsplit((split_url.scheme, split_url.netloc, split_url.path, "", ""))

    @tornado.gen.coroutine
    def get_all_shows(self):
        response = yield AsyncHTTPClient().fetch(_URL_ALL_SHOWS)
        parsed_response = json.loads(response.body)
        all_shows = [self._format_show(show) for show in
                     self._extract_shows(parsed_response)]
        # Sort by title here rather than on client (should be cheaper)
        raise tornado.gen.Return(sorted(all_shows, key=lambda s: s["title"]))

    @tornado.gen.coroutine
    def get_episodes_for_show(self, show_url):
        # SVTPlay uses two different formats for getting an episode listing from the shows listing:
        # First is /<name-of-show>. Here you first need to get the show page by the title?slug=<name-of-show>,
        # That call will give you an episode id, which you can use with the show episodes endpoint.
        #
        # The second format is /video/<id_of_show>/whatever/whatever
        # Here you can extract the id from the path, and use it immediately with the show episodes endpoint.
        if show_url.startswith("/video/"):
            show_id = show_url.split("/")[2]
            url = "%s?articleId=%s" % (_URL_SHOW_EPISODES_ALT, show_id)
        else:
            # This is a bit sloppy as there could conceivably be more formats...
            slug = show_url.strip("/")
            title_response = yield AsyncHTTPClient().fetch("%s/title?slug=%s" % (_URL_API_BASE, slug))
            parsed_title_response = json.loads(title_response.body)
            show_id = parsed_title_response["articleId"]
            url = "%s?articleId=%s" % (_URL_SHOW_EPISODES, show_id)

        logger.debug("Fetching episodes from %s", url)
        response = yield AsyncHTTPClient().fetch(url)
        parsed_response = json.loads(response.body)
        formatted_episodes = sorted([self._format_episode(episode) for episode in parsed_response],
                                    key=lambda e: (e["season"], e["episode"]))
        raise tornado.gen.Return(formatted_episodes)

    @tornado.gen.coroutine
    def get_video_url_for_episode(self, videos_list_url):
        logger.debug("Fetching available videos from %s", videos_list_url)
        response = yield AsyncHTTPClient().fetch(videos_list_url)
        parsed_response = json.loads(response.body)
        for video_listing in parsed_response["videoReferences"]:
            if video_listing["format"] == "hls":
                url = video_listing["url"]
                # SVTPlay's weird query strings can sometimes confuse OMXPlayer
                # to the point where it won't interpret the URL properly.
                # As the video URL seems to work fine without any query options,
                # just use the path
                raise tornado.gen.Return(self._strip_query_string(url))


if __name__ == "__main__":
    import tornado.ioloop
    logger.setLevel(logging.DEBUG)

    @tornado.gen.coroutine
    def self_test():
        scraper = SVTScraper()
        shows = yield scraper.get_all_shows()
        print shows[:5]
        episodes = yield scraper.get_episodes_for_show(shows[0]["id"])
        print episodes[:2]
        video_url = yield scraper.get_video_url_for_episode(episodes[0]["url"])
        print video_url

    io_loop = tornado.ioloop.IOLoop.current()
    io_loop.run_sync(self_test)
