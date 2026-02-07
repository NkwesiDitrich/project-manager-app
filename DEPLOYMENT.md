# Deploying Tasco (Live Hosting)

This guide gets your app running on the internet with a real database and API.

You will use:
- **MongoDB Atlas** – database (free tier)
- **Render** – backend API + frontend (free tier, one account)

---

## 1. MongoDB Atlas (Database)

Your app already uses MongoDB. For deployment you need a cloud cluster that both your laptop and the hosted server can reach.

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in (or create an account).
2. Create a **free cluster** (M0) if you do not have one.
3. **Database Access**: Add a database user (e.g. `tasco-user`) with a password. Note the password.
4. **Network Access**: Click “Add IP Address” and choose **“Allow Access from Anywhere”** (0.0.0.0/0). This is required so Render’s servers can connect. For a school project this is acceptable.
5. **Connection string**: In Atlas, click “Connect” on your cluster → “Connect your application” → copy the URI. It looks like:
   ```text
   mongodb+srv://tasco-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<password>` with your database user password. Optionally add a database name:
   ```text
   mongodb+srv://tasco-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tasco?retryWrites=true&w=majority
   ```
   Save this as your **MONGODB_URI** (you will paste it into Render in step 3).

---

## 2. Push Your Code to GitHub

Render deploys from GitHub. If the project is not in a repo yet:

1. Create a new repository on [github.com](https://github.com).
2. In your project folder (the one that contains `backend` and `frontend`), run:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

Use your real GitHub username and repo name. Make sure `node_modules` and `.env` are in `.gitignore` (do **not** commit `.env` or secrets).

---

## 3. Deploy the Backend on Render

1. Go to [render.com](https://render.com) and sign up / log in (GitHub login is easiest).
2. **New** → **Web Service**.
3. Connect your GitHub account if needed, then select the repository that contains `backend` and `frontend`.
4. Configure the **backend** service:
   - **Name**: e.g. `tasco-api`
   - **Region**: Choose one close to you.
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Environment variables** (Add each one; use “Add Environment Variable”):

   | Key             | Value / note |
   |-----------------|--------------|
   | `MONGODB_URI`   | Your Atlas connection string from step 1. |
   | `JWT_SECRET`    | A long random string (e.g. 32+ characters). You can generate one with Node: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `FRONTEND_URL`  | Leave empty for now; you will set it after deploying the frontend (e.g. `https://tasco-frontend.onrender.com`). You can add it later and redeploy. |
   | `PORT`          | Render sets this automatically; you can leave it unset. |
   | `SEND_GRID_API` | Optional. If you omit it, sign-up/verification emails may fail but the app will still run. For email later, use a SendGrid API key. |
   | `FROM_EMAIL`    | Optional. Email address used as sender when using SendGrid. |
   | `ARCJET_KEY`    | Optional. Omit for now; the app runs without it. |

6. Click **Create Web Service**. Wait until the deploy finishes and the service shows a URL like `https://tasco-api.onrender.com`.
7. Copy that URL; you will use it as the API base for the frontend (e.g. `https://tasco-api.onrender.com/api-v1`).

---

## 4. Deploy the Frontend on Render

1. In Render, **New** → **Web Service** again.
2. Select the **same** GitHub repository.
3. Configure the **frontend** service:
   - **Name**: e.g. `tasco-frontend`
   - **Root Directory**: `frontend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Environment variable** (must be set at build time so the built app knows the API URL):
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend API base URL, e.g. `https://tasco-api.onrender.com/api-v1`  
     (Use your real backend URL from step 3; no trailing slash.)

5. Click **Create Web Service**. Wait for the first deploy to finish.
6. Open the frontend URL (e.g. `https://tasco-frontend.onrender.com`). You should see the app and be able to sign up / log in and use the API with the live database.

---

## 5. Connect Backend and Frontend (CORS and links)

1. In the **backend** service on Render, go to **Environment**.
2. Set **FRONTEND_URL** to your frontend URL, e.g. `https://tasco-frontend.onrender.com` (no trailing slash). This is used for CORS and for links in emails (verify, reset password, etc.).
3. Save. Render will redeploy the backend. After that, the browser will be allowed to call the API from your frontend URL and links in emails will point to the correct site.

---

## 6. Check That Everything Works

- Open the **frontend** URL in your browser.
- Sign up with an email and password.
- Log in and create a workspace, project, task. All of this is stored in **MongoDB Atlas** (external data).
- If something fails, open the **backend** service **Logs** on Render to see errors (e.g. wrong `MONGODB_URI` or missing env vars).

---

## Summary of URLs and Env Vars

| Where        | What you set |
|-------------|--------------|
| **Atlas**   | Network Access: Allow from anywhere (0.0.0.0/0). Use the connection string as `MONGODB_URI`. |
| **Backend** | `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` (frontend URL). Optional: `SEND_GRID_API`, `FROM_EMAIL`, `ARCJET_KEY`. |
| **Frontend**| `VITE_API_URL` = backend URL + `/api-v1` (e.g. `https://tasco-api.onrender.com/api-v1`). |

Once both services are deployed and `FRONTEND_URL` is set on the backend, your app is **hosted on a live web server with working external data** (MongoDB Atlas).

---

## Notes

- **Render free tier**: Services may “spin down” after 15 minutes of no traffic. The first request after that can take 30–60 seconds; then it runs normally. This is expected on the free plan.
- **Secrets**: Never commit `.env` or real `MONGODB_URI` / `JWT_SECRET` to GitHub. Use Render’s Environment tab for all secrets.
- **Email**: Without `SEND_GRID_API` and `FROM_EMAIL`, sign-up and password-reset emails will not send, but the rest of the app (login, workspaces, tasks, etc.) works with the live database.
