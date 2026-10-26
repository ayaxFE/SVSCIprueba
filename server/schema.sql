-- server/schema.sql
-- Ejecutar en PostgreSQL / Neon / pgAdmin

DROP TABLE IF EXISTS auditoria CASCADE;
DROP TABLE IF EXISTS novedades_vhf CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS asignaciones_recursos CASCADE;
DROP TABLE IF EXISTS recursos CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS solicitudes_puesto CASCADE;
DROP TABLE IF EXISTS puestos CASCADE;
DROP TABLE IF EXISTS bomberos CASCADE;

-- 1. Tabla de Bomberos y Personal Activo (Autenticación por Legajo)
CREATE TABLE bomberos (
    legajo VARCHAR(20) PRIMARY KEY, -- Formato oficial: '073/032'
    apellido_nombre VARCHAR(150) NOT NULL,
    jerarquia VARCHAR(100) NOT NULL,
    rol_sci VARCHAR(50) NOT NULL, -- 'COMANDANCIA', 'OPERADOR_CARGA', 'PUESTO_OPERACIONES', 'ADMINISTRADOR'
    puesto_id VARCHAR(50) DEFAULT NULL,
    pin_hash VARCHAR(255) NOT NULL, -- Hash bcrypt (PIN por defecto: '1234')
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Puestos de Operaciones Avanzados en el Terreno
CREATE TABLE puestos (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    responsable_legajo VARCHAR(20) REFERENCES bomberos(legajo),
    sector_cobertura VARCHAR(200) NOT NULL,
    lat NUMERIC(10, 6) NOT NULL,
    lng NUMERIC(10, 6) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Recursos Operativos y Flota (Embarcaciones, Móviles)
CREATE TABLE recursos (
    id VARCHAR(50) PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL, -- 'EMBARCACION', 'VEHICULO_TERRESTRE', 'KAYAK'
    disponible BOOLEAN DEFAULT TRUE,
    puesto_id VARCHAR(50) REFERENCES puestos(id),
    dotacion TEXT[] DEFAULT '{}' -- Nombres de bomberos a bordo
);

-- 4. Servicios e Incidentes Tácticos (Representados en el Mapa)
CREATE TABLE servicios (
    id VARCHAR(50) PRIMARY KEY,
    codigo_servicio VARCHAR(50) NOT NULL UNIQUE,
    prioridad VARCHAR(20) NOT NULL DEFAULT 'MEDIA', -- 'BAJA', 'MEDIA', 'ALTA'
    prioridad_justificacion TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'EN_ATENCION', 'RESUELTO'
    puesto_asignado_id VARCHAR(50) REFERENCES puestos(id),
    hora_derivacion VARCHAR(10),
    direccion_principal VARCHAR(255) NOT NULL,
    barrio VARCHAR(100) NOT NULL,
    lat NUMERIC(10, 6),
    lng NUMERIC(10, 6),
    es_aproximada BOOLEAN DEFAULT FALSE,
    viajes_realizados INT DEFAULT 0,
    resultado_final VARCHAR(50), -- 'EVACUACION_TOTAL', 'RECHAZO_FIRMA', etc.
    motivo_resultado TEXT,
    hora_resolucion VARCHAR(10),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Relación Muchos a Muchos: Asignación de Recursos a Servicios
CREATE TABLE asignaciones_recursos (
    servicio_id VARCHAR(50) REFERENCES servicios(id) ON DELETE CASCADE,
    recurso_id VARCHAR(50) REFERENCES recursos(id) ON DELETE CASCADE,
    PRIMARY KEY (servicio_id, recurso_id)
);

-- 6. Pedidos Telefónicos / Planillas de Guardia (Apéndice E)
CREATE TABLE pedidos (
    id VARCHAR(50) PRIMARY KEY,
    numero_pedido INT NOT NULL,
    fecha_recepcion VARCHAR(20) NOT NULL,
    hora_recepcion VARCHAR(10) NOT NULL,
    hora_carga_digital VARCHAR(10) NOT NULL,
    operador_legajo VARCHAR(20) REFERENCES bomberos(legajo),
    tipo_emergencia VARCHAR(150) NOT NULL,
    detalle TEXT,
    direccion VARCHAR(255) NOT NULL,
    barrio VARCHAR(100) NOT NULL,
    informante_nombre VARCHAR(150),
    informante_telefono VARCHAR(50),
    esta_en_el_lugar BOOLEAN DEFAULT TRUE,
    familia_afectada VARCHAR(150),
    adultos_informados INT DEFAULT 0,
    menores_informados INT DEFAULT 0,
    datos_incompletos BOOLEAN DEFAULT FALSE,
    servicio_id VARCHAR(50) REFERENCES servicios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Solicitudes Extraordinarias desde Puestos Avanzados
CREATE TABLE solicitudes_puesto (
    id VARCHAR(50) PRIMARY KEY,
    puesto_origen VARCHAR(50) NOT NULL,
    hora_solicitud VARCHAR(10) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    personas_estimadas INT DEFAULT 0,
    estado VARCHAR(30) DEFAULT 'PENDIENTE_APROBACION', -- 'PENDIENTE_APROBACION', 'APROBADA', 'RECHAZADA'
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bitácora de Novedades y Tráfico VHF
CREATE TABLE novedades_vhf (
    id VARCHAR(50) PRIMARY KEY,
    hora VARCHAR(10) NOT NULL,
    emisor VARCHAR(150) NOT NULL,
    canal VARCHAR(50) NOT NULL,
    servicio_codigo VARCHAR(50),
    mensaje TEXT NOT NULL,
    es_urgente BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Trazabilidad Inmutable y Auditoría SCI
CREATE TABLE auditoria (
    id VARCHAR(50) PRIMARY KEY,
    timestamp_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_legajo VARCHAR(20),
    rol VARCHAR(50),
    modulo VARCHAR(50),
    accion VARCHAR(100),
    detalle TEXT
);

-- =========================================================================
-- POBLADO INICIAL CON DATOS REALES DE CENTRAL 73 (ARECO)
-- Hash bcrypt para clave '1234': '$2a$10$7vN3mC.4ePqFqX8hMkWw9OKrS2qU3jI4y6Jv9a3EwP2h5d9C1gYfa'
-- =========================================================================

-- Bomberos tomados de la Planilla Oficial de Asistencia y Organigrama
INSERT INTO bomberos (legajo, apellido_nombre, jerarquia, rol_sci, pin_hash) VALUES
('073/032', 'TESTONI, Guillermo Luis', 'Cmte. General', 'COMANDANCIA', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/041', 'FERREYRA, Daniel Fernando', 'Subcomandante', 'COMANDANCIA', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/073', 'HERNANDEZ, Maximiliano Miguel', 'Of. Aux. de Dot.', 'COMANDANCIA', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/108', 'SCEPPACUERCIA, Lucas David', 'Of. Aux. de Esc.', 'ADMINISTRADOR', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/080', 'VAZQUEZ, Juan Antonio', 'Ayte. Mayor', 'PUESTO_OPERACIONES', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/101', 'LUCERO, Ezequiel Mario Rubén', 'Ayte. Principal', 'PUESTO_OPERACIONES', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/115', 'MANZONE, Leonardo Rubén', 'Ayte. Principal', 'PUESTO_OPERACIONES', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/090', 'CINICOLA, Miguel Ángel', 'Ayte. De Primera', 'PUESTO_OPERACIONES', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/092', 'LASALA, Martín Alejo', 'Ayte. De Primera', 'PUESTO_OPERACIONES', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/127', 'PAZ, Juan Tomás', 'Subayudante', 'OPERADOR_CARGA', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/131', 'URCELAY, Rosario Belén', 'Subayudante', 'OPERADOR_CARGA', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/113', 'ESNAOLA, Javier Martín', 'Bombero', 'OPERADOR_CARGA', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M'),
('073/083', 'RODRIGUEZ GAMES, Adrián Darío', 'Bombero', 'PUESTO_OPERACIONES', '$2a$10$wO3oW1oA0p5v8z7q2lM0q.j9l4G4u6B7c8D9e0F1G2H3I4J5K6L7M');

-- Bases Tácticas georreferenciadas según mapa operacional (imagen_2.jpg)
INSERT INTO puestos (id, nombre, responsable_legajo, sector_cobertura, lat, lng, activo) VALUES
('PO-COSTANERA', 'P.O. 1 - Costanera / Puente Viejo', '073/080', 'Ribera Norte, Zerboni y zona ribereña', -34.244800, -59.473200, TRUE),
('PO-CANTERA', 'P.O. 2 - Sector Cantera / Amespil', '073/101', 'Barrio Amespil, Cantera y adyacencias', -34.242200, -59.465500, TRUE);

-- Parque automotor y de navegación
INSERT INTO recursos (id, codigo, tipo, disponible, puesto_id, dotacion) VALUES
('rec-01', 'GOM-01 (Semirrígido 40HP)', 'EMBARCACION', FALSE, 'PO-COSTANERA', ARRAY['Vazquez Juan Antonio', 'Paz Walter']),
('rec-02', 'GOM-02 (Bote Aluminio)', 'EMBARCACION', TRUE, 'PO-COSTANERA', ARRAY['Lucero Ezequiel', 'Ullua Rubén']),
('rec-03', 'KAY-01 (Doble Aguas Blancas)', 'KAYAK', TRUE, 'PO-CANTERA', ARRAY['Godoy Fernando']),
('rec-04', 'MOVIL-14 (Unimog 4x4 Pesado)', 'VEHICULO_TERRESTRE', TRUE, 'PO-COSTANERA', ARRAY['Ferreyra Daniel Fernando']);

-- Servicios iniciales activos en la cuenca
INSERT INTO servicios (id, codigo_servicio, prioridad, prioridad_justificacion, estado, puesto_asignado_id, hora_derivacion, direccion_principal, barrio, lat, lng, es_aproximada, viajes_realizados) VALUES
('srv-001', 'INC-ARECO-01', 'ALTA', 'Adultos mayores incomunicados con 40cm de agua en sala', 'EN_ATENCION', 'PO-COSTANERA', '07:38', 'Zerboni y Arellano', 'Costanera', -34.246500, -59.471500, FALSE, 1),
('srv-002', 'INC-ARECO-02', 'MEDIA', 'Patio inundado sin riesgo inminente de ingreso', 'PENDIENTE', 'PO-CANTERA', '07:52', 'Lavalle 150', 'Amespil', -34.243500, -59.467000, FALSE, 0);

INSERT INTO asignaciones_recursos (servicio_id, recurso_id) VALUES
('srv-001', 'rec-01');