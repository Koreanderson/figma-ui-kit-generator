const axios = require('axios');
require('dotenv').config()

// const endpoint = 'https://www.figma.com/file/IVX1zW36ydRAcYkL0sSeEj/UI-Kit-API-Test';
const endpoint = 'https://api.figma.com/v1/files/IVX1zW36ydRAcYkL0sSeEj'

function getFigmaData() {
  axios.get(endpoint, {
    headers: {
      'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN
    }
  })
    .then((response) => {
      const data = response.data;
      const page = data.document.children[0];
      const primaryColors = page[0]
      console.log(page.children)
    })
    .catch((error) => {
      console.log(error);
    })
}

getFigmaData();