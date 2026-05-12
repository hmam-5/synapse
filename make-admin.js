const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './web/.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing Supabase URL or Service Role Key in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRole)

async function makeAdmin(email) {
  console.log(`Promoting ${email} to super_admin...`)

  // 1. Get user ID from auth.users via admin API
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
  if (userError) throw userError

  const targetUser = users.find(u => u.email === email)
  if (!targetUser) {
    console.error(`User with email ${email} not found. Please register on the website first!`)
    process.exit(1)
  }

  // 2. Update the custom claims in auth.users
  const { error: claimError } = await supabase.auth.admin.updateUserById(
    targetUser.id,
    { app_metadata: { role: 'super_admin' } }
  )
  if (claimError) throw claimError

  // 3. Update the role in the public.users table (if it exists)
  await supabase.from('users').update({ role: 'super_admin' }).eq('id', targetUser.id)

  console.log(`✅ Success! ${email} is now a super_admin.`)
}

const emailToPromote = process.argv[2]
if (!emailToPromote) {
  console.log('Usage: node make-admin.js <email>')
  process.exit(1)
}

makeAdmin(emailToPromote)
