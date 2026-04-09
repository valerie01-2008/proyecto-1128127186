import fs from "fs";
import path from "path";
import { HomeDataSchema, AppConfigSchema } from "./validators";
import type { HomeData, AppConfig } from "./types";

/**
 * Lee un archivo JSON desde la carpeta /data y lo tipifica.
 * Solo ejecutable en el servidor (Server Components, API Routes).
 */
export function readJsonData<T>(relativePath: string): T {
  const fullPath = path.join(process.cwd(), "data", relativePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Archivo de datos no encontrado: ${relativePath}`);
  }

  const raw = fs.readFileSync(fullPath, "utf-8");

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Error al parsear JSON: ${relativePath}`);
  }
}

/**
 * Lee y valida los datos de la página Home desde home.json
 */
export function readHomeData(): HomeData {
  const data = readJsonData("home.json");
  return HomeDataSchema.parse(data);
}

/**
 * Lee y valida la configuración de la aplicación desde config.json
 */
export function readAppConfig(): AppConfig {
  const data = readJsonData("config.json");
  return AppConfigSchema.parse(data);
}