# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript project showcasing comprehensive .cursorrules for Next.js, React, and modern frontend development practices. The repository serves as a reference implementation and template for best practices in modern JavaScript/TypeScript development workflows.

## Architecture

**Technology Stack:**

- **Runtime:** TypeScript with ESM modules
- **Package Manager:** pnpm (configured via package.json)
- **State Management:** TanStack React Query for async state
- **Validation:** Zod for schema validation
- **HTTP Client:** Axios for API requests
- **Styling:** Tailwind CSS + ShadCN/UI components
- **Form Handling:** react-hook-form with Zod resolvers
- **Modal Management:** @ebay/nice-modal-react
- **TypeScript Configuration:** Strict mode with @tsconfig/strictest and @tsconfig/next

**Project Structure:**

```
src/
  app.tsx           # Main React Query setup and app entry
  providers.tsx     # Context providers setup
  schemas.ts        # Zod validation schemas
  hooks.ts          # Custom React hooks
  lib/
    api.ts         # Centralized API client configuration
```

## Development Commands

Based on the project configuration and .cursorrules, the following commands are essential:

**Package Management:**

```bash
pnpm install                    # Install dependencies
pnpm update                    # Update dependencies
```

**Development:**

```bash
pnpm dev                       # Start development server
pnpm build                     # Build for production
pnpm start                     # Start production server
```

**Code Quality:**

```bash
pnpm typecheck                 # TypeScript type checking
pnpm lint                      # ESLint code linting
pnpm format                    # Prettier code formatting
pnpm spellcheck               # cspell spell checking
```

**Code Generation:**

```bash
pnpm generate                  # Run code generation (when configured)
```

## Key Development Practices

**Core Technical Mandates from .cursorrules:**

**ALWAYS USE:**

- `@tanstack/react-query` for async data fetching and caching (never `useEffect` + `fetch`)
- `zod` for all API response and form input validation
- `tailwind CSS + ShadCN/UI + cn()` for styling and class composition
- `react-hook-form` for all form handling
- `zustand` for non-context or persistent client-side state
- `@ebay/nice-modal-react` for modal management
- `@tanstack/react-table` for data tables

**NEVER USE:**

- `useEffect` for data fetching
- `fetch()` directly - use dedicated hooks or API client
- Inline styles - rely on Tailwind classes or `class-variance-authority`
- String concatenation for class names - use `cn()` utility
- Default exports (except Next.js pages)

**File Naming:**

- Use kebab-case for all filenames
- `.tsx` for TypeScript with JSX, `.ts` otherwise
- Test files: `[filename].test.ts` or `[filename].test.tsx`

**Code Organization:**

- Export next to declarations (avoid placing exports at file bottom)
- Remove unused exports regularly
- Use `@/*` import paths from project root
- Prefer explicit syntax over shorthand when generating new code

## TypeScript Configuration

The project uses the strictest possible TypeScript configuration:

```json
{
  "extends": ["@tsconfig/strictest/tsconfig", "@tsconfig/next/tsconfig"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

**Key TypeScript Practices:**

- Leverage discriminated unions for state variations
- Use `as const` to preserve literal types
- Prefer `satisfies` over `as` for type compatibility
- Use `interface` for extendable object shapes, `type` for unions/primitives
- Avoid `any`, `as`, `is` - use Zod for strict type checking
- Employ utility types (`Partial`, `Pick`, `Omit`, etc.)

## API Integration Patterns

**React Query Implementation:**

```typescript
// Query pattern
export function useGetEntitiesQuery() {
  return useQuery({
    queryKey: ["entities"],
    queryFn: async () => {
      const response = await apiClient.getEntities();
      return schemas.EntitiesResponse.parse(response);
    },
  });
}

// Mutation pattern
export function useCreateEntityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof schemas.EntityCreate>) => {
      const response = await apiClient.createEntity(data);
      return schemas.EntityResponse.parse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}
```

**Always:**

- Validate all API responses with Zod schemas
- Use descriptive hook names following `use[Action][Entity][Query|Mutation]` pattern
- Include proper error handling within mutations/queries
- Use `queryKey` consistently for effective cache invalidation

## Form Handling Patterns

**Type-Safe Form Implementation:**

```typescript
// Use react-hook-form with Zod resolver
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues,
});

// Always validate form data with Zod schemas
const zodSchema = schemas.EntityCreate;
```

## Code Quality Standards

**Formatting and Linting:**

- Configure Prettier with Tailwind plugin for consistent class ordering
- Use ESLint flat config format with strict TypeScript rules
- Run format checks during CI and as pre-commit hooks
- Maintain consistent indentation and line endings

**Spell Checking:**

- Include `cspell.json` configuration in project root
- Comprehensive technical dictionary with 100+ pre-approved terms
- Smart ignores for generated code, build artifacts, and lock files

## Testing Strategy

When working with this codebase:

- Look for existing test patterns in the project
- Follow the same testing framework and structure as existing tests
- Never assume specific test framework - check package.json and existing test files
- Write tests for new utilities and complex logic
- Validate API integration with proper mocking

## Important Notes

**Code Generation:**

- The project may use automated code generation (check for `generate` script)
- Generated code typically goes in `src/generated/` directory
- Never manually modify generated files
- Re-run generation when schemas change

**Error Handling:**

- Use typed error formatters
- Provide specific, helpful error messages
- Implement error boundaries for critical UI sections
- Log errors with appropriate context

**Performance:**

- Use React Query's caching capabilities
- Implement component memoization where appropriate
- Prefer static generation strategies when possible

This project exemplifies modern frontend development best practices and serves as a comprehensive reference for TypeScript + React development workflows.
