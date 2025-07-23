  const input = document.getElementById('ingredient-input');
  const addBtn = document.getElementById('add-ingredient-btn');
  const tagsContainer = document.getElementById('tags-container');

  let ingredients = [];

  function createTag(name) {
    const tag = document.createElement('span');
    tag.className = 'bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2';

    tag.innerHTML = `
      ${name}
      <button class="ml-1 text-red-500 hover:text-red-700 font-bold" data-name="${name}">✕</button>
    `;

    // Remove handler
    tag.querySelector('button').addEventListener('click', () => {
      ingredients = ingredients.filter(ing => ing !== name);
      renderTags();
    });

    return tag;
  }

  function renderTags() {
    tagsContainer.innerHTML = '';
    ingredients.forEach(ingredient => {
      tagsContainer.appendChild(createTag(ingredient));
    });
  }

  addBtn.addEventListener('click', () => {
    const value = input.value.trim().toLowerCase();
    if (value && !ingredients.includes(value)) {
      ingredients.push(value);
      input.value = '';
      renderTags();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addBtn.click();
    }});

