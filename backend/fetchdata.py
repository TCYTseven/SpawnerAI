import requests
import os
import herovalues
from dotenv import load_dotenv
load_dotenv()

# dota 2
def dota2matches(steamid=76561198420364098):
    try:
        steamid -= 76561197960265728

        response = requests.get(f"https://api.opendota.com/api/players/{steamid}/matches?limit=50")
        
        if response.status_code != 200:
            print(f"OpenDota API error: {response.status_code} - {response.text}")
            return []
        
        matches_json = response.json()
        if not matches_json or not isinstance(matches_json, list):
            print(f"OpenDota API returned invalid data: {matches_json}")
            return []

        herodata = herovalues.getstatsdota()
        matchdata = []
        for match in matches_json:
            try:
                # Ensure hero_id exists in herodata
                hero_id = match.get("hero_id")
                if hero_id not in herodata:
                    print(f"Warning: Hero ID {hero_id} not found in herodata, skipping match")
                    continue
                    
                matchdata.append([
                    herodata[hero_id],
                    match.get("kills", 0),
                    match.get("deaths", 0),
                    match.get("assists", 0),
                    (match.get("player_slot", 0) < 128 and match.get("radiant_win", False)) or (match.get("player_slot", 0) >= 128 and not match.get("radiant_win", False)),
                    match.get("start_time", 0)
                ])
            except Exception as e:
                print(f"Error processing match: {e}")
                continue

        return matchdata
    except Exception as e:
        print(f"Error fetching Dota 2 matches: {e}")
        return []

#league
def leaguematches(riotname="sykkuno", riottag="leaf"):
    riotapikey = os.getenv("riotapikey")
    api = "?api_key="+riotapikey

    try:
        puuid = requests.get(f"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{riotname}/{riottag}"+api).json()["puuid"]
    except (KeyError, Exception) as e:
        print(f"Error fetching PUUID: {e}")
        return []
    
    try:
        match_ids = requests.get(f"https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"+api).json()
    except Exception as e:
        print(f"Error fetching match IDs: {e}")
        return []

    herodata = herovalues.getstatsleague()
    matchdata = []
    for match_id in match_ids:
        try:
            match_response = requests.get(f"https://americas.api.riotgames.com/lol/match/v5/matches/{match_id}"+api).json()
            if "info" not in match_response:
                continue
            
            for participant in match_response["info"].get("participants", []):
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
        except Exception as e:
            print(f"Error processing match {match_id}: {e}")
            continue

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
