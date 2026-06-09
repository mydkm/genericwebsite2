# genericwebsite2

A minimal static website configured for deployment with GitHub Pages.

## Local preview

Open `index.html` directly in a browser, or run a local static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

This repository includes a GitHub Actions workflow at
`.github/workflows/pages.yml` that deploys the site from the repository root on
each push to `main`.

To enable it in GitHub:

1. Go to the repository settings.
2. Open **Pages**.
3. Set **Build and deployment** → **Source** to **GitHub Actions**.
4. Push to `main`, then wait for the `Deploy GitHub Pages` workflow to finish.
