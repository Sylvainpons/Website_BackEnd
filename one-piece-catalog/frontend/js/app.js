const API = "http://127.0.0.1:8000";

let allItems = [];
let allCategories = [];
let allSubcategories = [];
let selectedCategoryId = null;
let selectedSubcategoryId = null;

// Charger toutes les données au démarrage
async function loadData() {
  try {
    const [itemsRes, categoriesRes, subcategoriesRes] = await Promise.all([
      fetch(`${API}/items`),
      fetch(`${API}/categories`),
      fetch(`${API}/subcategories`)
    ]);

    allItems = await itemsRes.json();
    allCategories = await categoriesRes.json();
    allSubcategories = await subcategoriesRes.json();

    // Charger les images pour chaque item
    for (let item of allItems) {
      try {
        const imgRes = await fetch(`${API}/images/item/${item.id}`);
        const images = await imgRes.json();
        item.images = images;
        item.mainImage = images.find(img => img.is_main) || images[0];
      } catch (err) {
        item.images = [];
        item.mainImage = null;
      }
    }

    renderCategoryFilters();
    renderItems();
  } catch (error) {
    console.error("Erreur chargement données:", error);
    document.getElementById("itemsGrid").innerHTML = `
      <div class="no-results">
        <h2>Erreur de chargement</h2>
        <p>Impossible de charger les données. Vérifiez que l'API est démarrée.</p>
      </div>
    `;
  }
}

// Afficher les filtres de catégories
function renderCategoryFilters() {
  const container = document.getElementById("categoryFilters");
  container.innerHTML = "";

  allCategories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = cat.name;
    btn.onclick = () => selectCategory(cat.id);
    container.appendChild(btn);
  });

  updateFilterButtons();
}

// Afficher les filtres de sous-catégories
function renderSubcategoryFilters(categoryId) {
  const container = document.getElementById("subcategoryFilters");
  container.innerHTML = "";

  const filtered = allSubcategories.filter(sc => sc.category_id === categoryId);

  if (filtered.length === 0) {
    container.innerHTML = '<div style="color: #999;">Aucune sous-catégorie disponible</div>';
    return;
  }

  filtered.forEach(subcat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn subcategory";
    btn.textContent = subcat.name;
    btn.onclick = () => selectSubcategory(subcat.id);
    container.appendChild(btn);
  });

  updateFilterButtons();
}

// Sélectionner une catégorie
function selectCategory(categoryId) {
  if (selectedCategoryId === categoryId) {
    selectedCategoryId = null;
    selectedSubcategoryId = null;
    document.getElementById("subcategoryFilters").innerHTML = 
      '<div style="color: #999;">Sélectionnez une catégorie pour voir les sous-catégories</div>';
  } else {
    selectedCategoryId = categoryId;
    selectedSubcategoryId = null;
    renderSubcategoryFilters(categoryId);
  }
  
  updateFilterButtons();
  renderItems();
  updateFilterStatus();
}

// Sélectionner une sous-catégorie
function selectSubcategory(subcategoryId) {
  if (selectedSubcategoryId === subcategoryId) {
    selectedSubcategoryId = null;
  } else {
    selectedSubcategoryId = subcategoryId;
  }
  
  updateFilterButtons();
  renderItems();
  updateFilterStatus();
}

// Mettre à jour l'apparence des boutons de filtre
function updateFilterButtons() {
  // Catégories
  document.querySelectorAll("#categoryFilters .filter-btn").forEach(btn => {
    const cat = allCategories.find(c => c.name === btn.textContent);
    if (cat && cat.id === selectedCategoryId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Sous-catégories
  document.querySelectorAll("#subcategoryFilters .filter-btn").forEach(btn => {
    const subcat = allSubcategories.find(sc => sc.name === btn.textContent);
    if (subcat && subcat.id === selectedSubcategoryId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Bouton effacer
  const clearBtn = document.getElementById("clearFilters");
  if (selectedCategoryId || selectedSubcategoryId) {
    clearBtn.style.display = "inline-block";
  } else {
    clearBtn.style.display = "none";
  }
}

// Mettre à jour le statut du filtre
function updateFilterStatus() {
  const statusEl = document.getElementById("filterStatus");
  
  if (!selectedCategoryId && !selectedSubcategoryId) {
    statusEl.textContent = "Tous les items";
    return;
  }

  let status = "Filtré par : ";
  
  if (selectedCategoryId) {
    const cat = allCategories.find(c => c.id === selectedCategoryId);
    status += cat.name;
  }

  if (selectedSubcategoryId) {
    const subcat = allSubcategories.find(sc => sc.id === selectedSubcategoryId);
    status += " > " + subcat.name;
  }

  statusEl.textContent = status;
}

// Afficher les items
function renderItems() {
  const container = document.getElementById("itemsGrid");
  
  // Filtrer les items
  let filtered = allItems;

  if (selectedCategoryId) {
    filtered = filtered.filter(item => item.category_id === selectedCategoryId);
  }

  if (selectedSubcategoryId) {
    filtered = filtered.filter(item => item.subcategory_id === selectedSubcategoryId);
  }

  // Mettre à jour le compteur
  document.getElementById("itemCount").textContent = filtered.length;

  // Afficher les résultats
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <h2>Aucun item trouvé</h2>
        <p>Aucun item ne correspond aux filtres sélectionnés.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  filtered.forEach(item => {
    const card = createItemCard(item);
    container.appendChild(card);
  });
}

// Créer une carte d'item
function createItemCard(item) {
  const card = document.createElement("div");
  card.className = "item-card";
  card.onclick=()=>{
    window.location.href=`item.html?id=${item.id}`;
  }
  const category = allCategories.find(c => c.id === item.category_id);
  const subcategory = allSubcategories.find(sc => sc.id === item.subcategory_id);

  const imageUrl = item.mainImage 
    ? `${API}${item.mainImage.url}` 
    : "";

  card.innerHTML = `
    ${item.mainImage ? `<img src="${imageUrl}" alt="${item.title}" class="item-image">` : '<div class="item-image"></div>'}
    <div class="item-content">
      <div class="item-title">${item.title}</div>
      <div class="item-description">${item.description || "Pas de description"}</div>
      <div class="item-meta">
        <span class="item-badge badge-category">${category ? category.name : "N/A"}</span>
        <span class="item-badge badge-subcategory">${subcategory ? subcategory.name : "N/A"}</span>
        <span class="item-badge badge-year">${item.year}</span>
      </div>
    </div>
  `;

  return card;
}

// Effacer tous les filtres
document.getElementById("clearFilters").addEventListener("click", () => {
  selectedCategoryId = null;
  selectedSubcategoryId = null;
  document.getElementById("subcategoryFilters").innerHTML = 
    '<div style="color: #999;">Sélectionnez une catégorie pour voir les sous-catégories</div>';
  updateFilterButtons();
  renderItems();
  updateFilterStatus();
});

// Charger les données au démarrage
loadData();