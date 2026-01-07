const API = "http://127.0.0.1:8000";

/* =====================================================
   CATEGORY
===================================================== */
document.getElementById("category-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;

  const res = await fetch(`${API}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    }),
  });

  if (!res.ok) {
    alert("Erreur création catégorie");
    return;
  }

  alert("Catégorie créée");
  e.target.reset();
});

/* =====================================================
   SUBCATEGORY
===================================================== */
document.getElementById("subcategory-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const category_id = document.getElementById("categorySelect").value;

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
    const err = await res.text();
    alert("Erreur création sous-catégorie : " + err);
    return;
  }

  alert("Sous-catégorie créée");
  e.target.reset();
});

/* =====================================================
   ITEM PAGE (LOAD SELECTS)
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  const categorySelect = document.getElementById("categorySelect");
  const subcategorySelect = document.getElementById("subcategorySelect");

  if (!categorySelect || !subcategorySelect) return;

  // Charger catégories
  const catRes = await fetch(`${API}/categories`);
  const categories = await catRes.json();

  categorySelect.innerHTML = "";
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name;
    categorySelect.appendChild(opt);
  });

  // Charger sous-catégories initiales
  await loadSubcategories(categorySelect.value);

  // Recharger quand catégorie change
  categorySelect.addEventListener("change", async () => {
    await loadSubcategories(categorySelect.value);
  });
});

/* =====================================================
   LOAD SUBCATEGORIES
===================================================== */
async function loadSubcategories(categoryId) {
  const res = await fetch(`${API}/subcategories`);
  const subcategories = await res.json();

  const subcategorySelect = document.getElementById("subcategorySelect");
  subcategorySelect.innerHTML = "";

  const filtered = subcategories.filter(
    (sc) => sc.category_id == categoryId
  );

  if (filtered.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "Aucune sous-catégorie";
    opt.disabled = true;
    subcategorySelect.appendChild(opt);
    return;
  }

  filtered.forEach((sc) => {
    const opt = document.createElement("option");
    opt.value = sc.id;
    opt.textContent = sc.name;
    subcategorySelect.appendChild(opt);
  });
}

/* =====================================================
   ITEM CREATE + IMAGE UPLOAD
===================================================== */
document.getElementById("item-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const category_id = document.getElementById("categorySelect").value;
  const subcategory_id = document.getElementById("subcategorySelect").value;

  // 1️⃣ Créer l'item
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
    alert("Erreur création item");
    return;
  }

  const item = await res.json();

  // 2️⃣ Upload image (optionnel)
  const file = document.getElementById("image")?.files[0];
  if (file) {
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
      alert("Item créé mais erreur upload image");
      return;
    }
  }

  alert("Item créé avec image");
  e.target.reset();
});
