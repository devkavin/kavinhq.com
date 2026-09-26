param(
    [string]$ApiBase = $(if ($env:KAVINHQ_API_BASE) { $env:KAVINHQ_API_BASE.TrimEnd('/') } else { "http://127.0.0.1:8001" }),
    [string]$AdminEmail = $env:ADMIN_EMAIL,
    [string]$AdminPassword = $env:ADMIN_PASSWORD
)

$ErrorActionPreference = "Stop"
if (-not $AdminEmail -or -not $AdminPassword) { throw "ADMIN_EMAIL and ADMIN_PASSWORD are required for API verification." }
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$temporaryProjectId = $null
$originalSettings = $null
$settingsChanged = $false
$authenticated = $false

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null
    )

    $arguments = @{
        Uri = "$ApiBase$Path"
        Method = $Method
        WebSession = $session
        UseBasicParsing = $true
    }
    if ($null -ne $Body) {
        $arguments.ContentType = "application/json"
        $arguments.Body = $Body | ConvertTo-Json -Depth 8
    }

    try {
        $response = Invoke-WebRequest @arguments
        $content = if ($response.Content) { $response.Content | ConvertFrom-Json } else { $null }
        return [pscustomobject]@{ Status = [int]$response.StatusCode; Body = $content }
    }
    catch {
        if (-not $_.Exception.Response) { throw }
        $response = $_.Exception.Response
        $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
        $raw = $reader.ReadToEnd()
        $reader.Dispose()
        $content = if ($raw) { $raw | ConvertFrom-Json } else { $null }
        return [pscustomobject]@{ Status = [int]$response.StatusCode; Body = $content }
    }
}

function Confirm-Status {
    param([string]$Name, [object]$Response, [int[]]$Expected)
    if ($Expected -notcontains $Response.Status) {
        throw "$Name failed with HTTP $($Response.Status)"
    }
    Write-Host "PASS  $Name ($($Response.Status))" -ForegroundColor Green
}

$project = @{
    title = "Verification Project"
    slug = "verification-project"
    description = "Temporary project created by the KAVINHQ API verification script."
    category = "Landing Pages"
    image_url = "https://images.unsplash.com/photo-1551288049-bebda4e38f71"
    live_url = "https://verification.kavinhq.com"
    gallery = @("https://images.unsplash.com/photo-1558655146-9f40138edfeb")
    story = "A temporary verification record.`n`nIt is removed before the script exits."
    stack = "React, FastAPI"
    year = 2026
    featured = $false
    sort_order = 9999
}

try {
    $health = Invoke-Api GET "/api/health"
    Confirm-Status "health" $health @(200)
    if ($health.Body.status -ne "ok" -or $health.Body.database -ne "connected") { throw "Health response did not confirm the database connection" }

    $unauthorized = Invoke-Api POST "/api/projects" $project
    Confirm-Status "unauthenticated project write" $unauthorized @(401)

    $login = Invoke-Api POST "/api/auth/login" @{ email = $AdminEmail; password = $AdminPassword }
    Confirm-Status "login" $login @(200)
    $authenticated = $true

    $me = Invoke-Api GET "/api/auth/me"
    Confirm-Status "current user" $me @(200)
    if ($me.Body.email -ne $AdminEmail.ToLower()) { throw "Current user email did not match the login" }

    $existing = Invoke-Api GET "/api/projects/verification-project"
    if ($existing.Status -eq 200) {
        $deleteExisting = Invoke-Api DELETE "/api/projects/$($existing.Body.id)"
        Confirm-Status "remove prior verification project" $deleteExisting @(204)
    }

    $create = Invoke-Api POST "/api/projects" $project
    Confirm-Status "create project" $create @(201)
    $temporaryProjectId = $create.Body.id

    $retrieve = Invoke-Api GET "/api/projects/verification-project"
    Confirm-Status "retrieve project" $retrieve @(200)

    $project.description = "Updated temporary project created by the KAVINHQ verification script."
    $update = Invoke-Api PUT "/api/projects/$temporaryProjectId" $project
    Confirm-Status "update project" $update @(200)
    if ($update.Body.description -ne $project.description) { throw "Project update was not persisted" }

    $original = Invoke-Api GET "/api/settings"
    Confirm-Status "read settings" $original @(200)
    $originalSettings = @{
        whatsapp_number = $original.Body.whatsapp_number
        whatsapp_message = $original.Body.whatsapp_message
    }

    $settingsUpdate = Invoke-Api PUT "/api/settings" @{
        whatsapp_number = $originalSettings.whatsapp_number
        whatsapp_message = "$($originalSettings.whatsapp_message) Verification check."
    }
    Confirm-Status "update settings" $settingsUpdate @(200)
    $settingsChanged = $true

    $restore = Invoke-Api PUT "/api/settings" $originalSettings
    Confirm-Status "restore settings" $restore @(200)
    $settingsChanged = $false

    $delete = Invoke-Api DELETE "/api/projects/$temporaryProjectId"
    Confirm-Status "delete project" $delete @(204)
    $temporaryProjectId = $null

    $logout = Invoke-Api POST "/api/auth/logout"
    Confirm-Status "logout" $logout @(204)
    $authenticated = $false

    $afterLogout = Invoke-Api GET "/api/auth/me"
    Confirm-Status "post-logout authorization" $afterLogout @(401)

    Write-Host "API verification completed with cleanup confirmed." -ForegroundColor Cyan
}
finally {
    if ($authenticated -and $settingsChanged -and $null -ne $originalSettings) {
        $null = Invoke-Api PUT "/api/settings" $originalSettings
        Write-Host "Restored prior settings during cleanup."
    }
    if ($authenticated -and $null -ne $temporaryProjectId) {
        $null = Invoke-Api DELETE "/api/projects/$temporaryProjectId"
        Write-Host "Removed the temporary project during cleanup."
    }
}
