FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /cryptdrive
COPY requirements.txt /cryptdrive/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /cryptdrive

RUN python cryptdrive/manage.py collectstatic --noinput

EXPOSE 8000

# CMD ["python", "cryptdrive/manage.py", "runserver", "0.0.0.0:8000"]
