/**
 * SLIDER BANNER BUTTON MODULE
 * ============================
 * 
 * Legacy slider controls and banner management
 * Note: This module contains experimental carousel functionality
 */

/* ================================================================================================= */
/* #region DOM ELEMENTS & VARIABLES                                                                 */
/* ================================================================================================= */

const slider = document.querySelector(".slider");
const banner = document.querySelector(".banner");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let rotation = 0;
let allImages = [];

/* #endregion DOM ELEMENTS & VARIABLES */

