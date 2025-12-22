import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dns from 'dns';
import { URL } from 'url';

export async function getDatabaseConfig(): Promise<TypeOrmModuleOptions> {
    let connectionString = process.env.DB_CONNECTION_STRING || process.env.DATABASE_URL;

    // Cleanup
    if (connectionString) {
        connectionString = connectionString.trim().replace(/^['"]|['"]$/g, '');
    }

    if (!connectionString) {
        // Return default logic or empty if you want to fail later, but better to log
        console.warn("No DB_CONNECTION_STRING found. Using defaults which may fail.");
    }


    // IPv4 Check & Supabase Logic
    if (connectionString && (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://'))) {
        try {
            const url = new URL(connectionString);
            let host = url.hostname;
            const port = parseInt(url.port) || 5432;
            const isRender = process.env.RENDER === 'true';

            // Fix password brackets if present
            if (url.password.startsWith('[') && url.password.endsWith(']')) {
                url.password = url.password.slice(1, -1);
                connectionString = url.toString();
            }

            // Supabase Pooler Detection
            const isSupabaseDirect = host.includes('supabase.co') && port !== 6543;

            if (isRender && isSupabaseDirect) {
                console.log('--- Platform: Detected Render environment with Supabase direct connection. Checking pooler...');
                const supabaseRegion = process.env.SUPABASE_REGION?.trim();

                if (supabaseRegion) {
                    // Auto-fix
                    const projectRef = host.split('.')[0] === 'db' ? host.split('.')[1] : null;
                    if (projectRef && url.username === 'postgres') {
                        url.username = `postgres.${projectRef}`;
                    }

                    url.hostname = `aws-0-${supabaseRegion}.pooler.supabase.com`;
                    url.port = '6543';
                    // TypeORM/pg usually handles params in connection string, or we pass extra
                    // For pooler we need: pooling=true (default in pg usually), no prepared statements

                    connectionString = url.toString();
                    console.log(`--- Config: Switched to Supabase Pooler: ${url.hostname}`);
                } else {
                    throw new Error("FATAL: Supabase Direct Connection on Render without SUPABASE_REGION.");
                }
            }

            // DNS Check (IPv4)
            try {
                // Re-parse host in case it changed
                host = new URL(connectionString).hostname;
                const addresses = await dns.promises.resolve(host); // Defaults to A records? No, resolve('hostname') returns ipv4/ipv6. 
                // resolve4 is explicit
                // dns.promises.lookup matches OS behavior (like ping)

                const lookupResult = await dns.promises.lookup(host, { family: 4 });
                if (lookupResult && lookupResult.address) {
                    console.log(`--- DNS: Resolved ${host} to IPv4: ${lookupResult.address}`);
                } else {
                    throw new Error("No IPv4 address found.");
                }
            } catch (e) {
                console.error(`--- DNS Warn: Could not resolve ${host} to IPv4. ${e.message}`);
                if (isRender) {
                    throw new Error(`FATAL: Host ${host} fails IPv4 resolution on Render.`);
                }
            }

        } catch (error) {
            console.error("Connection String parsing error:", error);
            throw error;
        }
    }

    // Handle Pooler "Mode=Transaction" -> disable prepared statements in Postgres
    // In TypeORM/pg, 'prepare: false' isn't a direct top-level option usually, 
    // but "native" pg driver supports 'binary: false' or similar. 
    // Actually, for pgbouncer transaction mode, we should just NOT use prepared statements.
    // pg-node usually defaults to prepared statements only if you use them. TypeORM does prepare statements?
    // TypeORM uses parameters. 
    // The 'pg' driver has 'noPrepare' option? No.
    // However, Npgsql's 'MaxAutoPrepare=0' is equivalent to not caching statements.
    // In pg/TypeORM, we generally are fine unless we explicitly use prepared statements.
    // But if errors occur, we can add 'extra: { statement_timeout: ... }' etc.
    // For now we assume standard TypeORM behavior works or we can set strict options.

    // NOTE: TypeORM doesn't natively support "disable prepared statements" globally easily like Npgsql.
    // But standard queries are usually fine.

    return {
        type: 'postgres',
        url: connectionString,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true, // Auto-migrate (equivalent to EF Core Migrate())
        autoLoadEntities: true,
        ssl: { rejectUnauthorized: false }, // Render/Supabase often need this
        extra: {
            // extra driver options
        }
    };
}
