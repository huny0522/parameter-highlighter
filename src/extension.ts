import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const legend = new vscode.SemanticTokensLegend(
    ['parameter'],
    []
  );

  const provider = new ParameterSemanticTokensProvider(legend);
  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: 'php', scheme: 'file' },
      provider,
      legend
    )
  );

  console.log('Congratulations, your extension "parameter-highlighter" is now active!');
}

class ParameterSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
  private legend: vscode.SemanticTokensLegend;
  constructor(legend: vscode.SemanticTokensLegend) {
    this.legend = legend;
  }

  async provideDocumentSemanticTokens(document: vscode.TextDocument): Promise<vscode.SemanticTokens> {
    const tokensBuilder = new vscode.SemanticTokensBuilder(this.legend);
    const text = document.getText();
    
    // PHP 함수 정의를 찾는 정규식 (타입힌트와 기본값을 고려)
    const functionRegex = /function\s+\w+\s*\(([\s\S]*?)\)/g;
    let functionMatch;

    while ((functionMatch = functionRegex.exec(text)) !== null) {
      const parameterString = functionMatch[1];
      // 파라미터를 개별적으로 파싱
      const parameters = parameterString.split(',').map(param => {
        const trimmed = param.trim();
        // ?string $param = null 같은 형태에서 $param만 추출
        const match = trimmed.match(/\$(\w+)(?:\s*=.*)?$/);
        return match ? match[1] : null;
      }).filter(param => param !== null);

      // 각 파라미터에 대해
      for (const param of parameters) {
        // $ 기호를 포함한 변수 이름을 찾음
        const variableRegex = new RegExp(`\\$${param}\\b`, 'g');
        let variableMatch;

        while ((variableMatch = variableRegex.exec(text)) !== null) {
          const pos = document.positionAt(variableMatch.index);
          tokensBuilder.push(
            pos.line,
            pos.character,
            param.length + 1, // +1 for $ sign
            0, // tokenType index for 'parameter'
            0  // tokenModifiers
          );
        }
      }
    }

    return tokensBuilder.build();
  }
}

export function deactivate() {}
