import { openai } from "@ai-sdk/openai";
import { mastra } from "../mastra";
import { embed, generateText } from "ai";
import { ContextRelevancyMetric } from "@mastra/evals/llm";

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

    // ========= Mastraの評価機能を使用した部分 =========
    // コンテキスト関連性メトリックの初期化
    const metric = new ContextRelevancyMetric(model, {
      context: retrievedDocs,
    });

    // 評価の実行
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
