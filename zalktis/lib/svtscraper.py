import tornado.gen
from tornado.httpclient import AsyncHTTPClient
import re
import json
from bs4 import BeautifulSoup


_URL_BASE = "http://www.svtplay.se"
_URL_ALL_SHOWS = "http://www.svtplay.se/ajax/sok/forslag.json"


class SVTScraper(object):
    
    @tornado.gen.coroutine
    def get_all_shows(self):
        response = yield AsyncHTTPClient().fetch(_URL_ALL_SHOWS)
        parsed_response = json.loads(response.body)
        raise tornado.gen.Return(parsed_response)

    @tornado.gen.coroutine
    def get_episodes_for_show(self, show_url):
        # Some URLs from the listing are absolute, some relative
        # Deal with that here rather than earlier for now
        # Also, should use urlparse when cleaning this up
        if not show_url.startswith("http"):
            show_url = "%s%s" % (_URL_BASE, show_url)
        response = yield AsyncHTTPClient().fetch(show_url)
        episode_links = BeautifulSoup(response.body).find(id="more-episodes-panel").find_all("a", href=re.compile("/video/"))
        episodes = [{"title": a.find("span", class_="play_videolist-element__title-text").get_text().strip(), "url": a["href"], "thumbnail": a.find("img")["src"]} for a in episode_links]
        raise tornado.gen.Return(episodes)

    @tornado.gen.coroutine
    def get_video_url_for_episode(self, episode_url):
        video_listings_url = "%s%s?output=json" % (_URL_BASE, episode_url)
        response = yield AsyncHTTPClient().fetch(video_listings_url)
        parsed_response = json.loads(response.body)
        for video_listing in parsed_response["video"]["videoReferences"]:
            if video_listing["playerType"] == "ios":
                raise tornado.gen.Return(video_listing["url"])

