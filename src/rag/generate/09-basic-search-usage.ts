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

/* Example output:
JWT Authentication Search: Based on our documentation, JWT authentication is implemented using the 
AuthenticationService class. It handles token generation, verification, and session validation...

Error Handling Search: Our system uses a standardized error handling approach with custom error 
classes like AppError and HttpError. All errors include a code, message, and optional details...

Configuration Search: The monitoring configuration includes APM settings, logging outputs 
(Elasticsearch and CloudWatch), metrics collection, and alert configurations for Slack and PagerDuty...
*/
