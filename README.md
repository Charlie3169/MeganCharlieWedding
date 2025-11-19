# Megan & Charlie Wedding Website

This repository hosts a bespoke wedding website for **Megan Barger & Charlie Phelps** (September 20, 2026 • Miamisburg, OH)
with accessible HTML, modern CSS, and a TypeScript-powered RSVP experience bundled by **Webpack**.

## Project structure
- `src/` — source HTML, CSS, and TypeScript.
- `public/` — static resources, including SVG artwork and local placeholder assets.
- `dist/` — generated site that the Node server and Docker image serve.
- `server.js` — zero-dependency HTTP server that serves the `dist` folder on **port 2002**.
- `webpack.config.js` — production build configuration (compiles TypeScript and copies static assets).

## Development quick start
```bash
npm install         # install webpack + TypeScript toolchain
npm run build       # outputs dist/ via webpack
npm start           # builds (if needed) then serves http://localhost:2002
```

### Live-reload build loop
```bash
npm run dev         # webpack --watch (rebuilds on source changes)
node server.js      # in a second terminal after the first build finishes
```

## Docker
1. Build the production image (installs dependencies, runs the webpack build, and bakes in the `dist/` folder):
   ```bash
   docker build -t megan-charlie .
   ```
2. Run the container. The `npm start` command inside the container rebuilds the site and then launches the Node server on **port 2002**:
   ```bash
   docker run -p 2002:2002 megan-charlie
   ```

## RSVP workflow
The RSVP form supports multiple guests, local persistence, and a generated email summary. For production deployments, pair it with
a backend service or trusted third-party form relay (see `reasoning.md` for recommendations).
