# Reusable React Components Guidelines

> A comprehensive guide to building reusable React components following shadcn/ui v4 patterns and conventions.

## Table of Contents

1. [Core Architecture Principles](#core-architecture-principles)
2. [Component Structure & Naming](#component-structure--naming)
3. [Styling Architecture](#styling-architecture)
4. [The data-slot Pattern](#the-data-slot-pattern)
5. [asChild Polymorphism](#aschild-polymorphism)
6. [Focus & Accessibility](#focus--accessibility)
7. [Advanced Tailwind Patterns](#advanced-tailwind-patterns)
8. [State Management](#state-management)
9. [Complex Component Patterns](#complex-component-patterns)
10. [Breaking Conventions](#breaking-conventions)

---

## Core Architecture Principles

### Function Components with Named Exports

**Always use function declarations with named exports:**

```tsx
// ✅ CORRECT
function Button({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn("...", className)} {...props} />
}

export { Button }

// ❌ AVOID
export default function Button() { ... }
const Button = () => { ... }
```

**Rationale:** Named exports enable better tree-shaking, explicit imports, and easier refactoring.

### Composition Over Configuration

Build components from smaller, focused sub-components rather than complex prop APIs:

```tsx
// ✅ CORRECT - Composition
<Field>
  <FieldLabel>Name</FieldLabel>
  <Input />
  <FieldDescription>Enter your full name</FieldDescription>
  <FieldError errors={errors} />
</Field>

// ❌ AVOID - Configuration
<Field
  label="Name"
  description="Enter your full name"
  error={errors}
>
  <Input />
</Field>
```

### TypeScript Component Props Pattern

Use `React.ComponentProps` for native elements, extend for custom props:

```tsx
// Simple component
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn("...", className)} {...props} />;
}

// With variants
function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// With asChild
function Item({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn("...", className)} {...props} />;
}
```

---

## Component Structure & Naming

### Hierarchical Component Families

Components follow a namespace pattern where related components share a prefix:

```
Button
├── ButtonGroup
│   ├── ButtonGroupText
│   └── ButtonGroupSeparator

Field
├── FieldSet
├── FieldGroup
├── FieldLegend
├── FieldLabel
├── FieldContent
├── FieldTitle
├── FieldDescription
├── FieldError
└── FieldSeparator

Item
├── ItemGroup
├── ItemMedia
├── ItemContent
├── ItemTitle
├── ItemDescription
├── ItemActions
├── ItemHeader
├── ItemFooter
└── ItemSeparator
```

### Naming Conventions

**Component Names:**

- PascalCase for component names
- Prefix sub-components with parent name
- Use semantic suffixes: `Header`, `Footer`, `Content`, `Title`, `Description`, `Action`, `Media`

**Component Roles:**

- **Root**: Main wrapper (e.g., `Field`, `Item`, `ButtonGroup`)
- **Container**: Layout/structure (e.g., `FieldGroup`, `FieldContent`)
- **Content**: Text/media (e.g., `FieldTitle`, `ItemDescription`)
- **Action**: Interactive elements (e.g., `ItemActions`, `FieldError`)
- **Separator**: Visual dividers (e.g., `FieldSeparator`, `ItemSeparator`)

**File Naming:**

- Use kebab-case for filenames: `button-group.tsx`, `input-group.tsx`
- One component family per file
- Match the primary component name

### Export Patterns

Always export all components at the end of the file:

```tsx
export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
```

Export variants if needed for composition:

```tsx
export {
  Button,
  buttonVariants, // Export for use in other components
};
```

---

## Styling Architecture

### The cn() Utility

The `cn()` utility combines `clsx` and `tailwind-merge` for optimal class handling:

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage pattern:**

```tsx
function Component({ className, ...props }) {
  return (
    <div
      className={cn(
        "base-classes", // Base styles
        variants({ variant }), // CVA variants
        className, // User overrides (always last)
      )}
      {...props}
    />
  );
}
```

### Class Variance Authority (CVA)

Use CVA for type-safe variant management:

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  // Base classes - always applied
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

**Key principles:**

- Base classes contain universal styles
- Variants for different visual styles
- Always include `defaultVariants`
- Use `VariantProps<typeof variants>` for type safety

### Tailwind Class Organization Hierarchy

Organize Tailwind classes in this specific order for consistency:

```tsx
cn(
  // 1. LAYOUT & DISPLAY
  "flex flex-col",
  "grid",
  "inline-flex",

  // 2. POSITIONING
  "relative absolute fixed",
  "inset-0 top-0 left-0",

  // 3. SIZE & SPACING
  "w-full h-9 size-4",
  "p-4 px-3 py-2",
  "gap-2 space-x-4",

  // 4. TYPOGRAPHY
  "text-sm font-medium leading-none",
  "text-foreground",

  // 5. BACKGROUNDS & BORDERS
  "bg-background border border-input",
  "rounded-md shadow-xs",

  // 6. TRANSITIONS & ANIMATIONS
  "transition-all duration-200",
  "animate-in fade-in",

  // 7. INTERACTIVE STATES (pseudo-classes)
  "hover:bg-accent",
  "focus-visible:ring-2",
  "active:scale-95",
  "disabled:opacity-50 disabled:pointer-events-none",

  // 8. DATA ATTRIBUTES
  "data-[state=open]:animate-in",
  "data-[variant=destructive]:text-destructive",

  // 9. ARIA STATES
  "aria-invalid:border-destructive",
  "aria-disabled:opacity-50",

  // 10. GROUP/PEER MODIFIERS
  "group-hover:opacity-100",
  "peer-disabled:opacity-50",
  "group-data-[state=collapsed]:hidden",

  // 11. CONTAINER QUERIES
  "@md/field-group:flex-row",
  "@container/field-group:items-center",

  // 12. RESPONSIVE MODIFIERS
  "md:flex-row",
  "lg:px-8",

  // 13. DARK MODE
  "dark:bg-background",
  "dark:border-border",

  // 14. CHILD SELECTORS (grouped by selector type)
  // SVG children
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",

  // Specific children
  "[&>button]:rounded-md",
  "[&_a]:underline [&_a:hover]:text-primary",

  // Pseudo-elements
  "after:absolute after:inset-0",

  className, // User overrides always last
);
```

**Important notes:**

- This order maximizes readability and prevents conflicts
- Group related utilities together
- Keep selector specificity patterns together
- User `className` prop always last to allow overrides

---

## The data-slot Pattern

### Purpose

The `data-slot` attribute enables powerful parent-aware styling and component identification without relying on class names.

### Implementation

**Always add data-slot to every component:**

```tsx
function Button({ ...props }) {
  return <button data-slot="button" {...props} />;
}

function FieldLabel({ ...props }) {
  return <Label data-slot="field-label" {...props} />;
}

function InputGroupAddon({ align, ...props }) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align} // Additional data attributes for state
      {...props}
    />
  );
}
```

### Parent-Aware Styling with has-[]

Use `has-[>selector]` to style parents based on children:

```tsx
// InputGroup styles itself based on contained children
function InputGroup({ className, ...props }) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex items-center border rounded-md",

        // Adjust layout when block-start addon exists
        "has-[>[data-align=block-start]]:flex-col",
        "has-[>[data-align=block-start]]:h-auto",

        // Adjust input padding when inline addons exist
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",

        // Height adjustments for textarea
        "has-[>textarea]:h-auto",

        className,
      )}
      {...props}
    />
  );
}
```

### Group Pattern for Named Contexts

Use `group/name` and `group-[condition]/name:` for nested component relationships:

```tsx
function Field({ orientation, ...props }) {
  return (
    <div
      role="group"
      className={cn(
        "group/field flex gap-3", // Named group
        "data-[invalid=true]:text-destructive",
      )}
      data-orientation={orientation}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "font-medium",
        "group-data-[disabled=true]/field:opacity-50", // Responds to parent state
        className,
      )}
      {...props}
    />
  );
}
```

### Multiple Data Attributes for State

Use multiple data attributes to expose component state:

```tsx
function SidebarMenuButton({ isActive, size, ...props }) {
  return (
    <button
      data-slot="sidebar-menu-button"
      data-active={isActive} // Boolean state
      data-size={size} // Variant state
      className={cn(
        "flex items-center",
        "data-[active=true]:bg-accent",
        "data-[size=sm]:h-7",
        "data-[size=default]:h-8",
      )}
      {...props}
    />
  );
}
```

---

## asChild Polymorphism

### The Pattern

The `asChild` prop enables component composition without wrapper elements using Radix UI's Slot component:

```tsx
import { Slot } from "@radix-ui/react-slot";

function Button({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ className }))}
      {...props}
    />
  );
}
```

### When to Use asChild

**Use asChild when:**

- Component might need to be a link (`<a>`)
- Component might need custom interactive elements
- You want to avoid wrapper div nesting

```tsx
// Render Button as a link
<Button asChild>
  <Link href="/dashboard">
    <HomeIcon />
    Dashboard
  </Link>
</Button>

// Renders as: <a href="/dashboard" class="button-styles">...</a>
// Without asChild would be: <button class="button-styles"><a href="/dashboard">...</a></button>
```

**Do not use asChild when:**

- Component is always a specific element (e.g., `Input` is always `<input>`)
- Component has complex internal structure
- Type safety becomes difficult

### Implementation Pattern

```tsx
// Simple element - good candidate for asChild
function Item({
  asChild = false,
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="item"
      className={cn(itemVariants({ variant }), className)}
      {...props}
    />
  );
}

// Complex component - do not use asChild
function Field({ orientation, className, ...props }) {
  // Has specific role, data attributes, and structure
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}
```

---

## Focus & Accessibility

### Focus-Visible Ring Pattern

**Always use `focus-visible:` instead of `focus:`:**

```tsx
// Standard focus ring pattern
className={cn(
  "outline-none",  // Remove default outline
  "focus-visible:ring-[3px]",           // 3px ring width
  "focus-visible:ring-ring/50",         // 50% opacity semantic color
  "focus-visible:border-ring",          // Border matches ring color
)}

// Variant-specific rings
className={cn(
  "outline-none",
  "focus-visible:ring-[3px] focus-visible:ring-ring/50",
  "aria-invalid:focus-visible:ring-destructive/20",  // Error state
  "dark:aria-invalid:ring-destructive/40",           // Dark mode error
)}
```

**Ring patterns by component type:**

```tsx
// Buttons
"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

// Inputs
"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
"aria-invalid:ring-destructive/20 aria-invalid:border-destructive";
"dark:aria-invalid:ring-destructive/40";

// Containers (like InputGroup)
"has-[[data-slot=input]:focus-visible]:border-ring";
"has-[[data-slot=input]:focus-visible]:ring-ring/50";
"has-[[data-slot=input]:focus-visible]:ring-[3px]";
```

### ARIA States

Implement proper ARIA state styling:

```tsx
function Input({ className, ...props }) {
  return (
    <input
      data-slot="input"
      className={cn(
        "border rounded-md",

        // Invalid state
        "aria-invalid:border-destructive",
        "aria-invalid:ring-destructive/20",
        "dark:aria-invalid:ring-destructive/40",

        // Disabled state
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        "disabled:pointer-events-none",

        // Required indicator
        "aria-required:after:content-['*']",
        "aria-required:after:ml-1",
        "aria-required:after:text-destructive",

        className,
      )}
      {...props}
    />
  );
}
```

### Screen Reader Support

**Use sr-only for screen reader only content:**

```tsx
function SidebarTrigger({ ...props }) {
  return (
    <Button {...props}>
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

// Hidden headers for dialogs/sheets
<SheetHeader className="sr-only">
  <SheetTitle>Sidebar</SheetTitle>
  <SheetDescription>Displays the mobile sidebar.</SheetDescription>
</SheetHeader>;
```

### Semantic HTML & ARIA Roles

**Use appropriate semantic elements and ARIA roles:**

```tsx
// Proper group semantics
function Field({ ...props }) {
  return <div role="group" data-slot="field" {...props} />;
}

function ButtonGroup({ ...props }) {
  return <div role="group" data-slot="button-group" {...props} />;
}

function ItemGroup({ ...props }) {
  return <div role="list" data-slot="item-group" {...props} />;
}

// Proper status roles
function FieldError({ ...props }) {
  return <div role="alert" data-slot="field-error" {...props} />;
}

function Spinner({ ...props }) {
  return <Loader2Icon role="status" aria-label="Loading" {...props} />;
}
```

### Keyboard Navigation

Implement proper keyboard support:

```tsx
function SidebarProvider({ children, ...props }) {
  const toggleSidebar = useCallback(() => { ... }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  return <div {...props}>{children}</div>
}
```

---

## Advanced Tailwind Patterns

### Container Queries

Use container queries for responsive component internals:

```tsx
function FieldGroup({ className, ...props }) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group",
        "@container/field-group", // Define container
        "flex flex-col gap-7",
        className,
      )}
      {...props}
    />
  );
}

function Field({ orientation, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col",

        // Responsive orientation using container queries
        orientation === "responsive" && [
          "flex-col", // Mobile
          "@md/field-group:flex-row", // Container breakpoint
          "@md/field-group:items-center",
          "@md/field-group:[&>*]:w-auto",
        ],
      )}
      {...props}
    />
  );
}
```

### Group/Peer Patterns

**Named groups for nested relationships:**

```tsx
function InputGroup({ className, ...props }) {
  return (
    <div
      className={cn(
        "group/input-group", // Named group
        "border rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupButton({ className, ...props }) {
  return (
    <Button
      className={cn(
        "rounded-full",
        "group-data-[disabled=true]/input-group:opacity-50", // Responds to group state
        className,
      )}
      {...props}
    />
  );
}
```

**Peer pattern for sibling relationships:**

```tsx
function FieldLabel({ className, ...props }) {
  return (
    <Label
      className={cn(
        "peer/field-label", // Declare as peer
        "font-medium",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }) {
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        "peer-[]/field-label:mt-2", // Responds to sibling
        className,
      )}
      {...props}
    />
  );
}
```

**Sidebar pattern with peer state:**

```tsx
function Sidebar({ side, state, ...props }) {
  return (
    <div
      className="peer" // Declare as peer for inset
      data-state={state}
      data-variant="inset"
      data-side={side}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }) {
  return (
    <main
      className={cn(
        "flex-1",
        // Responds to peer sidebar state
        "md:peer-data-[variant=inset]:m-2",
        "md:peer-data-[variant=inset]:rounded-xl",
        "md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}
```

### SVG Child Selectors

Standardized SVG handling pattern:

```tsx
className={cn(
  // Disable pointer events on all SVG children
  "[&_svg]:pointer-events-none",

  // Prevent SVG from shrinking
  "[&_svg]:shrink-0",

  // Default size for SVGs without explicit size classes
  "[&_svg:not([class*='size-'])]:size-4",

  // Color inheritance for SVGs without text- classes
  "[&_svg:not([class*='text-'])]:text-muted-foreground",
)
```

**Usage in components:**

```tsx
function Button({ className, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2",
        "[&_svg]:pointer-events-none",
        "[&_svg]:shrink-0",
        "[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

// SVG gets default size-4 unless specified
<Button>
  <PlusIcon />  {/* Gets size-4 */}
  Add Item
</Button>

<Button>
  <PlusIcon className="size-6" />  {/* Keeps size-6 */}
  Add Item
</Button>
```

### has-[] Selector Patterns

**Direct children:**

```tsx
"has-[>button]:gap-4"; // Has direct button child
"has-[>[data-slot=input]]:h-auto"; // Has direct child with data-slot
```

**Descendant selectors:**

```tsx
"has-[[data-slot=checkbox-group]]:gap-3"; // Has descendant with data-slot
"has-[input]:flex-row"; // Has any input descendant
```

**Attribute selectors:**

```tsx
"has-[>[data-align=block-start]]:flex-col"; // Has child with data-align
"has-data-[state=checked]:bg-primary/5"; // Has any element with data-state
```

### Arbitrary Values in Tailwind

Use CSS variables and arbitrary values for dynamic styling:

```tsx
function SidebarProvider({ style, ...props }) {
  return (
    <div
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
          ...style,
        } as React.CSSProperties
      }
      className="flex"
      {...props}
    />
  );
}

function Sidebar({ className, ...props }) {
  return (
    <div
      className={cn(
        "w-(--sidebar-width)", // Uses CSS variable
        "transition-[width] duration-200", // Arbitrary transition property
        "origin-(--radix-dropdown-menu-content-transform-origin)", // Radix variable
        className,
      )}
      {...props}
    />
  );
}
```

---

## State Management

### Context Pattern with Custom Hooks

Components with complex state should expose a context and custom hook:

```tsx
// 1. Define context type
type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
  isMobile: boolean
}

// 2. Create context
const SidebarContext = React.createContext<SidebarContextProps | null>(null)

// 3. Custom hook with error handling
function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

// 4. Provider component
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = React.useCallback((value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open) : value
    if (setOpenProp) {
      setOpenProp(openState)
    } else {
      _setOpen(openState)
    }
  }, [setOpenProp, open])

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({ state: open ? "expanded" : "collapsed", open, setOpen, ... }),
    [open, setOpen, ...]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div {...props}>{children}</div>
    </SidebarContext.Provider>
  )
}

// 5. Use in child components
function SidebarTrigger() {
  const { toggleSidebar } = useSidebar()
  return <button onClick={toggleSidebar}>Toggle</button>
}
```

### Controlled/Uncontrolled Pattern

Support both controlled and uncontrolled usage:

```tsx
function SidebarProvider({
  defaultOpen = true,        // Uncontrolled default
  open: openProp,           // Controlled value
  onOpenChange: setOpenProp, // Controlled setter
  ...props
}) {
  // Internal state for uncontrolled
  const [_open, _setOpen] = React.useState(defaultOpen)

  // Use controlled value if provided, otherwise internal
  const open = openProp ?? _open

  // Unified setter that handles both modes
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value

      // Call controlled setter if provided
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        // Otherwise update internal state
        _setOpen(openState)
      }
    },
    [setOpenProp, open]
  )

  return <div>{/* ... */}</div>
}

// Uncontrolled usage
<SidebarProvider defaultOpen={false}>
  <Sidebar />
</SidebarProvider>

// Controlled usage
const [open, setOpen] = useState(false)
<SidebarProvider open={open} onOpenChange={setOpen}>
  <Sidebar />
</SidebarProvider>
```

### State Persistence

Persist state to cookies for SSR compatibility:

```tsx
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const setOpen = React.useCallback(
  (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open) : value;

    if (setOpenProp) {
      setOpenProp(openState);
    } else {
      _setOpen(openState);
    }

    // Persist to cookie
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  },
  [setOpenProp, open],
);
```

### Data Attributes for State Exposure

Expose state via data attributes for styling:

```tsx
function Sidebar({ side, collapsible, ...props }) {
  const { state } = useSidebar();

  return (
    <div
      data-state={state} // "expanded" | "collapsed"
      data-collapsible={collapsible} // "offcanvas" | "icon" | "none"
      data-side={side} // "left" | "right"
      className={cn(
        "flex flex-col",
        // Style based on state
        "group-data-[state=collapsed]:w-16",
        "group-data-[collapsible=icon]:items-center",
        "group-data-[side=right]:border-l",
      )}
      {...props}
    />
  );
}
```

---

## Complex Component Patterns

### Form Integration with react-hook-form

The Field component integrates seamlessly with react-hook-form:

```tsx
// Field component with error handling
function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) return children;
    if (!errors) return null;

    // Single error
    if (errors.length === 1 && errors[0]?.message) {
      return errors[0].message;
    }

    // Multiple errors
    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {errors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>,
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) return null;

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {content}
    </div>
  );
}

// Usage with react-hook-form
function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          {...form.register("email")}
          aria-invalid={!!form.formState.errors.email}
        />
        <FieldDescription>We'll never share your email.</FieldDescription>
        <FieldError errors={[form.formState.errors.email]} />
      </Field>
    </form>
  );
}
```

### Responsive Layouts with Container Queries

Field components support responsive layouts using container queries:

```tsx
function FieldGroup({ className, ...props }) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group",
        "@container/field-group",  // Container for queries
        "flex flex-col gap-7",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva("group/field flex w-full gap-3", {
  variants: {
    orientation: {
      vertical: "flex-col [&>*]:w-full",
      horizontal: "flex-row items-center [&>[data-slot=field-label]]:flex-auto",
      responsive: [
        // Mobile: vertical
        "flex-col [&>*]:w-full",
        // Container breakpoint: horizontal
        "@md/field-group:flex-row",
        "@md/field-group:items-center",
        "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
      ],
    },
  },
})

// Usage
<FieldGroup>
  <Field orientation="responsive">
    <FieldLabel>Name</FieldLabel>
    <Input />
  </Field>
</FieldGroup>
```

### Empty State Pattern

Empty states follow a consistent composition pattern:

```tsx
// Structure
function Empty({ className, ...props }) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center",
        "gap-6 rounded-lg border-dashed p-6 text-center",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
    />
  )
}

// Variants for media
const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center mb-2",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted size-10 rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
  }
)

// Usage
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <InboxIcon />
    </EmptyMedia>
    <EmptyTitle>No messages</EmptyTitle>
    <EmptyDescription>
      You don't have any messages yet. <a href="#">Send your first message</a>.
    </EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Compose Message</Button>
  </EmptyContent>
</Empty>
```

### Button Groups

Button groups modify child button styling without wrapping components:

```tsx
const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>*]:focus-visible:z-10",
  {
    variants: {
      orientation: {
        horizontal: [
          "[&>*:not(:first-child)]:rounded-l-none",
          "[&>*:not(:first-child)]:border-l-0",
          "[&>*:not(:last-child)]:rounded-r-none",
        ],
        vertical: [
          "flex-col",
          "[&>*:not(:first-child)]:rounded-t-none",
          "[&>*:not(:first-child)]:border-t-0",
          "[&>*:not(:last-child)]:rounded-b-none",
        ],
      },
    },
  }
)

// Usage
<ButtonGroup>
  <Button variant="outline">Left</Button>
  <Button variant="outline">Middle</Button>
  <Button variant="outline">Right</Button>
</ButtonGroup>

// Nested groups
<ButtonGroup>
  <InputGroupButton>
    <SearchIcon />
  </InputGroupButton>
  <ButtonGroup orientation="vertical">
    <Button size="sm">Up</Button>
    <Button size="sm">Down</Button>
  </ButtonGroup>
</ButtonGroup>
```

### Input Groups

Input groups combine inputs with addons and buttons:

```tsx
function InputGroup({ className, ...props }) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group",
        "border rounded-md flex items-center",

        // Adjust for addon positions
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:flex-col",

        // Focus state from child input
        "has-[[data-slot=input]:focus-visible]:ring-2",

        className
      )}
      {...props}
    />
  )
}

// Addon with multiple alignment options
const inputGroupAddonVariants = cva("flex items-center gap-2", {
  variants: {
    align: {
      "inline-start": "order-first pl-3",
      "inline-end": "order-last pr-3",
      "block-start": "order-first w-full px-3 pt-3",
      "block-end": "order-last w-full px-3 pb-3",
    },
  },
})

// Usage
<InputGroup>
  <InputGroupAddon align="inline-start">
    <SearchIcon />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search..." />
  <InputGroupAddon align="inline-end">
    <InputGroupButton size="icon-xs">
      <XIcon />
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

### Item Pattern for Lists

Flexible item component for various list scenarios:

```tsx
// Root with variants
const itemVariants = cva(
  "group/item flex items-center border rounded-md",
  {
    variants: {
      variant: {
        default: "bg-transparent border-transparent",
        outline: "border-border",
        muted: "bg-muted/50",
      },
      size: {
        default: "p-4 gap-4",
        sm: "py-3 px-4 gap-2.5",
      },
    },
  }
)

// Media with type variants
const itemMediaVariants = cva("flex shrink-0 items-center justify-center", {
  variants: {
    variant: {
      default: "bg-transparent",
      icon: "size-8 border rounded-sm bg-muted [&_svg:not([class*='size-'])]:size-4",
      image: "size-10 rounded-sm overflow-hidden [&_img]:size-full",
    },
  },
})

// Usage - Avatar list item
<ItemGroup>
  <Item variant="outline">
    <ItemMedia variant="image">
      <img src={user.avatar} alt="" />
    </ItemMedia>
    <ItemContent>
      <ItemTitle>{user.name}</ItemTitle>
      <ItemDescription>{user.email}</ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button variant="ghost" size="icon-sm">
        <MoreVerticalIcon />
      </Button>
    </ItemActions>
  </Item>
</ItemGroup>
```

### Sidebar Navigation

Complex sidebar with state management and responsive behavior:

```tsx
// Provider handles state, mobile detection, and persistence
function SidebarProvider({ defaultOpen = true, ...props }) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = useState(false)
  const [_open, _setOpen] = useState(defaultOpen)

  // Mobile vs desktop state
  const toggleSidebar = useCallback(() => {
    return isMobile
      ? setOpenMobile((open) => !open)
      : setOpen((open) => !open)
  }, [isMobile])

  // Keyboard shortcut (Cmd/Ctrl + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  return (
    <SidebarContext.Provider value={{ state, open, toggleSidebar, isMobile, ... }}>
      <TooltipProvider delayDuration={0}>
        <div
          style={{
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
          } as React.CSSProperties}
          {...props}
        />
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

// Responsive sidebar: Sheet on mobile, fixed on desktop
function Sidebar({ side = "left", variant = "sidebar", collapsible = "offcanvas" }) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side={side} className="w-(--sidebar-width) p-0">
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      data-state={state}
      data-collapsible={collapsible}
      data-variant={variant}
      className={cn(
        "fixed inset-y-0 z-10 w-(--sidebar-width)",
        "transition-[width] duration-200",
        "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
      )}
    >
      {children}
    </div>
  )
}

// Menu button with tooltip in collapsed state
function SidebarMenuButton({ isActive, tooltip, ...props }) {
  const { isMobile, state } = useSidebar()

  const button = (
    <button
      data-active={isActive}
      className={cn(
        "flex items-center gap-2 rounded-md p-2",
        "data-[active=true]:bg-accent",
        "group-data-[collapsible=icon]:justify-center",
      )}
      {...props}
    />
  )

  if (!tooltip || state !== "collapsed" || isMobile) {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">{tooltip}</TooltipContent>
    </Tooltip>
  )
}
```

---

## Breaking Conventions

### When to Keep It Simple

Not every component needs the full pattern. Simple components can skip complexity:

```tsx
// Spinner - minimal component without variants, data-slot, or asChild
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

// Kbd - simple styling, no variants needed
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-5 items-center",
        "rounded-sm px-1 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}
```

**When to skip patterns:**

- No variants needed → skip CVA
- Always same element → skip asChild
- No parent-child relationships → skip data-slot
- Static styling → skip state management

### Mobile-Specific Implementations

Some components need completely different mobile implementations:

```tsx
function Sidebar({ ...props }) {
  const { isMobile } = useSidebar();

  // Completely different rendering for mobile
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side={side}>{children}</SheetContent>
      </Sheet>
    );
  }

  // Desktop implementation
  return <div className="fixed inset-y-0">{children}</div>;
}
```

**When to split implementations:**

- Different interaction patterns (slide-out vs fixed)
- Different layout requirements
- Different a11y considerations
- Performance optimizations

### Performance Optimizations

**Memoize expensive computations:**

```tsx
function FieldError({ errors, ...props }) {
  // Memoize error formatting
  const content = useMemo(() => {
    if (!errors) return null;

    if (errors.length === 1) return errors[0]?.message;

    return (
      <ul>
        {errors.map((error, index) => (
          <li key={index}>{error.message}</li>
        ))}
      </ul>
    );
  }, [errors]);

  return content ? <div>{content}</div> : null;
}
```

**Memoize context values:**

```tsx
function SidebarProvider({ children, ...props }) {
  const contextValue = useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      toggleSidebar,
      isMobile,
    }),
    [state, open, setOpen, toggleSidebar, isMobile],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}
```

### Skeleton States

Provide loading states for async components:

```tsx
function SidebarMenuSkeleton({ showIcon = false, ...props }) {
  // Random width for natural look
  const width = useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div className="flex items-center gap-2 px-2" {...props}>
      {showIcon && <Skeleton className="size-4 rounded-md" />}
      <Skeleton
        className="h-4 flex-1"
        style={{ "--skeleton-width": width } as React.CSSProperties}
      />
    </div>
  );
}

// Usage
{
  isLoading ? (
    <>
      <SidebarMenuSkeleton showIcon />
      <SidebarMenuSkeleton showIcon />
      <SidebarMenuSkeleton showIcon />
    </>
  ) : (
    items.map((item) => (
      <SidebarMenuItem key={item.id}>{item.name}</SidebarMenuItem>
    ))
  );
}
```

### When to Use Radix Primitives

Use Radix UI primitives for complex interactive components:

```tsx
// ✅ Use Radix for complex interactions
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

// Wrap Radix primitives with styling and data-slot
function DropdownMenuItem({ className, variant, inset, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-variant={variant}
      data-inset={inset}
      className={cn(
        "focus:bg-accent relative flex items-center gap-2",
        "data-[variant=destructive]:text-destructive",
        "data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

// ❌ Don't use Radix for simple components
// Input, Button, Kbd don't need Radix
```

---

## Quick Reference Checklist

When creating a new reusable component, ensure you:

### Required

- ✅ Function component with named export
- ✅ TypeScript with `React.ComponentProps<"element">` or Radix primitive
- ✅ `data-slot="component-name"` attribute
- ✅ `cn()` for className merging with user `className` prop last
- ✅ `{...props}` spread for remaining props
- ✅ Proper semantic HTML element or ARIA role

### Styling

- ✅ Follow Tailwind class organization hierarchy
- ✅ `outline-none` with `focus-visible:ring-[3px]` for focus states
- ✅ ARIA state styling (`aria-invalid`, `aria-disabled`)
- ✅ Dark mode variants when applicable
- ✅ SVG handling: `[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`

### Variants (if applicable)

- ✅ Use CVA with `cva()` and `VariantProps`
- ✅ Define `defaultVariants`
- ✅ Export variants if needed for composition

### Composition (if applicable)

- ✅ `asChild` prop for polymorphism when appropriate
- ✅ Named groups with `group/name` pattern
- ✅ `@container/name` for responsive internals
- ✅ Export all sub-components

### Accessibility

- ✅ Screen reader text with `sr-only` when needed
- ✅ Proper ARIA attributes
- ✅ Keyboard navigation support
- ✅ Focus management

### Advanced (when needed)

- ✅ Context + custom hook for state management
- ✅ Controlled/uncontrolled pattern support
- ✅ State persistence to cookies if needed
- ✅ Mobile-specific implementation if required
- ✅ Loading skeleton state
- ✅ Memoize expensive computations

---

## Example: Creating a New Component

Here's a complete example following all patterns:

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 1. Define variants with CVA
const cardVariants = cva(
  // Base classes
  "group/card rounded-lg border bg-card text-card-foreground shadow-sm transition-all outline-none",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "border-transparent shadow-md",
        ghost: "border-transparent shadow-none",
      },
      interactive: {
        true: [
          "cursor-pointer",
          "hover:shadow-md hover:border-primary/20",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
          "active:scale-[0.98]",
        ],
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
)

// 2. Root component with asChild support
function Card({
  className,
  variant,
  interactive,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="card"
      data-variant={variant}
      tabIndex={interactive ? 0 : undefined}
      className={cn(cardVariants({ variant, interactive }), className)}
      {...props}
    />
  )
}

// 3. Sub-components following naming pattern
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        "text-sm text-muted-foreground",
        "[&>a]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-2 p-6 pt-0", className)}
      {...props}
    />
  )
}

// 4. Export everything
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
}

// 5. Usage examples
// Basic card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Interactive card as a link
<Card asChild interactive variant="elevated">
  <a href="/dashboard">
    <CardHeader>
      <CardTitle>Dashboard</CardTitle>
      <CardDescription>View your analytics</CardDescription>
    </CardHeader>
  </a>
</Card>
```

---

## Conclusion

These guidelines represent the distilled patterns from shadcn/ui v4 components. Following them ensures:

- **Consistency**: Predictable API across all components
- **Composability**: Easy to combine components in flexible ways
- **Type Safety**: Full TypeScript support with proper inference
- **Accessibility**: WCAG-compliant interactive components
- **Performance**: Optimized rendering and minimal re-renders
- **Developer Experience**: Intuitive APIs with helpful error messages
- **Maintainability**: Clear patterns make code easy to understand and modify

Remember: These are guidelines, not rigid rules. Break them when you have a good reason, but always document why.
