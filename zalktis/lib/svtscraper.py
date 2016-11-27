import tornado.gen
from tornado.httpclient import AsyncHTTPClient
import json


_URL_BASE = "http://www.svtplay.se"
_URL_API_BASE = "%s/api" % _URL_BASE
_URL_ALL_SHOWS = "%s/all_titles" % _URL_API_BASE
_URL_SHOW_DETAILS = "%s/title_page;" % _URL_API_BASE


class SVTScraper(object):

    def _format_show(self, show):
        return {
            "title": show["title"],
            "id": show["contentUrl"]
        }

    def _format_episode(self, episode):
        return {
            "title": episode["title"],
            "url": self._build_episode_url(episode["contentUrl"]),
            "thumbnail": self._build_thumbnail_url(episode["thumbnail"]),
            "description": episode.get("description", ""),
            "duration": episode["materialLength"]
        }

    def _extract_shows(self, json_data):
        return json_data

    def _build_episode_url(self, relative_url):
        return "%s%s" % (_URL_BASE, relative_url)

    def _build_thumbnail_url(self, response_url):
        if response_url.startswith("//"):
            prefix = "https:"
        else:
            prefix = ""
        return "%s%s" % (prefix, response_url.replace("{format}", "large"))

    @tornado.gen.coroutine
    def get_all_shows(self):
        response = yield AsyncHTTPClient().fetch(_URL_ALL_SHOWS)
        parsed_response = json.loads(response.body)
        all_shows = [self._format_show(show) for show in
                     self._extract_shows(parsed_response)]
        # Sort by title here rather than on client (should be cheaper)
        raise tornado.gen.Return(sorted(all_shows, key=lambda s: s["title"]))

    @tornado.gen.coroutine
    def get_episodes_for_show(self, show_id):
        response = yield AsyncHTTPClient().fetch("%stitle=%s" % (_URL_SHOW_DETAILS, show_id))
        parsed_response = json.loads(response.body)
        episodes = parsed_response["relatedVideos"]["episodes"]
        formatted_episodes = [self._format_episode(episode) for episode in episodes]
        raise tornado.gen.Return(formatted_episodes)

    @tornado.gen.coroutine
    def get_video_url_for_episode(self, episode_url):
        video_listings_url = "%s?output=json" % episode_url
        response = yield AsyncHTTPClient().fetch(video_listings_url)
        parsed_response = json.loads(response.body)
        for video_listing in parsed_response["video"]["videoReferences"]:
            if video_listing["playerType"] == "ios":
                raise tornado.gen.Return(video_listing["url"])
