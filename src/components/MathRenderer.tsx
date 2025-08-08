import React from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

interface MathRendererProps {
  content: string;
}

const mathJaxConfig = {
  loader: { load: ["[tex]/ams"] },
  tex: {
    packages: { '[+]': ['ams'] },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ]
  }
};


// Helper to split content into text, inline, and block math
function splitMathContent(content: string): Array<{ type: 'block' | 'inline' | 'text', value: string }> {
  const result: Array<{ type: 'block' | 'inline' | 'text', value: string }> = [];
  let text = content;
  const blockRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\])/g;
  let lastIndex = 0;
  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      // Text before block
      result.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    result.push({ type: 'block', value: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    result.push({ type: 'text', value: content.slice(lastIndex) });
  }
  return result;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content }) => {
  // Split by lines for more robust rendering in question previews
  const lines = content.split(/\r?\n/);
  return (
    <MathJaxContext version={3} config={mathJaxConfig}>
      {lines.map((line, lineIdx) => {
        // Use the same splitting logic per line
        const parts = splitMathContent(line);
        return (
          <div key={lineIdx} style={{ minHeight: 24 }}>
            {parts.map((part, idx) => {
              if (part.type === 'block') {
                let math = part.value.trim();
                if (math.startsWith('$$') && math.endsWith('$$')) {
                  math = math.slice(2, -2);
                } else if (math.startsWith('\\[') && math.endsWith('\\]')) {
                  math = math.slice(2, -2);
                }
                return (
                  <span key={idx} style={{ display: 'block', margin: '8px 0' }}>
                    <MathJax dynamic>{`\\[${math}\\]`}</MathJax>
                  </span>
                );
              } else if (part.type === 'text') {
                const inlineRegex = /(\$[^$\n]+\$|\\\([^\)]+\\\))/g;
                const inlineParts = [];
                let last = 0;
                let m;
                while ((m = inlineRegex.exec(part.value)) !== null) {
                  if (m.index > last) {
                    inlineParts.push(part.value.slice(last, m.index));
                  }
                  let math = m[0];
                  if (math.startsWith('$') && math.endsWith('$')) {
                    math = math.slice(1, -1);
                  } else if (math.startsWith('\\(') && math.endsWith('\\)')) {
                    math = math.slice(2, -2);
                  }
                  inlineParts.push(<MathJax key={m.index} dynamic>{`\\(${math}\\)`}</MathJax>);
                  last = m.index + m[0].length;
                }
                if (last < part.value.length) {
                  inlineParts.push(part.value.slice(last));
                }
                return <React.Fragment key={idx}>{inlineParts}</React.Fragment>;
              }
              return null;
            })}
          </div>
        );
      })}
    </MathJaxContext>
  );
};

export default MathRenderer;
