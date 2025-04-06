import { openai } from "@ai-sdk/openai";
import { mastra } from "../mastra";
import { embed, generateText } from "ai";

// LLMを使用したコンテキスト関連性評価
const ContextRelevancyMetric = async (model: any, options: any) => {
  const { context } = options;

  return {
    measure: async (query: string, output: string) => {
      // コンテキストと質問を連結
      const contextText = context.join("\n\n");

      // LLMに評価を依頼するプロンプト
      const prompt = `
あなたはRAG(Retrieval-Augmented Generation)システムの評価者です。
ユーザーからの質問に対して取得されたコンテキスト（検索結果）の関連性を評価してください。

【質問】
${query}

【取得されたコンテキスト】
${contextText}

次の基準で評価してください：
- 関連性：コンテキストは質問に関連する情報を含んでいますか？
- 網羅性：コンテキストは質問に答えるために必要な情報を網羅していますか？
- 正確性：コンテキストの情報は正確で最新ですか？

0から1までのスコアを付け、評価理由を説明してください。
0.0-0.4: 低い関連性（質問とほとんど関連がない、または質問に答えるための十分な情報がない）
0.4-0.7: 中程度の関連性（部分的に関連しているが不十分）
0.7-1.0: 高い関連性（質問に十分に関連しており、適切な回答が可能）

以下のJSON形式で回答してください：
{
  "score": 0.0～1.0の数値,
  "reason": "評価理由の説明"
}
`;

      try {
        // GPT-4oモデルによる評価
        const completion = await generateText({
          model: openai("gpt-4o"),
          prompt,
          temperature: 0.1, // 一貫性のために低い温度を設定
          maxTokens: 1000,
        });

        // 結果のテキストを取得
        const resultText = completion.text.trim();
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const resultJson = JSON.parse(jsonMatch[0]);
          return {
            score: parseFloat(resultJson.score),
            info: {
              reason: resultJson.reason,
            },
          };
        } else {
          // JSON形式で返ってこなかった場合のフォールバック
          console.warn(
            "LLMからの応答をJSONとして解析できませんでした。デフォルト値を使用します。"
          );
          return {
            score: 0.5,
            info: {
              reason:
                "評価結果をパースできませんでした。LLMの応答: " + resultText,
            },
          };
        }
      } catch (error) {
        console.error("LLMを使った評価中にエラーが発生しました:", error);
        return {
          score: 0.5,
          info: {
            reason: "評価中にエラーが発生しました: " + (error as Error).message,
          },
        };
      }
    },
  };
};

async function evaluateContextRelevancy() {
  // 評価モデルの設定
  const model = openai("gpt-4o");

  // 評価用クエリの設定
  const testQueries = [
    "認証方法について教えてください",
    "エラー処理のベストプラクティスは何ですか",
    "アプリケーション設定のJSONフォーマットはどうなっていますか",
    "ログシステムの設定方法を説明してください", // 情報がないので「十分な情報がありません」という回答とスコア0.0-0.4が期待値
  ];

  // 結果を保存する配列
  const evaluationResults: Array<{
    query: string;
    score: number;
    reason: string;
    docsCount: number;
    answer: string;
  }> = [];

  // PgVectorインスタンスの取得
  const pgVector = mastra.getVector("pg");

  // 各クエリに対して評価を実行
  for (const query of testQueries) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`■ 評価クエリ: "${query}"`);
    console.log(`${"=".repeat(60)}`);

    // クエリのエンベディングを生成
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });

    // ベクトル検索を実行
    const searchResults = await pgVector.query({
      indexName: "workshop",
      queryVector: embedding,
      topK: 5, // 上位5件の結果を取得
    });

    // 検索結果から文書テキストとメタデータを抽出
    const retrievedDocs = searchResults
      .map((item: any) => {
        return item.metadata?.text as string;
      })
      .filter(Boolean);

    console.log(`\n▶ 取得された文書数: ${retrievedDocs.length}`);

    // 実際のLLMによる回答生成
    const contextText = retrievedDocs.join("\n\n");
    const answerPrompt = `
あなたは質問回答システムです。与えられたコンテキスト情報に基づいて、ユーザーの質問に対して具体的かつ詳細に回答してください。

【コンテキスト情報】
${contextText}

【質問】
${query}

【指示】
1. コンテキスト情報を注意深く分析し、質問に関連する情報を特定してください
2. 見つかった情報を基に、質問に対する具体的な回答を作成してください
3. コンテキストに含まれる具体的な例やコード例があれば、それらを引用して説明してください
4. コンテキスト内の情報のみを使用し、外部知識は使用しないでください
5. 完全に質問に答えられない場合でも、コンテキストから得られる部分的な情報は提供してください
6. 本当に関連情報が全くない場合のみ「この質問に回答するための十分な情報がありません」とだけ回答してください

【回答】
`;

    // LLMによる回答生成
    const answerCompletion = await generateText({
      model: openai("gpt-4o"),
      prompt: answerPrompt,
      temperature: 0.7,
      maxTokens: 800,
    });

    const generatedAnswer = answerCompletion.text.trim();
    console.log(`\n▼ 生成された回答:`);
    console.log(`${"─".repeat(60)}`);
    console.log(generatedAnswer);
    console.log(`${"─".repeat(60)}`);

    // コンテキスト関連性メトリックの初期化
    const metric = await ContextRelevancyMetric(model, {
      context: retrievedDocs,
    });

    // 評価の実行（生成された回答を使用）
    const evalResult = await metric.measure(query, generatedAnswer);

    // 結果の表示と保存
    console.log(`\n★ 関連性スコア: ${evalResult.score.toFixed(2)}`);
    console.log(`\n☆ 評価理由:`);
    console.log(evalResult.info.reason);

    evaluationResults.push({
      query,
      score: evalResult.score,
      reason: evalResult.info.reason,
      docsCount: retrievedDocs.length,
      answer: generatedAnswer,
    });
  }

  // 全体の結果サマリー
  console.log(`\n${"=".repeat(60)}`);
  console.log(`             ★★★ 評価結果サマリー ★★★`);
  console.log(`${"=".repeat(60)}`);

  const avgScore =
    evaluationResults.reduce((sum, r) => sum + r.score, 0) /
    evaluationResults.length;
  console.log(`▶ 平均関連性スコア: ${avgScore.toFixed(2)}\n`);

  // 各クエリの結果表示
  evaluationResults.forEach((r, i) => {
    console.log(`${"─".repeat(60)}`);
    console.log(`クエリ ${i + 1}: "${r.query}"`);
    console.log(`スコア: ${r.score.toFixed(2)}`);

    // 回答を整形して表示（長い行を折り返し）
    console.log(`\n回答の概要（最初の100文字）:`);
    const previewText =
      r.answer.slice(0, 100) + (r.answer.length > 100 ? "..." : "");
    console.log(previewText);
    console.log(`${"─".repeat(60)}\n`);
  });
}

// 評価を実行
evaluateContextRelevancy().catch(console.error);
