require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/search', async (req, res) => {
    try {
        const { query, diet, intolerances } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const response = await axios.get(`${SPOONACULAR_BASE_URL}/complexSearch`, {
            params: {
                apiKey: SPOONACULAR_API_KEY,
                query,
                diet: diet || '',
                intolerances: intolerances || '',
                addRecipeInformation: true,
                addRecipeNutrition: true,
                number: 15
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Search Error:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch recipes',
            details: error.response?.data?.message || error.message
        });
    }
});

app.get('/api/recipes/byIngredients', async (req, res) => {
    try {
        const { ingredients } = req.query;
        if (!ingredients) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        console.log('Received ingredients:', ingredients);

        const response = await axios.get(`${SPOONACULAR_BASE_URL}/findByIngredients`, {
            params: {
                apiKey: SPOONACULAR_API_KEY,
                ingredients: ingredients,
                number: 15,
                ranking: 1,
                ignorePantry: false
            }
        });

        console.log('Initial API response:', response.data);

        if (!response.data?.length) {
            console.log('No recipes found for ingredients:', ingredients);
            return res.json([]);
        }

        const recipesWithDetails = await Promise.all(
            response.data.map(async (recipe) => {
                try {
                    const [infoResponse, nutritionResponse] = await Promise.all([
                        axios.get(`${SPOONACULAR_BASE_URL}/${recipe.id}/information`, {
                            params: { apiKey: SPOONACULAR_API_KEY, includeNutrition: false }
                        }),
                        axios.get(`${SPOONACULAR_BASE_URL}/${recipe.id}/nutritionWidget.json`, {
                            params: { apiKey: SPOONACULAR_API_KEY }
                        })
                    ]);
                    const recipeData = infoResponse.data;
                    recipeData.nutrition = nutritionResponse.data;
                    return recipeData;
                } catch (detailError) {
                    console.error(`Detail fetch error for recipe ${recipe.id}:`, detailError.message);
                    return { ...recipe, extendedIngredients: [], nutrition: { nutrients: [] } };
                }
            })
        );

        res.json(recipesWithDetails);
    } catch (error) {
        console.error('Ingredients Search Error:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch recipes',
            details: error.response?.data?.message || error.message
        });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});