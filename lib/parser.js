export function compileTemplateString(template) {
  let code = 'var __out = "";\n';

//   code += `
// function $echo(...values) {
//   for (const v of values) __out += __toHtml(v);
//   return "";
// }
// function $print(value = "") { $echo(value); return 1; }
// function $println(...values) { $echo(...values, "\\n"); return ""; }
// `;


code += `
function $echo(...values) {
  for (const v of values) {
    const s = __toHtml(v);
    __out += s;
  }
  return "";
}
function $print(value = "") { $echo(value); return 1; }
function $println(...values) { $echo(...values, "\\n"); return ""; }
`;

  function addLiteral(text) {
    if (!text) return;
    code += `__out += ${JSON.stringify(text)};\n`;
  }

  let cursor = 0;

  while (cursor < template.length) {
    const start = template.indexOf("<?", cursor);

    // No more tags → rest is literal
    if (start === -1) {
      addLiteral(template.slice(cursor));
      break;
    }

    // Add literal before tag
    addLiteral(template.slice(cursor, start));

    // Find closing ?>
    const end = template.indexOf("?>", start);
    if (end === -1) {
      throw new Error("Unclosed template tag");
    }

    const token = template.slice(start, end + 2);

    // ------------------------
    // TOKEN HANDLING
    // ------------------------

    if (token.startsWith("<?=")) {
      let expr = token.slice(3, -2).trim();

      expr = expr
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .trim();

      if (expr.endsWith(";")) {
        expr = expr.slice(0, -1).trim();
      }

      code += `__out += __toHtml(${expr});\n`;

    } else if (token.startsWith("<?sivu")) {
      const js = token.slice(6, -2);
      code += js + "\n";

    } else if (token.startsWith("<?include")) {
      const m = token.match(/<\?include\s+["']([\s\S]*?)["']\s*\?>/);
      const includePath = m ? m[1].trim() : "";

      code += `__out += await __include(${JSON.stringify(includePath)});\n`;

    } else {
      // Unknown tag → treat as literal (safe fallback)
      addLiteral(token);
    }

    cursor = end + 2;
  }

  code += "return __out;";
  return code;
}

// export function compileTemplateString(template) {
//   const TOKENS =
//     /(<\?sivu[\s\S]*?\?>|<\?=[\s\S]*?\?>|<\?include\s+["'][\s\S]*?["']\s*\?>)/g;
//   let cursor = 0;

//   // IMPORTANT: var so it becomes a global in the VM context
//   let code = 'var __out = "";\n';

//   // define echo and its variants inside the template so it can write to __out
//   // !!! tests for existance of these is failing probably due some hidden indentation
//   // dont think it's important to try to fix rn since this code might be replaced with proper, AST-based solution later... !!!
//   code += `
//     function $echo(...values) {
//       for (const v of values) __out += __toHtml(v);
//       return "";
//     }
//     function $print(value = "") { $echo(value); return 1; }
//     function $println(...values) { $echo(...values, "\\n"); return ""; }
//   `;

//   function addLiteral(text) {
//     if (!text) return;
//     code += `__out += ${JSON.stringify(text)};\n`;
//   }

//   for (const match of template.matchAll(TOKENS)) {
//     const tokenIndex = match.index;
//     addLiteral(template.slice(cursor, tokenIndex));

//     const token = match[0];

//     if (token.startsWith("<?=")) {
//       let expr = token.slice(3, -2).trim();

//       expr = expr
//         .replace(/\/\/.*$/gm, "")
//         .replace(/\/\*[\s\S]*?\*\//g, "")
//         .trim();

//       if (expr.endsWith(";")) expr = expr.slice(0, -1).trim();

//       //code += `__out += __toHtml(${expr});\n`;
      
//       if (expr) {
//         code += `__out += __toHtml(${expr});\n`;
//       }

//     } else if (token.startsWith("<?sivu")) {
//       let jsBlock = token.slice(6, -2);
//       code += jsBlock + "\n";
//     } else if (token.startsWith("<?include")) {
//       const m = token.match(/<\?include\s+["']([\s\S]*?)["']\s*\?>/);
//       const includePath = m ? m[1].trim() : "";
//       code += `__out += await __include(${JSON.stringify(includePath)});\n`;
//     }

//     cursor = tokenIndex + token.length;
//   }

//   addLiteral(template.slice(cursor));
//   code += "return __out;";

//   return code;
// }