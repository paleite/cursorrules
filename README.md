# cursorrules

.cursorrules I like to use for my projects.

---

The .cursorrules file contains instructions on how to adopt it in your existing project in a way that makes sense for _your_ needs.

To adopt this .cursorrules file in your project, prompt your LLM with something
like this:

```markdown
Move the current `.cursorrules` (if any) to `.cursorrules-local-backup`, then download and follow the instructions in this `.cursorrules` file: `https://raw.githubusercontent.com/paleite/cursorrules/refs/heads/main/.cursorrules`
```

---

Bootstrapping a new Next.js project with pnpm:

```bash
pnpm create next-app@latest --yes --use-bun paleite-best-frontend
cd paleite-best-frontend
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add --all


pnpm add @ebay/nice-modal-react @hookform/resolvers @t3-oss/env-nextjs @tanstack/react-table @tanstack/react-query @tanstack/react-query-devtools axios connectkit postchain-client react-hook-form wagmi zod zustand
pnpm add -D @tsconfig/strictest @tsconfig/next
```
