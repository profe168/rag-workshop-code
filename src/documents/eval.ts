import { openai } from "@ai-sdk/openai";
import { mastra } from "../mastra";
import { embed } from "ai";

// @ts-ignore - モジュールが見つからない場合のエラーを無視
const ContextRelevancyMetric = async (model: any, options: any) => {
  return {
    measure: async (query: string, output: string) => {
      // モック実装
      console.log("モックのContextRelevancyMetricを使用しています");
      
      // 実際はここでコンテキストの関連性を計算
      // 0～1の間でスコアを算出（モックなので0.5～0.9のランダム値）
      const score = 0.5 + Math.random() * 0.4;
      
      return {
        score,
        info: {
          reason: "モック評価：コンテキストの関連性は模擬的に評価されています。"
        }
      };
    }
  };
};

async function evaluateContextRelevancy() {
  // 評価モデルの設定
  const model = openai("gpt-4o-mini");
  
  // 評価用クエリの設定
  const testQueries = [
    "認証方法について教えてください",
    "エラー処理のベストプラクティスは何ですか",
    "ログシステムの設定方法を説明してください",
    "アプリケーション設定のJSONフォーマットはどうなっていますか"
  ];
  
  // 結果を保存する配列
  const evaluationResults: Array<{
    query: string;
    score: number;
    reason: string;
    docsCount: number;
  }> = [];
  
  // PgVectorインスタンスの取得
  const pgVector = mastra.getVector("pg");
  
  // 各クエリに対して評価を実行
  for (const query of testQueries) {
    console.log(`\n評価クエリ: "${query}"`);
    
    // クエリのエンベディングを生成
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });
    
    // ベクトル検索を実行
    const searchResults = await pgVector.query({
      indexName: "workshop",
      queryVector: embedding,
      topK: 3, // 上位3件の結果を取得
    });
    
    // 検索結果から文書テキストとメタデータを抽出
    const retrievedDocs = searchResults.map((item: any) => {
      return item.metadata?.text as string;
    }).filter(Boolean);
    
    console.log(`取得された文書数: ${retrievedDocs.length}`);
    
    // コンテキスト関連性メトリックの初期化
    const metric = await ContextRelevancyMetric(model, {
      context: retrievedDocs,
    });
    
    // 模擬回答（実際のシステムでは生成AIによる回答）
    const mockAnswer = "ご質問についての情報です。詳細は文書を参照してください。";
    
    // 評価の実行
    const evalResult = await metric.measure(query, mockAnswer);
    
    // 結果の表示と保存
    console.log(`関連性スコア: ${evalResult.score.toFixed(2)}`);
    console.log(`理由: ${evalResult.info.reason}`);
    
    evaluationResults.push({
      query,
      score: evalResult.score,
      reason: evalResult.info.reason,
      docsCount: retrievedDocs.length,
    });
  }
  
  // 全体の結果サマリー
  console.log("\n===== 評価結果サマリー =====");
  const avgScore = evaluationResults.reduce((sum, r) => sum + r.score, 0) / evaluationResults.length;
  console.log(`平均関連性スコア: ${avgScore.toFixed(2)}`);
  
  // 各クエリの結果表示
  evaluationResults.forEach((r, i) => {
    console.log(`\nクエリ ${i+1}: "${r.query}"`);
    console.log(`スコア: ${r.score.toFixed(2)}`);
  });
}

// 評価を実行
evaluateContextRelevancy().catch(console.error); 