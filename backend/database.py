import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables")

supabase: Client = create_client(supabase_url, supabase_key)


def get_user_profile(user_id: str):
    """
    Fetch user profile from Supabase database.
    Returns dict with riot_name, riot_id, steam_id or None if not found.
    """
    try:
        response = supabase.table("user_profiles").select("riot_name, riot_id, steam_id").eq("user_id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        error_msg = str(e)
        # Check if it's a table not found error
        if "Could not find the table" in error_msg or "PGRST205" in error_msg:
            print(f"ERROR: The 'user_profiles' table does not exist in your Supabase database.")
            print(f"Please run the SQL schema from 'supabase_schema.sql' in your Supabase SQL Editor.")
            print(f"See README_SUPABASE.md for detailed instructions.")
        else:
            print(f"Error fetching user profile: {e}")
        return None

