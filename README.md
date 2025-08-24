<<<<<<< HEAD
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

=======
# StudyGenius: AI-Powered Learning Platform

StudyGenius is a modern, AI-powered learning platform designed to provide a personalized and interactive educational experience. It leverages generative AI to create custom learning roadmaps, generate study materials, and foster a collaborative community environment.

## Key Features

- **User Authentication**: Secure user sign-up and login functionality handled by Firebase Authentication.
- **Personalized Dashboard**: A central hub for learners, displaying key metrics like study streaks, skills mastered, and total time studied. It features a progress chart and a summary of upcoming lessons from active roadmaps.
- **AI-Generated Learning Roadmaps**:
  - Users can create highly customized learning plans by providing their goals, current expertise, available study time, preferred learning styles (e.g., Visual, Auditory), and desired resource types (e.g., Videos, Articles).
  - An initial AI-generated skill assessment quiz fine-tunes the roadmap to address specific knowledge gaps.
  - Roadmaps are structured into logical modules, each containing a list of granular concepts to master.
- **Interactive Concept Learning**:
  - Within a roadmap, users can click on any concept to receive a detailed, AI-generated explanation tailored to their learning goal.
  - Each concept is paired with an AI-generated quiz to test understanding and reinforce learning. Incorrect answers trigger simplified explanations.
  - Progress tracking allows users to mark concepts as complete.
- **Material Processing**:
  - Users can upload their own study materials (PDF, DOCX, TXT, images).
  - The AI processes the document to generate a concise summary, a multiple-choice quiz, and a set of digital flashcards.
- **Dynamic Resource Discovery**:
  - The "Resources" page curates relevant learning materials, competitions, and news articles based on a user's selected fields of interest.
  - Users can bookmark any resource to their personal library.
- **Saved Resources Library**: A dedicated page (`/saved-resources`) where users can view and access all their bookmarked items, neatly organized.
- **Community Study Zone**:
  - A collaborative space featuring real-time discussion channels.
  - Users can ask questions, share insights, and study together, fostering a community experience.
- **Topic Search**: A global search bar allows users to get instant, detailed explanations, related resources, and quiz suggestions for any topic.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Generative AI**: [Google AI & Genkit](https://firebase.google.com/docs/genkit)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Cloud Firestore)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks (`useState`, `useEffect`) & `react-hook-form` for forms.

## Firebase Setup

To run this application, you need to configure a Firebase project.

### 1. Create a Firebase Project

- Go to the [Firebase Console](https://console.firebase.google.com/).
- Click "Add project" and follow the on-screen instructions.

### 2. Register Your Web App

- In your project's dashboard, click the web icon (`</>`) to add a new web app.
- Give it a nickname and register the app.
- Firebase will provide you with a `firebaseConfig` object. Copy these credentials.

### 3. Configure Environment Variables

- Create a `.env` file in the root of the project.
- Add the credentials from the previous step to the `.env` file:

```env
>>>>>>> b9a39e4 (give me a detailed info about our solution what we have done for proper)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
<<<<<<< HEAD

4. Set Firestore Security Rules

Use the following rules for production:

=======
```

### 4. Enable Firebase Services

- **Authentication**:
  - In the Firebase Console, go to **Build > Authentication**.
  - Click the "Sign-in method" tab.
  - Enable the **Email/Password** provider.
- **Firestore**:
  - Go to **Build > Firestore Database**.
  - Click "Create database".
  - Start in **Test Mode**. This allows read/write access during development.

### 5. Set Firestore Security Rules

For production, you must secure your database. Navigate to the **Rules** tab in the Firestore section and replace the default rules with the following:

```
>>>>>>> b9a39e4 (give me a detailed info about our solution what we have done for proper)
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
<<<<<<< HEAD
=======
    // Users can only manage their own profile information.
>>>>>>> b9a39e4 (give me a detailed info about our solution what we have done for proper)
    match /users/{userId} {
      allow read, update, delete: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;

<<<<<<< HEAD
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
=======
      // Users can manage their own subcollections.
      match /roadmaps/{roadmapId} {
        allow read, write, delete: if request.auth.uid == userId;
      }
      
      match /savedResources/{resourceId} {
      	allow read, write, delete: if request.auth.uid == userId;
      }
    }
    
    // Discussion channels are public to all authenticated users.
    match /discussionChannels/{channelId} {
    	allow read, write: if request.auth != null;

      // Rules for messages within a channel.
      match /messages/{messageId} {
        allow read: if request.auth != null;
        
        // A user can only create messages for themselves.
        allow create: if request.auth != null
                      && request.auth.uid == request.resource.data.userId
                      && 'text' in request.resource.data
                      && 'userEmail' in request.resource.data;
                      
        // Users cannot update or delete messages.
>>>>>>> b9a39e4 (give me a detailed info about our solution what we have done for proper)
        allow update, delete: if false;
      }
    }
  }
}
<<<<<<< HEAD


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
=======
```
- Click **Publish** to save the rules.

## Getting Started

To run the project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file and populate it with your Firebase configuration as described above.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:9002`.
>>>>>>> b9a39e4 (give me a detailed info about our solution what we have done for proper)
