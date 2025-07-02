# Script to create PostgreSQL database if it doesn't exist
try {
    # Define PostgreSQL path
    $pgBinPath = "C:\Program Files\PostgreSQL\14\bin"
    $psqlCmd = Join-Path -Path $pgBinPath -ChildPath "psql.exe"
    
    # Check if psql exists at the specified location
    if (-not (Test-Path -Path $psqlCmd)) {
        Write-Host "PostgreSQL executable not found at $psqlCmd" -ForegroundColor Red
        Write-Host "Please ensure PostgreSQL is installed correctly" -ForegroundColor Red
        exit 1
    }
    
    # Import environment variables from .env
    $envContent = Get-Content -Path ".\.env" -ErrorAction Stop
    foreach ($line in $envContent) {
        if ($line -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            if ($key -eq "DATABASE_URL") {
                $dbUrl = $value
            }
        }
    }

    # Parse the connection string
    if ($dbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)') {
        $username = $Matches[1]
        $password = $Matches[2]
        $pgHost = $Matches[3]    # Renamed variable to avoid conflict with built-in $host
        $port = $Matches[4]
        $dbname = $Matches[5]
        
        # Export as environment variables for psql
        $env:PGUSER = $username
        $env:PGPASSWORD = $password
        $env:PGHOST = $pgHost
        $env:PGPORT = $port
        
        # Check if database exists
        $checkDb = & $psqlCmd -c "SELECT 1 FROM pg_database WHERE datname = '$dbname'" postgres
        
        if ($checkDb -notmatch '1 row') {
            Write-Host "Creating database $dbname..." -ForegroundColor Green
            & $psqlCmd -c "CREATE DATABASE $dbname" postgres
            
            # Create UUID extension
            Write-Host "Creating UUID extension..." -ForegroundColor Green
            & $psqlCmd -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" $dbname
            
            # Initialize database schema
            if (Test-Path -Path ".\db\create_database.sql") {
                Write-Host "Initializing database schema from create_database.sql..." -ForegroundColor Green
                & $psqlCmd -d $dbname -f ".\db\create_database.sql"
            }
            
            if (Test-Path -Path ".\db\create_tables.sql") {
                Write-Host "Initializing database schema from create_tables.sql..." -ForegroundColor Green
                # Replace \c nivra; with -- \c nivra; to avoid connection errors
                $tablesContent = Get-Content -Path ".\db\create_tables.sql" -Raw
                $tablesContent = $tablesContent -replace "\\c nivra;", "-- \c nivra;"
                $tablesContent | Out-File -FilePath ".\db\temp_tables.sql" -Encoding UTF8
                & $psqlCmd -d $dbname -f ".\db\temp_tables.sql"
                Remove-Item -Path ".\db\temp_tables.sql" -Force
                
                # Load sample data if available
                if (Test-Path -Path ".\db\sample_data.sql") {
                    Write-Host "Loading sample data..." -ForegroundColor Green
                    & $psqlCmd -d $dbname -f ".\db\sample_data.sql"
                }
                
                # Load RBAC sample data if available
                if (Test-Path -Path ".\db\rbac_sample_data.sql") {
                    Write-Host "Loading RBAC sample data..." -ForegroundColor Green
                    & $psqlCmd -d $dbname -f ".\db\rbac_sample_data.sql"
                }
            }
        } else {
            Write-Host "Database $dbname already exists." -ForegroundColor Green
        }
    } else {
        Write-Host "Could not parse DATABASE_URL from .env file." -ForegroundColor Red
    }
} catch {
    Write-Host "Error setting up database: $_" -ForegroundColor Red
}
