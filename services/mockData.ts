
import { Company, Role, User, Voucher, VoucherStatus, Order, OrderStatus, AuditLogEntry, Commission, Notification, NotificationConfig, NotificationTarget, NotificationTrigger, ServiceItem, ServiceType, Transaction, SystemConfig, DocumentType, ContractType, SupportTicket } from '../types';

// Struktura Sprzedaży
const ADVISOR_ID = 'ADV-001';
const MANAGER_ID = 'MAN-001';
const DIRECTOR_ID = 'DIR-001';

const BUYBACK_TEMPLATE_CONTENT = `UMOWA ODKUPU VOUCHERÓW NR: {AGREEMENT_ID}

Zawarta w dniu {DATE} pomiędzy:

1. STRATTON PRIME S.A. z siedzibą w Warszawie (Właściciel Platformy Eliton), zwanym dalej "Operatorem",
a
2. {USER_NAME} (ID Systemowe: {USER_ID}), zwanym dalej "Użytkownikiem".

§1 PRZEDMIOT UMOWY
1. Użytkownik oświadcza, że posiada {VOUCHER_COUNT} sztuk Voucherów Prime, które uległy przeterminowaniu lub rezygnacji, o łącznej wartości nominalnej {TOTAL_VALUE} PLN.
2. Operator zobowiązuje się do odkupu wyżej wymienionych Voucherów za kwotę {TOTAL_VALUE} PLN (słownie: {TOTAL_VALUE} złotych 00/100).

§2 WARUNKI PŁATNOŚCI
1. Płatność nastąpi w formie uznania salda technicznego lub przelewu na rachunek bankowy powiązany z kontem Użytkownika w Systemie EBS w terminie 7 dni.
2. Z chwilą zatwierdzenia niniejszej umowy Vouchery zostają trwale wycofane z obiegu (anulowane) i nie mogą być wykorzystane do zakupu usług.

§3 POSTANOWIENIA KOŃCOWE
1. Umowa została wygenerowana elektronicznie w systemie Eliton Benefits System (EBS) i nie wymaga odręcznego podpisu.
2. Data wygenerowania dokumentu jest datą skutecznego zawarcia umowy pod warunkiem jej zatwierdzenia przez Operatora.

PODPISANO:
Operator: System Eliton (w im. Stratton Prime)
Użytkownik: {USER_NAME} (Akceptacja Elektroniczna)`;

export const INITIAL_SYSTEM_CONFIG: SystemConfig = {
  // Global
  defaultVoucherValidityDays: 7,
  paymentTermsDays: 7,
  platformCurrency: 'PLN',
  
  // Security
  minPasswordLength: 3,
  sessionTimeoutMinutes: 30,
  auditLogRetentionDays: 365,
  
  // Print
  pdfAutoScaling: true,

  // Documents
  buybackAgreementTemplate: BUYBACK_TEMPLATE_CONTENT,
  templates: [
    {
        id: 'TPL-001',
        name: 'Standardowa Umowa Odkupu',
        type: DocumentType.AGREEMENT,
        content: BUYBACK_TEMPLATE_CONTENT,
        version: 1,
        lastModified: new Date().toISOString(),
        accessRoles: [Role.SUPERADMIN, Role.EMPLOYEE],
        description: 'Domyślny wzór umowy generowanej przy wygasaniu voucherów.',
        isSystem: true
    },
    {
        id: 'TPL-002',
        name: 'Regulamin Platformy 2025',
        type: DocumentType.POLICY,
        content: `REGULAMIN SYSTEMU BENEFITOWEGO ELITON (EBS)\n\n§1 Postanowienia Ogólne\n1. Operatorem systemu jest Stratton Prime S.A.\n2. Użytkownik zobowiązany jest do...`,
        version: 2,
        lastModified: new Date().toISOString(),
        accessRoles: [Role.SUPERADMIN, Role.HR, Role.EMPLOYEE],
        description: 'Ogólne warunki korzystania z platformy.',
        isSystem: true
    },
    {
        id: 'TPL-003',
        name: 'Nota Obciążeniowa (Vouchery)',
        type: DocumentType.INVOICE,
        content: `NOTA KSIĘGOWA NR: {DOC_ID}\n\nNabywca: {COMPANY_NAME}\nNIP: {COMPANY_NIP}\n\nTreść: Zasilenie konta punktowego.\nWartość: {TOTAL_VALUE} PLN.\nTermin: {PAYMENT_TERMS} dni.`,
        version: 1,
        lastModified: new Date().toISOString(),
        accessRoles: [Role.SUPERADMIN, Role.HR],
        description: 'Wzór noty księgowej dla HR.',
        isSystem: true
    }
  ]
};

export const INITIAL_USERS: User[] = [
  {
    id: 'ADM-001',
    role: Role.SUPERADMIN,
    name: 'System Administrator',
    email: 'admin@eliton-benefits.com',
    voucherBalance: 0,
    status: 'ACTIVE',
    identity: { firstName: 'System', lastName: 'Administrator', pesel: '', email: 'admin@eliton-benefits.com' },
    organization: { department: 'IT', position: 'Superadmin' },
    isTwoFactorEnabled: true // ENFORCE 2FA FOR ADMIN DEMO
  },
  // --- Sales Structure ---
  {
    id: ADVISOR_ID,
    role: Role.ADVISOR,
    name: 'Adam Doradca',
    email: 'adam.d@eliton-benefits.com',
    voucherBalance: 0,
    status: 'ACTIVE',
    identity: { firstName: 'Adam', lastName: 'Doradca', pesel: '', email: 'adam.d@eliton-benefits.com' },
    organization: { department: 'Sales', position: 'Advisor' }
  },
  {
    id: MANAGER_ID,
    role: Role.MANAGER,
    name: 'Marek Manager',
    email: 'marek.m@eliton-benefits.com',
    voucherBalance: 0,
    status: 'ACTIVE',
    identity: { firstName: 'Marek', lastName: 'Manager', pesel: '', email: 'marek.m@eliton-benefits.com' },
    organization: { department: 'Sales', position: 'Manager' }
  },
  {
    id: DIRECTOR_ID,
    role: Role.DIRECTOR,
    name: 'Daria Dyrektor',
    email: 'daria.d@eliton-benefits.com',
    voucherBalance: 0,
    status: 'ACTIVE',
    identity: { firstName: 'Daria', lastName: 'Dyrektor', pesel: '', email: 'daria.d@eliton-benefits.com' },
    organization: { department: 'Sales', position: 'Director' }
  },
  // --- Clients ---
  {
    id: 'HR-042',
    role: Role.HR,
    companyId: 'FIRMA-042',
    name: 'Anna Nowak (HR)',
    email: 'hr@techsolutions.pl',
    voucherBalance: 0,
    pesel: '85010112345',
    department: 'HR',
    position: 'Manager',
    status: 'ACTIVE',
    identity: { firstName: 'Anna', lastName: 'Nowak', pesel: '85010112345', email: 'hr@techsolutions.pl' },
    organization: { department: 'HR', position: 'Manager' }
  },
  // --- EMPLOYEES (New EPS Structure) ---
  {
    id: 'EMP-001',
    role: Role.EMPLOYEE,
    companyId: 'FIRMA-042',
    status: 'ACTIVE',
    voucherBalance: 150,
    
    // Facade
    name: 'Jan Kowalski',
    email: 'jan.kowalski@techsolutions.pl',
    pesel: '90051209876',
    department: 'IT',
    position: 'Senior Developer',

    // EPS Layers
    identity: { 
        firstName: 'Jan', 
        lastName: 'Kowalski', 
        pesel: '90051209876', 
        email: 'jan.kowalski@techsolutions.pl' 
    },
    organization: { 
        department: 'IT', 
        position: 'Senior Developer' 
    },
    contract: {
        type: ContractType.UOP,
        hasSicknessInsurance: true
    },
    finance: {
        payoutAccount: {
            iban: 'PL12345678901234567890123456', // Fake but structurally valid
            country: 'PL',
            isVerified: true,
            verificationMethod: 'MICROTRANSFER',
            lastVerifiedAt: new Date().toISOString()
        }
    }
  },
  {
    id: 'EMP-002',
    role: Role.EMPLOYEE,
    companyId: 'FIRMA-042',
    status: 'ACTIVE',
    voucherBalance: 50,

    // Facade
    name: 'Piotr Wiśniewski',
    email: 'piotr.w@techsolutions.pl',
    pesel: '95113005432',
    department: 'Marketing',
    position: 'Junior Specialist',

    // EPS Layers
    identity: { 
        firstName: 'Piotr', 
        lastName: 'Wiśniewski', 
        pesel: '95113005432', 
        email: 'piotr.w@techsolutions.pl' 
    },
    organization: { 
        department: 'Marketing', 
        position: 'Junior Specialist' 
    },
    contract: {
        type: ContractType.UZ,
        hasSicknessInsurance: false
    },
    // Missing Finance Layer (Unverified for Buyback)
  },
  {
    id: 'EMP-003',
    role: Role.EMPLOYEE,
    companyId: 'FIRMA-042',
    status: 'ACTIVE',
    voucherBalance: 0,

    // Credentials
    username: 'm_koch',
    password: '123mackoch123',

    // Facade
    name: 'Maciej Koch',
    email: 'm.koch@techsolutions.pl',
    pesel: '88030512345',
    department: 'Produkcja',
    position: 'Pracownik',

    identity: {
        firstName: 'Maciej',
        lastName: 'Koch',
        pesel: '88030512345',
        email: 'm.koch@techsolutions.pl'
    },
    organization: {
        department: 'Produkcja',
        position: 'Pracownik'
    },
    contract: {
        type: ContractType.UOP,
        hasSicknessInsurance: true
    },
    finance: {
        payoutAccount: {
            iban: 'PL98765432109876543210987654',
            country: 'PL',
            isVerified: true,
            verificationMethod: 'MICROTRANSFER',
            lastVerifiedAt: new Date().toISOString()
        }
    }
  }
];

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'FIRMA-042',
    name: 'TechSolutions Sp. z o.o.',
    nip: '525-000-11-22',
    balancePending: 0,
    balanceActive: 500,
    // CRM Linking
    advisorId: ADVISOR_ID,
    managerId: MANAGER_ID,
    directorId: DIRECTOR_ID
  }
];

// Generate some initial vouchers with STRICT HIERARCHICAL IDs
// Format: SP / FIRMA / ZAM / EMISJA / V-XXXXXX
const generateVouchers = (count: number, status: VoucherStatus, ownerId?: string): Voucher[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `SP/FIRMA-042/INIT-ORDER/EMISJA-01/V-${String(i + 1).padStart(6, '0')}`,
    value: 1, // 1 Voucher = 1 PLN
    status,
    companyId: 'FIRMA-042',
    orderId: 'INIT-ORDER',
    emissionId: 'EMISJA-01',
    ownerId: ownerId,
    issueDate: new Date().toISOString(),
    expiryDate: status === VoucherStatus.DISTRIBUTED 
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
      : undefined
  }));
};

export const INITIAL_VOUCHERS: Voucher[] = [
  ...generateVouchers(500, VoucherStatus.ACTIVE), // HR Pool (Active)
  ...generateVouchers(150, VoucherStatus.DISTRIBUTED, 'EMP-001'), // Employee 1
  ...generateVouchers(50, VoucherStatus.DISTRIBUTED, 'EMP-002'), // Employee 2
];

export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];
export const INITIAL_COMMISSIONS: Commission[] = [];
export const INITIAL_NOTIFICATIONS: Notification[] = [];

// --- UPDATED TRANSACTIONS: Pre-load some apps for EMP-001 to show them "ready" ---
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-LEGAL-001',
    userId: 'EMP-001',
    type: 'DEBIT',
    serviceId: 'SRV-LEGAL-01',
    serviceName: 'AI Legal Assistant',
    amount: 150,
    date: new Date(Date.now() - 432000000).toISOString() // 5 days ago
  },
  {
    id: 'TRX-MENTAL-001',
    userId: 'EMP-001',
    type: 'DEBIT',
    serviceId: 'SRV-MENTAL-01',
    serviceName: 'EBS Wellbeing Premium',
    amount: 100,
    date: new Date(Date.now() - 864000000).toISOString() // 10 days ago
  }
];

// --- System Governance Config ---
export const INITIAL_NOTIFICATION_CONFIGS: NotificationConfig[] = [
  { 
    id: 'NC-01', 
    target: NotificationTarget.EMPLOYEE, 
    trigger: NotificationTrigger.VOUCHER_GRANTED,
    daysOffset: 0, 
    messageTemplate: 'Otrzymałeś {AMOUNT} voucherów. Ważne do: {EXPIRY_DATE}.', 
    isEnabled: true 
  },
  { 
    id: 'NC-02', 
    target: NotificationTarget.EMPLOYEE, 
    trigger: NotificationTrigger.VOUCHER_EXPIRING,
    daysOffset: 3, 
    messageTemplate: 'Twoje vouchery ({AMOUNT} szt.) wygasają za 3 dni.', 
    isEnabled: true 
  },
  { 
    id: 'NC-03', 
    target: NotificationTarget.HR, 
    trigger: NotificationTrigger.ORDER_UNPAID,
    daysOffset: 7, 
    messageTemplate: 'Przypomnienie o płatności za fakturę {DOC_ID}.', 
    isEnabled: true 
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  // --- MENTAL HEALTH APP INTEGRATION ---
  { 
      id: 'SRV-MENTAL-01', 
      name: 'EBS Wellbeing Premium', 
      description: 'Platforma zdrowia psychicznego z AI Coachem, sesjami medytacyjnymi, ćwiczeniami oddechowymi i filmami wideo od certyfikowanych terapeutów. Monitoruj swoje nastroje i śpij lepiej.', 
      price: 100,
      type: ServiceType.SUBSCRIPTION, 
      icon: 'Brain', 
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
      isActive: true 
  },
  // --- AI LEGAL ASSISTANT INTEGRATION ---
  { 
      id: 'SRV-LEGAL-01', 
      name: 'AI Legal Assistant', 
      description: 'Inteligentny asystent prawny dostępny całą dobę. Analizuje umowy o pracę, umowy B2B i regulaminy. Odpowiada na pytania prawne w języku polskim, wskazuje ryzykowne klauzule i generuje pisma.', 
      price: 150, 
      type: ServiceType.SUBSCRIPTION, 
      icon: 'Scale', 
      image: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&q=80&w=800',
      isActive: true 
  },
  { 
      id: 'SRV-LEGAL-SINGLE', 
      name: 'Analiza Umowy (Jednorazowa)', 
      description: 'Prześlij dowolny dokument PDF lub Word – umowę o pracę, NDA, umowę najmu czy zlecenie. Otrzymasz szczegółowy raport z wyróżnionymi klauzulami abuzywnymi i rekomendacjami zmian w ciągu 15 minut.', 
      price: 50, 
      type: ServiceType.ONE_TIME, 
      icon: 'FileText', 
      image: 'https://images.unsplash.com/photo-1568992688065-536aad8a12f6?auto=format&fit=crop&q=80&w=800',
      isActive: true 
  },
  // --- OFERTA GRUPA LUX MED ---
  {
      id: 'SRV-LUXMED-BASIC',
      name: 'LUX MED Opieka S',
      description: 'Podstawowa opieka ambulatoryjna Grupy LUX MED – jeden z największych prywatnych systemów ochrony zdrowia w Polsce. Obejmuje lekarza rodzinnego, internistę, teleporady 24/7 oraz podstawowy pakiet badań laboratoryjnych.',
      price: 89,
      type: ServiceType.SUBSCRIPTION,
      icon: 'Stethoscope',
      image: 'https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&q=80&w=800',
      isActive: true
  },
  {
      id: 'SRV-LUXMED-COMFORT',
      name: 'LUX MED Opieka M',
      description: 'Rozbudowany pakiet opieki medycznej LUX MED z dostępem do ponad 30 specjalizacji bez skierowania, diagnostyką obrazową (RTG, USG), badaniami laboratoryjnymi oraz profilaktyczną opieką stomatologiczną. Wizyty w ponad 320 placówkach w Polsce.',
      price: 149,
      type: ServiceType.SUBSCRIPTION,
      icon: 'Heart',
      image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&q=80&w=800',
      isActive: true
  },
  {
      id: 'SRV-LUXMED-PREMIUM',
      name: 'LUX MED Opieka L',
      description: 'Kompleksowa ochrona zdrowia dla wymagających. Nieograniczony dostęp do specjalistów, hospitalizacja planowa w Szpitalu LUX MED, pełna diagnostyka (rezonans magnetyczny, tomografia), fizjoterapia, kompleksowa stomatologia i opieka okulistyczna.',
      price: 249,
      type: ServiceType.SUBSCRIPTION,
      icon: 'ShieldCheck',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800',
      isActive: true
  },
  {
      id: 'SRV-LUXMED-PSYCHO',
      name: 'LUX MED Zdrowie Psychiczne',
      description: 'Profesjonalne wsparcie psychologiczne od specjalistów Grupy LUX MED. 8 konsultacji psychologicznych rocznie, sesje psychoterapii indywidualnej, program zarządzania stresem oraz całodobowa infolinia zdrowia psychicznego. Pomaga w wypaleniu zawodowym i lęku.',
      price: 99,
      type: ServiceType.SUBSCRIPTION,
      icon: 'Brain',
      image: 'https://images.unsplash.com/photo-1620065478277-634a939f9e4f?auto=format&fit=crop&q=80&w=800',
      isActive: true
  },
  // -------------------------------------
  { id: 'SRV-01', name: 'Spotify Premium (30 dni)', description: 'Miesiąc nieprzerwanego słuchania muzyki bez reklam. Ponad 100 milionów utworów, podcasty i audiobooki. Pobieraj playlisty offline na każde urządzenie. Jakość dźwięku do 320 kbps.', price: 20, type: ServiceType.SUBSCRIPTION, icon: 'Headphones', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-02', name: 'Audioteka (1 Audiobook)', description: 'Jeden audiobook do wyboru z katalogu Audioteki – największej polskiej platformy z audiobookami. Ponad 30 000 tytułów: literatura, biznes, reportaże, kryminały. Słuchaj w aplikacji mobilnej lub przeglądarce.', price: 35, type: ServiceType.ONE_TIME, icon: 'BookOpen', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-03', name: 'Porada Prawna Online (Człowiek)', description: 'Godzinna wideo-konsultacja z licencjonowanym radcą prawnym lub adwokatem. Specjalizacje: prawo pracy, prawo cywilne, umowy, nieruchomości. Umów termin online, otrzymaj podsumowanie na piśmie po spotkaniu.', price: 200, type: ServiceType.ONE_TIME, icon: 'Scale', image: 'https://images.unsplash.com/photo-1521791055366-0d553872952f?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-04', name: 'Multikino (Bilet)', description: 'Bilet na dowolny seans 2D w sieci kin Multikino – ponad 30 multipleksów w całej Polsce. Aktualny repertuar, filmy polskie i zagraniczne. Zarezerwuj miejsce online, odbierz e-bilet w aplikacji. Ważny 3 miesiące od aktywacji.', price: 25, type: ServiceType.ONE_TIME, icon: 'Film', image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800', isActive: true },

  // --- AI & PRODUCTIVITY ---
  { id: 'SRV-AI-01', name: 'Twój pierwszy dzień z osobistym AI', description: 'Praktyczny warsztat online pokazujący, jak używać narzędzi AI (ChatGPT, Copilot, Gemini) do delegowania rutynowych zadań. Nauczysz się pisać e-maile, tworzyć raporty i podsumowywać spotkania 10x szybciej.', price: 23, type: ServiceType.ONE_TIME, icon: 'Cpu', image: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-AI-02', name: 'Prompt Engineering dla nietechnicznych', description: 'Naucz się konstruować skuteczne zapytania do modeli językowych bez znajomości programowania. Kurs zawiera ponad 50 gotowych szablonów promptów dla HR, sprzedaży, marketingu i obsługi klienta.', price: 41, type: ServiceType.ONE_TIME, icon: 'Zap', image: 'https://images.unsplash.com/photo-1686191128892-3b37add4c844?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-AI-03', name: 'Głęboka praca w świecie powiadomień', description: 'Metody koncentracji opracowane na podstawie badań neuropsychologii: technika Pomodoro, blokowanie rozpraszaczy, planowanie tygodnia w blokach czasowych. Naucz się osiągać flow i realizować projekty wymagające skupienia.', price: 12, type: ServiceType.ONE_TIME, icon: 'Brain', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-AI-04', name: 'Automatyzacja codzienności', description: 'Bez kodowania: naucz się łączyć aplikacje przez Zapier i Make.com, automatyzować arkusze Excel/Google Sheets i tworzyć własne chatboty. Oszczędź do 2 godzin dziennie na powtarzalnych zadaniach.', price: 37, type: ServiceType.ONE_TIME, icon: 'Settings', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-AI-05', name: 'Etyka AI w Twoim biurze', description: 'Praktyczny przewodnik po zasadach bezpiecznego i legalnego korzystania ze sztucznej inteligencji w pracy. Omawia RODO a AI, ochronę danych firmowych, halucynacje modeli i odpowiedzialność prawną za treści generowane przez AI.', price: 49, type: ServiceType.ONE_TIME, icon: 'Shield', image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=800', isActive: true },

  // --- MENTAL HEALTH ---
  { id: 'SRV-MH-01', name: 'Cyfrowy detoks w 15 minut', description: 'Krótki program oparty na mindfulness: techniki uziemienia (grounding), ćwiczenia oddechowe 4-7-8, protokół ograniczania ekranowego czasu. Dostępny jako seria nagrań audio – idealne na przerwę w pracy.', price: 9, type: ServiceType.ONE_TIME, icon: 'Smartphone', image: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-MH-02', name: 'Trening odporności na stres (Resilience)', description: 'Program budowania odporności psychicznej oparty na metodach stosowanych przez wojsko i służby ratunkowe: kontrola oddechu, reframing poznawczy i techniki deaktywacji stresu. Dla osób w wymagających zawodach.', price: 33, type: ServiceType.ONE_TIME, icon: 'Heart', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-MH-03', name: 'Sztuka asertywności na Teamsach', description: 'Jak wyznaczać granice zawodowe w kulturze ciągłej dostępności: odmawianie zadań poza zakresem, ochrona czasu prywatnego, komunikacja potrzeb bez agresji. Zawiera gotowe skrypty odpowiedzi na trudne wiadomości.', price: 21, type: ServiceType.ONE_TIME, icon: 'MessageSquare', image: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-MH-04', name: 'Sen jako Twój najlepszy projekt', description: 'Oparte na sleep science metody poprawy jakości snu: optymalizacja temperatury sypialni, protokół wyciszenia przed snem, wpływ niebieskiego światła i kofeiny. Naucz się spać mniej, ale regenerować się skuteczniej.', price: 44, type: ServiceType.ONE_TIME, icon: 'Moon', image: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-MH-05', name: 'Praca zdalna a izolacja społeczna', description: 'Jak przeciwdziałać poczuciu osamotnienia przy pracy zdalnej: tworzenie rytuałów połączenia z zespołem, networkingowe przerwy online, hybrydowe strategie integracji. Zawiera checklistę dla menedżerów i pracowników.', price: 15, type: ServiceType.ONE_TIME, icon: 'Users', image: 'https://images.unsplash.com/photo-1573167243872-43c6433b9d40?auto=format&fit=crop&q=80&w=800', isActive: true },

  // --- FINANCE & GROWTH ---
  { id: 'SRV-FIN-01', name: 'Inwestowanie dla ostrożnych', description: 'Podstawy budowania bezpiecznego portfela inwestycyjnego: ETF-y, obligacje skarbowe, lokaty i konta oszczędnościowe. Nauka dywersyfikacji, zarządzania ryzykiem i długoterminowego myślenia o pieniądzach bez zbędnego żargonu.', price: 28, type: ServiceType.ONE_TIME, icon: 'DollarSign', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-FIN-02', name: 'Psychologia zakupów online', description: 'Jak platformy e-commerce i algorytmy manipulują Twoją skłonnością do zakupów impulsywnych: dark patterns, FOMO marketing, dynamiczne ceny. Naucz się świadomie kupować i ograniczyć nieplanowane wydatki.', price: 7, type: ServiceType.ONE_TIME, icon: 'ShoppingCart', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-FIN-03', name: 'Negocjacje podwyżki w 2026', description: 'Skuteczna strategia rozmowy o wynagrodzeniu oparta na danych rynkowych z raportów płacowych. Jak przygotować case biznesowy, dobrać moment rozmowy i reagować na obiekcje. Zawiera skrypt negocjacyjny do ćwiczeń.', price: 42, type: ServiceType.ONE_TIME, icon: 'TrendingUp', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-FIN-04', name: 'Personal Branding wewnątrz firmy', description: 'Jak budować reputację eksperta wewnątrz organizacji: widoczność na spotkaniach, prowadzenie wewnętrznych szkoleń, strategiczna komunikacja osiągnięć bez efektu samochwalstwa. Dla osób aspirujących do awansu.', price: 19, type: ServiceType.ONE_TIME, icon: 'UserCheck', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-FIN-05', name: 'Emerytura 2.0 – PPK, IKE i IKZE', description: 'Przystępny przewodnik po polskim systemie emerytalnym III filaru. Dowiedz się jak działają Pracownicze Plany Kapitałowe, jakie ulgi daje IKZE (odliczenie od podatku), czym różni się IKE i jak wybrać najlepszy fundusz.', price: 36, type: ServiceType.ONE_TIME, icon: 'Landmark', image: 'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&q=80&w=800', isActive: true },

  // --- LIFESTYLE ---
  { id: 'SRV-LIFE-01', name: 'Bajka na dobranoc: Robot, który chciał mieć sny', description: 'Piękna audiobaśń dla dzieci pracowników (wiek 4–10 lat) o małym robocie szukającym marzeń sennych. Nagrana przez profesjonalnych lektorów z muzyką i efektami dźwiękowymi. Dostępna jako plik MP3 do pobrania.', price: 11, type: ServiceType.ONE_TIME, icon: 'Baby', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-LIFE-02', name: 'Kuchnia w 15 minut', description: 'Kurs planowania posiłków dla zapracowanych: meal-prep na cały tydzień w 2 godziny, lista zakupów do PowerPoint, 25 przepisów gotowych w 15 minut. Oszczędź pieniądze na jedzeniu na wynos i jedz zdrowo bez stresu.', price: 24, type: ServiceType.ONE_TIME, icon: 'Utensils', image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-LIFE-03', name: 'Hobby zamiast scrollowania', description: 'Interaktywny quiz pomagający odkryć pasję dopasowaną do Twojego temperamentu, budżetu i dostępnego czasu. Propozycje obejmują rzemiosło, sport, muzykę, gotowanie i sztukę – z konkretnymi krokami jak zacząć w pierwszym tygodniu.', price: 17, type: ServiceType.ONE_TIME, icon: 'Compass', image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-LIFE-04', name: 'Workation – praca z dowolnego miejsca', description: 'Kompletny poradnik planowania workation: jak wybrać destynację z dobrym internetem, negocjować ze pracodawcą pracę zdalną za granicą, rozliczyć podatki i ubezpieczenie zdrowotne. Lista 15 sprawdzonych lokalizacji w Europie.', price: 48, type: ServiceType.ONE_TIME, icon: 'Plane', image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=800', isActive: true },
  { id: 'SRV-LIFE-05', name: 'Komunikacja między pokoleniami', description: 'Praktyczny przewodnik budowania efektywnych relacji zawodowych z różnymi generacjami: Baby Boomers, Gen X, Millenialsi i Gen Z. Omawia różnice w stylu pracy, komunikacji i motywacji – kluczowe kompetencje wielopokoleniowego miejsca pracy.', price: 39, type: ServiceType.ONE_TIME, icon: 'Users', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800', isActive: true }
];

export const INITIAL_TICKETS: SupportTicket[] = [
    {
        id: 'TCK-2025-001',
        subject: 'Błąd przy zakupie Spotify',
        category: 'VOUCHER',
        priority: 'NORMAL',
        status: 'OPEN',
        creatorId: 'EMP-001',
        creatorName: 'Jan Kowalski',
        companyId: 'FIRMA-042',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        messages: [
            {
                id: 'MSG-1',
                ticketId: 'TCK-2025-001',
                senderId: 'EMP-001',
                senderName: 'Jan Kowalski',
                senderRole: Role.EMPLOYEE,
                message: 'Dzień dobry, pobrało mi punkty ale nie dostałem kodu do Spotify. Proszę o pomoc.',
                timestamp: new Date(Date.now() - 86400000).toISOString()
            }
        ]
    }
];
