CREATE SCHEMA IF NOT EXISTS eyg;

DROP TABLE IF EXISTS eyg.serie;
DROP TABLE IF EXISTS eyg.rutina_diaria;
DROP TABLE IF EXISTS eyg.sesion_rutina;
DROP TABLE IF EXISTS eyg.ejercicio_en_rutina;
DROP TABLE IF EXISTS eyg.categoria;
DROP TABLE IF EXISTS eyg.rutina;
DROP TABLE IF EXISTS eyg.ejercicio;
DROP TABLE IF EXISTS eyg.usuario;

CREATE TABLE eyg.usuario (
    correo varchar(255) PRIMARY KEY,
    nombre varchar(255) NOT NULL,
    hash_con varchar(255) NOT NULL,
    altura integer CHECK (altura >= 0), -- centimetros
    peso real CHECK (peso >= 0), -- kilos
    edad integer CHECK (edad >= 0),
    dificultad  int CHECK (dificultad BETWEEN 1 AND 5),
    sesiones_semanales int CHECK (sesiones_semanales > 0),
    es_admin boolean NOT NULL DEFAULT false
);

CREATE TABLE eyg.ejercicio (
    nombre varchar(255) PRIMARY KEY,
    series int CHECK (series > 0),
    descripcion text,
    minutos int CHECK (minutos >= 0),
    link_video varchar(500)
);

CREATE TABLE eyg.categoria (
    nombre varchar(255) NOT NULL,
    ejercicio varchar(255) NOT NULL,
    CONSTRAINT categoria_pk PRIMARY KEY (nombre, ejercicio),
    CONSTRAINT categoria_ejercicio_fk FOREIGN KEY (ejercicio)
        REFERENCES eyg.ejercicio(nombre) ON DELETE CASCADE
);

CREATE TABLE eyg.rutina (
    nombre varchar(255) NOT NULL,
    usuario varchar(255) NOT NULL,
    dificultad int CHECK (dificultad BETWEEN 1 AND 5),
    descripcion text,
    num_realizada int NOT NULL DEFAULT 0 CHECK (num_realizada >= 0), -- veces que se ha realizado desde que se creó
    CONSTRAINT rutina_pk PRIMARY KEY (nombre, usuario),
    CONSTRAINT rutina_usuario_fk FOREIGN KEY (usuario)
        REFERENCES eyg.usuario(correo) ON DELETE CASCADE
);

CREATE TABLE eyg.ejercicio_en_rutina (
    ejercicio varchar(255) NOT NULL,
    rutina varchar(255) NOT NULL,
    usuario varchar(255) NOT NULL,
    series  int NOT NULL DEFAULT 0 CHECK (series >= 0), -- aún no implementado (valor opcional que reescibe las series de ejercicio)
    orden int NOT NULL, -- posición del ejercicio en la rutina
    CONSTRAINT ejercicio_en_rutina_pk PRIMARY KEY (ejercicio, rutina, usuario),
    CONSTRAINT eer_ejercicio_fk FOREIGN KEY (ejercicio)
        REFERENCES eyg.ejercicio(nombre) ON DELETE CASCADE,
    CONSTRAINT eer_rutina_fk FOREIGN KEY (rutina, usuario)
        REFERENCES eyg.rutina(nombre, usuario) ON DELETE CASCADE
);

CREATE TABLE eyg.sesion_rutina (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    terminada boolean NOT NULL DEFAULT FALSE,
    rutina varchar(255) NOT NULL,
    rutina_usr varchar(255) NOT NULL, -- dueño de la rutina (puede ser "ADMIN")
    usuario varchar(255) NOT NULL, -- quien realiza la sesión
    CONSTRAINT sesion_rutina_fk FOREIGN KEY (rutina, rutina_usr)
        REFERENCES eyg.rutina(nombre, usuario) ON DELETE CASCADE,
    CONSTRAINT sesion_usuario_fk FOREIGN KEY (usuario)
        REFERENCES eyg.usuario(correo) ON DELETE CASCADE
);

CREATE TABLE eyg.serie (
    sesion_id bigint NOT NULL,
    ejercicio varchar(255) NOT NULL,
    orden int NOT NULL, -- nº de serie dentro del ejercicio
    repeticiones int NOT NULL CHECK (repeticiones > 0),
    peso real,
    CONSTRAINT serie_pk PRIMARY KEY (sesion_id, ejercicio, orden),
    CONSTRAINT serie_sesion_fk FOREIGN KEY (sesion_id)
        REFERENCES eyg.sesion_rutina(id) ON DELETE CASCADE,
    CONSTRAINT serie_ejercicio_fk FOREIGN KEY (ejercicio)
        REFERENCES eyg.ejercicio(nombre) ON DELETE CASCADE
);

CREATE TABLE eyg.rutina_diaria (
    fecha date NOT NULL DEFAULT CURRENT_DATE PRIMARY KEY,
    rutina varchar(255) NOT NULL,
    rutina_usr varchar(255) NOT NULL DEFAULT 'ADMIN', -- el dueño de la rutina va a ser siempre "ADMIN"
    num_realizada int DEFAULT 0 CHECK (num_realizada >= 0), -- veces que se ha realizado ese día
    CONSTRAINT rutina_diaria_fk FOREIGN KEY (rutina, rutina_usr)
        REFERENCES eyg.rutina(nombre, usuario) ON DELETE CASCADE,
    CONSTRAINT rutina_diaria_admin_ck CHECK (rutina_usr = 'ADMIN')
);

-- Índices sobre claves foráneas / consultas frecuentes
CREATE INDEX idx_categoria_ejercicio ON eyg.categoria(ejercicio);
CREATE INDEX idx_rutina_usuario ON eyg.rutina(usuario);
CREATE INDEX idx_eer_rutina_orden ON eyg.ejercicio_en_rutina(rutina, usuario, orden);
CREATE INDEX idx_sesion_rutina ON eyg.sesion_rutina(rutina, rutina_usr);
CREATE INDEX idx_rutina_diaria ON eyg.rutina_diaria(rutina, rutina_usr);
CREATE INDEX idx_sesion_usuario_fecha ON eyg.sesion_rutina(usuario, fecha DESC);
CREATE INDEX idx_serie_ejercicio ON eyg.serie(ejercicio);