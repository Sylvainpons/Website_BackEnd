const API = "http://127.0.0.1:8000";

// Récupérer l'ID dans l'URL
const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('id');

async function loadItemDetails() {
  if (!itemId) {
    document.querySelector('.container').innerHTML = "<h2 style='text-align:center; color:white;'>Aucun item spécifié.</h2>";
    return;
  }

  try {
    // On lance toutes les requêtes en parallèle pour aller plus vite
    // 1. L'item lui-même
    // 2. Les images de l'item
    // 3. Les catégories (pour avoir le nom)
    // 4. Les sous-catégories (pour avoir le nom)
    const [itemRes, imgRes, catRes, subcatRes] = await Promise.all([
      fetch(`${API}/items/${itemId}`),
      fetch(`${API}/images/item/${itemId}`),
      fetch(`${API}/categories`),
      fetch(`${API}/subcategories`)
    ]);

    if (!itemRes.ok) throw new Error("Item non trouvé");

    const item = await itemRes.json();
    const images = await imgRes.json();
    const categories = await catRes.json();
    const subcategories = await subcatRes.json();

    // Trouver les noms des catégories
    const category = categories.find(c => c.id === item.category_id);
    const subcategory = subcategories.find(sc => sc.id === item.subcategory_id);

    // --- Remplissage du HTML ---

    // 1. Textes
    document.getElementById("itemTitle").textContent = item.title;
    document.getElementById("itemDescription").textContent = item.description || "Aucune description.";
    document.getElementById("itemYear").textContent = item.year;
    document.getElementById("itemCategory").textContent = category ? category.name : "Inconnu";
    document.getElementById("itemSubcategory").textContent = subcategory ? subcategory.name : "Inconnu";

    // 2. Lien externe
    const linkBtn = document.getElementById("externalLink");
    if (item.external_link) {
      linkBtn.href = item.external_link;
      linkBtn.style.display = "inline-block";
    }

    // 3. Gestion Images
    const mainImgEl = document.getElementById("mainImage");
    const thumbContainer = document.getElementById("thumbnailsGrid");

    // Image principale par défaut
    const mainImageObj = images.find(img => img.is_main) || images[0];
    
    if (mainImageObj) {
      mainImgEl.src = `${API}${mainImageObj.url}`;
    } else {
      mainImgEl.src = "https://via.placeholder.com/600x400?text=Pas+d'image";
    }

    // Génération des miniatures
    if (images.length > 0) {
      images.forEach(img => {
        const thumb = document.createElement("img");
        thumb.src = `${API}${img.url}`;
        thumb.className = "thumb";
        if(img.url === mainImageObj?.url) thumb.classList.add("active");

        // Clic sur miniature
        thumb.onclick = () => {
          // Change l'image principale
          mainImgEl.src = `${API}${img.url}`;
          
          // Gère la classe active (bordure bleue)
          document.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
          thumb.classList.add("active");
        };

        thumbContainer.appendChild(thumb);
      });
    }

    // Tout est prêt, on affiche
    document.getElementById("loading").style.display = "none";
    document.getElementById("itemDetail").style.display = "flex"; // "flex" pour garder la mise en page CSS

  } catch (error) {
    console.error(error);
    document.querySelector('.container').innerHTML = `
      <div class="no-results">
        <h2>Erreur</h2>
        <p>Impossible de charger l'item. Il a peut-être été supprimé.</p>
        <a href="index.html" class="back-link">Retour au catalogue</a>
      </div>
    `;
  }
}
/* =====================================================
   GESTION DU ZOOM (LIGHTBOX)
===================================================== */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImage");
const mainImageEl = document.getElementById("mainImage");
const closeBtn = document.querySelector(".close-lightbox");

// 1. Ouvrir le zoom au clic sur l'image principale
mainImageEl.addEventListener("click", () => {
  // On récupère la source actuelle de l'image principale
  if (mainImageEl.src) {
    lightbox.style.display = "flex"; // Utiliser flex pour centrer
    // Petit ajustement CSS via JS pour centrer parfaitement avec Flexbox
    lightbox.style.alignItems = "center"; 
    lightbox.style.justifyContent = "center";
    
    lightboxImg.src = mainImageEl.src;
  }
});

// 2. Fermer avec la croix
closeBtn.addEventListener("click", () => {
  lightbox.style.display = "none";
});

// 3. Fermer en cliquant n'importe où sur le fond noir
lightbox.addEventListener("click", (e) => {
  // Si on clique sur le fond (lightbox) et pas sur l'image
  if (e.target === lightbox) {
    lightbox.style.display = "none";
  }
});

// 4. Fermer avec la touche ECHAP (Optionnel mais pratique)
document.addEventListener('keydown', (e) => {
  if (e.key === "Escape" && lightbox.style.display !== "none") {
    lightbox.style.display = "none";
  }
});

// Lancer le chargement
loadItemDetails();