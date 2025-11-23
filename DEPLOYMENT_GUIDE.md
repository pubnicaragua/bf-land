# 🚀 Guía de Deployment - Vercel + GitHub

## Opción 1: Deploy Directo desde GitHub (RECOMENDADO)

### Paso 1: Subir Código a GitHub

```bash
# Navega a tu carpeta del proyecto
cd "c:\Users\Probook 450 G7\Desktop\Black Friday 23 -30 NOV SoftNic"

# Inicializa git (si no está inicializado)
git init

# Agrega el repositorio remoto
git remote add origin https://github.com/pubnicaragua/bf-land.git

# Agrega todos los archivos
git add .

# Haz commit
git commit -m "feat: Black Friday landing page with AI chat and Supabase integration"

# Sube a GitHub
git push -u origin main
```

**⚠️ IMPORTANTE:** Si el repo ya existe y tiene contenido, usa:
```bash
git pull origin main --rebase
git push origin main
```

### Paso 2: Conectar a Vercel

1. **Ve a [Vercel](https://vercel.com)**
2. **Click en "Add New Project"**
3. **Import desde GitHub:**
   - Busca `pubnicaragua/bf-land`
   - Click en "Import"

4. **Configuración del Proyecto:**
   - **Framework Preset:** Other
   - **Root Directory:** `./` (dejar por defecto)
   - **Build Command:** (dejar vacío, es HTML estático)
   - **Output Directory:** `./` (dejar por defecto)

5. **Environment Variables (MUY IMPORTANTE):**
   
   Click en "Environment Variables" y agrega:

   ```
   GROQ_API_KEY=gsk_tu_api_key_aqui
   SUPABASE_URL=https://ytrqzsnzixkgqkczdksl.supabase.co
   SUPABASE_KEY=tu_supabase_anon_key_aqui
   ```

   **📝 Dónde encontrar las keys:**
   - **GROQ_API_KEY:** [Groq Console](https://console.groq.com/keys)
   - **SUPABASE_URL y KEY:** Supabase Dashboard → Settings → API

6. **Click en "Deploy"** 🚀

---

## Opción 2: Deploy Directo desde Vercel CLI

```bash
# Instala Vercel CLI
npm i -g vercel

# Navega a tu proyecto
cd "c:\Users\Probook 450 G7\Desktop\Black Friday 23 -30 NOV SoftNic"

# Login a Vercel
vercel login

# Deploy
vercel

# Sigue las instrucciones:
# - Set up and deploy? Y
# - Which scope? (tu cuenta)
# - Link to existing project? N
# - Project name? bf-land
# - In which directory? ./
# - Override settings? N
```

Luego agrega las variables de entorno:
```bash
vercel env add GROQ_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
```

---

## 📁 Estructura de Archivos Necesaria

Asegúrate de tener esta estructura antes de subir:

```
bf-land/
├── api/
│   └── chat.js              # Serverless function para Groq
├── css/
│   └── black-friday.css     # Estilos
├── js/
│   └── bf-agent.js          # Lógica del chat
├── black-friday.html        # Página principal
├── supabase_schema.sql      # Schema (no se deploya, solo referencia)
├── .gitignore               # Archivos a ignorar
└── vercel.json              # Configuración de Vercel (opcional)
```

### Crea `.gitignore`:
```
node_modules/
.env
.env.local
.vercel
*.log
.DS_Store
```

### Crea `vercel.json` (opcional pero recomendado):
```json
{
  "rewrites": [
    { "source": "/", "destination": "/black-friday.html" },
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

---

## 🔧 Actualizar el Deployment

Cada vez que hagas cambios:

```bash
git add .
git commit -m "descripción de cambios"
git push origin main
```

Vercel detectará automáticamente los cambios y re-deployará.

---

## ✅ Verificación Post-Deployment

1. **Prueba la URL de producción** (ej: `bf-land.vercel.app`)
2. **Abre el chat** y completa el flujo
3. **Verifica en Supabase** que los datos se guardaron
4. **Revisa los logs** en Vercel Dashboard → Deployments → Functions

---

## 🐛 Troubleshooting

### Error: "GROQ_API_KEY is not defined"
- Ve a Vercel Dashboard → Settings → Environment Variables
- Asegúrate de que las variables estén configuradas
- Redeploy: `vercel --prod`

### Error: "Supabase 404"
- Verifica que ejecutaste el SQL en Supabase
- Confirma que la tabla `bf_black_friday_2025` existe

### Chat no funciona en producción
- Revisa los logs: Vercel Dashboard → Functions → `/api/chat`
- Verifica que el endpoint sea `/api/chat` (no `file:///`)

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica las variables de entorno
3. Confirma que Supabase está configurado correctamente
