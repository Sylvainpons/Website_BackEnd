FROM python:3.11-slim

WORKDIR /app

# L'ASTUCE OPS : On force Python à comprendre où est la racine du projet
ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]