from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, default="student")
    xp = Column(Integer, default=0)
    
    # Relationships
    completed_worlds = relationship("CompletedWorld", back_populates="user", cascade="all, delete-orphan")
    mistakes = relationship("Mistake", back_populates="user", cascade="all, delete-orphan")
    prompt_history = relationship("PromptHistory", back_populates="user", cascade="all, delete-orphan")

class CompletedWorld(Base):
    __tablename__ = "completed_worlds"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    world_id = Column(Integer)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="completed_worlds")

class Mistake(Base):
    __tablename__ = "mistakes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic = Column(String, index=True)
    count = Column(Integer, default=0)

    user = relationship("User", back_populates="mistakes")

class PromptHistory(Base):
    __tablename__ = "prompt_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    prompt_text = Column(String)
    score = Column(Integer)
    grade = Column(String)
    grade_label = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="prompt_history")
