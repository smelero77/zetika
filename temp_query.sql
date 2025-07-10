SELECT tipoConvocatoria, COUNT(*) as cantidad, MIN(fechaPublicacion) as fecha_min, MAX(fechaPublicacion) as fecha_max 
FROM "Convocatoria" 
WHERE fechaPublicacion >= '2025-06-01' 
GROUP BY tipoConvocatoria 
ORDER BY cantidad DESC; 