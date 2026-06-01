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
