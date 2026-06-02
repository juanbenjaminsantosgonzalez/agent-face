# Face Agent — Reconocimiento Facial con Azure Cognitive Services

Stack: **FastAPI (Python)** + **React + Vite** + **Azure Face API**

---

## Requisitos

- Python 3.11+
- Node.js 18+
- Cuenta Azure con recurso **Face** (Cognitive Services)

---

## 1. Obtener credenciales Azure

1. Ingresa a https://portal.azure.com
2. Crea un recurso → busca **"Face"**
3. Una vez creado, ve a **Keys and Endpoint**
4. Copia **KEY 1** y el **Endpoint**

---

## 2. Backend (FastAPI)

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar credenciales
cp .env.example .env
# Edita .env y pega tu AZURE_FACE_KEY y AZURE_FACE_ENDPOINT

# Correr el servidor
uvicorn app.main:app --reload --port 8000
```

Swagger disponible en: http://localhost:8000/docs

---

## 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend en: http://localhost:5173

---

## Endpoints

| Método | Ruta                              | Descripción                      |
|--------|-----------------------------------|----------------------------------|
| POST   | /face-detection/detect            | Detecta rostros en una imagen    |
| POST   | /identity-verification/verify     | Verificación 1:1 entre 2 imágenes|
| POST   | /face-attributes/analyze          | Edad, género, emociones y más    |

### Ejemplo con curl

```bash
# Detectar rostros
curl -X POST http://localhost:8000/face-detection/detect \
  -H "Content-Type: application/json" \
  -H "x-api-key: demo-key-2025" \
  -d '{"imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa.jpg/800px-Mona_Lisa.jpg"}'

# Analizar atributos
curl -X POST http://localhost:8000/face-attributes/analyze \
  -H "Content-Type: application/json" \
  -H "x-api-key: demo-key-2025" \
  -d '{"imageUrl": "https://example.com/foto.jpg"}'
```

---

## Estructura

```
face-agent/
├── backend/
│   ├── app/
│   │   ├── main.py                    ← FastAPI app + CORS + routers
│   │   ├── core/
│   │   │   ├── config.py              ← Settings con pydantic-settings
│   │   │   └── security.py            ← API Key guard
│   │   ├── services/
│   │   │   └── azure_face.py          ← Cliente HTTP real a Azure
│   │   ├── models/
│   │   │   └── schemas.py             ← DTOs con Pydantic v2
│   │   └── routers/
│   │       ├── face_detection.py
│   │       ├── identity_verification.py
│   │       └── face_attributes.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx / App.css
    │   ├── main.jsx
    │   ├── hooks/useApi.js            ← fetch + logs + estado
    │   └── components/
    │       ├── DetectPanel.jsx
    │       ├── VerifyPanel.jsx
    │       ├── AttributesPanel.jsx
    │       └── LogBox.jsx
    ├── index.html
    ├── vite.config.js
    └── .env
```
