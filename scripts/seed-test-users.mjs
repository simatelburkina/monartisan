import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const USERS = [
  {
    email: "client.test@monartisan.dev",
    password: "Test1234!",
    role: "client",
    first_name: "Aïcha",
    last_name: "Client",
    phone: "+22670000001",
  },
  {
    email: "artisan.test@monartisan.dev",
    password: "Test1234!",
    role: "artisan",
    first_name: "Boureima",
    last_name: "Artisan",
    phone: "+22670000002",
    company_name: "Boureima Plomberie",
  },
  {
    email: "admin.test@monartisan.dev",
    password: "Test1234!",
    role: "admin",
    first_name: "Fatou",
    last_name: "Admin",
    phone: "+22670000003",
  },
];

for (const u of USERS) {
  const { data: existingList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = existingList?.users?.find((x) => x.email === u.email);

  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      password: u.password,
      email_confirm: true,
      user_metadata: {
        role: u.role,
        first_name: u.first_name,
        last_name: u.last_name,
        phone: u.phone,
        company_name: u.company_name,
      },
    });
    await supabase.from("profiles").update({ role: u.role }).eq("id", existing.id);
    console.log(`updated: ${u.email} (${u.role})`);
    continue;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: {
      role: u.role,
      first_name: u.first_name,
      last_name: u.last_name,
      phone: u.phone,
      company_name: u.company_name,
    },
  });

  if (error) {
    console.error(`failed: ${u.email}`, error.message);
    continue;
  }

  // Le trigger handle_new_user crée le profil avec le role des metadata,
  // mais 'admin' n'est atteignable que via ce script (pas d'inscription publique).
  await supabase.from("profiles").update({ role: u.role }).eq("id", data.user.id);
  console.log(`created: ${u.email} (${u.role})`);
}

console.log("\nDone.");
