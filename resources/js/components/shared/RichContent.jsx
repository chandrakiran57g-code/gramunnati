import ReactMarkdown from 'react-markdown';

function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || '').trim());
}

/**
 * Renders admin content with proper headings, lists, and spacing.
 * Supports HTML (from Quill) and Markdown / plain text.
 */
export default function RichContent({ content, className = '' }) {
  const raw = String(content || '').trim();
  if (!raw) return null;

  if (looksLikeHtml(raw)) {
    return (
      <div
        className={`rich-content ${className}`}
        dangerouslySetInnerHTML={{ __html: raw }}
      />
    );
  }

  return (
    <div className={`rich-content ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1>{children}</h1>,
          h2: ({ children }) => <h2>{children}</h2>,
          h3: ({ children }) => <h3>{children}</h3>,
          h4: ({ children }) => <h4>{children}</h4>,
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul>{children}</ul>,
          ol: ({ children }) => <ol>{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong>{children}</strong>,
        }}
      >
        {raw}
      </ReactMarkdown>
    </div>
  );
}
