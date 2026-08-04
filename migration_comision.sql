-- Migración: gastos de cancelación no reembolsables.
--
-- Al cancelar una reserva Stripe NO devuelve su comisión, así que el titular la perdería
-- íntegra. Se retiene un porcentaje del importe, que se informa antes de pagar.
--
--   configuracion.comision_cancelacion  → porcentaje que se retiene (editable en /admin)
--   reservas.comision_cancelacion_pct   → copia del porcentaje vigente al reservar, para que
--                                          cambiarlo después no altere reservas ya hechas
--   reservas.comision_stripe            → comisión real cobrada por Stripe (dato de gestión,
--                                          no interviene en el cálculo del reembolso)

INSERT INTO configuracion (clave, valor, descripcion)
VALUES ('comision_cancelacion', '2.00', 'Porcentaje del importe que se retiene al cancelar (gastos de cancelación)')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

ALTER TABLE `reservas`
  ADD COLUMN `comision_cancelacion_pct` decimal(5,2) NOT NULL DEFAULT '0.00' AFTER `descuento_aplicado`,
  ADD COLUMN `comision_stripe` decimal(10,2) DEFAULT NULL AFTER `importe_pagado`;

-- La descripción de dias_cancelacion seguía diciendo "sin coste", que dejó de ser cierto
-- al introducirse los gastos de cancelación. Solo la ve el administrador.
UPDATE configuracion
SET descripcion = 'Días antes de la llegada hasta los que se admite la cancelación (se retienen los gastos de cancelación)'
WHERE clave = 'dias_cancelacion';
