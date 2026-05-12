const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRole)

async function createSuperAdmin() {
  const email = 'admin@synapse.com'
  const password = 'SuperSecretPassword123!'

  console.log(`Creating super admin: ${email}...`)

  // 1. Create the user in auth.users
  const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { full_name: 'Synapse Owner' },
    app_metadata: { role: 'super_admin' }
  })

  if (createError) {
    if (createError.message.includes('already exists')) {
      console.log('User already exists! Resetting password and promoting to super_admin...')
      const { data } = await supabase.auth.admin.listUsers()
      const target = data.users.find(u => u.email === email)
      
      await supabase.auth.admin.updateUserById(target.id, {
        password: password,
        app_metadata: { role: 'super_admin' }
      })
      await supabase.from('users').update({ role: 'super_admin' }).eq('id', target.id)
      console.log('✅ Updated existing admin@synapse.com account.')
      return
    }
    console.error('Error creating user:', createError.message)
    process.exit(1)
  }

  // 2. Add them to public.users table as super_admin
  await supabase.from('users').update({ role: 'super_admin' }).eq('id', user.id)

  console.log(`✅ Success! Super Admin created.`)
}

createSuperAdmin()
