import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dwtnixncpfakceqyyezq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dG5peG5jcGZha2NlcXl5ZXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NjU5NzYsImV4cCI6MjA5MjE0MTk3Nn0.b1uIlKXMfvgRWNmfX885zUu7OBEvlzLNzkVV6euq4Jg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
