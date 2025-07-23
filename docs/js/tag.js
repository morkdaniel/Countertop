// Global variables for tag system
let ingredients = [];

// DOM references for tag system
const ingredientInput = document.getElementById('ingredient-input');
const addIngredientBtn = document.getElementById('add-ingredient-btn');
const tagsContainer = document.getElementById('tags-container');

// Ingredient tag functions
function addIngredient() {
  const ingredient = ingredientInput.value.trim().toLowerCase();
  if (ingredient && !ingredients.includes(ingredient)) {
    ingredients.push(ingredient);
    renderTags();
    ingredientInput.value = '';
    // Call filterRecipes if it's available (defined in recipes.js)
    if (typeof filterRecipes === 'function') {
      filterRecipes();
    }
  }
}

function removeIngredient(ingredient) {
  ingredients = ingredients.filter(ing => ing !== ingredient);
  renderTags();
  // Call filterRecipes if it's available (defined in recipes.js)
  if (typeof filterRecipes === 'function') {
    filterRecipes();
  }
}

function renderTags() {
  tagsContainer.innerHTML = '';
  ingredients.forEach(ingredient => {
    const tag = document.createElement('span');
    tag.className = 'bg-[#4B5E63] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2';
    tag.innerHTML = `
      ${ingredient}
      <button onclick="removeIngredient('${ingredient}')" class="text-white hover:text-red-200 ml-1">&times;</button>
    `;
    tagsContainer.appendChild(tag);
  });
}

// Event listeners for tag system
document.addEventListener('DOMContentLoaded', function() {
  if (addIngredientBtn) {
    addIngredientBtn.addEventListener('click', addIngredient);
  }
  
  if (ingredientInput) {
    ingredientInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addIngredient();
      }
    });
  }
});

// Make removeIngredient globally accessible
window.removeIngredient = removeIngredient;