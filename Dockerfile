FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc g++ libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install google-genai==2.10.0 --no-cache-dir

COPY . .

CMD uvicorn api.main:app --host 0.0.0.0 --port $PORT
