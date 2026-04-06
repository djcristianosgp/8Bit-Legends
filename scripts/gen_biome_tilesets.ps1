# Script para gerar biomes temáticos para 8Bit Legends
# Cria 4 tilesets temáticos: Floresta, Ruínas, Vulcão, Caverna Cristalina

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
# TILESET 1: FLORESTA (64x32 - grama escura, plantas, troncos)
# ──────────────────────────────────────────────────────────────────────────────

$forestBmp = New-Bmp 64 32
$forestGfx = [System.Drawing.Graphics]::FromImage($forestBmp)
$forestGfx.Clear([System.Drawing.Color]::White)

# Tile 0: Grama floresta (escura e verde)
$forestGrassLight = [System.Drawing.SolidBrush]::new((C '#3A6B2C'))
$forestGrassDark = [System.Drawing.SolidBrush]::new((C '#264116'))
$forestGrassSpeckle = [System.Drawing.SolidBrush]::new((C '#4A8B3C'))

$forestGfx.FillRectangle($forestGrassLight, 0, 0, 32, 32)
$forestGfx.FillRectangle($forestGrassDark, 2, 4, 5, 5)
$forestGfx.FillRectangle($forestGrassDark, 18, 14, 4, 4)
$forestGfx.FillRectangle($forestGrassSpeckle, 8, 8, 2, 2)
$forestGfx.FillRectangle($forestGrassSpeckle, 22, 20, 2, 2)

# Tile 1: Tronco/Madeira (lado direito)
$woodDarkBrush = [System.Drawing.SolidBrush]::new((C '#6B4423'))
$woodLightBrush = [System.Drawing.SolidBrush]::new((C '#8B5A2B'))
$woodGrainBrush = [System.Drawing.SolidBrush]::new((C '#5A3A1F'))

$forestGfx.FillRectangle($woodDarkBrush, 32, 0, 32, 32)
$forestGfx.FillRectangle($woodLightBrush, 38, 6, 20, 20)
$forestGfx.FillRectangle($woodGrainBrush, 42, 10, 12, 8)

$forestGfx.Dispose()
$forestBmp.Save("$PSScriptRoot/../public/assets/tiles/biome_forest.png")
$forestBmp.Dispose()

# ──────────────────────────────────────────────────────────────────────────────
# TILESET 2: RUÍNAS (64x32 - pedra antiga, mosaicos)
# ──────────────────────────────────────────────────────────────────────────────

$ruinsBmp = New-Bmp 64 32
$ruinsGfx = [System.Drawing.Graphics]::FromImage($ruinsBmp)
$ruinsGfx.Clear([System.Drawing.Color]::White)

# Tile 0: Pedra antiga (base)
$stoneDarkRuins = [System.Drawing.SolidBrush]::new((C '#696B6E'))
$stoneLightRuins = [System.Drawing.SolidBrush]::new((C '#8B8D90'))
$mosaicBrush = [System.Drawing.SolidBrush]::new((C '#A49A6B'))

$ruinsGfx.FillRectangle($stoneDarkRuins, 0, 0, 32, 32)
# Padrão de mosaico
$ruinsGfx.FillRectangle($mosaicBrush, 4, 4, 6, 6)
$ruinsGfx.FillRectangle($mosaicBrush, 14, 4, 6, 6)
$ruinsGfx.FillRectangle($mosaicBrush, 24, 4, 6, 6)
$ruinsGfx.FillRectangle($mosaicBrush, 4, 18, 6, 6)
# Linhas de sombra
$ruinsGfx.FillRectangle($stoneLightRuins, 6, 26, 20, 2)

# Tile 1: Muro/Coluna
$columnBrush = [System.Drawing.SolidBrush]::new((C '#5F6063'))
$columnLightBrush = [System.Drawing.SolidBrush]::new((C '#9B9D9F'))

$ruinsGfx.FillRectangle($columnBrush, 32, 0, 32, 32)
$ruinsGfx.FillRectangle($columnLightBrush, 38, 2, 20, 28)
$ruinsGfx.FillRectangle($columnBrush, 42, 6, 12, 20)

$ruinsGfx.Dispose()
$ruinsBmp.Save("$PSScriptRoot/../public/assets/tiles/biome_ruins.png")
$ruinsBmp.Dispose()

# ──────────────────────────────────────────────────────────────────────────────
# TILESET 3: VULCÃO (64x32 - lava, pedra vermelha)
# ──────────────────────────────────────────────────────────────────────────────

$volcanoBmp = New-Bmp 64 32
$volcanoGfx = [System.Drawing.Graphics]::FromImage($volcanoBmp)
$volcanoGfx.Clear([System.Drawing.Color]::White)

# Tile 0: Pedra vulcânica
$lavaRed = [System.Drawing.SolidBrush]::new((C '#8B3A00'))
$lavaOrange = [System.Drawing.SolidBrush]::new((C '#D2691E'))
$lavaYellow = [System.Drawing.SolidBrush]::new((C '#FF8C00'))

$volcanoGfx.FillRectangle($lavaRed, 0, 0, 32, 32)
$volcanoGfx.FillRectangle($lavaOrange, 2, 2, 4, 4)
$volcanoGfx.FillRectangle($lavaOrange, 14, 10, 5, 5)
$volcanoGfx.FillRectangle($lavaOrange, 24, 20, 4, 4)
$volcanoGfx.FillRectangle($lavaYellow, 8, 6, 2, 2)

# Tile 1: Lava
$lavaBrush = [System.Drawing.SolidBrush]::new((C '#FF4500'))
$lavaHighlight = [System.Drawing.SolidBrush]::new((C '#FFD700'))

$volcanoGfx.FillRectangle($lavaBrush, 32, 0, 32, 32)
$volcanoGfx.FillRectangle($lavaHighlight, 36, 6, 3, 3)
$volcanoGfx.FillRectangle($lavaHighlight, 50, 14, 3, 3)
$volcanoGfx.FillRectangle($lavaHighlight, 40, 24, 4, 4)

$volcanoGfx.Dispose()
$volcanoBmp.Save("$PSScriptRoot/../public/assets/tiles/biome_volcano.png")
$volcanoBmp.Dispose()

# ──────────────────────────────────────────────────────────────────────────────
# TILESET 4: CAVERNA CRISTALINA (64x32 - cristais azuis, gelo)
# ──────────────────────────────────────────────────────────────────────────────

$crystalBmp = New-Bmp 64 32
$crystalGfx = [System.Drawing.Graphics]::FromImage($crystalBmp)
$crystalGfx.Clear([System.Drawing.Color]::White)

# Tile 0: Gelo/Pedra cristal
$iceBase = [System.Drawing.SolidBrush]::new((C '#4A7BA7'))
$icLight = [System.Drawing.SolidBrush]::new((C '#7CB3D4'))
$crystalBlueBrush = [System.Drawing.SolidBrush]::new((C '#00B4D8'))

$crystalGfx.FillRectangle($iceBase, 0, 0, 32, 32)
$crystalGfx.FillRectangle($icLight, 4, 4, 6, 8)
$crystalGfx.FillRectangle($icLight, 16, 12, 5, 6)
$crystalGfx.FillRectangle($crystalBlueBrush, 6, 6, 2, 4)
$crystalGfx.FillRectangle($crystalBlueBrush, 20, 16, 2, 4)

# Tile 1: Cristal grande
$crystalGfx.FillRectangle($crystalBlueBrush, 32, 0, 32, 32)
# Facetas do cristal
$crystalGfx.FillRectangle($icLight, 38, 4, 18, 24)
$crystalGfx.FillRectangle($crystalBlueBrush, 42, 8, 10, 16)
$crystalGfx.FillRectangle([System.Drawing.SolidBrush]::new((C '#00D9FF')), 46, 12, 6, 8)

$crystalGfx.Dispose()
$crystalBmp.Save("$PSScriptRoot/../public/assets/tiles/biome_crystal.png")
$crystalBmp.Dispose()

Write-Host "Biomes criados com sucesso!" -ForegroundColor Green
Write-Host "  - biome_forest.png (floresta escura)" -ForegroundColor Cyan
Write-Host "  - biome_ruins.png (ruinas antigas)" -ForegroundColor Cyan
Write-Host "  - biome_volcano.png (vulcao/deserto)" -ForegroundColor Cyan
Write-Host "  - biome_crystal.png (caverna cristalina)" -ForegroundColor Cyan
