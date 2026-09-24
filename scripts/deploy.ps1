param(
  [string]$Namespace = 'play-yazi-kamikazi',
  [string]$BuildName = 'handover-ifx'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$stage = Join-Path $env:TEMP 'handover-ifx-deploy'

Push-Location $root
try {
  pnpm generate
  if ($LASTEXITCODE -ne 0) { throw 'pnpm generate failed' }

  Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory $stage | Out-Null
  Copy-Item nginx.conf $stage
  Copy-Item .output\public (Join-Path $stage 'site') -Recurse
  # Runtime-only image: the site is prebuilt locally, so the cluster build just copies static files into nginx.
  @'
FROM artifactory.intra.infineon.com/docker-docker-registry/nginxinc/nginx-unprivileged:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site /usr/share/nginx/html
EXPOSE 8080
'@ | Set-Content (Join-Path $stage 'Dockerfile')

  oc start-build $BuildName --from-dir=$stage --follow -n $Namespace
  if ($LASTEXITCODE -ne 0) { throw 'oc start-build failed' }

  oc rollout restart "deploy/$BuildName" -n $Namespace
  oc rollout status "deploy/$BuildName" -n $Namespace --timeout=180s
  if ($LASTEXITCODE -ne 0) { throw 'rollout failed' }
}
finally {
  Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
  Pop-Location
}
