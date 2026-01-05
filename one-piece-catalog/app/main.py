from fastapi import FastAPI, HTTPException
from app.db.database import engine
import sqlalchemy
app = FastAPI()

@app.get("/health")
async def read_health():
    return {"status": "healthy"}

@app.get("/db_test")
async def read_db_test():
    try:
        with engine.connect() as connection:
            connection.execute(sqlalchemy.text("SELECT 1"))
        return {"status": "database connection successful"}    
    except Exception as e:
        raise HTTPException(status_code=503, detail={
            "status": "database connection failed",
            "database":"connection failed",
            "error": str(e)
        })
        
