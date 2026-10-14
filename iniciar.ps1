# Abre el backend y el frontend en dos ventanas de PowerShell.
# Uso (desde la carpeta del proyecto):  powershell -ExecutionPolicy Bypass -File .\iniciar.ps1

$raiz = $PSScriptRoot

Start-Process powershell -WorkingDirectory "$raiz\backend" -ArgumentList '-NoExit', '-Command', '$Host.UI.RawUI.WindowTitle = ''API (3000)''; npm run dev'
Start-Process powershell -WorkingDirectory "$raiz\angular-app" -ArgumentList '-NoExit', '-Command', '$Host.UI.RawUI.WindowTitle = ''Angular (4200)''; npm start'

Write-Host 'Abriendo API (puerto 3000) y Angular (puerto 4200)...'
Write-Host 'Cuando Angular termine de compilar, abre http://localhost:4200/comparador'
