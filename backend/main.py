from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import fetchdata, model, synergy
from auth import get_current_user, get_optional_user
from database import get_user_profile, get_user_by_email
from datetime import datetime
from collections import defaultdict
import json
import numpy as np
import requests

def convert_affinity_to_python_types(affinity_dict: Dict[str, Any]) -> Dict[str, float]:
    """
    Convert numpy types in affinity dictionary to native Python types for JSON serialization.
    """
    return {key: float(value) for key, value in affinity_dict.items()}


class SynergyRequest(BaseModel):
    other_user_email: str

class UserProfileRequest(BaseModel):
    riot_name: str | None = None
    riot_id: str | None = None
    steam_id: str | None = None

class OnboardingDataRequest(BaseModel):
    games: Optional[Dict[str, str]] = None  # {apex: username, csgo: username, dota2: username}
    fortnite: Optional[Dict[str, Any]] = None  # {gamemode, role, years, competitive}
    valorant: Optional[Dict[str, Any]] = None  # {agent, mode, role, years, competitive}
    league: Optional[Dict[str, Any]] = None  # {champion, mode, role, years, competitive}

class PatchAnalysisRequest(BaseModel):
    patch_title: str
    patch_description: Optional[str] = None
    patch_url: Optional[str] = None
    compare_with_previous: bool = False

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
    return {"message": "SpawnerAI is running!"}

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
                    affinity_raw = model.predict(dotamatches)
                    result["dota2"] = {
                        "affinity": convert_affinity_to_python_types(affinity_raw),
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
                    affinity_raw = model.predict(leaguematches)
                    result["league"] = {
                        "affinity": convert_affinity_to_python_types(affinity_raw),
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
                
                if dotamatches and len(dotamatches) > 0:
                    # Group matches by month
                    # dotamatches format: [hero_stats, kills, deaths, assists, win, start_time]
                    matches_by_month = defaultdict(list)
                    
                    for match in dotamatches:
                        if len(match) >= 6 and match[5] and match[5] > 0:  # Ensure we have valid start_time
                            try:
                                timestamp = match[5]  # Unix timestamp
                                month_key = datetime.fromtimestamp(timestamp).strftime("%Y-%m")
                                matches_by_month[month_key].append(match)
                            except (ValueError, OSError) as e:
                                print(f"Error processing match timestamp: {e}")
                                continue
                    
                    if matches_by_month:
                        # Calculate affinity for each month
                        monthly_progression = []
                        for month in sorted(matches_by_month.keys()):
                            month_matches = matches_by_month[month]
                            if month_matches:
                                month_affinity_raw = model.predict(month_matches)
                                month_affinity = convert_affinity_to_python_types(month_affinity_raw)
                                
                                month_date = datetime.strptime(month, "%Y-%m")
                                month_display = month_date.strftime("%b %Y")
                                
                                monthly_progression.append({
                                    "month": month_display,
                                    "month_key": month,
                                    "affinity": month_affinity,
                                    "match_count": len(month_matches)
                                })
                        
                        if monthly_progression:
                            result["dota2"] = {
                                "progression": monthly_progression,
                                "total_matches": len(dotamatches)
                            }
                        else:
                            print("No valid matches found after grouping by month")
                    else:
                        print("No matches could be grouped by month (missing timestamps)")
                else:
                    print(f"Dota 2 matches returned empty or None (steam_id: {steam_id})")
            except ValueError as e:
                print(f"Invalid Steam ID format: {steam_id} - {e}")
            except Exception as e:
                print(f"Error processing Dota 2 matches: {e}")
                import traceback
                traceback.print_exc()
        
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
                        month_affinity_raw = model.predict(month_matches)
                        month_affinity = convert_affinity_to_python_types(month_affinity_raw)
                        
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
            # Provide more helpful error message
            error_detail = "No match data found."
            if steam_id and not result["dota2"]:
                error_detail += f" Steam ID {steam_id} returned no matches."
            if (riot_name and riot_id) and not result["league"]:
                error_detail += f" Riot ID {riot_name}#{riot_id} returned no matches."
            raise HTTPException(
                status_code=404,
                detail=error_detail
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
                        affinity_raw = model.predict(dotamatches)
                        current_affinity_result["dota2"] = convert_affinity_to_python_types(affinity_raw)
                except (ValueError, Exception):
                    pass
            
            if riot_name and riot_id:
                try:
                    leaguematches = fetchdata.leaguematches(riot_name, riot_id)
                    if leaguematches:
                        affinity_raw = model.predict(leaguematches)
                        current_affinity_result["league"] = convert_affinity_to_python_types(affinity_raw)
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
                        affinity_raw = model.predict(dotamatches)
                        other_affinity_result["dota2"] = convert_affinity_to_python_types(affinity_raw)
                except (ValueError, Exception):
                    pass
            
            if riot_name_other and riot_id_other:
                try:
                    leaguematches = fetchdata.leaguematches(riot_name_other, riot_id_other)
                    if leaguematches:
                        affinity_raw = model.predict(leaguematches)
                        other_affinity_result["league"] = convert_affinity_to_python_types(affinity_raw)
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
                affinity_raw = model.predict(leaguematches)
                affinity = convert_affinity_to_python_types(affinity_raw)
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

@app.post("/saveOnboardingData")
def save_onboarding_data(
    onboarding_data: OnboardingDataRequest,
    user: dict = Depends(get_current_user)
):
    """
    Save onboarding data as JSON in the onboarding_json column AND update individual columns.
    This endpoint stores all onboarding information including game usernames,
    Fortnite/Valorant/League experience, and preferences.
    Also updates steam_id, riot_name, riot_id columns for redundancy.
    Requires authentication.
    """
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(
                status_code=401,
                detail="User email not found in token"
            )
        
        from database import supabase
        
        # Prepare onboarding JSON data
        onboarding_json = {
            "games": onboarding_data.games or {},
            "fortnite": onboarding_data.fortnite or {},
            "valorant": onboarding_data.valorant or {},
            "league": onboarding_data.league or {},
            "completed_at": datetime.utcnow().isoformat()
        }
        
        # Prepare individual column updates (for redundancy)
        # We save to both JSON and individual columns for easy querying
        profile_updates = {
            "onboarding_json": onboarding_json
        }
        
        # Extract and save to individual columns from games data
        if onboarding_data.games:
            # Steam ID from Dota 2 (Steam ID) or CS:GO (Steam username)
            # Prioritize Dota 2 Steam ID if both exist since it's the actual Steam ID
            if onboarding_data.games.get("dota2"):
                steam_id_value = onboarding_data.games["dota2"].strip()
                if steam_id_value:
                    profile_updates["steam_id"] = steam_id_value
            elif onboarding_data.games.get("csgo"):
                # CS:GO uses Steam username, store it in steam_id column
                csgo_username = onboarding_data.games["csgo"].strip()
                if csgo_username:
                    profile_updates["steam_id"] = csgo_username
        
        # Note: riot_name and riot_id columns are preserved if they exist
        # They can be set separately or extracted from other sources
        # The JSON contains all detailed onboarding data, while individual columns
        # provide quick access to commonly queried fields (redundancy is fine!)
        
        # Check if profile exists
        existing_profile = get_user_profile(user_email)
        
        if existing_profile:
            # Preserve existing riot_name and riot_id if they exist and we're not updating them
            # Only update them if we have new data (currently not collected in onboarding)
            if existing_profile.get("riot_name") and "riot_name" not in profile_updates:
                profile_updates["riot_name"] = existing_profile["riot_name"]
            if existing_profile.get("riot_id") and "riot_id" not in profile_updates:
                profile_updates["riot_id"] = existing_profile["riot_id"]
            if existing_profile.get("steam_id") and "steam_id" not in profile_updates:
                # Only preserve existing steam_id if we don't have new data
                pass  # We want to update steam_id if we have new data, so don't preserve
            
            # Update existing profile with onboarding_json AND individual columns
            response = supabase.table("user_profiles").update(
                profile_updates
            ).eq("email", user_email).execute()
        else:
            # Create new profile with onboarding_json AND individual columns
            profile_updates["email"] = user_email
            response = supabase.table("user_profiles").insert(
                profile_updates
            ).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to save onboarding data"
            )
        
        return {
            "success": True,
            "message": "Onboarding data saved successfully",
            "email": user_email
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error saving onboarding data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error saving onboarding data: {str(e)}"
        )

@app.get("/getRiotUpdates")
def get_riot_updates(user: dict = Depends(get_optional_user)):
    """
    Fetch League of Legends patch updates from the Riot Games news API.
    Returns filtered patches relevant to League of Legends only.
    """
    try:
        response = requests.get("https://soraclee.github.io/riotgames-news-api/data/lol/gameUpdatesEn.json", timeout=10)
        response.raise_for_status()
        
        all_updates = response.json()
        
        # Filter for League of Legends patches only (exclude TFT)
        lol_patches = []
        for update in all_updates:
            # Filter out Teamfight Tactics patches
            if "Teamfight Tactics" not in update.get("title", "") and "TFT" not in update.get("title", ""):
                # Extract patch number if available (e.g., "Patch 25.22 Notes")
                patch_title = update.get("title", "")
                
                lol_patches.append({
                    "title": update.get("title", ""),
                    "publishedAt": update.get("publishedAt", ""),
                    "description": update.get("description", {}).get("body", "") if isinstance(update.get("description"), dict) else "",
                    "media": {
                        "url": update.get("media", {}).get("url", "") if isinstance(update.get("media"), dict) else "",
                        "colors": update.get("media", {}).get("colors", {}) if isinstance(update.get("media"), dict) else {}
                    },
                    "action": {
                        "type": update.get("action", {}).get("type", "") if isinstance(update.get("action"), dict) else "",
                        "url": update.get("action", {}).get("payload", {}).get("url", "") if isinstance(update.get("action"), dict) and isinstance(update.get("action", {}).get("payload"), dict) else ""
                    },
                    "analytics": {
                        "publishDate": update.get("analytics", {}).get("publishDate", "") if isinstance(update.get("analytics"), dict) else "",
                        "contentId": update.get("analytics", {}).get("contentId", "") if isinstance(update.get("analytics"), dict) else ""
                    },
                    "category": update.get("category", {}).get("title", "") if isinstance(update.get("category"), dict) else ""
                })
        
        # Sort by publish date (newest first)
        lol_patches.sort(key=lambda x: x.get("publishedAt", ""), reverse=True)
        
        return {
            "success": True,
            "patches": lol_patches,
            "total": len(lol_patches)
        }
    
    except requests.RequestException as e:
        print(f"Error fetching Riot updates: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Riot updates: {str(e)}"
        )
    except Exception as e:
        print(f"Error processing Riot updates: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing updates: {str(e)}"
        )

@app.post("/analyzePatch")
def analyze_patch(
    request: PatchAnalysisRequest,
    user: dict = Depends(get_current_user)
):
    """
    Analyze a patch for the current user's champions using AI.
    Returns AI-generated analysis of how the patch affects the user's playstyle.
    """
    try:
        user_email = user.get("email")
        if not user_email:
            raise HTTPException(
                status_code=401,
                detail="User email not found in token"
            )
        
        # Get user's League affinity data
        profile = get_user_profile(user_email)
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User profile not found"
            )
        
        riot_name = profile.get("riot_name")
        riot_id = profile.get("riot_id")
        
        if not riot_name or not riot_id:
            raise HTTPException(
                status_code=404,
                detail="Riot ID not found. Please link your Riot account."
            )
        
        # Fetch user's match history to get top champions
        leaguematches = fetchdata.leaguematches(riot_name, riot_id)
        if not leaguematches:
            raise HTTPException(
                status_code=404,
                detail="No match history found"
            )
        
        # Count champion usage
        champion_counts = defaultdict(int)
        for match in leaguematches:
            if len(match) > 0:
                champion_id = match[0]  # hero_stats contains champion info
                champion_counts[champion_id] += 1
        
        # Get top 5 champions
        top_champions = sorted(champion_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Use AWS Bedrock to analyze patch impact
        import synergy as synergy_module
        
        # Create a prompt for patch analysis
        patch_info = f"Patch: {request.patch_title}\n"
        if request.patch_description:
            patch_info += f"Description: {request.patch_description}\n"
        
        champion_list = ", ".join([f"Champion {champ[0]} ({champ[1]} games)" for champ in top_champions])
        
        prompt = f"""You are a professional League of Legends analyst. Analyze how the following patch affects a player's top champions.

{patch_info}

Player's Top Champions: {champion_list}

Provide a detailed analysis in JSON format:
{{
    "summary": "<overall impact summary>",
    "champions": [
        {{
            "champion_id": "<champion_id>",
            "impact": "<positive/negative/neutral>",
            "analysis": "<detailed analysis>",
            "recommendations": "<what the player should do>",
            "suggested_replacements": ["<champion1>", "<champion2>"]
        }}
    ],
    "meta_shift": "<how the meta is shifting>",
    "role_impact": {{
        "top": "<impact>",
        "jungle": "<impact>",
        "mid": "<impact>",
        "adc": "<impact>",
        "support": "<impact>"
    }}
}}

Return only valid JSON, no additional text."""
        
        # Use Bedrock for analysis
        import boto3
        import os
        from dotenv import load_dotenv
        load_dotenv()
        
        bedrock = boto3.client(
            service_name="bedrock-runtime",
            region_name="us-east-1",
            aws_access_key_id=os.getenv("awsid"),
            aws_secret_access_key=os.getenv("awssecret")
        )
        
        response = bedrock.invoke_model(
            modelId="amazon.nova-micro-v1:0",
            contentType="application/json",
            accept="application/json",
            body=json.dumps({
                "messages": [{
                    "role": "user",
                    "content": [{"text": prompt}]
                }],
                "inferenceConfig": {
                    "maxTokens": 2000,
                    "temperature": 0.7
                }
            })
        )
        
        result = json.loads(response["body"].read())
        analysis_text = result["output"]["message"]["content"][0]["text"]
        
        # Try to parse JSON from response
        try:
            # Extract JSON from markdown code blocks if present
            if "```json" in analysis_text:
                json_start = analysis_text.find("```json") + 7
                json_end = analysis_text.find("```", json_start)
                analysis_text = analysis_text[json_start:json_end].strip()
            elif "```" in analysis_text:
                json_start = analysis_text.find("```") + 3
                json_end = analysis_text.find("```", json_start)
                analysis_text = analysis_text[json_start:json_end].strip()
            
            analysis_data = json.loads(analysis_text)
        except json.JSONDecodeError:
            # Fallback: return raw text if JSON parsing fails
            analysis_data = {
                "summary": analysis_text,
                "champions": [],
                "meta_shift": "Unable to parse detailed analysis",
                "role_impact": {}
            }
        
        return {
            "success": True,
            "patch_title": request.patch_title,
            "top_champions": [{"champion_id": champ[0], "games": champ[1]} for champ in top_champions],
            "analysis": analysis_data,
            "user_email": user_email
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error analyzing patch: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing patch: {str(e)}"
        )

# Note: Run the server with: uvicorn main:app --reload --port 8000
# Do NOT call uvicorn.run() here as it conflicts with command-line execution
