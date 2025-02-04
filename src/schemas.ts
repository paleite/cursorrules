import { z } from "zod";

export const UserSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  role: z.enum(["admin", "user", "moderator"]),
});

export const UsersSchema = z.array(UserSchema);

// Export TypeScript types inferred from schemas
export type User = z.infer<typeof UserSchema>;
