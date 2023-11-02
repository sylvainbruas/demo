/**
 * @typedef {Object} Links
 * @prop {string} github Your github repository
 */

/**
 * @typedef {Object} MetaConfig
 * @prop {string} title Your website title
 * @prop {string} description Your website description
 * @prop {string} author Maybe your name
 * @prop {string} siteUrl Your website URL
 * @prop {string} lang Your website Language
 * @prop {Links} links
 * @prop {string} favicon Favicon Path
 */

/** @type {MetaConfig} */
const metaConfig = {
  title: "Sylvain BRUAS",
  description: `Blog de Sylvain BRUAS`,
  author: "Sylvain BRUAS",
  siteUrl: "https://sylvain.bruas.fr",
  lang: "fr",
  links: {
    github: "https://github.com/sylvainbruas/",
    cv: "https://cv.bruas.fr",
  },
  favicon: "src/images/icon.png",
}

// eslint-disable-next-line no-undef
module.exports = metaConfig
