db = db.getSiblingDB('smartstock_audit');

db.createCollection('audit_logs');

// Indexes
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ userId: 1 });
db.audit_logs.createIndex({ action: 1 });
db.audit_logs.createIndex({ entityType: 1 });

/*
Expected Audit Log Schema:
{
  userId: string,
  userName: string,
  action: string (CREATE, UPDATE, DELETE, EXPEDIÇÃO, LOGIN),
  entityType: string (PRODUCT, SUPPLIER, BATCH, PURCHASE_ORDER, USER),
  entityId: string,
  oldValue: object | null,
  newValue: object | null,
  metadata: object,
  timestamp: ISODate,
  ipAddress: string
}
*/
