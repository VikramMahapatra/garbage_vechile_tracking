from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database.database import get_db
from ..models import models
from ..schemas import schemas

router = APIRouter(prefix="/routes", tags=["routes"])

@router.get("/", response_model=List[schemas.Route])
def get_routes(
    zone_id: str = None,
    ward_id: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Route)
    
    if zone_id:
        query = query.filter(models.Route.zone_id == zone_id)
    if ward_id:
        query = query.filter(models.Route.ward_id == ward_id)
    
    routes = query.all()
    return routes

@router.post("/", response_model=schemas.Route)
def create_route(route: schemas.RouteCreate, db: Session = Depends(get_db)):
    db_route = models.Route(**route.dict())
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

@router.get("/{route_id}/pickup-points", response_model=List[schemas.PickupPoint])
def get_route_pickup_points(route_id: str, db: Session = Depends(get_db)):
    pickup_points = db.query(models.PickupPoint).filter(
        models.PickupPoint.route_id == route_id
    ).all()
    return pickup_points
