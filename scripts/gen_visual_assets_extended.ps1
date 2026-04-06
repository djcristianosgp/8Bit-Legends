# Script para gerar sprites adicionais para 8Bit Legends
# - Arrow (flecha)
# - Shield visual
# - Novos tiles (água animada, árvore, casa)
# - Inimigo melhorado

Add-Type -AssemblyName System.Drawing

function New-Bmp {
    param([int]$w, [int]$h)
    return [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
}

function C {
    param([string]$hex)
    $hex = $hex.TrimStart('#')
    [System.Drawing.Color]::FromArgb(
        [Convert]::ToInt32($hex.Substring(0, 2), 16),
        [Convert]::ToInt32($hex.Substring(2, 2), 16),
        [Convert]::ToInt32($hex.Substring(4, 2), 16)
    )
}

# ──────────────────────────────────────────────────────────────────────────────
# 1. FLECHA (8x8 pixelada, dourada com rabo)
# ──────────────────────────────────────────────────────────────────────────────

$arrowBmp = New-Bmp 8 8
$arrowGfx = [System.Drawing.Graphics]::FromImage($arrowBmp)
$arrowBrush = [System.Drawing.SolidBrush]::new((C '#FFD700'))
$arrowBrush2 = [System.Drawing.SolidBrush]::new((C '#FFA500'))
$arrowBrush3 = [System.Drawing.SolidBrush]::new((C '#FF8C00'))

# Ponta da flecha (triângulo)
$arrowGfx.FillRectangle($arrowBrush, 6, 3, 2, 2)  # Ponta

# Corpo
$arrowGfx.FillRectangle($arrowBrush2, 2, 3, 4, 2)  # Corpo

# Rabo
$arrowGfx.FillRectangle($arrowBrush3, 0, 3, 2, 2)  # Rabo

$arrowGfx.Dispose()
$arrowBmp.Save("$PSScriptRoot/../public/assets/sprites/arrow.png")
$arrowBmp.Dispose()

# ──────────────────────────────────────────────────────────────────────────────
# 2. ESCUDO (16x16 círculo pixelado com borda)
# ──────────────────────────────────────────────────────────────────────────────

$shieldBmp = New-Bmp 16 16
$shieldGfx = [System.Drawing.Graphics]::FromImage($shieldBmp)
$shieldGfx.Clear([System.Drawing.Color]::Transparent)

# Borda azul clara
$shieldBorder = [System.Drawing.SolidBrush]::new((C '#4EB3F5'))
$shieldInner = [System.Drawing.SolidBrush]::new((C '#2E7BB9'))

# Desenha círculo/escudo simplificado (retângulo com cantos para parecer escudo)
$shieldGfx.FillRectangle($shieldBorder, 2, 2, 12, 12)  # Borda
$shieldGfx.FillRectangle($shieldInner, 4, 4, 8, 8)    # Interior

# Reflexo (highlight)
$highlight = [System.Drawing.SolidBrush]::new((C '#88D4FF'))
$shieldGfx.FillRectangle($highlight, 5, 5, 3, 3)

$shieldGfx.Dispose()
$shieldBmp.Save("$PSScriptRoot/../public/assets/sprites/shield.png")
$shieldBmp.Dispose()

# ──────────────────────────────────────────────────────────────────────────────
# 3. TILESET MELHORADO - Separar em 4 tiles: grama, água, árvore, casa
# ──────────────────────────────────────────────────────────────────────────────

# Novo tileset 4 tipos de tiles (32x32 cada, em um sheet 64x64)

$tilesetBmp = New-Bmp 128 64
$tilesetGfx = [System.Drawing.Graphics]::FromImage($tilesetBmp)
$tilesetGfx.Clear([System.Drawing.Color]::White)

# Paleta de cores
$grassLight = C '#6ABD5A'
$grassDark = C '#4A9F3F'
$waterBlue = C '#3B7FD4'
$waterLight = C '#5B9FE8'
$stoneDark = C '#6B6B6B'
$stoneLight = C '#8B8B8B'
$woodBrown = C '#8B5A2B'
$woodLight = C '#A0826D'

# TILE 0 (0, 0): GRAMA
$grassBrush = [System.Drawing.SolidBrush]::new($grassLight)
$tilesetGfx.FillRectangle($grassBrush, 0, 0, 32, 32)

# Adiciona detalhes em grama
$grassDarkBrush = [System.Drawing.SolidBrush]::new($grassDark)
$tilesetGfx.FillRectangle($grassDarkBrush, 2, 2, 4, 4)
$tilesetGfx.FillRectangle($grassDarkBrush, 12, 18, 3, 3)
$tilesetGfx.FillRectangle($grassDarkBrush, 24, 8, 3, 3)

$grassSpotBrush = [System.Drawing.SolidBrush]::new((C '#5CBD4A'))
$tilesetGfx.FillRectangle($grassSpotBrush, 8, 12, 2, 2)
$tilesetGfx.FillRectangle($grassSpotBrush, 20, 5, 2, 2)

# TILE 1 (32, 0): ÁGUA (animada)
$waterBrush = [System.Drawing.SolidBrush]::new($waterBlue)
$tilesetGfx.FillRectangle($waterBrush, 32, 0, 32, 32)

# Padrão de água (ondas)
$waterWaveBrush = [System.Drawing.SolidBrush]::new($waterLight)
$tilesetGfx.FillRectangle($waterWaveBrush, 35, 5, 3, 2)
$tilesetGfx.FillRectangle($waterWaveBrush, 42, 10, 3, 2)
$tilesetGfx.FillRectangle($waterWaveBrush, 50, 15, 3, 2)
$tilesetGfx.FillRectangle($waterWaveBrush, 58, 20, 3, 2)
$tilesetGfx.FillRectangle($waterWaveBrush, 40, 25, 3, 2)

# TILE 2 (64, 0): ÁRVORE (parte superior folhagem)
$treeBrush = [System.Drawing.SolidBrush]::new((C '#2D7A1F'))
$tilesetGfx.FillRectangle($treeBrush, 64, 0, 32, 32)

# Folhagem (círculo simplificado)
$treeLightBrush = [System.Drawing.SolidBrush]::new((C '#4FA033'))
$tilesetGfx.FillRectangle($treeLightBrush, 72, 4, 16, 12)
$tilesetGfx.FillRectangle($treeLightBrush, 74, 8, 12, 8)
$tilesetGfx.FillRectangle($treeLightBrush, 76, 12, 8, 6)

# TILE 3 (96, 0): CASA (telha/parede)
$houseBrush = [System.Drawing.SolidBrush]::new((C '#D4A574'))
$tilesetGfx.FillRectangle($houseBrush, 96, 0, 32, 32)

# Telha (topo)
$tileBrush = [System.Drawing.SolidBrush]::new((C '#A0522D'))
$tilesetGfx.FillRectangle($tileBrush, 100, 4, 24, 8)

# Parede com divisão
$wallBrush = [System.Drawing.SolidBrush]::new((C '#BF8F5F'))
$tilesetGfx.FillRectangle($wallBrush, 100, 12, 24, 16)

# Janela
$windowBrush = [System.Drawing.SolidBrush]::new((C '#87CEEB'))
$tilesetGfx.FillRectangle($windowBrush, 108, 16, 6, 6)
$tilesetGfx.FillRectangle($windowBrush, 118, 16, 6, 6)

# Porta
$doorBrush = [System.Drawing.SolidBrush]::new((C '#654321'))
$tilesetGfx.FillRectangle($doorBrush, 110, 22, 12, 10)

# TILE 4 (32, 32): TRONCO ÁRVORE
$trunkBrush = [System.Drawing.SolidBrush]::new($woodBrown)
$tilesetGfx.FillRectangle($trunkBrush, 32, 32, 32, 32)

$trunkLightBrush = [System.Drawing.SolidBrush]::new($woodLight)
$tilesetGfx.FillRectangle($trunkLightBrush, 38, 36, 4, 24)
$tilesetGfx.FillRectangle($trunkLightBrush, 50, 40, 3, 20)

# TILE 5 (64, 32): PEDRA/CAMINHO
$stoneBrush = [System.Drawing.SolidBrush]::new($stoneDark)
$tilesetGfx.FillRectangle($stoneBrush, 64, 32, 32, 32)

$stoneLightBrush = [System.Drawing.SolidBrush]::new($stoneLight)
$tilesetGfx.FillRectangle($stoneLightBrush, 68, 36, 4, 4)
$tilesetGfx.FillRectangle($stoneLightBrush, 80, 44, 5, 5)
$tilesetGfx.FillRectangle($stoneLightBrush, 72, 56, 4, 4)

# TILE 6 (96, 32): PAREDE EXTRA (cliff/muro)
$cliffBrush = [System.Drawing.SolidBrush]::new((C '#696969'))
$tilesetGfx.FillRectangle($cliffBrush, 96, 32, 32, 32)

# Linhas de sombra para profundidade
$shadowBrush = [System.Drawing.SolidBrush]::new((C '#444444'))
$tilesetGfx.FillRectangle($shadowBrush, 100, 40, 24, 2)
$tilesetGfx.FillRectangle($shadowBrush, 100, 55, 24, 2)

$tilesetGfx.Dispose()
$tilesetBmp.Save("$PSScriptRoot/../public/assets/tiles/expanded_tileset.png")
$tilesetBmp.Dispose()

Write-Host "Assets visuais regenerados com sucesso!" -ForegroundColor Green
Write-Host "  - arrow.png (8x8)" -ForegroundColor Cyan
Write-Host "  - shield.png (16x16)" -ForegroundColor Cyan
Write-Host "  - expanded_tileset.png (128x64 com 6+ tiles)" -ForegroundColor Cyan
