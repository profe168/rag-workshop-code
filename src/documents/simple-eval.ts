import { openai } from "@ai-sdk/openai";

// モックされたコンテキスト関連性メトリック
const ContextRelevancyEvaluator = async (query: string, contexts: string[]) => {
  console.log(`\n評価クエリ: "${query}"`);
  console.log(`コンテキスト数: ${contexts.length}`);

  // 単純な関連性スコアのシミュレーション（0.5〜0.95の乱数）
  const score = Math.round((0.5 + Math.random() * 0.45) * 100) / 100;
  
  // 関連性の理由（実際はLLMがここで評価理由を生成）
  let reason;
  if (score > 0.8) {
    reason = "コンテキストは質問に対して非常に関連性が高いです。主要なキーワードやトピックが適切に含まれています。";
  } else if (score > 0.6) {
    reason = "コンテキストは質問と部分的に関連していますが、いくつかの重要な情報が不足しています。";
  } else {
    reason = "コンテキストと質問の関連性は限定的です。より適切なコンテキストが必要です。";
  }
  
  return {
    score,
    reason
  };
};

// テスト用クエリとコンテキストの定義
const testScenarios = [
  {
    query: "認証システムのセットアップ方法を教えてください",
    contexts: [
      "認証システムは、JWTトークンを使用して実装されています。ユーザーがログインすると、サーバーはJWTトークンを生成します。",
      "ログシステムは、情報、警告、エラーの3つのレベルでメッセージを記録します。",
      "アプリケーション設定は、JSON形式で管理されています。",
    ]
  },
  {
    query: "エラー処理のベストプラクティスは何ですか",
    contexts: [
      "エラー処理では、try-catchブロックを使用して例外をキャッチし、適切なエラーメッセージをユーザーに表示すべきです。",
      "エラーログは集中管理され、重大なエラーが発生した場合は開発者に通知されるようにします。",
      "データベース接続の設定は環境変数から取得します。",
    ]
  },
  {
    query: "ログシステムの設定方法を説明してください",
    contexts: [
      "ログシステムの設定は、config.jsonファイルで管理されています。レベル、出力先、フォーマットを指定できます。",
      "ログローテーションは日次で行われ、7日間保持されます。",
      "監視システムは、ログを分析して異常を検出します。",
    ]
  },
  {
    query: "アプリケーション設定のJSONフォーマットはどうなっていますか",
    contexts: [
      "アプリケーション設定は、階層構造のJSONで表現されます。'app'、'api'、'database'などのトップレベルセクションがあります。",
      "各環境（開発、テスト、本番）ごとに設定ファイルが用意されています。",
      "設定値はアプリケーション起動時に読み込まれ、キャッシュされます。",
    ]
  }
];

async function runSimpleEvaluation() {
  try {
    // ヘッダーを表示
    console.log("===== RAGパイプラインのシンプルな評価 =====");
    console.log("コンテキスト関連性メトリックを使用した評価\n");
    
    // 結果を保存する配列
    const results = [];
    
    // 各シナリオを評価
    for (const scenario of testScenarios) {
      // モックされた回答（実際のシステムでは生成AIの回答）
      const mockAnswer = "ご質問についての情報です。詳細は文書を参照してください。";
      
      // 評価の実行
      const evalResult = await ContextRelevancyEvaluator(
        scenario.query,
        scenario.contexts
      );
      
      // 結果の表示
      console.log(`関連性スコア: ${evalResult.score.toFixed(2)}`);
      console.log(`理由: ${evalResult.reason}\n`);
      
      // 結果を保存
      results.push({
        query: scenario.query,
        score: evalResult.score,
        reason: evalResult.reason
      });
    }
    
    // 評価結果のサマリー
    console.log("\n===== 評価結果サマリー =====");
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    console.log(`平均関連性スコア: ${avgScore.toFixed(2)}`);
    
    // スコア分布
    console.log("\nスコア分布:");
    const distributions = {
      high: results.filter(r => r.score >= 0.8).length,
      medium: results.filter(r => r.score >= 0.6 && r.score < 0.8).length,
      low: results.filter(r => r.score < 0.6).length
    };
    
    console.log(`高（0.8-1.0）: ${distributions.high} クエリ`);
    console.log(`中（0.6-0.8）: ${distributions.medium} クエリ`);
    console.log(`低（0.0-0.6）: ${distributions.low} クエリ`);
    
    // 改善提案（実際のシステムではLLMが生成）
    console.log("\n改善提案:");
    console.log("1. より多様なコンテキストをインデックスに追加する");
    console.log("2. クエリ拡張機能を実装して検索精度を向上させる");
    console.log("3. コンテキストの順序を最適化する再ランキング機能を追加する");
    
    // 最終行
    console.log("\n===== 評価終了 =====");
  } catch (error) {
    console.error("評価中にエラーが発生しました:", error);
  }
}

// 評価を実行
runSimpleEvaluation().catch(console.error); 