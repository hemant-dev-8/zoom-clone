const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const PORTS = [3000, 3001, 3002, 3003, 3004, 3005];

async function killPort(port) {
    try {
        console.log(`🔍 Checking port ${port}...`);

        if (process.platform === 'win32') {
            // Windows
            const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
            const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));

            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0') {
                    console.log(`  ⚡ Killing process ${pid} on port ${port}`);
                    await execAsync(`taskkill /F /PID ${pid}`).catch(() => { });
                }
            }
        } else {
            // Linux/Mac
            await execAsync(`lsof -ti:${port} | xargs kill -9`).catch(() => { });
            console.log(`  ✅ Port ${port} cleaned`);
        }
    } catch (error) {
        // Port not in use, that's fine
        console.log(`  ✅ Port ${port} is free`);
    }
}

async function cleanAllPorts() {
    console.log('🧹 Cleaning all ports...\n');

    for (const port of PORTS) {
        await killPort(port);
    }

    console.log('\n✨ All ports cleaned!\n');
}

async function startServices() {
    console.log('🚀 Starting all services with Turbo...\n');

    const child = exec('pnpm run dev', {
        stdio: 'inherit',
        shell: true
    });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('exit', (code) => {
        process.exit(code);
    });
}

async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('   🎬 Zoom Clone - Starting All Services');
    console.log('═══════════════════════════════════════════════════\n');

    await cleanAllPorts();
    await startServices();
}

main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
