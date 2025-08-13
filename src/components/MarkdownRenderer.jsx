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
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {markdownText}
          </ReactMarkdown>
        </div>
      );
    };

    export default MarkdownRenderer;