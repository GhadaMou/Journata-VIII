import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jkribtpperjekmsmmtoi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcmlidHBwZXJqZWttc21tdG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMTI1NTIsImV4cCI6MjA1Nzc4ODU1Mn0.tGUO3LaPoGEOtvt4lJ_tCKO1f4pYvbi2hHqXRW3bgvg";

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
