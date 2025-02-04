import axios from "axios";
import { UsersSchema } from "@/schemas";
import type { User } from "@/schemas";

export const api = axios.create({
  baseURL: "https://your-api-url.com",
  timeout: 5000,
});

// Centralized API function
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");

  // Validate API response here
  const parsedUsers = UsersSchema.safeParse(response.data);
  if (!parsedUsers.success) {
    console.error("Invalid user data received:", parsedUsers.error);
    throw new Error("Invalid user data from API");
  }

  return parsedUsers.data;
};
