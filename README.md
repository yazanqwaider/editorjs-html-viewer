# EditorJs Html Viewer

Convert json elements that generated by [EditorJs](https://editorjs.io) to html content as string.



## Installing

```shell
npm i editorjs-html-viewer 
```


## Import

***JS***

```js
import HtmlViewer from 'editorjs-html-viewer';
```

And in nodejs environment :

```js
const HtmlViewer = require('editorjs-html-viewer').default;
```


***CSS***

Import style from cdn :
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/editorjs-html-viewer@latest/dist/css/main.min.css">
```

Import style from css file :
```css
@import 'editorjs-html-viewer/dist/css/main.min.css';
```

From js code :

```js
import 'editorjs-html-viewer/dist/css/main.min.css';
```



## Usage

```js
// converted your stored content in database to json.
let jsonElements = "...";

// create new object from HtmlViewer class with json as parameter.
let htmlViewer = new HtmlViewer(jsonElements);

// you can use the html code result in your way.
console.log(htmlViewer.html);   
```

```js
let htmlViewer = new HtmlViewer(jsonElements);

// you can render the html directly by passing the selector
htmlViewer.render("#contentLayout");
```

**Note** If you use the html result by your way, you need to call ***applyHandlers*** function to let some features work correctly.

```js
htmlViewer.applyHandlers(); 
```


## Supported plugins

- Text, Paragraph, Header
- Table
- Image
- Quote
- List
- Link
- Delimiter
- Inline code
- Code
- Checklist
- Warning
- Embed
- Personality
- Attaches