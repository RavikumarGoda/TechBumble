# ⚡ TechBumble

> Swipe. Solve. Repeat.  
> A Gen Z-style daily interview prep app for the modern coder.

TechBumble is your aesthetic, dark-themed, swipeable web app for DSA, System Design, and HR prep. Built to keep you consistent, motivated, and *just cracked out enough* to ace your dream role — one swipe at a time.

---

## 🌟 Features

- 🎴 **Swipeable Interface** – Swipe right to mark solved, swipe up to save.
- 🧠 **Daily Question Sessions** – Freshly served bite-sized questions each login.
- 🏷️ **Company-wise Tags** – Filter questions by company relevance.
- 🤖 **Gemini API** – Instant AI explanations for every question.
- 🌚 **Dark Mode UI** – Sleek Gen Z-friendly visuals & buttery animations.

---

## 🛠️ Tech Stack

| Layer      | Tech                            |
| ---------- | ------------------------------- |
| Frontend   | React, TypeScript, Tailwind CSS |
| Auth + DB  | Supabase                        |
| AI Engine  | Gemini API (Google AI)          |
| Hosting    | Vercel                          |
| State Mgmt | Zustand / Context API           |
| Build Tool | Vite                            |

---

## 🧩 Project Structure

```bash
TechBumble/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── App.tsx
├── .env
├── package.json
└── README.md

```
## Getting Started

### ✅ Prerequisites
- Node.js (v18+)  
- npm or yarn


---

### ⚙️ Installation

```bash
git clone https://github.com/RavikumarGoda/TechBumble.git
cd TechBumble
npm install
```
### ⚙️ Environment Setup

Create a `.env` file in the root directory and paste:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```
### 🚀 Running Locally

Run the app:

```bash
npm run dev

```
Now open `http://localhost:5173` to view it in the browser.

### 📬 Contact


- GitHub: [@RavikumarGoda](https://github.com/RavikumarGoda)  
- LinkedIn: [Ravi Kumar Reddy Goda](https://www.linkedin.com/in/ravikumargoda)
