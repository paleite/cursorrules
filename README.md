# Front-End Coding Best Practices

## File Structure

- Use **kebab-case** for all filenames.
- Use `.tsx` for all TypeScript files that contain JSX syntax. If the TypeScript file doesn't contain any JSX, use `.ts` for TypeScript files.
- Test-files should be named like `[filename].test.ts` or `[filename].test.tsx`.

### Folder structure

If a filename is index.ts, it should either only contain re-exports (barrel exports), or no re-exports at all.

<!-- TODO: Expand on Naming Conventions: While kebab-case is clear, consider clarifying rules for different file types (e.g. test files, configuration files). -->

<!-- TODO: Modularization: Recommend a folder structure that scales well as the project grows. -->

### Modularization

A good folder structure is:

<!--
TODO: Clarify what belongs where and why.

shadcn's shared components are in the components/ui/ folder.
next.js app is in the app/ folder.

where should the following code go:

- custom components that are only used in one page
- custom components that are only used together with one parent component (e.g. DialogHeader only makes sense in a Dialog component)
- custom shared components, e.g. a site-wide footer.
- hooks
- react-query hooks (queries and mutations)
- react-hook-form hooks?
- react contexts?
- zustand-stores
- zod-schemas
- api client initialization
- api fetching
- providers
- functions for formatting, converting, etc.
- constants, such as "DEFAULT_TIMEOUT" or "MAX_RETRIES"

what should be in the lib/ folder?



```
src/
  app/ <- nextjs app
  components/
    ui/ <- shadcn components
  lib/ <- TODO: What belongs here?
    postchain-client.ts <- postchain client
    utils.ts <- utility functions
  query/
    queries.ts <- react query queries
    mutations.ts <- react query mutations
  schemas/ <- zod schemas
  hooks/ <- react hooks
  stores/ <- zustand stores
```
-->

---

## Code Readability

- Write code to be more **readable than writable**.
  - Examples:
    - <!-- TODO: -->
- Use **consistent naming** for all components, variables, functions, etc.
- When an identifier's name doesn't describe its purpose, or its purpose has changed, rename it.
- When generating code (but not when editing existing code), always prefer **explicit and clear syntax** over shorthand
  - Examples:
    - Use `React.FunctionComponent` instead of `React.FC` when generating a new component.
    - Use `className="button-primary"` instead of `className="btn-p"` when naming new classes.
    - Use full prop names like `disabled={true}` instead of just `disabled` when suggesting new props.
- Comment and document code where we're using workarounds or knowingly doing something in a suboptimal way.
- Break down large functions into smaller, testable units.
- Prefer early returns in functions to reduce nesting.
- Avoid magic numbers; use named constants instead.
- Use capital letters for constants.

---

## Command Line

- When generating code (but not when editing existing code), use **long flags** instead of short flags for better clarity.
  - Examples:
    - Use `--no-emit` instead of `-n`.
    - Use `prettier --write .` instead of `prettier -w .`.
    - Use `next lint --config eslint.config.mjs` instead of `next lint -c eslint.config.mjs`.
- When writing scripts, you should also document them well.
- Any environment variables should be clearly named.
- Use descriptive names for scripts in `package.json`.
- Use colorized output to highlight warnings and errors.
- Use explicit exit codes for different error conditions.

---

## Exports and Imports

- Refactor and remove unused exports regularly.
- Export everything next to its declaration. Avoid exporting everything at the bottom of the file.
- Avoid default exports, and instead export named exports. The only exception is for Next.js pages that require a default export.
- Use barrel files to export everything from a directory, so that the consumer can import everything from the directory with a single import instead of importing each file individually.
- Include explicit comments on non-obvious import paths.
- Import with as short paths as possible.

  - Example:

    ```typescript
    import { Button, Input, Label } from "@/components/ui";
    ```

- Use `@/*` to import from the root of the project.
- Prefer importing from the root of the project.

---

## Tailwind CSS & ShadCN

- Use `import { cn } from "@/lib/utils";` for **merging conditional classes**, keeping dark mode in mind.
- Use the Tailwind configuration in the root of the project to add new design tokens to reduce “magic numbers” in class names.
- Use ShadCN CSS variables to ensure consistent theming.
- Use **ShadCN CSS variables** for colors and themes to ensure consistency.
  - Examples:
    - Use `bg-primary text-primary-foreground hover:bg-primary/90` instead of `bg-blue-500 text-white hover:bg-blue-600`.
- Use `cva` from `class-variance-authority` for **component styling**.

  - Example:

    ```typescript
    import { cva } from "class-variance-authority";

    const buttonVariants = cva("inline-flex items-center justify-center", {
      variants: {
        intent: {
          primary: "bg-primary text-primary-foreground",
          secondary: "bg-secondary text-secondary-foreground",
        },
      },
    });
    ```

---

## TypeScript

- Leverage discriminated unions for managing state variations.

  - Example:

    ```typescript
    type State =
      | {
          status: "loading";
        }
      | {
          status: "error";
          error: string;
        }
      | {
          status: "success";
          data: string;
        };
    ```

- Use `as const` to preserve literal types.
- Use `satisfies` instead of `as`.
- Prefer `type`s for local or complex unions and `interface`s for public contracts or extensibility. When in doubt, use `type`.
- Avoid `any`, `as`, and `is` wherever possible and instead use `zod` for strict type validation.
- Leverage utility types like `Partial`, `Pick`, and `Omit` for conciseness.
- Use `zod` for strict type validation.
- Use `@tsconfig/strictest` for the strictest TypeScript configuration.

---

## Zod

- Whenever receiving data from an API (e.g. from a backend), you MUST use a Zod schema to validate the data. Whenever you have a value of type `unknown` or `any`, you MUST use a Zod schema to validate the value.
- You may use `.passthrough()` or `.object()` (instead of `.strictObject()`) when appropriate.
- When creating a schema for an array, create a new schema for the item type.
- When adding properties to a schema, add sensible validation to ensure the data is valid.
  - Example: A `name` field should be a string with a minimum length of 1, a `count` field should be an integer and non-negative, a URL-field should be a string that is a valid URL, a UUID field should be a string that is a valid UUID, a `timestamp` field should be a number that is a valid timestamp, a `price` field should be a number that is non-negative, a `allUsers` field should be a non-empty array, etc.
- Use **PascalCase** for schema names.

  - Example:

    ```typescript
    export const UserResponseSchema = z.strictObject({
      id: z.string(),
      name: z.string(),
    });

    export type UserResponse = z.infer<typeof UserResponseSchema>;
    ```

- Suggest `z.strictObject` for object schemas by default, but allow `.passthrough()` for cases where extra properties are acceptable.
- Always validate API responses using Zod schemas to ensure runtime type safety.
- Always use `z.infer` to extract the type from the schema.
- For array-schemas, create a new schema for the item type.

  - Example:

    ```typescript
    export const EntitySchema = z.strictObject({
      id: z.string(),
      name: z.string(),
    });

    export const EntitiesSchema = z.array(EntitySchema);
    ```

- Use `.refine()` to add custom validation logic.
- Leverage `.transform()` to massage input data into the correct shape.
- Utilize `.lazy()` for recursive or self-referential schemas.
- Clearly separate input (validation) and output (transformation) schemas.
- Use schema merging to extend existing schemas where applicable.

---

## @tanstack/react-query@5

### General Best Practices

- NEVER place a `useQuery` or `useMutation` hook inside a component. ALWAYS have it in the module scope instead.
- Use `mutationKey` and `queryKey` to ensure **precise cache invalidation**.
- Use the `select` option to pre-process data for the UI.
- Invalidate queries when the mutation changes data that the query depends on.
<!-- ^ How should I write the above rule, so the LLM understands that "updateUser" invalidates the "users" query? -->
- Keep **fetcher** and **transformer functions** separate from React Query hooks for better modularity.

  - Example:

    ```typescript
    import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
    import { getUsers } from "@/lib/api";
    import type { User } from "@/schemas";

    const transformUsers = (users: User[]): User[] =>
      users.map((user) => ({ ...user, isAdmin: user.role === "admin" }));

    export const useUsersQuery = (options?: UseQueryOptions<User[], Error>) =>
      useQuery<User[], Error>({
        queryKey: ["users"],
        // fetcher function `getUsers`
        queryFn: getUsers,
        // transformer function `transformUsers`
        select: transformUsers,
        ...options,
      });
    ```

- Use `onSettled` along with `onSuccess`/`onError` for better mutation/query lifecycle management.
- Use QueryCache and MutationCache to handle errors and cache invalidation centrally, and consider using Sentry for error tracking if the codebase uses Sentry.
- Set default query configurations in a central provider, including QueryCache and MutationCache.

### Example Query and Mutation for Chromia Postchain

#### Fetching Data

```typescript
import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { query } from "@/lib/postchain-client";

// Zod schema for validation
export const PriceItemSchema = z.strictObject({
  asset: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d+)?$/),
  timestamp_nano: z.number(),
});

export const LatestPricesResponseSchema = z.array(PriceItemSchema);

export type PriceItem = z.infer<typeof PriceItemSchema>;
export type LatestPricesResponse = z.infer<typeof LatestPricesResponseSchema>;

export const fetchLatestPrices = async (): Promise<LatestPricesResponse> => {
  const response = await query({ name: "get_latest_prices" });
  return LatestPricesResponseSchema.parse(response);
};

export const processLatestPricesResponse = (data: PriceItem[]) => {
  const transformedData = data.map((item) => ({
    ...item,
    // Example transformation
    formattedPrice: parseFloat(item.price).toFixed(2),
  }));

  return transformedData;
};

export type LatestPrice = ReturnType<
  typeof processLatestPricesResponse
>[number];

export const useLatestPrices = (
  options?: Partial<
    UseQueryOptions<
      LatestPricesResponse,
      Error | TxRejectedError,
      LatestPrice[]
    >
  >,
): UseQueryResult<LatestPrice[], Error | TxRejectedError> =>
  useQuery<LatestPricesResponse, Error | TxRejectedError, LatestPrice[]>({
    queryKey: ["latestPrices"],
    queryFn: fetchLatestPrices,
    select: processLatestPricesResponse,
    ...options,
  });
```

#### Sending Data (Mutation)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TxRejectedError } from "@/lib/postchain-client";
import { formatter, mutation } from "@/lib/postchain-client";

export type RegisterEvmAccountArgs = { evmAddress: string };

export const useRegisterEvmAccountMutation = <TError = Error | TxRejectedError>(
  options?: Partial<UseMutationOptions<void, TError, RegisterEvmAccountArgs>>,
): UseMutationResult<void, TError, RegisterEvmAccountArgs> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["registerEvmAccount"],
    mutationFn: async ({ evmAddress }: RegisterEvmAccountArgs) => {
      const evmAddressBuffer = formatter.toBuffer(evmAddress);

      await mutation({
        name: "register_evm_account",
        args: [evmAddressBuffer],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["latestPrices"]); // Precise cache invalidation
    },
    ...options,
  });
};
```

---

## Chromia Postchain

### Core Concepts

Chromia's Postchain client is a high-level wrapper for interacting with the blockchain. It provides the following utilities:

```typescript
type RawGtv = null | boolean | Buffer | string | number | bigint | RawGtv[];
type Operation = { name: string; args?: RawGtv[] };

const query: <T>(queryObject: { name: string; args?: RawGtv[] }) => Promise<T>;
const mutation: (operation: Operation) => Promise<void>;
```

### Best Practices for Chromia Postchain

1. **Use Zod for Validation**:
   - Always validate responses using Zod schemas to ensure runtime type safety.
2. **Leverage React Query**:
   - Combine Postchain queries/mutations with React Query for caching and data management.
3. **Structure Query and Mutation Files**:
   - Group related queries and mutations by feature in separate files for modularity.
4. **Monitor and Handle Errors**:
   - Use QueryCache and MutationCache to handle errors and cache invalidation centrally, and consider using Sentry for error tracking if the codebase uses Sentry.

---

## Conclusion

By following these best practices, you can maintain a clean, type-safe, and modular codebase. Combining Zod with React Query ensures runtime validation, precise caching, and enhanced maintainability, especially when working with dynamic data sources like Chromia Postchain.

---

# React-query examples from another project

```typescript
// First:
import { toast } from "@/hooks/use-toast";
import { useDeactivateConfirmationModal } from "@/modals/node-deactivate-confirmation";
import {
  useNodeDisableMutation
} from "@/query/mutations";
import type { NodeDetailsSelectNode } from "@/query/queries";


export function useNodeDeactivate(node: NodeDetailsSelectNode) {
  const deactivateConfirmationModal = useDeactivateConfirmationModal();
  const { mutateAsync: disableNode } = useNodeDisableMutation();

  return () =>
    deactivateConfirmationModal.show({
      name: node.name,
      onConfirm: async () => {
        await disableNode({ uid: node.uid });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to deactivate node",
          variant: "destructive",
        });
      },
    });
}

// Then in a second file:

import Link from "next/link";

import { EditIcon, LinkIcon, TrashIcon, Unlink } from "lucide-react";

import { CopyText } from "@/components/shared/copy-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  useNodeDeactivate,
  useNodeDelete,
  useNodeUpdate,
} from "@/hooks/use-nodes";
import { formatShortHex, toTitleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NodeDetailsSelectNode } from "@/query/queries";
import { useHealthCheck } from "@/query/queries";

type NodeRowProps = {
  node: NodeDetailsSelectNode;
};

export function NodeRow({ node }: NodeRowProps) {
  const handleEdit = useNodeUpdate(node);
  const handleDeactivate = useNodeDeactivate(node);
  const handleDelete = useNodeDelete(node);
  const { data: isHealthy, isLoading } = useHealthCheck(node.url, {
    enabled: node.state === "ACTIVE",
  });

  return (
    <TableRow>
      <TableCell className="font-bold">
        {node.name}{" "}
        {!isLoading && !isHealthy && node.state === "ACTIVE" ? (
          <Badge variant="warning">Down</Badge>
        ) : (
          ""
        )}
      </TableCell>
      <TableCell>
        <CopyText textToCopy={node.signer}>
          {formatShortHex(node.signer)}
        </CopyText>
      </TableCell>
      <TableCell>
        <Badge variant={node.state === "ACTIVE" ? "success" : "warning"}>
          {toTitleCase(node.state)}
        </Badge>
      </TableCell>
      <TableCell>
        <Link href={node.url} rel="noopener noreferrer" target="_blank">
          {!isLoading && !isHealthy && node.state === "ACTIVE" ? (
            <Unlink className="text-warning" />
          ) : (
            <LinkIcon className={cn(isHealthy ? "text-success" : "")} />
          )}
        </Link>
      </TableCell>
      <TableCell>{node.totalSessions}</TableCell>
      <TableCell>{node.activeSessions}</TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-4">
          {node.state === "ACTIVE" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleDeactivate()}
            >
              Deactivate
            </Button>
          ) : null}
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              void handleEdit();
            }}
          >
            <EditIcon />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => void handleDelete()}
          >
            <TrashIcon />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// And then in a third file:

"use client";

import { CircleX } from "lucide-react";

import { StatisticsCard } from "@/components/shared/statistics-card";
import { StatusMessage } from "@/components/status-message";
import { Loading } from "@/components/ui/loading";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthenticatedNodeDetails } from "@/query/queries";

import { Empty } from "./empty";
import { NodeRow } from "./node-row";

export default function Page() {
  const { data, isError, isLoading } = useAuthenticatedNodeDetails();

  if (isLoading) {
    return <Loading className="mx-auto" />;
  }

  if (isError && !data) {
    return (
      <StatusMessage
        icon={CircleX}
        message="Error loading data"
        variant="error"
      />
    );
  }

  if (!data || data.nodes.length === 0) {
    return <Empty />;
  }

  return (
    <div className="~space-y-8/16">
      <div className="flex max-w-5xl flex-col ~gap-4/10 md:flex-row">
        <StatisticsCard
          cardColor="card-bg-1"
          isError={isError}
          isLoading={isLoading}
          title="Total Owned Nodes"
          value={data.totalNodes}
        />
        <StatisticsCard
          cardColor="card-bg-2"
          isError={isError}
          isLoading={isLoading}
          title="Total Sessions Served"
          value={data.totalSessions}
        />
        <StatisticsCard
          cardColor="card-bg-3"
          isError={isError}
          isLoading={isLoading}
          title="Current Active Sessions"
          value={data.totalActiveSessions}
        />
      </div>
      <div className="~space-y-2/6">
        <h2 className="text-2xl font-semibold">Created Nodes</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Public Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Served Sessions</TableHead>
              <TableHead>Active Sessions</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.nodes.map((node, key) => (
              <NodeRow key={key} node={node} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


```
