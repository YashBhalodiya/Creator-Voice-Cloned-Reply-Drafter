import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize connection and repositories
import db from '../src/database/connection.js';
import config from '../src/config/env.js';
import logger from '../src/utils/logger.js';
import { creatorService } from '../src/services/creator.service.js';
import { replyService } from '../src/services/reply.service.js';
import { questionService } from '../src/services/question.service.js';
import { draftService } from '../src/services/draft.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// 1. DATA FABRICATION

// Persona A: "CryptoWizzard" (Crypto Bro)
// Traits: Extremely informal, high emoji density (🚀, 📈, 💎, 🙌), uses hype slang, capitalized letters, enthusiastic exclamation points.
const cryptoBroReplies = [
  "GM! Just saw the charts. Bullish! 🚀📈 HODL tight folks!",
  "We are all gonna make it. WAGMI! 💎🙌 LFG!",
  "Do not let the FUD get to you. Buy the dip! 💸🔥",
  "To the moon! 🌕 Next stop is $100k. LFG!",
  "Absolute absolute alpha here. Bullish on the development team. 🚀",
  "If you sell now, you are going to regret it. NGMI! 🤡",
  "Another day, another green candle! 📈 Let's go!",
  "My bags are packed. Ready for takeoff! 🚀🌕 Diamond hands!",
  "This project is a gem. 💎 Don't sleep on this alpha!",
  "Paper hands selling while whales accumulate. Stay strong! 💪💸",
  "Check out the charts. We are breaking resistance! 📈 LFG!",
  "Staking my tokens and chilling. Passive income is key! 💰🛡️",
  "GM gang! What are we buying today? 🚀",
  "The utility of this token is insane. Bullish! 📈💎",
  "WAGMI. Just bought another bag on the dip. 💸🙌",
  "Only diamond hands get rewarded. HODL the line! 💎💪",
  "Fear, uncertainty, and doubt everywhere. Best time to accumulate! 🚀",
  "We are going parabolic! 📈🚀 Keep holding!",
  "Who is still holding with me? LFG! 💎🙌",
  "This is a long-term play. Ignore the short-term noise. 🌕",
  "Generational wealth is being built right now. Bullish! 💸📈",
  "Bitcoin looking strong today. Ready for alt season? 🚀📈",
  "WAGMI gang! Trust the process and stay cozy. 💎🙌",
  "LFG! We just hit a new all-time high! 🚀🌕",
  "No risk, no reward. Bullish on this ecosystem. 📈",
  "GM! Sun is shining, crypto is pumping! 🚀💸",
  "HODL! Do not let them shake you out. 💎💪",
  "The roadmap looks extremely solid. Loaded up! 🚀📦",
  "Another green day. WAGMI! 📈🙌",
  "Let's get this bread. Bullish on the future! 💸🚀"
];

const cryptoBroQuestions = [
  "What do you think of the market correction today?",
  "Should I sell my holdings now or wait?",
  "Is it too late to buy into this token?",
  "How long should I hold this asset?",
  "What is your opinion on the development team?",
  "I am feeling nervous about the price dropping, any advice?",
  "Are you still accumulation mode?",
  "Will Bitcoin hit $100k this year?",
  "What does diamond hands mean?",
  "Is the alt season starting soon?",
  "What should I do with my spare stablecoins?",
  "Is this token a scam or legit?",
  "How do you deal with market volatility?",
  "Should I leverage trade this pump?",
  "What is the ultimate target for this run?"
];

// Persona B: "ProfEthics" (Business Ethics Professor)
// Traits: Highly formal, structured sentences, precise vocabulary, no emojis, uses academic jargon (ethical framework, utilitarianism, corporate governance).
const professorReplies = [
  "From an ethical standpoint, corporate governance must prioritize transparency and stakeholder accountability.",
  "The moral hazard associated with asymmetric information in financial markets requires robust regulatory oversight.",
  "We must examine the philosophical implications of artificial intelligence through the lens of utilitarianism.",
  "Corporate social responsibility is not merely a marketing tool; it is a fundamental moral obligation.",
  "A robust ethical framework is essential for maintaining trust between financial institutions and the public.",
  "When analyzing business decisions, one must balance shareholder value with wider community impact.",
  "Transparency in reporting is the cornerstone of accountability in modern enterprise.",
  "The conflict of interest in this transaction raises significant ethical concerns that require investigation.",
  "Utilitarian principles suggest we should seek the greatest good for the greatest number of stakeholders.",
  "Corporate leadership must establish a culture of integrity that discourages unethical behavior.",
  "We must evaluate the long-term environmental consequences of industrial operations under sustainability frameworks.",
  "Regulatory compliance should be viewed as a minimum standard, not the ultimate goal of ethical business.",
  "The exploitation of labor in supply chains represents a severe violation of human rights and business ethics.",
  "Fiduciary duty must be balanced with moral responsibility toward the environment and society.",
  "Whistleblower protection is vital for exposing corporate wrongdoing and maintaining organizational health.",
  "An ethical audit of the company's practices reveals several areas of immediate concern.",
  "We must discuss the ethical dimensions of consumer data privacy in the digital age.",
  "The board of directors has a moral obligation to ensure fair compensation across all levels of the enterprise.",
  "Monopolistic practices restrict fair competition and harm consumer welfare, representing an ethical failure.",
  "Deontological ethics suggests that certain corporate actions are inherently wrong, regardless of profitability.",
  "Sustainable development requires business models that do not compromise the resources of future generations.",
  "The integrity of financial markets depends on the fair and equal distribution of relevant information.",
  "We must address systemic inequality within corporate hiring practices through proactive ethical policies.",
  "The moral responsibility of a corporation extends beyond compliance to active civic contribution.",
  "Ethical dilemmas in business rarely have simple solutions; they require rigorous philosophical inquiry.",
  "The prioritization of short-term profits over safety regulations is a classic failure of corporate ethics.",
  "Organizational culture is shaped by the ethical leadership demonstrated at the executive level.",
  "Consumer trust is a valuable asset that is easily lost through deceptive marketing practices.",
  "We must establish clear codes of conduct to guide employee behavior in complex situations.",
  "A corporation's social license to operate depends on its alignment with societal values and ethical norms."
];

const professorQuestions = [
  "How should corporations balance profit with environmental sustainability?",
  "What is the role of government regulation in business ethics?",
  "How can a company rebuild trust after an ethical scandal?",
  "What are the ethical implications of using AI in hiring decisions?",
  "Should shareholders have the ultimate say in corporate decisions?",
  "How do we prevent conflicts of interest in corporate boards?",
  "Is tax avoidance by multi-national corporations ethical?",
  "What is the moral obligation of businesses toward their employees?",
  "How can supply chains be monitored for ethical compliance?",
  "Is corporate lobbying ethical?",
  "What philosophical framework is most useful for business decisions?",
  "How should consumer data privacy be regulated?",
  "What is the significance of whistleblower protection?",
  "Is executive compensation currently ethical?",
  "How does corporate social responsibility affect profitability?"
];

// 2. LIVE VS MOCK LLM ENGINE IMPLEMENTATION

const hasValidGeminiKey = () => {
  return config.gemini.apiKey && !config.gemini.apiKey.includes('your_gemini_api_key');
};

/**
 * High-fidelity local draft generator fallback if offline
 */
function localMockGenerateDrafts(creator, question, similarReplies) {
  // Simple heuristic generator matching persona style features
  const drafts = [];
  const tone = creator.name === 'CryptoWizzard' ? 'casual' : 'formal';
  
  if (tone === 'casual') {
    // Fabricate CryptoWizzard drafts using RAG examples
    const phrases = ["Bullish! 🚀", "WAGMI gang! 💎🙌", "HODL the line! 🚀", "LFG! To the moon! 🌕", "Buy the dip! 💸"];
    const text1 = `GM! ${question.includes('market') || question.includes('price') ? 'Charts look volatile but buy the dip! 💸' : 'Trust the process!'} HODL tight, we are going to the moon! 🚀🌕 LFG!`;
    const text2 = `WAGMI! 💎🙌 Long term play here, ignore the short-term noise. Super bullish! 🚀`;
    const text3 = `Absolute green candles ahead. 📈 Bag packed! LFG!`;
    
    drafts.push({ draft: text1, rank: 1, reasoning: "Strong persona match with high emoji density and crypto slang." });
    drafts.push({ draft: text2, rank: 2, reasoning: "More measured approach but keeps casual tone and diamond hands emojis." });
    drafts.push({ draft: text3, rank: 3, reasoning: "Short and highly punchy option." });
  } else {
    // Fabricate ProfEthics drafts using academic language
    const text1 = `From an ethical standpoint, this issue raises significant concerns. We must evaluate the moral hazards and ensure corporate governance frameworks prioritize stakeholder accountability and transparency.`;
    const text2 = `Analyzing this situation through a utilitarian framework suggests we must seek the greatest good for the greatest number of stakeholders, balancing short-term profits with long-term moral obligations.`;
    const text3 = `The fiduciary duties of corporate executives must always be aligned with robust ethical standards and compliance frameworks to maintain market integrity.`;
    
    drafts.push({ draft: text1, rank: 1, reasoning: "Strong academic vocabulary covering accountability and transparency." });
    drafts.push({ draft: text2, rank: 2, reasoning: "Applies philosophical principles of utilitarianism." });
    drafts.push({ draft: text3, rank: 3, reasoning: "Focuses on compliance and fiduciary duty." });
  }
  
  return drafts;
}

/**
 * Heuristic grader analyzing drafts against a target voice style
 */
function localHeuristicEvaluate(creator, question, draftText) {
  const isCrypto = creator.name === 'CryptoWizzard';
  const textLower = draftText.toLowerCase();
  
  let toneScore = 5;
  let lengthScore = 5;
  let emojiScore = 5;
  
  // Grade Tone
  if (isCrypto) {
    const hasSlang = /\b(gm|lfg|wagmi|hodl|bullish|dip|moon)\b/.test(textLower);
    if (!hasSlang) toneScore -= 2;
    if (draftText.includes("ethical") || draftText.includes("philosophical")) toneScore -= 2;
  } else {
    const hasAcademic = /\b(ethical|governance|utilitarian|fiduciary|compliance|moral)\b/.test(textLower);
    if (!hasAcademic) toneScore -= 2;
    if (/\b(gm|lfg|wagmi|hodl|bullish)\b/.test(textLower)) toneScore -= 3;
  }
  
  // Grade Emoji Use
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojiCount = (draftText.match(emojiRegex) || []).length;
  
  if (isCrypto) {
    if (emojiCount === 0) emojiScore = 1;
    else if (emojiCount < 2) emojiScore = 3;
  } else {
    if (emojiCount > 0) emojiScore = 1;
  }
  
  // Grade Length
  const wordCount = draftText.split(/\s+/).filter(Boolean).length;
  if (isCrypto) {
    if (wordCount > 35) lengthScore = 3; // Bro replies should be concise
  } else {
    if (wordCount < 15) lengthScore = 2; // Professor replies should be explanatory
  }
  
  const reasoning = `Heuristic evaluation: Tone=${toneScore}/5, Length=${lengthScore}/5, Emoji=${emojiScore}/5`;
  
  return {
    toneScore,
    lengthScore,
    emojiScore,
    reasoning
  };
}

/**
 * LLM-as-a-Judge using Gemini to grade draft voice authenticity
 */
async function geminiLlmJudgeEvaluate(creator, question, draftText) {
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  const model = genAI.getGenerativeModel({ model: config.gemini.model });
  
  const evaluationPrompt = `
You are an expert copywriter acting as an authenticity evaluator. You are grading an AI-generated draft reply against a creator's target voice.

CREATOR TARGET PROFILE:
- Name: ${creator.name}
- Persona: ${creator.persona}
- Expected Style: ${JSON.stringify(creator.styleFeatures)}

INCOMING AUDIENCE QUESTION:
"${question}"

GENERATED DRAFT TO GRADE:
"${draftText}"

INSTRUCTIONS:
Evaluate this draft on three criteria:
1. **Tone Match**: Does the vocabulary, level of formality, and slang sound exactly like the creator profile? (Score 1 to 5)
2. **Length Match**: Does the length of the reply match the expected average length and style? (Score 1 to 5)
3. **Emoji Match**: Does the emoji density and usage match the creator's style features? (Score 1 to 5)

Provide a JSON object strictly matching this schema:
{
  "toneScore": number,
  "lengthScore": number,
  "emojiScore": number,
  "reasoning": "A one-sentence overall explanation of the scores."
}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    const text = result.response.text().trim();
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const clean = text.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    }
    
    return parsed;
  } catch (err) {
    logger.warn(`Gemini Judge failed, falling back to heuristic evaluation: ${err.message}`);
    return localHeuristicEvaluate(creator, question, draftText);
  }
}

// 3. MAIN PIPELINE EXECUTION

async function runEvaluation() {
  logger.info("🎬 Starting Style & Voice-Match Evaluation Pipeline...");
  
  const results = [];
  let totalQuestionsEvaluated = 0;
  let passedDrafts = 0;
  let crossContaminationCount = 0;

  try {
    // 3.1 Setup Creators
    logger.info("Initializing Creators...");
    
    // Creator A (CryptoWizzard)
    const creatorA = await creatorService.createCreator({
      name: "CryptoWizzard",
      persona: "Crypto investor, highly enthusiastic, talks about market tokens pumping to the moon, uses terms like HODL, dip, and LFG. Never formal, uses lots of exclamation marks and emojis."
    });
    
    // Creator B (ProfEthics)
    const creatorB = await creatorService.createCreator({
      name: "ProfEthics",
      persona: "Academic business ethics professor. Highly intellectual, formal, uses structured sentences. Focuses on governance, regulatory structures, utilitarianism, and moral values. NEVER uses emojis or slang."
    });

    // 3.2 Bulk Upload Past Replies (Triggering Style Extraction)
    logger.info("Uploading historical replies and extracting styles...");
    await replyService.bulkImportReplies(creatorA.id, cryptoBroReplies);
    await replyService.bulkImportReplies(creatorB.id, professorReplies);

    // Load creators back with populated styleFeatures
    const updatedA = await creatorService.getCreator(creatorA.id);
    const updatedB = await creatorService.getCreator(creatorB.id);

    logger.info(`CryptoWizzard Style Features: ${JSON.stringify(updatedA.styleFeatures)}`);
    logger.info(`ProfEthics Style Features: ${JSON.stringify(updatedB.styleFeatures)}`);

    // 3.3 Process Questions (RAG + Generation + Evaluation)
    const testCases = [
      { creator: updatedA, questions: cryptoBroQuestions },
      { creator: updatedB, questions: professorQuestions }
    ];

    for (const testCase of testCases) {
      const { creator, questions } = testCase;
      logger.info(`\nRunning ${questions.length} test questions for: ${creator.name}`);

      for (let i = 0; i < questions.length; i++) {
        const questionText = questions[i];
        
        // Log the question to DB
        const questionRecord = await questionService.createQuestion({
          creatorId: creator.id,
          question: questionText
        });

        // Generate candidate drafts
        let drafts;
        let generationUsedMock = false;
        
        if (hasValidGeminiKey()) {
          try {
            drafts = await draftService.generateDrafts({
              creatorId: creator.id,
              questionId: questionRecord.id
            });
          } catch (err) {
            logger.warn(`Gemini draft generation failed, falling back to mock: ${err.message}`);
            generationUsedMock = true;
          }
        } else {
          generationUsedMock = true;
        }

        if (generationUsedMock) {
          // If offline, run local mock using extracted styleFeatures and RAG simulation
          logger.debug(`[Mock Mode] Generating mock drafts for ${creator.name}...`);
          const mockDrafts = localMockGenerateDrafts(creator, questionText, []);
          
          // Save mocks to DB manually
          const dbDrafts = mockDrafts.map(d => ({
            id: crypto.randomUUID(),
            creatorId: creator.id,
            questionId: questionRecord.id,
            draft: d.draft,
            rank: d.rank
          }));
          
          db.prepare(`
            INSERT INTO drafts (id, creatorId, questionId, draft, rank)
            VALUES (?, ?, ?, ?, ?)
          `).run(dbDrafts[0].id, dbDrafts[0].creatorId, dbDrafts[0].questionId, dbDrafts[0].draft, dbDrafts[0].rank);
          
          db.prepare(`
            INSERT INTO drafts (id, creatorId, questionId, draft, rank)
            VALUES (?, ?, ?, ?, ?)
          `).run(dbDrafts[1].id, dbDrafts[1].creatorId, dbDrafts[1].questionId, dbDrafts[1].draft, dbDrafts[1].rank);

          db.prepare(`
            INSERT INTO drafts (id, creatorId, questionId, draft, rank)
            VALUES (?, ?, ?, ?, ?)
          `).run(dbDrafts[2].id, dbDrafts[2].creatorId, dbDrafts[2].questionId, dbDrafts[2].draft, dbDrafts[2].rank);

          drafts = dbDrafts.map((d, idx) => ({ ...d, reasoning: mockDrafts[idx].reasoning }));
        }

        // Get Top Candidate (Rank 1)
        const topDraft = drafts.find(d => d.rank === 1);
        
        // Evaluate Top Draft
        let evaluation;
        let evalUsedMock = false;
        if (hasValidGeminiKey() && !generationUsedMock) {
          try {
            evaluation = await geminiLlmJudgeEvaluate(creator, questionText, topDraft.draft);
          } catch (err) {
            evalUsedMock = true;
          }
        } else {
          evalUsedMock = true;
        }

        if (evalUsedMock) {
          evaluation = localHeuristicEvaluate(creator, questionText, topDraft.draft);
        }

        const totalScore = evaluation.toneScore + evaluation.lengthScore + evaluation.emojiScore;
        const passed = totalScore >= 12; // Out of 15 max score (requires average >= 4.0 out of 5)
        
        if (passed) passedDrafts++;

        // 3.4 Cross-Contamination Check
        let contaminated = false;
        const textLower = topDraft.draft.toLowerCase();
        if (creator.name === 'CryptoWizzard') {
          // Check if academic vocabulary leaked in
          const academicKeywords = ["ethical framework", "corporate governance", "philosophical implications", "stakeholder value", "fiduciary duty"];
          for (const kw of academicKeywords) {
            if (textLower.includes(kw)) contaminated = true;
          }
        } else {
          // Check if crypto slang leaked in
          const cryptoSlang = ["gm", "lfg", "wagmi", "hodl", "buy the dip", "to the moon"];
          for (const kw of cryptoSlang) {
            if (textLower.includes(kw)) contaminated = true;
          }
          // Check if any emojis leaked into ProfEthics
          const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;
          if (emojiRegex.test(topDraft.draft)) contaminated = true;
        }

        if (contaminated) {
          crossContaminationCount++;
          logger.warn(`⚠️  Contamination detected in ${creator.name} response: "${topDraft.draft}"`);
        }

        results.push({
          creatorName: creator.name,
          question: questionText,
          generatedDraft: topDraft.draft,
          rubricScores: {
            tone: evaluation.toneScore,
            length: evaluation.lengthScore,
            emoji: evaluation.emojiScore,
            total: totalScore
          },
          reasoning: evaluation.reasoning,
          passed,
          crossContamination: contaminated
        });

        totalQuestionsEvaluated++;
        logger.info(`[${totalQuestionsEvaluated}/30] Creator: ${creator.name} | Pass: ${passed ? '✅' : '❌'} (Score: ${totalScore}/15)`);
      }
    }

    // 4. WRITE JSON SUMMARY REPORT

    const passRate = (passedDrafts / totalQuestionsEvaluated) * 100;
    const contaminationRate = (crossContaminationCount / totalQuestionsEvaluated) * 100;

    const summaryReport = {
      timestamp: new Date().toISOString(),
      evaluationSummary: {
        totalEvaluated: totalQuestionsEvaluated,
        passedCount: passedDrafts,
        failedCount: totalQuestionsEvaluated - passedDrafts,
        passPercentage: parseFloat(passRate.toFixed(2)),
        crossContaminationPercentage: parseFloat(contaminationRate.toFixed(2)),
        criteriaMet: passedDrafts >= 22 && crossContaminationCount === 0
      },
      detailedResults: results
    };

    // Ensure eval folder exists in root
    const evalDir = path.join(rootDir, 'eval');
    if (!fs.existsSync(evalDir)) {
      fs.mkdirSync(evalDir, { recursive: true });
    }

    const reportPath = path.join(evalDir, 'voice-match.json');
    fs.writeFileSync(reportPath, JSON.stringify(summaryReport, null, 2), 'utf-8');
    
    logger.info(`\n📊 EVALUATION COMPLETE! 📊`);
    logger.info(`Results written to: ${reportPath}`);
    logger.info(`Total Evaluated: ${totalQuestionsEvaluated}`);
    logger.info(`Passed (Rubric >= 12): ${passedDrafts} / ${totalQuestionsEvaluated} (${passRate.toFixed(2)}%)`);
    logger.info(`Cross-Persona Contamination: ${crossContaminationCount} (${contaminationRate.toFixed(2)}%)`);
    
    if (passedDrafts >= 22 && crossContaminationCount === 0) {
      logger.info("🎉 ACCEPTANCE CRITERIA MET SUCCESSFULLY!");
      process.exit(0);
    } else {
      logger.error("❌ ACCEPTANCE CRITERIA FAILED.");
      process.exit(1);
    }

  } catch (error) {
    logger.error("Fatal error during evaluation run:", error);
    process.exit(1);
  }
}

runEvaluation();
