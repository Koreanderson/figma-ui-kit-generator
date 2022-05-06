# Figma UI Kit Generator

This is an in progress script script to leverage the Figma API to generate UI Kit styles from a project file.

This script relies on a specific Figma document setup. An example of a working document can be seen [here](https://www.figma.com/file/IVX1zW36ydRAcYkL0sSeEj/UI-Kit-API-Test).

## Project Setup

```
# Install Dependencies
npm install
```

You will also need to update the `.env` file in the root of the project with a Figma access token.

Generate a Figma Access token [here](https://www.figma.com/developers/api#access-tokens)

```
FIGMA_ACCESS_TOKEN=""
```
Update the `config` object in the `index.js` with the project's information.

```
const config = {
  fileId: '', // File ID found in the URL
  UIKitPageName: '', // File page name where the UI Kit colors are found
  colorBoardName: '', // Board name where the UI Kit colors are found
  generatedFiletype: '', // Type of file to generate 'css' or 'scss
}
```

## Generating Project Variable Stylesheet

`node index.js`

A `variables.scss` or `variables.css` stylesheet will be generated in the root directory.
