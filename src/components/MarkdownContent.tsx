import Markdown from "react-markdown";

type MarkdownContentProps = {
  text: string;
  className?: string;
};

export default function MarkdownContent({
  text,
  className = "",
}: MarkdownContentProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <Markdown>{text}</Markdown>
    </div>
  );
}