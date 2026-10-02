// js/neon-config.js
import { neon } from "https://esm.sh/@neondatabase/serverless";

// Cadena de conexión a Neon Database del proyecto
const CADENA_CONEXION = "postgresql://neondb_owner:npg_N0uDwB6pJCHR@ep-lingering-recipe-b4lr6pyc-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

export const sql = neon(CADENA_CONEXION);