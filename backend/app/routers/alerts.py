from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from ..database.database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[schemas.Alert])
def get_alerts(
    status: str = None,
    severity: str = None,
    truck_id: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Alert)
    
    if status:
        query = query.filter(models.Alert.status == status)
    if severity:
        query = query.filter(models.Alert.severity == severity)
    if truck_id:
        query = query.filter(models.Alert.truck_id == truck_id)
    
    alerts = query.order_by(models.Alert.timestamp.desc()).all()
    return alerts

@router.post("/", response_model=schemas.Alert)
def create_alert(alert: schemas.AlertCreate, db: Session = Depends(get_db)):
    db_alert = models.Alert(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.get("/active", response_model=List[schemas.Alert])
def get_active_alerts(db: Session = Depends(get_db)):
    """Get all active alerts"""
    alerts = db.query(models.Alert).filter(
        models.Alert.status == "active"
    ).order_by(models.Alert.timestamp.desc()).all()
    return alerts

@router.get("/expiry", response_model=dict)
def get_expiry_alerts(db: Session = Depends(get_db)):
    """Get trucks with expiring documents"""
    today = datetime.now().strftime("%Y-%m-%d")
    thirty_days_later = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
    
    trucks = db.query(models.Truck).all()
    
    insurance_expiring = []
    fitness_expiring = []
    
    for truck in trucks:
        if truck.insurance_expiry and truck.insurance_expiry <= thirty_days_later:
            insurance_expiring.append({
                "truck_id": truck.id,
                "registration": truck.registration_number,
                "expiry_date": truck.insurance_expiry
            })
        
        if truck.fitness_expiry and truck.fitness_expiry <= thirty_days_later:
            fitness_expiring.append({
                "truck_id": truck.id,
                "registration": truck.registration_number,
                "expiry_date": truck.fitness_expiry
            })
    
    return {
        "insurance_expiring": insurance_expiring,
        "fitness_expiring": fitness_expiring
    }
