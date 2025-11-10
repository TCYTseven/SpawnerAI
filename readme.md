# SpawnerAI

SpawnerAI uses AI to analyze your playstyle across multiple games and translate those skills into personalized League of Legends recommendations. Instead of spending weeks trying different champions, the app tells you exactly which ones match how you actually play.

The system pulls your stats from Valorant, Apex Legends, CS:GO, Fortnite, and Dota 2, then builds a comprehensive profile of your gameplay patterns. It maps your aggression levels, positioning habits, team coordination, and clutch potential to League champions and roles that actually fit your style. A fragger from Valorant gets matched with aggressive skirmishers. A support main from Apex gets paired with League supports that match their playstyle. The AI handles the translation so you don't have to.

## What it does

Connect your accounts from any games you play, and SpawnerAI builds a detailed profile of your actual gameplay behavior. It analyzes aggression patterns, positioning tendencies, teamplay vs solo carry preferences, and utility usage across all your games. That profile then gets mapped to League champions, roles, and even build paths that match your natural playstyle.

The dashboard gives you a complete skill breakdown with visualizations, personalized champion recommendations ranked by fit, and squad synergy analysis if you're playing with a team. The patch analysis feature is particularly useful - instead of reading generic patch notes, you get analysis of how each update specifically affects your champion pool and what you should adapt.

Built on AWS Bedrock for the AI analysis, Riot's API for match data, and Supabase for profiles and authentication. Frontend is Next.js with TypeScript, backend is FastAPI.

## What you need

You'll need Node.js 18+, Python 3.8+, and npm/yarn installed. For API keys, grab a Riot API key from their developer portal, set up a Supabase project for the database and auth, get a Tracker.gg API key if you want CS:GO/Apex stats, and AWS credentials for Bedrock if you want the AI features working.

## Setup

The project splits into a Next.js frontend and FastAPI backend. You'll need to run both - here's how to get them going.

---

## 1. Clone the Repository

```sh
git clone https://github.com/TCYTseven/SpawnerAI
```

---

## 2. Environment Variables

### Frontend

Create a `.env.local` file inside the `frontend` directory with the following content:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

(Replace `<your-supabase-url>` and `<your-supabase-anon-key>` with your actual Supabase credentials.)

### Backend

Create a `.env` file inside the `backend` directory with these variables:

```
riotapikey=<your-riot-api-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>
trackerapikey=<your-tracker-gg-api-key>
awsid=<your-aws-access-key-id>
awssecret=<your-aws-secret-access-key>
```

For the Riot API key, head to the [Riot Developer Portal](https://developer.riotgames.com/). Supabase keys are in your project settings under API. Tracker.gg has a developer portal at [tracker.gg/developers](https://tracker.gg/developers) for CS:GO and Apex stats. AWS credentials come from the IAM console - you'll need these for Bedrock to run the AI analysis.

---

## 3. Running the Backend

1. Navigate to the backend directory:
    ```sh
    cd backend
    ```
2. (Optional but recommended) Create and activate a Python virtual environment:
    ```sh
    python3 -m venv venv
    source venv/bin/activate  # On Windows, use 'venv\Scripts\activate'
    ```
3. Install dependencies:
    ```sh
    pip install -r requirements.txt
    ```
4. Start the FastAPI backend:
    ```sh
    uvicorn main:app --reload
    ```
   By default, the server will be running at `http://127.0.0.1:8000`.

---

## 4. Running the Frontend

1. Open a new terminal window/tab.
2. Navigate to the frontend directory:
    ```sh
    cd frontend
    ```
3. Install dependencies:
    ```sh
    npm install
    ```
4. Run the development server:
    ```sh
    npm run dev
    ```
   The frontend should now be running at `http://localhost:3000`.

---

## 5. Accessing the Application

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Notes

Make sure your `.env` files are set up correctly on both frontend and backend. If you're getting dependency errors, check that your Python venv is activated and npm install finished successfully. Don't commit your `.env` files - they've got API keys in them.
