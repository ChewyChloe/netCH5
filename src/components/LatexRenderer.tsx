/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import katex from 'katex';

interface LatexRendererProps {
  text: string;
  className?: string;
}

export default function LatexRenderer({ text, className = '' }: LatexRendererProps) {
  if (!text) return null;

  // Split by block math $$
  const parts = text.split(/(\$\$.*?\$\$)/gs);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2).trim();
          try {
            const html = katex.renderToString(formula, {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <span
                key={idx}
                className="block my-3 overflow-x-auto max-w-full text-center bg-[#070b13]/50 py-2.5 px-3 rounded-lg border border-gray-850/40"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch (e) {
            console.error(e);
            return <code key={idx} className="font-mono text-red-400 bg-gray-900 border border-gray-800 px-1 rounded">{part}</code>;
          }
        } else {
          // Then split inline math $
          const subparts = part.split(/(\$.*?\$)/g);
          return (
            <React.Fragment key={idx}>
              {subparts.map((subpart, sIdx) => {
                if (subpart.startsWith('$') && subpart.endsWith('$')) {
                  const inlineFormula = subpart.slice(1, -1).trim();
                  try {
                    const html = katex.renderToString(inlineFormula, {
                      displayMode: false,
                      throwOnError: false,
                    });
                    return (
                      <span
                        key={sIdx}
                        className="inline-block px-1 align-middle text-blue-300 font-sans font-medium"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    );
                  } catch (e) {
                    console.error(e);
                    return <code key={sIdx} className="font-mono text-red-400 bg-gray-900 border border-gray-800 px-1 rounded">{subpart}</code>;
                  }
                }
                return subpart;
              })}
            </React.Fragment>
          );
        }
      })}
    </span>
  );
}
