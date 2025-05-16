# Todo Simple

A modern todo app with calendar view, built with React, TypeScript, and Firebase.

## Features

- Todo management with completion tracking
- Monthly calendar view with todo statistics
- Firebase authentication and data storage
- Dark theme

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Deployment

This project is configured to deploy to GitHub Pages.

1. Update the `homepage` field in `package.json` with your GitHub username:
   ```
   "homepage": "https://YOUR_GITHUB_USERNAME.github.io/todo-simple",
   ```

2. Deploy manually:
   ```bash
   npm run deploy
   ```

3. Or push to the main branch to trigger GitHub Actions deployment.

## Firebase Setup

The app requires Firebase for authentication and data storage. Make sure to:

1. Create a Firebase project
2. Add your GitHub Pages domain to Firebase Authentication authorized domains
3. Configure Firestore rules for security

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
