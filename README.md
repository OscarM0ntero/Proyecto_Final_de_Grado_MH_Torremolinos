# M&H Torremolinos – Self-managed Apartment Web Platform

![Hero](img/hero.png)

A self-hosted, multilingual web platform designed to manage a real tourist apartment in Torremolinos, Spain. It features a synchronized booking calendar, content management tools, and a modern interface for both customers and administrators.

---

## Overview

> This project was entirely designed, developed, configured, and hosted by myself, from backend to frontend and server deployment.

M&H Torremolinos is a comprehensive solution for managing short-term apartment rentals. The platform enables autonomous administration through a full-featured back office and a customer-facing front office, integrating calendar synchronization with platforms like Booking.com and Airbnb.

### Key Features

- Responsive and multilingual front-end interface (Spanish, English, German and Norwegian, selected automatically from the visitor's browser)
- **Instant online booking paid by card through Stripe**, with automatic confirmation and no manual approval step
- **Guest self-service without accounts**: every booking is reachable through a private link sent by email, where the guest can review it and cancel it if the rate allows
- Two rate types per booking: refundable and non-refundable (discounted)
- Real-time calendar synchronization with Booking and Airbnb, plus iCal feeds published for them to consume
- Custom CMS to manage text and image content
- Reservation management through a dedicated back office
- Automated email notifications throughout the booking process
- Hosted on a local server with HTTPS and secure configurations

---

## Technology Stack

| Layer        | Technology                            |
|--------------|---------------------------------------|
| Frontend     | Angular 19 (SSR), Angular Material, PrimeNG |
| Backend      | Node.js 20 with Express               |
| Payments     | Stripe Checkout + webhooks            |
| Database     | MySQL                                 |
| Hosting      | Self-hosted with Ubuntu               |
| Web Server   | Apache2 with SSL                      |
| Domain       | mhtorremolinos.com (Hostalia)         |
| Versioning   | Git + GitHub                          |

---

## Front Office

### Homepage

![Home 1](img/front-home-1.png)
![Home 2](img/front-home-2.png)

### The Apartment

![Apartment 1](img/front-apartment-1.png)
![Apartment 2](img/front-apartment-2.png)

### Gallery

![Gallery 1](img/front-gallery-1.png)
![Gallery 2](img/front-gallery-2.png)

### Location

![Location 1](img/front-location-1.png)
![Location 2](img/front-location-2.png)

### Booking Form

![Booking 1](img/front-booking-1.png)
![Booking 2](img/front-booking-2.png)

### Contact Page

![Contact 1](img/front-contact-1.png)
![Contact 2](img/front-contact-2.png)

### Booking Management (private link)

Guests do not create an account. When a booking is paid, the confirmation email includes a private
link (`/reserva/<token>`) where the guest can review the booking, check the payment status and, if
the rate is refundable and the cancellation window is still open, cancel it and be refunded
automatically.

### Mobile Version

![Front Mobile 1](img/front-mobile-1.png)
![Front Mobile 2](img/front-mobile-2.png)

---

## Back Office

### Calendar Management

![Calendar 1](img/back-calendar-1.png)
![Calendar 2](img/back-calendar-2.png)

### Bookings Dashboard

![Bookings 1](img/back-bookings-1.png)
![Bookings 2](img/back-bookings-2.png)

### User Management

![Users 1](img/back-users-1.png)
![Users 2](img/back-users-2.png)

### Text Management

![Texts 1](img/back-texts-1.png)
![Texts 2](img/back-texts-2.png)

### Image Management

![Images 1](img/back-images-1.png)
![Images 2](img/back-images-2.png)

### Mobile Version

![Back Mobile 1](img/back-mobile-1.png)
![Back Mobile 2](img/back-mobile-2.png)
![Back Mobile 3](img/back-mobile-3.png)

---

## Automated Email System

The platform includes an automated email service to streamline communication with guests. All emails
share a common template (`src/api/utils/emailTemplate.ts`). They are sent at the following stages:

- When a payment succeeds: booking confirmation for the guest (including the private management
  link and the check-in/check-out times) and a notification for the administrators
- When a booking is cancelled, either by the guest through the private link or by an administrator,
  including the refunded amount
- When a payment succeeds but the dates were taken in the meantime: an apology explaining the
  automatic refund
- To recover administrator credentials

Example emails:

![Email 1](img/email-confirmation.png)
![Email 2](img/email-reservation.png)
![Email 3](img/email-request.png)

---

## Booking Flow

1. The guest picks dates in the calendar. Days that are unavailable, and gaps shorter than the
   configured minimum stay, cannot be selected.
2. They choose a rate (refundable or non-refundable) and fill in their details.
3. The server **recalculates the price and re-checks availability** — the amount is never taken from
   the browser — creates the booking as `Pendiente` and redirects to Stripe Checkout.
4. Stripe notifies the webhook when the payment succeeds. The server checks the dates are *still*
   free, then marks them as booked, sets the booking to `Confirmada` / `pagado` and sends the emails.
   If another guest took the dates while the payment was in progress, the charge is **refunded
   automatically** and both parties are notified.
5. Days are **not** blocked while a booking is `Pendiente`, so an abandoned checkout never locks the
   calendar.

---

## Configuration

### Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `SECRET` | JWT signing key, also used to derive the opaque iCal event UIDs |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | SMTP account used to send emails |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA verification for the booking and contact forms |
| `STRIPE_SECRET_KEY` | Stripe API key. **If it is missing the site falls back to the old bank-transfer flow** |
| `STRIPE_WEBHOOK_SECRET` | Signature verification for the Stripe webhook |
| `BASE_URL` | Public site URL, used for Stripe redirects and the links inside emails |

The Stripe webhook must be registered at `<BASE_URL>/api/stripe/webhook`, subscribed to
`checkout.session.completed` **and** `checkout.session.expired`.

### Settings editable from the back office

Stored in the `configuracion` table and editable at `/admin/configuracion`: base nightly price,
minimum stay, pet surcharge, non-refundable discount, free-cancellation window, and the check-in and
check-out times. Only the keys the public site needs are readable without authentication; the rest
require an administrator token.

### Database migrations

Apply in this order on a fresh database, after the main dump:

```
migration_tarifa.sql          rate type and discount per booking
migration_cancelable.sql      per-day flag for days that only allow the non-refundable rate
migration_precio_base.sql     configurable base nightly price
migration_resenas.sql         reviews
migration_otros_cambios.sql   guest data snapshot stored on each booking
migration_min_noches.sql      minimum stay
migration_stripe.sql          payment columns and the private access token
migration_pais_idioma.sql     guest language and country
migration_horarios.sql        check-in / check-out times
```

---

## Background Jobs

These run inside the Node server (`src/server.ts`), independently of incoming requests:

| Job | Interval | Purpose |
|---|---|---|
| `sincronizarIcal` | 15 min | Imports the Booking and Airbnb calendars |
| `reconciliarReservasPendientes` | 15 min | Asks Stripe about bookings still pending. Confirms those that were actually paid (recovering webhooks lost while the server was down) and cancels the ones whose checkout expired |
| `asegurarCalendario` | 6 h | Guarantees every day exists up to 12 months ahead, filling any gap left while the server was stopped, and assigns the base price to days created without one |

`asegurarCalendario` supersedes the old `extender_calendario` MySQL event, which only ever inserted
*today + 12 months* and therefore left permanent holes whenever it failed to run on a given day.

---

## iCal Feeds

| Endpoint | Contents |
|---|---|
| `/api/ical/export` | Confirmed bookings **and** days closed manually by an administrator |
| `/api/ical/export/reservas` | Confirmed bookings only |

Both are public so Booking and Airbnb can poll them. Event UIDs are an irreversible hash of the
booking id and the server secret: the private access token is deliberately **never** published,
since it would let anyone read and cancel the booking.

---

## Author

Developed by **Oscar Montero**  
[oscarmh02@gmail.com](mailto:oscarmh02@gmail.com)

---

## Production Website

The website is fully deployed and operational as the official booking and management platform for the M&H Torremolinos tourist apartment.

Visit the platform at: [https://mhtorremolinos.com](https://mhtorremolinos.com)
