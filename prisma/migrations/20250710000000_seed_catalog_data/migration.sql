-- Poblar TamanoEmpresa
INSERT INTO "TamanoEmpresa" (id, nombre_i18n, descripcion_i18n) VALUES
(1, '{"es": "Autónomo", "en": "Self-employed"}', '{"es": "Trabajador por cuenta propia", "en": "Self-employed worker"}'),
(2, '{"es": "Microempresa (1-10 empleados)", "en": "Microenterprise (1-10 employees)"}', '{"es": "Empresa con menos de 10 empleados", "en": "Company with less than 10 employees"}'),
(3, '{"es": "Pequeña empresa (11-50 empleados)", "en": "Small enterprise (11-50 employees)"}', '{"es": "Empresa entre 11 y 50 empleados", "en": "Company between 11 and 50 employees"}'),
(4, '{"es": "Mediana empresa (51-250 empleados)", "en": "Medium enterprise (51-250 employees)"}', '{"es": "Empresa entre 51 y 250 empleados", "en": "Company between 51 and 250 employees"}'),
(5, '{"es": "Gran empresa (+250 empleados)", "en": "Large enterprise (+250 employees)"}', '{"es": "Empresa con más de 250 empleados", "en": "Company with more than 250 employees"}');

-- Poblar SectorEmpresa
INSERT INTO "SectorEmpresa" (id, nombre_i18n) VALUES
(1, '{"es": "Tecnología", "en": "Technology"}'),
(2, '{"es": "Comercio", "en": "Commerce"}'),
(3, '{"es": "Servicios", "en": "Services"}'),
(4, '{"es": "Manufactura", "en": "Manufacturing"}'),
(5, '{"es": "Agricultura", "en": "Agriculture"}'),
(6, '{"es": "Energía renovable", "en": "Renewable energy"}');

-- Poblar Ubicacion (algunas provincias principales)
INSERT INTO "Ubicacion" (id, provincia_i18n, "comAutonoma_i18n", "pais_i18n") VALUES
(1, '{"es": "Madrid", "en": "Madrid"}', '{"es": "Comunidad de Madrid", "en": "Community of Madrid"}', '{"es": "España", "en": "Spain"}'),
(2, '{"es": "Barcelona", "en": "Barcelona"}', '{"es": "Cataluña", "en": "Catalonia"}', '{"es": "España", "en": "Spain"}'),
(3, '{"es": "Valencia", "en": "Valencia"}', '{"es": "Comunidad Valenciana", "en": "Valencian Community"}', '{"es": "España", "en": "Spain"}'),
(4, '{"es": "Sevilla", "en": "Seville"}', '{"es": "Andalucía", "en": "Andalusia"}', '{"es": "España", "en": "Spain"}'),
(5, '{"es": "Bilbao", "en": "Bilbao"}', '{"es": "País Vasco", "en": "Basque Country"}', '{"es": "España", "en": "Spain"}');

-- Poblar NecesidadCliente
INSERT INTO "NecesidadCliente" (id, nombre_i18n) VALUES
(1, '{"es": "Financiación I+D+i", "en": "R&D+i Financing"}'),
(2, '{"es": "Digitalización", "en": "Digitalization"}'),
(3, '{"es": "Transición energética", "en": "Energy transition"}'),
(4, '{"es": "Internacionalización", "en": "Internationalization"}'),
(5, '{"es": "Formación y talento", "en": "Training and talent"}'),
(6, '{"es": "Mejora de procesos", "en": "Process improvement"}');

-- Poblar AmbitoInteres
INSERT INTO "AmbitoInteres" (id, nombre_i18n) VALUES
(1, '{"es": "Innovación", "en": "Innovation"}'),
(2, '{"es": "Energía", "en": "Energy"}'),
(3, '{"es": "Medio ambiente", "en": "Environment"}'),
(4, '{"es": "Social", "en": "Social"}'),
(5, '{"es": "Económico", "en": "Economic"}'),
(6, '{"es": "Digital", "en": "Digital"}');

-- Poblar PlazoCarga
INSERT INTO "PlazoCarga" (id, nombre_i18n) VALUES
(1, '{"es": "Memorias técnicas", "en": "Technical reports"}'),
(2, '{"es": "Justificación económica", "en": "Economic justification"}'),
(3, '{"es": "Documentación administrativa", "en": "Administrative documentation"}'),
(4, '{"es": "Seguimiento de proyecto", "en": "Project monitoring"}'),
(5, '{"es": "Auditorías externas", "en": "External audits"}');

-- Resetear las secuencias de autoincremento para que empiecen después de los datos insertados
SELECT setval('"TamanoEmpresa_id_seq"', 5);
SELECT setval('"SectorEmpresa_id_seq"', 6);
SELECT setval('"Ubicacion_id_seq"', 5);
SELECT setval('"NecesidadCliente_id_seq"', 6);
SELECT setval('"AmbitoInteres_id_seq"', 6);
SELECT setval('"PlazoCarga_id_seq"', 5); 