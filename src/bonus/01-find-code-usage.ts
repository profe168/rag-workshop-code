import { mastra } from "../mastra";

// 例：コード特有の検索に対してfindCodeToolを選択するエージェント
async function findCodeExample() {
  const codeAgent = mastra.getAgent("codeAgent");
  // 例1：認証システムのverifyTokenメソッド実装を探す
  const authResponse = await codeAgent.generate(
    "Find the implementation of the verifyToken method in our authentication system"
  );
  console.log("\nAuth Implementation Search:", authResponse.text);

  // 例2：ロガークラス定義を探す
  const loggerResponse = await codeAgent.generate(
    "Show me the AuditLogger class definition"
  );
  console.log("\nLogger Class Search:", loggerResponse.text);

  // 例3：エラー処理関数を探す
  const errorResponse = await codeAgent.generate(
    "Find the withDbErrorHandling function implementation in our error handling system"
  );
  console.log("\nError Handling Function Search:", errorResponse.text);
}

findCodeExample().catch(console.error);

// 出力例：
//
// Auth Implementation Search:
// "AuthenticationServiceクラス内でJWTトークンを検証しセッションを検証するverifyTokenメソッドの実装を見つけました。
// 期限切れトークンや無効なトークンなど、特定のエラーメッセージを含む様々なエラーケースを処理します。"
//
// Logger Class Search:
// "ベースのLoggerクラスを拡張し、データ変更を追跡するための特殊なメソッドを提供するAuditLoggerクラスを見つけました。
// logDataChangeメソッドは変更前後の状態でエンティティの変更を記録し、監査証跡とコンプライアンス要件に役立ちます。"
//
// Error Handling Function Search:
// "データベース操作をエラー処理でラップするwithDbErrorHandling関数を見つけました。この関数は非同期操作関数と
// エラーメッセージを引数に取り、try/catchブロックで操作を実行します。エラーが発生した場合、追加のコンテキストを含む
// DatabaseErrorでラップすることで、データベースの問題を追跡およびデバッグしやすくします。"
