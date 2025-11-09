import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables")

supabase: Client = create_client(supabase_url, supabase_key)


def get_user_profile(email: str):
    """
    Fetch user profile from Supabase database by email.
    Returns dict with riot_name, riot_id, steam_id, onboarding_json or None if not found.
    """
    try:
        response = supabase.table("user_profiles").select("riot_name, riot_id, steam_id, onboarding_json, ai_output, squad").eq("email", email).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        
        return None
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return None


def get_user_by_email(email: str):
    """
    Fetch user profile by email.
    Returns dict with email as key or None if not found.
    """
    try:
        response = supabase.table("user_profiles").select("*").eq("email", email).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error fetching user by email: {e}")
        return None


def email_exists(email: str) -> bool:
    """
    Check if an email already exists in user_profiles table.
    Returns True if email exists, False otherwise.
    """
    try:
        response = supabase.table("user_profiles").select("email").eq("email", email).execute()
        return len(response.data) > 0
    except Exception as e:
        print(f"Error checking email existence: {e}")
        return False

