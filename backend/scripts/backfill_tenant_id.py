"""
Backfill script: assigna tenant_id a registros existentes con tenant_id NULL.

Uso: python -m scripts.backfill_tenant_id
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.db.database import SessionLocal
from app.models.models import (
    Tenant, User, Company,
    DailyRequest, WorkShift, ShiftAssignment
)
from sqlalchemy import text

TABLES = [
    ("auth.users", User),
    ("business.companies", Company),

    ("business.daily_requests", DailyRequest),
    ("business.work_shifts", WorkShift),
    ("business.shift_assignments", ShiftAssignment),
]


def backfill():
    db = SessionLocal()

    # 1. Garantizar que existe al menos un tenant
    tenant = db.query(Tenant).first()
    if not tenant:
        print("Ningún tenant encontrado. Creando tenant por defecto...")
        admin_user = db.query(User).filter(User.role == 'admin').first()
        if not admin_user:
            admin_user = db.query(User).first()
        if not admin_user:
            print("ERROR: No hay usuarios en la DB. Cree un tenant manualmente.")
            db.close()
            return

        tenant = Tenant(
            name="Tenant por defecto",
            uuid="00000000-0000-0000-0000-000000000001",
            created_by=admin_user.id,
            updated_by=admin_user.id,
        )
        db.add(tenant)
        db.flush()

    print(f"Usando tenant ID={tenant.id} (uuid={tenant.uuid})")

    for table_name, model in TABLES:
        count = db.query(model).filter(model.tenant_id.is_(None)).count()
        if count > 0:
            db.execute(
                text(f"UPDATE {table_name} SET tenant_id = :tid WHERE tenant_id IS NULL"),
                {"tid": tenant.id}
            )
            db.flush()
            print(f"  {table_name}: {count} registros actualizados")
        else:
            print(f"  {table_name}: sin registros pendientes")

    db.commit()
    db.close()
    print("Backfill completado.")

    # 2. Establecer NOT NULL + FK si se desea (opcional, comentado)
    # for table_name, _ in TABLES:
    #     try:
    #         db.execute(text(
    #             f"ALTER TABLE {table_name} ALTER COLUMN tenant_id SET NOT NULL"
    #         ))
    #         print(f"  {table_name}: columna tenant_id ahora es NOT NULL")
    #     except Exception as e:
    #         print(f"  {table_name}: {e}")


if __name__ == "__main__":
    backfill()
