const axios = require('axios');
const fs = require('fs')
require('dotenv').config()

const config = {
  fileId: 'IVX1zW36ydRAcYkL0sSeEj',
  UIKitPageName: 'UI Kit',
  colorPageName: 'Primary Colors'
}

const endpoint = `https://api.figma.com/v1/files/${config.fileId}`

/**
 * Get an object node's child by name key 
 * @param  {Object} parentNode    The r value from the RGBA value of a figma node
 * @param  {String} name          The string value of the matching child's 'name' key
 * @return {Object}               The selected child node
 */
function getChildNodeByName(parentNode, name) {
  for (let i = 0; i < parentNode.children.length; i++) {
    let child = parentNode.children[i];
    if (child.name == name) {
      return child
    } 
  }
  return null
}

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

/**
 * Take in r,g,b values and convert them to a hexcode value 
 * @param  {Integer} r   The r value from the RGBA value of a figma node
 * @param  {Integer} g   The g value from the RGBA value of a figma node
 * @param  {Integer} b   The b value from the RGBA value of a figma node
 * @return {String}      A string representing the Hexcode of the converted RGB value
 */
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

/**
 * Take the parsed colorGroups from a Figma doc and return an object where keys are variable names and values are colors as hexcodes
 * @param  {Array} colorGroups   Array of Object made from color groups in Figma
 * @return {Object}              An object where keys are variable names and values are colors as hexcodes
 */
function getColorValuesFromGroups(colorGroups) {
  let colorValues = {};

  for (let i = 0; i < colorGroups.length; i++) {
    const colorGroup = colorGroups[i];
    colorGroup.children.forEach((colorBlock) => {
      if (colorBlock.name === "Color Block" && colorBlock.type === "GROUP") {
        const name = colorBlock.children.find(x => x.name.includes('color-')).name;
        const rgba = colorBlock.children.find(x => x.name.includes('color-')).fills[0].color; // Might not be reliable

        // Figma rgba values are returned as percentage in decimal value
        // We need to multiply by 255 to get a browser readable rgba value
        const r = parseInt(rgba.r * 255);
        const g = parseInt(rgba.g * 255);
        const b = parseInt(rgba.b * 255);
        const hex = RGBToHex(r,g,b);

        colorValues[name] = hex;

      } else if (colorBlock.name.includes('colors-') && colorBlock.type === "GROUP") {
        // Nested Color Groups
        colorBlock.children.forEach((childColorBlock) => {
          if (childColorBlock.name === "Color Block" && childColorBlock.type === "GROUP") {
            const name = childColorBlock.children.find(x => x.name.includes('color-')).name;
            const rgba = childColorBlock.children.find(x => x.name.includes('color-')).fills[0].color; // Might not be reliable

            // Figma rgba values are returned as percentage in decimal value
            // We need to multiply by 255 to get a browser readable rgba value
            const r = parseInt(rgba.r * 255);
            const g = parseInt(rgba.g * 255);
            const b = parseInt(rgba.b * 255);
            const hex = RGBToHex(r,g,b);

            colorValues[name] = hex;
          }
        })
      }
    });
  }
  return colorValues;
}

/**
 * Write stylesheet from an object of styles from Figma
 * @param  {Object} object      Object where keys are variable names and values are colors as hexcodes 
 * @param  {String} styleType   Either 'css' or 'scss' for determining how variables are defined
 * @return {String}             Completion status message 
 */
function writeStylesFromColorObj(obj, styleType) {
  const stylesheetName = styleType == 'scss' ? 'variables.scss' : 'variables.css'
  const stream = fs.createWriteStream(stylesheetName, {
    flags: 'a'
  });

  if (styleType === 'scss') {
    for (let k in obj) {
      stream.write(`$${k}: ${obj[k]};\n`)
    }
  } else if (styleType ==='css') {
    stream.write(':root {\n')
    for (let k in obj) {
      stream.write(`\t--${k}: ${obj[k]};\n`)
    }
    stream.write('}')
  }

  return "Complete"
}

async function getColorValuesFromFigma() {
  let figmaData = await axios.get(endpoint, {
    headers: {
      'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN
    }
  });

  // TODO: Clean up some of these declarations
  const data = figmaData.data;
  const UIKitPage = getChildNodeByName(data.document, "UI Kit");
  const colorPalette = getChildNodeByName(UIKitPage, "Color Palette");
  const colorGroups = getColorGroups(colorPalette)
  const colorValues = getColorValuesFromGroups(colorGroups);
  return colorValues
}

(async () => {
  const colorValues = await getColorValuesFromFigma()
  writeStylesFromColorObj(colorValues, 'scss');
})()
