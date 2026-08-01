-- Migración: pagos con Stripe + token de acceso a la reserva
-- Nuevas columnas en `reservas`:
--   stripe_checkout_session_id  id de la sesión de Stripe Checkout
--   stripe_payment_intent_id    id del PaymentIntent (necesario para reembolsos)
--   estado_pago                 pendiente | pagado | reembolsado
--   importe_pagado              importe realmente cobrado por Stripe
--   token_acceso                token aleatorio para el enlace de gestión de la reserva

ALTER TABLE `reservas`
  ADD COLUMN `stripe_checkout_session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `estado_reserva`,
  ADD COLUMN `stripe_payment_intent_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `stripe_checkout_session_id`,
  ADD COLUMN `estado_pago` enum('pendiente','pagado','reembolsado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente' AFTER `stripe_payment_intent_id`,
  ADD COLUMN `importe_pagado` decimal(10,2) DEFAULT NULL AFTER `estado_pago`,
  ADD COLUMN `token_acceso` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `importe_pagado`,
  ADD UNIQUE KEY `token_acceso` (`token_acceso`);

-- Token de acceso para las reservas ya existentes
UPDATE `reservas` SET `token_acceso` = SHA2(CONCAT(UUID(), RAND(), id_reserva), 256) WHERE `token_acceso` IS NULL;

-- Las reservas históricas confirmadas/finalizadas se consideran pagadas (por transferencia)
UPDATE `reservas` SET `estado_pago` = 'pagado', `importe_pagado` = `precio_total`
WHERE `estado_reserva` IN ('Confirmada', 'Finalizada') AND `estado_pago` = 'pendiente';
