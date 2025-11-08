from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fetchdata, model
from auth import get_current_user, get_optional_user
from database import get_user_profile
from datetime import datetime
from collections import defaultdict

app = FastAPI(
    title="Spawner AI Backend",
    description="Backend API for Spawner AI - League of Legends team composition tool",
    version="1.0.0"
)

# --- CORS Setup ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost",
    "https://yourfrontend.com",  # add your production domain(s)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "FastAPI is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/getAffinity")
def get_affinity(
    user: dict = Depends(get_current_user)
):
    """
    Get role affinity predictions based on Dota 2 and League of Legends match data.
    Returns separate affinities for each game.
    Fetches user profile from Supabase database.
    Requires authentication.
    """
    try:
        # Fetch user profile from Supabase
        profile = get_user_profile(user["id"])
        
        if not profile:
            raise HTTPException(
                status_code=404, 
                detail="User profile not found. Please complete onboarding first."
            )
        
        steam_id = profile.get("steam_id")
        riot_name = profile.get("riot_name")
        riot_id = profile.get("riot_id")
        
        result = {
            "dota2": None,
            "league": None,
            "user_id": user["id"]
        }
        
        # Fetch Dota 2 match data
        if steam_id:
            try:
                steamid_int = int(steam_id)
                dotamatches = fetchdata.dota2matches(steamid_int)
                if dotamatches:
                    result["dota2"] = {
                        "affinity": model.predict(dotamatches),
                        "match_count": len(dotamatches)
                    }
            except ValueError:
                pass  # Invalid Steam ID format
            except Exception as e:
                print(f"Error fetching Dota 2 matches: {e}")
                # Don't fail completely, just skip Dota 2
        
        # Fetch League of Legends match data
        if riot_name and riot_id:
            try:
                leaguematches = fetchdata.leaguematches(riot_name, riot_id)
                if leaguematches:
                    result["league"] = {
                        "affinity": model.predict(leaguematches),
                        "match_count": len(leaguematches)
                    }
            except Exception as e:
                print(f"Error fetching League matches: {e}")
                # Don't fail completely, just skip League
        
        # Check if we have at least one game's data
        if not result["dota2"] and not result["league"]:
            raise HTTPException(
                status_code=404,
                detail="No match data found. Please ensure your accounts are valid and have played matches."
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/getMatchHistory")
def get_match_history(
    user: dict = Depends(get_current_user)
):
    """
    Get match history with timestamps for skill progression analysis.
    Returns matches grouped by month with skill progression data for both Dota 2 and League of Legends.
    """
    try:
        # Fetch user profile from Supabase
        profile = get_user_profile(user["id"])
        
        if not profile:
            raise HTTPException(
                status_code=404, 
                detail="User profile not found. Please complete onboarding first."
            )
        
        steam_id = profile.get("steam_id")
        riot_name = profile.get("riot_name")
        riot_id = profile.get("riot_id")
        
        result = {
            "dota2": None,
            "league": None,
            "user_id": user["id"]
        }
        
        # Process Dota 2 matches
        if steam_id:
            try:
                steamid_int = int(steam_id)
                dotamatches = fetchdata.dota2matches(steamid_int)
                
                if dotamatches:
                    # Group matches by month
                    # dotamatches format: [hero_stats, kills, deaths, assists, win, start_time]
                    matches_by_month = defaultdict(list)
                    
                    for match in dotamatches:
                        if len(match) >= 6:  # Ensure we have start_time
                            timestamp = match[5]  # Unix timestamp
                            month_key = datetime.fromtimestamp(timestamp).strftime("%Y-%m")
                            matches_by_month[month_key].append(match)
                    
                    # Calculate affinity for each month
                    monthly_progression = []
                    for month in sorted(matches_by_month.keys()):
                        month_matches = matches_by_month[month]
                        month_affinity = model.predict(month_matches)
                        
                        month_date = datetime.strptime(month, "%Y-%m")
                        month_display = month_date.strftime("%b %Y")
                        
                        monthly_progression.append({
                            "month": month_display,
                            "month_key": month,
                            "affinity": month_affinity,
                            "match_count": len(month_matches)
                        })
                    
                    result["dota2"] = {
                        "progression": monthly_progression,
                        "total_matches": len(dotamatches)
                    }
            except ValueError:
                pass  # Invalid Steam ID format
            except Exception as e:
                print(f"Error processing Dota 2 matches: {e}")
        
        # Process League of Legends matches
        if riot_name and riot_id:
            try:
                leaguematches = fetchdata.leaguematches(riot_name, riot_id)
                
                if leaguematches:
                    # Group matches by month
                    # leaguematches format: [hero_stats, kills, deaths, assists, win, gameEndTimeStamp]
                    matches_by_month = defaultdict(list)
                    
                    for match in leaguematches:
                        if len(match) >= 6:  # Ensure we have gameEndTimeStamp
                            timestamp = match[5] / 1000  # Convert milliseconds to seconds
                            month_key = datetime.fromtimestamp(timestamp).strftime("%Y-%m")
                            matches_by_month[month_key].append(match)
                    
                    # Calculate affinity for each month
                    monthly_progression = []
                    for month in sorted(matches_by_month.keys()):
                        month_matches = matches_by_month[month]
                        month_affinity = model.predict(month_matches)
                        
                        month_date = datetime.strptime(month, "%Y-%m")
                        month_display = month_date.strftime("%b %Y")
                        
                        monthly_progression.append({
                            "month": month_display,
                            "month_key": month,
                            "affinity": month_affinity,
                            "match_count": len(month_matches)
                        })
                    
                    result["league"] = {
                        "progression": monthly_progression,
                        "total_matches": len(leaguematches)
                    }
            except Exception as e:
                print(f"Error processing League matches: {e}")
        
        # Check if we have at least one game's data
        if not result["dota2"] and not result["league"]:
            raise HTTPException(
                status_code=404,
                detail="No match data found."
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

# @app.post("/getSynergy")
# def get_synergy(
#     request: SynergyRequest,
#     user: dict = Depends(get_current_user)
# ):
#     """
#     Get team synergy analysis.
#     Requires authentication.
#     """
#     pass

# Note: Run the server with: uvicorn main:app --reload --port 8000
# Do NOT call uvicorn.run() here as it conflicts with command-line execution
