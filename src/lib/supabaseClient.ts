import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gyqrhyjmilcogdggdnal.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cXJoeWptaWxjb2dkZ2dkbmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MzM4ODksImV4cCI6MjA3NjMwOTg4OX0.E9_z2ER7idyKDIL1u_XmxvdssfFa5QTaQ9iMs0aRcSk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
