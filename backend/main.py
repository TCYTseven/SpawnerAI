from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fetchdata, model

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

@app.get("/")
def root():
    return {"message": "FastAPI is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

class affinityRequest(BaseModel):
    steamid: str
    riotname: str
    riottag: str
# class synergyRequest(BaseModel):

#     riotname: str
#     riottag: str

@app.get("/getAffinity")
def getAffinity(request: affinityRequest):
    dotamatches = fetchdata.dota2matches(request["steamid"])
    leaguematches = fetchdata.leaguematches(requests["riotname"], requests["riottag"])
    results = model.predict(dotamatches+leaguematches)

    return {
        "affinity": results
    }

# @app.get("/getSynergy")
# def getSynergy(request: synergyRequest):



uvicorn.run("main:app", reload=True)