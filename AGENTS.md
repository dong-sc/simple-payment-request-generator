# AGENTS.md

## Project Direction

This project is part of a small open-source tool series for freelancers, creators, and small studios.

The goal is not to build a large workflow system, CRM, SaaS, accounting system, payment gateway, or project management platform.

The goal is to create small, familiar, low-friction tools that help users complete everyday administrative tasks faster.

Each tool should be:

- simple
- independent
- no-login
- frontend-only when possible
- easy to deploy
- easy to understand within 3 minutes
- useful without reading a long manual

## Product Principle

Do not redesign the user's workflow.

Instead, reduce the friction of something users already know how to do.

For this payment request generator, users should be able to open the page, fill in familiar fields, preview a clean payment request document, and print or save it as PDF.

## Do Not Add

Do not add these unless explicitly requested:

- login
- user accounts
- backend
- database
- AI API
- CRM features
- project management dashboard
- cloud sync
- payment gateway
- online payment
- invoice issuing system
- accounting ledger
- multi-user collaboration
- complex template marketplace
- unnecessary animations
- heavy UI frameworks

## Language

The user interface should use Traditional Chinese.

Code comments may use English or Traditional Chinese, but UI text should be Traditional Chinese.

## Design Style

The design should be clean, practical, and document-like.

Avoid:

- flashy startup style
- overly playful UI
- heavy gradients
- complicated interactions
- excessive animation

Prefer:

- white background
- dark gray text
- clear form fields
- printable document preview
- calm spacing
- simple lines
- A4-friendly output

## Technical Direction

Use:

- Vite
- React
- TypeScript
- pure frontend
- localStorage for local draft persistence
- print CSS for PDF output

Avoid large dependencies unless necessary.

## Repository Strategy

Each tool should remain independent.

The broader brand can be centralized later through a separate landing page or index site.

This repository should focus only on the payment request generator.

## Testing and Validation

Before finalizing changes, run:

npm run build

If lint is configured, run:

npm run lint

Do not introduce TypeScript errors.

Do not introduce runtime errors for empty fields, empty payment items, NaN values, or missing localStorage data.

## Review Guidelines

When reviewing changes, check:

- Does the feature keep the tool simple?
- Does it work without login?
- Does it avoid backend/database/API dependencies?
- Does it preserve Traditional Chinese UI?
- Does it keep payment request generation understandable within 3 minutes?
- Does print output remain clean?
- Does localStorage avoid uploading user data?
