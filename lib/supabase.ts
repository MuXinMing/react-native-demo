import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ilgrwhumilbxrflkcnht.supabase.co"
const supabasePublishableKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZ3J3aHVtaWxieHJmbGtjbmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDExMTYsImV4cCI6MjA3MzU3NzExNn0.fnllHZVZX6at-a6uTjQ82xse1KMy3cFm88jeyUQdfVk"

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})