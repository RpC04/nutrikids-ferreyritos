#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🔧 Setup Inicial de NutriKids Admin\n');

  // Check for .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Archivo .env.local no encontrado. Por favor configura las variables de entorno primero.');
    process.exit(1);
  }

  // Load env variables
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = envVars.ADMIN_EMAIL;

  if (!supabaseUrl || !serviceRoleKey || !adminEmail) {
    console.error('❌ Variables de entorno incompletas. Verifica .env.local');
    process.exit(1);
  }

  console.log(`📧 Email del admin: ${adminEmail}\n`);

  const password = await question('🔐 Ingresa contraseña para el admin: ');
  const confirmPassword = await question('🔐 Confirma la contraseña: ');

  if (password !== confirmPassword) {
    console.error('❌ Las contraseñas no coinciden');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('❌ La contraseña debe tener al menos 6 caracteres');
    process.exit(1);
  }

  try {
    console.log('\n⏳ Inicializando base de datos...\n');

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert admin user
    const { error } = await supabase
      .from('admin_users')
      .insert([
        {
          email: adminEmail,
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      if (error.message.includes('duplicate')) {
        console.log('⚠️  El usuario admin ya existe. Contraseña actualizada.');
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ password_hash: hashedPassword })
          .eq('email', adminEmail);

        if (updateError) throw updateError;
      } else {
        throw error;
      }
    }

    console.log('✅ Admin configurado correctamente\n');
    console.log('📋 Próximos pasos:');
    console.log('   1. Inicia el servidor: pnpm dev');
    console.log(`   2. Accede a http://localhost:3000/admin/login`);
    console.log(`   3. Inicia sesión con: ${adminEmail}`);
    console.log('   4. ¡Comienza a agregar contenido!\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
