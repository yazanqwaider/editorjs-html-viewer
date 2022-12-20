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
        let result: string = "<div id='editorjs-preview'>";

        this.jsonContent.map((jsonItem, index) => {
            result+= `<div class="ede" id="ede-${jsonItem.id}" style="margin: 10px 0px;">`;

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
                case "code": result+= this.parseCode(jsonItem); break;
                case "embed": result+= this.parseEmbed(jsonItem); break;
                case "personality": result+= this.parsePersonality(jsonItem); break;
                case "attaches": result+= this.parseAttaches(jsonItem); break;
            }

            result+= '</div>';
        });

        result+= '</div>';
        
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

                this.applyHandlers();
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
            table+= '<tr style="border-bottom: 1px solid #efefef;">';
            row.map((col) => {
                table+= `<td style="border-left: 1px solid #efefef; border-right: 1px solid #efefef; padding: 3px;">${col}</td>`;
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

        const beginIcon = `<svg style="display: inline-block !important;" xmlns="http://www.w3.org/2000/svg" 
                                width="18" height="18" viewBox="0 0 24 24">
                                <path d="M13 14.725c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275zm-13 0c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275z"/>
                            </svg>`;
        const endIcon = `<svg style="display: inline-block !important;" xmlns="http://www.w3.org/2000/svg"
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
        linkLayout+= (data.meta.description)? `<p>${data.meta.description}</p>` : '';
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
                            '<svg width="20" height="20" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11z"/></svg>'
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

        let warning = '<div class="warning-layout" style="padding: 18px 5px; border: 1px solid #f7f7f7; margin: 8px; box-shadow: 0px 0px 4px #f7f7f7;">';
        warning+= `<h4 style="margin: 0px; font-weight: bold;"><span>&#128073;</span> ${data.title}</h4>`;
        warning+= `<p style="margin: 3px 22px;color: #181818;">${data.message}</p>`;
        warning+= '</div>'

        return warning;
    }

    /**
     * Parse code element to html.
     * 
     * @param jsonItem 
     */
    parseCode(jsonItem: CodeElement): string {
        const data = jsonItem.data;

        let code = '<div style="padding: 18px; border-radius: 9px; background: #f6f8fa; line-height: 1.45; position: relative;">';

        let copyBtn = '<button class="copy-code-btn" style="position: absolute; top: 10px; right: 10px;">'+
                        '<svg width="24" height="24" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m6 18h-3c-.48 0-1-.379-1-1v-14c0-.481.38-1 1-1h14c.621 0 1 .522 1 1v3h3c.621 0 1 .522 1 1v14c0 .621-.522 1-1 1h-14c-.48 0-1-.379-1-1zm1.5-10.5v13h13v-13zm9-1.5v-2.5h-13v13h2.5v-9.5c0-.481.38-1 1-1z" fill-rule="nonzero"/></svg>'+
                    '</button>';
        
        code+= copyBtn;
        code+= `<p class="code-value">${data.code}</p>`;
        code+= '</div>';

        return code;
    }

    /**
     * Parse embed link to html.
     * 
     * @param jsonItem 
     */
    parseEmbed(jsonItem: EmbedElement): string {
        const data = jsonItem.data;

        let embedContent = `<iframe src="${data.embed}" width="${data.width}" height="${data.height}"`+
                            'style="border: 0; border-radius: 14px; box-shadow: 2px 2px 20px #e1e1e1;"'+
                        '></iframe>';
        
        let embedLayout = '<div>';
        embedLayout+= embedContent;

        if(data.caption) {
            embedLayout+= `<p style="padding: 0px; margin: 12px 23px;">${data.caption}</p>`;
        }
        
        embedLayout+= '</div>';
        return embedLayout;
    }


    /**
     * Parse personality card to html.
     * 
     * @param jsonItem 
     */
    parsePersonality(jsonItem: PersonalityElement): string {
        const data = jsonItem.data;

        const cardStyle = 'display: flex; justify-content: space-between; width: 80%; background: white;'+ 
            'border: 1px solid #ededed; padding: 18px; box-shadow: 1px 1px 4px #f3f3f3; border-radius: 7px;';

        let personality = `<div style="${cardStyle}">`;

        personality+= `<div>
                        <h3 style="font-size: 18px;">${data.name}</h3>
                        <p>${data.description}</p>
                        ${(data.link)? '<a href="${data.link}" style="color: #a3a3a3;">${data.link}</a>':''}
                    </div>`;

        if(data.photo) {
            personality+= `<img src="${data.photo}" style="width: 100px; border-radius: 5px;">`
        }

        personality+= '</div>';

        return personality;
    }

    /**
     * Parse attchments to html
     * 
     * @param jsonItem
     */
    parseAttaches(jsonItem: AttachesElement): string {
        const data = jsonItem.data;

        const attachmentStyle = 'display: flex; align-items: center; gap: 18px;'+
                                'text-decoration: none; color: black; width: 50%; padding: 13px;'+
                                'border: 1px solid #f1f1f1; border-radius: 9px;';
        
        const extensionStyle = 'display: inline-block; padding: 6px 6px; background: #db3737; color: white; border-radius: 7px;';


        let attachment = `<a href="${data.file.url}" target="_blank" style="${attachmentStyle}" title="${data.title}">`+
                            `<span style="${extensionStyle}">${data.file.extension}</span>`+
                            `<div>`+
                                `<p style="margin: 0px;">${data.file.name}</p>`+
                                `${(data.file.size)? `<span style="color: #8b8b8b; font-size: 15px;">${data.file.size} MiB</span>` : ''}`+
                            `</div>`+
                            '<span style="margin-left: auto; color: #565695;">Show</span>'+
                        `</a>`;

        return attachment;
    }

    /**
     * Apply some handlers to let features work correctly.
     * 
     */
    applyHandlers() {
        this.registerCopyHandler();
    }

    /**
     * register copy handler, to copy code text in code feature.
     * 
     */
    private registerCopyHandler(): void {
        const copyBtns = document.querySelectorAll('.ede .copy-code-btn');
        copyBtns.forEach((btn, index) => {
            btn.addEventListener('click', function() {
                const value = btn.nextElementSibling?.innerHTML;

                if(value) {
                    navigator.clipboard.writeText(value);
                }

                const svg = btn.querySelector('svg');
                if(svg) {
                    svg.style.display = "none";
                }

                let copiedNote = document.createElement('span');
                copiedNote.className = "copied-note";
                copiedNote.innerHTML = 'copied &#128077;';
                btn.append(copiedNote);

                setTimeout(() => {
                    if(svg) {
                        svg.style.display = "inline-block";
                        copiedNote.remove();
                    }
                }, 1500)
            });
        });
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

interface CodeElement extends EditorJsElement {
    data: CodeData
}

interface EmbedElement extends EditorJsElement {
    data: EmbedData
}

interface PersonalityElement extends EditorJsElement {
    data: PersonalityData
}

interface AttachesElement extends EditorJsElement {
    data: AttachesData
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

interface CodeData {
    code: string
}

interface EmbedData {
    service: string
    source: string
    embed: string
    width: number|string
    height: number|string
    caption: string|null
}


interface PersonalityData {
    name: string
    description: string
    link: string
    photo: string
}

interface AttachesData {
    file: AttachmentFile
    title?: string
}

type AttachmentFile = {
    url: string
    size?: string|number
    extension?: string
    name?: string
}

export default HtmlViewer;