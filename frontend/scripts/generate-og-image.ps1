param(
    [string]$OutputPath = (Join-Path $PSScriptRoot "..\public\og-image.jpg")
)

Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$bitmap = [System.Drawing.Bitmap]::new($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#05070A"))

try {
    $gridPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(15, 255, 255, 255), 1)
    for ($x = 0; $x -le $width; $x += 64) { $graphics.DrawLine($gridPen, $x, 0, $x, $height) }
    for ($y = 0; $y -le $height; $y += 64) { $graphics.DrawLine($gridPen, 0, $y, $width, $y) }

    $cyanGlow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(24, 0, 240, 255))
    $mintGlow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(16, 0, 255, 135))
    $graphics.FillEllipse($cyanGlow, 820, -240, 680, 680)
    $graphics.FillEllipse($mintGlow, -230, 350, 600, 600)

    $badgeRect = [System.Drawing.RectangleF]::new(96, 112, 190, 190)
    $badgePath = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $radius = 46
    $badgePath.AddArc($badgeRect.X, $badgeRect.Y, $radius, $radius, 180, 90)
    $badgePath.AddArc($badgeRect.Right - $radius, $badgeRect.Y, $radius, $radius, 270, 90)
    $badgePath.AddArc($badgeRect.Right - $radius, $badgeRect.Bottom - $radius, $radius, $radius, 0, 90)
    $badgePath.AddArc($badgeRect.X, $badgeRect.Bottom - $radius, $radius, $radius, 90, 90)
    $badgePath.CloseFigure()
    $panelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#0B0F17"))
    $graphics.FillPath($panelBrush, $badgePath)
    $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(36, 255, 255, 255), 2)
    $graphics.DrawPath($borderPen, $badgePath)

    $markBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.PointF]::new(130, 140),
        [System.Drawing.PointF]::new(250, 270),
        [System.Drawing.ColorTranslator]::FromHtml("#00F0FF"),
        [System.Drawing.ColorTranslator]::FromHtml("#00FF87")
    )
    $markPen = [System.Drawing.Pen]::new($markBrush, 16)
    $markPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $markPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $markPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $graphics.DrawLine($markPen, 150, 150, 150, 265)
    $graphics.DrawLine($markPen, 154, 212, 235, 151)
    $graphics.DrawLine($markPen, 154, 212, 240, 268)
    $graphics.FillEllipse([System.Drawing.Brushes]::Cyan, 247, 137, 17, 17)

    $labelFont = [System.Drawing.Font]::new("Consolas", 16, [System.Drawing.FontStyle]::Bold)
    $titleFont = [System.Drawing.Font]::new("Arial", 76, [System.Drawing.FontStyle]::Bold)
    $taglineFont = [System.Drawing.Font]::new("Arial", 30, [System.Drawing.FontStyle]::Regular)
    $labelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#00F0FF"))
    $whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#F8FAFC"))
    $mutedBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#94A3B8"))
    $graphics.DrawString("INDEPENDENT WEB STUDIO", $labelFont, $labelBrush, 340, 137)
    $graphics.DrawString("KAVIN", $titleFont, $whiteBrush, 330, 174)
    $graphics.DrawString("HQ", $titleFont, $markBrush, 645, 174)
    $graphics.DrawString("WEBSITES THAT", $taglineFont, $whiteBrush, 100, 385)
    $graphics.DrawString("DEMAND ATTENTION.", $taglineFont, $markBrush, 100, 433)
    $graphics.DrawString("Design. Engineering. Launch.", $labelFont, $mutedBrush, 102, 520)

    $directory = Split-Path -Parent $OutputPath
    [System.IO.Directory]::CreateDirectory($directory) | Out-Null
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
}
finally {
    $graphics.Dispose()
    $bitmap.Dispose()
}
