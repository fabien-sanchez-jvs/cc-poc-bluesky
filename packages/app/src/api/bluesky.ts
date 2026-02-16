import { z } from "zod";
import { LoginResponseSchema, type LoginRequest, type LoginResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const login = async (
  handlePass: LoginRequest,
): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/bluesky/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      handle: handlePass.handle,
      password: handlePass.password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Validation avec Zod
  try {
    return LoginResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Réponse invalide de l'API: ${error.issues.map((issue) => issue.message).join(", ")}`,
      );
    }
    throw error;
  }
};
