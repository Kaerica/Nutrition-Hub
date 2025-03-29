# Recipe & Nutrition App

A web application that allows users to search for recipes, find recipes based on available ingredients, and view nutritional information using the Spoonacular API.

## Features

- Recipe Search - Search for recipes by name
- Ingredient-Based Suggestions - Find recipes based on available ingredients
- Nutritional Info - View calories, macros, and more
- Dietary Preferences - Filter results by diet and intolerances
- Error Handling - Proper error handling for API rate limits and invalid inputs

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Spoonacular API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd recipe-nutrition-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Spoonacular API key:
```
SPOONACULAR_API_KEY=your_api_key_here
PORT=3000
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Search Recipes**
   - Enter a search term in the search box
   - Select dietary preferences and intolerances if needed
   - Click "Search" to find recipes

2. **Find Recipes by Ingredients**
   - Enter available ingredients (comma-separated)
   - Click "Find Recipes" to get recipe suggestions

3. **View Recipe Details**
   - Each recipe card displays:
     - Recipe image
     - Title
     - Preparation time
     - Servings
     - Nutritional information (calories, protein, carbs, fat)

## API Rate Limits

The Spoonacular API has rate limits based on your subscription plan. The free tier includes:
- 150 points per day
- 1 point per API call

## Error Handling

The application handles various error scenarios:
- Invalid search terms
- API rate limits
- Network errors
- Missing or invalid data

## Technologies Used

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
- Backend:
  - Node.js
  - Express.js
  - Axios
- API:
  - Spoonacular API 
## DEMO VIDEO
-[https://youtu.be/HPMkbD4CE98]
