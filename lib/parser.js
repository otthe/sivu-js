function compileTemplateString(template) {
  const TOKENS = /(<\?sivu[\s\S]*?\?>|<\?=[\s\S]*?\?>|<\?include\s+["'][\s\S]*?["']\s*\?>)/g;
  let cursor = 0;

  // IMPORTANT: var (not let) so __out becomes a global property in the VM context
  let code = 'var __out = "";\n';

  function addLiteral(text) {
    if (!text) return;
    code += `__out += ${JSON.stringify(text)};\n`;
  }

  // Best-effort: convert "let"/"const" to "var" so bindings are shared across included templates.
  // This intentionally makes template JS behave more like PHP (function/global scope).
  function hoistGlobals(js) {
    return js.replace(/(^|[;\n\r])(\s*)(let|const)\s+/g, "$1$2var ");
  }

  for (const match of template.matchAll(TOKENS)) {
    const tokenIndex = match.index;
    addLiteral(template.slice(cursor, tokenIndex));

    const token = match[0];

    if (token.startsWith("<?=")) {
      let expr = token.slice(3, -2).trim();

      expr = expr
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .trim();

      if (expr.endsWith(";")) expr = expr.slice(0, -1).trim();

      code += `__out += (${expr} ?? "");\n`;
    } else if (token.startsWith("<?sivu")) {
      let jsBlock = token.slice(6, -2);
      jsBlock = hoistGlobals(jsBlock);
      code += jsBlock + "\n";
    } else if (token.startsWith("<?include")) {
      const m = token.match(/<\?include\s+["']([\s\S]*?)["']\s*\?>/);
      const includePath = m ? m[1].trim() : "";
      code += `__out += await __include(${JSON.stringify(includePath)});\n`;
    }

    cursor = tokenIndex + token.length;
  }

  addLiteral(template.slice(cursor));
  code += "return __out;";
  return code;
}

module.exports = { compileTemplateString };

// function compileTemplateString(template) {
//   const TOKENS = /(<\?sivu[\s\S]*?\?>|<\?=[\s\S]*?\?>|<\?include\s+["'][\s\S]*?["']\s*\?>)/g;
//   let cursor = 0;
//   let code = 'let __out = "";\n';

//   function addLiteral(text) {
//     if (!text) return;
//     code += `__out += ${JSON.stringify(text)};\n`;
//   }

//   for (const match of template.matchAll(TOKENS)) {
//     const tokenIndex = match.index;
//     const before = template.slice(cursor, tokenIndex);
//     addLiteral(before);

//     const token = match[0];

//     if (token.startsWith('<?=')) {
//       let expr = token.slice(3, -2).trim();
      
//       expr = expr
//         .replace(/\/\/.*$/gm, "") // remove single-line comments
//         .replace(/\/\*[\s\S]*?\*\//g, "") // remove multi-line comments
//         .trim();

//       //remove trailing semicolon
//       if (expr.endsWith(';')) expr = expr.slice(0, -1).trim();

//       // // remove leading comment lashes
//       // if (expr.startsWith('//')) expr = expr.slice(2).trim();

//        // Safely output the expression (with nullish coalescing)
//       code += `__out += (${expr} ?? "");\n`;
//     } else if (token.startsWith('<?sivu')) {
//       const jsBlock = token.slice(6, -2);
//       code += jsBlock + '\n';
//     } else if (token.startsWith('<?include')) {
//       const m = token.match(/<\?include\s+["']([\s\S]*?)["']\s*\?>/);
//       const includePath = m ? m[1].trim() : '';
//       code += `__out += await __include(${JSON.stringify(includePath)});\n`;
//     } 
    
//     /*else if (token.startsWith('<?include')) {
//       // Match: <?include "file.sivu", { foo: "bar" } ?>
//       const m = token.match(/<\?include\s+["']([\s\S]*?)["']\s*(?:,\s*([\s\S]*?))?\s*\?>/);
//       const includePath = m ? m[1].trim() : '';
//       const includeArgs = m && m[2] ? m[2].trim() : '{}';
//       code += `__out += await __include(${JSON.stringify(includePath)}, (${includeArgs}));\n`;
//     }*/
    

//     cursor = tokenIndex + token.length;
//   }

//   addLiteral(template.slice(cursor));
//   code += 'return __out;';
//   // console.log(code);
//   return code;
// }

//module.exports={compileTemplateString};