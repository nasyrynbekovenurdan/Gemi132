# How to run this Local AI Project

Follow these steps exactly to run your completely free, private, and unlimited AI agent on your own machine.

### Step 1: Install and Run Ollama (The AI Engine)
Ollama is the software that downloads and runs open-source language models directly on your hardware.

1. Go to **[ollama.com](https://ollama.com/)** and download the installer for your OS (Windows, Mac, or Linux).
2. Install it like any regular application.
3. Open your computer's **Terminal** (Mac/Linux) or **Command Prompt/PowerShell** (Windows).
4. Run this command to download and start the `llama3` model:
   ```bash
   ollama run llama3
   ```
   *(Note: The first time you run this, it will download a ~4.7GB file. Wait for it to finish. Once it says "Send a message", Ollama is successfully running in the background at `http://localhost:11434`)*.

### Step 2: Start the Backend (Node.js)
This is the bridge between your React frontend and Ollama.

1. Open a **new Terminal window**.
2. Navigate into the `backend` folder of this project:
   ```bash
   cd path/to/project/backend
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *(You should see a message saying "🚀 Backend running on http://localhost:5000")*

### Step 3: Start the Frontend (React + Vite)
This is the beautiful UI you interact with.

1. Open **another new Terminal window**.
2. Navigate to the root directory of this project (where `package.json` and `vite.config.ts` are located):
   ```bash
   cd path/to/project
   ```
3. Install the dependencies (if you haven't already):
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:5173` (or whatever URL Vite gives you).

### You're done!
When you send a message in the UI:
1. React sends it to your Node Backend (Port 5000).
2. The Backend formats it with the selected Persona's rules and sends it to Ollama (Port 11434).
3. Ollama generates the response locally on your CPU/GPU and sends it back to the UI!