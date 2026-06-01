# Creator Voice-Cloned Reply Drafter

A mobile app + local backend system that helps creators reply faster in their own voice.

Creators can paste their past replies, the system learns their writing style, and then it drafts new replies for incoming audience questions. The goal is not generic AI help. The goal is authentic voice matching, so the creator can review and send replies much faster.

## What This Project Does

This app follows a simple workflow:

1. A creator is added to the system.
2. The creator's profile is described, including:
   - name
   - persona
   - tone
   - formality
   - word choice
   - emoji usage
   - punctuation style
3. The creator's past 30 replies are uploaded to the backend.
4. The backend extracts writing style features from those replies.
5. When a fan asks a new question, the system:
   - finds similar past replies
   - injects the creator's style features
   - generates 3 draft replies in the creator's voice
6. The drafts are ranked by relevance and voice match.
7. The creator can review the drafts and choose one to send.

## Why This Exists

Creators with large audiences cannot reply to everyone manually. This project explores how AI can draft replies in a creator's authentic style so the creator can respond faster without losing their voice.

The main success criterion is not just whether the reply is useful. It is whether the reply sounds like the creator.

## Tech Stack

### Frontend

- React Native
- Expo
- Expo Router
- TypeScript

### Backend

- Node.js
- Express
- SQLite
- Gemini API for draft generation
- Local or external embedding providers
- Style extraction utilities

## How It Works Internally

### 1. Creator setup
A creator profile is created with a name and persona description.

Example:

- Name: Tech Expert
- Persona: formal, concise, technical, low emoji usage, practical language

### 2. Reply ingestion
The creator pastes 30 past replies or posts into the system.

The backend stores those replies in SQLite and uses them to learn style patterns.

### 3. Style extraction
The backend calculates style features from the reply history, such as:

- average length
- emoji density
- punctuation behavior
- formality

### 4. Semantic retrieval
When a new audience question arrives, the system searches for the most semantically similar past replies.

These examples help the model stay aligned with the creator's voice.

### 5. Draft generation
The backend sends a prompt to the model with:

- creator persona
- style features
- similar past replies
- incoming audience question

It returns 3 candidate replies.

### 6. Ranking and review
The drafts are ranked by voice match and relevance so the creator can quickly choose the best option.

## Local-Only Design

This project is intentionally local-first.

That means:

- SQLite is used for storage
- backend runs locally on the machine
- no cloud sync
- no AWS dependency
- data stays in the local environment

## Getting Started

### Frontend

```bash
cd frontend
npm install
npx expo start
```

### Backend

```bash
cd backend
npm install
npm start