import requests
import os
import herovalues
from dotenv import load_dotenv
load_dotenv()

# dota 2
def dota2matches(steamid=76561198420364098):
    steamid -= 76561197960265728

    response = requests.get(f"https://api.opendota.com/api/players/{steamid}/matches?limit=50")

    herodata = herovalues.getstatsdota()
    matchdata = []
    for match in response.json():
        matchdata.append([
            herodata[match["hero_id"]],
            match["kills"],
            match["deaths"],
            match["assists"],
            (match["player_slot"] < 128 and match["radiant_win"]) or (match["player_slot"] >= 128 and not match["radiant_win"]),
            match["start_time"]
        ])

    return matchdata

#league
def leaguematches(riotname="sykkuno", riottag="leaf"):
    riotapikey = os.getenv("riotapikey")
    api = "?api_key="+riotapikey

    puuid = requests.get(f"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{riotname}/{riottag}"+api).json()["puuid"]
    response = requests.get(f"https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"+api)

    herodata = herovalues.getstatsleague()
    matchdata = []
    for match_id in response.json():
        match_response = requests.get(f"https://americas.api.riotgames.com/lol/match/v5/matches/{match_id}"+api).json()
        for participant in match_response["info"]["participants"]:
            if participant["puuid"] == puuid:
                matchdata.append([
                    herodata[participant["championId"]],
                    participant["kills"],
                    participant["deaths"],
                    participant["assists"],
                    participant["win"],
                    match_response["info"]["gameEndTimestamp"]
                ])
                break

    return matchdata


# # apex
# trackerapikey = os.getenv("trackerapikey")

# platform = "xbl"
# platformUserIdentifier = "silv"

# headers = {
#     "TRN-Api-Key": trackerapikey,
#     "Accept": "application/json"
# }
# matchesapex = requests.get(f"https://public-api.tracker.gg/v2/apex/standard/profile/{platform}/{platformUserIdentifier}", headers=headers).json()

# print(matchesapex)
