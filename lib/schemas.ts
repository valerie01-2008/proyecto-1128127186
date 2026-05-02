import { z } from "zod";

export const AuthRegisterSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("El correo debe tener un formato válido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/(?=.*[a-z])/, "La contraseña debe contener al menos una letra minúscula")
    .regex(/(?=.*[A-Z])/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/(?=.*\d)/, "La contraseña debe contener al menos un número"),
  timezone: z.string().min(3, "La zona horaria es obligatoria"),
});

export const AuthLoginSchema = z.object({
  email: z.string().email("El correo debe tener un formato válido"),
  password: z.string().min(8, "La contraseña es obligatoria"),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8, "La contraseña actual es obligatoria"),
  newPassword: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/(?=.*[a-z])/, "La contraseña debe contener al menos una letra minúscula")
    .regex(/(?=.*[A-Z])/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/(?=.*\d)/, "La contraseña debe contener al menos un número"),
});

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  email: z.string().optional(),
  error: z.string().optional(),
});
