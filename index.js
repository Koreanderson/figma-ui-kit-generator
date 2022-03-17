const axios = require('axios');
const fs = require('fs')

require('dotenv').config()

const config = {
  fileId: "IVX1zbW36ydRAcYkL0sSeEj",
  UIKitPageName: "UI Kit",
  colorPageName: "Primary Colors"
}

// const endpoint = 'https://www.figma.com/file/IVX1zW36ydRAcYkL0sSeEj/UI-Kit-API-Test';

function getChildNodeByName(parentNode, name) {
  for (let i = 0; i < parentNode.children.length; i++) {
    let child = parentNode.children[i];
    if (child.name == name) {
      return child
    } 
  }
  return null
}

const endpoint = 'https://api.figma.com/v1/files/IVX1zW36ydRAcYkL0sSeEj'

let pages 

function getColorGroups(parentNode) {
  colorGroups = [];
  for (let i = 0; i < parentNode.children.length; i++) {
    let child = parentNode.children[i];
    if (child.type === "GROUP" && child.name.includes('colors--')) {
      colorGroups.push(child);
    } 
  }
  return colorGroups
}

function RGBToHex(r,g,b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}

function getColorValuesFromGroups(colorGroups) {
  colorValues = {};

  for (let i = 0; i < colorGroups.length; i++) {
    const colorGroup = colorGroups[i];
    colorGroup.children.forEach((colorBlock) => {
      if (colorBlock.name === "Color Block" && colorBlock.type === "GROUP") {
        const name = colorBlock.children.find(x => x.name.includes('color-')).name;
        const rgba = colorBlock.children.find(x => x.name.includes('color-')).fills[0].color; // Might not be reliable

        const r = parseInt(rgba.r * 255);
        const g = parseInt(rgba.g * 255);
        const b = parseInt(rgba.b * 255);
        const hex = RGBToHex(r,g,b);

        // const hex = colorBlock.children.find(x => x.type === 'TEXT' && x.name.includes('#')).name;
        colorValues[name] = hex;
      } else if (colorBlock.name.includes('colors-') && colorBlock.type === "GROUP") {
        // Nested Color Groups
        colorBlock.children.forEach((childColorBlock) => {
          if (childColorBlock.name === "Color Block" && childColorBlock.type === "GROUP") {
            const name = childColorBlock.children.find(x => x.name.includes('color-')).name;
            const rgba = childColorBlock.children.find(x => x.name.includes('color-')).fills[0].color; // Might not be reliable
            const r = parseInt(rgba.r * 255);
            const g = parseInt(rgba.g * 255);
            const b = parseInt(rgba.b * 255);

            const hex = RGBToHex(r,g,b);

            // const hex = `#${childColorBlock.children.find(x => x.type === 'TEXT' && x.name.includes('#')).name.split('#').pop()}`;
            colorValues[name] = hex;
            // colorValues[name] = rgba;
          }
        })
      }
    });
  }
  return colorValues;
}

/**
 * [someFunction description]
 * @param  {Object} object Object where keys are variable names and values are colors as hexcodes 
 * @param  {String} styleType Either 'css' or 'scss' for determining how variables are defined
 * @return {String}      Completion status message 
 */

function writeStylesFromColorObj(object, styleType) {
  // param

}

function getFigmaData() {
  axios.get(endpoint, {
    headers: {
      'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN
    }
  })
    .then((response) => {
      const data = response.data;
      const UIKitPage = getChildNodeByName(data.document, "UI Kit");
      const colorPalette = getChildNodeByName(UIKitPage, "Color Palette");
      const colorGroups = getColorGroups(colorPalette)
      const colorValues = getColorValuesFromGroups(colorGroups);

      const stream = fs.createWriteStream('variables.css', {
        flags: 'a'
      });

      for (let k in colorValues) {
        stream.write(`$${k}: ${colorValues[k]};\n`)
      }

      // console.log(colorValues);
    })
    .catch((error) => {
      console.log(error);
    })
}

getFigmaData();