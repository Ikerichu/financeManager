from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Float, Date, ForeignKey, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from datetime import datetime, timezone

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    lastname: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)

    transactions: Mapped[List["Transaction"]] = relationship(back_populates="user")

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "lastname": self.lastname,
            "email": self.email
        }
    
class Category(db.Model):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)

    transactions: Mapped[List["Transaction"]] = relationship(back_populates="category")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name
        }

class Transaction(db.Model):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)

    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str] = mapped_column(String(255))

    type: Mapped[str] = mapped_column(Enum("income", "expense", name="transaction_type"), nullable=False)

    date: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=True)

    user: Mapped["User"] = relationship(back_populates="transactions")
    category: Mapped["Category"] = relationship(back_populates="transactions")

    def serialize(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "description": self.description,
            "type": self.type,
            "date": self.date.isoformat() if self.date else None,
            "user_id": self.user_id,
            "category_id": self.category_id if self.category_id else 1,
            "category": self.category.name if self.category else "Default"
        }

def create_default_category():
    from .models import Category  # importa tu modelo
    general = Category.query.get(1)
    if not general:
        general = Category(id=1, name="General")
        db.session.add(general)
        db.session.commit()