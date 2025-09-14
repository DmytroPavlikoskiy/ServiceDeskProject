from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from backend.settings.settings import settings
#Engine
engine = create_engine(url=settings.DATABASE_URL, echo=True)
#Session
sessionLocal = sessionmaker(autocommit=False ,autoflush=True, bind=engine)


#Base
class Base(DeclarativeBase):
    pass
