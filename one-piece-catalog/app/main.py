from fastapi import FastAPI, HTTPException, Depends
from app.db.session import get_db
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
        return {"status": "database connection successful good job"}    
    except Exception as e:
        raise HTTPException(status_code=503, detail={
            "status": "database connection failed",
            "database":"connection failed",
            "error": str(e)
        })
        
@app.get("/db_session_test")
async def read_db_session_test(db=Depends(get_db)):
    try:
        result = db.execute(sqlalchemy.text("SELECT 1")).fetchone()
        if result and result[0] == 1:
            return {"status": "database session successful"}
        else:
            raise HTTPException(status_code=503, detail={
                "status": "database session failed",
                "database":"unexpected result"
            })
    except Exception as e:
        raise HTTPException(status_code=503, detail={
            "status": "database session failed",
            "database":"session error",
            "error": str(e)
        })