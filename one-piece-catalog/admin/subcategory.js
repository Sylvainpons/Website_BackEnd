const API = "http://127.0.0.1:8000";

/* =====================================================
   LOAD CATEGORIES
===================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  const categorySelect = document.getElementById("categorySelect");
  if (!categorySelect) return;

  try {
    const res = await fetch(`${API}/categories`);
    if (!res.ok) {
      console.error("Erreur chargement catégories");
      return;
    }

    const categories = await res.json();

    categorySelect.innerHTML =
      '<option value="">-- Sélectionner une catégorie --</option>';

    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Impossible de charger les catégories");
  }
});

/* =====================================================
   CREATE SUBCATEGORY
===================================================== */
document
  .getElementById("subcategory-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const categoryId = document.getElementById("categorySelect").value;

    if (!name || !categoryId) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      const res = await fetch(`${API}/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          category_id: parseInt(categoryId),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Erreur API:", error);
        alert(error.detail || "Erreur création sous-catégorie");
        return;
      }

      alert("Sous-catégorie créée avec succès");
      e.target.reset();
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur réseau");
    }
  });
