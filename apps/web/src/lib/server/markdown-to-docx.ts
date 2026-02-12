import { marked, type Token } from 'marked';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from 'docx';

type HeadingLevelType = (typeof HeadingLevel)[keyof typeof HeadingLevel];

const HEADING_MAP: Record<number, HeadingLevelType> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
};

function inlineTokensToRuns(tokens: Token[]): TextRun[] {
  const runs: TextRun[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        runs.push(new TextRun({ text: token.text }));
        break;
      case 'strong':
        if ('tokens' in token && token.tokens) {
          for (const child of token.tokens) {
            runs.push(new TextRun({ text: 'text' in child ? child.text : '', bold: true }));
          }
        }
        break;
      case 'em':
        if ('tokens' in token && token.tokens) {
          for (const child of token.tokens) {
            runs.push(new TextRun({ text: 'text' in child ? child.text : '', italics: true }));
          }
        }
        break;
      case 'codespan':
        runs.push(
          new TextRun({
            text: 'text' in token ? token.text : '',
            font: 'Courier New',
            size: 20,
          }),
        );
        break;
      case 'link':
        runs.push(
          new TextRun({
            text: 'text' in token ? token.text : '',
            underline: {},
            color: '0563C1',
          }),
        );
        break;
      default:
        if ('text' in token) {
          runs.push(new TextRun({ text: token.text }));
        }
    }
  }

  return runs;
}

function tokensToParagraphs(tokens: Token[]): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const level = HEADING_MAP[token.depth] ?? HeadingLevel.HEADING_1;
        const runs = token.tokens ? inlineTokensToRuns(token.tokens) : [new TextRun({ text: token.text })];
        elements.push(new Paragraph({ heading: level, children: runs }));
        break;
      }
      case 'paragraph': {
        const runs = token.tokens ? inlineTokensToRuns(token.tokens) : [new TextRun({ text: token.text })];
        elements.push(new Paragraph({ children: runs }));
        break;
      }
      case 'code': {
        const lines = token.text.split('\n');
        for (const line of lines) {
          elements.push(
            new Paragraph({
              children: [
                new TextRun({ text: line, font: 'Courier New', size: 20 }),
              ],
              spacing: { before: 40, after: 40 },
            }),
          );
        }
        break;
      }
      case 'list': {
        for (const item of token.items) {
          const runs = item.tokens
            ? item.tokens.flatMap((t: Token) =>
                'tokens' in t && t.tokens ? inlineTokensToRuns(t.tokens) : [new TextRun({ text: 'text' in t ? t.text : '' })],
              )
            : [new TextRun({ text: item.text })];
          elements.push(
            new Paragraph({
              children: runs,
              bullet: { level: 0 },
            }),
          );
        }
        break;
      }
      case 'blockquote': {
        if (token.tokens) {
          const inner = tokensToParagraphs(token.tokens);
          for (const el of inner) {
            if (el instanceof Paragraph) {
              elements.push(
                new Paragraph({
                  ...el,
                  indent: { left: 720 },
                }),
              );
            } else {
              elements.push(el);
            }
          }
        }
        break;
      }
      case 'table': {
        const borderStyle = {
          style: BorderStyle.SINGLE,
          size: 1,
          color: 'AAAAAA',
        };
        const borders = {
          top: borderStyle,
          bottom: borderStyle,
          left: borderStyle,
          right: borderStyle,
        };

        const headerRow = new TableRow({
          children: token.header.map(
            (cell: { text: string }) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: cell.text, bold: true })] })],
                borders,
              }),
          ),
        });

        const dataRows = token.rows.map(
          (row: Array<{ text: string }>) =>
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: cell.text })] })],
                    borders,
                  }),
              ),
            }),
        );

        elements.push(
          new Table({
            rows: [headerRow, ...dataRows],
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.LEFT,
          }),
        );
        break;
      }
      case 'space':
        break;
      case 'hr':
        elements.push(
          new Paragraph({
            children: [],
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' } },
          }),
        );
        break;
      default:
        if ('text' in token) {
          elements.push(new Paragraph({ children: [new TextRun({ text: token.text })] }));
        }
    }
  }

  return elements;
}

export function markdownToDocxSections(markdown: string): (Paragraph | Table)[] {
  const tokens = marked.lexer(markdown);
  return tokensToParagraphs(tokens);
}

export function createDocxDocument(markdown: string): Document {
  const sections = markdownToDocxSections(markdown);
  return new Document({
    sections: [{ children: sections }],
  });
}
