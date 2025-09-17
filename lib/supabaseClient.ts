// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vxbliubgckhsxgvcecda.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4YmxpdWJnY2toc3hndmNlY2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzgxNjMsImV4cCI6MjA3MzUxNDE2M30.GobzDLXZQUrk2yOC58rR87r43roErw4OGiHs6xQuTQU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
