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
    
    // PHP 함수와 메소드 정의를 찾는 정규식 - 중괄호는 제외
    const functionRegex = /(?:function\s+\w+|public\s+function\s+\w+|private\s+function\s+\w+|protected\s+function\s+\w+)\s*\(([\s\S]*?)\)/g;
    let functionMatch;

    while ((functionMatch = functionRegex.exec(text)) !== null) {
      const parameterString = functionMatch[1];
      const functionStart = functionMatch.index;
      
      // 함수 본문의 시작 위치 찾기
      let bodyStart = text.indexOf('{', functionStart);
      if (bodyStart === -1) continue;
      
      // 중괄호 깊이를 추적하여 함수 본문의 끝 찾기
      let depth = 1;
      let bodyEnd = bodyStart + 1;
      
      while (depth > 0 && bodyEnd < text.length) {
        if (text[bodyEnd] === '{') {
          depth++;
        } else if (text[bodyEnd] === '}') {
          depth--;
        }
        bodyEnd++;
      }
      
      const functionBody = text.substring(bodyStart + 1, bodyEnd - 1);

      // 파라미터를 개별적으로 파싱
      const parameters = parameterString.split(',').map(param => {
        const trimmed = param.trim();
        const match = trimmed.match(/(?:&)?\$(\w+)(?:\s*=.*)?$/);
        return match ? { name: match[1], fullMatch: match[0] } : null;
      }).filter(param => param !== null);

      // 파라미터 선언부 하이라이트
      for (const param of parameters) {
        const paramPos = text.indexOf(param.fullMatch, functionStart);
        if (paramPos !== -1) {
          const dollarPos = text.indexOf('$' + param.name, paramPos);
          if (dollarPos !== -1) {
            const pos = document.positionAt(dollarPos);
            tokensBuilder.push(
              pos.line,
              pos.character,
              param.name.length + 1,
              0,
              0
            );
          }
        }
      }

      // 함수 본문 내 파라미터 사용 하이라이트
      for (const param of parameters) {
        const variableRegex = new RegExp(`\\$${param.name}\\b`, 'g');
        let variableMatch;
        let searchText = functionBody;
        let searchOffset = 0;
        
        while ((variableMatch = variableRegex.exec(searchText)) !== null) {
          const absoluteOffset = bodyStart + 1 + variableMatch.index;
          const pos = document.positionAt(absoluteOffset);
          tokensBuilder.push(
            pos.line,
            pos.character,
            param.name.length + 1,
            0,
            0
          );
        }
      }
    }

    return tokensBuilder.build();
  }
}

export function deactivate() {}
