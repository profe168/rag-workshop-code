import { mastra } from "../../mastra";

// 例：シンプルなキーワード検索にbasicSearchToolを選択するエージェント
async function basicSearchExample() {
  const basicAgent = mastra.getAgent("basicAgent");
  // 例1：認証の実装
  const authResponse = await basicAgent.generate(
    "How do we implement JWT authentication in our system?"
  );
  console.log("\nJWT Authentication Search:", authResponse.text);

  // 例2：エラー処理パターン
  const errorResponse = await basicAgent.generate(
    "What are our standard error handling patterns for API responses?"
  );
  console.log("\nError Handling Search:", errorResponse.text);

  // 例3：設定構造
  const configResponse = await basicAgent.generate(
    "What monitoring configurations are available in our system?"
  );
  console.log("\nConfiguration Search:", configResponse.text);
}

basicSearchExample().catch(console.error);

/* 出力例：
JWT Authentication Search: ドキュメントによると、JWT認証はAuthenticationServiceクラスを使用して実装されています。
このクラスはトークン生成、検証、セッション検証などを処理します...

Error Handling Search: 私たちのシステムではAppErrorやHttpErrorのようなカスタムエラークラスを使用した
標準化されたエラー処理アプローチを採用しています。すべてのエラーにはコード、メッセージ、およびオプションの詳細が含まれています...

Configuration Search: 監視設定にはAPM設定、ログ出力（ElasticsearchとCloudWatch）、
メトリクス収集、SlackとPagerDuty用のアラート設定が含まれています...
*/
