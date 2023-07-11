import './types/types';

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
     * The plain text of the content
     */
    private plainText: string = ""

    /**
     * Word per minute
     */
    private wpm: number = 250

    /**
     * The reading time
     */
    private readingTime: ReadingTime = {
        minutes: 0,
        wordsCount: 0
    }

    /**
     * The editorjs viewer options
     */
    private options: EditorJsOptions = {
        withDefaultStyle: false,
        codeTheme: "dark"
    }

    /**
     * Initialize instance from HtmlViewer class.
     * 
     * @param jsonContent
     */
    constructor(jsonContent: Array<EditorJsElement>, options?: EditorJsOptions) {
        this.jsonContent = jsonContent;

        if(options && typeof options == 'object') {
            if(options.withDefaultStyle) {
                this.options.withDefaultStyle = options.withDefaultStyle;
            }

            if(options.codeTheme) {
                this.options.codeTheme = options.codeTheme;
            }
        }

        this.parser();
    }

    /**
     * Parser of json list items in editorJs content.
     * 
     */
    parser() {
        let result: string = "<div id='editorjs-preview'>";

        this.jsonContent.map((jsonItem, index) => {
            result+= `<div class="ede" id="ede-${jsonItem.id}">`;

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
        this.calculateReadingTime();
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

                HtmlViewer.applyHandlers();
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
        if(data.text.length == 0) return '<br />';
        this.addPlainText(data.text);
        return `<p dir="auto">${data.text}</p>`;
    }

    /**
     * Parse header item type to html.
     * 
     * @param jsonItem
     */
    parseHeader(jsonItem: HeaderElement): string {
        const data = jsonItem.data;
        const level: String = (data.level)? data.level : "1";
        this.addPlainText(data.text);
        const headerClass = (this.options.withDefaultStyle)? `class="h${level}"` : '';
        return `<h${level} dir="auto" ${headerClass}>${data.text}</h${level}>`;
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
                this.addPlainText(col);
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
                this.addPlainText(col);
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

        let imageLayout = `<div class="image-layout ${(data.withBackground)? "image-wbackground":""} ${(data.withBorder)? "image-wborder" : ""}">`+
                            '<button class="scale-image-btn">'+
                                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 9h-2v-4h-4v-2h6v6zm-6 12v-2h4v-4h2v6h-6zm-18-6h2v4h4v2h-6v-6zm6-12v2h-4v4h-2v-6h6z"/></svg>'+
                            '</button>';

        imageLayout+= `<img src="${data.file.url}" class="${(data.stretched)? "width: 100%;" : ""}" alt="Image" />`;

        if(data.caption) {
            imageLayout+= `<p>${data.caption}</p>`;
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
        
        let quote = `
            <div class="quote-layout" style="text-align: ${alignment} !important;">
                <p>
                    <span>${beginIcon}</span>
                    ${data.text}
                    <span>${endIcon}</span>
                </p>

                <smal>${data.caption}</small>
            </div>
        `;

        this.addPlainText(`${data.text} ${data.caption}`);
        return quote;
    }

    /**
     * Parse list element to html.
     * 
     * @param jsonItem
     */
    parseList(jsonItem: ListElement): string {
        const data = jsonItem.data;
        const listClass = (this.options.withDefaultStyle)? 'class="list"' : '';

        let beginList = `${data.style == 'ordered'? `<ol ${listClass}>` : `<ul ${listClass}>`}`;
        let endList = `${data.style == 'ordered'? '</ol>' : '</ul>'}`;
        let list = beginList;

        let plainText = "";
        function renderListItem(item: string|NestedListItem): string {
            let listItem = '';
            if(typeof(item) == 'string') {
                listItem+= `<li>${item}</li>`;
                plainText+= " " + item;
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
                plainText+= " " + item.content;
            }

            return listItem;
        }

        data.items.map((item: string|NestedListItem) => {
            list+= renderListItem(item);
        });

        list+= endList;
        this.addPlainText(plainText);
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

        this.addPlainText(`${data.meta.title} ${data.meta.description || ''}`);
        return linkLayout;
    }

    /**
     * get delimiter html content.
     * 
     */
    parseDelimiter(jsonItem: EditorJsElement): string {
        return "<div class='delimiter'>* * *</div>";
    }

    /**
     * Parse check list items with checked property.
     * 
     */
    parseChecklist(jsonItem: CheckListElement): string {
        const data = jsonItem.data;
        let plainText = "";

        let checkList = '<div>';
        data.items.forEach((item) => {
            checkList+= '<div class="checklist-item">';

            checkList+= `
                <span class="checklist-item-icon">
                    ${
                        (item.checked == true)? 
                            '<svg width="23" height="23" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.998 2.005c5.517 0 9.997 4.48 9.997 9.997 0 5.518-4.48 9.998-9.997 9.998-5.518 0-9.998-4.48-9.998-9.998 0-5.517 4.48-9.997 9.998-9.997zm-5.049 10.386 3.851 3.43c.142.128.321.19.499.19.202 0 .405-.081.552-.242l5.953-6.509c.131-.143.196-.323.196-.502 0-.41-.331-.747-.748-.747-.204 0-.405.082-.554.243l-5.453 5.962-3.298-2.938c-.144-.127-.321-.19-.499-.19-.415 0-.748.335-.748.746 0 .205.084.409.249.557z" fill-rule="nonzero"/></svg>' :
                            '<svg width="20" height="20" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11z"/></svg>'
                    }
                </span>
            `;

            checkList+= `<p>${item.text}</p>`;
            checkList+= '</div>';

            plainText+= ` ${item.text}`;
        });

        checkList+= '</div>';

        this.addPlainText(plainText);
        return checkList;
    }

    /**
     * Parse warning item.
     * 
     */
    parseWarning(jsonItem: WarningElement): string {
        const data = jsonItem.data;

        let warning = '<div class="warning-layout">';
        warning+= `<h4><span>&#128073;</span> ${data.title}</h4>`;
        warning+= `<p>${data.message}</p>`;
        warning+= '</div>'

        this.addPlainText(`${data.title} ${data.message}`);
        return warning;
    }

    /**
     * Parse code element to html.
     * 
     * @param jsonItem 
     */
    parseCode(jsonItem: CodeElement): string {
        const data = jsonItem.data;

        let code = `<div class="code-layout ${this.options.codeTheme}-code-layout" dir="ltr">`;

        let copyBtn = '<button class="copy-code-btn">'+
                        '<svg width="24" height="24" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m6 18h-3c-.48 0-1-.379-1-1v-14c0-.481.38-1 1-1h14c.621 0 1 .522 1 1v3h3c.621 0 1 .522 1 1v14c0 .621-.522 1-1 1h-14c-.48 0-1-.379-1-1zm1.5-10.5v13h13v-13zm9-1.5v-2.5h-13v13h2.5v-9.5c0-.481.38-1 1-1z" fill-rule="nonzero"/></svg>'+
                    '</button>';
        
        code+= copyBtn;

        const codeContent = data.code.replace('\n', '<br>');
        code+= `<div class="code-header">${data.language || 'code'}</div>`;
        code+= `<p class="code-value">${codeContent}</p>`;
        code+= '</div>';

        this.addPlainText(data.code);
        return code;
    }

    /**
     * Parse embed link to html.
     * 
     * @param jsonItem 
     */
    parseEmbed(jsonItem: EmbedElement): string {
        const data = jsonItem.data;

        let embedLayout = '<div class="embed-layout">';
        embedLayout+= `<iframe src="${data.embed}" width="${data.width}" height="${data.height}"></iframe>`;

        if(data.caption) {
            embedLayout+= `<p class="embed-caption">${data.caption}</p>`;
            this.addPlainText(data.caption);
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

        let personality = `<div class="personality-layout">`;

        personality+= `<div>
                        <h3 style="font-size: 18px;">${data.name}</h3>
                        ${(data.description)? `<p>${data.description}</p>`:''}
                        ${(data.link)? `<a href="${data.link}" style="color: #a3a3a3;">${data.link}</a>`:''}
                    </div>`;

        if(data.photo) {
            personality+= `<img src="${data.photo}" class="person-image">`
        }

        personality+= '</div>';
        this.addPlainText(`${data.name} ${data.description}`);
        return personality;
    }

    /**
     * Parse attchments to html
     * 
     * @param jsonItem
     */
    parseAttaches(jsonItem: AttachesElement): string {
        const data = jsonItem.data;

        let attachment = `<a href="${data.file.url}" target="_blank" class="attachment-layout" title="${data.title}">`+
                            `<span class="attachment-extension">${data.file.extension}</span>`+
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
    static applyHandlers() {
        if(typeof document == 'undefined') {
            throw new Error('document is not defined, you can\'t call the applyHandlers function from server side.');
        }

        this.registerCopyHandler();
        this.registerScaleImageHandler();
    }

    /**
     * Register copy handler, to copy code text in code feature.
     * 
     */
    private static registerCopyHandler(): void {
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


    /**
     * Register scale image handler.
     * 
     */
    private static registerScaleImageHandler(): void {
        const scaleBtns = document.querySelectorAll('.ede .scale-image-btn');

        scaleBtns.forEach((btn, index) => {
            btn.addEventListener('click', function() {
                if(btn.parentElement!.classList.contains('scaled')) {
                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M18 3h2v4h4v2h-6v-6zm6 12v2h-4v4h-2v-6h6zm-18 6h-2v-4h-4v-2h6v6zm-6-12v-2h4v-4h2v6h-6z"/></svg>';
                    btn.parentElement!.classList.remove('scaled');
                }
                else {
                    btn.parentElement!.classList.add('scaled');
                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 9h-2v-4h-4v-2h6v6zm-6 12v-2h4v-4h2v6h-6zm-18-6h2v4h4v2h-6v-6zm6-12v2h-4v4h-2v-6h6z"/></svg>';
                }
            });
        });
    }

    /**
     * Add the plain text
     */
    private addPlainText(text: String): void {
        this.plainText+= ` ${text}`; 
    }

    /**
     * Calculate the reading time based on words count
     * and word per minute
     */
    private calculateReadingTime(): void {
        const wordsCount: number = this.plainText.split(' ').length;
        if(wordsCount > 0) {
            const minutes: number = Math.ceil(wordsCount / this.wpm);
            this.readingTime.wordsCount = wordsCount;
            this.readingTime.minutes = minutes;
        }
    }
    
    /**
     * Reading time getter
     * 
     */
    public getReadingTime(): ReadingTime {
        return this.readingTime;
    }

    public toString = (): String|undefined => {
        return this.html;
    }
}

export default HtmlViewer;