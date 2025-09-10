import { z } from "zod";
import { ConnectUrlResponseSchema, type ConnectUrlResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getConnectUrl = async (): Promise<ConnectUrlResponse> => {
  const response = await fetch(`${API_BASE_URL}/bluesky/url-connect`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Validation avec Zod
  try {
    return ConnectUrlResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Réponse invalide de l'API: ${error.issues.map((issue) => issue.message).join(", ")}`,
      );
    }
    throw error;
  }
};
