# Instrucciones para Ejecutar en Supabase

## 📋 Pasos a Seguir

### 1. Abre el SQL Editor en Supabase
- Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
- Click en "SQL Editor" en el menú lateral

### 2. Ejecuta el Script Completo
- Copia TODO el contenido de `supabase_schema.sql`
- Pégalo en el SQL Editor
- Click en "Run" o presiona `Ctrl + Enter`

### 3. Verifica que Funcionó
Ejecuta esta query para confirmar:
```sql
SELECT * FROM public.bf_black_friday_2025 LIMIT 1;
```

Deberías ver la estructura de la tabla sin errores.

## ✅ Cambios Importantes

1. **JSONB en lugar de TEXT**: `conversation_log` ahora es tipo `jsonb` para almacenar el historial completo
2. **created_at AUTO**: Se genera automáticamente, NO lo envíes desde JavaScript
3. **Políticas RLS**: Configuradas para permitir INSERT y SELECT a usuarios anónimos

## 🔧 Si Hay Problemas

Si ves el error "table already exists":
1. Ejecuta solo la primera línea del SQL:
   ```sql
   drop table if exists public.bf_black_friday_2025 cascade;
   ```
2. Luego ejecuta el resto del script

## 🧪 Prueba Rápida

Después de crear la tabla, prueba insertar un registro:
```sql
INSERT INTO public.bf_black_friday_2025 (email, estado, conversation_log)
VALUES ('test@test.com', 'test', '[]'::jsonb);
```

Si funciona, ¡estás listo! 🎉
