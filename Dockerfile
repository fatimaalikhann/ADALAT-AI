FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc g++ libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN echo 'import os\nimport subprocess\nport = os.environ.get("PORT", "8000")\nsubprocess.run(["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", port])' > start.py

CMD ["python", "start.py"]
