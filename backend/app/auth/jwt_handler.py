from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv

# Cargar variables de entorno del PMS
load_dotenv("SB314.env")

# Configuración de JWT
SECRET_KEY = os.getenv("JWT_SECRET", "SECRET_KEY_SB314")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas para mayor comodidad en desarrollo

# Instancia para extraer el token automáticamente en FastAPI
security = HTTPBearer()

def create_access_token(data: dict) -> str:
    """
    Generate a Official JWT Token with expiration time
    """
    to_encode = data.copy()
    
    # Usamos timezone.utc porque datetime.utcnow() está deprecado en versiones nuevas de Python
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify received JWT token.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="El token ha expirado")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")