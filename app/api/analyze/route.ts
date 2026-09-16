import {NextResponse} from "next/server";

const STOP = new Set(["the","and","is","it","to","of","a","in","that","for","on","with","as","this","at","by","an","be","are","from","or","was","were","has","have","had","but","not","what","all","when","there","can","will","should","would","could","do","did","does","their","his","her","its","our","your","my","they","them","he","she","we","us","you","me","him","who","which","where","how","why","if","so","than","then","more","most","some","any","no","only","also","just","into","over","after","before","between","through","during","without","again","further","once","here","there","up","down","out","off","about","against","both","each","few","many","much","such","own","same","too","very","s","t","re","ve","ll","d","m"]);

function tokenize(text: string){
  return text.toLowerCase().replace(/[^a-z' ]/gi," ").split(/\s+/).filter(Boolean);
}

function uniqueWords(text: string){
  return new Set(tokenize(text).filter(w => !STOP.has(w) && w.length > 2));
}

function countSentences(text: string){
  return (text.match(/[.!?]+/g) || []).length || (text.trim() ? 1 : 0);
}

function countParagraphs(text: string){
  const parts = text.split(/\n\s*\n/).filter(Boolean);
  return parts.length || (text.trim() ? 1 : 0);
}

function avgSentenceLength(text: string){
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  if (!sentences.length) return 0;
  const words = tokenize(text).length;
  return words / sentences.length;
}

function lexicalVariety(text: string){
  const words = tokenize(text);
  if (!words.length) return 0;
  const unique = new Set(words).size;
  return unique / words.length;
}

function linkingWords(text: string){
  const lower = text.toLowerCase();
  const list = ["however","moreover","furthermore","nevertheless","consequently","therefore","additionally","similarly","likewise","in contrast","on the other hand","nevertheless","nonetheless","for instance","for example","in conclusion","to conclude","in summary","overall","firstly","secondly","finally","admittedly","arguably","indeed","specifically","notably","alternatively"];
  let count = 0;
  for (const w of list){
    if (lower.includes(w)) count++;
  }
  return count;
}

function positionClarity(text: string){
  const lower = text.toLowerCase();
  const phrases = ["i believe","in my opinion","from my perspective","i think","i agree","i disagree","it is clear that","i would argue","my position","personally","arguably","clearly"];
  let count = 0;
  for (const p of phrases){
    if (lower.includes(p)) count++;
  }
  return count;
}

function balancedParagraphs(text: string){
  const parts = text.split(/\n\s*\n/).filter(Boolean);
  if (parts.length < 2) return 0;
  const lens = parts.map(p => tokenize(p).length);
  const min = Math.min(...lens);
  const max = Math.max(...lens);
  if (max === 0) return 0;
  return 1 - Math.max(0, (max - min)) / max;
}

function repeatedWordRatio(text: string){
  const words = tokenize(text).filter(w => w.length > 3);
  if (words.length < 10) return 0;
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const repeated = Object.values(freq).filter(v => v > 3).length;
  return repeated / words.length;
}

function complexSentenceRatio(text: string){
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  if (!sentences.length) return 0;
  let complexCount = 0;
  for (const s of sentences){
    const clauseMarkers = (s.match(/[,;:—–-]| and | but | or | although | because | since | while | whereas | however /gi) || []).length;
    if (clauseMarkers >= 2) complexCount++;
  }
  return complexCount / sentences.length;
}

function bandFromPercent(p: number, min = 4, max = 8.5){
  return Number((min + p / 100 * (max - min)).toFixed(1));
}

const messages: Record<string, {
  lengthOk: string; lengthShort: (words: number) => string;
  positionOk: string; positionMissing: string;
  structureOk: string; paragraphOk: string; structureShort: string; paragraphMissing: string;
  sentencesOk: string; sentencesShort: string;
  linkingOk: string; linkingMissing: string;
  vocabVarietyOk: string; vocabRepetition: string;
  vocabOk: string; vocabExpand: string;
  repetitionOk: string; repetitionHigh: string;
  grammarVarietyOk: string; grammarComplex: string;
  grammarLengthOk: string; grammarTooLong: string; grammarTooShort: string;
  balanceOk: string; balanceBad: string;
  fallback: string;
  targetTask: string; targetVocab: string; targetGrammar: string;
}> = {
  kk: {
    lengthOk: "Task 2 талабына сәйкес сөз саны жеткілікті.",
    lengthShort: (words) => `Эссе қысқа: ${words} сөз; кемінде 250 сөзге жеткізу керек.`,
    positionOk: "Айқын позиция көрсетілген.",
    positionMissing: "Позицияңызды айқын көрсетіңіз, оны жасырын қалдырмаңыз.",
    structureOk: "Эссе құрылымына кіріспе, негізгі бөлім және қорытынды кіреді.",
    paragraphOk: "Параграфтау дұрыс.",
    structureShort: "Тапсырманы айқын дамыту үшін 4+ параграф қолданыңыз.",
    paragraphMissing: "Айрықша қорытынды параграфты қосыңыз.",
    sentencesOk: "Сөйлемдер деңгейінде жеткілікті прогрессия.",
    sentencesShort: "Идеялар мен байланыс үшін көбірек сөйлем қосыңыз.",
    linkingOk: "Кейбір cohesion құралдары қолданылған.",
    linkingMissing: "However, moreover, therefore сияқты байланыс сөздерін қолданыңыз.",
    vocabVarietyOk: "Сөздік қорының алуантүрлілігі қанағаттанарлықты.",
    vocabRepetition: "Қайталауларды азайтып, дәлірек тақырыптық сөздерді қолданыңыз.",
    vocabOk: "Лексикалық қамту қанағаттанарлықты.",
    vocabExpand: "Сөздік қорыңызды кеңейтіп, кең тараған сөздерді артық қолданбаңыз.",
    repetitionOk: "Сөз қайталауы бақыланып тұр.",
    repetitionHigh: "Кейбір сөздер тым жиі қайталанып тұр; синонимдермен алмастырыңыз.",
    grammarVarietyOk: "Сөйлемдердің алуантүрлілігі бар.",
    grammarComplex: "Күрделі сөйлем құрылымдарын көбірек қосыңыз.",
    grammarLengthOk: "Сөйлем ұзындығы жалпылай қолайлы.",
    grammarTooLong: "Кейбір сөйлемдер тым ұзын; түсініктілік үшін бөліңіз.",
    grammarTooShort: "Кейбір сөйлемдер тым қысқа; идеяларды ұзақ құрылымдарға біріктіріңіз.",
    balanceOk: "Параграф ұзындықтары қатар тұр.",
    balanceBad: "Параграф ұзындықтарын теңестіріңіз; тым қысқа немесе тым ұзын блоктардан аулақ болыңыз.",
    fallback: "Бұл саланы дәл іздестіру арқылы одан әрі жетілдіріңіз.",
    targetTask: "Тапсырманы тікелей жауап беретін дамытылған мысалдар қосыңыз.",
    targetVocab: "Сөз таңдауын жақсартып, қайталауларды азайтыңыз.",
    targetGrammar: "Күрделі сөйлемдердегі дәлдікті жақсартыңыз.",
  },
  ru: {
    lengthOk: "Объем соответствует требованию Task 2.",
    lengthShort: (words) => `Эссе короткое: ${words} слов; стремитесь к минимум 250.`,
    positionOk: "Четкая позиция присутствует.",
    positionMissing: "Выразите позицию явно, а не оставляйте её подразумеваемой.",
    structureOk: "Структура эссе включает введение, основную часть и вывод.",
    paragraphOk: "Параграфование соблюдено.",
    structureShort: "Используйте 4+ параграфа для более четкого раскрытия задачи.",
    paragraphMissing: "Добавьте недостающие параграфы, особенно вывод.",
    sentencesOk: "Достаточно прогрессии на уровне предложений.",
    sentencesShort: "Добавьте больше предложений для развития идей и связности.",
    linkingOk: "Используются некоторые cohesive-средства.",
    linkingMissing: "Используйте linking-слова: however, moreover, therefore.",
    vocabVarietyOk: "Ассортимент лексики достаточно разнообразный.",
    vocabRepetition: "Уменьшите повторения и используйте более точную тематическую лексику.",
    vocabOk: "Лексическое покрытие приемлемое.",
    vocabExpand: "Расширьте словарный запас и избегайте избыточного использования простых слов.",
    repetitionOk: "Повтор слов контролируется.",
    repetitionHigh: "Некоторые слова повторяются слишком часто; замените синонимами.",
    grammarVarietyOk: "Есть разнообразие предложений.",
    grammarComplex: "Добавьте больше сложных предложений.",
    grammarLengthOk: "Длина предложений в целом уместна.",
    grammarTooLong: "Некоторые предложения слишком длинные; разделите для ясности.",
    grammarTooShort: "Некоторые предложения очень короткие; объедините идеи в более длинные структуры.",
    balanceOk: "Длины параграфов довольно сбалансированы.",
    balanceBad: "Сбалансируйте длины параграфов; избегайте очень коротких или очень длинных блоков.",
    fallback: "Продолжайте развивать эту область с более сфокусированной практикой.",
    targetTask: "Добавьте более развитую поддержку, напрямую отвечающую задаче.",
    targetVocab: "Улучшите выбор слов и уменьшите повторения.",
    targetGrammar: "Улучшите точность в сложных предложениях.",
  },
  en: {
    lengthOk: "Length meets Task 2 requirement.",
    lengthShort: (words) => `Essay is short at ${words} words; aim for at least 250.`,
    positionOk: "A clear position is present.",
    positionMissing: "State your position explicitly rather than leaving it implicit.",
    structureOk: "Essay structure includes introduction, body, and conclusion.",
    paragraphOk: "Paragraphing is appropriate.",
    structureShort: "Use 4+ paragraphs for clearer task development.",
    paragraphMissing: "Add missing paragraphs, especially a conclusion.",
    sentencesOk: "There is enough sentence-level progression.",
    sentencesShort: "Add more sentences to develop ideas and linking.",
    linkingOk: "Some cohesive devices are used.",
    linkingMissing: "Use linking words such as however, moreover, and therefore.",
    vocabVarietyOk: "Vocabulary range is reasonably varied.",
    vocabRepetition: "Reduce repetition and use more precise topic vocabulary.",
    vocabOk: "Lexical coverage is acceptable.",
    vocabExpand: "Expand vocabulary and avoid overusing common words.",
    repetitionOk: "Word repetition is controlled.",
    repetitionHigh: "Several words are repeated too often; replace with synonyms.",
    grammarVarietyOk: "There is sentence variety.",
    grammarComplex: "Include more complex sentence structures.",
    grammarLengthOk: "Sentence length is generally appropriate.",
    grammarTooLong: "Some sentences are too long; split for clarity.",
    grammarTooShort: "Some sentences are very short; combine ideas into longer structures.",
    balanceOk: "Paragraph lengths are reasonably balanced.",
    balanceBad: "Balance paragraph lengths; avoid very short or very long blocks.",
    fallback: "Keep developing this area with more focused practice.",
    targetTask: "Add more developed support directly answering the task.",
    targetVocab: "Upgrade word choice and reduce repetition.",
    targetGrammar: "Improve accuracy in complex sentences.",
  },
};

export async function POST(req:Request){
  try {
    const {essay, locale = "en"} = await req.json().catch(() => ({essay:"", locale:"en"}));
    if (typeof essay !== "string" || !essay.trim()) return NextResponse.json({error:"Essay is required"}, {status:400});

    const text = essay.trim();
    const words = tokenize(text).length;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const vocab = uniqueWords(text).size;
    const variety = lexicalVariety(text);
    const linking = linkingWords(text);
    const position = positionClarity(text);
    const balance = balancedParagraphs(text);
    const repetition = repeatedWordRatio(text);
    const complexSentences = complexSentenceRatio(text);
    const avgLength = avgSentenceLength(text);

    const trPercent = Math.min(100, Math.max(20,
      (words >= 250 ? 25 : words >= 180 ? 15 : 5) +
      (position >= 1 ? 20 : 5) +
      (paragraphs >= 4 ? 20 : paragraphs >= 3 ? 12 : 5) +
      (sentences >= 14 ? 20 : sentences >= 10 ? 12 : 5) +
      (words <= 320 ? 10 : 5)
    ));
    const ccPercent = Math.min(100, Math.max(20,
      (paragraphs >= 4 ? 25 : paragraphs >= 3 ? 15 : 5) +
      (balance * 20) +
      (linking >= 4 ? 25 : linking >= 2 ? 15 : 5) +
      (avgLength >= 12 && avgLength <= 25 ? 15 : 8) +
      (sentences >= 12 ? 15 : 6)
    ));
    const lrPercent = Math.min(100, Math.max(20,
      Math.min(25, variety * 80) +
      (vocab >= 150 ? 25 : vocab >= 100 ? 18 : vocab >= 60 ? 10 : 4) +
      (repetition <= 0.08 ? 25 : repetition <= 0.15 ? 15 : 5) +
      (linking >= 3 ? 15 : 5) +
      (words >= 250 ? 10 : 5)
    ));
    const graPercent = Math.min(100, Math.max(20,
      (complexSentences >= 0.25 ? 25 : complexSentences >= 0.12 ? 15 : 5) +
      (sentences >= 14 ? 20 : sentences >= 10 ? 12 : 5) +
      (avgLength >= 10 && avgLength <= 28 ? 20 : 10) +
      (variety >= 0.55 ? 20 : variety >= 0.4 ? 12 : 5) +
      (words >= 250 ? 15 : 5)
    ));

    const trScore = bandFromPercent(trPercent);
    const ccScore = bandFromPercent(ccPercent);
    const lrScore = bandFromPercent(lrPercent);
    const graScore = bandFromPercent(graPercent);
    const overall = Number(((trScore + ccScore + lrScore + graScore) / 4).toFixed(1));

    const lang = messages[locale] || messages.en;
    const criteria = [
      {
        name: "Task Response",
        score: trScore,
        positives: [] as string[],
        improvements: [] as string[],
        comment: "",
      },
      {
        name: "Coherence & Cohesion",
        score: ccScore,
        positives: [] as string[],
        improvements: [] as string[],
        comment: "",
      },
      {
        name: "Lexical Resource",
        score: lrScore,
        positives: [] as string[],
        improvements: [] as string[],
        comment: "",
      },
      {
        name: "Grammar",
        score: graScore,
        positives: [] as string[],
        improvements: [] as string[],
        comment: "",
      },
    ];

    if (words >= 250){
      criteria[0].positives.push(lang.lengthOk);
    } else {
      criteria[0].improvements.push(lang.lengthShort(words));
    }
    if (position >= 1){
      criteria[0].positives.push(lang.positionOk);
    } else {
      criteria[0].improvements.push(lang.positionMissing);
    }
    if (paragraphs >= 4){
      criteria[0].positives.push(lang.structureOk);
      criteria[1].positives.push(lang.paragraphOk);
    } else {
      criteria[0].improvements.push(lang.structureShort);
      criteria[1].improvements.push(lang.paragraphMissing);
    }
    if (sentences >= 12){
      criteria[1].positives.push(lang.sentencesOk);
    } else {
      criteria[1].improvements.push(lang.sentencesShort);
    }
    if (linking >= 2){
      criteria[1].positives.push(lang.linkingOk);
    } else {
      criteria[1].improvements.push(lang.linkingMissing);
    }
    if (variety >= 0.55){
      criteria[2].positives.push(lang.vocabVarietyOk);
    } else {
      criteria[2].improvements.push(lang.vocabRepetition);
    }
    if (vocab >= 120){
      criteria[2].positives.push(lang.vocabOk);
    } else {
      criteria[2].improvements.push(lang.vocabExpand);
    }
    if (repetition <= 0.12){
      criteria[2].positives.push(lang.repetitionOk);
    } else {
      criteria[2].improvements.push(lang.repetitionHigh);
    }
    if (complexSentences >= 0.2){
      criteria[3].positives.push(lang.grammarVarietyOk);
    } else {
      criteria[3].improvements.push(lang.grammarComplex);
    }
    if (avgLength >= 10 && avgLength <= 28){
      criteria[3].positives.push(lang.grammarLengthOk);
    } else if (avgLength > 28){
      criteria[3].improvements.push(lang.grammarTooLong);
    } else {
      criteria[3].improvements.push(lang.grammarTooShort);
    }
    if (balance > 0.6){
      criteria[1].positives.push(lang.balanceOk);
    } else {
      criteria[1].improvements.push(lang.balanceBad);
    }

    for (const c of criteria){
      const positives = c.positives.join(" ");
      const improvements = c.improvements.join(" ");
      c.comment = [positives, improvements].filter(Boolean).join(" ");
      if (!c.comment) c.comment = lang.fallback;
    }

    const targets = [
      criteria[0].improvements[0] || lang.targetTask,
      criteria[2].improvements[0] || lang.targetVocab,
      criteria[3].improvements[0] || lang.targetGrammar,
    ];

    const result = {
      score: overall,
      criteria,
      targets,
      meta: {
        words,
        sentences,
        paragraphs,
        vocab,
        variety: Number(variety.toFixed(2)),
        linking,
        position,
        balance: Number(balance.toFixed(2)),
        repetition: Number(repetition.toFixed(2)),
        complexSentences: Number(complexSentences.toFixed(2)),
        avgLength: Number(avgLength.toFixed(1)),
      },
    };

    return NextResponse.json({result});
  } catch (e) {
    return NextResponse.json({error:"Analysis failed"}, {status:500});
  }
}
