
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Manually parse .env.local to avoid dependency issues
const envPath = path.resolve(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) env[key.trim()] = value.trim()
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing with URL:', supabaseUrl)
console.log('Testing with Key:', supabaseAnonKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
  const email = `test_node_${Date.now()}@example.com`
  const password = 'password123'
  
  console.log('Attempting signup for:', email)
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://agencyos.jtabasco.com/dashboard'
      }
    })

    if (error) {
      console.error('Signup error:', JSON.stringify(error, null, 2))
    } else {
      console.log('Signup success! User:', data.user?.email)
      console.log('Confirm email sent (or queued) for:', email)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testSignup()
