# 🛡️ Implementação: Sistema Dinâmico de Porta com Fallback Inteligente

**Data:** 23 de Maio de 2026  
**Problema Resolvido:** Porta 8000 bloqueada por Sistema (PID 4) do Windows

---

## 📋 Resumo da Implementação

Sistema de porta dinâmica com **3 camadas de fallback automático**:

1. **Variável de Ambiente** (`PORT` ou `SERVER_PORT`)
2. **Fallback em Cascata** → 8000 → 8080 → 8001 → 8888 → 9000
3. **Porta Aleatória** (último recurso entre 9001-9999)

---

## 📁 Arquivos Modificados (3 arquivos)

### 1️⃣ **[MesadoMestre.vbs](MesadoMestre.vbs)**

**Mudanças-chave:**

- ❌ **Removido:** `Const SERVER_PORT = 8000` (hardcoded)
- ✅ **Adicionado:** Função `GetConfiguredPort()` com lógica de descoberta
- ✅ **Adicionado:** Função `IsNumeric()` para validação
- ✅ **Adicionado:** Função `IsPortInUseByPID()` genérica e reutilizável
- ✅ **Modificado:** `CleanupOrphanProcesses()` agora recebe `portNumber` como parâmetro
- ✅ **Modificado:** Batch script chamado com variável de ambiente `SERVER_PORT`

**Código novo (linhas 32-68):**

```vbscript
' Lê a porta configurada na variável de ambiente ou aplica fallback inteligente
Function GetConfiguredPort()
    Dim envPort, portCandidates, i, port

    ' Tenta ler a variável de ambiente PORT
    On Error Resume Next
    envPort = objShell.Environment("PROCESS")("PORT")
    If Err.Number <> 0 Then envPort = ""
    Err.Clear
    On Error GoTo 0

    ' Se PORT está definida e é válida, tenta usá-la primeiro
    If envPort <> "" And IsNumeric(envPort) Then
        port = CLng(envPort)
        If Not IsPortInUseByPID(port) Then
            GetConfiguredPort = port
            Exit Function
        End If
    End If

    ' Fallback: tenta 8000, 8080, 8001 em ordem
    portCandidates = Array(8000, 8080, 8001)
    For i = LBound(portCandidates) To UBound(portCandidates)
        port = portCandidates(i)
        If Not IsPortInUseByPID(port) Then
            GetConfiguredPort = port
            Exit Function
        End If
    Next

    ' Se nenhuma porta estiver livre, retorna a padrão (será erro depois)
    GetConfiguredPort = 8000
End Function

' Verifica se uma string é numérica
Function IsNumeric(str)
    On Error Resume Next
    IsNumeric = CLng(str) = CLng(str)
    On Error GoTo 0
End Function

' Verifica se a porta já está em uso por outro processo
Function IsPortInUseByPID(portNumber)
    Dim exitCode
    On Error Resume Next
    exitCode = objShell.Run("cmd /c netstat -aon | findstr :" & portNumber & " | findstr LISTENING >nul 2>&1", 0, True)
    If Err.Number <> 0 Then
        IsPortInUseByPID = False
        Err.Clear
    Else
        IsPortInUseByPID = (exitCode = 0)
    End If
    On Error GoTo 0
End Function
```

---

### 2️⃣ **[server.ps1](server.ps1)**

**Mudanças-chave:**

- ✅ **Adicionado:** Função `Test-PortAvailable` com timeout de 500ms
- ✅ **Adicionado:** Função `Get-AvailablePort` com cascata de fallback
- ✅ **Modificado:** Parâmetro `$Port` padrão agora é `0` (ativa lógica dinâmica)
- ✅ **Adicionado:** Leitura de variáveis de ambiente `PORT` e `SERVER_PORT`
- ✅ **Modificado:** HttpListener usa `$finalPort` (porta descoberta dinamicamente)
- ✅ **Adicionado:** Mensagens coloridas com feedback visual

**Código novo (linhas 6-80):**

```powershell
# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURAÇÃO DINÂMICA DE PORTA COM FALLBACK
# ─────────────────────────────────────────────────────────────────────────────

function Test-PortAvailable {
    param([int]$PortNumber)

    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.ConnectAsync("127.0.0.1", $PortNumber).Wait(500)
        if ($tcpClient.Connected) {
            $tcpClient.Close()
            return $false  # Porta em uso
        }
        return $true  # Porta livre
    } catch {
        return $true  # Erro = porta provavelmente livre
    } finally {
        if ($null -ne $tcpClient) { $tcpClient.Dispose() }
    }
}

function Get-AvailablePort {
    param([int]$PreferredPort)

    # Candidatos de fallback em ordem
    $portCandidates = @($PreferredPort, 8080, 8001, 8888, 9000)
    $portCandidates = $portCandidates | Select-Object -Unique  # Remove duplicatas

    foreach ($candidatePort in $portCandidates) {
        if (Test-PortAvailable -PortNumber $candidatePort) {
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

    # Se nada funcionar, retorna a preferida (será erro depois)
    return $PreferredPort
}

# Determina porta final: variável de ambiente > parâmetro > fallback automático
$finalPort = $Port

# Se Port é 0 (padrão), tenta ler de variável de ambiente
if ($finalPort -eq 0) {
    $envPort = $env:PORT
    if ([string]::IsNullOrWhiteSpace($envPort)) {
        $envPort = $env:SERVER_PORT
    }

    if (![string]::IsNullOrWhiteSpace($envPort) -and [int]::TryParse($envPort, [ref]$finalPort)) {
        Write-Host "🔧 PORT lida da variável de ambiente: $finalPort" -ForegroundColor Cyan
    } else {
        # Se variável não existe ou é inválida, usa 8000 como base
        $finalPort = 8000
        Write-Host "ℹ️  Variável de ambiente PORT não definida, usando padrão 8000" -ForegroundColor Yellow
    }
}

# Encontra uma porta disponível com fallback automático
$discoveredPort = Get-AvailablePort -PreferredPort $finalPort

if ($discoveredPort -ne $finalPort) {
    Write-Host "⚠️  Porta $finalPort em uso, usando fallback: $discoveredPort" -ForegroundColor Yellow
}

$finalPort = $discoveredPort
```

---

### 3️⃣ **[scripts/start_server.bat](scripts/start_server.bat)**

**Mudanças-chave:**

- ✅ **Adicionado:** Leitura de variável de ambiente `SERVER_PORT`
- ✅ **Adicionado:** Fallback para porta 8000 se variável não estiver definida
- ✅ **Modificado:** Passa porta dinâmica para `server.ps1`
- ✅ **Adicionado:** Echo de inicialização com feedback visual

**Código novo:**

```batch
@echo off
REM Script de inicialização do servidor RPG com suporte a porta dinâmica
REM Lê SERVER_PORT da variável de ambiente ou usa fallback

setlocal enabledelayedexpansion

if "%SERVER_PORT%"=="" (
    set SERVER_PORT=8000
)

echo.
echo ================================================================================
echo Iniciando Servidor RPG na Porta: %SERVER_PORT%
echo ================================================================================
echo.

REM Obtém o diretório do projeto (pasta raiz)
cd /d "%~dp0.."

REM Inicia PowerShell com o script server.ps1, passando a porta
powershell -NoProfile -ExecutionPolicy Bypass -File server.ps1 -Port %SERVER_PORT%

endlocal
```

---

## 🚀 Como Usar

### **Opção 1: Modo Automático (Recomendado)**

Inicia o servidor com descoberta automática de porta:

```bash
cscript MesadoMestre.vbs
```

**Comportamento:** Tenta `8000` → `8080` → `8001` (primeira livre)

---

### **Opção 2: Forçar Porta via Variável de Ambiente**

**PowerShell:**

```powershell
$env:PORT="8888"
cscript MesadoMestre.vbs
```

**CMD:**

```cmd
set PORT=8888
cscript MesadoMestre.vbs
```

**PowerShell (Persistente):**

```powershell
[Environment]::SetEnvironmentVariable("PORT", "8888", "User")
```

---

### **Opção 3: Iniciar server.ps1 Diretamente**

```powershell
.\server.ps1 -Port 8888
```

Ou com fallback automático:

```powershell
.\server.ps1  # Equivalente a -Port 0
```

---

## 🔍 Verificação e Teste

### **1. Verificar portas em uso:**

```powershell
netstat -aon | findstr ":8000\|:8080\|:8001"
```

### **2. Iniciar servidor com porta bloqueada:**

```powershell
# Simular porta 8000 em uso (usar outro terminal)
# Executar servidor - deve usar 8080 automaticamente
cscript MesadoMestre.vbs
```

### **3. Verificar qual porta está em uso:**

```powershell
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -like "80*"}
```

### **4. Acessar interface:**

Abrir no navegador a URL exibida no console ou em `mesado_log.txt`

---

## 📊 Fluxo de Decisão da Porta

```
┌─────────────────────────────────────────────────────────────────┐
│ MesadoMestre.vbs inicia                                         │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ GetConfiguredPort│
         └────────┬─────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
      ▼                       ▼
  ┌────────────────┐   ┌──────────────────┐
  │ Env PORT       │   │ Candidatos:      │
  │ definida?      │   │ 8000/8080/8001   │
  │ e válida?      │   │ (em ordem)       │
  └────┬───────┬───┘   └────────┬─────────┘
       │ SIM   │ NÃO           │
       ▼       │               ▼
   ┌──────┐    │     ┌─────────────────┐
   │Porta │    │     │ Primeira livre? │
   │livre?│    │     └────┬────────┬────┘
   └──┬──┬┘    │          │ SIM    │ NÃO
      │ │      │          ▼        │
      │ ▼      │      ┌────────┐   │
      │┌──────┐│      │Usa essa│   │
      ││USE   ││      │ porta  │   │
      │└──────┘│      └────────┘   │
      │        │                   ▼
      │        └──────────┬─────┐   Próxima
      │                  │     │   candidata
      │                  ▼     │
      │              ┌──────┐  │
      │              │ USAR │◄─┘
      │              └──────┘
      │
      ▼
  ┌──────────────────────────────────┐
  │ Passa SERVER_PORT ao batch       │
  │ scripts/start_server.bat         │
  └────────────┬─────────────────────┘
               │
               ▼
  ┌──────────────────────────────────┐
  │ Batch passa -Port ao PowerShell  │
  │ server.ps1                       │
  └────────────┬─────────────────────┘
               │
               ▼
  ┌──────────────────────────────────┐
  │ server.ps1 testa porta com       │
  │ Test-PortAvailable              │
  └────────────┬─────────────────────┘
               │
               ▼
  ┌──────────────────────────────────┐
  │ HttpListener inicia em $finalPort│
  │ com feedback colorido            │
  └──────────────────────────────────┘
```

---

## 📝 Saída de Log Esperada

```
2026-05-23 10:15:30 [INFO] ==============================================================
2026-05-23 10:15:30 [INFO] Iniciando Mesa do Mestre v2.0
2026-05-23 10:15:30 [INFO] Base path: C:\Users\...\RPGPsigologos
2026-05-23 10:15:30 [INFO] Batch script localizado: ...\scripts\start_server.bat
2026-05-23 10:15:30 [INFO] PowerShell disponível no sistema
2026-05-23 10:15:30 [INFO] Porta 8000 em uso – limpando processos anteriores...
2026-05-23 10:15:31 [INFO] Porta 8000 liberada com sucesso.
2026-05-23 10:15:31 [INFO] Lançando servidor na porta 8000...
2026-05-23 10:15:31 [INFO] Aguardando health-check do servidor...
2026-05-23 10:15:32 [INFO] Health-check OK na tentativa 3/20 (600ms)
2026-05-23 10:15:32 [INFO] Servidor pronto em 1.2s – abrindo UI
2026-05-23 10:15:32 [INFO] Fluxo concluído com sucesso.
```

---

## ⚡ Tratamento de Erros

| Situação                      | Comportamento                            |
| ----------------------------- | ---------------------------------------- |
| Porta configurada em uso      | Tenta próxima da lista (8080, 8001, etc) |
| Todas as portas padrão em uso | Tenta porta aleatória 9001-9999          |
| Nenhuma porta disponível      | Erro fatal com mensagem clara            |
| Variável PORT inválida        | Ignora e usa fallback automático         |
| PowerShell não encontrado     | Erro fatal no startup                    |
| Health-check falha            | Mata processo e sai com código 4         |

---

## 🔐 Segurança

- ✅ Validação de entrada (variável PORT)
- ✅ Sanitização de nomes de arquivo (já existente no server.ps1)
- ✅ Cleanup automático de processos órfãos
- ✅ Health-check com timeout para evitar hang
- ✅ Logging estruturado com timestamp

---

## 📦 Dependências

- Windows PowerShell 5.0+ (incluso no Windows 10+)
- PowerShell Script Engine (executável via VBScript)
- CMD.exe (para netstat e taskkill)
- WinHttp.WinHttpRequest (nativo do Windows)

---

## 📞 Suporte

Se a porta ainda estiver bloqueada após todas as tentativas:

1. **Verificar qual processo está usando a porta:**

   ```powershell
   Get-NetTCPConnection -LocalPort 8000 -State Listen
   ```

2. **Forçar uso de outra porta:**

   ```powershell
   $env:PORT="9090"
   cscript MesadoMestre.vbs
   ```

3. **Reiniciar serviços do Windows:**
   ```powershell
   # Se PID 4 estiver bloqueando, pode ser HTTP.SYS
   # Reiniciar: net stop http /y && net start http
   ```

---

**Versão:** 2.0  
**Última atualização:** 23 de Maio de 2026
