// Textos de los emails al huésped, en su idioma.
//
// Se guarda `cliente_idioma` al reservar (el idioma con el que navegó la web) precisamente
// para escribirle en su lengua. Los correos dirigidos a los administradores siguen en
// español y no pasan por aquí.
//
// No se reutilizan los JSON de i18n de Angular: son textos distintos y esos ficheros viven
// en los assets del frontend, con rutas que cambian entre desarrollo y el build de producción.

export type Idioma = 'es' | 'en' | 'de' | 'no';

interface TextosEmail {
    // Comunes
    hola: (nombre: string) => string;
    checkIn: string;
    checkOut: string;
    huespedes: string;
    desdeHora: (hora: string) => string;
    antesHora: (hora: string) => string;
    verReserva: string;
    guardaEmail: string;
    dudas: string;

    // Confirmación
    asuntoConfirmada: string;
    confirmadaTitulo: string;
    confirmadaIntro: string;
    pagado: string;
    politicaNoCancelable: string;
    politicaCancelable: (dias: number) => string;
    hastaPronto: string;

    // Conflicto de fechas
    asuntoConflicto: string;
    conflictoTexto: (inicio: string, fin: string) => string;
    conflictoReembolso: (importe: string) => string;
    conflictoOtrasFechas: string;

    // Cancelación
    asuntoCancelada: string;
    canceladaTexto: string;
    reembolsado: string;
    importePagado: string;
    gastosCancelacion: (pct: string) => string;
    reembolsoTexto: (importe: string) => string;
    esperamosVerte: string;

    // Reenvío de datos
    asuntoDatos: string;
    datosIntro: string;
    total: string;
}

const es: TextosEmail = {
    hola: n => `Hola ${n},`,
    checkIn: 'Entrada',
    checkOut: 'Salida',
    huespedes: 'Huéspedes',
    desdeHora: h => `a partir de las ${h}`,
    antesHora: h => `antes de las ${h}`,
    verReserva: 'Ver o gestionar mi reserva',
    guardaEmail: 'Guarda este correo: el enlace de arriba es tu acceso privado a la reserva.',
    dudas: 'Si tienes cualquier duda antes de tu llegada, escríbenos a',
    asuntoConfirmada: 'Reserva confirmada — M&H Torremolinos',
    confirmadaTitulo: '¡Tu reserva está confirmada!',
    confirmadaIntro: 'gracias por tu pago. Estaremos encantados de recibirte.',
    pagado: 'Pagado',
    politicaNoCancelable: '⚠ Tarifa no cancelable: esta reserva no admite cancelación ni reembolso.',
    politicaCancelable: d => `✓ Cancelable hasta ${d} días antes de la entrada: se devuelve el importe menos los gastos de cancelación.`,
    hastaPronto: '¡Te esperamos!',
    asuntoConflicto: 'No hemos podido completar tu reserva — M&H Torremolinos',
    conflictoTexto: (i, f) => `Lamentablemente, las fechas que elegiste (${i} → ${f}) fueron reservadas por otro huésped mientras se procesaba tu pago.`,
    conflictoReembolso: imp => `<strong>Te hemos devuelto los ${imp}€ íntegros</strong> al mismo método de pago. Según tu banco, pueden tardar unos días en aparecer.`,
    conflictoOtrasFechas: 'Nos encantaría alojarte en otras fechas: consulta la disponibilidad en',
    asuntoCancelada: 'Reserva cancelada — M&H Torremolinos',
    canceladaTexto: 'Tu reserva ha sido cancelada.',
    reembolsado: 'Reembolsado',
    importePagado: 'Importe pagado',
    gastosCancelacion: pct => `Gastos de cancelación (${pct}%)`,
    reembolsoTexto: imp => `<strong>Se te han devuelto ${imp}€</strong> al mismo método de pago. Según tu banco, pueden tardar unos días en aparecer.`,
    esperamosVerte: 'Esperamos poder recibirte en otra ocasión.',
    asuntoDatos: 'Tu reserva — M&H Torremolinos',
    datosIntro: 'estos son los datos de tu reserva con nosotros.',
    total: 'Total'
};

const en: TextosEmail = {
    hola: n => `Hi ${n},`,
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    huespedes: 'Guests',
    desdeHora: h => `from ${h}`,
    antesHora: h => `before ${h}`,
    verReserva: 'View or manage my booking',
    guardaEmail: 'Keep this email: the link above is your private access to the booking.',
    dudas: 'If you have any questions before your arrival, contact us at',
    asuntoConfirmada: 'Booking confirmed — M&H Torremolinos',
    confirmadaTitulo: 'Your booking is confirmed!',
    confirmadaIntro: 'thank you for your payment — we are delighted to welcome you.',
    pagado: 'Paid',
    politicaNoCancelable: '⚠ Non-refundable rate: this booking cannot be cancelled or refunded.',
    politicaCancelable: d => `✓ Cancellable up to ${d} days before check-in: refunded minus the cancellation fee.`,
    hastaPronto: 'We look forward to seeing you soon!',
    asuntoConflicto: 'Booking could not be completed — M&H Torremolinos',
    conflictoTexto: (i, f) => `Unfortunately, the dates you selected (${i} → ${f}) were booked by another guest while your payment was being processed.`,
    conflictoReembolso: imp => `<strong>Your payment of ${imp}€ has been refunded in full</strong> to your original payment method. Depending on your bank, it may take a few days to appear.`,
    conflictoOtrasFechas: 'We would love to host you on different dates — check our availability at',
    asuntoCancelada: 'Booking cancelled — M&H Torremolinos',
    canceladaTexto: 'Your booking has been cancelled.',
    reembolsado: 'Refunded',
    importePagado: 'Amount paid',
    gastosCancelacion: pct => `Cancellation fee (${pct}%)`,
    reembolsoTexto: imp => `<strong>${imp}€ has been refunded</strong> to your original payment method. Depending on your bank, it may take a few days to appear.`,
    esperamosVerte: 'We hope to welcome you another time.',
    asuntoDatos: 'Your booking — M&H Torremolinos',
    datosIntro: 'here are the details of your booking with us.',
    total: 'Total'
};

const de: TextosEmail = {
    hola: n => `Hallo ${n},`,
    checkIn: 'Anreise',
    checkOut: 'Abreise',
    huespedes: 'Gäste',
    desdeHora: h => `ab ${h} Uhr`,
    antesHora: h => `bis ${h} Uhr`,
    verReserva: 'Buchung ansehen oder verwalten',
    guardaEmail: 'Bewahren Sie diese E-Mail auf: Der Link oben ist Ihr privater Zugang zur Buchung.',
    dudas: 'Bei Fragen vor Ihrer Anreise schreiben Sie uns an',
    asuntoConfirmada: 'Buchung bestätigt — M&H Torremolinos',
    confirmadaTitulo: 'Ihre Buchung ist bestätigt!',
    confirmadaIntro: 'vielen Dank für Ihre Zahlung. Wir freuen uns auf Sie.',
    pagado: 'Bezahlt',
    politicaNoCancelable: '⚠ Nicht stornierbarer Tarif: Diese Buchung kann weder storniert noch erstattet werden.',
    politicaCancelable: d => `✓ Stornierbar bis ${d} Tage vor der Anreise: Erstattung abzüglich der Stornogebühr.`,
    hastaPronto: 'Wir freuen uns auf Ihren Besuch!',
    asuntoConflicto: 'Ihre Buchung konnte nicht abgeschlossen werden — M&H Torremolinos',
    conflictoTexto: (i, f) => `Leider wurden die von Ihnen gewählten Daten (${i} → ${f}) von einem anderen Gast gebucht, während Ihre Zahlung verarbeitet wurde.`,
    conflictoReembolso: imp => `<strong>Ihre Zahlung von ${imp}€ wurde vollständig erstattet</strong> auf Ihr ursprüngliches Zahlungsmittel. Je nach Bank kann es einige Tage dauern.`,
    conflictoOtrasFechas: 'Wir würden Sie gerne an anderen Tagen empfangen — sehen Sie die Verfügbarkeit unter',
    asuntoCancelada: 'Buchung storniert — M&H Torremolinos',
    canceladaTexto: 'Ihre Buchung wurde storniert.',
    reembolsado: 'Erstattet',
    importePagado: 'Gezahlter Betrag',
    gastosCancelacion: pct => `Stornogebühr (${pct}%)`,
    reembolsoTexto: imp => `<strong>${imp}€ wurden erstattet</strong> auf Ihr ursprüngliches Zahlungsmittel. Je nach Bank kann es einige Tage dauern.`,
    esperamosVerte: 'Wir hoffen, Sie ein anderes Mal begrüßen zu dürfen.',
    asuntoDatos: 'Ihre Buchung — M&H Torremolinos',
    datosIntro: 'hier sind die Daten Ihrer Buchung bei uns.',
    total: 'Gesamt'
};

const no: TextosEmail = {
    hola: n => `Hei ${n},`,
    checkIn: 'Innsjekking',
    checkOut: 'Utsjekking',
    huespedes: 'Gjester',
    desdeHora: h => `fra kl. ${h}`,
    antesHora: h => `før kl. ${h}`,
    verReserva: 'Se eller administrer bestillingen',
    guardaEmail: 'Ta vare på denne e-posten: lenken over er din private tilgang til bestillingen.',
    dudas: 'Har du spørsmål før ankomst, skriv til oss på',
    asuntoConfirmada: 'Bestilling bekreftet — M&H Torremolinos',
    confirmadaTitulo: 'Bestillingen din er bekreftet!',
    confirmadaIntro: 'takk for betalingen. Vi gleder oss til å ta imot deg.',
    pagado: 'Betalt',
    politicaNoCancelable: '⚠ Ikke-refunderbar pris: denne bestillingen kan ikke kanselleres eller refunderes.',
    politicaCancelable: d => `✓ Kan kanselleres inntil ${d} dager før ankomst: refusjon minus avbestillingsgebyret.`,
    hastaPronto: 'Vi gleder oss til å se deg!',
    asuntoConflicto: 'Vi kunne ikke fullføre bestillingen din — M&H Torremolinos',
    conflictoTexto: (i, f) => `Dessverre ble datoene du valgte (${i} → ${f}) bestilt av en annen gjest mens betalingen din ble behandlet.`,
    conflictoReembolso: imp => `<strong>Betalingen din på ${imp}€ er refundert i sin helhet</strong> til samme betalingsmåte. Avhengig av banken kan det ta noen dager.`,
    conflictoOtrasFechas: 'Vi vil gjerne ta imot deg på andre datoer — se tilgjengeligheten på',
    asuntoCancelada: 'Bestilling kansellert — M&H Torremolinos',
    canceladaTexto: 'Bestillingen din er kansellert.',
    reembolsado: 'Refundert',
    importePagado: 'Betalt beløp',
    gastosCancelacion: pct => `Avbestillingsgebyr (${pct}%)`,
    reembolsoTexto: imp => `<strong>${imp}€ er refundert</strong> til samme betalingsmåte. Avhengig av banken kan det ta noen dager.`,
    esperamosVerte: 'Vi håper å kunne ta imot deg en annen gang.',
    asuntoDatos: 'Bestillingen din — M&H Torremolinos',
    datosIntro: 'her er detaljene for bestillingen din hos oss.',
    total: 'Totalt'
};

const IDIOMAS: Record<Idioma, TextosEmail> = { es, en, de, no };

// Devuelve los textos del idioma del huésped; si no se guardó o no está soportado, inglés.
export function textosEmail(idioma?: string | null): TextosEmail {
    return IDIOMAS[(idioma || '') as Idioma] || IDIOMAS.en;
}
