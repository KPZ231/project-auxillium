import { z } from "zod";

// Shared email validation
const emailSchema = z
  .string()
  .min(1, "E-mail jest wymagany")
  .email("Niepoprawny format adresu e-mail");

const usernameSchema = z
  .string()
  .min(1, "Nazwa użytkownika jest wymagana")
  .min(3, "Nazwa użytkownika musi mieć co najmniej 3 znaki")
  .max(30, "Nazwa użytkownika może mieć maksymalnie 30 znaków")
  .regex(
    /^[a-zA-Z0-9_.]+$/,
    "Nazwa użytkownika może zawierać tylko litery, cyfry, podkreślniki i kropki",
  );

// Shared password validation
const passwordSchema = z
  .string()
  .min(8, "Hasło musi mieć co najmniej 8 znaków")
  .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
  .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
  .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę");

export const loginSchema = z
  .object({
    email: emailSchema.optional(),
    username: usernameSchema.optional(),
    password: passwordSchema,
  })
  .refine((data) => data.email || data.username, {
    message: "E-mail lub nazwa użytkownika jest wymagana",
    path: ["email"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email("Niepoprawny format adresu e-mail"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .max(80, "Imię i nazwisko może mieć maksymalnie 80 znaków")
      .optional(),
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Imię i nazwisko musi mieć co najmniej 2 znaki")
    .max(80, "Imię i nazwisko może mieć maksymalnie 80 znaków")
    .regex(
      /^[a-zA-ZąęćłńóśźżĄĘĆŁŃÓŚŹŻ\s-]+$/,
      "Imię i nazwisko zawiera niepoprawne znaki",
    ),
  email: z.string().email("Proszę podać poprawny adres e-mail"),
  message: z
    .string()
    .min(10, "Wiadomość musi mieć co najmniej 10 znaków")
    .max(2000, "Wiadomość może mieć maksymalnie 2000 znaków"),
  website: z.string().optional(), // Honeypot
});

export type ContactFormData = z.infer<typeof contactSchema>;
