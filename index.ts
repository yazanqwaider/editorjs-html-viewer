class HtmlViewer {
    /**
     * The json content that will be converted to html.
     */
    jsonContent: Array<EditorJsElement>

    /**
     * The converted html content.
     */
    html?: string

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
                case "text": result+= this.parseParagraph(jsonItem); break;
                case "header": result+= this.parseHeader(jsonItem); break;
                case "table": result+= this.parseTable(jsonItem); break;
                case "image": result+= this.parseImage(jsonItem); break;
                case "quote": result+= this.parseQuote(jsonItem); break;
                case "list": result+= this.parseList(jsonItem); break;
                case "link": result+= this.parseLink(jsonItem); break;
                case "delimiter": result+= this.parseDelimiter(jsonItem); break;
                case "checklist": result+= this.parseChecklist(jsonItem); break;
                case "warning": result+= this.parseWarning(jsonItem); break;
            }
        });
        
        result = result.replace(/(\r\n|\n|\r|\t)/gm, "");
        this.html = result;
    }

    /**
     * Render the html content in specific element
     * 
     * @param selector
     */
    render(selector: string): void {
        const element: Element|null = document.querySelector(selector);
        if(element != null) {
            if(this.html) {
                element.innerHTML = this.html;
            }
            else {
                console.error('The html content is empty !');
            }
        }
        else {
            console.error('The element is not found !');
        }
    }

    /**
     * Parse paragraph item type to html.
     * 
     * @param jsonItem
     */
    parseParagraph(jsonItem: ParagraphElement): string {
        const data = jsonItem.data;

        // replace all inline-code class by it's style
        const inlineCodeStyle = `style="
                background: rgba(250, 239, 240, 0.78);
                color: #b44437;
                padding: 3px 4px;
                border-radius: 5px;
                margin: 0 1px;
                font-family: inherit;
                font-size: 0.86em;
                font-weight: 500;
                letter-spacing: 0.3px;"`;
        let text = data.text.replace('class="inline-code"', inlineCodeStyle);

        return `<p>${text}</p>`;
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
        let table: string = '<table style="border: 1px solid #f1f1f1;">';

        if(data.withHeadings) {
            let firstRow = data.content[0];
            let heading = '<thead style="border-bottom: 1px solid #f1f1f1;"><tr>';
            firstRow.map((col, index) => {
                heading+= `<th style="border-left: 1px solid #e1e1e1; border-right: 1px solid #e1e1e1; padding: 5px;">${col}</th>`;
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
            overflow: hidden !important;
            ${(data.withBackground)? "background-color: #f1f1f1;" : ""}
            ${(data.withBorder)? "border: 1px solid #747474;" : ""}
        `;

        let imageLayout = `<div style="${layoutStyle}">`;

        let imageStyle = (data.stretched)? "width: 100% !important;" : "";
        imageLayout+= `<img src="${data.file.url}" style="${imageStyle}" alt="Image" />`;

        if(data.caption) {
            imageLayout+= `<p style="padding: 7px 15px !important;">${data.caption}</p>`;
        }
        imageLayout+= "</div>";

        return imageLayout;
    }

    /**
     * Parse image item type with it's styles and caption to html.
     * 
     * @param jsonItem
     */
    parseQuote(jsonItem: QuoteElement): string {
        const data = jsonItem.data;
        let alignment = data.alignment || 'left';

        const beginIcon = `<svg xmlns="http://www.w3.org/2000/svg" 
                                width="18" height="18" viewBox="0 0 24 24">
                                <path d="M13 14.725c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275zm-13 0c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275z"/>
                            </svg>`;
        const endIcon = `<svg xmlns="http://www.w3.org/2000/svg"
                                width="18" height="18" viewBox="0 0 24 24">
                                <path d="M11 9.275c0 5.141-3.892 10.519-10 11.725l-.984-2.126c2.215-.835 4.163-3.742 4.38-5.746-2.491-.392-4.396-2.547-4.396-5.149 0-3.182 2.584-4.979 5.199-4.979 3.015 0 5.801 2.305 5.801 6.275zm13 0c0 5.141-3.892 10.519-10 11.725l-.984-2.126c2.215-.835 4.163-3.742 4.38-5.746-2.491-.392-4.396-2.547-4.396-5.149 0-3.182 2.584-4.979 5.199-4.979 3.015 0 5.801 2.305 5.801 6.275z"/>
                                </svg>`;

        let quoteStyle = `text-align: ${alignment} !important`;
        
        let quote = `
            <div style="${quoteStyle}">
                <p style="margin-top: 5px; margin-bottom: 5px;">
                    <span>${beginIcon}</span>
                    ${data.text}
                    <span>${endIcon}</span>
                </p>
                <smal style="padding-left: 15px !important; color: #5e5e5e !important;">
                    ${data.caption}
                </small>
            </div>
        `;
        return quote;
    }

    /**
     * Parse list element to html.
     * 
     * @param jsonItem
     */
    parseList(jsonItem: ListElement): string {
        const data = jsonItem.data;
        let beginList = `${data.style == 'ordered'? '<ol>' : '<ul>'}`;
        let endList = `${data.style == 'ordered'? '</ol>' : '</ul>'}`;
        let list = beginList;

        function renderListItem(item: string|NestedListItem): string {
            let listItem = '';
            if(typeof(item) == 'string') {
                listItem+= `<li>${item}</li>`;
            }
            else if('content' in item) {
                listItem+= `<li>${item.content}`;

                if(item.items && item.items.length > 0) {
                    listItem+= `${beginList}`;
                    item.items.map((nestedItem: NestedListItem) => {
                        listItem+= renderListItem(nestedItem);
                    });
                    listItem+= `${endList}`;
                }
                listItem+= `</li>`;
            }
            return listItem;
        }

        data.items.map((item: string|NestedListItem) => {
            list+= renderListItem(item);
        });

        list+= endList;
        return list;
    }

    /**
     * Parse preview link element to html.
     * 
     * @param jsonItem
     */
    parseLink(jsonItem: LinkElement): string {
        const data = jsonItem.data;

        let linkLayoutStyle = "display: flex;"+
                              "justify-content: space-between;"+
                              "align-items: center;"+
                              "background: white;"+
                              "padding: 11px;"+
                              "border: 1px solid #f5f5f5;"+
                              "border-radius: 8px;"+
                              "box-shadow: 1px 1px 2px #e5e5e5;"+
                              "text-decoration: none;"+
                              "color: black;";
                              
        let linkLayout = `<a href="${data.link}" title="${data.meta.title}" target="_blank" style="${linkLayoutStyle}">`;

        linkLayout+= '<div>';
        linkLayout+= `<h4>${data.meta.title}</h4>`;
        linkLayout+= `<p>${data.meta.description}</p>`;
        linkLayout+= `<span style="color: #c1c1c1;">${data.link}</span>`;
        linkLayout+= '</div>';

        if(data.meta.image.url) {
            linkLayout+= '<div>';
            linkLayout+= `<img src="${data.meta.image.url}" alt="Image" style="min-width:50px; max-width: 100px;" />`;
            linkLayout+= '</div>';
        }

        linkLayout+= '</a>';
        return linkLayout;
    }

    /**
     * get delimiter html content.
     * 
     */
    parseDelimiter(jsonItem: EditorJsElement): string {
        let delimiter = "<div style='text-align: center; font-size: 35px; margin: 18px auto;'>* * *</div>";
        return delimiter;
    }

    /**
     * Parse check list items with checked property.
     * 
     */
    parseChecklist(jsonItem: CheckListElement): string {
        const data = jsonItem.data;

        let checkList = '<div>';

        data.items.forEach((item) => {
            checkList+= '<div class="checklist-item" style="margin: 7px auto; display: flex; align-items: center;">';

            checkList+= `
                <span class="checklist-item-icon">
                    ${
                        (item.checked == true)? 
                            '<svg width="23" height="23" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.998 2.005c5.517 0 9.997 4.48 9.997 9.997 0 5.518-4.48 9.998-9.997 9.998-5.518 0-9.998-4.48-9.998-9.998 0-5.517 4.48-9.997 9.998-9.997zm-5.049 10.386 3.851 3.43c.142.128.321.19.499.19.202 0 .405-.081.552-.242l5.953-6.509c.131-.143.196-.323.196-.502 0-.41-.331-.747-.748-.747-.204 0-.405.082-.554.243l-5.453 5.962-3.298-2.938c-.144-.127-.321-.19-.499-.19-.415 0-.748.335-.748.746 0 .205.084.409.249.557z" fill-rule="nonzero"/></svg>' :
                            '<svg width="21" height="21" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11z"/></svg>'
                    }
                </span>
            `;

            checkList+= `<p style="padding: 0px 7px; margin: 0px; font-size:18px;">${item.text}</p>`;

            checkList+= '</div>';
        });

        checkList+= '</div>';

        return checkList;
    }

    /**
     * Parse warning item.
     * 
     */
    parseWarning(jsonItem: WarningElement): string {
        const data = jsonItem.data;

        let warning = '<div class="warning-layout" style="padding: 18px 5px;border: 1px solid #f7f7f7;margin: 8px;">';
        warning+= `<h4 style="margin: 0px; font-weight: bold;"><span>&#128073;</span> ${data.title}</h4>`;
        warning+= `<p style="margin: 3px 22px;color: #181818;">${data.message}</p>`;
        warning+= '</div>'

        return warning;
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

interface QuoteElement extends EditorJsElement {
    data: QuoteData
}

interface ListElement extends EditorJsElement {
    data: ListData
}

interface LinkElement extends EditorJsElement {
    data: LinkData
}

interface CheckListElement extends EditorJsElement {
    data: CheckListData
}

interface WarningElement extends EditorJsElement {
    data: WarningData
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

interface QuoteData {
    text: string
    caption: string
    alignment: string
}

interface ListData {
    style: "ordered" | "unordered"
    items: Array<string|NestedListItem>
}

interface NestedListItem {
    content: string
    items: Array<NestedListItem>
}

interface LinkData {
    link: string
    meta: LinkMeta
}

interface LinkMeta {
    title: string
    description: string
    image: ImageLinkMeta
}

interface ImageLinkMeta {
    url: string
}

interface CheckListData {
    items: Array<CheckListItem>
}

type CheckListItem = {
    text: string
    checked: boolean
}

interface WarningData {
    title: string
    message: string
}


export default HtmlViewer;