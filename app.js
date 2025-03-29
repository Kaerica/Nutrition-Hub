const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const dietFilter = document.getElementById('dietFilter');
const intoleranceFilter = document.getElementById('intoleranceFilter');
const ingredientsInput = document.getElementById('ingredientsInput');
const ingredientsBtn = document.getElementById('ingredientsBtn');
const recipesGrid = document.getElementById('recipesGrid');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

const API_BASE_URL = 'http://localhost:3000';

async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`, { mode: 'cors' });
        if (!response.ok) throw new Error('Server not responding');
        return true;
    } catch (err) {
        showError('Cannot connect to server. Please start it on port 3000.');
        console.error('Server connection error:', err);
        return false;
    }
}

searchBtn.addEventListener('click', handleSearch);
ingredientsBtn.addEventListener('click', handleIngredientsSearch);

async function handleSearch() {
    if (!await checkServerConnection()) return;

    const query = searchInput.value.trim();
    if (!query) {
        showError('Please enter a recipe name');
        return;
    }

    showLoading();
    try {
        const diet = dietFilter.value;
        const intolerances = intoleranceFilter.value;
        const response = await fetch(`${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}&diet=${diet}&intolerances=${intolerances}`, { mode: 'cors' });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Search failed');
        displayRecipes(data.results || []);
    } catch (err) {
        showError(err.message || 'Couldn’t fetch recipes. Try again.');
        console.error('Search error:', err);
    } finally {
        hideLoading();
    }
}

async function handleIngredientsSearch() {
    if (!await checkServerConnection()) return;

    const ingredients = ingredientsInput.value.trim();
    if (!ingredients) {
        showError('Please enter at least one ingredient');
        return;
    }

    const formattedIngredients = ingredients.split(/[\s,]+/).filter(Boolean).join(',');
    console.log('Formatted ingredients sent:', formattedIngredients);

    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/api/recipes/byIngredients?ingredients=${encodeURIComponent(formattedIngredients)}`, { mode: 'cors' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'No recipe found');
        }
        const data = await response.json();

        console.log('Recipes received:', data);
        displayRecipes(data.length ? data : []);
    } catch (err) {
        showError(err.message || 'No recipes found. Try different ingredients.');
        console.error('Ingredients search error:', err);
    } finally {
        hideLoading();
    }
}

function displayRecipes(recipes) {
    recipesGrid.innerHTML = '';

    if (!recipes.length) {
        showError('No recipes found. Try different ingredients.');
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        recipesGrid.appendChild(recipeCard);
    });
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    const image = document.createElement('img');
    image.className = 'recipe-image';
    image.src = recipe.image || 'https://placehold.co/320x220?text=Delicious+Recipe';
    image.alt = recipe.title;
    image.onerror = () => image.src = 'https://placehold.co/320x220?text=Image+Not+Found';

    const content = document.createElement('div');
    content.className = 'recipe-content';

    const title = document.createElement('h3');
    title.className = 'recipe-title';
    title.textContent = recipe.title || 'Unnamed Recipe';

    const info = document.createElement('div');
    info.className = 'recipe-info';
    info.innerHTML = `
        <span><i class="fas fa-clock"></i> ${recipe.readyInMinutes || 'N/A'} mins</span>
        <span><i class="fas fa-users"></i> ${recipe.servings || 'N/A'} servings</span>
    `;

    const nutrition = document.createElement('div');
    nutrition.className = 'recipe-nutrition';
    const nutrients = {};
    (recipe.nutrition?.nutrients || []).forEach(nutrient => {
        nutrients[nutrient.name.toLowerCase()] = {
            amount: nutrient.amount || 0,
            unit: nutrient.unit || ''
        };
    });
    nutrition.innerHTML = `
        <div class="nutrition-item"><span><i class="fas fa-fire"></i> Calories:</span><span>${Math.round(nutrients['calories']?.amount || 0)} ${nutrients['calories']?.unit || 'kcal'}</span></div>
        <div class="nutrition-item"><span><i class="fas fa-dumbbell"></i> Protein:</span><span>${Math.round(nutrients['protein']?.amount || 0)} ${nutrients['protein']?.unit || 'g'}</span></div>
        <div class="nutrition-item"><span><i class="fas fa-bread-slice"></i> Carbs:</span><span>${Math.round(nutrients['carbohydrates']?.amount || 0)} ${nutrients['carbohydrates']?.unit || 'g'}</span></div>
        <div class="nutrition-item"><span><i class="fas fa-cheese"></i> Fat:</span><span>${Math.round(nutrients['fat']?.amount || 0)} ${nutrients['fat']?.unit || 'g'}</span></div>
    `;

    const ingredientsList = document.createElement('div');
    ingredientsList.className = 'ingredients-list';
    ingredientsList.innerHTML = '<strong><i class="fas fa-shopping-basket"></i> Ingredients:</strong>';
    const ul = document.createElement('ul');
    (recipe.extendedIngredients || []).forEach(ing => {
        const li = document.createElement('li');
        li.textContent = `${ing.name || ing.original} (${ing.amount || ''} ${ing.unit || ''})`.trim();
        ul.appendChild(li);
    });
    ingredientsList.appendChild(ul);

    content.appendChild(title);
    content.appendChild(info);
    content.appendChild(nutrition);
    content.appendChild(ingredientsList);
    card.appendChild(image);
    card.appendChild(content);

    return card;
}

function showLoading() {
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    recipesGrid.classList.add('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
    recipesGrid.classList.remove('hidden');
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
    recipesGrid.innerHTML = '';
    recipesGrid.classList.remove('hidden');
}