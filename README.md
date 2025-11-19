# Megan & Charlie Wedding Website

This repository hosts a bespoke wedding website for **Megan Barger & Charlie Phelps** (September 20, 2026 • Miamisburg, OH) with accessible HTML, modern CSS, and TypeScript-driven interactivity.

## Project structure
- `src/` — source HTML, CSS, and TypeScript (plus a compiled JS artifact for browsers).
- `public/` — static resources, including SVG artwork and local placeholder assets.
- `tools/` — custom build utility that prepares the distributable output.
- `dist/` — generated site that the Node server and Docker image serve.
- `server.js` — zero-dependency HTTP server that serves the `dist` folder on **port 2002**.

## Getting started
```bash
npm install    # no external deps, but keeps npm scripts available
npm run build  # outputs dist/
npm start      # builds + serves http://localhost:2002
```

### Docker
```bash
docker build -t megan-charlie .
docker run -p 2002:2002 megan-charlie
```

## RSVP workflow
The RSVP form supports multiple guests, local persistence, and a generated email summary. For production deployments, pair it with a backend service or trusted third-party form relay (see `reasoning.md` for recommendations).
