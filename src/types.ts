export interface SubSection {
  id: string;
  title: string;
  description?: string;
  type: 'text' | 'vs_matrix' | 'steps' | 'code_block' | 'table' | 'callout' | 'custom_diagram' | 'checklist';
  content?: string;
  extraData?: any; // versatile field for custom structures
}

export interface Chapter {
  id: string;
  num: number;
  tag: string;
  title: string;
  description: string;
  sections: SubSection[];
}

export interface SearchRecord {
  id: string;
  chapterId: string;
  chapterNum: number;
  chapterTitle: string;
  title: string;
  text: string;
  elementIdToScroll: string;
}
