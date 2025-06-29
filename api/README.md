# Nivra API

This is the backend API for the Nivra application. It's built using FastAPI and PostgreSQL.

## Features

- RESTful API for managing societies, residents, and financial transactions
- Complete CRUD operations for all entities
- Relationship management between entities
- Data validation with Pydantic
- Interactive API documentation with Swagger UI and ReDoc
- Role-Based Access Control (RBAC) system 
- JWT authentication and authorization

## Technologies Used

- FastAPI: A modern, fast web framework for building APIs
- SQLAlchemy: SQL toolkit and ORM
- Pydantic: Data validation and settings management
- PostgreSQL: Relational database
- Uvicorn: ASGI server
- Python-Jose: JWT token handling
- Passlib: Password hashing

## Setup Instructions

### Prerequisites

- Python 3.8+
- PostgreSQL (Make sure it's running and you have created the `nivra` database)

### Installation

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables:

Edit the `.env` file to match your PostgreSQL settings and set up authentication:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nivra
SECRET_KEY=your_secret_key_for_jwt
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. Run the application:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Documentation

Once the application is running, you can access:

- Swagger UI documentation: http://localhost:8000/docs
- ReDoc documentation: http://localhost:8000/redoc

## API Endpoints

### Societies

- `GET /api/v1/societies/`: Get all societies
- `GET /api/v1/societies/{society_id}`: Get society by ID
- `POST /api/v1/societies/`: Create a new society
- `PUT /api/v1/societies/{society_id}`: Update a society
- `DELETE /api/v1/societies/{society_id}`: Delete a society

### Residents

- `GET /api/v1/residents/`: Get all residents
- `GET /api/v1/residents/{resident_id}`: Get resident by ID
- `POST /api/v1/residents/`: Create a new resident
- `PUT /api/v1/residents/{resident_id}`: Update a resident
- `DELETE /api/v1/residents/{resident_id}`: Delete a resident

### Finance Transactions

- `GET /api/v1/finances/`: Get all financial transactions
- `GET /api/v1/finances/{finance_id}`: Get financial transaction by ID
- `POST /api/v1/finances/`: Create a new financial transaction
- `PUT /api/v1/finances/{finance_id}`: Update a financial transaction
- `DELETE /api/v1/finances/{finance_id}`: Delete a financial transaction
- `GET /api/v1/residents/{resident_id}/finances/`: Get all financial transactions for a specific resident
- `GET /api/v1/societies/{society_id}/finances/summary`: Get financial summary for a society

### Authentication

- `POST /api/v1/auth/token`: Get JWT token (OAuth2 password flow)
- `GET /api/v1/auth/me`: Get current user information
- `POST /api/v1/auth/change-password`: Change current user's password
- `GET /api/v1/auth/user-permissions`: Get permissions for current user

### Users

- `GET /api/v1/users/`: Get all users
- `GET /api/v1/users/{user_id}`: Get user by ID
- `POST /api/v1/users/`: Create a new user
- `PUT /api/v1/users/{user_id}`: Update a user
- `DELETE /api/v1/users/{user_id}`: Delete a user (soft delete)
- `POST /api/v1/users/{user_id}/reset-password`: Reset user password
- `PUT /api/v1/users/{user_id}/toggle-active`: Toggle user active status
- `PUT /api/v1/users/{user_id}/update-last-login`: Update user last login time

### Roles

- `GET /api/v1/roles/`: Get all roles
- `GET /api/v1/roles/{role_id}`: Get role by ID
- `POST /api/v1/roles/`: Create a new role
- `PUT /api/v1/roles/{role_id}`: Update a role
- `DELETE /api/v1/roles/{role_id}`: Delete a role
- `GET /api/v1/roles/{role_id}/permissions`: Get permissions for a role
- `POST /api/v1/roles/{role_id}/permissions`: Add permission to role
- `DELETE /api/v1/roles/{role_id}/permissions/{permission_id}`: Remove permission from role

### Permissions

- `GET /api/v1/permissions/`: Get all permissions
- `GET /api/v1/permissions/{permission_id}`: Get permission by ID
- `POST /api/v1/permissions/`: Create a new permission
- `PUT /api/v1/permissions/{permission_id}`: Update a permission
- `DELETE /api/v1/permissions/{permission_id}`: Delete a permission
- `GET /api/v1/permissions/resource-types`: Get all resource types
- `GET /api/v1/permissions/actions`: Get all actions

### Society Administrators

- `GET /api/v1/society-admins/`: Get all society admin mappings
- `GET /api/v1/society-admins/{society_admin_id}`: Get society admin by ID
- `POST /api/v1/society-admins/`: Create a new society admin mapping
- `PUT /api/v1/society-admins/{society_admin_id}`: Update society admin mapping
- `DELETE /api/v1/society-admins/{society_admin_id}`: Delete society admin mapping
- `GET /api/v1/users/{user_id}/administered-societies`: Get societies administered by a user
- `GET /api/v1/societies/{society_id}/administrators`: Get administrators for a society

## RBAC Implementation

The API implements a comprehensive Role-Based Access Control (RBAC) system:

### Roles

1. **System Admin** (`system_admin`)
   - Full access to all resources and operations across the entire system

2. **Society Admin** (`society_admin`)
   - Full access to societies they administer
   - Can manage residents and financial records within their societies

3. **Committee Member** (`committee_member`)
   - Read, create, and update access (but not delete) to their society
   - Can manage residents and financial records within their society

4. **Resident** (`resident`)
   - Read-only access to society information
   - Can view resident information and financial records
   - Can update their own profile information

### Authentication Flow

1. Client calls `/api/v1/auth/token` with username and password
2. Server validates credentials and returns JWT token
3. Client includes token in subsequent requests via `Authorization: Bearer {token}` header
4. Server validates token and extracts user information for authorization checks

### Authorization Implementation

Access control is implemented using:
- Permission checking via the `RBACDependency` class
- Society-specific access control via `check_society_access` function
- Custom decorator `require_society_access` for endpoints that need society-specific checks

### Example: Authenticating and Accessing Protected Resources

```bash
# Get authentication token
curl -X POST "http://localhost:8000/api/v1/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=changeme123"

# Use token to access protected resource
curl -X GET "http://localhost:8000/api/v1/societies/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Development

The project structure is organized as follows:

```
api/
│
├── main.py               # Main application entry point
├── database.py           # Database connection and setup
├── models.py             # SQLAlchemy models
├── schemas.py            # Pydantic schemas for validation
├── rbac_utils.py         # Role-Based Access Control utilities
├── endpoints/            # API endpoint implementations
│   ├── __init__.py       # Package initialization
│   ├── society.py        # Society endpoints
│   ├── resident.py       # Resident endpoints
│   ├── finance.py        # Finance endpoints
│   ├── user.py           # User management endpoints
│   ├── role.py           # Role management endpoints
│   ├── permission.py     # Permission management endpoints
│   ├── society_admin.py  # Society admin management endpoints
│   └── auth.py           # Authentication and authorization endpoints
├── requirements.txt      # Project dependencies
├── .env                  # Environment variables
└── endpoints/            # API endpoints
    ├── __init__.py
    ├── society.py
    ├── resident.py
    └── finance.py
```
