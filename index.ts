class HtmlViewer {
    /**
     * The json content that will be converted to html.
     */
    jsonContent: Array<EditorJsElement>

    /**
     * The converted html content.
     */
    html?: String

    /**
     * Initialize instance from HtmlViewer class.
     * 
     * @param jsonContent
     */
    constructor(jsonContent: Array<EditorJsElement>) {
        this.jsonContent = jsonContent;
        this.parser();
    }

    /**
     * Parser of json list items in editorJs content.
     * 
     */
    parser() {
        let result: String = "";

        this.jsonContent.map((jsonItem, index) => {
            switch(jsonItem.type) {
                case "paragraph": result+= this.parseParagraph(jsonItem); break;
                case "header": result+= this.parseHeader(jsonItem); break;
            }
        });

        this.html = result;
    }

    /**
     * Parse paragraph item type to html.
     * 
     * @param jsonItem
     */
    parseParagraph(jsonItem: ParagraphElement) {
        const data = jsonItem.data;
        return `<p>${data.text}</p>`;
    }

    /**
     * Parse header item type to html.
     * 
     * @param jsonItem
     */
    parseHeader(jsonItem: HeaderElement) {
        const data = jsonItem.data;
        const level: String = (data.level)? data.level : "1";
        return `<h${level}>${data.text}</h${level}>`;
    }

    public toString = (): String|undefined => {
        return this.html;
    }
}


interface EditorJsElement {
    id: String
    type: String
    data: any
}


interface ParagraphElement extends EditorJsElement {
    data: ParagraphData
}
interface HeaderElement extends EditorJsElement {
    data: HeaderData
}


interface HeaderData {
    text: String
    level: String
}
interface ParagraphData {
    text: String
}

export default HtmlViewer;