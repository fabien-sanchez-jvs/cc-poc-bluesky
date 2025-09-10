import z from "zod";

// Schéma de validation pour la réponse de getConnectUrl
export const ConnectUrlResponseSchema = z.object({
  url: z.string().url("L'URL de connexion doit être valide"),
  state: z.string().optional(),
  challenge: z.string().optional(),
});

export type ConnectUrlResponse = z.infer<typeof ConnectUrlResponseSchema>;
