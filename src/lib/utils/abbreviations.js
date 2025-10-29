/** @type {{ work: string, abbreviation: string }[]} */
let abbreviations = [
    {
        work: 'Genesis',
        abbreviation: 'Gen'
    },
    {
        work: 'Exodus',
        abbreviation: 'Exod'
    },
    {
        work: 'Leviticus',
        abbreviation: 'Lev'
    },
    {
        work: 'Numbers',
        abbreviation: 'Num'
    },
    {
        work: 'Deuteronomy',
        abbreviation: 'Deut'
    },
    {
        work: 'Joshua',
        abbreviation: 'Josh'
    },
    {
        work: 'Judges',
        abbreviation: 'Judg'
    },
    {
        work: 'Ruth',
        abbreviation: 'Ruth'
    },
    {
        work: '1 Samuel',
        abbreviation: '1Sam'
    },
    {
        work: '2 Samuel',
        abbreviation: '2Sam'
    },
    {
        work: '1 Kings',
        abbreviation: '1Kgs'
    },
    {
        work: '2 Kings',
        abbreviation: '2Kgs'
    },
    {
        work: '1 Chronicles',
        abbreviation: '1Chr'
    },
    {
        work: '2 Chronicles',
        abbreviation: '2Chr'
    },
    {
        work: 'Ezra',
        abbreviation: 'Ezra'
    },
    {
        work: 'Nehemiah',
        abbreviation: 'Neh'
    },
    {
        work: 'Esther',
        abbreviation: 'Esth'
    },
    {
        work: 'Job',
        abbreviation: 'Job'
    },
    {
        work: 'Psalms',
        abbreviation: 'Ps'
    },
    {
        work: 'Proverbs',
        abbreviation: 'Prov'
    },
    {
        work: 'Ecclesiastes (or Qoheleth)',
        abbreviation: 'Eccl'
    },
    {
        work: 'Song of Songs',
        abbreviation: 'Song'
    },
    {
        work: 'Isaia',
        abbreviation: 'Is'
    },
    {
        work: 'Jeremiah',
        abbreviation: 'Jer'
    },
    {
        work: 'Lamentations',
        abbreviation: 'Lam'
    },
    {
        work: 'Ezekiel',
        abbreviation: 'Ezek'
    },
    {
        work: 'Daniel',
        abbreviation: 'Dan'
    },
    {
        work: 'Hosea',
        abbreviation: 'Hos'
    },
    {
        work: 'Joel',
        abbreviation: 'Joel'
    },
    {
        work: 'Amos',
        abbreviation: 'Amos'
    },
    {
        work: 'Obadiah',
        abbreviation: 'Obad'
    },
    {
        work: 'Jonah',
        abbreviation: 'Jonah'
    },
    {
        work: 'Micah',
        abbreviation: 'Mic'
    },
    {
        work: 'Nahum',
        abbreviation: 'Nah'
    },
    {
        work: 'Habakkuk',
        abbreviation: 'Hab'
    },
    {
        work: 'Zephaniah',
        abbreviation: 'Zeph'
    },
    {
        work: 'Haggai',
        abbreviation: 'Hag'
    },
    {
        work: 'Zechariah',
        abbreviation: 'Zech'
    },
    {
        work: 'Malachi',
        abbreviation: 'Mal'
    },
    {
        work: 'Tobit',
        abbreviation: 'Tob'
    },
    {
        work: 'Judith',
        abbreviation: 'Jdt'
    },
    {
        work: 'Wisdom of Solomon',
        abbreviation: 'Wis'
    },
    {
        work: 'Sirach/Ecclesiasticus',
        abbreviation: 'Sir'
    },
    {
        work: 'Baruch',
        abbreviation: 'Bar'
    },
    {
        work: 'Susanna',
        abbreviation: 'Sus'
    },
    {
        work: '1 Maccabees',
        abbreviation: '1Macc'
    },
    {
        work: '2 Maccabees',
        abbreviation: '2Macc'
    },
    {
        work: '1 Esdras',
        abbreviation: '1Esd'
    },
    {
        work: '2 Esdras',
        abbreviation: '2Esd'
    },
    {
        work: 'Matthew',
        abbreviation: 'Matt'
    },
    {
        work: 'Mark',
        abbreviation: 'Mark'
    },
    {
        work: 'Luke',
        abbreviation: 'Luke'
    },
    {
        work: 'John',
        abbreviation: 'John'
    },
    {
        work: 'Acts',
        abbreviation: 'Acts'
    },
    {
        work: 'Romans',
        abbreviation: 'Rom'
    },
    {
        work: '1 Corinthians',
        abbreviation: '1Cor'
    },
    {
        work: '2 Corinthians',
        abbreviation: '2Cor'
    },
    {
        work: 'Galatians',
        abbreviation: 'Gal'
    },
    {
        work: 'Ephesians',
        abbreviation: 'Eph'
    },
    {
        work: 'Philippians',
        abbreviation: 'Phil'
    },
    {
        work: 'Colossians',
        abbreviation: 'Col'
    },
    {
        work: '1 Thessalonians',
        abbreviation: '1Thess'
    },
    {
        work: '2 Thessalonians',
        abbreviation: '2Thess'
    },
    {
        work: '1 Timothy',
        abbreviation: '1Tim'
    },
    {
        work: '2 Timothy',
        abbreviation: '2Tim'
    },
    {
        work: 'Titus',
        abbreviation: 'Titus'
    },
    {
        work: 'Philemon',
        abbreviation: 'Phlm'
    },
    {
        work: 'Hebrews',
        abbreviation: 'Heb'
    },
    {
        work: 'James',
        abbreviation: 'Jas'
    },
    {
        work: '1 Peter',
        abbreviation: '1Pet'
    },
    {
        work: '2 Peter',
        abbreviation: '2Pet'
    },
    {
        work: '1 John',
        abbreviation: '1John'
    },
    {
        work: '2 John',
        abbreviation: '2John'
    },
    {
        work: '3 John',
        abbreviation: '3John'
    },
    {
        work: 'Jude',
        abbreviation: 'Jude'
    },
    {
        work: 'Revelation',
        abbreviation: 'Rev'
    }
];

/**
 * A map from abbreviations to full biblical reference names
 * @type {Map<string, string>}
 */
export const abbreviationToFullReference = new Map(abbreviations.map(abbr => {
    return [abbr.abbreviation, abbr.work];
}));

/**
 * Strips paragraph numbers and spaces from 'short' quotation references
 * @param {string} abbreviation
 * @return {string}
 */
export function stripParagraphFromAbbreviation(abbreviation) {
    let trimmedAbbreviation = abbreviation.trim();
    return trimmedAbbreviation.split(' ')[0];
}