/**
 * Laat sharp (librsvg/fontconfig) de lettertypes uit assets-src/fonts vinden.
 * Moet als eerste worden geïmporteerd, vóór sharp.
 */
import { resolve } from "node:path";
process.env.FONTCONFIG_FILE = resolve("assets-src/fonts/fonts.conf");
