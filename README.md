# AI Quiz Generator

## Description

AI Quiz Generator is a web application that allows users to generate and take quizzes on any topic using AI-powered question generation. Built with Next.js, React, and TypeScript, it provides an interactive and user-friendly interface for quiz creation and participation.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Configuration](#configuration)
- [License](#license)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/ai-quiz-generator.git
   cd ai-quiz-generator
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values.

## Usage

1. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Open your browser and navigate to:**

   ```
   http://localhost:3000
   ```

3. **Generate quizzes and test your knowledge!**

## Features

- AI-powered quiz question generation
- Multiple quiz types (MCQ, open-ended, etc.)
- User-friendly quiz creation form
- Real-time feedback and scoring
- Responsive design for desktop and mobile

## Configuration

- Environment variables are managed in the `.env` file.
- API keys and other sensitive information should be set in your environment.
- The Sample `.env` file looks like this:

  ```env
  DATABASE_URL=""
  OPENAI_API_KEY=""
  DB_PASSWORD=""
  API_KEY=""
  GOOGLE_CLIENT_ID=""
  GOOGLE_CLIENT_SECRET=""
  NEXTAUTH_SECRET=""
  ```

```

## License

This project is licensed under the MIT License.
```
