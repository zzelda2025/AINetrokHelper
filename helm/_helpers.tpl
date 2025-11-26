{{- define "ai-network-config-helper.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "ai-network-config-helper.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "ai-network-config-helper.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
```

## ✅ Sau khi thêm 2 file:

Cấu trúc sẽ đầy đủ:
```
helm/
├── Chart.yaml          ← MỚI THÊM
├── _helpers.tpl        ← MỚI THÊM
├── .gitkeep
├── deployment.yaml     ← ĐÃ CÓ
├── ingress.yaml        ← ĐÃ CÓ
├── service.yaml        ← ĐÃ CÓ
└── values.yaml         ← ĐÃ CÓ
```

## 🚀 Sau đó:

1. **Commit 2 file mới** vào GitHub
2. **Trigger Jenkins pipeline** (tự động qua webhook hoặc manual)
3. Jenkins sẽ:
   - Copy **TẤT CẢ** các file từ `helm/` 
   - Update image tag trong `values.yaml`
   - Package thành `.tgz`
   - Push lên Harbor với version `1.0.X`

Logs sẽ hiện:
```
✓ Copied Chart.yaml
✓ Copied values.yaml
✓ Copied all templates
✓ Copied _helpers.tpl
