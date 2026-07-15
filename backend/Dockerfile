# Build context = repo root (see docker-compose / Railway service settings):
# the image bakes in data/ (model pickle + route CSV) so it runs anywhere.
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app/ ./app/
COPY data/ ./data/

ENV MODEL_PATH=/app/data/model_artifacts_v2.pkl

EXPOSE 8000
# ${PORT} is injected by Railway; defaults to 8000 for compose/local
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
