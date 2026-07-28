# DOMÍNIO RPG VTT - Premium Server v10.0
# Agora com suporte a Persistência de Arquivos JSON
# Com suporte a porta dinâmica via variável de ambiente com fallback inteligente

param (
    [int]$Port = 0  # 0 = usar variável de ambiente ou fallback
)

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURAÇÃO DINÂMICA DE PORTA COM FALLBACK
# ─────────────────────────────────────────────────────────────────────────────

function Test-PortAvailable {
    param([int]$PortNumber)
    
    try {
        $ipGlobalProperties = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties()
        $tcpListeners = $ipGlobalProperties.GetActiveTcpListeners()
        $tcpConnections = $ipGlobalProperties.GetActiveTcpConnections()

        foreach ($listener in $tcpListeners) {
            if ($listener.Port -eq $PortNumber) { return $false }
        }
        foreach ($conn in $tcpConnections) {
            if ($conn.LocalEndPoint.Port -eq $PortNumber) { return $false }
        }
        return $true
    } catch {
        return $false
    }
}

function Get-AvailablePort {
    param([int]$PreferredPort)
    
    # Candidatos de fallback em ordem
    $portCandidates = @($PreferredPort, 8080, 8001)
    $portCandidates = $portCandidates | Select-Object -Unique  # Remove duplicatas
    
    foreach ($candidatePort in $portCandidates) {
        if ($candidatePort -gt 0 -and (Test-PortAvailable -PortNumber $candidatePort)) {
            return $candidatePort
        }
    }
    
    # Fallback extremo: procura porta aleatória entre 9001-9999
    for ($i = 0; $i -lt 100; $i++) {
        $randomPort = Get-Random -Minimum 9001 -Maximum 9999
        if (Test-PortAvailable -PortNumber $randomPort) {
            return $randomPort
        }
    }
    
    # Se nada funcionar, retorna a preferida
    return $PreferredPort
}

# Determina porta final: 1. Variável PORT > 2. Variável SERVER_PORT > 3. Parâmetro -Port > 4. Padrão 8000
$finalPort = 0
$tempPort = 0

$envPort = $env:PORT
if ([string]::IsNullOrWhiteSpace($envPort)) {
    $envPort = $env:SERVER_PORT
}

if (![string]::IsNullOrWhiteSpace($envPort) -and [int]::TryParse($envPort, [ref]$tempPort) -and $tempPort -ne 0) {
    $finalPort = $tempPort
    Write-Host "[CONFIG] Porta obtida da variavel de ambiente: $finalPort" -ForegroundColor Cyan
} elseif ($Port -ne 0) {
    $finalPort = $Port
    Write-Host "[CONFIG] Porta obtida do parametro: $finalPort" -ForegroundColor Cyan
} else {
    $finalPort = 8000
    Write-Host "[INFO] Nenhuma configuracao encontrada, usando padrao 8000" -ForegroundColor Yellow
}

# Encontra uma porta disponível com fallback automático
$discoveredPort = Get-AvailablePort -PreferredPort $finalPort

if ($discoveredPort -ne $finalPort) {
    Write-Host "[WARN] Porta $finalPort em uso, usando fallback: $discoveredPort" -ForegroundColor Yellow
}

$finalPort = $discoveredPort

# ⚡⚡ CRÍTICO: Define o diretório de trabalho como a pasta do script ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
# Sem isso, todos os caminhos relativos (data/, arquivos estáticos) ficam
# apontando para C:\Windows\System32 ou o perfil do usuário.
Set-Location $PSScriptRoot
Write-Host "Raiz do servidor: $PSScriptRoot" -ForegroundColor Cyan

$contentTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".vtt"  = "text/vtt"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$finalPort/")
$listener.Prefixes.Add("http://127.0.0.1:$finalPort/")

try {
    $listener.Start()
    Write-Host "--- DOMÍNIO RPG VTT ---" -ForegroundColor Yellow
    Write-Host "Servidor Ativo em: http://localhost:$finalPort" -ForegroundColor Green
    Write-Host "Pressione Ctrl+C para encerrar."

    # Criar pasta de dados se não existir
    if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" }

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $url = $request.Url.LocalPath
        if ($url -eq "/") { $url = "/index.html" }
        
        # --- ROTA DE CONFIGURAÇÃO (API) ---
        if ($request.HttpMethod -eq "GET" -and $url -eq "/api/config") {
            try {
                $sentryDsn = $env:SENTRY_DSN
                if ([string]::IsNullOrWhiteSpace($sentryDsn)) { $sentryDsn = $null }
                $resObject = @{
                    sentryDsn = $sentryDsn
                }
                $resJSON = $resObject | ConvertTo-Json -Compress
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($resJSON)
                $response.ContentType = "application/json"
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } catch {
                Write-Host "Erro ao carregar configuracoes: $($_.Exception.Message)" -ForegroundColor Red
                $response.StatusCode = 500
                try {
                    $errBuf = [System.Text.Encoding]::UTF8.GetBytes('{"status":"error"}')
                    $response.ContentType = "application/json"
                    $response.ContentLength64 = $errBuf.Length
                    $response.OutputStream.Write($errBuf, 0, $errBuf.Length)
                } catch {}
            }
            $response.Close()
            continue
        }

        # --- ROTA DE SALVAMENTO (API) ---
        if ($request.HttpMethod -eq "POST" -and $url -eq "/api/save") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream)
                $body = $reader.ReadToEnd()

                $postData = $body | ConvertFrom-Json
                $rawName = "$($postData.filename)"
                if ([string]::IsNullOrWhiteSpace($rawName)) { $rawName = 'state.json' }
                # Sanitiza: pega apenas o nome de arquivo (sem caminhos), permite [a-zA-Z0-9_.-], extensao .json
                $safeName = [System.IO.Path]::GetFileName($rawName)
                $safeName = ($safeName -replace '[^a-zA-Z0-9_.\-]', '')
                if (-not $safeName.ToLower().EndsWith('.json')) { $safeName = "$safeName.json" }
                if ([string]::IsNullOrWhiteSpace($safeName) -or $safeName -eq '.json') { $safeName = 'state.json' }

                $filePath = Join-Path "data" $safeName
                $postData.data | ConvertTo-Json -Depth 100 | Set-Content -Path $filePath -Encoding UTF8

                $buffer = [System.Text.Encoding]::UTF8.GetBytes('{"status":"success"}')
                $response.ContentType = "application/json"
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } catch {
                Write-Host "Erro ao salvar: $($_.Exception.Message)" -ForegroundColor Red
                $response.StatusCode = 500
                try {
                    $errBuf = [System.Text.Encoding]::UTF8.GetBytes('{"status":"error"}')
                    $response.ContentType = "application/json"
                    $response.ContentLength64 = $errBuf.Length
                    $response.OutputStream.Write($errBuf, 0, $errBuf.Length)
                } catch {}
            }
            $response.Close()
            continue
        }

        # --- ROTA DE UPLOAD DE ARQUIVOS (API) ---
        if ($request.HttpMethod -eq "POST" -and $url -eq "/api/upload") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream)
                $body = $reader.ReadToEnd()

                $postData = $body | ConvertFrom-Json
                $rawName = "$($postData.filename)"
                if ([string]::IsNullOrWhiteSpace($rawName)) { 
                    $rawName = "upload_$((Get-Date).Ticks).png" 
                }
                
                # Sanitiza nome do arquivo
                $safeName = [System.IO.Path]::GetFileName($rawName)
                $safeName = ($safeName -replace '[^a-zA-Z0-9_.\-]', '')
                
                # Garante que a pasta public/uploads existe
                $uploadDir = Join-Path "public" "uploads"
                if (-not (Test-Path $uploadDir)) { 
                    New-Item -ItemType Directory -Path $uploadDir | Out-Null
                }

                $base64 = $postData.base64
                # Remove o prefixo data:image/... se existir
                if ($base64 -match '^data:image\/[a-zA-Z+.-]+;base64,') {
                    $base64 = $base64 -replace '^data:image\/[a-zA-Z+.-]+;base64,', ''
                }

                # Decodifica e salva em disco
                $bytes = [System.Convert]::FromBase64String($base64)
                $filePath = Join-Path $uploadDir $safeName
                [System.IO.File]::WriteAllBytes($filePath, $bytes)

                # Retorna a URL relativa do arquivo salvo
                $urlPath = "/public/uploads/$safeName"
                $resObject = @{
                    status = "success"
                    url = $urlPath
                }
                $resJSON = $resObject | ConvertTo-Json -Compress
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($resJSON)

                $response.ContentType = "application/json"
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } catch {
                Write-Host "Erro no upload: $($_.Exception.Message)" -ForegroundColor Red
                $response.StatusCode = 500
                try {
                    $errRes = @{ status = "error"; message = $_.Exception.Message } | ConvertTo-Json -Compress
                    $errBuf = [System.Text.Encoding]::UTF8.GetBytes($errRes)
                    $response.ContentType = "application/json"
                    $response.ContentLength64 = $errBuf.Length
                    $response.OutputStream.Write($errBuf, 0, $errBuf.Length)
                } catch {}
            }
            $response.Close()
            continue
        }

        # --- ROTA DE ARQUIVOS ESTÁTICOS ---
        $filePath = Join-Path $pwd $url.Replace("/", "\")
        
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $ct = $contentTypes[$ext]
            if (-not $ct) { $ct = "application/octet-stream" }
            $response.ContentType = $ct
            $response.Headers.Add("Cache-Control", "no-store")
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
