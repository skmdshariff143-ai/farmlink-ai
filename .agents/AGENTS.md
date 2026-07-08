# FarmLink AI Project Rules

## Next.js Version Constraints
<!-- BEGIN:nextjs-agent-rules -->
This version of Next.js (16.2.9) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Security and Deployment Constraints
* **NEVER** modify or bypass authentication/authorization checks on any API route, endpoint, or page, for any reason, including "temporary" or diagnostic fixes.
* **NEVER** trigger production deployments (`vercel --prod`) or run modifying migrations against the production database without explicit human review and approval of the code diff.
* **NEVER** work around database connection issues, missing credentials, or infrastructure blockers by weakening security boundaries. If blocked, immediately stop execution and report the issue to the user.
