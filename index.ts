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
        let result: string = "";

        this.jsonContent.map((jsonItem, index) => {
            switch(jsonItem.type) {
                case "paragraph": result+= this.parseParagraph(jsonItem); break;
                case "header": result+= this.parseHeader(jsonItem); break;
                case "table": result+= this.parseTable(jsonItem); break;
                case "image": result+= this.parseImage(jsonItem); break;
            }
        });
   
        this.html = result;
    }

    /**
     * Parse paragraph item type to html.
     * 
     * @param jsonItem
     */
    parseParagraph(jsonItem: ParagraphElement): string {
        const data = jsonItem.data;
        return `<p>${data.text}</p>`;
    }

    /**
     * Parse header item type to html.
     * 
     * @param jsonItem
     */
    parseHeader(jsonItem: HeaderElement): string {
        const data = jsonItem.data;
        const level: String = (data.level)? data.level : "1";
        return `<h${level}>${data.text}</h${level}>`;
    }

    /**
     * Parse table item type with it's rows and columns to html.
     * 
     * @param jsonItem
     */
    parseTable(jsonItem: TableElement): string {
        const data = jsonItem.data;
        let rows = data.content;
        let table: string = '<table>';

        if(data.withHeadings) {
            let firstRow = data.content[0];
            let heading = '<thead><tr>';
            firstRow.map((col, index) => {
                heading+= `<th>${col}</th>`;
            });
            heading+= '</tr></thead>';

            table+= heading;
            rows = rows.slice(1, rows.length);
        }

        table+= '<tbody>';
        rows.map((row) => {
            table+= '<tr>';
            row.map((col) => {
                table+= `<td>${col}</td>`;
            });
            table+= '</tr>';
        });
        table+= '</tbody>';

        table+= '</table>';
        return table;
    }

    /**
     * Parse image item type with it's styles and caption to html.
     * 
     * @param jsonItem
     */
    parseImage(jsonItem: ImageElement): string {
        const data = jsonItem.data;

        let layoutStyle = `
            width: 100% !important; 
            border-radius: 8px !important; 
            overflow: hidden !important;";
            ${(data.withBackground)? "background-color: #f1f1f1;" : ""}
            ${(data.withBorder)? "border: 1px solid #747474;" : ""}
        `;
        layoutStyle = layoutStyle.replace(/(\r\n|\n|\r)/gm, "");

        let imageLayout = `<div style="${layoutStyle}">`;

        let imageStyle = (data.stretched)? "width: 100% !important;" : "";
        imageLayout+= `<img src="${data.file.url}" style="${imageStyle}" alt="Image" />`;

        if(data.caption) {
            imageLayout+= `<p style="padding: 7px 15px !important;">${data.caption}</p>`;
        }
        imageLayout+= "</div>";

        return imageLayout;
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


// Elements interfaces
interface ParagraphElement extends EditorJsElement {
    data: ParagraphData
}

interface HeaderElement extends EditorJsElement {
    data: HeaderData
}

interface TableElement extends EditorJsElement {
    data: TableData
}

interface ImageElement extends EditorJsElement {
    data: ImageData
}


// Data interfaces
interface HeaderData {
    text: String
    level: String
}

interface ParagraphData {
    text: String
}

interface TableData {
    withHeadings?: String
    content: Array<Array<any>>
}

interface ImageData {
    file: {
        url: string
    }
    caption?: string
    withBorder: boolean
    stretched: boolean
    withBackground: Boolean
}

export default HtmlViewer;