from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fetchdata, model, synergy
from auth import get_current_user, get_optional_user
from database import get_user_profile, get_user_by_email
from datetime import datetime
from collections import defaultdict
import json


class SynergyRequest(BaseModel):
    other_user_email: str

class UserProfileRequest(BaseModel):
    riot_name: str | None = None
    riot_id: str | None = None
    steam_id: str | None = None

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

@app.post("/checkProfileExists")
def check_profile_exists(user: dict = Depends(get_current_user)):
    """
    Check if the current user already has a profile.
    Used after signup to prevent re-onboarding.
    Requires authentication.
    """
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(
                status_code=401,
                detail="User email not found in token"
            )
        
        profile = get_user_profile(user_email)
        
        if profile:
            raise HTTPException(
                status_code=409,
                detail="You already have a profile. Please log in instead."
            )
        
        return {
            "has_profile": False,
            "message": "No profile exists, ready for onboarding"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error checking profile: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error checking profile: {str(e)}"
        )

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
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(
                status_code=401,
                detail="User email not found in token"
            )
        
        # Fetch user profile from Supabase
        profile = get_user_profile(user_email)
        
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
            "user_email": user_email
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
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(
                status_code=401,
                detail="User email not found in token"
            )
        
        # Fetch user profile from Supabase
        profile = get_user_profile(user_email)
        
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
            "user_email": user_email
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

@app.post("/getSynergy")
def get_synergy(
    request: SynergyRequest,
    user: dict = Depends(get_current_user)
):
    """
    Get team synergy analysis between current user and another user.
    Calculates synergy based on both players' affinities.
    """
    try:
        current_user_email = user.get("email")
        if not current_user_email:
            raise HTTPException(
                status_code=401,
                detail="User email not found in token"
            )
        
        other_user = get_user_by_email(request.other_user_email)
        if not other_user:
            raise HTTPException(
                status_code=404,
                detail=f"User with email {request.other_user_email} not found"
            )
        
        current_user_profile = get_user_profile(current_user_email)
        if not current_user_profile:
            raise HTTPException(
                status_code=404,
                detail="Your profile not found. Please complete onboarding first."
            )
        
        other_user_profile = get_user_profile(request.other_user_email)
        if not other_user_profile:
            raise HTTPException(
                status_code=404,
                detail=f"User profile for {request.other_user_email} not found."
            )
        
        current_affinity = {}
        other_affinity = {}
        
        steam_id = current_user_profile.get("steam_id")
        riot_name = current_user_profile.get("riot_name")
        riot_id = current_user_profile.get("riot_id")
        
        if steam_id or (riot_name and riot_id):
            current_affinity_result = {
                "dota2": None,
                "league": None
            }
            
            if steam_id:
                try:
                    steamid_int = int(steam_id)
                    dotamatches = fetchdata.dota2matches(steamid_int)
                    if dotamatches:
                        current_affinity_result["dota2"] = model.predict(dotamatches)
                except (ValueError, Exception):
                    pass
            
            if riot_name and riot_id:
                try:
                    leaguematches = fetchdata.leaguematches(riot_name, riot_id)
                    if leaguematches:
                        current_affinity_result["league"] = model.predict(leaguematches)
                except Exception:
                    pass
            
            current_affinity = current_affinity_result
        
        steam_id_other = other_user_profile.get("steam_id")
        riot_name_other = other_user_profile.get("riot_name")
        riot_id_other = other_user_profile.get("riot_id")
        
        if steam_id_other or (riot_name_other and riot_id_other):
            other_affinity_result = {
                "dota2": None,
                "league": None
            }
            
            if steam_id_other:
                try:
                    steamid_int = int(steam_id_other)
                    dotamatches = fetchdata.dota2matches(steamid_int)
                    if dotamatches:
                        other_affinity_result["dota2"] = model.predict(dotamatches)
                except (ValueError, Exception):
                    pass
            
            if riot_name_other and riot_id_other:
                try:
                    leaguematches = fetchdata.leaguematches(riot_name_other, riot_id_other)
                    if leaguematches:
                        other_affinity_result["league"] = model.predict(leaguematches)
                except Exception:
                    pass
            
            other_affinity = other_affinity_result
        
        if not current_affinity or not other_affinity:
            raise HTTPException(
                status_code=404,
                detail="Could not fetch affinity data for one or both users"
            )
        
        synergy_results = {}
        
        if current_affinity.get("dota2") and other_affinity.get("dota2"):
            current_skills = [
                current_affinity["dota2"].get("offense", 0),
                current_affinity["dota2"].get("tank", 0),
                current_affinity["dota2"].get("support", 0),
                current_affinity["dota2"].get("scout", 0),
                current_affinity["dota2"].get("hybrid", 0),
            ]
            other_skills = [
                other_affinity["dota2"].get("offense", 0),
                other_affinity["dota2"].get("tank", 0),
                other_affinity["dota2"].get("support", 0),
                other_affinity["dota2"].get("scout", 0),
                other_affinity["dota2"].get("hybrid", 0),
            ]
            
            synergy_result = synergy.calculate(current_skills, other_skills)
            synergy_data = json.loads(synergy_result)
            synergy_results["dota2"] = synergy_data
        
        if current_affinity.get("league") and other_affinity.get("league"):
            current_skills = [
                current_affinity["league"].get("offense", 0),
                current_affinity["league"].get("tank", 0),
                current_affinity["league"].get("support", 0),
                current_affinity["league"].get("scout", 0),
                current_affinity["league"].get("hybrid", 0),
            ]
            other_skills = [
                other_affinity["league"].get("offense", 0),
                other_affinity["league"].get("tank", 0),
                other_affinity["league"].get("support", 0),
                other_affinity["league"].get("scout", 0),
                other_affinity["league"].get("hybrid", 0),
            ]
            
            synergy_result = synergy.calculate(current_skills, other_skills)
            synergy_data = json.loads(synergy_result)
            synergy_results["league"] = synergy_data
        
        if not synergy_results:
            raise HTTPException(
                status_code=400,
                detail="Could not calculate synergy - no common games played"
            )
        
        return {
            "synergy": synergy_results,
            "other_user_email": request.other_user_email,
            "current_user_email": current_user_email
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating synergy: {str(e)}")

@app.post("/getSquadMembers")
def get_squad_members(
    user: dict = Depends(get_current_user)
):
    """
    Get all squad members for the current user.
    Returns list of squad members with their email and League affinity data.
    """
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(
                status_code=401,
                detail="User email not found in token"
            )
        
        profile = get_user_profile(user_email)
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User profile not found"
            )
        
        members = []
        members.append({
            "email": user_email,
            "riot_name": profile.get("riot_name"),
            "riot_id": profile.get("riot_id"),
            "is_self": True
        })
        
        return {"members": members}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching squad members: {str(e)}")

@app.post("/addSquadMember")
def add_squad_member(
    request: SynergyRequest,
    user: dict = Depends(get_current_user)
):
    """
    Add a player to the current user's squad by email.
    """
    try:
        current_user_email = user.get("email")
        if not current_user_email:
            raise HTTPException(
                status_code=401,
                detail="User email not found in token"
            )
        
        if current_user_email == request.other_user_email:
            raise HTTPException(
                status_code=400,
                detail="Cannot add yourself to squad"
            )
        
        other_user = get_user_by_email(request.other_user_email)
        if not other_user:
            raise HTTPException(
                status_code=404,
                detail=f"User with email {request.other_user_email} not found"
            )
        
        return {
            "message": "Member added successfully",
            "email": request.other_user_email,
            "riot_name": other_user.get("riot_name"),
            "riot_id": other_user.get("riot_id"),
            "is_self": False
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding squad member: {str(e)}")

@app.post("/getSuggestedRole")
def get_suggested_role(
    request: SynergyRequest,
    user: dict = Depends(get_current_user)
):
    """
    Get the suggested League role for a player based on their affinity.
    Returns top role suggestion.
    """
    try:
        other_user = get_user_by_email(request.other_user_email)
        if not other_user:
            raise HTTPException(
                status_code=404,
                detail=f"User with email {request.other_user_email} not found"
            )
        
        other_profile = get_user_profile(request.other_user_email)
        if not other_profile:
            raise HTTPException(
                status_code=404,
                detail=f"Profile not found for {request.other_user_email}"
            )
        
        riot_name = other_profile.get("riot_name")
        riot_id = other_profile.get("riot_id")
        
        if not riot_name or not riot_id:
            return {
                "email": request.other_user_email,
                "suggested_role": "Unknown",
                "affinity": None
            }
        
        try:
            leaguematches = fetchdata.leaguematches(riot_name, riot_id)
            if leaguematches:
                affinity = model.predict(leaguematches)
                role_mapping = {
                    "tank": "Top",
                    "scout": "Jungle",
                    "offense": "Mid",
                    "hybrid": "ADC",
                    "support": "Support"
                }
                
                best_role_key = max(affinity.items(), key=lambda x: x[1])[0]
                suggested_role = role_mapping.get(best_role_key, "Unknown")
                
                return {
                    "email": request.other_user_email,
                    "suggested_role": suggested_role,
                    "affinity": affinity
                }
        except Exception as e:
            print(f"Error getting suggested role: {e}")
        
        return {
            "email": request.other_user_email,
            "suggested_role": "Unknown",
            "affinity": None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting suggested role: {str(e)}")

@app.post("/initializeUserProfile")
def initialize_user_profile(
    profile_data: UserProfileRequest,
    user: dict = Depends(get_current_user)
):
    """
    Initialize or update user profile after signup.
    This endpoint creates/updates the user_profiles table entry.
    Requires authentication.
    """
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(
                status_code=401,
                detail="User email not found in token"
            )
        
        existing_profile = get_user_profile(user_email)
        
        from database import supabase
        
        profile_to_save = {
            "email": user_email,
        }
        
        if profile_data.riot_name and profile_data.riot_name.strip():
            profile_to_save["riot_name"] = profile_data.riot_name.strip()
        
        if profile_data.riot_id and profile_data.riot_id.strip():
            profile_to_save["riot_id"] = profile_data.riot_id.strip()
        
        if profile_data.steam_id and profile_data.steam_id.strip():
            profile_to_save["steam_id"] = profile_data.steam_id.strip()
        
        if existing_profile:
            response = supabase.table("user_profiles").update(
                profile_to_save
            ).eq("email", user_email).execute()
        else:
            response = supabase.table("user_profiles").insert(
                profile_to_save
            ).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to save profile"
            )
        
        return {
            "success": True,
            "message": "Profile initialized successfully",
            "email": user_email
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error initializing user profile: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error initializing profile: {str(e)}"
        )

# Note: Run the server with: uvicorn main:app --reload --port 8000
# Do NOT call uvicorn.run() here as it conflicts with command-line execution
