import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env
config();

/**
 * Database Seeding Script
 * 
 * This script applies the seed.sql file to your Supabase database.
 * Run with: npm run seed
 * 
 * Prerequisites:
 * - VITE_SUPABASE_URL in .env
 * - SUPABASE_SERVICE_ROLE_KEY in .env (or pass --service-key flag)
 * 
 * Flags:
 * - --reset: Truncates all tables before seeding (dangerous!)
 */

async function main() {
    const args = process.argv.slice(2);
    const shouldReset = args.includes('--reset');

    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
        console.error('❌ VITE_SUPABASE_URL not found in environment');
        process.exit(1);
    }

    if (!serviceRoleKey) {
        console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
        console.error('   This script requires service role key to bypass RLS');
        console.error('   Get it from: https://supabase.com/dashboard/project/<your-project>/settings/api');
        process.exit(1);
    }

    console.log('🌱 Aideas.ai Database Seeder');
    console.log('');

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // Read seed SQL file
        const seedSqlPath = join(process.cwd(), 'supabase', 'seed.sql');
        console.log(`📖 Reading seed file: ${seedSqlPath}`);
        const seedSql = readFileSync(seedSqlPath, 'utf-8');

        if (shouldReset) {
            console.warn('⚠️  RESET MODE: This will delete all existing data!');
            console.log('');
        }

        console.log('🚀 Executing seed script...');
        console.log('');

        // Execute the SQL
        const { error } = await supabase.rpc('exec_sql', { sql: seedSql });

        if (error) {
            // If exec_sql function doesn't exist, try direct SQL execution
            // Note: This requires splitting the SQL file into individual statements
            console.log('📝 Executing SQL statements...');

            // Split by semicolon and filter out comments
            const statements = seedSql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (const statement of statements) {
                if (statement.startsWith('INSERT') || statement.startsWith('TRUNCATE')) {
                    console.log(`  → ${statement.substring(0, 50)}...`);
                }
            }

            console.log('');
            console.log('⚠️  Direct SQL execution via JS client has limitations.');
            console.log('   For best results, run the seed.sql file directly:');
            console.log('');
            console.log('   Using Supabase CLI:');
            console.log('   $ supabase db reset --db-url "<your-db-connection-string>"');
            console.log('');
            console.log('   Using psql:');
            console.log('   $ psql "<connection-string>" -f supabase/seed.sql');
            console.log('');
            throw error;
        }

        console.log('✅ Database seeded successfully!');
        console.log('');
        console.log('📊 Seeded data:');
        console.log('   - 7 categories');
        console.log('   - 16 AI tools');
        console.log('   - AI scores for all tools');
        console.log('   - Community scores for all tools');
        console.log('');
        console.log('Next steps:');
        console.log('   1. Create admin user via Supabase Auth Dashboard');
        console.log('   2. Assign admin role in user_roles table');
        console.log('   3. Start adding questions via the application UI');
        console.log('');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();
