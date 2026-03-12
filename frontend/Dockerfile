# 1. On utilise Nginx en version Alpine (c'est une version Linux minuscule, l'image fera moins de 50 Mo)
FROM nginx:alpine

# 2. On supprime la page d'accueil par défaut de Nginx pour faire place nette
RUN rm -rf /usr/share/nginx/html/*

# 3. On copie tout ton HTML, CSS et JS dans le dossier que Nginx utilise pour afficher les sites web
COPY . /usr/share/nginx/html

# 4. On expose le port 80 (le port standard pour le web)
EXPOSE 80

# 5. On lance Nginx en premier plan pour que le conteneur reste en vie
CMD ["nginx", "-g", "daemon off;"]