const API = "http://127.0.0.1:8000";

/* =====================================================
   CATEGORY
===================================================== */
document.getElementById("category-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;

  try {
    const res = await fetch(`${API}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Erreur API:", error);
      alert(`Erreur création catégorie: ${error.detail || 'Erreur inconnue'}`);
      return;
    }

    alert("Catégorie créée");
    e.target.reset();
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Erreur réseau lors de la création de la catégorie");
  }
});

/* =====================================================
   SUBCATEGORY
===================================================== */
document.getElementById("subcategory-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const category_id = document.getElementById("categorySelect").value;

  try {
    const res = await fetch(`${API}/subcategories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        category_id: parseInt(category_id),
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Erreur API:", error);
      alert(`Erreur création sous-catégorie: ${error.detail || 'Erreur inconnue'}`);
      return;
    }

    alert("Sous-catégorie créée");
    e.target.reset();
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Erreur réseau lors de la création de la sous-catégorie");
  }
});

/* =====================================================
   ITEM PAGE (LOAD SELECTS)
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  const categorySelect = document.getElementById("categorySelect");
  const subcategorySelect = document.getElementById("subcategorySelect");

  if (!categorySelect || !subcategorySelect) return;

  try {
    // Charger catégories
    const catRes = await fetch(`${API}/categories`);
    if (!catRes.ok) {
      console.error("Erreur chargement catégories");
      return;
    }
    
    const categories = await catRes.json();

    categorySelect.innerHTML = '<option value="">-- Sélectionner une catégorie --</option>';
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });

    // Charger sous-catégories initiales si une catégorie est sélectionnée
    if (categories.length > 0 && categorySelect.value) {
      await loadSubcategories(categorySelect.value);
    }

    // Recharger quand catégorie change
    categorySelect.addEventListener("change", async () => {
      if (categorySelect.value) {
        await loadSubcategories(categorySelect.value);
      } else {
        subcategorySelect.innerHTML = '<option value="">-- Sélectionner d\'abord une catégorie --</option>';
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    alert("Erreur lors du chargement des catégories");
  }
});

/* =====================================================
   LOAD SUBCATEGORIES
===================================================== */
async function loadSubcategories(categoryId) {
  const subcategorySelect = document.getElementById("subcategorySelect");
  
  try {
    const res = await fetch(`${API}/subcategories`);
    if (!res.ok) {
      console.error("Erreur chargement sous-catégories");
      return;
    }
    
    const subcategories = await res.json();

    subcategorySelect.innerHTML = "";

    const filtered = subcategories.filter(
      (sc) => sc.category_id == categoryId
    );

    if (filtered.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Aucune sous-catégorie disponible";
      opt.disabled = true;
      subcategorySelect.appendChild(opt);
      return;
    }

    // Ajouter une option par défaut
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "-- Sélectionner une sous-catégorie --";
    subcategorySelect.appendChild(defaultOpt);

    filtered.forEach((sc) => {
      const opt = document.createElement("option");
      opt.value = sc.id;
      opt.textContent = sc.name;
      subcategorySelect.appendChild(opt);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des sous-catégories:", error);
  }
}

/* =====================================================
   ITEM CREATE + IMAGE UPLOAD
===================================================== */
document.getElementById("item-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const category_id = document.getElementById("categorySelect").value;
  const subcategory_id = document.getElementById("subcategorySelect").value;

  // Validation côté client
  if (!title || !category_id || !subcategory_id) {
    alert("Veuillez remplir tous les champs obligatoires");
    return;
  }

  try {
    // 1️⃣ Créer l'item
    console.log("Création item avec:", {
      title,
      category_id: parseInt(category_id),
      subcategory_id: parseInt(subcategory_id)
    });

    const res = await fetch(`${API}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: "Ajout back-office",
        year: new Date().getFullYear(),
        external_link: "",
        category_id: parseInt(category_id),
        subcategory_id: parseInt(subcategory_id),
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Erreur API:", error);
      alert(`Erreur création item: ${error.detail || 'Erreur inconnue'}`);
      return;
    }

    const item = await res.json();
    console.log("Item créé:", item);

    // 2️⃣ Upload image (optionnel)
    const fileInput = document.getElementById("image");
    const file = fileInput?.files[0];
    
    if (file) {
      console.log("Upload de l'image:", file.name);
      const formData = new FormData();
      formData.append("file", file);

      const imgRes = await fetch(
        `${API}/images/upload/${item.id}?is_main=true`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!imgRes.ok) {
        const error = await imgRes.json();
        console.error("Erreur upload image:", error);
        alert(`Item créé (ID: ${item.id}) mais erreur upload image: ${error.detail || 'Erreur inconnue'}`);
        e.target.reset();
        return;
      }

      console.log("Image uploadée avec succès");
      alert(`Item créé avec succès (ID: ${item.id}) avec image`);
    } else {
      alert(`Item créé avec succès (ID: ${item.id}) sans image`);
    }

    e.target.reset();
    
    // Recharger les selects pour garder les options
    const categorySelect = document.getElementById("categorySelect");
    if (categorySelect && categorySelect.value) {
      await loadSubcategories(categorySelect.value);
    }
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert(`Erreur réseau lors de la création: ${error.message}`);
  }
});