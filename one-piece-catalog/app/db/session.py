from sqlalchemy.orm import sessionmaker
from app.db.database import engine

# Create a configured "Session" class for database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)
# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        print("Closing DB session")
        db.close()
