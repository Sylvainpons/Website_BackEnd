from dotenv import load_dotenv
import os
import sqlalchemy

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set.")

try:   
    engine = sqlalchemy.create_engine(DATABASE_URL)
    with engine.connect() as connection:
        print("Database engine created successfully.")

except Exception as e:
    print("Error creating the database engine:", e)
    raise
metadata = sqlalchemy.MetaData()

