{{- define "handover-ifx.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "handover-ifx.fullname" -}}
{{- printf "%s" (include "handover-ifx.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
