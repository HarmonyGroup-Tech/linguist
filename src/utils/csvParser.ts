import { Lesson } from '../services/lessonService';

export interface CSVParseResult {
    lessons: Omit<Lesson, 'id' | 'createdAt'>[];
    errors: string[];
}

export function parseCSV(csvText: string, createdBy: string): CSVParseResult {
    const lessons: Omit<Lesson, 'id' | 'createdAt'>[] = [];
    const errors: string[] = [];

    // Split into lines and remove empty lines
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
        errors.push('CSV file is empty');
        return { lessons, errors };
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = [
        'title', 'description', 'language', 'level', 'type', 'category',
        'context', 'targetSentence', 'correctTranslation', 'sourceTitle', 'sourceAuthor',
        'requiredVocabulary', 'requiredGrammar', 'requiredReading', 'requiredWriting',
        'xpReward', 'vocabularyGain', 'grammarGain', 'readingGain', 'writingGain',
        'order', 'scrambledOptions'
    ];

    // Validate header
    const missingHeaders = expectedHeaders.filter(h => !header.includes(h));
    if (missingHeaders.length > 0) {
        errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
        return { lessons, errors };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        try {
            const values = parseCSVLine(line);

            if (values.length !== expectedHeaders.length) {
                errors.push(`Row ${i + 1}: Expected ${expectedHeaders.length} columns, got ${values.length}`);
                continue;
            }

            const rowData: any = {};
            expectedHeaders.forEach((header, index) => {
                rowData[header] = values[index].trim();
            });

            // Validate and convert types
            // Normalize language (e.g., "german" -> "German")
            const rawLang = rowData.language || 'German';
            const normalizedLang = rawLang.charAt(0).toUpperCase() + rawLang.slice(1).toLowerCase();

            const lesson: any = {
                title: rowData.title,
                description: rowData.description,
                language: normalizedLang,
                level: parseInt(rowData.level),
                type: rowData.type as 'text-input' | 'drag-drop',
                category: rowData.category as 'standard' | 'quotation',
                context: rowData.context,
                targetSentence: rowData.targetSentence,
                correctTranslation: rowData.correctTranslation,
                sourceTitle: rowData.sourceTitle || '',
                sourceAuthor: rowData.sourceAuthor || '',
                requiredVocabulary: parseInt(rowData.requiredVocabulary),
                requiredGrammar: parseInt(rowData.requiredGrammar),
                requiredReading: parseInt(rowData.requiredReading),
                requiredWriting: parseInt(rowData.requiredWriting),
                xpReward: parseInt(rowData.xpReward),
                vocabularyGain: parseInt(rowData.vocabularyGain),
                grammarGain: parseInt(rowData.grammarGain),
                readingGain: parseInt(rowData.readingGain),
                writingGain: parseInt(rowData.writingGain),
                order: parseInt(rowData.order),
                createdBy,
                isActive: true
            };

            if (rowData.scrambledOptions && rowData.scrambledOptions.trim() !== "") {
                lesson.scrambledOptions = rowData.scrambledOptions.split('|');
            }

            // Validate required fields
            if (!lesson.title || !lesson.language || !lesson.context || !lesson.targetSentence || !lesson.correctTranslation) {
                errors.push(`Row ${i + 1}: Missing required fields (title, language, context, targetSentence, or correctTranslation)`);
                continue;
            }

            // Validate numeric fields
            if (isNaN(lesson.level) || lesson.level < 1 || lesson.level > 10) {
                errors.push(`Row ${i + 1}: Invalid level (must be 1-10)`);
                continue;
            }

            // Validate type and category
            if (!['text-input', 'drag-drop'].includes(lesson.type)) {
                errors.push(`Row ${i + 1}: Invalid type (must be 'text-input' or 'drag-drop')`);
                continue;
            }

            if (!['standard', 'quotation'].includes(lesson.category)) {
                errors.push(`Row ${i + 1}: Invalid category (must be 'standard' or 'quotation')`);
                continue;
            }

            lessons.push(lesson);
        } catch (error) {
            errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
        }
    }

    return { lessons, errors };
}

// Helper function to parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}
