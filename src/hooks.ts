import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { UsersSchema, type User } from "@/schemas";

export const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return UsersSchema.parse(response.data);
};

const transformUsers = (users: User[]): User[] =>
  users.map((user) => ({ ...user, isAdmin: user.role === "admin" }));

export const useUsersQuery = (options?: UseQueryOptions<User[], Error>) =>
  useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: fetchUsers,
    select: transformUsers,
    ...options,
  });
