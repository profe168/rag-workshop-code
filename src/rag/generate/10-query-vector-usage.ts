import { mastra } from "../../mastra";

// 例：意味検索にqueryVectorToolを選択するエージェント
async function queryVectorExample() {
  const queryVectorAgent = mastra.getAgent("queryVectorAgent");
  // 例1：エラー処理の意味検索
  const errorResponse = await queryVectorAgent.generate(
    "Find implementations in our codebase that show how we handle database errors and validation errors"
  );

  console.log("\nError Handling Search:", errorResponse.text);

  // 例2：フォーマットとセクションフィルタを使用した検索
  const configResponse = await queryVectorAgent.generate(
    "How do we handle errors in our application? Filter where section is error-handling AND format is markdown. Return the top 3 results."
  );

  console.log("\nFiltered Error Handling Search:", configResponse.text);

  // 例3：認証のための再ランキングを使用した検索
  const authResponse = await queryVectorAgent.generate(
    "Find the most relevant code examples showing JWT token verification and session validation."
  );

  console.log("\nAuthentication Search:", authResponse.text);
}

queryVectorExample().catch(console.error);

/* 出力例：

Error Handling Search: データベースエラーとバリデーションエラーの処理実装をいくつか見つけました。
DatabaseErrorクラスはAppErrorを拡張し、コンテキスト付きで元のエラーをキャプチャします。
これはコードベース全体でデータベースエラー処理を標準化するために使用されています...

Filtered Error Handling Search: エラー処理ドキュメントによると、errorHandlerMiddlewareを使用した
集中型アプローチを採用しています。このミドルウェアはエラーをタイプ別に分類し、
適切にログを記録し、標準化されたエラーレスポンスを返します...

Authentication Search: JWTトークン検証とセッション検証はAuthenticationServiceクラスで実装されています。
verifyTokenメソッドはjwt.verifyを使用してトークンをデコードおよび検証し、
validateSessionはセッションが存在し、期限切れになっていないかどうかを確認します...
*/
