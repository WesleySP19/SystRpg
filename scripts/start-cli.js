import { spawn, execSync } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  fgGold: "\x1b[33m",
  fgCyan: "\x1b[36m",
  fgGreen: "\x1b[32m",
  fgRed: "\x1b[31m"
};

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[0f');
}

function printHeader() {
  console.log(colors.fgGold + colors.bright);
  console.log(`
  ================================================================
     _____  ___  ___  ___  ____    _  _  _  ____  _____ 
    (_   _)/ _ \\(  \\/  )( ___)  / )( \\/ )(  _ \\(  _  )
      )( ( (_) ))    (  )__)   \\ \\/ /\\ \\/ / )___/ )(_)( 
     (__) \\___/(_/\\/\\_)(____)   \\__/  \\__/ (__)  (_____)
     
  ================================================================
  ` + colors.reset);
  console.log(colors.fgCyan + "          Mesa Psigologos V23.0.0 (Obsidian) - The Atomic Engine\n" + colors.reset);
}

function runViteBuild() {
  console.log(colors.fgCyan + "[INFO]" + colors.reset + " Compilando nova interface com Vite...");
  try {
    const viteBin = path.join(ROOT_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
    if (fs.existsSync(viteBin)) {
      execSync(`"${process.execPath}" "${viteBin}" build`, { cwd: ROOT_DIR, stdio: 'inherit' });
    } else {
      execSync('npm run build', { cwd: ROOT_DIR, stdio: 'inherit' });
    }
  } catch (e) {
    console.log(colors.fgRed + "[!] Aviso: Falha ao rodar o build do Vite." + colors.reset);
  }
}

function checkDependencies() {
  console.log(colors.fgCyan + "[INFO]" + colors.reset + " Verificando dependências...");
  if (!fs.existsSync(path.join(ROOT_DIR, 'node_modules'))) {
    console.log(colors.fgGold + "[!] node_modules não encontrado. Tentando instalar dependências..." + colors.reset);
    try {
      execSync('npm install', { cwd: ROOT_DIR, stdio: 'inherit' });
    } catch (e) {
      console.log(colors.fgRed + "[!] Falha ao instalar dependências. Prosseguindo em modo offline/nativo." + colors.reset);
    }
  }
  
  if (!fs.existsSync(path.join(ROOT_DIR, '.env'))) {
    if (fs.existsSync(path.join(ROOT_DIR, '.env.example'))) {
      fs.copyFileSync(path.join(ROOT_DIR, '.env.example'), path.join(ROOT_DIR, '.env'));
      console.log(colors.fgGreen + "[OK] Arquivo .env criado a partir do exemplo." + colors.reset);
    }
  }

  if (fs.existsSync(path.join(ROOT_DIR, 'prisma', 'schema.prisma'))) {
    if (!fs.existsSync(path.join(ROOT_DIR, 'node_modules', '.prisma', 'client'))) {
      console.log(colors.fgGold + "[!] Prisma Client não encontrado. Configurando Banco de Dados..." + colors.reset);
      try {
        execSync('npx prisma db push --accept-data-loss', { cwd: ROOT_DIR, stdio: 'inherit' });
        execSync('npx prisma generate', { cwd: ROOT_DIR, stdio: 'inherit' });
      } catch (e) {
        console.log(colors.fgRed + "[!] Falha ao compilar Prisma. O sistema usará o banco de dados local em arquivo (Zero-Config)." + colors.reset);
      }
    }
  }

  // Removido o build automático daqui para acelerar a inicialização!
  
  console.log(colors.fgGreen + "[OK] Dependências prontas!\n" + colors.reset);
}

function openBrowser(url) {
  const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  spawn(startCmd, [url], { shell: true });
}

function startServer(mode) {
  console.log(colors.fgGreen + "\nInvocando o Servidor Arcano Node.js..." + colors.reset);
  
  const server = spawn(process.execPath, ['--expose-gc', '--max-old-space-size=4096', 'server.js'], { cwd: ROOT_DIR, stdio: 'inherit' });

  // Dá um pequeno tempo para o servidor iniciar antes de abrir abas
  setTimeout(() => {
    const baseUrl = 'http://localhost:4000';
    if (mode === 'master') {
      console.log(colors.fgGold + "Iniciando Frequência do Mestre..." + colors.reset);
      openBrowser(`${baseUrl}/`);
      openBrowser(`${baseUrl}/jogador/`);
    } else if (mode === 'server') {
      console.log(colors.fgCyan + "Servidor rodando silenciosamente na Lan (Headless)." + colors.reset);
    }
    console.log(colors.bright + `\nAcesso estabelecido em: ${baseUrl}` + colors.reset);
    console.log(colors.fgRed + "Pressione Ctrl+C para romper a conexão." + colors.reset);
  }, 2000);
}

async function main() {
  clearScreen();
  printHeader();
  
  try {
    checkDependencies();
  } catch (error) {
    console.error(colors.fgRed + "[ERRO] Falha ao configurar ambiente." + colors.reset, error);
    // Continue anyway to try running the server offline
  }

  const args = process.argv.slice(2);
  const isSilent = args.includes('--silent');

  if (isSilent) {
    console.log(colors.fgCyan + "[MODO SILENCIOSO] Iniciando servidor automaticamente..." + colors.reset);
    startServer('master');
    return;
  }

  console.log("Escolha seu Caminho de Iniciação:");
  console.log(colors.fgGold + "  1." + colors.reset + " Modo Completo (Servidor + Janelas do Mestre e Jogador)");
  console.log(colors.fgCyan + "  2." + colors.reset + " Modo Headless (Apenas Servidor em Background)");
  console.log(colors.fgGreen + "  3." + colors.reset + " Recompilar Interface (Rodar Build do Vite)\n");

  rl.question('Opção [1-3]: ', (answer) => {
    rl.close();
    switch(answer.trim()) {
      case '1':
        startServer('master');
        break;
      case '2':
        startServer('server');
        break;
      case '3':
        runViteBuild();
        console.log(colors.fgGreen + "\nBuild concluído! Reinicie o CLI para iniciar o servidor." + colors.reset);
        process.exit(0);
        break;
      default:
        console.log(colors.fgRed + "Escolha inválida." + colors.reset);
        main(); // Restart menu
    }
  });
}

main();
