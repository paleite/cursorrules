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

## Reusable React Components Guidelines

This repository also includes comprehensive guidelines for building reusable React components following shadcn/ui v4 patterns:

**[REUSABLE-REACT-COMPONENTS-GUIDELINES.md](./REUSABLE-REACT-COMPONENTS-GUIDELINES.md)**

These guidelines cover:

- Component architecture patterns (composition, variants, polymorphism)
- Styling with Tailwind CSS, CVA, and the `cn()` utility
- The `data-slot` pattern for parent-aware styling
- Accessibility best practices (ARIA, focus management, keyboard navigation)
- Advanced patterns (state management, container queries, responsive design)
- TypeScript typing strategies for reusable components

Use these guidelines as a reference when building component libraries or standardizing component architecture in your projects.

To adopt these guidelines in your project, prompt your LLM with:

```markdown
Download and use as reference: `https://raw.githubusercontent.com/paleite/cursorrules/refs/heads/main/REUSABLE-REACT-COMPONENTS-GUIDELINES.md`

When building reusable React components, follow the patterns documented in this guide. Document any deliberate deviations in the "Project-Specific Pattern Decisions" section.
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
