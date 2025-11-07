# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="My FastAPI App",
    description="Boilerplate FastAPI setup with CORS and sample routes",
    version="1.0.0"
)

# --- CORS Setup ---
origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://yourfrontend.com",  # add your production domain(s)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],            # ["GET", "POST", "PUT", "DELETE"]
    allow_headers=["*"],            # e.g. ["Authorization", "Content-Type"]
)

# --- Sample Routes ---
@app.get("/")
def root():
    return {"message": "FastAPI is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# --- Example API Route ---
@app.post("/items/")
def create_item(item: dict):
    return {"received": item}

# --- Run ---
# uvicorn main:app --reload
