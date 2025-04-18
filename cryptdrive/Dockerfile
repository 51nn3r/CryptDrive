FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY cryptdrive/frontend/package*.json ./
RUN npm ci
COPY cryptdrive/frontend ./
RUN npm run build

FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY cryptdrive/ .

COPY --from=frontend /app/frontend/build /app/frontend/build

RUN python manage.py collectstatic --noinput

EXPOSE 8000