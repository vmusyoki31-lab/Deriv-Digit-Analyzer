# Deriv Digit Analyzer

A mobile-friendly Progressive Web App (PWA) that looks and behaves like an app on a phone.

## Features
- Installable on mobile screens
- Works like an app after adding to home screen
- Responsive design for Android/iPhone
- Digit analysis dashboard with prediction logic
- Offline support via service worker

## Run locally

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deploy to Netlify

1. Push this project to a GitHub repo.
2. Import it into Netlify.
3. Deploy with the default static settings.

The included `netlify.toml` config helps serve the app correctly.
