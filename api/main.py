from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints import society, resident, finance, user, role, permission, society_admin, auth, society_finance, resident_finance
from database import engine
import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Nivra API",
    description="Backend API for Nivra - Society Management System",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers for existing resources
app.include_router(society.router, prefix="/api/v1", tags=["Societies"])
app.include_router(resident.router, prefix="/api/v1", tags=["Residents"])
app.include_router(finance.router, prefix="/api/v1", tags=["Finances"])

# Include routers for RBAC
app.include_router(user.router, prefix="/api/v1", tags=["Users"])
app.include_router(role.router, prefix="/api/v1", tags=["Roles"])
app.include_router(permission.router, prefix="/api/v1", tags=["Permissions"])
app.include_router(society_admin.router, prefix="/api/v1", tags=["Society Admins"])
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(society_finance.router, prefix="/api/v1", tags=["Society Finances"])
app.include_router(resident_finance.router, prefix="/api/v1", tags=["Resident Finances"])


@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Welcome to Nivra API",
        "documentation": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server on http://localhost:8000")
    try:
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        print(f"Error starting server: {e}")
