# 🧪 TESTING RÁPIDO - GEO BÚSQUEDA

## 1️⃣ VERIFICAR QUE TODO COMPILÓ BIEN

```bash
cd C:\Users\User\Desktop\tebusco\front-tebusco
npm start
```

**Esperado:** La app debe iniciar sin errores de compilación.

---

## 2️⃣ VERIFICAR EN EL NAVEGADOR

### **Paso 1: Abrir DevTools**
1. Abre la app en el navegador (http://localhost:4200)
2. Presiona F12 para abrir DevTools
3. Ve a la pestaña "Console"

### **Paso 2: Ver logs de ubicación**
Deberías ver uno de estos mensajes:
- ✅ `📍 Ubicación GPS obtenida: {lat: ..., lng: ...}`
- ⚠️ `❌ No se pudo obtener GPS: ...`

### **Paso 3: Buscar desde el Hero**
1. En el buscador principal, escribe: `plomero`
2. En la consola deberías ver:
   - Request a: `http://localhost:3000/api/geo-search?term=plomero...`
   - Response con resultados

---

## 3️⃣ VERIFICAR EL BACKEND

### **Opción A: Usando curl**
```bash
curl "http://localhost:3000/api/geo-search?term=plomero&city=Santa%20Cruz"
```

### **Opción B: Usando el navegador**
Abre: `http://localhost:3000/api/geo-search?term=plomero&city=Santa%20Cruz`

**Esperado:**
```json
{
  "success": true,
  "message": "✅ Búsqueda geolocalizada exitosa",
  "data": {
    "query": "plomero",
    "providers": {
      "results": [...]
    }
  }
}
```

---

## 4️⃣ PROBAR EN JAVASCRIPT CONSOLE

### **Verificar que el servicio está disponible**
```javascript
// Pega esto en la consola del navegador
localStorage.getItem('userLocation')
// Debería mostrar la ubicación si ya se guardó
```

### **Ver el estado actual**
```javascript
// En la consola
JSON.parse(localStorage.getItem('userLocation'))
// Resultado: {city: "Santa Cruz", country: "Bolivia", ...}
```

---

## 5️⃣ FORZAR ACTUALIZACIÓN DE UBICACIÓN

Si quieres probar la obtención de GPS:

1. **Limpiar caché:**
```javascript
// En la consola del navegador
localStorage.removeItem('userLocation')
location.reload()
```

2. **El navegador pedirá permisos de ubicación**
   - Hacer clic en "Permitir"
   - Ver en consola: `📍 Ubicación GPS obtenida`

---

## 6️⃣ PROBAR DIFERENTES BÚSQUEDAS

### **Búsqueda básica:**
```
plomero
electricista
carpintero
desarrollador
```

### **Búsqueda con caracteres especiales:**
```
diseño
construcción
```

### **Búsqueda parcial:**
```
des
pro
elec
```

---

## 7️⃣ VERIFICAR BADGES (Cuando agregues la UI)

Cuando implementes los badges en el HTML, verificar:

✅ Profesionales de tu ciudad → Badge verde `📍 Tu ciudad`  
✅ Profesionales de tu departamento → Badge azul `📍 Tu departamento`  
✅ Profesionales de tu país → Badge naranja `🇧🇴 Bolivia`  
✅ Profesionales con GPS → Muestra distancia "3.5 km"  

---

## 🐛 TROUBLESHOOTING

### **Error: "Cannot find module 'geo-search.interface'"**
✅ Verificar que existe: `src/app/interface/geo-search.interface.ts`

### **Error: "Cannot find module 'geo-search.service'"**
✅ Verificar que existe: `src/app/services/geo-search.service.ts`

### **Error: "Failed to fetch"**
✅ Verificar que el backend está corriendo en puerto 3000
✅ Verificar CORS en el backend

### **No aparecen resultados**
✅ Verificar endpoint: `http://localhost:3000/api/geo-search`
✅ Ver Network tab en DevTools
✅ Ver si hay errores en Console

### **No se obtiene GPS**
✅ Verificar permisos del navegador
✅ El servicio usará ciudad del perfil como fallback
✅ Si no hay ciudad, funciona sin ubicación (score neutro)

---

## ✅ CHECKLIST DE TESTING

- [ ] App compila sin errores
- [ ] Hero-search funciona (búsqueda básica)
- [ ] Se obtiene ubicación GPS (ver en console)
- [ ] Backend responde en `/api/geo-search`
- [ ] Resultados aparecen ordenados
- [ ] No hay errores en DevTools Console
- [ ] localStorage guarda ubicación

---

## 🎯 SI TODO FUNCIONA

Deberías ver:
1. ✅ Logs en consola sobre ubicación
2. ✅ Búsquedas funcionando desde el Hero
3. ✅ Resultados con `locationMatch` en la respuesta
4. ✅ Sin errores de compilación
5. ✅ Sin errores en runtime

---

## 📞 AYUDA

Si algo no funciona:
1. Ver logs en DevTools Console (F12)
2. Ver Network tab para requests
3. Verificar que backend está corriendo
4. Revisar `IMPLEMENTATION_GUIDE.md`

---

**¡Listo para probar!** 🚀
