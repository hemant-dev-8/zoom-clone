const { spawn } = require('child_process');
const { execSync } = require('child_process');
const path = require('path');

const services = [
    {
        name: 'auth-service',
        port: 3001,
        filter: 'auth-service',
        envVar: 'AUTH_SERVICE_PORT'
    },
    {
        name: 'meeting-service',
        port: 3002,
        filter: 'meeting-service',
        envVar: 'MEETING_SERVICE_PORT'
    },
    {
        name: 'signaling-service',
        port: 3003,
        filter: 'signaling-service',
        envVar: 'SIGNALING_SERVICE_PORT'
    },
    {
        name: 'media-sfu',
        port: 3004,
        filter: 'media-sfu',
        envVar: 'MEDIA_SFU_PORT'
    },
    {
        name: 'recording-service',
        port: 3005,
        filter: 'recording-service',
        envVar: 'RECORDING_SERVICE_PORT'
    },
    {
        name: 'frontend',
        port: 3000,
        filter: 'frontend',
        envVar: 'FRONTEND_PORT'
    }
];

async function killPort(port) {
    try {
        if (process.platform === 'win32') {
            execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' });
            const { stdout } = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
            const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0') {
                    try {
                        execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
                    } catch (e) {
                        // Process might already be dead
                    }
                }
            }
        } else {
            execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'pipe' });
        }
    } catch (error) {
        // Port might not be in use, that's fine
    }
}

async function installDependencies() {
    console.log('📦 Installing dependencies...\n');
    try {
        const cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
        execSync(`${cmd} install`, { stdio: 'inherit' });
        console.log('\n✨ Dependencies installed!\n');
    } catch (error) {
        console.error('❌ Failed to install dependencies:', error.message);
        process.exit(1);
    }
}

async function cleanAllPorts() {
    console.log('🧹 Cleaning all service ports...\n');
    for (const service of services) {
        console.log(`  Cleaning port ${service.port} (${service.name})...`);
        await killPort(service.port);
    }
    console.log('\n✨ All ports cleaned!\n');
}

function startService(service) {
    return new Promise((resolve, reject) => {
        console.log(`🚀 Starting ${service.name} on port ${service.port}...`);

        const env = {
            ...process.env,
            [service.envVar]: service.port,
            PORT: service.port
        };

        const cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
        const child = spawn(cmd, ['--filter', service.filter, 'run', 'dev'], {
            cwd: path.resolve('.'),
            env: env,
            shell: true,
            stdio: 'inherit'
        });

        child.on('error', (error) => {
            console.error(`❌ Failed to start ${service.name}:`, error);
            reject(error);
        });

        child.on('exit', (code) => {
            if (code !== 0) {
                console.error(`❌ ${service.name} exited with code ${code}`);
                reject(new Error(`${service.name} failed`));
            }
        });

        resolve(child);
    });
}

async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('   🎬 Zoom Clone - Starting All Services');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('Services to start:');
    services.forEach(s => {
        console.log(`  • ${s.name.padEnd(20)} → Port ${s.port}`);
    });
    console.log('');

    await installDependencies();
    await cleanAllPorts();

    try {
        console.log('🎬 Starting all services...\n');
        const processes = [];

        for (const service of services) {
            try {
                const child = await startService(service);
                processes.push(child);
                // Small delay between starting services
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Failed to start ${service.name}`);
            }
        }

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n\n🛑 Shutting down all services...');
            processes.forEach(p => p.kill());
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\n\n🛑 Shutting down all services...');
            processes.forEach(p => p.kill());
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
