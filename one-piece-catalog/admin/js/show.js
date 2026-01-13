const API = "http://127.0.0.1:8000";

let allItems = [];

// Charger uniquement les items au démarrage
async function loadItems() {
  try {
    const itemsRes = await fetch(`${API}/items`);
    if (!itemsRes.ok) throw new Error("Erreur chargement items");

    allItems = await itemsRes.json();

    // Optionnel : charger les catégories pour afficher leurs noms
    const catRes = await fetch(`${API}/categories`);
    const categories = await catRes.json();

    const subRes = await fetch(`${API}/subcategories`);
    const subcategories = await subRes.json();

    renderItemsTable(categories, subcategories);
  } catch (error) {
    console.error("Erreur:", error);
    document.getElementById("itemsList").innerHTML = `
      <p style="color: red; text-align: center;">
        Impossible de charger les items. Vérifiez que le serveur tourne.
      </p>
    `;
  }
}

// Afficher les items dans un tableau simple
function renderItemsTable(categories, subcategories) {
  const container = document.getElementById("itemsList");
  if (!container) return;

  if (allItems.length === 0) {
    container.innerHTML = "<p>Aucun item pour le moment.</p>";
    return;
  }

  let html = `
    <table border="1" style="width:100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="padding: 10px;">ID</th>
          <th style="padding: 10px;">Titre</th>
          <th style="padding: 10px;">Description</th>
          <th style="padding: 10px;">Année</th>
          <th style="padding: 10px;">Catégorie</th>
          <th style="padding: 10px;">Sous-catégorie</th>
          <th style="padding: 10px;">Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  allItems.forEach(item => {
  const category = categories.find(c => c.id === item.category_id);
  const subcategory = subcategories.find(sc => sc.id === item.subcategory_id);

  html += `
    <tr data-item-id="${item.id}">
      <td style="padding: 10px; text-align: center;">${item.id}</td>
      <td style="padding: 10px;">${item.title}</td>
      <td style="padding: 10px;">${item.description || "—"}</td>
      <td style="padding: 10px; text-align: center;">${item.year || "—"}</td>
      <td style="padding: 10px;">${category ? category.name : "—"}</td>
      <td style="padding: 10px;">${subcategory ? subcategory.name : "—"}</td>
      <td style="padding: 10px; text-align: center;">
        <button 
          onclick="editItem(${item.id})"
          style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 8px;"
        >
          Modifier
        </button>
        <button 
          onclick="deleteItem(${item.id})"
          style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;"
        >
          Supprimer
        </button>
      </td>
    </tr>
  `;
});

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// Suppression d'un item
async function deleteItem(itemId) {
  if (!confirm("Vraiment supprimer cet item ? (action irréversible)")) {
    return;
  }

  try {
    const response = await fetch(`${API}/items/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Erreur suppression");
    }

    // Retirer de la liste locale
    allItems = allItems.filter(item => item.id !== itemId);

    // Rafraîchir l'affichage
    renderItemsTable(
      await (await fetch(`${API}/categories`)).json(),
      await (await fetch(`${API}/subcategories`)).json()
    );

    alert("Item supprimé !");
  } catch (error) {
    console.error(error);
    alert("Échec suppression : " + error.message);
  }
}
// Ouvre le modal d'édition avec les données de l'item
async function editItem(itemId) {
  try {
    // Récupère les données actuelles de l'item
    const res = await fetch(`${API}/items/${itemId}`);
    if (!res.ok) throw new Error("Impossible de charger l'item");
    
    const item = await res.json();

    // Remplit le formulaire
    document.getElementById("editItemId").value = item.id;
    document.getElementById("editTitle").value = item.title || "";
    document.getElementById("editDescription").value = item.description || "";
    document.getElementById("editYear").value = item.year || "";
    document.getElementById("editExternalLink").value = item.external_link || "";

    // Affiche le modal
    document.getElementById("editModal").style.display = "flex";
  } catch (error) {
    console.error(error);
    alert("Erreur lors du chargement : " + error.message);
  }
}

// Ferme le modal
function closeModal() {
  document.getElementById("editModal").style.display = "none";
  document.getElementById("editForm").reset();
}

// Soumission du formulaire de modification
document.getElementById("editForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const itemId = document.getElementById("editItemId").value;
  const updatedData = {
    title: document.getElementById("editTitle").value.trim(),
    description: document.getElementById("editDescription").value.trim(),
    year: parseInt(document.getElementById("editYear").value) || null,
    external_link: document.getElementById("editExternalLink").value.trim(),
    // category_id et subcategory_id non modifiés ici (tu peux les ajouter si besoin)
  };

  try {
    // 1. Mise à jour des infos de base
    const res = await fetch(`${API}/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Erreur mise à jour");
    }

    // 2. Upload des nouvelles images (si présentes)
    const fileInput = document.getElementById("editImages");
    if (fileInput.files.length > 0) {
      for (const file of fileInput.files) {
        const formData = new FormData();
        formData.append("file", file);

        const imgRes = await fetch(
          `${API}/images/upload/${itemId}?is_main=false`,
          { method: "POST", body: formData }
        );

        if (!imgRes.ok) {
          console.warn("Une image n'a pas pu être uploadée");
        }
      }
    }

    alert("Item modifié avec succès !");
    closeModal();

    // Rafraîchir la liste
    loadItems(); // ← recharge tout le tableau

  } catch (error) {
    console.error(error);
    alert("Erreur lors de la modification : " + error.message);
  }
});

// Lancement au chargement de la page
document.addEventListener("DOMContentLoaded", loadItems);