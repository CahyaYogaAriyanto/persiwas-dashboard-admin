    // src/supabaseClient.js
    import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = 'https://cidfgvmspvcklrnidnxk.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZGZndm1zcHZja2xybmlkbnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MTcxNzgsImV4cCI6MjA2NDI5MzE3OH0.Ce4pejkWZx2RBLmUSPjHu9FgWMX0fRR7pEOdB5YcWrY';

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);