# GiftSpark

**GiftSpark** is a personalized gift recommendation web application that helps users find the perfect gifts for their friends and family. By creating user accounts and storing profiles of loved ones, GiftSpark offers tailored gift suggestions based on individual preferences.

🌐 **Live Demo**: [https://giftspark.net](https://giftspark.net)

## Features

- **User Authentication**: Secure account creation and login functionality.
- **Profile Management**: Add and manage profiles for friends and family, including details like age, interests, and occasions.
- **AI-Powered Recommendations**: Receive personalized gift suggestions based on stored profiles.
- **Responsive Design**: Optimized for various devices to ensure a seamless user experience.

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB instance

### Installation

1. **Clone the repository**:
   ```
   git clone https://github.com/Shreyas765/GiftSpark.git
   cd GiftSpark
  
2. **Install dependencies**:
   ```
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables**:
   Create a .env file in the root directory and add the following:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```
5. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```
Open http://localhost:3000 in your browser to see the application.
