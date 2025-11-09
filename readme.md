# Project Setup Instructions

This project has both a **frontend** (using Next.js) and a **backend** (using FastAPI). Please follow these steps to set up and run both parts locally.

---

## 1. Clone the Repository

```sh
git clone https://github.com/TCYTseven/SpawnerAI>
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
```

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

## Additional Notes

- Make sure both the frontend and backend `.env` files are correctly set up with your keys and secrets.
- If you encounter errors related to missing packages or dependencies, ensure your virtual environment is activated in the backend and all `npm install` commands completed in the frontend.
- Check the environment files are **not checked into version control** as they contain sensitive information.

Enjoy developing!
