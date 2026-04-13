PolicyClear
Smart Insurance Management Web Application

📌 Project Overview
PolicyClear is a smart insurance management web application that helps users easily manage and understand their insurance policies (health, life, etc.) in one place. Instead of dealing with confusing documents and missing important dates, this platform provides a simple and organized dashboard.

With PolicyClear, users can:
•	📄 Upload and manage all their policies in one place
•	🤖 Use an AI chatbot to ask questions about policies in plain language
•	📊 Use a simulator to understand premiums, benefits, and outcomes
•	⚠️ View important exclusions — what is NOT covered
•	📥 Upload a policy document and extract useful details automatically

🛠️ Tech Stack
Frontend
•	React + TypeScript
•	Vite (build tool)
•	Tailwind CSS

Backend & Database
•	Supabase (authentication, database, edge functions)
•	PostgreSQL (via Supabase)

AI & APIs
•	Groq API (AI chatbot)
•	pdfjs-dist (PDF parsing)

Other Tools
•	Git & GitHub (version control)
•	Node.js & npm

⚙️ Prerequisites
Before setting up the project, make sure you have the following installed:

Tool	Version	Download
Node.js	v18 or higher	https://nodejs.org

Git	Any recent version	https://git-scm.com

VS Code (recommended)	Any	https://code.visualstudio.com


No Python, no Flask, no Django, no separate backend server needed. Supabase handles everything.

🚀 Setup Instructions
Step 1 — Clone the Repository
git clone https://github.com/Agamya-cloud/policyclear.git
cd policyclear

Step 2 — Install Dependencies
npm install

Step 3 — Install Supabase Client
The project uses Supabase for auth and database. Install the client library:
npm install @supabase/supabase-js

Step 4 — Create Your .env File
Create a file named exactly .env in the project root folder (same folder as package.json):
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GROQ_API_KEY=your-groq-api-key-here

To get your Groq API key:
•	Go to https://console.groq.com/keys
•	Create a new API key and copy it



Step 5 — Run the App
npm run dev

Then open your browser and go to:
http://localhost:5173

That's it! No backend server to start. Supabase runs in the cloud.

📂 Project Structure
policyclear/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # Auth & Policy React contexts
│   ├── lib/            # authService, policyService, supabase client
│   ├── pages/          # Chat, Dashboard, Coverage, Landing, etc.
│   └── types/          # TypeScript type definitions
├── supabase/
│   ├── functions/      # Edge functions (chat, analyze-document, ocr-pdf)
│   └── migrations/     # Database schema
├── .env                # Your local secrets (not committed)
├── package.json
└── vite.config.ts

✨ Features
•	🔐 User authentication (sign up, sign in, sign out) via Supabase Auth
•	📄 Upload and manage insurance policy documents
•	🤖 AI chatbot powered by Groq to answer policy questions
•	📊 Premium and benefit simulator
•	⚠️ View policy exclusions clearly
•	📥 Auto-extract details from uploaded policy PDFs

🔧 Troubleshooting
ERR_CONNECTION_REFUSED on port 5000
This means the app is trying to use an old backend. Make sure your .env file has the correct Supabase URL and the authService.ts file uses Supabase, not fetch to localhost.

supabaseUrl is required
Your .env file is missing or Vite hasn't picked it up. Stop the dev server (Ctrl+C), check that .env exists in the project root, and run npm run dev again.

Failed to resolve @supabase/supabase-js
Run: npm install @supabase/supabase-js

🚀 Future Enhancements
•	Advanced AI policy recommendations
•	Mobile app version
•	Payment integration for premium reminders
•	Real-time alerts for renewal dates
•	Admin panel for policy management

🤝 Contributing
Contributions are welcome! Feel free to fork the repository, make changes, and open a pull request.

📜 License
This project is open-source under the MIT License.

👩‍💻 Author
Agamya Cloud Team
GitHub: https://github.com/Agamya-cloud/policyclear
