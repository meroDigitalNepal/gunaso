#!/usr/bin/env bash
# Add a staff or admin user for a Representative.
# Run from the repo root after add-rep.sh has been run.
#
# Usage:
#   ./infra/add-staff.sh
#
# Prerequisites: azure-cli (az), psql

set -euo pipefail

# ─── Must match provision-shared.sh ──────────────────────────────────────────
DB_SERVER="gunaso-pg"
DB_NAME="gunaso"
DB_ADMIN_USER="gunasodbadmin"
# ─────────────────────────────────────────────────────────────────────────────

read -rp "Staff email (their Microsoft account): " STAFF_EMAIL
read -rp "Representative subdomain (e.g. john): " REP_SUBDOMAIN
read -rp "Role [admin/staff] (default: staff): " ROLE
ROLE="${ROLE:-staff}"

if [[ "$ROLE" != "admin" && "$ROLE" != "staff" ]]; then
  echo "Error: role must be 'admin' or 'staff'"
  exit 1
fi

echo ""
echo "Looking up Entra Object ID for ${STAFF_EMAIL}..."
ENTRA_OID=$(az ad user show --id "$STAFF_EMAIL" --query id -o tsv 2>/dev/null || true)
if [[ -z "$ENTRA_OID" ]]; then
  # Guest users have a mangled UPN (email_domain#EXT#@tenant); search by mail attribute instead
  ENTRA_OID=$(az ad user list \
    --filter "mail eq '${STAFF_EMAIL}'" \
    --query "[0].id" -o tsv 2>/dev/null || true)
fi
if [[ -z "$ENTRA_OID" ]]; then
  echo "Error: could not find an Entra user with email '${STAFF_EMAIL}'."
  echo "Make sure they have accepted their guest invitation in your Azure AD tenant."
  exit 1
fi
echo "   OID: $ENTRA_OID"

echo ""
echo "Looking up Representative ID for subdomain '${REP_SUBDOMAIN}'..."
read -rsp "Database admin password: " DB_ADMIN_PASSWORD
echo ""
DATABASE_URL="postgresql://${DB_ADMIN_USER}:${DB_ADMIN_PASSWORD}@${DB_SERVER}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require"

REP_ID=$(psql "$DATABASE_URL" -t -A -c \
  "SELECT id FROM mps WHERE subdomain = '${REP_SUBDOMAIN}'" 2>/dev/null || true)

if [[ -z "$REP_ID" ]]; then
  echo "Error: no Representative found with subdomain '${REP_SUBDOMAIN}'."
  echo "Run add-rep.sh first, or check the subdomain spelling."
  exit 1
fi
echo "   Representative ID: $REP_ID"

echo ""
psql "$DATABASE_URL" -c "
  INSERT INTO users (id, entra_oid, mp_id, role)
  VALUES (gen_random_uuid(), '${ENTRA_OID}', '${REP_ID}', '${ROLE}')
  ON CONFLICT (entra_oid) DO UPDATE SET role = EXCLUDED.role;
"

echo ""
echo "✅ ${STAFF_EMAIL} added as ${ROLE} for ${REP_SUBDOMAIN}."
echo "   They can now sign in at https://${REP_SUBDOMAIN}.sachivalaya.org/gunaso/login"
