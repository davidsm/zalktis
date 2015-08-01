import tornado.gen
from tornado.httpclient import AsyncHTTPClient
import re
import json
from bs4 import BeautifulSoup


_URL_BASE = "http://www.svtplay.se"
_URL_ALL_SHOWS = "http://www.svtplay.se/ajax/sok/forslag.json"


class SVTScraper(object):

    def _format_show(self, show):
        show.pop("isGenre", None)

        # Convert all to absolute URLs
        # Some in the listing are absolute, some are relative
        if not show["url"].startswith("http"):
            show["url"] = "%s%s" % (_URL_BASE, show["url"])
        return show

    def _extract_thumbnail(self, el):
        return el.find("img")["src"].replace("/small/", "/extralarge/")

    def _extract_title(self, el):
        return el.find("span",
                       class_="play_videolist-element__title-text").get_text().strip()

    @tornado.gen.coroutine
    def get_all_shows(self):
        response = yield AsyncHTTPClient().fetch(_URL_ALL_SHOWS)
        parsed_response = json.loads(response.body)
        all_shows = [self._format_show(show) for show in parsed_response
                     if show["isGenre"] != "genre"]
        # Sort by title here rather than on client (should be cheaper)
        raise tornado.gen.Return(sorted(all_shows, key=lambda s: s["title"]))

    @tornado.gen.coroutine
    def get_episodes_for_show(self, show_url):
        response = yield AsyncHTTPClient().fetch(show_url)
        episode_links = BeautifulSoup(response.body).find(id="more-episodes-panel").find_all("a", href=re.compile("/video/"))

        episodes = []
        for a in episode_links:
            episodes.append({
                "title": self._extract_title(a),
                "url": a["href"],
                "thumbnail": self._extract_thumbnail(a)
            })
        raise tornado.gen.Return(episodes)

    @tornado.gen.coroutine
    def get_video_url_for_episode(self, episode_url):
        video_listings_url = "%s%s?output=json" % (_URL_BASE, episode_url)
        response = yield AsyncHTTPClient().fetch(video_listings_url)
        parsed_response = json.loads(response.body)
        for video_listing in parsed_response["video"]["videoReferences"]:
            if video_listing["playerType"] == "ios":
                raise tornado.gen.Return(video_listing["url"])
