# Front-End Coding Best Practices

## File Structure

- Use **kebab-case** for all filenames.

---

## Code Readability

- Write code to be more **readable than writable**.
- When generating code (but not when editing existing code), always prefer **explicit and clear syntax** over shorthand
  - Examples:
    - Use `React.FunctionComponent` instead of `React.FC` when generating a new component.
    - Use `className="button-primary"` instead of `className="btn-p"` when naming new classes.
    - Use full prop names like `disabled={true}` instead of just `disabled` when suggesting new props.

---

## Command Line

- When generating code (but not when editing existing code), use **long flags** instead of short flags for better clarity.
  - Examples:
    - Use `--no-emit` instead of `-n`.
    - Use `prettier --write .` instead of `prettier -w .`.
    - Use `next lint --config eslint.config.mjs` instead of `next lint -c eslint.config.mjs`.

---

## Tailwind CSS & ShadCN

- Use `import { cn } from "@/lib/utils";` for **merging conditional classes**, keeping dark mode in mind.
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

- Prefer `type` over `interface`.
- Avoid `any`, `as`, and `is` wherever possible. Use `zod` for strict type validation.
- Leverage utility types like `Partial`, `Pick`, and `Omit` for conciseness.

---

## Zod

- Use **PascalCase** for schema names.
  - Example:
    ```typescript
    export const UserResponseSchema = z.strictObject({
      id: z.string(),
      name: z.string(),
    });

    export type UserResponse = z.infer<typeof UserResponseSchema>;
    ```
- Always validate API responses using Zod schemas to ensure runtime type safety.

---

## @tanstack/react-query@5

### General Best Practices

- Use `mutationKey` and `queryKey` to ensure **precise cache invalidation**.
- Keep **fetcher** and **transformer functions** separate from React Query hooks for better modularity.
  - Example:

    ```typescript
    export const fetchUsers = async (): Promise<User[]> => {
      const response = await api.get("/users");
      return response.data;
    };

    const transformUsers = (users: User[]): User[] =>
      users.map((user) => ({ ...user, isAdmin: user.role === "admin" }));

    export const useUsersQuery = (options?: UseQueryOptions<User[]>) =>
      useQuery(["users"], fetchUsers, {
        select: transformUsers,
        ...options,
      });
    ```

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

---

## Conclusion

By following these best practices, you can maintain a clean, type-safe, and modular codebase. Combining Zod with React Query ensures runtime validation, precise caching, and enhanced maintainability, especially when working with dynamic data sources like Chromia Postchain.

---------------------

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
