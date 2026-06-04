from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, get_session
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerOut

router = APIRouter()


@router.get("")
async def list_customers(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
) -> dict:
    query = select(Customer).where(Customer.salon_id == current_user.salon_id)
    if search:
        query = query.where(Customer.full_name.ilike(f"%{search}%"))
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0
    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    return {"items": [CustomerOut.model_validate(c) for c in result.scalars().all()], "total": total, "page": page, "per_page": per_page}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_customer(
    data: CustomerCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> CustomerOut:
    customer = Customer(salon_id=current_user.salon_id, **data.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return CustomerOut.model_validate(customer)


@router.get("/{customer_id}")
async def get_customer(
    customer_id: UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> CustomerOut:
    result = await db.execute(select(Customer).where(Customer.id == customer_id, Customer.salon_id == current_user.salon_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerOut.model_validate(customer)
