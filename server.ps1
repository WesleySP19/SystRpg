# DOMÍNIO RPG VTT - Premium Server v3.0 (Universal Edition)
# Melhorado para estabilidade em qualquer localhost e logs detalhados

param (
    [int]$Port = 8080
)

$contentTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".webp" = "image/webp"
    ".vtt"  = "text/vtt"
    ".ico"  = "image/x-icon"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

function Send-Response($response, $statusCode, $contentType, $content) {
    $response.StatusCode = $statusCode
    $response.ContentType = $contentType
    $response.AddHeader("Access-Control-Allow-Origin", "*")
    $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")
    
    if ($content -is [string]) {
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
    } else {
        $buffer = $content
    }
    
    $response.ContentLength64 = $buffer.Length
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.Close()
}

try {
    $listener.Start()
    Clear-Host
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "   🏰 DOMÍNIO RPG VTT - SERVER V3.0" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Servidor Ativo em: http://localhost:$Port" -ForegroundColor Green
    Write-Host "Escutando em todas as interfaces da rede." -ForegroundColor Gray
    Write-Host "Logs de Execução abaixo:" -ForegroundColor White
    Write-Host "------------------------------------------" -ForegroundColor Gray

    if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" }

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $url = $request.Url.LocalPath
        
        # Log simplificado no console
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timestamp] $($request.HttpMethod) $url" -NoNewline

        if ($url -eq "/") { $url = "/index.html" }

        # OPTIONS para CORS
        if ($request.HttpMethod -eq "OPTIONS") {
            Send-Response $response 200 "text/plain" ""
            Write-Host " -> CORS OK" -ForegroundColor DarkGray
            continue
        }

        # API: Save
        if ($request.HttpMethod -eq "POST" -and $url -eq "/api/save") {
            try {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                
                if ([string]::IsNullOrWhiteSpace($body)) { throw "Corpo da requisição vazio" }

                $postData = $body | ConvertFrom-Json
                $filename = $postData.filename
                if (!$filename) { throw "Nome do arquivo não especificado" }

                # Sanitização básica do nome do arquivo
                $filename = [System.IO.Path]::GetFileName($filename)
                $filePath = Join-Path $pwd "data\$filename"

                # Conversão robusta para JSON (profundidade 100 para objetos complexos)
                $jsonContent = $postData.data | ConvertTo-Json -Depth 100
                
                # Escrita atômica e segura
                [System.IO.File]::WriteAllText($filePath, $jsonContent, [System.Text.Encoding]::UTF8)

                Send-Response $response 200 "application/json" '{"status":"success"}'
                Write-Host " -> SALVO: $filename ($($jsonContent.Length) bytes)" -ForegroundColor Green
            } catch {
                $errMsg = $_.Exception.Message
                Send-Response $response 500 "application/json" "{`"status`":`"error`", `"message`":`"$errMsg`"}"
                Write-Host " -> ERRO AO SALVAR: $errMsg" -ForegroundColor Red
            }
            continue
        }

        # STATIC FILES
        $relativeUrl = $url.TrimStart("/")
        $filePath = Join-Path $pwd $relativeUrl.Replace("/", "\")

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = $contentTypes[$ext]
            if (!$mime) { $mime = "application/octet-stream" }
            
            try {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                Send-Response $response 200 $mime $bytes
                Write-Host " -> 200 OK" -ForegroundColor DarkGreen
            } catch {
                Send-Response $response 500 "text/plain" "Erro ao ler arquivo"
                Write-Host " -> 500 READ ERROR" -ForegroundColor Red
            }
        } else {
            Send-Response $response 404 "text/plain" "404 Not Found"
            Write-Host " -> 404 NOT FOUND" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "`nOcorreu um erro fatal: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    $listener.Stop()
}
