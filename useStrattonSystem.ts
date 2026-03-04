
import { useState } from 'react';
import { 
  User, Voucher, Company, Order, BuybackAgreement, AuditLogEntry, 
  Commission, CommissionType, QuarterlyPerformance, Notification, NotificationConfig, ServiceItem, Transaction,
  Role, VoucherStatus, OrderStatus, SystemConfig, ImportRow, ImportHistoryEntry, DocumentType, PayrollEntry, ContractType, NotificationAction, NotificationTrigger, PayrollSnapshot
} from '../types';
import { 
  INITIAL_USERS, INITIAL_VOUCHERS, INITIAL_COMPANIES, INITIAL_ORDERS, 
  INITIAL_AUDIT_LOGS, INITIAL_COMMISSIONS, INITIAL_NOTIFICATIONS, 
  INITIAL_NOTIFICATION_CONFIGS, INITIAL_SERVICES, INITIAL_TRANSACTIONS, INITIAL_SYSTEM_CONFIG
} from '../services/mockData';
import { ToastType } from '../components/Toast';
import { generatePayrollTemplate, parseAndMatchPayroll, createSnapshot } from '../services/payrollService';

const COMMISSION_RATES = {
  ADVISOR_FIRST_INVOICE: 0.10, // 10%
  MANAGER_RECURRING: 0.02,     // 2%
  DIRECTOR_RECURRING: 0.01,    // 1%
  RENEWAL_TIER_1: 0.02,        // 2% (Próg 1)
  RENEWAL_TIER_2: 0.04         // 4% (Próg 2)
};

const RENEWAL_THRESHOLDS = {
  TIER_1_COUNT: 1, // Min. 1 acquisition for 2%
  TIER_2_COUNT: 2  // Min. 2 acquisitions for 4%
};

// Configuration for the "Success Fee"
const SUCCESS_FEE_PERCENTAGE = 0.20; // 20% Fee on top of Vouchers

const getQuarter = (date: Date): string => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
};

// Security Utility: Generate Secure Password
const generateSecurePassword = () => {
  const length = 10;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

// Modified Hook Signature to accept Toast Callback
export const useStrattonSystem = (
  currentUser: User, 
  showToast: (title: string, message: string, type: ToastType) => void
) => {
  // --- Global State ---
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_SYSTEM_CONFIG);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [buybacks, setBuybacks] = useState<BuybackAgreement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [commissions, setCommissions] = useState<Commission[]>(INITIAL_COMMISSIONS);
  const [quarterlyStats, setQuarterlyStats] = useState<QuarterlyPerformance[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [notificationConfigs, setNotificationConfigs] = useState<NotificationConfig[]>(INITIAL_NOTIFICATION_CONFIGS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [importHistory, setImportHistory] = useState<ImportHistoryEntry[]>([]);

  // --- Helpers ---
  const logEvent = (action: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const notifyUser = (userId: string | 'ALL_ADMINS', message: string, type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' = 'INFO', action?: NotificationAction) => {
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}`,
      userId,
      message,
      type,
      read: false,
      date: new Date().toISOString(),
      action
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // --- Actions ---

  const handleUpdateSystemConfig = (newConfig: SystemConfig) => {
    setSystemConfig(newConfig);
    logEvent('SYSTEM_CONFIG_UPDATE', `Zmieniono konfigurację systemu. Domyślna ważność vouchera: ${newConfig.defaultVoucherValidityDays} dni.`);
    showToast("Konfiguracja Zapisana", "Zaktualizowano globalne ustawienia systemu.", "SUCCESS");
  };

  const handleManualEmission = (amount: number, description: string) => {
     if (amount <= 0) {
        showToast("Błąd Emisji", "Kwota musi być większa od zera.", "ERROR");
        return;
     }
     
     const emissionId = `EMISJA-MANUAL-${Date.now().toString().slice(-6)}`;
     const newVouchers: Voucher[] = Array.from({ length: amount }).map((_, i) => ({
      id: `SP/PLATFORM/MANUAL/${emissionId}/V-${String(i + 1).padStart(6, '0')}`,
      value: 1, 
      status: VoucherStatus.CREATED,
      companyId: 'PLATFORM', // Technical Pool
      emissionId: emissionId,
      issueDate: new Date().toISOString()
    }));

    setVouchers(prev => [...prev, ...newVouchers]);
    logEvent('MANUAL_EMISSION', `Wyemitowano ręcznie ${amount} voucherów. Emisja: ${emissionId}. Powód: ${description}`);
    notifyUser('ALL_ADMINS', `Nowa emisja manualna: ${amount} pkt. ID: ${emissionId}`, 'INFO');
    
    showToast(
      "Emisja Zakończona", 
      `Wyemitowano ${amount} voucherów do puli platformy. Są one gotowe do przypisania lub dystrybucji.`, 
      "SUCCESS"
    );
  };

  const handleUpdateNotificationConfig = (updatedConfig: NotificationConfig) => {
    setNotificationConfigs(prev => prev.map(c => c.id === updatedConfig.id ? updatedConfig : c));
    logEvent('CONFIG_UPDATE', `Zaktualizowano konfigurację powiadomień: ${updatedConfig.id}. Status: ${updatedConfig.isEnabled ? 'ON' : 'OFF'}`);
    showToast("Powiadomienia", "Ustawienia powiadomień zostały zaktualizowane.", "INFO");
  };

  const handlePlaceOrder = (amount: number, distributionPlan?: PayrollEntry[]) => {
    if (!currentUser.companyId) return;
    
    const hasPaidOrders = orders.some(o => o.companyId === currentUser.companyId && o.status === OrderStatus.PAID);
    const isFirstInvoice = !hasPaidOrders;

    const voucherValue = amount * 1;
    const feeValue = voucherValue * SUCCESS_FEE_PERCENTAGE; 
    const totalValue = voucherValue + feeValue;
    
    const year = new Date().getFullYear();
    const uniqueSuffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    // Create Snapshots from Payroll Entries (Audit Lock)
    let snapshots: PayrollSnapshot[] | undefined = undefined;
    if (distributionPlan && distributionPlan.length > 0) {
        snapshots = distributionPlan.map(entry => createSnapshot(entry));
    }

    const newOrder: Order = {
      id: `ZAM-${year}-${uniqueSuffix}`,
      companyId: currentUser.companyId,
      amount,
      voucherValue,
      feeValue,
      totalValue,
      docVoucherId: `NK/${year}/${uniqueSuffix}/B`, // Nota Księgowa (Vouchery)
      docFeeId: `FV/${year}/${uniqueSuffix}/S`,    // Faktura VAT (Service Fee)
      date: new Date().toISOString(),
      status: OrderStatus.PENDING,
      isFirstInvoice,
      distributionPlan: distributionPlan, // Legacy prop for UI
      snapshots: snapshots // New JSON Audit Prop
    };

    setOrders(prev => [...prev, newOrder]);
    
    const methodMsg = snapshots ? ` (z planem auto-dystrybucji: ${snapshots.length} os. - SNAPSHOT ZAPISANY)` : '';
    logEvent('ORDER_CREATED', `Złożono zamówienie ${newOrder.id}${methodMsg}. Wygenerowano dok: ${newOrder.docVoucherId} i ${newOrder.docFeeId}.`);
    
    // NEW: Actionable Notification for Admin
    notifyUser('ALL_ADMINS', `Nowe zamówienie ${newOrder.id} (${totalValue.toFixed(2)} PLN) czeka na akceptację.`, 'WARNING', {
        type: 'APPROVE_ORDER',
        targetId: newOrder.id,
        label: 'Zatwierdź Zamówienie',
        variant: 'primary'
    });
    
    showToast(
        "Zamówienie Przyjęte", 
        `Utworzono zamówienie nr ${newOrder.id}. ${snapshots ? 'System zamroził stawkę i podział (Snapshot).' : 'Pobierz dokumenty z tabeli historii.'}`, 
        "SUCCESS"
    );
  };

  const handleApproveOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (order.status !== OrderStatus.PENDING) {
        showToast("Info", "To zamówienie zostało już przetworzone.", "INFO");
        return;
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.APPROVED } : o));

    const emissionId = `EMISJA-${order.id}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const newVouchers: Voucher[] = Array.from({ length: order.amount }).map((_, i) => ({
      id: `SP/${order.companyId}/${order.id}/${emissionId}/V-${String(i + 1).padStart(6, '0')}`,
      value: 1, 
      status: VoucherStatus.RESERVED,
      companyId: order.companyId,
      orderId: order.id,
      emissionId: emissionId,
      issueDate: new Date().toISOString()
    }));

    setVouchers(prev => [...prev, ...newVouchers]);

    const hrUser = users.find(u => u.companyId === order.companyId && u.role === Role.HR);
    if (hrUser) {
      notifyUser(hrUser.id, `Zamówienie ${orderId} zatwierdzone. Faktury gotowe do opłacenia.`, 'SUCCESS');
    }
    logEvent('ORDER_APPROVED', `Zatwierdzono zamówienie ${orderId}. Dokumenty (NK+FV) wysłane do HR.`);
    
    showToast(
        "Zamówienie Zatwierdzone",
        "Dokumenty płatnicze zostały udostępnione firmie. Oczekuj na przelew (Status zmieni się po potwierdzeniu).",
        "SUCCESS"
    );
  };

  const handleBankPayment = (orderId: string, success: boolean) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const company = companies.find(c => c.id === order.companyId);
    if (!company) return;

    if (!success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.REJECTED } : o));
      setVouchers(prev => prev.filter(v => v.orderId !== orderId)); 
      logEvent('ORDER_REJECTED', `Brak płatności dla zamówienia ${orderId}. Rezerwacja voucherów anulowana.`);
      notifyUser('ALL_ADMINS', `Zamówienie ${orderId} odrzucone (brak płatności).`, 'WARNING');
      
      showToast(
        "Płatność Odrzucona",
        "Zamówienie anulowano, a rezerwację voucherów cofnięto. Poinformuj klienta o problemie.",
        "ERROR"
      );
      return;
    }

    // Payment Success
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: OrderStatus.PAID } : o));
    
    let updatedVouchers = vouchers.map(v => 
        v.orderId === orderId && v.status === VoucherStatus.RESERVED 
        ? { ...v, status: VoucherStatus.ACTIVE } 
        : v
    );
    
    let newBalanceActive = company.balanceActive + order.amount;

    // Use Snapshots for Distribution (Preferred) or Fallback to distributionPlan
    const planSource = order.snapshots || order.distributionPlan;

    if (planSource && planSource.length > 0) {
        logEvent('AUTO_DISTRIBUTION', `Wykryto plan płacowy dla zamówienia ${orderId}. Uruchamianie auto-dystrybucji...`);
        
        let distributedCount = 0;
        const availableVoucherIds = updatedVouchers
            .filter(v => v.orderId === orderId && v.status === VoucherStatus.ACTIVE)
            .map(v => v.id);
        
        const expiryDate = new Date(Date.now() + systemConfig.defaultVoucherValidityDays * 24 * 60 * 60 * 1000).toISOString();
        let updatedUsers = [...users];
        let currentVoucherIndex = 0;

        planSource.forEach(entry => {
             // Logic handles both PayrollEntry and PayrollSnapshot interfaces loosely here for mock purposes
             // In real app, we'd strict check. Snapshot keys: matched_user_id, final_netto_voucher
             const userId = (entry as any).matched_user_id || (entry as any).matchedUserId;
             const amount = Math.floor((entry as any).final_netto_voucher || (entry as any).voucherPartNet);

             if (userId && amount > 0) {
                 if (currentVoucherIndex + amount <= availableVoucherIds.length) {
                     const idsForUser = availableVoucherIds.slice(currentVoucherIndex, currentVoucherIndex + amount);
                     currentVoucherIndex += amount;

                     updatedVouchers = updatedVouchers.map(v => 
                        idsForUser.includes(v.id) 
                        ? { ...v, status: VoucherStatus.DISTRIBUTED, ownerId: userId, expiryDate } 
                        : v
                     );
                     
                     updatedUsers = updatedUsers.map(u => 
                        u.id === userId 
                        ? { ...u, voucherBalance: u.voucherBalance + amount } 
                        : u
                     );

                     distributedCount += amount;
                     notifyUser(userId, `Otrzymałeś ${amount} nowych voucherów (Auto-dystrybucja z płac).`, 'SUCCESS');
                 }
             }
        });

        setVouchers(updatedVouchers);
        setUsers(updatedUsers);
        newBalanceActive -= distributedCount;
        logEvent('AUTO_DISTRIBUTION_COMPLETE', `Automatycznie rozdano ${distributedCount} voucherów do ${planSource.length} pracowników.`);
    } else {
        setVouchers(updatedVouchers);
    }

    setCompanies(prev => prev.map(c => 
      c.id === order.companyId 
      ? { ...c, balanceActive: newBalanceActive } 
      : c
    ));

    const commissionBase = order.feeValue;
    let tempCommissions = [...commissions];
    const newCommissions: Commission[] = [];
    const dateCalculated = new Date().toISOString();
    const currentQuarter = getQuarter(new Date());

    if (order.isFirstInvoice) {
        if (company.advisorId) {
            const advisor = users.find(u => u.id === company.advisorId);
            if (advisor) {
                newCommissions.push({
                    id: `COM-${Date.now()}-ADV`,
                    agentId: advisor.id,
                    agentName: advisor.name,
                    role: Role.ADVISOR,
                    type: CommissionType.ACQUISITION,
                    orderId: order.id,
                    amount: commissionBase * COMMISSION_RATES.ADVISOR_FIRST_INVOICE,
                    rate: `${COMMISSION_RATES.ADVISOR_FIRST_INVOICE * 100}%`,
                    dateCalculated,
                    quarter: currentQuarter,
                    isPaid: true
                });
            }
        }
    } else {
        if (company.managerId) {
            const manager = users.find(u => u.id === company.managerId);
            if (manager) {
                 newCommissions.push({
                    id: `COM-${Date.now()}-MAN`,
                    agentId: manager.id,
                    agentName: manager.name,
                    role: Role.MANAGER,
                    type: CommissionType.RECURRING,
                    orderId: order.id,
                    amount: commissionBase * COMMISSION_RATES.MANAGER_RECURRING,
                    rate: `${COMMISSION_RATES.MANAGER_RECURRING * 100}%`,
                    dateCalculated,
                    quarter: currentQuarter,
                    isPaid: true
                });
            }
        }
        if (company.directorId) {
            const director = users.find(u => u.id === company.directorId);
            if (director) {
                 newCommissions.push({
                    id: `COM-${Date.now()}-DIR`,
                    agentId: director.id,
                    agentName: director.name,
                    role: Role.DIRECTOR,
                    type: CommissionType.RECURRING,
                    orderId: order.id,
                    amount: commissionBase * COMMISSION_RATES.DIRECTOR_RECURRING,
                    rate: `${COMMISSION_RATES.DIRECTOR_RECURRING * 100}%`,
                    dateCalculated,
                    quarter: currentQuarter,
                    isPaid: true
                });
            }
        }
    }

    setCommissions([...tempCommissions, ...newCommissions]);

    if (newCommissions.length > 0) {
        logEvent('COMMISSION_CALC', `Naliczono ${newCommissions.length} nowych prowizji od Kwoty Obsługi (Dok: ${order.docFeeId}).`);
    }

    logEvent('ORDER_PAID', `Płatność przyjęta. Vouchery aktywne.`);
    notifyUser('ALL_ADMINS', `Faktury za zamówienie ${orderId} opłacone. Vouchery aktywne.`, 'SUCCESS');
    
    const hrUser = users.find(u => u.companyId === order.companyId && u.role === Role.HR);
    if (hrUser) notifyUser(hrUser.id, `Płatność przyjęta. Vouchery z zamówienia ${order.id} są teraz aktywne.`, 'SUCCESS');
    
    showToast(
      "Płatność Zatwierdzona",
      `Vouchery z zamówienia ${orderId} są teraz aktywne. ${planSource ? 'Uruchomiono automatyczną dystrybucję.' : ''}`,
      "SUCCESS"
    );
  };

  const handleDistribute = (employeeId: string, amount: number) => {
    const companyId = currentUser.companyId;
    if (!companyId) return;

    const targetUser = users.find(u => u.id === employeeId);
    if (!targetUser || targetUser.status === 'INACTIVE') {
        showToast("Błąd Dystrybucji", "Wybrany pracownik jest nieaktywny lub zwolniony. Nie można przekazać środków.", "ERROR");
        return;
    }

    const availableVouchers = vouchers.filter(v => v.companyId === companyId && v.status === VoucherStatus.ACTIVE);
    
    if (availableVouchers.length < amount) {
      showToast("Błąd Dystrybucji", "Niewystarczająca liczba aktywnych voucherów! Opłać proformę, aby uzyskać więcej.", "ERROR");
      return;
    }

    const vouchersToDistribute = availableVouchers.slice(0, amount);
    const idsToUpdate = vouchersToDistribute.map(v => v.id);

    const expiryDate = new Date(Date.now() + systemConfig.defaultVoucherValidityDays * 24 * 60 * 60 * 1000).toISOString();

    setVouchers(prev => prev.map(v => 
      idsToUpdate.includes(v.id) 
        ? { 
            ...v, 
            status: VoucherStatus.DISTRIBUTED, 
            ownerId: employeeId,
            expiryDate: expiryDate
          } 
        : v
    ));

    setUsers(prev => prev.map(u => 
      u.id === employeeId ? { ...u, voucherBalance: u.voucherBalance + amount } : u
    ));
    
    setCompanies(prev => prev.map(c => 
      c.id === companyId ? { ...c, balanceActive: c.balanceActive - amount } : c
    ));

    logEvent('VOUCHER_DISTRIBUTED', `Przekazano ${amount} voucherów dla pracownika ${employeeId}. Ważność: ${systemConfig.defaultVoucherValidityDays} dni.`);
    notifyUser(employeeId, `Otrzymałeś ${amount} nowych voucherów! Wykorzystaj je w ciągu ${systemConfig.defaultVoucherValidityDays} dni.`, 'SUCCESS');
    
    showToast(
      "Vouchery Przekazane",
      `Pomyślnie przekazano ${amount} pkt. Pracownik otrzymał powiadomienie i może już korzystać ze środków.`,
      "SUCCESS"
    );
  };

  const handleDeactivateEmployee = (employeeId: string) => {
    const userToDeactivate = users.find(u => u.id === employeeId);
    if (!userToDeactivate) return;

    setUsers(prev => prev.map(u => 
        u.id === employeeId ? { ...u, status: 'INACTIVE' } : u
    ));

    logEvent('USER_DEACTIVATED', `Dezaktywowano pracownika ${userToDeactivate.name} (${userToDeactivate.id}). Blokada dystrybucji.`);
    
    showToast(
        "Pracownik Dezaktywowany",
        `Konto ${userToDeactivate.name} zostało oznaczone jako nieaktywne. Dystrybucja środków zablokowana. Historia zachowana.`,
        "INFO"
    );
  };

  const handleImportEmployees = (importData: { email: string; name: string; amount: number }[]) => {};

  const handleBulkImport = async (validRows: ImportRow[]) => {
     if (!currentUser.companyId) return null;
     const companyId = currentUser.companyId;
     const company = companies.find(c => c.id === companyId);
     const dateNow = new Date().toISOString();
     
     const newUsers: User[] = [];
     const reportUsers: any[] = []; 

     validRows.forEach((row, idx) => {
         const tempPassword = generateSecurePassword();
         const userId = `EMP-B-${Date.now()}-${idx}`;

         newUsers.push({
             id: userId,
             role: Role.EMPLOYEE,
             companyId: companyId,
             name: `${row.name} ${row.surname}`,
             email: row.email,
             pesel: row.pesel,
             department: row.department,
             position: row.position,
             voucherBalance: 0,
             status: 'ACTIVE',
             termsAccepted: true,
             termsAcceptedAt: dateNow,
             termsAcceptedMethod: 'BULK_IMPORT'
         });

         reportUsers.push({
             id: userId,
             name: `${row.name} ${row.surname}`,
             email: row.email,
             tempPassword: tempPassword,
             department: row.department
         });
     });

     setUsers(prev => [...prev, ...newUsers]);

     const reportId = `REP-${Date.now()}`;
     const reportData = {
        reportId: reportId,
        date: dateNow,
        hrName: currentUser.name,
        importedCount: newUsers.length,
        users: reportUsers
     };

     const historyEntry: ImportHistoryEntry = {
         id: reportId,
         companyId: companyId,
         date: dateNow,
         hrName: currentUser.name,
         totalProcessed: newUsers.length,
         status: 'SUCCESS',
         reportData: reportData
     };

     setImportHistory(prev => [historyEntry, ...prev]);

     const logMsg = `Zaimportowano ${newUsers.length} pracowników. Automatyczna akceptacja regulaminu przez HR (${currentUser.name}). Wygenerowano poświadczenia.`;
     logEvent('BULK_IMPORT', logMsg);

     showToast(
         "Import Zakończony", 
         `Utworzono ${newUsers.length} kont. Raport z hasłami jest gotowy do pobrania.`, 
         "SUCCESS"
     );

     return {
         reportData,
         company,
         user: currentUser
     };
  };

  const handleServicePurchase = (service: ServiceItem) => {
    if (currentUser.voucherBalance < service.price) {
      showToast("Transakcja Odrzucona", "Niewystarczające środki na koncie. Skontaktuj się z działem HR.", "ERROR");
      return;
    }

    const userVouchers = vouchers.filter(v => v.ownerId === currentUser.id && v.status === VoucherStatus.DISTRIBUTED);
    const vouchersToConsume = userVouchers.slice(0, service.price);
    const idsToConsume = vouchersToConsume.map(v => v.id);

    setVouchers(prev => prev.map(v => 
      idsToConsume.includes(v.id) ? { ...v, status: VoucherStatus.CONSUMED } : v
    ));

    setUsers(prev => prev.map(u => 
      u.id === currentUser.id ? { ...u, voucherBalance: u.voucherBalance - service.price } : u
    ));

    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      userId: currentUser.id,
      type: 'DEBIT',
      serviceId: service.id,
      serviceName: service.name,
      amount: service.price,
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTransaction, ...prev]);

    logEvent('SERVICE_CONSUMPTION', `Pracownik ${currentUser.id} zakupił usługę: ${service.name}. Skonsumowano ${service.price} konkretnych ID voucherów.`);
    notifyUser(currentUser.id, `Zakupiono: ${service.name}. Pobrano ${service.price} pkt.`, 'SUCCESS');
    
    showToast(
      "Usługa Aktywowana",
      `Pobrano ${service.price} pkt. Dostęp do usługi "${service.name}" został odblokowany. Szczegóły znajdziesz w Historii Transakcji.`,
      "SUCCESS"
    );
  };

  const simulateExpiration = () => {
    const distributedVouchers = vouchers.filter(v => v.status === VoucherStatus.DISTRIBUTED);
    const idsToExpire = distributedVouchers.slice(0, 20).map(v => v.id); 

    if (idsToExpire.length === 0) {
      showToast("Brak Danych", "Brak rozdanych voucherów do przeprowadzenia symulacji wygaśnięcia.", "INFO");
      return;
    }

    setVouchers(prev => prev.map(v => 
      idsToExpire.includes(v.id) ? { ...v, status: VoucherStatus.BUYBACK_PENDING } : v
    ));

    const affectedUsers = new Set<string>(
      distributedVouchers
        .filter(v => idsToExpire.includes(v.id) && v.ownerId)
        .map(v => v.ownerId as string)
    );
    const newAgreements: BuybackAgreement[] = [];
    
    affectedUsers.forEach(uid => {
      const count = distributedVouchers.filter(v => idsToExpire.includes(v.id) && v.ownerId === uid).length;
      newAgreements.push({
        id: `UMOWA-ODKUP-${Math.floor(Math.random()*10000)}`,
        userId: uid,
        voucherCount: count,
        totalValue: count * 1,
        dateGenerated: new Date().toISOString(),
        status: 'PENDING_APPROVAL'
      });

      setUsers(prev => prev.map(u => 
        u.id === uid ? { ...u, voucherBalance: u.voucherBalance - count } : u
      ));
      
      const config = notificationConfigs.find(c => c.trigger === 'VOUCHER_EXPIRING' && c.isEnabled);
      const msg = config ? config.messageTemplate : `Twoje vouchery (${count} szt.) wygasły. Wygenerowano umowę odkupu (dostępna w panelu i wysłana na email).`;
      
      notifyUser(uid, msg, 'WARNING');
    });

    setBuybacks(prev => [...prev, ...newAgreements]);
    newAgreements.forEach(b => {
      logEvent('DOC_DISTRIBUTION', `Umowa odkupu ${b.id} wygenerowana. Udostępniono w panelu pracownika ${b.userId}. Wysłano kopie na e-mail.`);
    });

    logEvent('SIMULATION_EXPIRE', `Symulacja: Wygaszenie ${idsToExpire.length} voucherów. Procedura rezygnacji uruchomiona.`);
    notifyUser('ALL_ADMINS', `Nowe umowy odkupu do zatwierdzenia (${newAgreements.length}).`, 'WARNING');
    
    showToast(
      "Symulacja Zakończona",
      `Wygasło ${idsToExpire.length} voucherów. System wygenerował automatycznie ${newAgreements.length} umów odkupu i wysłał je do akceptacji.`,
      "SUCCESS"
    );
  };

  const handleApproveBuyback = (buybackId: string) => {
    setBuybacks(prev => prev.map(b => b.id === buybackId ? { ...b, status: 'APPROVED' } : b));
    setVouchers(prev => prev.map(v => {
        return v.status === VoucherStatus.BUYBACK_PENDING ? { ...v, status: VoucherStatus.BUYBACK_COMPLETE } : v;
    }));
    logEvent('BUYBACK_APPROVED', `Zatwierdzono odkup ${buybackId}. Vouchery zwrócone do Głównej Puli Platformy (Obieg Zamknięty).`);
    
    showToast(
      "Odkup Zatwierdzony",
      "Umowa została sfinalizowana. Środki zostały zwrócone do obiegu systemowego, a użytkownik otrzymał potwierdzenie.",
      "SUCCESS"
    );
  };

  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => 
      (n.userId === currentUser.id || (currentUser.role === Role.SUPERADMIN && n.userId === 'ALL_ADMINS')) 
      ? { ...n, read: true } : n
    ));
  };
  
  const handleExportPayrollTemplate = (usersToExport: User[]) => {
      const success = generatePayrollTemplate(usersToExport);
      if (success) {
          showToast("Eksport Szablonu", "Plik Excel został wygenerowany pomyślnie.", "SUCCESS");
      } else {
          showToast("Błąd Eksportu", "Wystąpił błąd podczas generowania pliku Excel.", "ERROR");
      }
  };

  const handleParseAndMatchPayroll = async (file: File): Promise<PayrollEntry[]> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const matchedEntries: PayrollEntry[] = [
                  { 
                      id: 'P-1', email: 'jan.kowalski@techsolutions.pl', employeeName: 'Jan Kowalski', 
                      contractType: ContractType.UOP, declaredNetAmount: 7500, statutoryMinNet: 3606, cashPartNet: 4300, voucherPartNet: 3200, 
                      matchedUserId: 'EMP-001', status: 'MATCHED', totalHours: 160
                  },
                  { 
                      id: 'P-2', email: 'piotr.w@techsolutions.pl', employeeName: 'Piotr Wiśniewski', 
                      contractType: ContractType.UZ, declaredNetAmount: 5000, statutoryMinNet: 2400, cashPartNet: 3000, voucherPartNet: 2000, 
                      matchedUserId: 'EMP-002', status: 'MATCHED', totalHours: 160
                  },
                  { 
                      id: 'P-3', email: 'nowy.pracownik@techsolutions.pl', employeeName: 'Krzysztof Nowy', 
                      contractType: ContractType.UOP, declaredNetAmount: 6000, statutoryMinNet: 3606, cashPartNet: 4300, voucherPartNet: 1700, 
                      matchedUserId: undefined, status: 'MISSING', totalHours: 160
                  },
                  { 
                      id: 'P-4', email: 'byly.pracownik@techsolutions.pl', employeeName: 'Adam Były', 
                      contractType: ContractType.UZ, declaredNetAmount: 4000, statutoryMinNet: 2400, cashPartNet: 4000, voucherPartNet: 0, 
                      matchedUserId: undefined, status: 'INACTIVE', totalHours: 160
                  }
              ];
              resolve(matchedEntries);
          }, 1500);
      });
  };

  // --- NEW: Handle Actionable Notifications ---
  const handleNotificationAction = (notificationId: string, action: NotificationAction) => {
      if (action.type === 'APPROVE_ORDER') {
          handleApproveOrder(action.targetId);
      } else if (action.type === 'APPROVE_BUYBACK') {
          handleApproveBuyback(action.targetId);
      } else if (action.type === 'REJECT_ORDER') {
          // Logic for rejection
      }

      // Mark Action as Completed locally in notification state
      setNotifications(prev => prev.map(n => 
          n.id === notificationId 
          ? { 
              ...n, 
              read: true, 
              action: { ...n.action!, completed: true, completedLabel: 'Zatwierdzono' } 
            } 
          : n
      ));
  };

  const handleClearNotifications = () => {
      setNotifications(prev => prev.filter(n => n.userId !== currentUser.id && n.userId !== 'ALL_ADMINS'));
  };

  return {
    state: {
      systemConfig, users, vouchers, companies, orders, buybacks, auditLogs, commissions, quarterlyStats,
      notifications, notificationConfigs, services, transactions, importHistory
    },
    actions: {
      setUsers,
      handleUpdateSystemConfig,
      handleUpdateNotificationConfig,
      handleManualEmission,
      handlePlaceOrder,
      handleApproveOrder,
      handleBankPayment,
      handleDistribute,
      handleDeactivateEmployee,
      handleImportEmployees, 
      handleBulkImport,
      handleServicePurchase,
      simulateExpiration,
      handleApproveBuyback,
      handleMarkNotificationsRead,
      handleExportPayrollTemplate,
      handleParseAndMatchPayroll,
      handleNotificationAction, // Exported
      handleClearNotifications // Exported
    }
  };
};
