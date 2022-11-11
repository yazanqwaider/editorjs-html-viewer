class HtmlViewer {
    /**
     * The json content that will be converted to html.
     */
    jsonContent: JSON

    /**
     * The converted html content.
     */
    html?: String

    /**
     * Initialize instance from HtmlViewer class.
     * 
     * @param jsonContent
     */
    constructor(jsonContent: JSON) {
        this.jsonContent = jsonContent;
        this.parser();
    }

    /**
     * 
     */
    parser() {
        // TODO
        this.html = "html content";
    }
}

export default HtmlViewer;