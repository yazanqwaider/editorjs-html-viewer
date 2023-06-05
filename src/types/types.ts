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


type ReadingTime = {
    minutes: number
    wordsCount: number
}