const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
console.log(md.render('# Hello'));
