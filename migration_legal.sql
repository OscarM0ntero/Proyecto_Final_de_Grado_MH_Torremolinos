-- Contenido de la seccion /legal (6 apartados x 4 idiomas).
--
-- Vive en la tabla 'contenido', no en el codigo, porque es editable desde el panel.
-- mhtorremolinos.sql es anterior a la reescritura legal y aun contiene el texto viejo
-- (mencionaba la senal del 30% ya eliminada), asi que este archivo es la version buena:
-- aplicarlo DESPUES del dump al montar una base nueva.
--
-- Re-ejecutable: sobrescribe los textos sin duplicar filas.

INSERT INTO contenido (id_contenido, titulo_es, titulo_en, titulo_de, titulo_no, texto_es, texto_en, texto_de, texto_no, pagina)
VALUES (20, '1. AVISO LEGAL', '1. LEGAL NOTICE', '1. RECHTLICHER HINWEIS', '1. JURIDISK MERKNAD',
        '<p>En cumplimiento del deber de información de la <strong>Ley 34/2002</strong>, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan los datos identificativos del titular de este sitio web:</p>
<p><strong>Titular:</strong> María Remedios Hinojosa Vilchez (persona física)</p>
<p><strong>NIF:</strong> [PENDIENTE DE COMPLETAR]</p>
<p><strong>Domicilio:</strong> Calle Loma de los Riscos 117, 29620 Torremolinos, Málaga, España</p>
<p><strong>Correo electrónico:</strong> info&#64;mhtorremolinos.com</p>
<p><strong>Teléfono:</strong> +34 630 901 664</p>
<p><strong>Número de Registro de Turismo de Andalucía:</strong> VFT/MA/75354</p>
<p><strong>Número de Registro Nacional:</strong> ESFCTU0000290210003008960000000000000000VFT/MA/753544</p>
<p>La actividad se ejerce como <strong>persona física</strong>, no como sociedad mercantil.</p>
<p><strong>Objeto del sitio</strong></p>
<p>Este sitio web tiene por finalidad ofrecer información y gestionar la reserva y el pago en línea de <strong>una única vivienda con fines turísticos</strong> situada en Torremolinos (Málaga).</p>
<p><strong>Condición de usuario</strong></p>
<p>El acceso y uso de este sitio atribuye la condición de usuario e implica la aceptación de las condiciones recogidas en esta página. El usuario se compromete a hacer un uso lícito del sitio y a no introducir datos falsos o de terceros sin autorización.</p>
<p>El titular procura mantener la información actualizada y libre de errores, pero no puede garantizar la disponibilidad ininterrumpida del sitio ni la ausencia de fallos técnicos.</p>',
        '<p>In compliance with the information duty set out in <strong>Spanish Act 34/2002</strong> on Information Society Services and Electronic Commerce (LSSI-CE), the details of the owner of this website are provided below:</p>
<p><strong>Owner:</strong> María Remedios Hinojosa Vilchez (private individual)</p>
<p><strong>Tax ID (NIF):</strong> [TO BE COMPLETED]</p>
<p><strong>Address:</strong> Calle Loma de los Riscos 117, 29620 Torremolinos, Málaga, Spain</p>
<p><strong>Email:</strong> info&#64;mhtorremolinos.com</p>
<p><strong>Phone:</strong> +34 630 901 664</p>
<p><strong>Andalusian Tourism Registry number:</strong> VFT/MA/75354</p>
<p><strong>National Registry number:</strong> ESFCTU0000290210003008960000000000000000VFT/MA/753544</p>
<p>This activity is carried out by a <strong>private individual</strong>, not by a company.</p>
<p><strong>Purpose of this website</strong></p>
<p>This website provides information about, and manages the online booking and payment of, <strong>a single holiday rental property</strong> located in Torremolinos (Málaga, Spain).</p>
<p><strong>User status</strong></p>
<p>Accessing and using this site grants you the status of user and implies acceptance of the terms set out on this page. You undertake to use the site lawfully and not to submit false data or third-party data without authorisation.</p>
<p>The owner endeavours to keep the information accurate and up to date, but cannot guarantee uninterrupted availability of the site or the absence of technical faults.</p>',
        '<p>In Erfüllung der Informationspflicht nach dem <strong>spanischen Gesetz 34/2002</strong> über Dienste der Informationsgesellschaft und den elektronischen Geschäftsverkehr (LSSI-CE) werden nachstehend die Angaben zur Inhaberin dieser Website gemacht:</p>
<p><strong>Inhaberin:</strong> María Remedios Hinojosa Vilchez (natürliche Person)</p>
<p><strong>Steuernummer (NIF):</strong> [NOCH ZU ERGÄNZEN]</p>
<p><strong>Anschrift:</strong> Calle Loma de los Riscos 117, 29620 Torremolinos, Málaga, Spanien</p>
<p><strong>E-Mail:</strong> info&#64;mhtorremolinos.com</p>
<p><strong>Telefon:</strong> +34 630 901 664</p>
<p><strong>Nummer im andalusischen Tourismusregister:</strong> VFT/MA/75354</p>
<p><strong>Nummer im nationalen Register:</strong> ESFCTU0000290210003008960000000000000000VFT/MA/753544</p>
<p>Die Tätigkeit wird von einer <strong>natürlichen Person</strong> ausgeübt, nicht von einer Handelsgesellschaft.</p>
<p><strong>Zweck der Website</strong></p>
<p>Diese Website informiert über <strong>eine einzige Ferienwohnung</strong> in Torremolinos (Málaga) und dient der Online-Buchung und -Bezahlung dieser Unterkunft.</p>
<p><strong>Nutzerstellung</strong></p>
<p>Der Zugriff auf diese Website und ihre Nutzung begründen die Stellung als Nutzer und setzen die Annahme der auf dieser Seite genannten Bedingungen voraus. Der Nutzer verpflichtet sich zur rechtmäßigen Nutzung und dazu, keine falschen Daten oder Daten Dritter ohne Berechtigung anzugeben.</p>
<p>Die Inhaberin bemüht sich, die Informationen aktuell und fehlerfrei zu halten, kann jedoch weder eine ununterbrochene Verfügbarkeit der Website noch die Abwesenheit technischer Störungen garantieren.</p>',
        '<p>I samsvar med opplysningsplikten i den spanske <strong>loven 34/2002</strong> om informasjonssamfunnstjenester og elektronisk handel (LSSI-CE) oppgis følgende opplysninger om eieren av dette nettstedet:</p>
<p><strong>Eier:</strong> María Remedios Hinojosa Vilchez (privatperson)</p>
<p><strong>Skattenummer (NIF):</strong> [MÅ FYLLES UT]</p>
<p><strong>Adresse:</strong> Calle Loma de los Riscos 117, 29620 Torremolinos, Málaga, Spania</p>
<p><strong>E-post:</strong> info&#64;mhtorremolinos.com</p>
<p><strong>Telefon:</strong> +34 630 901 664</p>
<p><strong>Nummer i turistregisteret i Andalusia:</strong> VFT/MA/75354</p>
<p><strong>Nummer i det nasjonale registeret:</strong> ESFCTU0000290210003008960000000000000000VFT/MA/753544</p>
<p>Virksomheten drives av en <strong>privatperson</strong>, ikke av et selskap.</p>
<p><strong>Formålet med nettstedet</strong></p>
<p>Dette nettstedet gir informasjon om, og håndterer bestilling og betaling på nett av, <strong>én enkelt feriebolig</strong> i Torremolinos (Málaga, Spania).</p>
<p><strong>Brukerstatus</strong></p>
<p>Tilgang til og bruk av dette nettstedet gir status som bruker og innebærer at du godtar vilkårene på denne siden. Du forplikter deg til å bruke nettstedet lovlig og til ikke å oppgi uriktige opplysninger eller opplysninger om andre uten samtykke.</p>
<p>Eieren tilstreber å holde informasjonen oppdatert og feilfri, men kan ikke garantere uavbrutt tilgjengelighet eller fravær av tekniske feil.</p>', 'legal')
ON DUPLICATE KEY UPDATE
  titulo_es=VALUES(titulo_es), titulo_en=VALUES(titulo_en), titulo_de=VALUES(titulo_de), titulo_no=VALUES(titulo_no),
  texto_es=VALUES(texto_es), texto_en=VALUES(texto_en), texto_de=VALUES(texto_de), texto_no=VALUES(texto_no),
  pagina=VALUES(pagina);

INSERT INTO contenido (id_contenido, titulo_es, titulo_en, titulo_de, titulo_no, texto_es, texto_en, texto_de, texto_no, pagina)
VALUES (21, '2. POLÍTICA DE PRIVACIDAD', '2. PRIVACY POLICY', '2. DATENSCHUTZRICHTLINIE', '2. PERSONVERNPOLICY',
        '<p><strong>Responsable del tratamiento</strong></p>
<p>María Remedios Hinojosa Vilchez · Calle Loma de los Riscos 117, 29620 Torremolinos (Málaga) · info&#64;mhtorremolinos.com</p>

<p><strong>Qué datos tratamos</strong></p>
<ul>
    <li><strong>Datos de la reserva:</strong> nombre y apellidos, correo electrónico, teléfono, número de huéspedes, fechas y las peticiones que indiques (cuna, mascota, nota adicional).</li>
    <li><strong>Idioma y país:</strong> el idioma con el que navegas y el país asociado al medio de pago, para comunicarnos contigo en tu lengua y con fines estadísticos.</li>
    <li><strong>Formulario de contacto:</strong> nombre, correo electrónico, teléfono y el mensaje que nos escribas.</li>
    <li><strong>Datos de navegación:</strong> únicamente si aceptas las cookies analíticas.</li>
</ul>
<p><strong>No tratamos ni almacenamos los datos de tu tarjeta.</strong> El pago se realiza íntegramente en una página segura de Stripe; nuestro servidor solo recibe la confirmación de que el cobro se ha realizado y el importe.</p>

<p><strong>Para qué los usamos y con qué legitimación</strong></p>
<ul>
    <li><strong>Gestionar tu reserva, cobrarla y enviarte los correos relativos a ella</strong> (confirmación, cancelación, reembolso): ejecución del contrato — art. 6.1.b del RGPD.</li>
    <li><strong>Responder a tus consultas</strong> enviadas por el formulario de contacto: tu consentimiento o la aplicación de medidas precontractuales — art. 6.1.a y 6.1.b.</li>
    <li><strong>Cumplir obligaciones legales</strong> (fiscales, contables y de registro de viajeros ante las autoridades competentes): art. 6.1.c.</li>
    <li><strong>Proteger los formularios frente a usos automatizados</strong> mediante Google reCAPTCHA: interés legítimo en la seguridad del sitio — art. 6.1.f.</li>
    <li><strong>Medir el uso del sitio</strong> con Google Analytics: únicamente con tu consentimiento — art. 6.1.a. Puedes retirarlo cuando quieras.</li>
</ul>

<p><strong>Cuánto tiempo los conservamos</strong></p>
<ul>
    <li>Datos de la reserva: durante la estancia y, después, durante los plazos de prescripción fiscal y contable aplicables (con carácter general, entre 4 y 6 años).</li>
    <li>Mensajes del formulario de contacto: el tiempo necesario para atenderlos y, como máximo, un año.</li>
    <li>Datos analíticos: hasta que retires tu consentimiento o caduquen las cookies.</li>
</ul>

<p><strong>A quién comunicamos tus datos</strong></p>
<p>No vendemos ni cedemos tus datos con fines comerciales. Para poder prestar el servicio intervienen los siguientes proveedores, que actúan como encargados del tratamiento:</p>
<ul>
    <li><strong>Stripe Payments Europe, Ltd.</strong> — procesamiento del pago con tarjeta y emisión del justificante.</li>
    <li><strong>Proveedor de correo electrónico</strong> — envío de los correos relativos a tu reserva.</li>
    <li><strong>Google Ireland Ltd.</strong> — reCAPTCHA (seguridad de los formularios) y, si lo aceptas, Google Analytics.</li>
</ul>
<p>Además, se comunicarán a las <strong>autoridades competentes</strong> los datos de viajeros exigidos por la normativa de hospedaje, y a la Administración los datos exigidos por la normativa fiscal.</p>
<p>Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En tal caso, las transferencias se amparan en las <strong>cláusulas contractuales tipo</strong> de la Comisión Europea o en decisiones de adecuación.</p>

<p><strong>Tus derechos</strong></p>
<p>Puedes ejercer en cualquier momento los derechos de <strong>acceso, rectificación, supresión, limitación, oposición y portabilidad</strong>, así como <strong>retirar el consentimiento</strong> que hayas prestado, sin que ello afecte a la licitud del tratamiento anterior.</p>
<p>Para ejercerlos, escribe a <strong>info&#64;mhtorremolinos.com</strong> indicando el derecho que deseas ejercer y adjuntando copia de un documento que acredite tu identidad.</p>
<p>Si consideras que no hemos atendido correctamente tu solicitud, puedes presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (C/ Jorge Juan 6, 28001 Madrid — <a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>

<p><strong>Decisiones automatizadas</strong></p>
<p>No se toman decisiones automatizadas ni se elabora ningún perfil con tus datos.</p>',
        '<p><strong>Data controller</strong></p>
<p>María Remedios Hinojosa Vilchez · Calle Loma de los Riscos 117, 29620 Torremolinos (Málaga), Spain · info&#64;mhtorremolinos.com</p>

<p><strong>What data we process</strong></p>
<ul>
    <li><strong>Booking details:</strong> first and last name, email address, phone number, number of guests, dates, and any requests you make (cot, pet, additional note).</li>
    <li><strong>Language and country:</strong> the language you browse in and the country associated with your payment method, so we can write to you in your language and for statistical purposes.</li>
    <li><strong>Contact form:</strong> name, email address, phone number and the message you send us.</li>
    <li><strong>Browsing data:</strong> only if you accept analytics cookies.</li>
</ul>
<p><strong>We never process or store your card details.</strong> Payment takes place entirely on a secure Stripe page; our server only receives confirmation that the charge succeeded, and the amount.</p>

<p><strong>Why we use it and on what legal basis</strong></p>
<ul>
    <li><strong>Managing your booking, charging it and sending you the related emails</strong> (confirmation, cancellation, refund): performance of a contract — Art. 6(1)(b) GDPR.</li>
    <li><strong>Answering enquiries</strong> sent through the contact form: your consent or pre-contractual steps — Art. 6(1)(a) and 6(1)(b).</li>
    <li><strong>Complying with legal obligations</strong> (tax, accounting and the registration of guests with the competent authorities): Art. 6(1)(c).</li>
    <li><strong>Protecting the forms against automated abuse</strong> through Google reCAPTCHA: legitimate interest in the security of the site — Art. 6(1)(f).</li>
    <li><strong>Measuring how the site is used</strong> with Google Analytics: only with your consent — Art. 6(1)(a). You may withdraw it at any time.</li>
</ul>

<p><strong>How long we keep it</strong></p>
<ul>
    <li>Booking data: for the duration of the stay and thereafter for the applicable tax and accounting limitation periods (generally between 4 and 6 years).</li>
    <li>Contact form messages: for as long as needed to deal with them, and no longer than one year.</li>
    <li>Analytics data: until you withdraw your consent or the cookies expire.</li>
</ul>

<p><strong>Who we share it with</strong></p>
<p>We do not sell or share your data for commercial purposes. The following providers act as data processors so the service can be delivered:</p>
<ul>
    <li><strong>Stripe Payments Europe, Ltd.</strong> — card payment processing and issuing the payment record.</li>
    <li><strong>Email service provider</strong> — sending the emails relating to your booking.</li>
    <li><strong>Google Ireland Ltd.</strong> — reCAPTCHA (form security) and, if you accept, Google Analytics.</li>
</ul>
<p>In addition, the guest details required by Spanish accommodation regulations are reported to the <strong>competent authorities</strong>, and tax-related data to the tax administration.</p>
<p>Some of these providers may process data outside the European Economic Area. Where that happens, transfers rely on the European Commission\'s <strong>standard contractual clauses</strong> or on adequacy decisions.</p>

<p><strong>Your rights</strong></p>
<p>You may at any time exercise your rights of <strong>access, rectification, erasure, restriction, objection and portability</strong>, and <strong>withdraw any consent</strong> you have given, without affecting the lawfulness of processing carried out beforehand.</p>
<p>To do so, write to <strong>info&#64;mhtorremolinos.com</strong> stating which right you wish to exercise and enclosing a copy of a document proving your identity.</p>
<p>If you believe your request has not been handled properly, you may lodge a complaint with the <strong>Spanish Data Protection Agency</strong> (C/ Jorge Juan 6, 28001 Madrid — <a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>

<p><strong>Automated decisions</strong></p>
<p>No automated decision-making or profiling is carried out with your data.</p>',
        '<p><strong>Verantwortliche</strong></p>
<p>María Remedios Hinojosa Vilchez · Calle Loma de los Riscos 117, 29620 Torremolinos (Málaga), Spanien · info&#64;mhtorremolinos.com</p>

<p><strong>Welche Daten wir verarbeiten</strong></p>
<ul>
    <li><strong>Buchungsdaten:</strong> Vor- und Nachname, E-Mail-Adresse, Telefonnummer, Anzahl der Gäste, Daten des Aufenthalts sowie Ihre Wünsche (Babybett, Haustier, zusätzliche Anmerkung).</li>
    <li><strong>Sprache und Land:</strong> die Sprache, in der Sie die Website nutzen, und das mit dem Zahlungsmittel verbundene Land, damit wir Ihnen in Ihrer Sprache schreiben können, sowie zu statistischen Zwecken.</li>
    <li><strong>Kontaktformular:</strong> Name, E-Mail-Adresse, Telefonnummer und Ihre Nachricht.</li>
    <li><strong>Nutzungsdaten:</strong> nur wenn Sie Analyse-Cookies akzeptieren.</li>
</ul>
<p><strong>Ihre Kartendaten werden weder verarbeitet noch gespeichert.</strong> Die Zahlung erfolgt vollständig auf einer gesicherten Seite von Stripe; unser Server erhält lediglich die Bestätigung, dass die Zahlung erfolgt ist, sowie den Betrag.</p>

<p><strong>Zwecke und Rechtsgrundlagen</strong></p>
<ul>
    <li><strong>Verwaltung und Abrechnung Ihrer Buchung sowie Versand der zugehörigen E-Mails</strong> (Bestätigung, Stornierung, Erstattung): Vertragserfüllung — Art. 6 Abs. 1 lit. b DSGVO.</li>
    <li><strong>Beantwortung Ihrer Anfragen</strong> über das Kontaktformular: Ihre Einwilligung bzw. vorvertragliche Maßnahmen — Art. 6 Abs. 1 lit. a und b.</li>
    <li><strong>Erfüllung gesetzlicher Pflichten</strong> (steuerlich, buchhalterisch und Meldung der Gäste an die zuständigen Behörden): Art. 6 Abs. 1 lit. c.</li>
    <li><strong>Schutz der Formulare vor automatisierten Zugriffen</strong> mittels Google reCAPTCHA: berechtigtes Interesse an der Sicherheit der Website — Art. 6 Abs. 1 lit. f.</li>
    <li><strong>Messung der Nutzung der Website</strong> mit Google Analytics: ausschließlich mit Ihrer Einwilligung — Art. 6 Abs. 1 lit. a. Sie können sie jederzeit widerrufen.</li>
</ul>

<p><strong>Speicherdauer</strong></p>
<ul>
    <li>Buchungsdaten: für die Dauer des Aufenthalts und anschließend für die geltenden steuer- und handelsrechtlichen Aufbewahrungsfristen (in der Regel 4 bis 6 Jahre).</li>
    <li>Nachrichten aus dem Kontaktformular: solange es zur Bearbeitung erforderlich ist, höchstens ein Jahr.</li>
    <li>Analysedaten: bis zum Widerruf Ihrer Einwilligung oder zum Ablauf der Cookies.</li>
</ul>

<p><strong>Empfänger</strong></p>
<p>Wir verkaufen Ihre Daten nicht und geben sie nicht zu Werbezwecken weiter. Zur Erbringung der Leistung sind folgende Auftragsverarbeiter eingebunden:</p>
<ul>
    <li><strong>Stripe Payments Europe, Ltd.</strong> — Abwicklung der Kartenzahlung und Ausstellung des Zahlungsbelegs.</li>
    <li><strong>E-Mail-Anbieter</strong> — Versand der Nachrichten zu Ihrer Buchung.</li>
    <li><strong>Google Ireland Ltd.</strong> — reCAPTCHA (Sicherheit der Formulare) und, sofern Sie zustimmen, Google Analytics.</li>
</ul>
<p>Darüber hinaus werden die nach spanischem Beherbergungsrecht erforderlichen Gästedaten an die <strong>zuständigen Behörden</strong> und die steuerlich erforderlichen Daten an die Finanzverwaltung übermittelt.</p>
<p>Einige dieser Anbieter können Daten außerhalb des Europäischen Wirtschaftsraums verarbeiten. In diesem Fall stützen sich die Übermittlungen auf die <strong>Standardvertragsklauseln</strong> der Europäischen Kommission oder auf Angemessenheitsbeschlüsse.</p>

<p><strong>Ihre Rechte</strong></p>
<p>Sie können jederzeit Ihre Rechte auf <strong>Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Datenübertragbarkeit</strong> ausüben sowie eine erteilte <strong>Einwilligung widerrufen</strong>, ohne dass die Rechtmäßigkeit der zuvor erfolgten Verarbeitung berührt wird.</p>
<p>Schreiben Sie dazu an <strong>info&#64;mhtorremolinos.com</strong>, geben Sie das gewünschte Recht an und fügen Sie eine Kopie eines Ausweisdokuments bei.</p>
<p>Sind Sie der Ansicht, dass Ihr Anliegen nicht ordnungsgemäß bearbeitet wurde, können Sie Beschwerde bei der <strong>spanischen Datenschutzbehörde</strong> einlegen (C/ Jorge Juan 6, 28001 Madrid — <a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>

<p><strong>Automatisierte Entscheidungen</strong></p>
<p>Es findet keine automatisierte Entscheidungsfindung und kein Profiling statt.</p>',
        '<p><strong>Behandlingsansvarlig</strong></p>
<p>María Remedios Hinojosa Vilchez · Calle Loma de los Riscos 117, 29620 Torremolinos (Málaga), Spania · info&#64;mhtorremolinos.com</p>

<p><strong>Hvilke opplysninger vi behandler</strong></p>
<ul>
    <li><strong>Bestillingsopplysninger:</strong> for- og etternavn, e-postadresse, telefonnummer, antall gjester, datoer og eventuelle ønsker du oppgir (barneseng, kjæledyr, tilleggsmerknad).</li>
    <li><strong>Språk og land:</strong> språket du bruker på nettstedet og landet knyttet til betalingsmiddelet, slik at vi kan skrive til deg på ditt språk, samt til statistiske formål.</li>
    <li><strong>Kontaktskjema:</strong> navn, e-postadresse, telefonnummer og meldingen du sender oss.</li>
    <li><strong>Bruksdata:</strong> bare dersom du godtar analysekapsler.</li>
</ul>
<p><strong>Vi behandler eller lagrer aldri kortopplysningene dine.</strong> Betalingen skjer i sin helhet på en sikker side hos Stripe; serveren vår mottar kun bekreftelse på at betalingen er gjennomført, samt beløpet.</p>

<p><strong>Formål og behandlingsgrunnlag</strong></p>
<ul>
    <li><strong>Håndtere bestillingen, kreve betaling og sende deg tilhørende e-poster</strong> (bekreftelse, kansellering, refusjon): oppfyllelse av avtale — art. 6 nr. 1 bokstav b i GDPR.</li>
    <li><strong>Besvare henvendelser</strong> sendt via kontaktskjemaet: ditt samtykke eller tiltak før avtaleinngåelse — art. 6 nr. 1 bokstav a og b.</li>
    <li><strong>Oppfylle rettslige forpliktelser</strong> (skatt, regnskap og registrering av gjester hos rette myndigheter): art. 6 nr. 1 bokstav c.</li>
    <li><strong>Beskytte skjemaene mot automatisert misbruk</strong> ved hjelp av Google reCAPTCHA: berettiget interesse i nettstedets sikkerhet — art. 6 nr. 1 bokstav f.</li>
    <li><strong>Måle bruken av nettstedet</strong> med Google Analytics: kun med ditt samtykke — art. 6 nr. 1 bokstav a. Du kan trekke det tilbake når som helst.</li>
</ul>

<p><strong>Hvor lenge vi lagrer opplysningene</strong></p>
<ul>
    <li>Bestillingsopplysninger: gjennom oppholdet og deretter i de gjeldende skatte- og regnskapsmessige foreldelsesfristene (normalt mellom 4 og 6 år).</li>
    <li>Meldinger fra kontaktskjemaet: så lenge det er nødvendig for å besvare dem, og høyst ett år.</li>
    <li>Analysedata: til du trekker tilbake samtykket eller informasjonskapslene utløper.</li>
</ul>

<p><strong>Hvem vi deler opplysningene med</strong></p>
<p>Vi selger ikke opplysningene dine og deler dem ikke for kommersielle formål. Følgende leverandører opptrer som databehandlere for at tjenesten skal kunne leveres:</p>
<ul>
    <li><strong>Stripe Payments Europe, Ltd.</strong> — behandling av kortbetalingen og utstedelse av betalingsbekreftelse.</li>
    <li><strong>E-postleverandør</strong> — utsending av e-poster om bestillingen din.</li>
    <li><strong>Google Ireland Ltd.</strong> — reCAPTCHA (sikkerhet i skjemaene) og, dersom du godtar, Google Analytics.</li>
</ul>
<p>I tillegg meldes gjesteopplysningene som kreves etter spansk overnattingsregelverk til <strong>rette myndigheter</strong>, og skatteopplysninger til skattemyndighetene.</p>
<p>Enkelte av disse leverandørene kan behandle opplysninger utenfor EØS. I så fall bygger overføringene på Europakommisjonens <strong>standard personvernbestemmelser</strong> eller på tilstrekkelighetsbeslutninger.</p>

<p><strong>Dine rettigheter</strong></p>
<p>Du kan når som helst utøve retten til <strong>innsyn, retting, sletting, begrensning, innsigelse og dataportabilitet</strong>, samt <strong>trekke tilbake et samtykke</strong> du har gitt, uten at det påvirker lovligheten av behandlingen som er utført tidligere.</p>
<p>Skriv til <strong>info&#64;mhtorremolinos.com</strong>, oppgi hvilken rettighet du ønsker å utøve og legg ved kopi av legitimasjon.</p>
<p>Mener du at henvendelsen din ikke er behandlet riktig, kan du klage til det <strong>spanske datatilsynet</strong> (C/ Jorge Juan 6, 28001 Madrid — <a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>

<p><strong>Automatiserte avgjørelser</strong></p>
<p>Det treffes ingen automatiserte avgjørelser, og det utarbeides ingen profil av opplysningene dine.</p>', 'legal')
ON DUPLICATE KEY UPDATE
  titulo_es=VALUES(titulo_es), titulo_en=VALUES(titulo_en), titulo_de=VALUES(titulo_de), titulo_no=VALUES(titulo_no),
  texto_es=VALUES(texto_es), texto_en=VALUES(texto_en), texto_de=VALUES(texto_de), texto_no=VALUES(texto_no),
  pagina=VALUES(pagina);

INSERT INTO contenido (id_contenido, titulo_es, titulo_en, titulo_de, titulo_no, texto_es, texto_en, texto_de, texto_no, pagina)
VALUES (22, '3. POLÍTICA DE COOKIES', '3. COOKIES POLICY', '3. COOKIE-RICHTLINIE', '3. RETNINGSLINJER FOR INFORMASJONSKAPSLER',
        '<p>Una cookie es un pequeño archivo que un sitio web guarda en tu dispositivo. Este sitio utiliza las mínimas imprescindibles y, además, cookies de análisis que <strong>solo se activan si las aceptas</strong>.</p>

<p><strong>Cookies necesarias</strong> (no requieren consentimiento)</p>
<ul>
    <li><strong>Idioma:</strong> recuerda el idioma con el que navegas.</li>
    <li><strong>Preferencia de cookies:</strong> guarda si has aceptado o rechazado, para no volver a preguntarte.</li>
    <li><strong>Sesión de administración:</strong> mantiene identificado al administrador dentro del panel. No se genera en visitas normales.</li>
    <li><strong>Google reCAPTCHA:</strong> protege los formularios de reserva, contacto e inicio de sesión frente a envíos automatizados. No se emplea para publicidad ni para elaborar perfiles.</li>
</ul>

<p><strong>Cookies analíticas</strong> (requieren tu consentimiento)</p>
<ul>
    <li><strong>Google Analytics</strong> (<code>_ga</code>, <code>_ga_*</code>): permite saber cuántas personas visitan el sitio y qué páginas consultan, de forma agregada, para mejorarlo. Caducan a los dos años como máximo.</li>
</ul>
<p>Estas cookies <strong>no se cargan hasta que pulsas «Aceptar»</strong> en el aviso que aparece al entrar. Si pulsas «Rechazar», no se instalan y el sitio funciona con normalidad: rechazarlas no limita el acceso a ningún contenido ni impide reservar.</p>

<p><strong>Cómo cambiar tu decisión</strong></p>
<p>Puedes cambiar de opinión en cualquier momento borrando los datos de este sitio desde la configuración de tu navegador: al volver a entrar se te preguntará de nuevo. Desde el propio navegador también puedes bloquear o eliminar cualquier cookie ya instalada.</p>
<p>Más información sobre el tratamiento de datos por parte de Google en <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.</p>',
        '<p>A cookie is a small file that a website stores on your device. This site uses only the strictly necessary ones plus analytics cookies, which are <strong>only enabled if you accept them</strong>.</p>

<p><strong>Necessary cookies</strong> (no consent required)</p>
<ul>
    <li><strong>Language:</strong> remembers the language you browse in.</li>
    <li><strong>Cookie preference:</strong> stores whether you accepted or rejected, so you are not asked again.</li>
    <li><strong>Administration session:</strong> keeps the administrator signed in within the panel. It is not created during ordinary visits.</li>
    <li><strong>Google reCAPTCHA:</strong> protects the booking, contact and login forms against automated submissions. It is not used for advertising or profiling.</li>
</ul>

<p><strong>Analytics cookies</strong> (require your consent)</p>
<ul>
    <li><strong>Google Analytics</strong> (<code>_ga</code>, <code>_ga_*</code>): tells us, in aggregate, how many people visit the site and which pages they view, so we can improve it. They expire after two years at most.</li>
</ul>
<p>These cookies <strong>are not loaded until you press "Accept"</strong> in the notice shown when you arrive. If you press "Reject" they are not installed and the site works normally: rejecting them does not restrict access to any content and does not prevent you from booking.</p>

<p><strong>How to change your decision</strong></p>
<p>You can change your mind at any time by clearing this site\'s data in your browser settings: you will be asked again on your next visit. Your browser also lets you block or delete any cookie already installed.</p>
<p>More information about how Google processes data at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.</p>',
        '<p>Ein Cookie ist eine kleine Datei, die eine Website auf Ihrem Gerät speichert. Diese Website verwendet nur die unbedingt erforderlichen Cookies sowie Analyse-Cookies, die <strong>nur nach Ihrer Zustimmung</strong> aktiviert werden.</p>

<p><strong>Notwendige Cookies</strong> (keine Einwilligung erforderlich)</p>
<ul>
    <li><strong>Sprache:</strong> merkt sich die gewählte Sprache.</li>
    <li><strong>Cookie-Einstellung:</strong> speichert, ob Sie zugestimmt oder abgelehnt haben, damit Sie nicht erneut gefragt werden.</li>
    <li><strong>Verwaltungssitzung:</strong> hält die Administratorin im Verwaltungsbereich angemeldet. Bei gewöhnlichen Besuchen wird es nicht gesetzt.</li>
    <li><strong>Google reCAPTCHA:</strong> schützt die Buchungs-, Kontakt- und Anmeldeformulare vor automatisierten Einsendungen. Es wird nicht für Werbung oder Profiling verwendet.</li>
</ul>

<p><strong>Analyse-Cookies</strong> (Einwilligung erforderlich)</p>
<ul>
    <li><strong>Google Analytics</strong> (<code>_ga</code>, <code>_ga_*</code>): zeigt in aggregierter Form, wie viele Personen die Website besuchen und welche Seiten sie ansehen, damit wir sie verbessern können. Sie laufen nach höchstens zwei Jahren ab.</li>
</ul>
<p>Diese Cookies werden <strong>erst geladen, wenn Sie im Hinweis auf „Akzeptieren" klicken</strong>. Wenn Sie „Ablehnen" wählen, werden sie nicht gesetzt und die Website funktioniert normal: Eine Ablehnung schränkt weder den Zugang zu Inhalten ein noch verhindert sie eine Buchung.</p>

<p><strong>Ihre Entscheidung ändern</strong></p>
<p>Sie können Ihre Entscheidung jederzeit ändern, indem Sie die Daten dieser Website in den Einstellungen Ihres Browsers löschen: Beim nächsten Besuch werden Sie erneut gefragt. Über den Browser können Sie außerdem bereits gesetzte Cookies blockieren oder löschen.</p>
<p>Weitere Informationen zur Datenverarbeitung durch Google unter <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.</p>',
        '<p>En informasjonskapsel er en liten fil som et nettsted lagrer på enheten din. Dette nettstedet bruker kun de strengt nødvendige, i tillegg til analysekapsler som <strong>bare aktiveres hvis du godtar dem</strong>.</p>

<p><strong>Nødvendige informasjonskapsler</strong> (krever ikke samtykke)</p>
<ul>
    <li><strong>Språk:</strong> husker språket du bruker.</li>
    <li><strong>Samtykkevalg:</strong> lagrer om du har godtatt eller avslått, slik at du ikke blir spurt på nytt.</li>
    <li><strong>Administrasjonsøkt:</strong> holder administratoren innlogget i administrasjonspanelet. Den opprettes ikke ved vanlige besøk.</li>
    <li><strong>Google reCAPTCHA:</strong> beskytter bestillings-, kontakt- og innloggingsskjemaene mot automatiserte innsendinger. Brukes ikke til annonsering eller profilering.</li>
</ul>

<p><strong>Analysekapsler</strong> (krever ditt samtykke)</p>
<ul>
    <li><strong>Google Analytics</strong> (<code>_ga</code>, <code>_ga_*</code>): viser samlet hvor mange som besøker nettstedet og hvilke sider de ser på, slik at vi kan forbedre det. De utløper etter høyst to år.</li>
</ul>
<p>Disse kapslene <strong>lastes ikke før du trykker «Godta»</strong> i varselet som vises når du kommer inn. Trykker du «Avslå», settes de ikke, og nettstedet fungerer som normalt: å avslå begrenser ikke tilgangen til innhold og hindrer deg ikke i å bestille.</p>

<p><strong>Slik endrer du valget ditt</strong></p>
<p>Du kan ombestemme deg når som helst ved å slette dette nettstedets data i nettleserinnstillingene: neste gang du kommer inn, blir du spurt på nytt. Fra nettleseren kan du også blokkere eller slette kapsler som allerede er satt.</p>
<p>Mer informasjon om Googles behandling av opplysninger finner du på <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.</p>', 'legal')
ON DUPLICATE KEY UPDATE
  titulo_es=VALUES(titulo_es), titulo_en=VALUES(titulo_en), titulo_de=VALUES(titulo_de), titulo_no=VALUES(titulo_no),
  texto_es=VALUES(texto_es), texto_en=VALUES(texto_en), texto_de=VALUES(texto_de), texto_no=VALUES(texto_no),
  pagina=VALUES(pagina);

INSERT INTO contenido (id_contenido, titulo_es, titulo_en, titulo_de, titulo_no, texto_es, texto_en, texto_de, texto_no, pagina)
VALUES (23, '4. CONDICIONES DE RESERVA', '4. BOOKING CONDITIONS', '4. BUCHUNGSBEDINGUNGEN', '4. BESTILLINGSVILKÅR',
        '<p>Estas condiciones regulan la reserva de la vivienda con fines turísticos identificada en el Aviso Legal, ofrecida por María Remedios Hinojosa Vilchez. Al completar una reserva declaras haberlas leído y aceptado.</p>

<p><strong>1. La reserva</strong></p>
<ul>
    <li>Se trata de <strong>una única vivienda completa</strong>, no de habitaciones independientes.</li>
    <li>El número máximo de huéspedes es el que permite seleccionar el formulario de reserva y no puede superarse.</li>
    <li>La estancia mínima, las horas de entrada y salida y el suplemento por mascota son los que se muestran en el formulario en el momento de reservar y se recogen en el correo de confirmación.</li>
    <li>Debes ser <strong>mayor de edad</strong> y facilitar datos veraces. La persona que reserva es responsable de todos los ocupantes.</li>
</ul>

<p><strong>2. Precio y pago</strong></p>
<ul>
    <li>Los precios se indican <strong>en euros e incluyen los impuestos aplicables</strong>. El importe total, con los suplementos que correspondan, se muestra antes de pagar.</li>
    <li>La reserva se abona <strong>al 100% en el momento de reservar</strong>, con tarjeta, a través de la pasarela segura de <strong>Stripe</strong>. No se admiten pagos parciales ni señales.</li>
    <li>La reserva <strong>solo queda confirmada cuando el pago se completa correctamente</strong>. Hasta entonces las fechas siguen disponibles para otros clientes.</li>
    <li>Recibirás por correo electrónico la confirmación y un <strong>enlace privado</strong> desde el que consultar tu reserva. Stripe genera además un justificante del pago.</li>
</ul>

<p><strong>3. Tarifas y cancelación</strong></p>
<ul>
    <li><strong>Tarifa cancelable:</strong> puedes cancelar hasta el número de días antes de la entrada que se indique en el formulario y en tu confirmación. Se te devolverá el importe abonado <strong>menos los gastos de cancelación</strong>, cuyo porcentaje se indica en el formulario de reserva y cuyo importe exacto en euros se te muestra en el resumen <strong>antes de realizar el pago</strong>. El porcentaje aplicable queda fijado en el momento de reservar, de modo que cualquier cambio posterior no afecta a las reservas ya realizadas. Pasado ese plazo, o en caso de no presentarse, no procede devolución.</li>
    <li><strong>Tarifa no cancelable:</strong> se ofrece a precio reducido y <strong>no admite cancelación ni devolución</strong> en ningún momento.</li>
    <li>Para cancelar, utiliza el enlace privado que recibiste en el correo de confirmación, o escríbenos a info&#64;mhtorremolinos.com.</li>
    <li>Los reembolsos se realizan <strong>al mismo medio de pago</strong> empleado en la reserva. El abono depende de los plazos de tu entidad bancaria, habitualmente unos días hábiles.</li>
</ul>

<p><strong>4. Derecho de desistimiento</strong></p>
<p>De acuerdo con el <strong>artículo 103.l del Real Decreto Legislativo 1/2007</strong> (texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios), <strong>no resulta aplicable el derecho de desistimiento</strong> a los contratos de servicios de alojamiento para fines distintos del de servir de vivienda cuando se prevé una fecha o periodo de ejecución determinados. Se aplican, por tanto, las condiciones de cancelación descritas en el apartado anterior.</p>

<p><strong>5. Cancelación por parte del titular</strong></p>
<p>Si por causa de fuerza mayor, avería grave o por haberse ocupado esas fechas en otro canal de venta no fuera posible mantener la reserva, se te comunicará lo antes posible y se te <strong>devolverá íntegramente</strong> el importe abonado, sin que proceda ninguna otra indemnización.</p>

<p><strong>6. Normas de uso de la vivienda</strong></p>
<ul>
    <li>No está permitido <strong>fumar</strong> en el interior.</li>
    <li>No se permiten <strong>fiestas ni eventos</strong>, ni superar el número de huéspedes reservado.</li>
    <li>Se admiten <strong>mascotas</strong> indicándolo al reservar y abonando el suplemento correspondiente.</li>
    <li>Debe respetarse el descanso de los vecinos y las normas de la comunidad de propietarios.</li>
    <li>Los desperfectos causados en la vivienda o en su equipamiento serán por cuenta del huésped.</li>
</ul>
<p>El incumplimiento grave de estas normas faculta al titular para dar por finalizada la estancia sin derecho a devolución.</p>

<p><strong>7. Registro de viajeros</strong></p>
<p>La normativa española obliga a registrar a las personas alojadas y a comunicar sus datos identificativos a las autoridades competentes. A la llegada será necesario mostrar un <strong>documento de identidad o pasaporte</strong> en vigor de cada huésped mayor de edad.</p>',
        '<p>These terms govern the booking of the holiday rental property identified in the Legal Notice, offered by María Remedios Hinojosa Vilchez. By completing a booking you confirm that you have read and accepted them.</p>

<p><strong>1. The booking</strong></p>
<ul>
    <li>This is <strong>a single, entire property</strong>, not individual rooms.</li>
    <li>The maximum number of guests is the one the booking form allows you to select and may not be exceeded.</li>
    <li>The minimum stay, the check-in and check-out times and the pet supplement are those shown on the form at the time of booking and repeated in your confirmation email.</li>
    <li>You must be <strong>of legal age</strong> and provide accurate details. The person making the booking is responsible for all occupants.</li>
</ul>

<p><strong>2. Price and payment</strong></p>
<ul>
    <li>Prices are shown <strong>in euros and include applicable taxes</strong>. The total amount, including any supplements, is displayed before payment.</li>
    <li>The booking is paid <strong>in full at the time of booking</strong>, by card, through the secure <strong>Stripe</strong> gateway. Partial payments and deposits are not accepted.</li>
    <li>The booking is <strong>only confirmed once payment completes successfully</strong>. Until then the dates remain available to other guests.</li>
    <li>You will receive a confirmation email containing a <strong>private link</strong> where you can review your booking. Stripe also issues a payment record.</li>
</ul>

<p><strong>3. Rates and cancellation</strong></p>
<ul>
    <li><strong>Flexible rate:</strong> you may cancel up to the number of days before arrival stated on the form and in your confirmation. The amount paid will be refunded <strong>less the cancellation fee</strong>, whose percentage is stated on the booking form and whose exact amount in euros is shown in the summary <strong>before you pay</strong>. The applicable percentage is fixed at the time of booking, so any later change does not affect bookings already made. After that deadline, or in the event of a no-show, no refund is due.</li>
    <li><strong>Non-refundable rate:</strong> offered at a reduced price and <strong>does not allow cancellation or refund</strong> at any time.</li>
    <li>To cancel, use the private link you received in your confirmation email, or write to info&#64;mhtorremolinos.com.</li>
    <li>Refunds are issued <strong>to the same payment method</strong> used for the booking. The time it takes to appear depends on your bank, usually a few working days.</li>
</ul>

<p><strong>4. Right of withdrawal</strong></p>
<p>Under <strong>Article 103(l) of Spanish Royal Legislative Decree 1/2007</strong> (consolidated text of the General Act for the Protection of Consumers and Users), the <strong>right of withdrawal does not apply</strong> to contracts for accommodation services other than for residential purposes where the contract provides for a specific date or period of performance. The cancellation terms described above therefore apply.</p>

<p><strong>5. Cancellation by the owner</strong></p>
<p>If, due to force majeure, serious damage to the property or because those dates were taken through another sales channel, the booking cannot be honoured, you will be informed as soon as possible and the amount paid will be <strong>refunded in full</strong>, with no further compensation due.</p>

<p><strong>6. House rules</strong></p>
<ul>
    <li><strong>Smoking</strong> indoors is not permitted.</li>
    <li><strong>Parties and events</strong> are not permitted, nor is exceeding the number of guests booked.</li>
    <li><strong>Pets</strong> are welcome provided they are declared when booking and the corresponding supplement is paid.</li>
    <li>Neighbours\' rest and the rules of the building community must be respected.</li>
    <li>Any damage caused to the property or its contents is the guest\'s responsibility.</li>
</ul>
<p>Serious breach of these rules entitles the owner to terminate the stay with no right to a refund.</p>

<p><strong>7. Guest registration</strong></p>
<p>Spanish law requires guests to be registered and their identification details reported to the competent authorities. On arrival, each adult guest must present a valid <strong>identity document or passport</strong>.</p>',
        '<p>Diese Bedingungen regeln die Buchung der im Impressum genannten Ferienwohnung, angeboten von María Remedios Hinojosa Vilchez. Mit Abschluss einer Buchung bestätigen Sie, sie gelesen und akzeptiert zu haben.</p>

<p><strong>1. Die Buchung</strong></p>
<ul>
    <li>Es handelt sich um <strong>eine einzige, vollständige Wohnung</strong>, nicht um einzelne Zimmer.</li>
    <li>Die Höchstzahl der Gäste entspricht der im Buchungsformular auswählbaren Zahl und darf nicht überschritten werden.</li>
    <li>Mindestaufenthalt, An- und Abreisezeiten sowie der Zuschlag für Haustiere sind die im Formular zum Zeitpunkt der Buchung angezeigten und in der Bestätigungs-E-Mail wiederholten Angaben.</li>
    <li>Sie müssen <strong>volljährig</strong> sein und wahrheitsgemäße Angaben machen. Die buchende Person ist für alle Gäste verantwortlich.</li>
</ul>

<p><strong>2. Preis und Zahlung</strong></p>
<ul>
    <li>Die Preise verstehen sich <strong>in Euro einschließlich der anfallenden Steuern</strong>. Der Gesamtbetrag samt etwaiger Zuschläge wird vor der Zahlung angezeigt.</li>
    <li>Die Buchung wird <strong>zu 100 % im Moment der Buchung</strong> per Karte über den gesicherten Zahlungsdienst <strong>Stripe</strong> bezahlt. Teilzahlungen oder Anzahlungen sind nicht möglich.</li>
    <li>Die Buchung ist <strong>erst bestätigt, wenn die Zahlung erfolgreich abgeschlossen ist</strong>. Bis dahin bleiben die Daten für andere Gäste verfügbar.</li>
    <li>Sie erhalten eine Bestätigungs-E-Mail mit einem <strong>privaten Link</strong>, über den Sie Ihre Buchung einsehen können. Stripe stellt zusätzlich einen Zahlungsbeleg aus.</li>
</ul>

<p><strong>3. Tarife und Stornierung</strong></p>
<ul>
    <li><strong>Flexibler Tarif:</strong> Sie können bis zu der im Formular und in Ihrer Bestätigung angegebenen Anzahl von Tagen vor der Anreise stornieren. Der gezahlte Betrag wird <strong>abzüglich der Stornogebühr</strong> erstattet; deren Prozentsatz ist im Buchungsformular angegeben und der genaue Betrag in Euro wird Ihnen in der Zusammenfassung <strong>vor der Zahlung</strong> angezeigt. Der geltende Prozentsatz wird zum Zeitpunkt der Buchung festgelegt, sodass spätere Änderungen bereits getätigte Buchungen nicht betreffen. Nach Ablauf dieser Frist oder bei Nichtanreise besteht kein Anspruch auf Erstattung.</li>
    <li><strong>Nicht stornierbarer Tarif:</strong> wird zu einem reduzierten Preis angeboten und erlaubt <strong>zu keinem Zeitpunkt Stornierung oder Erstattung</strong>.</li>
    <li>Zum Stornieren nutzen Sie den privaten Link aus Ihrer Bestätigungs-E-Mail oder schreiben Sie an info&#64;mhtorremolinos.com.</li>
    <li>Erstattungen erfolgen <strong>auf dasselbe Zahlungsmittel</strong>, das bei der Buchung verwendet wurde. Die Gutschrift hängt von den Fristen Ihrer Bank ab, üblicherweise einige Werktage.</li>
</ul>

<p><strong>4. Widerrufsrecht</strong></p>
<p>Gemäß <strong>Artikel 103 lit. l des spanischen Königlichen Gesetzesdekrets 1/2007</strong> (Neufassung des Verbraucherschutzgesetzes) findet das <strong>Widerrufsrecht keine Anwendung</strong> auf Verträge über Beherbergungsleistungen zu anderen Zwecken als zu Wohnzwecken, wenn ein bestimmter Zeitpunkt oder Zeitraum der Leistung vorgesehen ist. Es gelten daher die oben beschriebenen Stornierungsbedingungen.</p>

<p><strong>5. Stornierung durch die Inhaberin</strong></p>
<p>Sollte die Buchung wegen höherer Gewalt, eines schweren Schadens an der Wohnung oder weil diese Daten über einen anderen Vertriebskanal belegt wurden nicht eingehalten werden können, werden Sie schnellstmöglich informiert und der gezahlte Betrag wird <strong>vollständig erstattet</strong>, ohne weitergehenden Entschädigungsanspruch.</p>

<p><strong>6. Hausordnung</strong></p>
<ul>
    <li><strong>Rauchen</strong> im Innenbereich ist nicht gestattet.</li>
    <li><strong>Partys und Veranstaltungen</strong> sind nicht gestattet, ebenso wenig das Überschreiten der gebuchten Gästezahl.</li>
    <li><strong>Haustiere</strong> sind willkommen, sofern sie bei der Buchung angegeben und der entsprechende Zuschlag entrichtet wird.</li>
    <li>Die Ruhe der Nachbarn und die Regeln der Eigentümergemeinschaft sind zu beachten.</li>
    <li>Schäden an der Wohnung oder deren Ausstattung gehen zulasten des Gastes.</li>
</ul>
<p>Bei schwerwiegendem Verstoß gegen diese Regeln ist die Inhaberin berechtigt, den Aufenthalt ohne Anspruch auf Erstattung zu beenden.</p>

<p><strong>7. Gästemeldung</strong></p>
<p>Das spanische Recht verpflichtet zur Registrierung der Gäste und zur Meldung ihrer Ausweisdaten an die zuständigen Behörden. Bei der Ankunft ist von jedem volljährigen Gast ein gültiges <strong>Ausweisdokument oder ein Reisepass</strong> vorzulegen.</p>',
        '<p>Disse vilkårene regulerer bestilling av ferieboligen som er angitt i den juridiske informasjonen, tilbudt av María Remedios Hinojosa Vilchez. Ved å fullføre en bestilling bekrefter du at du har lest og godtatt dem.</p>

<p><strong>1. Bestillingen</strong></p>
<ul>
    <li>Det dreier seg om <strong>én hel bolig</strong>, ikke enkeltrom.</li>
    <li>Høyeste antall gjester er det bestillingsskjemaet lar deg velge, og kan ikke overskrides.</li>
    <li>Minimumsopphold, inn- og utsjekkingstider og tillegg for kjæledyr er de som vises i skjemaet ved bestilling og gjentas i bekreftelses-e-posten.</li>
    <li>Du må være <strong>myndig</strong> og oppgi riktige opplysninger. Den som bestiller, er ansvarlig for alle gjestene.</li>
</ul>

<p><strong>2. Pris og betaling</strong></p>
<ul>
    <li>Prisene oppgis <strong>i euro og inkluderer gjeldende avgifter</strong>. Totalbeløpet, med eventuelle tillegg, vises før betaling.</li>
    <li>Bestillingen betales <strong>i sin helhet ved bestilling</strong>, med kort, gjennom den sikre betalingsløsningen til <strong>Stripe</strong>. Delbetaling eller depositum aksepteres ikke.</li>
    <li>Bestillingen er <strong>først bekreftet når betalingen er fullført</strong>. Fram til da er datoene fortsatt tilgjengelige for andre gjester.</li>
    <li>Du mottar en bekreftelse på e-post med en <strong>privat lenke</strong> der du kan se bestillingen din. Stripe utsteder i tillegg en betalingsbekreftelse.</li>
</ul>

<p><strong>3. Priser og kansellering</strong></p>
<ul>
    <li><strong>Fleksibel pris:</strong> du kan kansellere inntil det antallet dager før ankomst som er angitt i skjemaet og i bekreftelsen din. Beløpet du har betalt, refunderes <strong>minus avbestillingsgebyret</strong>, hvis prosentsats er angitt i bestillingsskjemaet og hvis nøyaktige beløp i euro vises i sammendraget <strong>før du betaler</strong>. Gjeldende prosentsats fastsettes ved bestilling, slik at senere endringer ikke påvirker bestillinger som allerede er gjort. Etter fristen, eller ved manglende ankomst, gis ingen refusjon.</li>
    <li><strong>Ikke-refunderbar pris:</strong> tilbys til redusert pris og gir <strong>ingen rett til kansellering eller refusjon</strong> på noe tidspunkt.</li>
    <li>For å kansellere bruker du den private lenken fra bekreftelses-e-posten, eller skriver til info&#64;mhtorremolinos.com.</li>
    <li>Refusjoner skjer <strong>til samme betalingsmåte</strong> som ble brukt ved bestillingen. Hvor lang tid det tar, avhenger av banken din, vanligvis noen virkedager.</li>
</ul>

<p><strong>4. Angrerett</strong></p>
<p>I henhold til <strong>artikkel 103 bokstav l i det spanske kongelige lovdekretet 1/2007</strong> (konsolidert lov om forbrukervern) gjelder <strong>ikke angreretten</strong> for avtaler om innkvarteringstjenester til andre formål enn bolig når det er avtalt en bestemt dato eller periode for gjennomføring. Kanselleringsvilkårene beskrevet ovenfor gjelder derfor.</p>

<p><strong>5. Kansellering fra eierens side</strong></p>
<p>Dersom bestillingen ikke kan opprettholdes på grunn av force majeure, alvorlig skade på boligen eller fordi datoene er blitt opptatt gjennom en annen salgskanal, blir du varslet så snart som mulig, og det innbetalte beløpet <strong>refunderes i sin helhet</strong>, uten ytterligere erstatning.</p>

<p><strong>6. Husregler</strong></p>
<ul>
    <li><strong>Røyking</strong> innendørs er ikke tillatt.</li>
    <li><strong>Fester og arrangementer</strong> er ikke tillatt, og antallet bestilte gjester kan ikke overskrides.</li>
    <li><strong>Kjæledyr</strong> er velkomne dersom de oppgis ved bestilling og tillegget betales.</li>
    <li>Naboenes ro og sameiets regler skal respekteres.</li>
    <li>Skader på boligen eller inventaret dekkes av gjesten.</li>
</ul>
<p>Ved alvorlige brudd på disse reglene kan eieren avslutte oppholdet uten rett til refusjon.</p>

<p><strong>7. Gjesteregistrering</strong></p>
<p>Spansk regelverk krever at gjester registreres og at legitimasjonsopplysningene deres meldes til rette myndigheter. Ved ankomst må hver myndig gjest vise gyldig <strong>legitimasjon eller pass</strong>.</p>', 'legal')
ON DUPLICATE KEY UPDATE
  titulo_es=VALUES(titulo_es), titulo_en=VALUES(titulo_en), titulo_de=VALUES(titulo_de), titulo_no=VALUES(titulo_no),
  texto_es=VALUES(texto_es), texto_en=VALUES(texto_en), texto_de=VALUES(texto_de), texto_no=VALUES(texto_no),
  pagina=VALUES(pagina);

INSERT INTO contenido (id_contenido, titulo_es, titulo_en, titulo_de, titulo_no, texto_es, texto_en, texto_de, texto_no, pagina)
VALUES (24, '5. PROPIEDAD INTELECTUAL', '5. INTELLECTUAL PROPERTY', '5. GEISTIGES EIGENTUM', '5. IMMATERIELLE RETTIGHETER',
        '<p>Todos los contenidos de este sitio web —textos, fotografías, vídeos, diseño, estructura de navegación y código— son titularidad de <strong>María Remedios Hinojosa Vilchez</strong> o se utilizan con la debida autorización, y están protegidos por la normativa de propiedad intelectual e industrial.</p>
<p>Queda prohibida su reproducción, distribución, comunicación pública o transformación sin autorización expresa y por escrito del titular, salvo los usos permitidos por la ley. La visualización y descarga de contenidos para uso personal y privado no supone la cesión de ningún derecho sobre ellos.</p>
<p>Las marcas, nombres comerciales y logotipos de terceros que puedan aparecer pertenecen a sus respectivos propietarios.</p>',
        '<p>All content on this website — text, photographs, video, design, navigation structure and code — belongs to <strong>María Remedios Hinojosa Vilchez</strong> or is used with due authorisation, and is protected by intellectual and industrial property law.</p>
<p>Its reproduction, distribution, public communication or transformation without the owner\'s express written authorisation is prohibited, except for uses permitted by law. Viewing and downloading content for personal, private use does not transfer any rights over it.</p>
<p>Any third-party trademarks, trade names and logos that may appear belong to their respective owners.</p>',
        '<p>Sämtliche Inhalte dieser Website — Texte, Fotos, Videos, Gestaltung, Navigationsstruktur und Code — stehen im Eigentum von <strong>María Remedios Hinojosa Vilchez</strong> oder werden mit entsprechender Genehmigung verwendet und sind durch das Urheber- und gewerbliche Schutzrecht geschützt.</p>
<p>Ihre Vervielfältigung, Verbreitung, öffentliche Wiedergabe oder Bearbeitung ohne ausdrückliche schriftliche Genehmigung der Inhaberin ist untersagt, mit Ausnahme der gesetzlich zulässigen Nutzungen. Das Ansehen und Herunterladen von Inhalten zum persönlichen und privaten Gebrauch begründet keinerlei Rechte daran.</p>
<p>Etwaige Marken, Handelsnamen und Logos Dritter gehören ihren jeweiligen Inhabern.</p>',
        '<p>Alt innhold på dette nettstedet — tekst, bilder, video, design, navigasjonsstruktur og kode — tilhører <strong>María Remedios Hinojosa Vilchez</strong> eller brukes med nødvendig tillatelse, og er beskyttet av opphavsretts- og industrielt rettsvern.</p>
<p>Gjengivelse, distribusjon, offentlig fremføring eller bearbeiding uten eierens uttrykkelige skriftlige tillatelse er forbudt, med unntak av bruk som loven tillater. Visning og nedlasting av innhold til personlig og privat bruk gir ingen rettigheter til innholdet.</p>
<p>Eventuelle varemerker, foretaksnavn og logoer fra tredjeparter tilhører sine respektive eiere.</p>', 'legal')
ON DUPLICATE KEY UPDATE
  titulo_es=VALUES(titulo_es), titulo_en=VALUES(titulo_en), titulo_de=VALUES(titulo_de), titulo_no=VALUES(titulo_no),
  texto_es=VALUES(texto_es), texto_en=VALUES(texto_en), texto_de=VALUES(texto_de), texto_no=VALUES(texto_no),
  pagina=VALUES(pagina);

INSERT INTO contenido (id_contenido, titulo_es, titulo_en, titulo_de, titulo_no, texto_es, texto_en, texto_de, texto_no, pagina)
VALUES (25, '6. LEY APLICABLE Y JURISDICCIÓN', '6. APPLICABLE LAW AND JURISDICTION', '6. ANWENDBARES RECHT UND GERICHTSBARKEIT', '6. GJELDENDE LOVGIVNING OG JURISDIKSJON',
        '<p>Estas condiciones se rigen por la <strong>legislación española</strong>.</p>
<p>Cuando el usuario actúe en condición de <strong>consumidor</strong>, será competente el juzgado correspondiente a <strong>su domicilio</strong>, conforme a la normativa de protección de los consumidores, sin que estas condiciones puedan imponer un fuero distinto. En los demás casos, las partes se someten a los Juzgados y Tribunales de <strong>Torremolinos (Málaga)</strong>.</p>
<p>Si eres consumidor residente en la Unión Europea y surge una controversia, puedes acudir a la plataforma de <strong>resolución de litigios en línea</strong> de la Comisión Europea: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>.</p>
<p>Si alguna cláusula de estas condiciones fuera declarada nula, el resto continuará siendo plenamente aplicable.</p>',
        '<p>These terms are governed by <strong>Spanish law</strong>.</p>
<p>Where the user acts as a <strong>consumer</strong>, the competent court shall be the one for <strong>the consumer\'s place of residence</strong>, in accordance with consumer protection rules; these terms may not impose a different jurisdiction. In all other cases, the parties submit to the Courts of <strong>Torremolinos (Málaga)</strong>.</p>
<p>If you are a consumer resident in the European Union and a dispute arises, you may use the European Commission\'s <strong>online dispute resolution</strong> platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>.</p>
<p>If any clause of these terms is declared void, the remainder shall continue to apply in full.</p>',
        '<p>Diese Bedingungen unterliegen dem <strong>spanischen Recht</strong>.</p>
<p>Handelt der Nutzer als <strong>Verbraucher</strong>, ist das Gericht seines <strong>Wohnsitzes</strong> zuständig, entsprechend den Verbraucherschutzvorschriften; diese Bedingungen dürfen keinen abweichenden Gerichtsstand vorschreiben. In allen übrigen Fällen unterwerfen sich die Parteien den Gerichten von <strong>Torremolinos (Málaga)</strong>.</p>
<p>Sind Sie Verbraucher mit Wohnsitz in der Europäischen Union und entsteht eine Streitigkeit, können Sie die Plattform zur <strong>Online-Streitbeilegung</strong> der Europäischen Kommission nutzen: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>.</p>
<p>Sollte eine Klausel dieser Bedingungen unwirksam sein, bleiben die übrigen in vollem Umfang anwendbar.</p>',
        '<p>Disse vilkårene er underlagt <strong>spansk rett</strong>.</p>
<p>Når brukeren opptrer som <strong>forbruker</strong>, er domstolen på <strong>forbrukerens bosted</strong> kompetent, i samsvar med forbrukervernreglene; disse vilkårene kan ikke pålegge et annet verneting. I øvrige tilfeller underlegger partene seg domstolene i <strong>Torremolinos (Málaga)</strong>.</p>
<p>Er du forbruker bosatt i EU og det oppstår en tvist, kan du bruke Europakommisjonens plattform for <strong>nettbasert tvisteløsning</strong>: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>.</p>
<p>Dersom en bestemmelse i disse vilkårene kjennes ugyldig, gjelder de øvrige fullt ut.</p>', 'legal')
ON DUPLICATE KEY UPDATE
  titulo_es=VALUES(titulo_es), titulo_en=VALUES(titulo_en), titulo_de=VALUES(titulo_de), titulo_no=VALUES(titulo_no),
  texto_es=VALUES(texto_es), texto_en=VALUES(texto_en), texto_de=VALUES(texto_de), texto_no=VALUES(texto_no),
  pagina=VALUES(pagina);

