// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIgxlAzib8UMd4-_c5535iCbSfk2BD7_Y",
  authDomain: "countertop-352d4.firebaseapp.com",
  projectId: "countertop-352d4",
  storageBucket: "countertop-352d4.firebasestorage.app",
  messagingSenderId: "286551575734",
  appId: "1:286551575734:web:2551ed572635a00c916a17"
};

// Check if Firebase config is still default
const isDefaultConfig = firebaseConfig.apiKey.includes("Example");
let db = null;

if (!isDefaultConfig) {
  try {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase initialized successfully!");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Using sample data - please configure Firebase for real-time features");
}

// Global variables for recipes
let recipes = [];
let currentRecipeId = null;
let commentsUnsubscribe = null;

// DOM references
const recipeGrid = document.getElementById('recipe-grid');
const modal = document.getElementById("recipeDetailModal");
const closeModalBtn = document.getElementById("closeRecipeModalBtn");
const userNameInput = document.getElementById('user-name');
const commentInput = document.getElementById('commentInput');
const addCommentBtn = document.getElementById('addCommentBtn');
const modalComments = document.getElementById('modalComments');

// Show notification function
function showNotification(message, type = "success") {
  // Remove existing notification
  const existing = document.getElementById('notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'notification';
  notification.className = `fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Get user name with fallback
function getUserName() {
  return userNameInput.value.trim() || 'Anonymous';
}

// Filter recipes based on selected ingredients
function filterRecipes() {
  // Get ingredients from tag.js if available
  const selectedIngredients = typeof ingredients !== 'undefined' ? ingredients : [];
  
  const filteredRecipes = selectedIngredients.length === 0 ? recipes : 
    recipes.filter(recipe => 
      selectedIngredients.some(ingredient => 
        recipe.ingredients.some(recipeIng => 
          recipeIng.toLowerCase().includes(ingredient)
        )
      )
    );
  
  recipeGrid.innerHTML = '';
  filteredRecipes.forEach(renderRecipeCard);
}

// Load recipes from Firebase or use samples
function loadRecipes() {
  if (db) {
    db.collection('recipes').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
      recipes = [];
      
      snapshot.forEach((doc) => {
        const recipe = { id: doc.id, ...doc.data() };
        recipes.push(recipe);
      });
      
      filterRecipes();
    }, (error) => {
      console.error('Error loading recipes:', error);
      loadSampleRecipes();
    });
  } else {
    loadSampleRecipes();
  }
}

// Fallback sample recipes
function loadSampleRecipes() {
  const sampleRecipes = [
    {
      id: 'sample1',
      title: "Tortang Talong",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      cookTime: "20 min",
      ingredients: ["Eggplant", "Egg", "Onion", "Garlic"],
      instructions: [
        "Grill the eggplant until charred.",
        "Peel the skin, mash lightly.",
        "Dip in beaten egg.",
        "Pan-fry until golden brown on both sides."
      ],
      notes: "Best served with rice and ketchup!"
    },
    {
      id: 'sample2',
      title: "Ginisang Kalabasa",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
      cookTime: "15 min",
      ingredients: ["Kalabasa", "Onion", "Garlic", "Oil"],
      instructions: [
        "Heat oil and sauté garlic and onion.",
        "Add kalabasa and a splash of water.",
        "Cover and simmer until tender.",
        "Season with salt and pepper."
      ],
      notes: "Add malunggay or shrimp for extra nutrition."
    }
  ];
  
  recipes = sampleRecipes;
  filterRecipes();
}

// Render recipe card
function renderRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = "bg-white rounded-lg shadow hover:shadow-lg cursor-pointer overflow-hidden transition-shadow";
  card.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.title}" class="w-full h-40 object-cover">
    <div class="p-4">
      <div class="flex justify-between items-start mb-2">
        <h4 class="text-lg font-semibold flex-1">${recipe.title}</h4>
        ${recipe.cookTime ? `<span class="bg-[#6C8A93] text-white text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">⏱️ ${recipe.cookTime}</span>` : ''}
      </div>
    </div>
  `;
  card.addEventListener('click', () => openRecipeModal(recipe));
  recipeGrid.appendChild(card);
}

// Load comments for a recipe
function loadComments(recipeId) {
  // Unsubscribe from previous comments listener
  if (commentsUnsubscribe) {
    commentsUnsubscribe();
  }

  if (db && !recipeId.includes('sample')) {
    commentsUnsubscribe = db.collection('recipes').doc(recipeId).collection('comments')
      .orderBy('createdAt', 'asc')
      .onSnapshot((snapshot) => {
        modalComments.innerHTML = '';
        
        if (snapshot.empty) {
          modalComments.innerHTML = '<p class="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>';
          return;
        }

        snapshot.forEach((doc) => {
          const comment = doc.data();
          const commentDiv = document.createElement('div');
          commentDiv.className = 'border-b border-gray-200 pb-2 mb-2';
          
          const timeAgo = getTimeAgo(comment.createdAt);
          commentDiv.innerHTML = `
            <div class="flex justify-between items-start">
              <p><strong>${comment.userName}:</strong> ${comment.text}</p>
              <span class="text-xs text-gray-500 ml-2">${timeAgo}</span>
            </div>
          `;
          modalComments.appendChild(commentDiv);
        });

        // Scroll to bottom of comments
        modalComments.scrollTop = modalComments.scrollHeight;
      }, (error) => {
        console.error('Error loading comments:', error);
        modalComments.innerHTML = '<p class="text-red-500 text-sm">Error loading comments</p>';
      });
  } else {
    modalComments.innerHTML = '<p class="text-gray-500 text-sm">Configure Firebase to enable comments!</p>';
  }
}

// Add comment to Firebase
function addComment(recipeId, text, userName) {
  if (!text.trim()) return;

  if (db && !recipeId.includes('sample')) {
    db.collection('recipes').doc(recipeId).collection('comments').add({
      text: text.trim(),
      userName: userName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      commentInput.value = '';
    }).catch((error) => {
      console.error('Error adding comment:', error);
      showNotification('Error adding comment. Please try again.', 'error');
    });
  } else {
    showNotification('Configure Firebase to enable comments!', 'error');
  }
}

// Get time ago string
function getTimeAgo(timestamp) {
  if (!timestamp) return 'just now';
  
  const now = new Date();
  const commentTime = timestamp.toDate();
  const diffInSeconds = Math.floor((now - commentTime) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Open modal with full recipe details
function openRecipeModal(recipe) {
  currentRecipeId = recipe.id;
  
  document.getElementById("modalTitle").textContent = recipe.title;
  document.getElementById("modalImage").src = recipe.image;
  document.getElementById("modalCookTime").textContent = recipe.cookTime || "Time not specified";
  document.getElementById("modalIngredients").innerHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join("");
  document.getElementById("modalInstructions").innerHTML = recipe.instructions.map(step => `<li>${step}</li>`).join("");
  document.getElementById("modalNotes").textContent = recipe.notes || "No notes yet.";

  // Load comments for this recipe
  loadComments(recipe.id);

  modal.classList.remove("hidden");
  document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = 'auto';
  currentRecipeId = null;
  
  // Unsubscribe from comments
  if (commentsUnsubscribe) {
    commentsUnsubscribe();
    commentsUnsubscribe = null;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Event listeners
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Add comment event listeners
  if (addCommentBtn) {
    addCommentBtn.addEventListener('click', () => {
      if (currentRecipeId) {
        addComment(currentRecipeId, commentInput.value, getUserName());
      }
    });
  }

  if (commentInput) {
    commentInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && currentRecipeId) {
        addComment(currentRecipeId, commentInput.value, getUserName());
      }
    });
  }

  // Add new recipe form handler
  const addRecipeForm = document.getElementById("addRecipeForm");
  if (addRecipeForm) {
    addRecipeForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const title = document.getElementById("recipeTitle").value.trim();
      const image = document.getElementById("recipeImage").value.trim();
      const cookTime = document.getElementById("recipeCookTime").value.trim();
      const ingredients = document.getElementById("recipeIngredients").value.split(",").map(i => i.trim()).filter(i => i);
      const instructions = document.getElementById("recipeInstructions").value.split("\n").map(i => i.trim()).filter(i => i);
      const notes = document.getElementById("recipeNotes").value.trim();

      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Adding...';
      submitBtn.disabled = true;

      if (db) {
        // Save to Firebase
        const newRecipe = {
          title,
          image,
          cookTime,
          ingredients,
          instructions,
          notes,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: getUserName()
        };

        db.collection('recipes').add(newRecipe).then((docRef) => {
          console.log('Recipe added with ID:', docRef.id);
          
          // Create temporary recipe object for immediate display
          const tempRecipe = {
            id: docRef.id,
            ...newRecipe,
            createdAt: new Date()
          };
          
          // Show immediate preview modal
          openRecipeModal(tempRecipe);
          
          // Reset form and button
          this.reset();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          
          showNotification("Recipe added successfully! 🎉", "success");
          
        }).catch((error) => {
          console.error('Error adding recipe:', error);
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          showNotification('Error adding recipe. Please check your Firebase configuration.', "error");
        });
      } else {
        // No Firebase - just show preview
        const tempRecipe = {
          id: 'temp-' + Date.now(),
          title,
          image,
          cookTime,
          ingredients,
          instructions,
          notes
        };
        
        // Show immediate preview modal
        openRecipeModal(tempRecipe);
        
        // Reset form and button
        this.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        showNotification("Recipe preview shown! Configure Firebase to save permanently.", "success");
      }
    });
  }

  // Initialize recipes
  loadRecipes();
});
