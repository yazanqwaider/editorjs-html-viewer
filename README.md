# EditorJs Html Viewer

Convert json elements that generated by [EditorJs](https://editorjs.io) to html content as string.

#### Install :
``` npm i editorjs-html-viewer ```

#### Import :

``` import HtmlViewer from 'editorjs-html-viewer'; ```

Or

``` let HtmlViewer = require('./dist/index').default; ```


#### Running :

```
    let jsonElements = "...";   // your stored content in database ...
    let htmlViewer = new HtmlViewer(jsonElements);
    console.log(htmlViewer.html);   // to show rendered html
```

```
    let htmlViewer = new HtmlViewer(jsonElements);
    htmlViewer.render("#contentLayout");    // you can render html directly by passing selector
```

#### Supported plugins :

- Text, Paragraph, Header
- Table
- Image
- Quote
- List
- Link
- Delimiter
