import os
from typing import Optional
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv
import jwt

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use service role key for backend
supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")  # JWT secret for token verification

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables")

supabase: Client = create_client(supabase_url, supabase_key)

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify the JWT token from the Authorization header and return user info.
    """
    try:
        token = credentials.credentials
        
        # Verify JWT token directly using the JWT secret
        if not supabase_jwt_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="JWT secret not configured",
            )
        
        try:
            payload = jwt.decode(
                token,
                supabase_jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return {
                "id": payload.get("sub"),
                "email": payload.get("email"),
            }
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[dict]:
    """
    Optional authentication - returns user if token is valid, None otherwise.
    """
    if not credentials or not supabase_jwt_secret:
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
        }
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None


def email_already_exists(email: str) -> bool:
    """
    Check if an email already exists in Supabase Auth.
    Uses the user_profiles table as a proxy to check registration.
    """
    try:
        response = supabase.table("user_profiles").select("email").eq("email", email).execute()
        return len(response.data) > 0
    except Exception as e:
        print(f"Error checking if email exists: {e}")
        return False

