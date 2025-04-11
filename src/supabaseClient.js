import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ticghrxzdsdoaiwvahht.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpY2docnh6ZHNkb2Fpd3ZhaGh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMjYwNTQsImV4cCI6MjA1NTgwMjA1NH0.XoRX3JBDMhLGYCs_7olFeH-PzGhyyNid-J2B8KpxCU8"

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
