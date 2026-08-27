import os
import shutil
import re
import time

def get_project_root():
    return os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def minify_js(content):
    # Remove blocos de comentarios /* */
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    # Remove comentarios de linha // (cuidado com URLs como http://)
    # Esta regex rudimentar foca apenas em linhas exclusivas de comentários para evitar quebrar regexes
    content = re.sub(r'^\s*//.*$', '', content, flags=re.MULTILINE)
    # Remove múltiplas linhas em branco
    content = re.sub(r'\n\s*\n', '\n', content)
    # Remove espaços iniciais e finais
    content = '\n'.join([line.strip() for line in content.split('\n') if line.strip()])
    return content

def minify_css(content):
    # Remove comentarios
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    # Remove espaços e quebras
    content = re.sub(r'\s+', ' ', content)
    return content

def main():
    print("🚀 Iniciando Build Otimizado (Minificador Python)")
    
    root_dir = get_project_root()
    dist_dir = os.path.join(root_dir, 'dist')
    
    # 1. Limpar diretório dist
    if os.path.exists(dist_dir):
        print(f"🗑️ Limpando diretório dist: {dist_dir}")
        shutil.rmtree(dist_dir)
    
    # 2. Copiar estrutura básica
    dirs_to_copy = ['ui', 'core', 'services', 'utils', 'engine', 'packages', 'public', 'assets', 'api']
    files_to_copy = ['index.html', 'transmissao.html', 'jogador.html', 'player-view.html', 'style.css', 'main.js', 'manifest.json', 'service-worker.js']
    
    print(f"📁 Copiando arquivos base para {dist_dir}")
    os.makedirs(dist_dir, exist_ok=True)
    
    for d in dirs_to_copy:
        src = os.path.join(root_dir, d)
        dst = os.path.join(dist_dir, d)
        if os.path.exists(src):
            shutil.copytree(src, dst)
            
    for f in files_to_copy:
        src = os.path.join(root_dir, f)
        dst = os.path.join(dist_dir, f)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            
    # 3. Minificação de JS, JSX e CSS na pasta dist
    print("🛠️ Minificando arquivos Javascript, JSX e CSS...")
    
    minify_count = 0
    total_original_size = 0
    total_minified_size = 0
    
    for foldername, subfolders, filenames in os.walk(dist_dir):
        for filename in filenames:
            file_path = os.path.join(foldername, filename)
            ext = os.path.splitext(filename)[1].lower()
            
            if ext in ['.js', '.jsx', '.css']:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    original_size = len(content)
                    total_original_size += original_size
                    
                    if ext in ['.js', '.jsx']:
                        minified = minify_js(content)
                    else:
                        minified = minify_css(content)
                        
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(minified)
                        
                    minified_size = len(minified)
                    total_minified_size += minified_size
                    minify_count += 1
                except Exception as e:
                    print(f"⚠️ Aviso: Erro ao minificar {file_path}: {str(e)}")

    print(f"✅ Sucesso! {minify_count} arquivos minificados.")
    print(f"📊 Tamanho Original: {total_original_size / 1024:.2f} KB")
    print(f"📊 Tamanho Final: {total_minified_size / 1024:.2f} KB")
    print(f"📉 Redução: {100 - (total_minified_size / total_original_size * 100):.2f}%")
    print(f"\n📂 A pasta de produção está pronta em: {dist_dir}")
    print("⚠️ Dica: Aponte seu servidor estático para a pasta /dist para rodar a versão de produção.")

if __name__ == "__main__":
    start = time.time()
    main()
    print(f"⏱️ Tempo total de Build: {time.time() - start:.2f}s")
