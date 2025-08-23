📚 StudyGenius: AI-Powered Learning Platform


StudyGenius is a modern, AI-powered learning platform that delivers personalized and interactive educational experiences. It uses Generative AI to create custom learning roadmaps, summarize materials, generate quizzes, and foster a collaborative community for learners.

✨ Features

✔ User Authentication – Secure sign-up & login with Firebase Auth
✔ Personalized Dashboard – Displays study streak, mastered skills, time studied, progress charts, and upcoming lessons
✔ AI-Generated Roadmaps – Create personalized learning plans with adaptive modules
✔ AI-Powered Concept Learning – Click any concept for an AI explanation & quiz
✔ Material Upload & Processing – Upload PDFs/DOCs to generate summaries, quizzes, and flashcards
✔ Dynamic Resource Discovery – Curated materials, competitions, and news based on user interests
✔ Saved Resources Library – Bookmark and organize learning resources
✔ Community Study Zone – Real-time discussions and Q&A channels
✔ Global Topic Search – Instant explanations, resources, and quizzes for any topic

🛠 Tech Stack

Framework: Next.js
 (App Router)

Language: TypeScript

AI & Generative Tools: Google AI & Genkit

Backend & Database: Firebase
 (Auth, Firestore)

UI Library: ShadCN UI

Styling: Tailwind CSS

State Management: React Hooks (useState, useEffect) & react-hook-form

📸 Screenshots

(Add screenshots or GIFs of the dashboard, roadmap creation, and community page here for better presentation.)

🚀 Getting Started
1. Clone the Repository
git clone <repository-url>
cd <repository-directory>

2. Install Dependencies
npm install

3. Configure Firebase

Create a Firebase project and enable Authentication and Firestore.

Add your credentials in .env:

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

4. Set Firestore Security Rules

Use the following rules for production:

rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    match /users/{userId} {
      allow read, update, delete: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;

      match /roadmaps/{roadmapId} {
        allow read, write, delete: if request.auth.uid == userId;
      }

      match /savedResources/{resourceId} {
        allow read, write, delete: if request.auth.uid == userId;
      }
    }

    match /discussionChannels/{channelId} {
      allow read, write: if request.auth != null;

      match /messages/{messageId} {
        allow read: if request.auth != null;
        allow create: if request.auth.uid == request.resource.data.userId
                      && 'text' in request.resource.data
                      && 'userEmail' in request.resource.data;
        allow update, delete: if false;
      }
    }
  }
}


Click Publish in Firebase console.

5. Start Development Server
npm run dev


Visit: http://localhost:3000

🔐 Firebase Setup Guide

Create Firebase Project

Enable Email/Password Authentication

Create Firestore Database (Start in Test Mode for Dev)

📂 Project Structure
├── app/                # Next.js App Router pages
├── components/         # Reusable UI components (ShadCN + custom)
├── lib/                # Firebase configuration & utilities
├── public/             # Static assets
├── styles/             # Global Tailwind styles
└── ...

✅ Roadmap

 Add AI-powered flashcards generator

 Implement Leaderboards & Gamification

 Add Voice-based concept explanations

 Launch PWA version for mobile

📜 License

This project is licensed under the MIT License.

⭐ Want to contribute?

Fork the repo → Create a branch → Commit your changes → Submit a PR
