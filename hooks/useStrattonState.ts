
import { useState } from 'react';
import { 
  User, Voucher, Company, Order, BuybackAgreement, AuditLogEntry, 
  Commission, Notification, NotificationConfig, ServiceItem, Transaction,
  SystemConfig, ImportHistoryEntry, QuarterlyPerformance
} from '../types';
import { 
  INITIAL_USERS, INITIAL_VOUCHERS, INITIAL_COMPANIES, INITIAL_ORDERS, 
  INITIAL_AUDIT_LOGS, INITIAL_COMMISSIONS, INITIAL_NOTIFICATIONS, 
  INITIAL_NOTIFICATION_CONFIGS, INITIAL_SERVICES, INITIAL_TRANSACTIONS, INITIAL_SYSTEM_CONFIG
} from '../services/mockData';

export const useStrattonState = (currentUserId: string, currentUserName: string) => {
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
      actorId: currentUserId,
      actorName: currentUserName,
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const notifyUser = (userId: string | 'ALL_ADMINS', message: string, type: 'INFO' | 'WARNING' | 'SUCCESS' = 'INFO') => {
    const newNotif: Notification = {
      id: `NOTIF-${Date.now()}`,
      userId,
      message,
      type,
      read: false,
      date: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return {
      // Data
      systemConfig, users, vouchers, companies, orders, buybacks, auditLogs, commissions, quarterlyStats,
      notifications, notificationConfigs, services, transactions, importHistory,
      // Setters
      setSystemConfig, setUsers, setVouchers, setCompanies, setOrders, setBuybacks, setAuditLogs,
      setCommissions, setQuarterlyStats, setNotifications, setNotificationConfigs, setServices,
      setTransactions, setImportHistory,
      // Methods
      logEvent, notifyUser
  };
};
