# Decision log & recommendations

## Design summary
- **Content fidelity**: Copied all verifiable facts from `site.txt`—names, date, location (Reverie Dayton, 9095 Washington Church Rd, Miamisburg, OH), and the "Black Tie Initial - Burgundy" theme—to ground every section of the site.
- **Structure**: Split source assets (`public/`), authored code (`src/`), automation (`tools/`), and runtime (`dist/`, `server.js`) for a maintainable static workflow without heavy frameworks.
- **Branding**: Implemented the mandated burgundy background color (`#2596be`) as the palette anchor and created vector placeholders so the site still feels polished while image downloads from The Knot remain blocked in this environment.
- **TypeScript**: Authored RSVP and navigation logic in `src/scripts/main.ts` with typed state, then mirrored a JavaScript build artifact for browsers. Because network egress is restricted, a lightweight `node` build script handles copying rather than relying on `tsc`.
- **RSVP UX**: Guests can add parties, persist data in `localStorage`, and click a generated mailto link that contains a structured RSVP summary for the couple.

## RSVP data handling recommendations
- For production, **add a lightweight backend** (Express, Fastify, or a serverless function) plus a managed database (Supabase, Firebase, or DynamoDB) to store RSVP submissions securely, send confirmations, and trigger reminders.
- If infrastructure must stay static, integrate with a **form relay service** (Formspree, Basin, Netlify Forms) or route submissions through a dedicated mailbox with filtering rules. Pairing this with the existing mailto summary keeps complexity low but still captures guest replies.
- Regardless of approach, encrypt guest data at rest, restrict administrative access, and log changes for auditing.

## Future enhancements
1. Replace placeholder SVGs with the real hero and gallery assets once a connection to The Knot media CDN is permitted.
2. Wire the RSVP form to whichever backend option the couple chooses and display server-side confirmation codes.
3. Layer in accessibility audits (axe, Lighthouse) and integrate automated deployments (GitHub Actions + Docker image pushed to a registry) for continuous delivery.
