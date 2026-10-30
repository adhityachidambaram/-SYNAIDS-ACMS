import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  UserRole,
  UserProfile,
  ApplicationRecord,
  DeficiencyItem,
  ComplianceObligation,
  RegulatoryRule,
  AuditLogEvent,
  VerificationCheck,
} from '../types';

import {
  INITIAL_PROFILES,
  INITIAL_APPLICATIONS,
  INITIAL_RULES,
  INITIAL_COMPLIANCE_OBLIGATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

// ==================== NOTIFICATIONS ====================

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'deficiency' | 'approval' | 'evc' | 'submission' | 'info';
  linkTarget?: string;
}

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

// ==================== CONTEXT TYPE ====================

interface AppContextType {
  currentUser: UserProfile;
  setRole: (role: UserRole) => void;

  applications: ApplicationRecord[];
  currentApplication: ApplicationRecord | null;
  setCurrentApplicationId: (id: string) => void;

  rules: RegulatoryRule[];
  complianceList: ComplianceObligation[];
  auditLogs: AuditLogEvent[];

  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markAllNotificationsRead: () => void;

  academicYear: string;
  setAcademicYear: (year: string) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  createNewApplication: (
    newApp: Partial<ApplicationRecord>
  ) => string;

  updateApplicationStatus: (
    appId: string,
    newStatus: ApplicationRecord['currentStage'],
    remarks?: string
  ) => void;

  raiseDeficiency: (
    appId: string,
    deficiency: Omit<DeficiencyItem, 'id' | 'raisedDate' | 'status'>
  ) => void;

  resolveDeficiency: (
    appId: string,
    defId: string,
    response: string,
    newDocName?: string
  ) => void;

  updateVerificationCheck: (
    appId: string,
    checkId: string,
    status: VerificationCheck['status'],
    remarks: string
  ) => void;

  submitEvcReport: (
    evcId: string,
    checklist: any[],
    recommendation: string
  ) => void;

  recordDecision: (
    appId: string,
    decisionType: 'Approved' | 'Rejected' | 'Returned for Correction',
    reason: string
  ) => void;

  submitComplianceEvidence: (
    compObligationId: string,
    evidenceFileName: string
  ) => void;

  addToast: (
    title: string,
    message: string,
    type?: ToastType
  ) => void;

  toasts: ToastItem[];
  removeToast: (id: string) => void;
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==================== INITIAL NOTIFICATIONS ====================

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Deficiency Notice Issued',
    message:
      'Scrutiny Officer raised DEF-001 on Affidavit 2 for APP-2025-00124.',
    timestamp: '2 hours ago',
    read: false,
    type: 'deficiency',
    linkTarget: '/app/deficiencies',
  },
  {
    id: 'notif-2',
    title: 'EVC Visit Scheduled',
    message:
      'Expert Visiting Committee on-site visit confirmed for 28 Sep 2025.',
    timestamp: '5 hours ago',
    read: false,
    type: 'evc',
    linkTarget: '/app/evc',
  },
  {
    id: 'notif-3',
    title: 'Documents Verified',
    message:
      'Land and CMDA Building Plans cleared by Scrutiny Bureau.',
    timestamp: '1 day ago',
    read: false,
    type: 'submission',
    linkTarget: '/app/scrutiny',
  },
];

// ==================== STORAGE HELPERS ====================

const NOTIFICATION_STORAGE_KEY = 'acms_notifications';

function loadNotifications(): NotificationItem[] {
  try {
    const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);

    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as NotificationItem[];
      }
    }
  } catch (error) {
    console.error('Could not load notifications:', error);
  }

  return INITIAL_NOTIFICATIONS;
}

// ==================== PROVIDER ====================

export const AppProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(
    INITIAL_PROFILES[0]
  );

  const [applications, setApplications] = useState<ApplicationRecord[]>(
    INITIAL_APPLICATIONS
  );

  const [currentApplicationId, setCurrentApplicationId] =
    useState<string>('');

  const [rules, setRules] = useState<RegulatoryRule[]>(
    INITIAL_RULES
  );

  const [complianceList, setComplianceList] =
    useState<ComplianceObligation[]>(
      INITIAL_COMPLIANCE_OBLIGATIONS
    );

  const [auditLogs, setAuditLogs] =
    useState<AuditLogEvent[]>(INITIAL_AUDIT_LOGS);

  // Load saved notifications when the application starts.
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(loadNotifications);

  const [academicYear, setAcademicYear] =
    useState<string>('2026 - 2027');

  const [searchQuery, setSearchQuery] = useState<string>('');

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const currentApplication =
    applications.find(
      (app) =>
        app.id === currentApplicationId ||
        app.applicationNumber === currentApplicationId
    ) ?? null;

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Persist notification changes across page refreshes.
  useEffect(() => {
    try {
      localStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error('Could not save notifications:', error);
    }
  }, [notifications]);

  // ==================== GENERAL HELPERS ====================

  const addNotification = (
    title: string,
    message: string,
    type: NotificationItem['type'],
    linkTarget?: string
  ) => {
    const notification: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      message,
      timestamp: new Date().toLocaleString(),
      read: false,
      type,
      linkTarget,
    };

    setNotifications((previous) => [
      notification,
      ...previous,
    ]);
  };

  const addAuditLog = (
    action: string,
    entityId: string,
    details: string
  ) => {
    const log = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      actor: currentUser.name,
      role: currentUser.role,
      action,
      entityType: 'Application',
      entityId,
      details,
      hash: '',
    } as AuditLogEvent;

    setAuditLogs((previous) => [log, ...previous]);
  };

  const setRole = (role: UserRole) => {
    const matchingProfile = INITIAL_PROFILES.find(
      (profile) => profile.role === role
    );

    if (matchingProfile) {
      setCurrentUser(matchingProfile);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  // ==================== APPLICATION WORKFLOW ====================

  const createNewApplication = (
    newApp: Partial<ApplicationRecord>
  ): string => {
    const id = `app-${Date.now()}`;

    const application = {
      id,
      applicationNumber: `APP-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-5)}`,
      institutionId: currentUser.institutionId ?? '',
      institutionName: currentUser.institutionName ?? '',
      institutionType: '',
      state: '',
      district: '',
      address: '',
      contactPerson: currentUser.name,
      contactEmail: currentUser.email,
      contactPhone: '',
      aisheCode: '',
      applicationType: 'New Institute / New Program',
      academicYear,
      submissionDate: new Date().toLocaleString(),
      currentStage: 'Draft',
      assignedOfficer: '',
      lastUpdated: new Date().toLocaleString(),
      programs: [],
      documents: [],
      verificationChecks: [],
      deficiencies: [],
      ...newApp,
      id,
    } as ApplicationRecord;

    setApplications((previous) => [
      application,
      ...previous,
    ]);

    setCurrentApplicationId(id);

    addAuditLog(
      'APPLICATION_CREATED',
      application.applicationNumber,
      'A new application draft was created.'
    );

    addToast(
      'Application Created',
      'Your application draft has been created.',
      'success'
    );

    return id;
  };

  const updateApplicationStatus = (
    appId: string,
    newStatus: ApplicationRecord['currentStage'],
    remarks?: string
  ) => {
    setApplications((previous) =>
      previous.map((app) =>
        app.id === appId
          ? {
              ...app,
              currentStage: newStatus,
              lastUpdated: new Date().toLocaleString(),
            }
          : app
      )
    );

    addAuditLog(
      'APPLICATION_STATUS_UPDATED',
      appId,
      `Status changed to ${newStatus}. ${remarks ?? ''}`
    );

    addToast(
      'Status Updated',
      `Application status changed to ${newStatus}.`,
      'success'
    );
  };

  const raiseDeficiency = (
    appId: string,
    deficiency: Omit<DeficiencyItem, 'id' | 'raisedDate' | 'status'>
  ) => {
    const application = applications.find(
      (app) => app.id === appId
    );

    if (!application) {
      addToast('Error', 'Application not found.', 'error');
      return;
    }

    const newDeficiency = {
      ...deficiency,
      id: `def-${Date.now()}`,
      applicationId: appId,
      applicationRef: application.applicationNumber,
      institutionName: application.institutionName,
      raisedDate: new Date().toLocaleString(),
      status: 'Open',
    } as DeficiencyItem;

    setApplications((previous) =>
      previous.map((app) =>
        app.id === appId
          ? {
              ...app,
              currentStage: 'Deficiency Raised',
              lastUpdated: new Date().toLocaleString(),
              deficiencies: [
                ...app.deficiencies,
                newDeficiency,
              ],
            }
          : app
      )
    );

    addNotification(
      'New Deficiency Raised',
      `A deficiency has been raised for ${application.applicationNumber}.`,
      'deficiency',
      '/app/deficiencies'
    );

    addAuditLog(
      'DEFICIENCY_RAISED',
      application.applicationNumber,
      newDeficiency.description
    );

    addToast(
      'Deficiency Raised',
      'The deficiency has been recorded.',
      'success'
    );
  };

  const resolveDeficiency = (
    appId: string,
    defId: string,
    response: string,
    newDocName?: string
  ) => {
    setApplications((previous) =>
      previous.map((app) => {
        if (app.id !== appId) return app;

        const updatedDeficiencies = app.deficiencies.map(
          (deficiency) =>
            deficiency.id === defId
              ? {
                  ...deficiency,
                  institutionResponse: response,
                  resubmittedEvidenceName: newDocName,
                  status: 'Response Submitted' as const,
                }
              : deficiency
        );

        return {
          ...app,
          deficiencies: updatedDeficiencies,
          currentStage: 'Resubmitted',
          lastUpdated: new Date().toLocaleString(),
        };
      })
    );

    addNotification(
      'Deficiency Response Submitted',
      'A response has been submitted for review.',
      'submission',
      '/app/deficiencies'
    );

    addAuditLog(
      'DEFICIENCY_RESPONSE_SUBMITTED',
      appId,
      `Response submitted for deficiency ${defId}.`
    );

    addToast(
      'Response Submitted',
      'Your deficiency response has been recorded.',
      'success'
    );
  };

  const updateVerificationCheck = (
    appId: string,
    checkId: string,
    status: VerificationCheck['status'],
    remarks: string
  ) => {
    setApplications((previous) =>
      previous.map((app) =>
        app.id === appId
          ? {
              ...app,
              verificationChecks: app.verificationChecks.map(
                (check) =>
                  check.id === checkId
                    ? {
                        ...check,
                        status,
                        remarks,
                        reviewedBy: currentUser.name,
                        timestamp: new Date().toLocaleString(),
                      }
                    : check
              ),
              lastUpdated: new Date().toLocaleString(),
            }
          : app
      )
    );

    addAuditLog(
      'VERIFICATION_CHECK_UPDATED',
      appId,
      `Verification check ${checkId} updated to ${status}.`
    );

    addToast(
      'Verification Updated',
      `Verification status: ${status}.`,
      'success'
    );
  };

  const submitEvcReport = (
    evcId: string,
    checklist: any[],
    recommendation: string
  ) => {
    setApplications((previous) =>
      previous.map((app) => {
        if (
          app.evcCase?.id !== evcId &&
          app.id !== evcId
        ) {
          return app;
        }

        return {
          ...app,
          currentStage: 'EVC Report Submitted',
          lastUpdated: new Date().toLocaleString(),
          evcCase: {
            ...app.evcCase,
            checklist,
            recommendation,
            status: 'Report Submitted',
          },
        } as ApplicationRecord;
      })
    );

    addNotification(
      'EVC Report Submitted',
      'The Expert Visiting Committee report has been submitted.',
      'evc',
      '/app/evc'
    );

    addAuditLog(
      'EVC_REPORT_SUBMITTED',
      evcId,
      `EVC recommendation: ${recommendation}`
    );

    addToast(
      'Report Submitted',
      'The EVC report has been submitted.',
      'success'
    );
  };

  const recordDecision = (
    appId: string,
    decisionType: 'Approved' | 'Rejected' | 'Returned for Correction',
    reason: string
  ) => {
    setApplications((previous) =>
      previous.map((app) =>
        app.id === appId
          ? {
              ...app,
              currentStage: decisionType,
              lastUpdated: new Date().toLocaleString(),
              decision: {
                type: decisionType,
                date: new Date().toISOString().slice(0, 10),
                officer: currentUser.name,
                orderNumber: `ORD-${Date.now()}`,
                reason,
                validityPeriod:
                  decisionType === 'Approved'
                    ? academicYear
                    : '',
              },
            }
          : app
      )
    );

    const notificationType: NotificationItem['type'] =
      decisionType === 'Approved' ? 'approval' : 'info';

    addNotification(
      `Application ${decisionType}`,
      reason,
      notificationType,
      '/app/approvals'
    );

    addAuditLog(
      'DECISION_RECORDED',
      appId,
      `${decisionType}: ${reason}`
    );

    addToast(
      'Decision Recorded',
      `Application marked as ${decisionType}.`,
      'success'
    );
  };

  const submitComplianceEvidence = (
    compObligationId: string,
    evidenceFileName: string
  ) => {
    setComplianceList((previous) =>
      previous.map((item) =>
        item.id === compObligationId
          ? {
              ...item,
              status: 'Awaiting Review',
              submittedEvidenceName: evidenceFileName,
              lastUpdated: new Date().toLocaleString(),
            }
          : item
      )
    );

    addNotification(
      'Compliance Evidence Submitted',
      `Evidence submitted: ${evidenceFileName}`,
      'submission',
      '/app/compliance'
    );

    addAuditLog(
      'COMPLIANCE_EVIDENCE_SUBMITTED',
      compObligationId,
      `Evidence file: ${evidenceFileName}`
    );

    addToast(
      'Evidence Submitted',
      'Compliance evidence has been submitted for review.',
      'success'
    );
  };

  // ==================== TOASTS ====================

  const addToast = (
    title: string,
    message: string,
    type: ToastType = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    setToasts((previous) => [
      ...previous,
      { id, title, message, type },
    ]);

    window.setTimeout(() => {
      setToasts((previous) =>
        previous.filter((toast) => toast.id !== id)
      );
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((previous) =>
      previous.filter((toast) => toast.id !== id)
    );
  };

  // ==================== RESET DEMO DATA ====================

  const resetAllDemoData = () => {
    setCurrentUser(INITIAL_PROFILES[0]);
    setApplications(INITIAL_APPLICATIONS);
    setCurrentApplicationId('');
    setRules(INITIAL_RULES);
    setComplianceList(INITIAL_COMPLIANCE_OBLIGATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAcademicYear('2026 - 2027');
    setSearchQuery('');
    setToasts([]);

    try {
      localStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(INITIAL_NOTIFICATIONS)
      );
    } catch (error) {
      console.error('Could not reset notifications:', error);
    }
  };

  // ==================== PROVIDER VALUE ====================

  const value: AppContextType = {
    currentUser,
    setRole,
    applications,
    currentApplication,
    setCurrentApplicationId,
    rules,
    complianceList,
    auditLogs,
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
    academicYear,
    setAcademicYear,
    searchQuery,
    setSearchQuery,
    createNewApplication,
    updateApplicationStatus,
    raiseDeficiency,
    resolveDeficiency,
    updateVerificationCheck,
    submitEvcReport,
    recordDecision,
    submitComplianceEvidence,
    addToast,
    toasts,
    removeToast,
    resetAllDemoData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// ==================== CUSTOM HOOK ====================

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used inside an AppProvider.'
    );
  }

  return context;
};