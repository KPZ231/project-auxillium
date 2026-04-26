import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Imię i nazwisko musi mieć co najmniej 2 znaki")
    .max(80, "Imię i nazwisko może mieć maksymalnie 80 znaków")
    .regex(/^[a-zA-ZąęćłńóśźżĄĘĆŁŃÓŚŹŻ\s-]+$/, "Imię i nazwisko zawiera niepoprawne znaki"),
  email: z
    .string()
    .email("Proszę podać poprawny adres e-mail"),
  message: z
    .string()
    .min(10, "Wiadomość musi mieć co najmniej 10 znaków")
    .max(2000, "Wiadomość może mieć maksymalnie 2000 znaków"),
  website: z.string().optional(), // Honeypot
});

export type ContactFormData = z.infer<typeof contactSchema>;
