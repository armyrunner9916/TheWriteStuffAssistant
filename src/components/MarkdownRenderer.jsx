import React from 'react';
    import ReactMarkdown from 'react-markdown';
    import remarkGfm from 'remark-gfm';
    import remarkBreaks from 'remark-breaks';

    const MarkdownRenderer = ({ markdownText }) => {
      if (!markdownText) {
        return null;
      }

      return (
        <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-2xl prose-invert max-w-none text-gray-200">
          <style>
            {`
              .prose h1 {
                font-size: 1.1rem !important;
              }
              .prose h2 {
                font-size: 1rem !important;
              }
              .prose h3 {
                font-size: 0.95rem !important;
              }
              .prose p, .prose li, .prose ul, .prose ol {
                font-size: 0.9em !important;
              }
            `}
          </style>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {markdownText}
          </ReactMarkdown>
        </div>
      );
    };

    export default MarkdownRenderer;