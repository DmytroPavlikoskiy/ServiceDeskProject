from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, func, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base


# User
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    telegram_id: Mapped[int | None] = mapped_column(BigInteger, unique=True, nullable=True)
    email: Mapped[str] = mapped_column(String(225), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="client", nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    password: Mapped[str] = mapped_column(String, nullable=False)

    tickets: Mapped[list["Ticket"]] = relationship("Ticket", back_populates="client")
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="author")


# Ticket
class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="open")  # open, in_progress, closed
    priority: Mapped[str] = mapped_column(String(50), default="medium")  # low, medium, high
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    client_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    client: Mapped["User"] = relationship("User", back_populates="tickets")

    files: Mapped[list["File"]] = relationship("File", back_populates="ticket")
    chat: Mapped["Chat"] = relationship("Chat", back_populates="ticket", uselist=False)


# File
class File(Base):
    __tablename__ = "files"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(255), nullable=False)
    uploaded_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id"), nullable=False)
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="files")


#chat
class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    ticket_id: Mapped[int] = mapped_column(ForeignKey("tickets.id"), nullable=False)
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="chat")

    client_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    client: Mapped["User"] = relationship("User", foreign_keys=[client_id])

    master_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    master: Mapped["User"] = relationship("User", foreign_keys=[master_id])

    messages: Mapped[list["Message"]] = relationship("Message", back_populates="chat")


# Message
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    chat_id: Mapped[int] = mapped_column(ForeignKey("chats.id"), nullable=False)
    chat: Mapped["Chat"] = relationship("Chat", back_populates="messages")

    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    author: Mapped["User"] = relationship("User", back_populates="messages")