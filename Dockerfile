# 1. On part d'une base Python légère (parfaite pour le Cloud)
FROM python:3.11-slim

# 2. On définit le dossier de travail dans le conteneur
WORKDIR /app

# 3. On copie D'ABORD le requirements.txt (Astuce de pro pour optimiser le cache Docker)
COPY requirements.txt .

# 4. On installe les dépendances sans garder le cache pour alléger l'image
RUN pip install --no-cache-dir -r requirements.txt

# 5. On copie tout le reste du code backend
COPY . .

# 6. On expose le port 8000 pour que le Load Balancer AWS puisse nous parler
EXPOSE 8000

# 7. La commande pour démarrer ton API
# /!\ Attention: Remplace "app.main:app" par le nom de ton fichier de lancement si besoin.
# Si ton fichier s'appelle main.py et que l'app s'appelle "app", c'est bon.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]